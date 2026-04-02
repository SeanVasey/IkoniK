import { NextRequest, NextResponse } from 'next/server';
import { callClaude } from '@/lib/anthropic';
import { VECTOR_FORGE_SYSTEM_PROMPT } from '@/lib/vectorForge';
import { verifyAuth, logUsage } from '@/lib/apiAuth';

const ALLOWED_MODELS = ['claude-opus-4-6', 'claude-sonnet-4-6'] as const;

function isAllowedModel(value: string): value is (typeof ALLOWED_MODELS)[number] {
  return (ALLOWED_MODELS as readonly string[]).includes(value);
}

interface ConvertRequestBody {
  imageBase64: string;
  analysis: string;
  model: string;
}

export async function POST(request: NextRequest) {
  const auth = await verifyAuth();
  if (auth.userId === null) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let body: ConvertRequestBody;
  try {
    body = (await request.json()) as ConvertRequestBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { imageBase64, analysis, model } = body;

  if (!imageBase64 || !analysis || !model) {
    return NextResponse.json(
      { error: 'Missing required fields: imageBase64, analysis, model' },
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
      maxTokens: 8192,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Here is the analysis of the source image:\n\n${analysis}\n\nBased on this analysis, generate the complete SVG markup. Output ONLY the SVG code — no explanation, no markdown code fences, just the raw SVG starting with <svg and ending with </svg>.`,
            },
          ],
        },
      ],
    });

    await logUsage({
      userId: auth.userId,
      endpoint: '/api/convert',
      model,
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
    });

    const textBlock = response.content.find((block) => block.type === 'text');
    const svg = textBlock && textBlock.type === 'text' ? textBlock.text : '';

    return NextResponse.json({ svg, analysis });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Conversion failed';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
