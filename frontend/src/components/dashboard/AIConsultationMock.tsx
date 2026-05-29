"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Send, Bot, ShieldCheck } from "lucide-react";
import { cn } from "../../lib/utils";

interface Message {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
}

export default function AIConsultationMock() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "msg-1",
      sender: "assistant",
      text: "Hello Sophia! I see you are on Day 22 (Luteal Phase) and logged mild cramps yesterday. I've formulated a self-care strategy. Ask me anything about managing symptoms, diet adjustments, or workout alignment today!",
      timestamp: "10:30 AM",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const replyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Scroll chats to bottom when messages change
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    return () => {
      if (replyTimerRef.current) {
        clearTimeout(replyTimerRef.current);
      }
    };
  }, []);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: "user",
      text: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    // Simulate smart local response based on keywords
    replyTimerRef.current = setTimeout(() => {
      setIsTyping(false);
      let replyText = "";
      const text = userMsg.text.toLowerCase();

      if (text.includes("cramp") || text.includes("pain") || text.includes("hurt")) {
        replyText =
          "To alleviate luteal cramps, try local heat therapy (heating pads) and gentle twists to relax pelvic muscles. Staying hydrated and adding anti-inflammatory foods (like walnuts or salmon) can also reduce prostaglandin-mediated contractions.";
      } else if (text.includes("tired") || text.includes("fatigue") || text.includes("sleep")) {
        replyText =
          "Feeling fatigued is completely normal on Day 22. Your body's core temperature is slightly higher, and progesterone levels are rising. Focus on quiet nesting, limit caffeine after 2 PM, and try magnesium glycinate before bed.";
      } else if (text.includes("eat") || text.includes("diet") || text.includes("craving") || text.includes("food")) {
        replyText =
          "Luteal cravings are real! Your metabolism rises by 100-300 calories in this phase. Balance blood sugar and satisfy cravings healthily by focusing on complex carbohydrates (like sweet potatoes, oats) and dark chocolate (70%+).";
      } else {
        replyText =
          "That is an excellent wellness query. Once the full-stack SheCare backend and ML-model layers are completed, I will analyze your historical cycles and vitals to give you deep, customized predictive health advice!";
      }

      const assistantMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        sender: "assistant",
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="glass-card rounded-3xl p-6 flex flex-col justify-between h-[450px] relative overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/40 pb-4 shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-primary to-secondary text-white shadow-sm">
            <Bot className="h-4.5 w-4.5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-muted-foreground tracking-wider">AI Assistant</span>
            <h3 className="text-xl font-bold mt-0.5 text-foreground font-sans">SheCare AI</h3>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground bg-muted border border-border/50 px-2 py-0.5 rounded-md font-semibold">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Private & HIPAA Compliant
        </div>
      </div>

      {/* Messages Scroll Panel */}
      <div className="flex-1 overflow-y-auto py-4 px-1 space-y-4 my-2 scrollbar-thin scrollbar-thumb-muted">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex flex-col max-w-[85%] rounded-2xl p-3.5 text-xs relative",
              msg.sender === "user"
                ? "bg-gradient-to-r from-primary to-secondary text-white ml-auto rounded-tr-none shadow-sm shadow-primary/5"
                : "bg-muted/40 border border-border/50 text-foreground mr-auto rounded-tl-none"
            )}
          >
            {msg.sender === "assistant" && (
              <div className="absolute -top-2 -left-2 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-tr from-primary to-secondary text-white border border-card shadow-sm">
                <Sparkles className="h-2.5 w-2.5" />
              </div>
            )}
            <p className="leading-relaxed">{msg.text}</p>
            <span
              className={cn(
                "text-[8px] mt-1.5 self-end block opacity-60",
                msg.sender === "user" ? "text-white/80" : "text-muted-foreground"
              )}
            >
              {msg.timestamp}
            </span>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-1.5 bg-muted/40 border border-border/50 text-foreground mr-auto max-w-[85%] rounded-2xl rounded-tl-none p-3.5 pl-6 relative">
            <div className="absolute -top-2 -left-2 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-tr from-primary to-secondary text-white border border-card shadow-sm">
              <Sparkles className="h-2.5 w-2.5" />
            </div>
            <div className="flex gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce" />
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.2s]" />
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input Message Form */}
      <form onSubmit={handleSend} className="flex gap-2 shrink-0 border-t border-border/40 pt-4">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask AI about cramps, fatigue, cravings, diet..."
          disabled={isTyping}
          className="flex-1 rounded-2xl border border-border bg-muted/10 px-4 py-3 text-xs outline-none focus:border-primary/80 focus:ring-1 focus:ring-primary/40 transition-all duration-150 text-foreground placeholder:text-muted-foreground/60"
        />
        <button
          type="submit"
          disabled={isTyping || !inputText.trim()}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-foreground text-background transition-transform active:scale-95 disabled:opacity-40 disabled:scale-100 cursor-pointer shadow-md"
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </motion.div>
  );
}
