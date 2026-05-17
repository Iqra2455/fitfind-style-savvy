import { createFileRoute, useParams } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useServerFn } from "@tanstack/react-start";
import { getThread } from "@/lib/chat.functions";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef } from "react";
import { Conversation, ConversationContent, ConversationScrollButton } from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { PromptInput, PromptInputTextarea, PromptInputFooter, PromptInputSubmit } from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/assistant/")({
  component: Chat,
});

function Chat() {
  const { threadId } = useParams({ from: "/assistant/$threadId" });
  const fetchThread = useServerFn(getThread);
  const { data } = useQuery({
    queryKey: ["thread", threadId],
    queryFn: () => fetchThread({ data: { threadId } }),
  });

  const initial = useMemo<UIMessage[]>(() => {
    const rows = data?.messages ?? [];
    return rows.map((r) => ({
      id: r.id,
      role: r.role as "user" | "assistant" | "system",
      parts: r.parts as UIMessage["parts"],
    }));
  }, [data]);

  const transport = useMemo(() => new DefaultChatTransport({
    api: "/_serverFn/streamChat" as never,
    fetch: async (_input, init) => {
      // Use Supabase fetch helper for auth attach via DefaultChatTransport body merge.
      const { data: sess } = await supabase.auth.getSession();
      const token = sess.session?.access_token;
      const body = JSON.parse((init?.body as string) ?? "{}");
      // Call streamChat server function directly via tanstack
      const url = `/_server/streamChat`;
      void url;
      return fetch(`/_server/streamChat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ data: { threadId, messages: body.messages } }),
      });
    },
  }), [threadId]);

  const { messages, sendMessage, status } = useChat({
    id: threadId,
    messages: initial,
    transport,
  });

  const inputRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => { inputRef.current?.focus(); }, [threadId, status]);

  const isLoading = status === "submitted" || status === "streaming";

  return (
    <div className="flex h-[75vh] flex-col">
      <Conversation className="flex-1">
        <ConversationContent>
          {messages.length === 0 && (
            <div className="mx-auto mt-16 max-w-md text-center text-muted-foreground">
              <p className="font-display text-2xl text-foreground">Hi, I'm your Fit Assistant.</p>
              <p className="mt-2 text-sm">Ask me anything about sizing, fit, or what to buy from Amazon or Daraz.</p>
            </div>
          )}
          {messages.map((m) => (
            <Message key={m.id} from={m.role}>
              <MessageContent>
                {m.parts.map((p, i) => p.type === "text" ? <MessageResponse key={i}>{p.text}</MessageResponse> : null)}
              </MessageContent>
            </Message>
          ))}
          {status === "submitted" && (
            <Message from="assistant"><MessageContent><Shimmer>Thinking…</Shimmer></MessageContent></Message>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="border-t border-border p-4">
        <PromptInput onSubmit={(msg) => {
          if (!msg.text?.trim()) return;
          sendMessage({ text: msg.text });
        }}>
          <PromptInputTextarea ref={inputRef} placeholder="Ask about sizing, brands, or fit…" />
          <PromptInputFooter className="justify-end">
            <PromptInputSubmit status={status} disabled={isLoading} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}
