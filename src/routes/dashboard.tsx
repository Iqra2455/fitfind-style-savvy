import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { useAuth } from "@/lib/use-auth";
import { useServerFn } from "@tanstack/react-start";
import { getLatestMeasurement } from "@/lib/measurements.functions";
import { listWishlist } from "@/lib/wishlist.functions";
import { listThreads } from "@/lib/chat.functions";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { Ruler, Heart, MessageCircle, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — FitFind" }] }),
  component: Dash,
});

function Dash() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  useEffect(() => { if (!loading && !user) nav({ to: "/login" }); }, [loading, user, nav]);

  const m = useServerFn(getLatestMeasurement);
  const w = useServerFn(listWishlist);
  const t = useServerFn(listThreads);
  const meas = useQuery({ queryKey: ["measurement"], queryFn: () => m(), enabled: !!user });
  const wish = useQuery({ queryKey: ["wishlist"], queryFn: () => w(), enabled: !!user });
  const threads = useQuery({ queryKey: ["threads"], queryFn: () => t(), enabled: !!user });

  return (
    <div>
      <Header />
      <main className="mx-auto max-w-7xl px-6 py-12">
        <h1 className="font-display text-4xl md:text-5xl">Welcome back{user?.email ? `, ${user.email.split("@")[0]}` : ""}.</h1>
        <p className="mt-2 text-muted-foreground">Your fit profile, saved looks, and AI conversations.</p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <Card icon={<Ruler className="h-5 w-5" />} title="Fit profile" to="/recommendations" cta="Update measurements">
            {meas.data ? (
              <p className="text-sm text-muted-foreground">{meas.data.gender ?? ""} · {meas.data.height_cm}cm · {meas.data.weight_kg}kg · prefers {meas.data.preferred_fit}</p>
            ) : <p className="text-sm text-muted-foreground">No measurements yet.</p>}
          </Card>
          <Card icon={<Heart className="h-5 w-5" />} title="Wishlist" to="/wishlist" cta="View saved">
            <p className="text-3xl font-display">{wish.data?.length ?? 0}<span className="ml-2 text-sm text-muted-foreground">items saved</span></p>
          </Card>
          <Card icon={<MessageCircle className="h-5 w-5" />} title="AI conversations" to="/assistant" cta="Open assistant">
            <p className="text-3xl font-display">{threads.data?.length ?? 0}<span className="ml-2 text-sm text-muted-foreground">threads</span></p>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Card({ icon, title, children, to, cta }: { icon: React.ReactNode; title: string; children: React.ReactNode; to: string; cta: string }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-6">
      <div className="mb-4 flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground">{icon}</span>
        <h3 className="font-display text-xl">{title}</h3>
      </div>
      <div className="mb-4">{children}</div>
      <Button asChild variant="outline" size="sm"><Link to={to}>{cta} <ArrowRight className="ml-1 h-3 w-3" /></Link></Button>
    </div>
  );
}
