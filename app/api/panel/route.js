import connectDB from "@/lib/db";
import Panel from "@/models/Panel";
import { NextResponse } from "next/server";
import { verify } from "@/lib/verify"; // if you want JWT check

// Get panel (code 2 only)
export async function GET(req) {
  await connectDB();
  try {
    const panel = await Panel.findOne({ code: 1 });
    return NextResponse.json(panel || {});
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Add or update panel (code 1 only)
export async function POST(req) {
  await connectDB();
  try {
    const verification = await verify(req); // 🔐 check token
    if (!verification.success) {
      return NextResponse.json({ error: verification.error }, { status: verification.status });
    }

    const { url } = await req.json();
    const panel = await Panel.findOneAndUpdate(
      { code: 1 },
      { code: 1, url },
      { new: true, upsert: true }
    );
    return NextResponse.json({ message: "Panel URL saved successfully", panel });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
