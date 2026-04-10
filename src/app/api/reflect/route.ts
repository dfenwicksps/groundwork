import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createServerClient } from "@/lib/supabase-server";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { text, entryId } = await request.json();

    if (!text || text.trim().length < 10) {
      return NextResponse.json({ reflection: null });
    }

    // Truncate if very long — just use the first ~500 chars for the prompt
    const truncatedText = text.slice(0, 500);

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 120,
      system: `You are a warm, thoughtful guide helping a teenager reflect more deeply on their personal growth. Ask one follow-up question based on what they've written. The question should be open, curious, and non-clinical. Do not give advice. Do not summarise what they said. Do not ask multiple questions. Keep your response to 1–2 sentences. Never position yourself as a friend, therapist, or companion. Never use the words "I" or refer to yourself at all. Never mention AI, artificial intelligence, or technology.`,
      messages: [
        {
          role: "user",
          content: truncatedText,
        },
      ],
    });

    const reflection =
      message.content[0].type === "text" ? message.content[0].text : null;

    // Store reflection alongside the journal entry
    if (reflection && entryId) {
      // Cast needed due to auto-generated types not including ai_reflection in Update
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from("journal_entries") as any)
        .update({ ai_reflection: reflection })
        .eq("id", entryId)
        .eq("user_id", user.id);
    }

    return NextResponse.json({ reflection });
  } catch {
    // Fail silently — don't expose errors to the user
    return NextResponse.json({ reflection: null });
  }
}
