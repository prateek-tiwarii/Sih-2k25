import { prisma } from '@repo/prisma';
import { geolocation } from '@vercel/functions';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    // For local-only mode, we'll use a default userId
    const userId = 'local-user';

    const { feedback } = await request.json();

    await prisma.feedback.create({
        data: {
            userId,
            feedback,
            metadata: JSON.stringify({
                geo: geolocation(request),
            }),
        },
    });

    return NextResponse.json({ message: 'Feedback received' }, { status: 200 });
}
