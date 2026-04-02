import { NextRequest, NextResponse } from 'next/server';
import { callClaude } from '@/lib/anthropic';
import { VECTOR_FORGE_SYSTEM_PROMPT } from '@/lib/vectorForge';
import { verifyAuth, logUsage } from '@/lib/apiAuth';
import type { Base64ImageSource } from '@anthropic-ai/sdk/resources/messages';

type ImageMediaType = Base64ImageSource['media_type'];

const ALLOWED_MODELS = ['claude-opus-4-6', 'claude-sonnet-4-6'] as const;
type AllowedModel = (typeof ALLOWED_MODELS)[number];

function isAllowedModel(value: string): value is AllowedModel {
  return (ALLOWED_MODELS as readonly string[]).includes(value);
}

interface ClaudeRequestBody {
  model: string;
  imageBase64: string;
  mediaType: ImageMediaType;
}

export async function POST(request: NextRequest) {
  const auth = await verifyAuth();
  if (auth.userId === null) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let body: ClaudeRequestBody;
  try {
    body = (await request.json()) as ClaudeRequestBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { model, imageBase64, mediaType } = body;

  if (!model || !imageBase64 || !mediaType) {
    return NextResponse.json(
      { error: 'Missing required fields: model, imageBase64, mediaType' },
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
                data: imageBase64,
              },
            },
            {
              type: 'text',
              text: 'Analyse this image for raster-to-vector conversion. Identify shapes, colours, complexity, and recommend a tracing strategy. Respond with the JSON structure described in your system prompt.',
            },
          ],
        },
      ],
    });

    await logUsage({
      userId: auth.userId,
      endpoint: '/api/claude',
      model,
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
    });

    const textBlock = response.content.find((block) => block.type === 'text');
    const text = textBlock && textBlock.type === 'text' ? textBlock.text : '';

    return NextResponse.json({ analysis: text });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Claude API request failed';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
