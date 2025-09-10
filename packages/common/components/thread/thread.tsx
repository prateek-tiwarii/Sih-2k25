'use client';

import { useChatStore } from '@repo/common/store';
import { ThreadItem } from './thread-item';
import { useEffect } from 'react';

export const Thread = () => {
    const threadItems = useChatStore(state => state.threadItems);
    const currentThreadId = useChatStore(state => state.currentThreadId);
    const isGenerating = useChatStore(state => state.isGenerating);
    const loadThreadItems = useChatStore(state => state.loadThreadItems);

    useEffect(() => {
        if (currentThreadId) {
            loadThreadItems(currentThreadId);
        }
    }, [currentThreadId, loadThreadItems]);

    if (!threadItems || threadItems.length === 0) {
        return null;
    }

    return (
        <div className="flex flex-col gap-4">
            {threadItems.map((threadItem, index) => (
                <ThreadItem
                    key={threadItem.id}
                    threadItem={threadItem}
                    isAnimated={true}
                    isGenerating={isGenerating && index === threadItems.length - 1}
                    isLast={index === threadItems.length - 1}
                />
            ))}
        </div>
    );
};
