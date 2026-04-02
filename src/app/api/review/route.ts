import { NextRequest, NextResponse } from 'next/server';
import { callClaude } from '@/lib/anthropic';
import { VECTOR_FORGE_SYSTEM_PROMPT } from '@/lib/vectorForge';
import { verifyAuth, logUsage } from '@/lib/apiAuth';
import type { Base64ImageSource } from '@anthropic-ai/sdk/resources/messages';

type ImageMediaType = Base64ImageSource['media_type'];

const ALLOWED_MODELS = ['claude-opus-4-6', 'claude-sonnet-4-6'] as const;

function isAllowedModel(value: string): value is (typeof ALLOWED_MODELS)[number] {
  return (ALLOWED_MODELS as readonly string[]).includes(value);
}

interface ReviewRequestBody {
  model: string;
  sourceImageBase64: string;
  svgString: string;
  mediaType: ImageMediaType;
}

export async function POST(request: NextRequest) {
  const auth = await verifyAuth();
  if (auth.userId === null) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let body: ReviewRequestBody;
  try {
    body = (await request.json()) as ReviewRequestBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { model, sourceImageBase64, svgString, mediaType } = body;

  if (!model || !sourceImageBase64 || !svgString || !mediaType) {
    return NextResponse.json(
      {
        error:
          'Missing required fields: model, sourceImageBase64, svgString, mediaType',
      },
      { status: 400 },
    );
  }

  if (!isAllowedModel(model)) {
    return NextResponse.json(
      { error: `Invalid model. Allowed: ${ALLOWED_MODELS.join(', ')}` },
      { status: 400 },
    );
  }

  try {
    const response = await callClaude({
      model,
      system: VECTOR_FORGE_SYSTEM_PROMPT,
      maxTokens: 4096,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: sourceImageBase64,
              },
            },
            {
              type: 'text',
              text: `Here is the generated SVG output:\n\n${svgString}\n\nPerform a fidelity review comparing the original raster image above with this SVG. Score PSNR, SSIM, mean pixel difference, and max pixel difference. Assign a fidelity label and recommend specific improvements. Respond with the JSON structure described in your system prompt for Mode 2 — Fidelity Review.`,
            },
          ],
        },
      ],
    });

    await logUsage({
      userId: auth.userId,
      endpoint: '/api/review',
      model,
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
    });

    const textBlock = response.content.find((block) => block.type === 'text');
    const review = textBlock && textBlock.type === 'text' ? textBlock.text : '';

    return NextResponse.json({ review });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Review request failed';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
