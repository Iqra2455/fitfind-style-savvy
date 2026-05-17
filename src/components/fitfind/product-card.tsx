import { Heart, Star, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Product } from "@/data/products";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toggleWishlist } from "@/lib/wishlist.functions";
import { useAuth } from "@/lib/use-auth";
import { toast } from "sonner";

export function ProductCard({ product, bestFit, reason }: { product: Product; bestFit?: boolean; reason?: string }) {
  const { user } = useAuth();
  const toggle = useServerFn(toggleWishlist);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  return (
    <article className="group relative overflow-hidden rounded-3xl border border-border/60 bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10">
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {bestFit && (
          <span className="absolute left-3 top-3 rounded-full bg-gradient-to-r from-primary to-accent px-3 py-1 text-xs font-semibold text-primary-foreground shadow">
            Best Fit
          </span>
        )}
        <span className="absolute right-3 top-3 rounded-full bg-background/90 px-2.5 py-1 text-[11px] font-medium text-foreground shadow">
          {product.store}
        </span>
        <Button
          variant="secondary"
          size="icon-sm"
          className="absolute bottom-3 right-3 opacity-0 transition-opacity group-hover:opacity-100"
          aria-label="Save to wishlist"
          disabled={busy}
          onClick={async () => {
            if (!user) { toast.error("Sign in to save items"); return; }
            setBusy(true);
            try {
              const res = await toggle({ data: { product_id: product.id, title: product.title, image_url: product.image, price: product.price, brand: product.brand, store: product.store, url: product.url } });
              setSaved(res.saved);
              toast.success(res.saved ? "Saved to wishlist" : "Removed from wishlist");
            } finally { setBusy(false); }
          }}
        >
          <Heart className={`h-4 w-4 ${saved ? "fill-primary text-primary" : ""}`} />
        </Button>
      </div>
      <div className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{product.brand}</p>
            <h3 className="mt-0.5 line-clamp-1 text-sm font-semibold text-foreground">{product.title}</h3>
          </div>
          <p className="whitespace-nowrap text-sm font-semibold text-foreground">{product.price}</p>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-primary text-primary" />
            {product.rating}
          </span>
          <span>{product.sizes.join(" · ")}</span>
        </div>
        {reason && <p className="rounded-xl bg-secondary/60 px-3 py-2 text-xs text-secondary-foreground">{reason}</p>}
        <Button asChild variant="outline" size="sm" className="w-full">
          <a href={product.url} target="_blank" rel="noopener noreferrer">
            View on {product.store} <ExternalLink className="ml-1 h-3 w-3" />
          </a>
        </Button>
      </div>
    </article>
  );
}
