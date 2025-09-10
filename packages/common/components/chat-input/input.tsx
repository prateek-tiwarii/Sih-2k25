'use client';
import { ImageAttachment, ImageDropzoneRoot } from '@repo/common/components';
import { useImageAttachment } from '@repo/common/hooks';
import { ChatModeConfig } from '@repo/shared/config';
import { ThreadItem } from '@repo/shared/types';
import { cn, Flex } from '@repo/ui';
import { AnimatePresence, motion } from 'framer-motion';
import { nanoid } from 'nanoid';
import { useParams, usePathname, useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useShallow } from 'zustand/react/shallow';
import { useAgentStream } from '../../hooks/agent-provider';
import { useChatEditor } from '../../hooks/use-editor';
import { useChatStore } from '../../store';
import { ExamplePrompts } from '../exmaple-prompts';
import { ChatModeButton, GeneratingStatus, SendStopButton, WebSearchButton } from './chat-actions';
import { ChatEditor } from './chat-editor';
import { ImageUpload } from './image-upload';

// Direct Ollama API call function
const callOllamaDirectly = async (
    prompt: string, 
    threadId: string, 
    updateThreadItem: (threadId: string, item: Partial<ThreadItem>) => void,
    setIsGenerating: (generating: boolean) => void
) => {
    console.log('🚀 Direct Ollama: Starting call with prompt:', prompt);
    
    // Create AI thread item
    const aiThreadItemId = nanoid();
    const aiThreadItem: Partial<ThreadItem> = {
        id: aiThreadItemId,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'PENDING',
        threadId,
        query: prompt,
        answer: { text: '' },
    };
    
    updateThreadItem(threadId, aiThreadItem);
    setIsGenerating(true);
    
    try {
        console.log('🚀 Direct Ollama: Making request to localhost:11434');
        
        const response = await fetch('http://127.0.0.1:11434/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'llama3.2:latest',
                messages: [
                    { role: 'user', content: prompt }
                ],
                stream: true,
            }),
        });

        console.log('🚀 Direct Ollama: Response status:', response.status);

        if (!response.ok) {
            throw new Error(`Ollama error: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
            throw new Error('No response reader');
        }

        const decoder = new TextDecoder();
        let fullText = '';

        while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
                console.log('🚀 Direct Ollama: Stream completed, final text:', fullText);
                break;
            }

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n').filter(line => line.trim());

            for (const line of lines) {
                try {
                    const json = JSON.parse(line);
                    
                    if (json.message && json.message.content) {
                        fullText += json.message.content;
                        console.log('🚀 Direct Ollama: Updating text, length:', fullText.length);
                        
                        // Update the thread item with new text
                        updateThreadItem(threadId, {
                            id: aiThreadItemId,
                            answer: { text: fullText },
                            status: 'COMPLETED',
                        });
                    }

                    if (json.done) {
                        break;
                    }
                } catch (e) {
                    console.warn('🚀 Direct Ollama: Failed to parse line:', line);
                }
            }
        }

        // Mark as completed
        updateThreadItem(threadId, {
            id: aiThreadItemId,
            status: 'COMPLETED',
        });

    } catch (error) {
        console.error('🚀 Direct Ollama: Error:', error);
        updateThreadItem(threadId, {
            id: aiThreadItemId,
            status: 'ERROR',
            error: error instanceof Error ? error.message : String(error),
        });
    } finally {
        setIsGenerating(false);
    }
};

export const ChatInput = ({
    showGreeting = true,
    showBottomBar = true,
    isFollowUp = false,
}: {
    showGreeting?: boolean;
    showBottomBar?: boolean;
    isFollowUp?: boolean;
}) => {
    const isSignedIn = true; // Local mode: treat as signed in

    const { threadId: currentThreadId } = useParams();
    const { editor } = useChatEditor({
        placeholder: isFollowUp ? 'Ask follow up' : 'Ask anything',
        onInit: ({ editor }) => {
            if (typeof window !== 'undefined' && !isFollowUp && !isSignedIn) {
                const draftMessage = window.localStorage.getItem('draft-message');
                if (draftMessage) {
                    editor.commands.setContent(draftMessage, true, { preserveWhitespace: true });
                }
            }
        },
        onUpdate: ({ editor }) => {
            if (typeof window !== 'undefined' && !isFollowUp) {
                window.localStorage.setItem('draft-message', editor.getText());
            }
        },
    });
    const size = currentThreadId ? 'base' : 'sm';
    const getThreadItems = useChatStore(state => state.getThreadItems);
    const threadItemsLength = useChatStore(useShallow(state => state.threadItems.length));
    const { handleSubmit } = useAgentStream(); // Keep for backup
    const createThread = useChatStore(state => state.createThread);
    const useWebSearch = useChatStore(state => state.useWebSearch);
    const isGenerating = useChatStore(state => state.isGenerating);
    const setIsGenerating = useChatStore(state => state.setIsGenerating);
    const updateThreadItem = useChatStore(state => state.updateThreadItem);
    const createThreadItem = useChatStore(state => state.createThreadItem);
    const isChatPage = usePathname().startsWith('/chat');
    const imageAttachment = useChatStore(state => state.imageAttachment);
    const clearImageAttachment = useChatStore(state => state.clearImageAttachment);
    const stopGeneration = useChatStore(state => state.stopGeneration);
    const hasTextInput = !!editor?.getText();
    const { dropzonProps, handleImageUpload } = useImageAttachment();
    const { push } = useRouter();
    const chatMode = useChatStore(state => state.chatMode);
    
    const sendMessage = async () => {
        console.log('💬 SendMessage: Starting...');
        
        if (
            !isSignedIn &&
            !!ChatModeConfig[chatMode as keyof typeof ChatModeConfig]?.isAuthRequired
        ) {
            // In local mode, bypass sign-in
            return;
        }

        if (!editor?.getText()) {
            console.log('💬 SendMessage: No text input, returning');
            return;
        }

        const userMessage = editor.getText();
        let threadId = currentThreadId?.toString();

        if (!threadId) {
            const optimisticId = uuidv4();
            push(`/chat/${optimisticId}`);
            createThread(optimisticId, {
                title: userMessage,
            });
            threadId = optimisticId;
        }

        console.log('💬 SendMessage: ThreadId =', threadId, 'Message =', userMessage);

        // Create user message thread item
        const userThreadItem: ThreadItem = {
            id: nanoid(),
            createdAt: new Date(),
            updatedAt: new Date(),
            status: 'COMPLETED',
            threadId,
            query: userMessage,
            mode: chatMode,
        };

        createThreadItem(userThreadItem);

        // Clear input
        window.localStorage.removeItem('draft-message');
        editor.commands.clearContent();
        clearImageAttachment();

        // Call Ollama directly instead of using agent provider
        await callOllamaDirectly(userMessage, threadId, updateThreadItem, setIsGenerating);
    };


    const renderChatInput = () => (
        <AnimatePresence>
            <motion.div
                className="w-full px-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={`chat-input`}
                transition={{ duration: 0.2, ease: 'easeOut' }}
            >
                <Flex
                    direction="col"
                    className={cn(
                        'bg-background border-hard/50 shadow-subtle-sm relative z-10 w-full rounded-xl border'
                    )}
                >
                    <ImageDropzoneRoot dropzoneProps={dropzonProps}>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.15 }}
                            className="flex w-full flex-shrink-0 overflow-hidden rounded-lg"
                        >
                            {editor?.isEditable ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.15, ease: 'easeOut' }}
                                    className="w-full"
                                >
                                    <ImageAttachment />
                                    <Flex className="flex w-full flex-row items-end gap-0">
                                        <ChatEditor
                                            sendMessage={sendMessage}
                                            editor={editor}
                                            className="px-3 pt-3"
                                        />
                                    </Flex>

                                    <Flex
                                        className="border-border w-full gap-0 border-t border-dashed px-2 py-2"
                                        gap="none"
                                        items="center"
                                        justify="between"
                                    >
                                        {isGenerating && !isChatPage ? (
                                            <GeneratingStatus />
                                        ) : (
                                            <Flex gap="xs" items="center" className="shrink-0">
                                                <ChatModeButton />
                                                {/* <AttachmentButton /> */}
                                                <WebSearchButton />
                                                {/* <ToolsMenu /> */}
                                                <ImageUpload
                                                    id="image-attachment"
                                                    label="Image"
                                                    tooltip="Image Attachment"
                                                    showIcon={true}
                                                    handleImageUpload={handleImageUpload}
                                                />
                                            </Flex>
                                        )}

                                        <Flex gap="md" items="center">
                                            <SendStopButton
                                                isGenerating={isGenerating}
                                                isChatPage={isChatPage}
                                                stopGeneration={stopGeneration}
                                                hasTextInput={hasTextInput}
                                                sendMessage={sendMessage}
                                            />
                                        </Flex>
                                    </Flex>
                                </motion.div>
                            ) : (
                                <motion.div
                                    className="flex h-24 w-full items-center justify-center"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.15 }}
                                >
                                    <div className="animate-pulse">Loading editor...</div>
                                </motion.div>
                            )}
                        </motion.div>
                    </ImageDropzoneRoot>
                </Flex>
            </motion.div>
            {/* Messages remaining badge removed in local-only mode */}
        </AnimatePresence>
    );

    

    const renderChatBottom = () => (
        <>
            <Flex items="center" justify="center" gap="sm">
                {/* <ScrollToBottomButton /> */}
            </Flex>
            {renderChatInput()}
        </>
    );

    useEffect(() => {
        editor?.commands.focus('end');
    }, [currentThreadId]);

    return (
        <div
            className={cn(
                'bg-secondary w-full',
                currentThreadId
                    ? 'absolute bottom-0'
                    : 'absolute inset-0 flex h-full w-full flex-col items-center justify-center'
            )}
        >
            <div
                className={cn(
                    'mx-auto flex w-full max-w-3xl flex-col items-start',
                    !threadItemsLength && 'justify-start',
                    size === 'sm' && 'px-8'
                )}
            >
                <Flex
                    items="start"
                    justify="start"
                    direction="col"
                    className={cn('w-full pb-4', threadItemsLength > 0 ? 'mb-0' : 'h-full')}
                >
                    {!currentThreadId && showGreeting && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                            className="mb-4 flex w-full flex-col items-center gap-1"
                        >
                            <AnimatedTitles />
                        </motion.div>
                    )}

                    {renderChatBottom()}
                    {!currentThreadId && showGreeting && <ExamplePrompts />}

                    {/* <ChatFooter /> */}
                </Flex>
            </div>
        </div>
    );
};

type AnimatedTitlesProps = {
    titles?: string[];
};

const AnimatedTitles = ({ titles = [] }: AnimatedTitlesProps) => {
    const [greeting, setGreeting] = React.useState<string>('');

    React.useEffect(() => {
        const getTimeBasedGreeting = () => {
            const hour = new Date().getHours();

            if (hour >= 5 && hour < 12) {
                return 'Good morning';
            } else if (hour >= 12 && hour < 18) {
                return 'Good afternoon';
            } else {
                return 'Good evening';
            }
        };

        setGreeting(getTimeBasedGreeting());

        // Update the greeting if the component is mounted during a time transition
        const interval = setInterval(() => {
            const newGreeting = getTimeBasedGreeting();
            if (newGreeting !== greeting) {
                setGreeting(newGreeting);
            }
        }, 60000); // Check every minute

        return () => clearInterval(interval);
    }, [greeting]);

    return (
        <Flex
            direction="col"
            className="relative h-[60px] w-full items-center justify-center overflow-hidden"
        >
            <AnimatePresence mode="wait">
                <motion.h1
                    key={greeting}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    transition={{
                        duration: 0.8,
                        ease: 'easeInOut',
                    }}
                    className="from-muted-foreground/50 via-muted-foreground/40 to-muted-foreground/20 bg-gradient-to-r bg-clip-text text-center text-[32px] font-semibold tracking-tight text-transparent"
                >
                    {greeting}
                </motion.h1>
            </AnimatePresence>
        </Flex>
    );
};
