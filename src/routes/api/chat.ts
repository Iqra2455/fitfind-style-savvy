import "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway";
import { convertToModelMessages, streamText, type UIMessage } from "ai";

const sysPrompt = `You are the FitFind AI Fit Assistant — a friendly, knowledgeable stylist for online shoppers in Pakistan and globally.
You help users understand size recommendations, decide between sizes, and pick from Amazon and Daraz.
Tone: warm, concise, confident. Use short paragraphs and the occasional bullet list. Mention specific measurements (chest, waist, hips) in cm. Convert between international (S/M/L) and Asian sizing when relevant.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const auth = request.headers.get("authorization");
        const token = auth?.replace("Bearer ", "");
        if (!token) return new Response("Unauthorized", { status: 401 });

        const body = (await request.json()) as { messages: UIMessage[]; threadId: string };
        if (!Array.isArray(body.messages) || !body.threadId) return new Response("Bad request", { status: 400 });

        const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
          global: { headers: { Authorization: `Bearer ${token}` } },
          auth: { persistSession: false, autoRefreshToken: false },
        });
        const { data: claims } = await supabase.auth.getClaims(token);
        const userId = claims?.claims?.sub;
        if (!userId) return new Response("Unauthorized", { status: 401 });

        const { data: thread } = await supabase.from("chat_threads")
          .select("id").eq("id", body.threadId).eq("user_id", userId).maybeSingle();
        if (!thread) return new Response("Thread not found", { status: 404 });

        const { data: m } = await supabase.from("measurements").select("*")
          .eq("user_id", userId).order("created_at", { ascending: false }).limit(1).maybeSingle();
        const profileCtx = m
          ? `\n\nUser profile: gender=${m.gender ?? "?"}, height=${m.height_cm ?? "?"}cm, weight=${m.weight_kg ?? "?"}kg, body_type=${m.body_type ?? "?"}, preferred_fit=${m.preferred_fit ?? "?"}, country=${m.country ?? "?"}.`
          : "\n\nUser has not yet entered measurements — encourage them to complete the fit profile on /recommendations.";

        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });
        const model = createLovableAiGatewayProvider(key)("google/gemini-3-flash-preview");

        const result = streamText({
          model,
          system: sysPrompt + profileCtx,
          messages: await convertToModelMessages(body.messages),
        });

        return result.toUIMessageStreamResponse({
          originalMessages: body.messages,
          onFinish: async ({ messages: final }) => {
            await supabase.from("chat_messages").delete().eq("thread_id", body.threadId);
            const rows = final.map((mm) => ({
              thread_id: body.threadId, user_id: userId, role: mm.role, parts: mm.parts as unknown,
            }));
            if (rows.length) await supabase.from("chat_messages").insert(rows);
            await supabase.from("chat_threads")
              .update({ updated_at: new Date().toISOString(), title: deriveTitle(final) })
              .eq("id", body.threadId);
          },
        });
      },
    },
  },
});

function deriveTitle(msgs: UIMessage[]): string {
  const first = msgs.find((m) => m.role === "user");
  if (!first) return "New conversation";
  const text = first.parts.map((p) => (p.type === "text" ? p.text : "")).join(" ").trim();
  return text.slice(0, 60) || "New conversation";
}
