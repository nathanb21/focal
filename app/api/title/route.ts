import { generateText } from "ai";
import { fallbackChatTitle } from "@/lib/title";

export const maxDuration = 10;

const TITLE_PROMPT = `Create a concise, useful title for a conversation about regulated-industry documentation.

Return only the title, with no quotation marks, punctuation at the end, or explanation. Keep it to 3–7 words. Focus on the topic or decision being discussed rather than repeating the question verbatim.`;

export async function POST(request: Request) {
  const body = (await request.json()) as { message?: unknown };
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!message) {
    return Response.json({ error: "A message is required." }, { status: 400 });
  }

  if (!process.env.AI_GATEWAY_API_KEY && !process.env.VERCEL_OIDC_TOKEN) {
    return Response.json({ title: fallbackChatTitle(message) });
  }

  try {
    const result = await generateText({
      model: "openai/gpt-5-mini",
      system: TITLE_PROMPT,
      prompt: message,
    });
    const title = result.text.trim().replace(/^["'`]+|["'`]+$/g, "").replace(/\s+/g, " ");
    return Response.json({ title: title || fallbackChatTitle(message) });
  } catch {
    return Response.json({ title: fallbackChatTitle(message) });
  }
}
