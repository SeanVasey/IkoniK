import { NextRequest, NextResponse } from 'next/server';
import { optimize } from 'svgo';
import { svgoConfig } from '@/lib/svgoConfig';
import { verifyAuth } from '@/lib/apiAuth';

interface OptimizeRequestBody {
  svg: string;
}

export async function POST(request: NextRequest) {
  const auth = await verifyAuth();
  if (auth.userId === null) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let body: OptimizeRequestBody;
  try {
    body = (await request.json()) as OptimizeRequestBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { svg } = body;

  if (!svg || typeof svg !== 'string') {
    return NextResponse.json(
      { error: 'Missing required field: svg' },
      { status: 400 },
    );
  }

  try {
    const originalSize = new TextEncoder().encode(svg).byteLength;

    const result = optimize(svg, svgoConfig);

    const optimizedSize = new TextEncoder().encode(result.data).byteLength;
    const savings =
      originalSize > 0
        ? Math.round(((originalSize - optimizedSize) / originalSize) * 10000) /
          100
        : 0;

    return NextResponse.json({
      optimizedSvg: result.data,
      stats: {
        originalSize,
        optimizedSize,
        savings,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'SVG optimization failed';
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
