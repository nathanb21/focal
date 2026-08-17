import type { StoredChat } from "./types";
import { fallbackChatTitle } from "./title";

export const STORAGE_KEY = "focal:chats";

export function loadChats(): StoredChat[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredChat[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((chat) => chat.id !== "chat-sample-01")
      .map((chat) => {
        const hasUserMessage = chat.messages.some((message) => message.role === "user");
        return hasUserMessage && !chat.titleEdited ? { ...chat, title: titleFromMessages(chat.messages) } : chat;
      });
  } catch {
    return [];
  }
}

export function saveChats(chats: StoredChat[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
}

export function makeChat(): StoredChat {
  const now = new Date().toISOString();
  return {
    id: `chat-${Date.now()}`,
    title: "New conversation",
    createdAt: now,
    updatedAt: now,
    messages: [],
  };
}

export function titleFromMessages(messages: StoredChat["messages"]) {
  const firstUserMessage = messages.find((message) => message.role === "user")?.content.trim();
  if (!firstUserMessage) return "New conversation";
  return fallbackChatTitle(firstUserMessage);
}
