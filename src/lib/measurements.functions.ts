import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const schema = z.object({
  gender: z.string().max(20).optional(),
  height_cm: z.number().min(80).max(250).optional(),
  weight_kg: z.number().min(20).max(250).optional(),
  age: z.number().int().min(8).max(110).optional(),
  body_type: z.string().max(40).optional(),
  preferred_fit: z.string().max(40).optional(),
  size: z.string().max(20).optional(),
  country: z.string().max(60).optional(),
  chest_cm: z.number().min(40).max(200).optional(),
  waist_cm: z.number().min(40).max(200).optional(),
  hips_cm: z.number().min(40).max(200).optional(),
  category: z.string().max(40).optional(),
});

export const saveMeasurement = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => schema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("measurements").insert({ ...data, user_id: userId }).select().single();
    if (error) throw error;
    return row;
  });

export const getLatestMeasurement = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("measurements").select("*").eq("user_id", context.userId)
      .order("created_at", { ascending: false }).limit(1).maybeSingle();
    return data;
  });
