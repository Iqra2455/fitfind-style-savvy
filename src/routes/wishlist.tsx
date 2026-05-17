import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { useAuth } from "@/lib/use-auth";
import { useServerFn } from "@tanstack/react-start";
import { listWishlist } from "@/lib/wishlist.functions";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

export const Route = createFileRoute("/wishlist")({
  head: () => ({ meta: [{ title: "Wishlist — FitFind" }] }),
  component: Wishlist,
});

function Wishlist() {
  const { user, loading } = useAuth();
  const fetch = useServerFn(listWishlist);
  const { data } = useQuery({ queryKey: ["wishlist"], queryFn: () => fetch(), enabled: !!user });

  return (
    <div>
      <Header />
      <main className="mx-auto max-w-7xl px-6 py-12">
        <h1 className="font-display text-4xl md:text-5xl">Your wishlist</h1>
        <p className="mt-2 text-muted-foreground">Saved picks from Amazon and Daraz.</p>
        {!user && !loading && (
          <div className="mt-10 rounded-3xl border border-border bg-card p-8 text-center">
            <Heart className="mx-auto mb-3 h-10 w-10 text-primary" />
            <p className="mb-4">Sign in to save your favorite pieces.</p>
            <Button asChild variant="hero"><Link to="/login">Sign in</Link></Button>
          </div>
        )}
        {user && (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {(data ?? []).map((w) => (
              <a key={w.id} href={w.url ?? "#"} target="_blank" rel="noopener noreferrer"
                 className="group overflow-hidden rounded-3xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10">
                <div className="aspect-[4/5] overflow-hidden bg-muted">
                  {w.image_url && <img src={w.image_url} alt={w.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" />}
                </div>
                <div className="p-4">
                  <p className="text-xs text-muted-foreground">{w.brand} · {w.store}</p>
                  <p className="line-clamp-1 text-sm font-semibold">{w.title}</p>
                  <p className="mt-1 text-sm">{w.price}</p>
                </div>
              </a>
            ))}
            {data && data.length === 0 && (
              <p className="col-span-full text-muted-foreground">Nothing here yet. <Link to="/recommendations" className="text-primary hover:underline">Browse recommendations →</Link></p>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
