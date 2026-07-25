import { NextResponse } from "next/server";
import { getChatMessages } from "@/lib/data/ai-chats";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const messages = await getChatMessages(id);
  return NextResponse.json(messages);
}
