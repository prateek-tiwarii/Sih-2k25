// Local mode: keep only minimal deps
import { Geo } from '@vercel/functions';
import { CompletionRequestType, StreamController } from './types';
import { sanitizePayloadForJSON } from './utils';

export function sendMessage(
    controller: StreamController,
    encoder: TextEncoder,
    payload: Record<string, any>
) {
    try {
        if (payload.content && typeof payload.content === 'string') {
            payload.content = normalizeMarkdownContent(payload.content);
        }

        const sanitizedPayload = sanitizePayloadForJSON(payload);
        const message = `event: ${payload.type}\ndata: ${JSON.stringify(sanitizedPayload)}\n\n`;

        controller.enqueue(encoder.encode(message));
        controller.enqueue(new Uint8Array(0));
    } catch (error) {
        // Log serialization errors
        console.error('Error serializing message payload', error, {
            payloadType: payload.type,
            threadId: payload.threadId,
        });

        const errorMessage = `event: done\ndata: ${JSON.stringify({
            type: 'done',
            status: 'error',
            error: 'Failed to serialize payload',
            threadId: payload.threadId,
            threadItemId: payload.threadItemId,
            parentThreadItemId: payload.parentThreadItemId,
        })}\n\n`;
        controller.enqueue(encoder.encode(errorMessage));
    }
}

export function normalizeMarkdownContent(content: string): string {
    const normalizedContent = content.replace(/\\n/g, '\n');
    return normalizedContent;
}
export async function executeStream({
    controller,
    encoder,
    data,
    abortController,
    userId,
    gl,
    onFinish,
}: {
    controller: StreamController;
    encoder: TextEncoder;
    data: CompletionRequestType;
    abortController: AbortController;
    userId?: string;
    gl?: Geo;
    onFinish?: () => Promise<void>;
}): Promise<{ success: boolean } | Response> {
    console.log('🤖 Ollama: ===== STARTING EXECUTESTREAM =====');
    console.log('🤖 Ollama: Starting executeStream with data:', JSON.stringify(data, null, 2));
    
    // Send an immediate start message
    sendMessage(controller, encoder, {
        type: 'start',
        threadId: data.threadId,
        threadItemId: data.threadItemId,
        parentThreadItemId: data.parentThreadItemId,
    });
    
    try {
        const { signal } = abortController;

        // Test if Ollama is running first
        console.log('🤖 Ollama: Testing connection to http://127.0.0.1:11434/api/version');
        try {
            const versionResponse = await fetch('http://127.0.0.1:11434/api/version');
            console.log('🤖 Ollama: Version check status:', versionResponse.status);
            if (versionResponse.ok) {
                const version = await versionResponse.text();
                console.log('🤖 Ollama: Version info:', version);
            }
        } catch (versionError) {
            console.error('🤖 Ollama: Version check failed:', versionError);
            throw new Error('Ollama service is not running or not accessible');
        }

        // Prepare the request body
        const requestBody = {
            model: 'llama3.2:latest', // Confirmed model name
            messages: data.messages || [
                { role: 'user', content: data.prompt }
            ],
            stream: true,
        };

        console.log('🤖 Ollama: Request body:', JSON.stringify(requestBody, null, 2));
        console.log('🤖 Ollama: Calling http://127.0.0.1:11434/api/chat');
        
        // Call Ollama with the correct /api/chat endpoint
        const res = await fetch('http://127.0.0.1:11434/api/chat', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(requestBody),
            signal,
        });

        console.log('🤖 Ollama: Response status:', res.status, res.statusText);
        console.log('🤖 Ollama: Response headers:', Object.fromEntries(res.headers.entries()));

        if (!res.ok) {
            const text = await res.text();
            console.error('🤖 Ollama: Error response body:', text);
            throw new Error(`Ollama error ${res.status}: ${text}`);
        }

        const reader = res.body?.getReader();
        if (!reader) {
            console.error('🤖 Ollama: Failed to get response reader');
            throw new Error('Failed to get response reader');
        }

        console.log('🤖 Ollama: Starting to read stream...');
        
        // Send initial processing message
        sendMessage(controller, encoder, {
            type: 'answer',
            answer: { text: '' },
            threadId: data.threadId,
            threadItemId: data.threadItemId,
            parentThreadItemId: data.parentThreadItemId,
            query: data.prompt,
            mode: data.mode,
        });
        
        let fullText = '';
        const decoder = new TextDecoder();
        let chunkCount = 0;

        try {
            while (true) {
                const { done, value } = await reader.read();
                chunkCount++;
                
                if (done) {
                    console.log('🤖 Ollama: Stream completed after', chunkCount, 'chunks, total text:', fullText.length, 'characters');
                    break;
                }

                const chunk = decoder.decode(value, { stream: true });
                console.log('🤖 Ollama: Raw chunk', chunkCount, ':', JSON.stringify(chunk));
                
                const lines = chunk.split('\n').filter(line => line.trim());
                console.log('🤖 Ollama: Processing', lines.length, 'lines from chunk', chunkCount);

                for (const line of lines) {
                    try {
                        const json = JSON.parse(line);
                        console.log('🤖 Ollama: Parsed JSON from chunk', chunkCount, ':', json);
                        
                        // Handle streaming response from /api/chat endpoint
                        if (json.message && json.message.content) {
                            const newContent = json.message.content;
                            fullText += newContent;
                            console.log('🤖 Ollama: Added content:', JSON.stringify(newContent), 'Total length:', fullText.length);
                            
                            // Send incremental answer updates
                            sendMessage(controller, encoder, {
                                type: 'answer',
                                answer: { text: fullText },
                                threadId: data.threadId,
                                threadItemId: data.threadItemId,
                                parentThreadItemId: data.parentThreadItemId,
                                query: data.prompt,
                                mode: data.mode,
                            });
                        }

                        if (json.done) {
                            console.log('🤖 Ollama: Received done signal from chunk', chunkCount);
                            break;
                        }
                    } catch (parseError) {
                        console.warn('🤖 Ollama: Failed to parse line from chunk', chunkCount, ':', JSON.stringify(line), 'Error:', parseError);
                    }
                }
            }
        } finally {
            reader.releaseLock();
        }

        console.log('🤖 Ollama: Sending final completion message with total text:', fullText.length, 'characters');
        
        // Send final completion message
        sendMessage(controller, encoder, {
            type: 'done',
            status: 'complete',
            threadId: data.threadId,
            threadItemId: data.threadItemId,
            parentThreadItemId: data.parentThreadItemId,
        });

        onFinish && (await onFinish());

        console.log('🤖 Ollama: executeStream completed successfully');
        return { success: true };
    } catch (error) {
        console.error('🤖 Ollama: executeStream error:', error);
        console.error('🤖 Ollama: Error stack:', error instanceof Error ? error.stack : 'No stack trace');
        
        if (abortController.signal.aborted) {
            console.log('🤖 Ollama: Stream was aborted');
            sendMessage(controller, encoder, {
                type: "done",
                status: "aborted",
                threadId: data.threadId,
                threadItemId: data.threadItemId,
                parentThreadItemId: data.parentThreadItemId,
            });
        } else {
            console.error('🤖 Ollama: Sending error message');
            sendMessage(controller, encoder, {
                type: "done",
                status: "error",
                error: error instanceof Error ? error.message : String(error),
                threadId: data.threadId,
                threadItemId: data.threadItemId,
                parentThreadItemId: data.parentThreadItemId,
            });
        }
        throw error;
    }
}