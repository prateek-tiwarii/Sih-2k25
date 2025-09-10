'use client';

export default function GlobalError() {

    return (
        <html>
            <body>
                <div className="flex h-screen w-screen flex-col items-center justify-center bg-emerald-50">
                    <div className="flex w-[300px] flex-col gap-2">
                        <p className="text-base">Oops! Something went wrong.</p>
                        <p className="text-brand text-sm">
                            It seems we encountered an unexpected error. Please try refreshing the
                            page or check back later. If the problem persists, feel free to{' '}
                            <a href="mailto:hello@llmchat.com">contact team</a>.
                        </p>
                    </div>
                </div>
            </body>
        </html>
    );
}
