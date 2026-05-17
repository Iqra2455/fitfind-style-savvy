import { createFileRoute, Outlet, Link, useNavigate, useParams } from "@tanstack/react-router";
import { Header } from "@/components/layout/header";
import { useAuth } from "@/lib/use-auth";
import { useServerFn } from "@tanstack/react-start";
import { listThreads, createThread, deleteThread } from "@/lib/chat.functions";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { Plus, MessageCircle, Trash2 } from "lucide-react";

export const Route = createFileRoute("/assistant")({
  head: () => ({ meta: [{ title: "AI Fit Assistant — FitFind" }] }),
  component: AssistantLayout,
});

function AssistantLayout() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  useEffect(() => { if (!loading && !user) nav({ to: "/login" }); }, [loading, user, nav]);

  const list = useServerFn(listThreads);
  const create = useServerFn(createThread);
  const del = useServerFn(deleteThread);
  const qc = useQueryClient();
  const params = useParams({ strict: false }) as { threadId?: string };

  const { data: threads } = useQuery({ queryKey: ["threads"], queryFn: () => list(), enabled: !!user });

  // Auto-create first thread or pick first when none selected
  useEffect(() => {
    if (!user || !threads || params.threadId) return;
    if (threads.length === 0) {
      create({ data: { title: "New conversation" } }).then((t) => {
        qc.invalidateQueries({ queryKey: ["threads"] });
        nav({ to: "/assistant/$threadId", params: { threadId: t.id } });
      });
    } else {
      nav({ to: "/assistant/$threadId", params: { threadId: threads[0].id } });
    }
  }, [user, threads, params.threadId, create, qc, nav]);

  const onNew = async () => {
    const t = await create({ data: { title: "New conversation" } });
    qc.invalidateQueries({ queryKey: ["threads"] });
    nav({ to: "/assistant/$threadId", params: { threadId: t.id } });
  };

  const onDelete = async (id: string) => {
    await del({ data: { threadId: id } });
    qc.invalidateQueries({ queryKey: ["threads"] });
    if (params.threadId === id) nav({ to: "/assistant" });
  };

  if (!user) return <div><Header /></div>;

  return (
    <div>
      <Header />
      <main className="mx-auto grid max-w-7xl gap-6 px-6 py-8 md:grid-cols-[260px_1fr]">
        <aside className="rounded-3xl border border-border bg-card p-4">
          <Button onClick={onNew} variant="hero" className="w-full"><Plus className="mr-1 h-4 w-4" /> New chat</Button>
          <div className="mt-4 space-y-1">
            {(threads ?? []).map((t) => (
              <div key={t.id} className={`group flex items-center gap-1 rounded-xl px-2 py-1.5 text-sm hover:bg-muted ${params.threadId === t.id ? "bg-muted" : ""}`}>
                <Link to="/assistant/$threadId" params={{ threadId: t.id }} className="flex flex-1 items-center gap-2 truncate">
                  <MessageCircle className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="truncate">{t.title}</span>
                </Link>
                <button onClick={() => onDelete(t.id)} className="opacity-0 transition-opacity group-hover:opacity-100" aria-label="Delete">
                  <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                </button>
              </div>
            ))}
          </div>
        </aside>
        <section className="min-h-[70vh] rounded-3xl border border-border bg-card">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
