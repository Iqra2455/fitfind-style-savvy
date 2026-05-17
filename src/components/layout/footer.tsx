import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border/60 py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-6 text-sm text-muted-foreground md:flex-row md:items-center">
        <div>
          <p className="font-display text-lg text-foreground">FitFind</p>
          <p className="mt-1 max-w-md">AI-powered fashion fit for Pakistan and the world. Shop Amazon & Daraz with confidence.</p>
        </div>
        <div className="flex gap-6">
          <Link to="/about" className="hover:text-foreground">About</Link>
          <Link to="/recommendations" className="hover:text-foreground">Shop</Link>
          <Link to="/assistant" className="hover:text-foreground">Assistant</Link>
        </div>
      </div>
    </footer>
  );
}
