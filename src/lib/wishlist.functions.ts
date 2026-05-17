import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const toggleWishlist = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      product_id: z.string().min(1).max(100),
      title: z.string().min(1).max(300),
      image_url: z.string().url().max(800).optional(),
      price: z.string().max(40).optional(),
      brand: z.string().max(80).optional(),
      store: z.string().max(40).optional(),
      url: z.string().url().max(800).optional(),
    }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: existing } = await supabase
      .from("wishlist").select("id").eq("user_id", userId).eq("product_id", data.product_id).maybeSingle();
    if (existing) {
      await supabase.from("wishlist").delete().eq("id", existing.id);
      return { saved: false };
    }
    await supabase.from("wishlist").insert({ ...data, user_id: userId });
    return { saved: true };
  });

export const listWishlist = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("wishlist").select("*").order("created_at", { ascending: false });
    return data ?? [];
  });
