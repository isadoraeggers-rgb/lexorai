"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AGENT_CONFIG } from "@/lib/ai/agents";
import { cn } from "@/lib/utils";
import type { AiAgentType } from "@/types/database.types";

type ChatSummary = { id: string; title: string; agent_type: AiAgentType; updated_at: string };
type Message = { id: string; role: "user" | "assistant"; content: string };

export function AiWorkspace({ initialChats }: { initialChats: ChatSummary[] }) {
  const [chats, setChats] = useState(initialChats);
  const [chatId, setChatId] = useState<string | null>(null);
  const [agentType, setAgentType] = useState<AiAgentType>("assistant");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function selectChat(chat: ChatSummary) {
    setChatId(chat.id);
    setAgentType(chat.agent_type);
    const res = await fetch(`/api/ai/chats/${chat.id}/messages`);
    const data = await res.json();
    setMessages(data.map((m: { id: string; role: string; content: string }) => ({
      id: m.id,
      role: m.role,
      content: m.content,
    })));
  }

  function startNewChat() {
    setChatId(null);
    setMessages([]);
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setLoading(true);
    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: text };
    const assistantMsgId = crypto.randomUUID();
    setMessages((prev) => [...prev, userMsg, { id: assistantMsgId, role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId, agentType, message: text }),
      });

      const newChatId = res.headers.get("X-Chat-Id");
      if (newChatId && newChatId !== chatId) {
        setChatId(newChatId);
        setChats((prev) => [
          { id: newChatId, title: text.slice(0, 60), agent_type: agentType, updated_at: new Date().toISOString() },
          ...prev.filter((c) => c.id !== newChatId),
        ]);
      }

      if (!res.ok || !res.body) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Falha ao obter resposta");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantMsgId ? { ...m, content: acc } : m))
        );
      }
    } catch (err) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? { ...m, content: `Erro: ${err instanceof Error ? err.message : "desconhecido"}` }
            : m
        )
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid h-[calc(100svh-8rem)] grid-cols-1 gap-4 lg:grid-cols-[240px_1fr]">
      <div className="hidden flex-col gap-2 lg:flex">
        <Button variant="outline" onClick={startNewChat} className="justify-start">
          <Plus /> Nova conversa
        </Button>
        <ScrollArea className="flex-1">
          <div className="flex flex-col gap-1 pr-2">
            {chats.map((c) => (
              <button
                key={c.id}
                onClick={() => selectChat(c)}
                className={cn(
                  "truncate rounded-lg px-3 py-2 text-left text-sm hover:bg-secondary",
                  chatId === c.id && "bg-secondary font-medium"
                )}
              >
                {c.title}
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className="flex min-h-0 flex-col rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between gap-2 border-b border-border p-3">
          <Select value={agentType} onValueChange={(v) => setAgentType(v as AiAgentType)}>
            <SelectTrigger className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(AGENT_CONFIG).map(([key, cfg]) => (
                <SelectItem key={key} value={key}>
                  {cfg.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="hidden text-xs text-muted-foreground sm:block">
            {AGENT_CONFIG[agentType].description}
          </p>
        </div>

        <ScrollArea className="flex-1 p-4">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-muted-foreground">
              <Sparkles className="size-8 text-accent" />
              <p className="max-w-sm text-sm">
                Pergunte qualquer coisa sobre seus processos, peça para redigir uma petição ou gerar um
                relatório. O {AGENT_CONFIG[agentType].label} está pronto para ajudar.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <AnimatePresence initial={false}>
                {messages.map((m) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className={cn(
                      "max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm",
                      m.role === "user"
                        ? "ml-auto bg-accent text-accent-foreground"
                        : "mr-auto bg-secondary text-foreground"
                    )}
                  >
                    {m.content || <Loader2 className="size-4 animate-spin" />}
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={scrollRef} />
            </div>
          )}
        </ScrollArea>

        <div className="flex items-end gap-2 border-t border-border p-3">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Escreva sua mensagem..."
            rows={2}
            className="flex-1 resize-none"
          />
          <Button onClick={handleSend} disabled={loading || !input.trim()} size="icon">
            {loading ? <Loader2 className="animate-spin" /> : <Send />}
          </Button>
        </div>
      </div>
    </div>
  );
}
