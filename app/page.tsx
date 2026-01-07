import { supabase } from "@/lib/supabaseClient";
import DashboardClient from "@/components/DashboardClient";

export const dynamic = 'force-dynamic';

async function getTools() {
  const { data, error } = await supabase
    .from("sites")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase Error Details:", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint
    });
    return [];
  }

  return data || [];
}

export default async function Home() {
  const tools = await getTools();

  return (
    <DashboardClient
      initialTools={tools}
      supabaseUrl={process.env.NEXT_PUBLIC_SUPABASE_URL!}
      supabaseKey={process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}
    />
  );
}
