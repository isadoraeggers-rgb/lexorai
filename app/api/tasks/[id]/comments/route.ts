import { NextResponse } from "next/server";
import { getTaskComments } from "@/lib/data/tasks";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const comments = await getTaskComments(id);
  return NextResponse.json(comments);
}
