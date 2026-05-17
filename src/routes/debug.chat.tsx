import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { useAuth } from "@/lib/use-auth";
import { listThreads, getThread } from "@/lib/chat.functions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";

export const Route = createFileRoute("/debug/chat")({
  head: () => ({ meta: [{ title: "Chat Debug — FitFind" }, { name: "robots", content: "noindex" }] }),
  component: ChatDebugPage,
});

function ChatDebugPage() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  useEffect(() => { if (!loading && !user) nav({ to: "/login" }); }, [loading, user, nav]);

  const list = useServerFn(listThreads);
  const get = useServerFn(getThread);
  const [selected, setSelected] = useState<string | null>(null);
  const [threadFilter, setThreadFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "user" | "assistant" | "system">("all");
  const [textFilter, setTextFilter] = useState("");

  const { data: threads } = useQuery({
    queryKey: ["debug-threads"],
    queryFn: () => list(),
    enabled: !!user,
  });

  const { data: detail, isFetching } = useQuery({
    queryKey: ["debug-thread", selected],
    queryFn: () => get({ data: { threadId: selected! } }),
    enabled: !!selected,
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-display text-3xl font-bold">Chat debug</h1>
            <p className="text-sm text-muted-foreground">
              Inspect stored threads and raw <code className="font-mono">parts</code> JSON for troubleshooting.
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/assistant">Back to Assistant</Link>
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-[280px_1fr]">
          <Card className="p-3">
            <div className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
              Threads ({threads?.length ?? 0})
            </div>
            <ScrollArea className="h-[70vh] pr-2">
              <ul className="space-y-1">
                {threads?.map((t) => (
                  <li key={t.id}>
                    <button
                      onClick={() => setSelected(t.id)}
                      className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-muted ${
                        selected === t.id ? "bg-muted font-medium" : ""
                      }`}
                    >
                      <div className="truncate">{t.title}</div>
                      <div className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                        {t.id.slice(0, 8)} · {new Date(t.updated_at).toLocaleString()}
                      </div>
                    </button>
                  </li>
                ))}
                {threads && threads.length === 0 && (
                  <li className="px-3 py-2 text-sm text-muted-foreground">No threads yet.</li>
                )}
              </ul>
            </ScrollArea>
          </Card>

          <Card className="p-4">
            {!selected && (
              <div className="text-sm text-muted-foreground">Select a thread to inspect its messages.</div>
            )}
            {selected && isFetching && <div className="text-sm text-muted-foreground">Loading…</div>}
            {selected && detail && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2 border-b pb-3">
                  <Badge variant="secondary">thread</Badge>
                  <code className="font-mono text-xs">{detail.thread?.id}</code>
                  <span className="text-xs text-muted-foreground">
                    {detail.messages.length} message{detail.messages.length === 1 ? "" : "s"}
                  </span>
                </div>
                <ScrollArea className="h-[65vh] pr-2">
                  <ol className="space-y-3">
                    {detail.messages.map((m, i) => (
                      <li key={m.id} className="rounded-md border bg-card">
                        <div className="flex items-center justify-between gap-2 border-b px-3 py-2">
                          <div className="flex items-center gap-2">
                            <Badge variant={m.role === "user" ? "default" : "secondary"}>{m.role}</Badge>
                            <span className="font-mono text-[11px] text-muted-foreground">
                              #{i} · {m.id.slice(0, 8)}
                            </span>
                          </div>
                          <span className="text-[11px] text-muted-foreground">
                            {new Date(m.created_at).toLocaleString()}
                          </span>
                        </div>
                        <pre className="overflow-x-auto whitespace-pre-wrap break-words p-3 font-mono text-xs">
{JSON.stringify(m.parts, null, 2)}
                        </pre>
                      </li>
                    ))}
                    {detail.messages.length === 0 && (
                      <li className="text-sm text-muted-foreground">No messages stored for this thread.</li>
                    )}
                  </ol>
                </ScrollArea>
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}