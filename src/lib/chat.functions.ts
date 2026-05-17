import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { z } from "zod";

const sysPrompt = `You are the FitFind AI Fit Assistant — a friendly, knowledgeable stylist for online shoppers in Pakistan and globally.
You help users:
- understand why a particular clothing size was recommended
- decide between sizes when uncertain
- pick between Amazon and Daraz options
- choose flattering cuts for their body type and preferred fit
Tone: warm, concise, confident. Use short paragraphs and the occasional bullet list. When discussing fit, mention specific measurements (chest, waist, hips) in cm. Convert between international (S/M/L) and Asian sizing when relevant. Never invent product links — recommend the user check their FitFind recommendations page.`;

export const streamChat = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { threadId: string; messages: UIMessage[] }) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { threadId, messages } = data;

    // Verify thread ownership
    const { data: thread, error: tErr } = await supabase
      .from("chat_threads").select("id").eq("id", threadId).eq("user_id", userId).maybeSingle();
    if (tErr || !thread) throw new Error("Thread not found");

    // Fetch latest measurement for personalization
    const { data: m } = await supabase
      .from("measurements").select("*").eq("user_id", userId)
      .order("created_at", { ascending: false }).limit(1).maybeSingle();

    const measurementContext = m
      ? `\n\nUser profile: gender=${m.gender ?? "?"}, height=${m.height_cm ?? "?"}cm, weight=${m.weight_kg ?? "?"}kg, body_type=${m.body_type ?? "?"}, preferred_fit=${m.preferred_fit ?? "?"}, size=${m.size ?? "?"}, country=${m.country ?? "?"}.`
      : "\n\nUser has not yet entered measurements — encourage them to complete the fit profile.";

    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");
    const model = createLovableAiGatewayProvider(key)("google/gemini-3-flash-preview");

    const result = streamText({
      model,
      system: sysPrompt + measurementContext,
      messages: await convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse({
      originalMessages: messages,
      onFinish: async ({ messages: finalMessages }) => {
        const last = finalMessages[finalMessages.length - 1];
        const prevUser = finalMessages[finalMessages.length - 2];
        // Persist the new user msg + assistant reply (anything after originalMessages we already have)
        const newOnes = finalMessages.slice(messages.length - 1);
        for (const msg of [prevUser, last].filter(Boolean)) {
          if (!msg) continue;
          // Only insert messages that aren't yet in DB. Simplest: insert last two if assistant just finished.
        }
        // Robust approach: replace whole thread with the final messages.
        await supabase.from("chat_messages").delete().eq("thread_id", threadId);
        const rows = finalMessages.map((mm) => ({
          thread_id: threadId,
          user_id: userId,
          role: mm.role,
          parts: mm.parts as never,
        }));
        if (rows.length) await supabase.from("chat_messages").insert(rows);
        await supabase.from("chat_threads")
          .update({ updated_at: new Date().toISOString() })
          .eq("id", threadId);
        void newOnes;
      },
    });
  });

export const createThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { title?: string }) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("chat_threads")
      .insert({ user_id: userId, title: data.title ?? "New conversation" })
      .select().single();
    if (error) throw error;
    return row;
  });

export const listThreads = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("chat_threads").select("*").order("updated_at", { ascending: false });
    if (error) throw error;
    return data;
  });

export const getThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { threadId: string }) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: thread } = await supabase
      .from("chat_threads").select("*").eq("id", data.threadId).eq("user_id", userId).maybeSingle();
    if (!thread) return { thread: null, messages: [] };
    const { data: messages } = await supabase
      .from("chat_messages").select("*").eq("thread_id", data.threadId).order("created_at", { ascending: true });
    return { thread, messages: messages ?? [] };
  });

export const deleteThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { threadId: string }) => d)
  .handler(async ({ data, context }) => {
    await context.supabase.from("chat_threads").delete().eq("id", data.threadId);
    return { ok: true };
  });

export const renameThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { threadId: string; title: string }) =>
    z.object({ threadId: z.string().uuid(), title: z.string().min(1).max(120) }).parse(d))
  .handler(async ({ data, context }) => {
    await context.supabase.from("chat_threads").update({ title: data.title }).eq("id", data.threadId);
    return { ok: true };
  });
