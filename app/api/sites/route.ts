import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET() {
  try {
    const { data: sites, error } = await supabase
      .from("sites")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ tools: sites }, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store", // Ensure fresh data
      },
    });
  } catch (error: unknown) {
    console.error("Error fetching sites from Supabase:", error);
    return NextResponse.json(
      { error: "Failed to fetch sites" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, url, logo, category, tags, description } = body;

    // Basic validation
    if (!name || !url) {
      return NextResponse.json(
        { error: "Name and URL are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("sites")
      .insert([
        {
          name,
          url,
          logo,
          category: category || "Uncategorized",
          tags: tags || [],
          description,
        },
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ tool: data }, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating site:", error);
    return NextResponse.json(
      { error: "Failed to create site" },
      { status: 500 }
    );
  }
}
