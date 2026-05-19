import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, url, category, description } = body;

    if (!name || !url) {
      return NextResponse.json(
        { error: "Tool Name and URL are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("tool_submissions")
      .insert([
        {
          name,
          url,
          category: category || null,
          description: description || null,
          status: "pending",
        },
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ submission: data }, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating tool submission:", error);
    return NextResponse.json(
      { error: "Failed to submit tool" },
      { status: 500 }
    );
  }
}
