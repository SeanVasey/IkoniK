// Server-only — do not import in client components

import Anthropic from '@anthropic-ai/sdk';
import type { MessageParam } from '@anthropic-ai/sdk/resources/messages';

/**
 * Shared Anthropic client instance.
 * Reads ANTHROPIC_API_KEY from process.env at construction time.
 */
export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface CallClaudeParams {
  model: string;
  system: string;
  messages: MessageParam[];
  maxTokens?: number;
}

/**
 * Convenience wrapper around the Anthropic messages API.
 * Handles common defaults and surfaces actionable error messages.
 */
export async function callClaude({
  model,
  system,
  messages,
  maxTokens = 8192,
}: CallClaudeParams) {
  try {
    const response = await anthropic.messages.create({
      model,
      max_tokens: maxTokens,
      system,
      messages,
    });

    return response;
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      throw new Error(
        `Anthropic API error (${error.status}): ${error.message}`,
      );
    }
    throw error;
  }
}
