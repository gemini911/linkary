import { NextResponse } from "next/server";

const GIST_RAW_URL =
  "https://gist.githubusercontent.com/gemini911/519fc49d3ec876684c42dada6f81a3da/raw/7d0a0bbc63c1571a70bb9fe3e7ae8d943950271a/sites.json";

export async function GET() {
  try {
    const response = await fetch(GIST_RAW_URL, {
      cache: "no-cache",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch sites from Gist");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch sites" },
      { status: 500 }
    );
  }
}
