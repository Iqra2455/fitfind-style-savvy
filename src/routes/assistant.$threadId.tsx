const WELCOME_TEXT = `👋 Hi! I'm your **FitFind AI Fit Assistant**.

I can help you:
- Pick the right size between **S / M / L / XL** or numeric measurements
- Decide between **Amazon vs Daraz** options
- Suggest cuts that flatter your body type and preferred fit

Tell me what you're shopping for — for example, *"I want a slim-fit shirt, I'm 175 cm / 70 kg"* — and I'll take it from there.`;

import { createFileRoute, useParams } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getThread } from "@/lib/chat.functions";
import { supabase } from "@/integrations/supabase/client";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { toast } from "sonner";

export const Route = createFileRoute("/assistant/$threadId")({
  component: ThreadChat,
});

type StoredMessage = {
  id: string;
  role: string;
  parts: unknown;
};

function ThreadChat() {
  const { threadId } = useParams({ from: "/assistant/$threadId" });
  const get = useServerFn(getThread);

  const { data, isLoading } = useQuery({
    queryKey: ["thread", threadId],
    queryFn: () => get({ data: { threadId } }),
  });

  const initialMessages = useMemo<UIMessage[]>(() => {
    if (!data?.messages) return [];
    return (data.messages as StoredMessage[]).map((m) => ({
      id: m.id,
      role: m.role as UIMessage["role"],
      parts: (Array.isArray(m.parts) ? m.parts : []) as UIMessage["parts"],
    }));
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-10 text-sm text-muted-foreground">
        Loading conversation…
      </div>
    );
  }

  return <ChatInner threadId={threadId} initialMessages={initialMessages} />;
}

function ChatInner({
  threadId,
  initialMessages,
}: {
  threadId: string;
  initialMessages: UIMessage[];
}) {
  const [input, setInput] = useState("");

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: { threadId },
        fetch: async (url, init) => {
          const { data } = await supabase.auth.getSession();
          const token = data.session?.access_token;
          const headers = new Headers(init?.headers);
          if (token) headers.set("Authorization", `Bearer ${token}`);
          return fetch(url, { ...init, headers });
        },
      }),
    [threadId],
  );

  const { messages, sendMessage, status, error } = useChat({
    id: threadId,
    messages: initialMessages,
    transport,
    onError: (err) => toast.error(err.message || "Chat error"),
  });

  useEffect(() => {
    if (error) console.error("Chat error", error);
  }, [error]);

  const isBusy = status === "submitted" || status === "streaming";

  const handleSubmit = async (message: { text?: string }) => {
    const text = (message.text ?? input).trim();
    if (!text || isBusy) return;
    setInput("");
    await sendMessage({ text });
  };

  return (
    <div className="flex h-full min-h-[70vh] flex-col">
      <Conversation className="flex-1">
        <ConversationContent>
          {messages.length === 0 && (
            <Message from="assistant">
              <MessageResponse>{WELCOME_TEXT}</MessageResponse>
            </Message>
          )}
          {messages.map((m) => {
              const text = m.parts
                .map((p) => (p.type === "text" ? p.text : ""))
                .join("");
              return (
                <Message key={m.id} from={m.role === "user" ? "user" : "assistant"}>
                  {m.role === "assistant" ? (
                    <MessageResponse>{text}</MessageResponse>
                  ) : (
                    <MessageContent>{text}</MessageContent>
                  )}
                </Message>
              );
            })}
          {status === "submitted" && (
            <Message from="assistant">
              <Shimmer>Thinking…</Shimmer>
            </Message>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="border-t p-4">
        <PromptInput onSubmit={handleSubmit}>
          <PromptInputTextarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about sizes, fit, fabrics, or styling…"
            autoFocus
          />
          <PromptInputFooter className="justify-end">
            <PromptInputSubmit status={status} disabled={!input.trim() || isBusy} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}