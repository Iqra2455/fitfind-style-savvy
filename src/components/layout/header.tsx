import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, LogOut } from "lucide-react";

export function Header() {
  const { user } = useAuth();
  const nav = useNavigate();

  return (
    <header className="sticky top-0 z-40 glass">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground shadow">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="font-display text-xl tracking-tight">FitFind</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <Link to="/recommendations" className="hover:text-foreground transition-colors" activeProps={{ className: "text-foreground" }}>Recommendations</Link>
          <Link to="/assistant" className="hover:text-foreground transition-colors" activeProps={{ className: "text-foreground" }}>AI Assistant</Link>
          <Link to="/wishlist" className="hover:text-foreground transition-colors" activeProps={{ className: "text-foreground" }}>Wishlist</Link>
          <Link to="/about" className="hover:text-foreground transition-colors" activeProps={{ className: "text-foreground" }}>About</Link>
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/dashboard">Dashboard</Link>
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={async () => { await supabase.auth.signOut(); nav({ to: "/" }); }}
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/login">Sign in</Link>
              </Button>
              <Button asChild variant="hero" size="sm">
                <Link to="/login" search={{ mode: "signup" } as never}>Get started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
