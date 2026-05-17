import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About FitFind — AI Fashion Fit" },
      { name: "description", content: "FitFind helps shoppers in Pakistan and worldwide find clothes that actually fit, powered by AI." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div>
      <Header />
      <main className="mx-auto max-w-3xl px-6 py-20">
        <h1 className="font-display text-5xl">A fitting room, but smarter.</h1>
        <p className="mt-6 text-lg text-muted-foreground">
          FitFind started with a simple frustration: ordering clothes online in Pakistan and finding they
          don't fit. Brands use different size charts. Asian and international sizing rarely align. Returns
          are painful — sometimes impossible.
        </p>
        <p className="mt-4 text-lg text-muted-foreground">
          We use AI to translate your body — height, weight, fit preference — into the right size for each
          brand on Amazon and Daraz. Our AI Fit Assistant explains the why and offers alternatives when the
          fit is borderline. The goal: less guesswork, fewer returns, more confidence.
        </p>
        <h2 className="mt-12 font-display text-3xl">Built for Pakistan, sized for the world.</h2>
        <p className="mt-4 text-muted-foreground">
          We support both Asian and international size charts, PKR and USD pricing, and brands stocked on
          Daraz as well as Amazon's global catalog.
        </p>
      </main>
      <Footer />
    </div>
  );
}
