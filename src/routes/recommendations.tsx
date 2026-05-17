import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProductCard } from "@/components/fitfind/product-card";
import { PRODUCTS } from "@/data/products";
import { recommendSize, type Measurement } from "@/lib/size-logic";
import { useAuth } from "@/lib/use-auth";
import { useServerFn } from "@tanstack/react-start";
import { saveMeasurement, getLatestMeasurement } from "@/lib/measurements.functions";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/recommendations")({
  head: () => ({ meta: [{ title: "Recommendations — FitFind" }] }),
  component: Recs,
});

function Recs() {
  const { user } = useAuth();
  const save = useServerFn(saveMeasurement);
  const getLatest = useServerFn(getLatestMeasurement);
  const [m, setM] = useState<Measurement & { age?: number; body_type?: string; country?: string }>({ preferred_fit: "regular", gender: "women" });
  const [category, setCategory] = useState<string>("all");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!user) return;
    getLatest().then((data) => { if (data) { setM(data as never); setSubmitted(true); } }).catch(() => {});
  }, [user, getLatest]);

  const rec = submitted ? recommendSize(m, category === "all" ? "shirts" : category) : null;
  const filtered = PRODUCTS.filter(p =>
    (category === "all" || p.category === category) &&
    (!m.gender || m.gender === "unisex" || p.gender === m.gender || p.gender === "unisex")
  );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (user) {
      try { await save({ data: { ...m, category } }); toast.success("Saved your fit profile"); }
      catch (err) { toast.error(err instanceof Error ? err.message : "Couldn't save"); }
    }
  };

  return (
    <div>
      <Header />
      <main className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-10">
          <h1 className="font-display text-4xl md:text-5xl">Your fit profile</h1>
          <p className="mt-2 text-muted-foreground">Tell us a bit about you. The more we know, the better the fit.</p>
        </div>

        <form onSubmit={onSubmit} className="grid gap-4 rounded-3xl border border-border bg-card p-6 md:grid-cols-4">
          <Field label="Gender">
            <select className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm" value={m.gender ?? ""} onChange={e => setM({ ...m, gender: e.target.value })}>
              <option value="women">Women</option><option value="men">Men</option><option value="unisex">Unisex</option>
            </select>
          </Field>
          <Field label="Height (cm)"><Input type="number" min={80} max={250} value={m.height_cm ?? ""} onChange={e => setM({ ...m, height_cm: +e.target.value || undefined })} /></Field>
          <Field label="Weight (kg)"><Input type="number" min={20} max={250} value={m.weight_kg ?? ""} onChange={e => setM({ ...m, weight_kg: +e.target.value || undefined })} /></Field>
          <Field label="Age"><Input type="number" min={8} max={110} value={m.age ?? ""} onChange={e => setM({ ...m, age: +e.target.value || undefined })} /></Field>
          <Field label="Body type">
            <select className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm" value={m.body_type ?? ""} onChange={e => setM({ ...m, body_type: e.target.value })}>
              <option value="">Select…</option><option>Slim</option><option>Athletic</option><option>Average</option><option>Curvy</option><option>Plus</option>
            </select>
          </Field>
          <Field label="Preferred fit">
            <select className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm" value={m.preferred_fit ?? "regular"} onChange={e => setM({ ...m, preferred_fit: e.target.value })}>
              <option value="slim">Slim</option><option value="regular">Regular</option><option value="oversized">Oversized</option>
            </select>
          </Field>
          <Field label="Country">
            <select className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm" value={m.country ?? "PK"} onChange={e => setM({ ...m, country: e.target.value })}>
              <option value="PK">Pakistan</option><option value="US">United States</option><option value="UK">United Kingdom</option><option value="AE">UAE</option><option value="IN">India</option>
            </select>
          </Field>
          <Field label="Category">
            <select className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm" value={category} onChange={e => setCategory(e.target.value)}>
              <option value="all">All</option><option value="shirts">Shirts</option><option value="jeans">Jeans</option><option value="hoodies">Hoodies</option><option value="dresses">Dresses</option><option value="jackets">Jackets</option><option value="shoes">Shoes</option>
            </select>
          </Field>
          <Field label="Chest (cm, optional)"><Input type="number" min={40} max={200} value={m.chest_cm ?? ""} onChange={e => setM({ ...m, chest_cm: +e.target.value || undefined })} /></Field>
          <Field label="Waist (cm, optional)"><Input type="number" min={40} max={200} value={m.waist_cm ?? ""} onChange={e => setM({ ...m, waist_cm: +e.target.value || undefined })} /></Field>
          <Field label="Hips (cm, optional)"><Input type="number" min={40} max={200} value={m.hips_cm ?? ""} onChange={e => setM({ ...m, hips_cm: +e.target.value || undefined })} /></Field>
          <div className="flex items-end">
            <Button type="submit" variant="hero" className="w-full">Get my picks</Button>
          </div>
        </form>

        {rec && (
          <div className="my-10 flex flex-col items-start justify-between gap-4 rounded-3xl border border-border bg-gradient-to-br from-secondary via-card to-accent/30 p-6 md:flex-row md:items-center">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Your recommended size</p>
              <p className="mt-1 font-display text-4xl">{rec.size} <span className="text-base text-muted-foreground">· Asian {rec.asian}</span></p>
              <p className="mt-1 text-sm text-muted-foreground">{rec.note}</p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Fit confidence</p>
              <p className="font-display text-4xl text-gradient">{rec.confidence}%</p>
              <Button asChild variant="outline" size="sm" className="mt-2"><Link to="/assistant">Ask the AI <Sparkles className="ml-1 h-3 w-3" /></Link></Button>
            </div>
          </div>
        )}

        <div className="mt-12">
          <h2 className="mb-6 font-display text-3xl">Recommended for you</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((p, i) => (
              <ProductCard
                key={p.id}
                product={p}
                bestFit={submitted && i < 3}
                reason={submitted && i < 3 && rec ? `${rec.size} likely fits — ${m.preferred_fit ?? "regular"} cut.` : undefined}
              />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><Label className="mb-1.5 block text-xs text-muted-foreground">{label}</Label>{children}</div>;
}
