import { NextResponse } from "next/server";

const GIST_RAW_URL =
  "https://gist.githubusercontent.com/gemini911/519fc49d3ec876684c42dada6f81a3da/raw/sites.json";

export async function GET() {
  try {
    const response = await fetch(GIST_RAW_URL, {
      cache: "no-cache",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch sites from Gist");
    }

    const data = await response.json();
    // 确保返回格式正确
    return NextResponse.json(data, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
    });
  } catch (error: unknown) {
    console.error("Error fetching sites:", error);
    return NextResponse.json(
      { error: "Failed to fetch sites" },
      { status: 500 }
    );
  }
}
