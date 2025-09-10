import { NextRequest, NextResponse } from 'next/server';

export async function GET(_request: NextRequest) {
    const remainingCredits = 1_000_000;
    const resetTime = getNextResetTime();

    return NextResponse.json(
        {
            remaining: remainingCredits,
            maxLimit: remainingCredits,
            reset: new Date(resetTime).toISOString(),
            isAuthenticated: false,
        },
        {
            headers: {
                'X-Credits-Limit': remainingCredits.toString(),
                'X-Credits-Remaining': remainingCredits.toString(),
                'X-Credits-Reset': resetTime.toString(),
            },
        }
    );
}

function getNextResetTime(): number {
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    return tomorrow.getTime();
}
