import { NextRequest } from 'next/server';
import { executeStream, sendMessage } from './stream-handlers';
import { completionRequestSchema, SSE_HEADERS } from './types';
import { getIp } from './utils';

export async function POST(request: NextRequest) {
    if (request.method === 'OPTIONS') {
        return new Response(null, { headers: SSE_HEADERS });
    }

    try {
        console.log('📥 API: Received completion request');
        const userId = undefined; // Local mode: no auth

        const parsed = await request.json().catch(() => ({}));
        const validatedBody = completionRequestSchema.safeParse(parsed);

        if (!validatedBody.success) {
            return new Response(
                JSON.stringify({
                    error: 'Invalid request body',
                    details: validatedBody.error.format(),
                }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const { data } = validatedBody;
        const ip = getIp(request);
        console.log('📥 API: Validated request data:', { threadId: data.threadId, prompt: data.prompt?.substring(0, 50) + '...' });

        const enhancedHeaders = {
            ...SSE_HEADERS,
            // Local mode: no credit headers
        };

        const encoder = new TextEncoder();
        const abortController = new AbortController();

        request.signal.addEventListener('abort', () => {
            console.log('📥 API: Request aborted');
            abortController.abort();
        });

        const stream = createCompletionStream({
            data,
            userId,
            ip: (ip ?? undefined) as string | undefined,
            abortController,
        });

        return new Response(stream, { headers: enhancedHeaders });
    } catch (error) {
        console.error('Error in POST handler:', error);
        return new Response(
            JSON.stringify({ error: 'Internal server error', details: String(error) }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}

function createCompletionStream({
    data,
    userId,
    ip,
    abortController,
}: {
    data: any;
    userId?: string;
    ip?: string;
    abortController: AbortController;
}) {
    const encoder = new TextEncoder();

    return new ReadableStream({
        async start(controller) {
            console.log('📥 API: Starting stream...');
            let heartbeatInterval: NodeJS.Timeout | null = null;

            heartbeatInterval = setInterval(() => {
                controller.enqueue(encoder.encode(': heartbeat\n\n'));
            }, 15000);

            try {
                await executeStream({
                    controller,
                    encoder,
                    data,
                    abortController,
                    userId: userId ?? undefined,
                    // Simplified onFinish for local mode
                    onFinish: async () => {
                        console.log('📥 API: Stream finished');
                    },
                });
            } catch (error) {
                console.error('📥 API: Stream error:', error);
                if (abortController.signal.aborted) {
                    console.log('📥 API: Stream aborted');
                    sendMessage(controller, encoder, {
                        type: 'done',
                        status: 'aborted',
                        threadId: data.threadId,
                        threadItemId: data.threadItemId,
                        parentThreadItemId: data.parentThreadItemId,
                    });
                } else {
                    console.log('📥 API: Sending error message');
                    sendMessage(controller, encoder, {
                        type: 'done',
                        status: 'error',
                        error: error instanceof Error ? error.message : String(error),
                        threadId: data.threadId,
                        threadItemId: data.threadItemId,
                        parentThreadItemId: data.parentThreadItemId,
                    });
                }
            } finally {
                if (heartbeatInterval) {
                    clearInterval(heartbeatInterval);
                }
                controller.close();
            }
        },
        cancel() {
            console.log('cancelling stream');
            abortController.abort();
        },
    });
}
