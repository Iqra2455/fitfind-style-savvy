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

  const filteredThreads = useMemo(() => {
    if (!threads) return [];
    const q = threadFilter.trim().toLowerCase();
    if (!q) return threads;
    return threads.filter(
      (t) => t.id.toLowerCase().includes(q) || t.title.toLowerCase().includes(q),
    );
  }, [threads, threadFilter]);

  const filteredMessages = useMemo(() => {
    if (!detail) return [];
    const q = textFilter.trim().toLowerCase();
    return detail.messages.filter((m) => {
      if (roleFilter !== "all" && m.role !== roleFilter) return false;
      if (q && !JSON.stringify(m.parts).toLowerCase().includes(q)) return false;
      return true;
    });
  }, [detail, roleFilter, textFilter]);

  const clearMessageFilters = () => {
    setRoleFilter("all");
    setTextFilter("");
  };

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
            <div className="mb-2 flex items-center justify-between gap-2 text-xs uppercase tracking-wide text-muted-foreground">
              <span>Threads ({filteredThreads.length}/{threads?.length ?? 0})</span>
            </div>
            <div className="relative mb-3">
              <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={threadFilter}
                onChange={(e) => setThreadFilter(e.target.value)}
                placeholder="Filter by id or title"
                className="h-8 pl-7 text-xs"
              />
            </div>
            <ScrollArea className="h-[70vh] pr-2">
              <ul className="space-y-1">
                {filteredThreads.map((t) => (
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
                {threads && filteredThreads.length === 0 && (
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
                    {filteredMessages.length}/{detail.messages.length} message{detail.messages.length === 1 ? "" : "s"}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative min-w-[200px] flex-1">
                    <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={textFilter}
                      onChange={(e) => setTextFilter(e.target.value)}
                      placeholder="Search text inside parts JSON"
                      className="h-8 pl-7 text-xs"
                    />
                  </div>
                  <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as typeof roleFilter)}>
                    <SelectTrigger className="h-8 w-[140px] text-xs">
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All roles</SelectItem>
                      <SelectItem value="user">user</SelectItem>
                      <SelectItem value="assistant">assistant</SelectItem>
                      <SelectItem value="system">system</SelectItem>
                    </SelectContent>
                  </Select>
                  {(roleFilter !== "all" || textFilter) && (
                    <Button variant="ghost" size="sm" onClick={clearMessageFilters} className="h-8">
                      <X className="mr-1 h-3.5 w-3.5" /> Clear
                    </Button>
                  )}
                </div>
                <ScrollArea className="h-[65vh] pr-2">
                  <ol className="space-y-3">
                    {filteredMessages.map((m, i) => (
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
                    {filteredMessages.length === 0 && (
                      <li className="text-sm text-muted-foreground">
                        {detail.messages.length === 0
                          ? "No messages stored for this thread."
                          : "No messages match the current filters."}
                      </li>
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