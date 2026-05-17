import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ArrowRight, Sparkles, Ruler, ShoppingBag, MessageCircle, ShieldCheck, Star } from "lucide-react";
import heroImg from "@/assets/hero-model.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FitFind — Find clothes that actually fit" },
      { name: "description", content: "AI-powered fit & size recommendations for Amazon and Daraz. Shop smarter, return less." },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <div>
      <Header />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 md:grid-cols-2 md:py-28">
            <div className="space-y-7">
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                AI Fit Assistant — built for Pakistan & beyond
              </span>
              <h1 className="font-display text-5xl leading-[1.05] md:text-7xl">
                Clothes that <span className="text-gradient">actually fit</span>.
              </h1>
              <p className="max-w-lg text-lg text-muted-foreground">
                Tell us your measurements. We recommend the perfect size from Amazon and Daraz —
                with confidence scores, alternative sizes, and an AI stylist on tap.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild variant="hero" size="lg">
                  <Link to="/recommendations">
                    Find my fit <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/assistant">Talk to the AI stylist</Link>
                </Button>
              </div>
              <div className="flex items-center gap-6 pt-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-primary" /> Free to use</span>
                <span className="inline-flex items-center gap-1.5"><Star className="h-4 w-4 text-primary" /> Asian + international sizing</span>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-accent/40 via-secondary to-primary/30 blur-2xl" />
              <div className="relative overflow-hidden rounded-[2rem] border border-border bg-card shadow-2xl shadow-primary/20">
                <img src={heroImg} alt="A model wearing a blush blazer and lavender trousers" width={1024} height={1280} className="h-[560px] w-full object-cover" />
                <div className="absolute bottom-5 left-5 right-5 glass rounded-2xl p-4">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">AI recommends</p>
                  <p className="mt-1 font-display text-lg">Size M · 92% match</p>
                  <p className="text-xs text-muted-foreground">Oversized blazer · Outfitters · PKR 6,490</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="mx-auto max-w-7xl px-6 py-20">
          <div className="mb-12 max-w-2xl">
            <h2 className="font-display text-4xl md:text-5xl">How it works</h2>
            <p className="mt-3 text-muted-foreground">Three steps to a closet of perfect-fitting clothes.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { icon: Ruler, title: "Share your measurements", body: "Height, weight, fit preference, and a few optional details. Takes 60 seconds." },
              { icon: Sparkles, title: "Get AI recommendations", body: "Personalized picks from Amazon & Daraz with confidence scores and best-fit reasoning." },
              { icon: ShoppingBag, title: "Shop with confidence", body: "Tap through to the store. Returns and fit anxiety are now someone else's problem." },
            ].map(({ icon: Icon, title, body }, i) => (
              <div key={title} className="group rounded-3xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10">
                <div className="mb-4 grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="mb-1 text-xs font-medium text-muted-foreground">Step {i + 1}</p>
                <h3 className="font-display text-2xl">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* AI assistant teaser */}
        <section className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid items-center gap-10 rounded-[2rem] border border-border bg-gradient-to-br from-secondary via-card to-accent/30 p-10 md:grid-cols-2 md:p-14">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <MessageCircle className="h-3.5 w-3.5" /> AI Fit Assistant
              </span>
              <h2 className="mt-4 font-display text-4xl md:text-5xl">Ask anything about fit.</h2>
              <p className="mt-3 max-w-md text-muted-foreground">
                "Will this Khaadi kurta run tight?" "Should I size up in Levi's?" Get straight answers,
                personalized to your measurements, with alternative sizes when uncertain.
              </p>
              <Button asChild variant="hero" size="lg" className="mt-6">
                <Link to="/assistant">Start chatting <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
            </div>
            <div className="space-y-3">
              {[
                { who: "you", text: "I'm 5'9\", 72 kg, slim build. Will a Levi's 32 slim be too tight?" },
                { who: "ai", text: "At 72 kg you're right on the size 32 boundary. The 511 Slim runs true — go with 32 for a clean leg line. If you prefer breathing room, take a 33." },
                { who: "you", text: "And for an Outfitters oversized blazer?" },
                { who: "ai", text: "Oversized cuts in PK brands run roomy. Drop one size — try Medium for the silhouette you saw in the photos." },
              ].map((m, i) => (
                <div key={i} className={`flex ${m.who === "you" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                    m.who === "you"
                      ? "rounded-br-md bg-primary text-primary-foreground"
                      : "rounded-bl-md bg-card text-foreground shadow-sm"
                  }`}>{m.text}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
