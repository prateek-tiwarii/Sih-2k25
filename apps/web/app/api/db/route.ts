import { NextRequest, NextResponse } from 'next/server';

// In-memory array to store received data (for prototyping/demo only)
let storedData: any[] = [];

/**
 * POST /api/db
 * Expects JSON body: {
 *   data: Array<{
 *     float_id: string,
 *     timestamp: string,
 *     lat: number,
 *     lon: number,
 *     depth: number,
 *     temperature?: number,
 *     salinity?: number,
 *     bgc_params?: Record<string, any>,
 *     [key: string]: any
 *   }>,
 *   meta?: { [key: string]: any }
 * }
 * Returns summary, errors, and preview of ingested data.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { data, meta } = body;

        if (!Array.isArray(data)) {
            return NextResponse.json(
                { error: 'Request body must have a data array.' },
                { status: 400 }
            );
        }

        // Validate each entry (basic check for ARGO float structure)
        const requiredFields = ['float_id', 'timestamp', 'lat', 'lon', 'depth'];
        const errors: string[] = [];
        const validData = data.filter((entry, idx) => {
            const missing = requiredFields.filter(f => !(f in entry));
            if (missing.length > 0) {
                errors.push(`Entry ${idx} missing fields: ${missing.join(', ')}`);
                return false;
            }
            return true;
        });

        // Store only valid entries
        storedData = [...storedData, ...validData];

        return NextResponse.json({
            success: true,
            ingested_count: validData.length,
            errors,
            preview: validData.slice(0, 3),
            meta: meta || null,
        });
    } catch (error) {
        return NextResponse.json({ error: 'Invalid request or server error.' }, { status: 500 });
    }
}

/**
 * GET /api/db
 * Returns the currently stored array of data objects
 */
export async function GET() {
    return NextResponse.json({ storedData });
}
