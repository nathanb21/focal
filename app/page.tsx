"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { FocalChat } from "@/components/chat/FocalChat";
import { AnimatedSheet, SheetContent } from "@/components/ui/sheet";
import { loadChats, makeChat, saveChats, titleFromMessages } from "@/lib/storage";
import type { StoredChat, StoredMessage } from "@/lib/types";

export default function Home() {
  const [chats, setChats] = useState<StoredChat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const storedChats = loadChats();
    const initialChats = storedChats.length > 0 ? storedChats : [makeChat()];
    setChats(initialChats);
    setActiveChatId(initialChats[0]?.id ?? null);
    saveChats(initialChats);
    setHydrated(true);
  }, []);

  const activeChat = chats.find((chat) => chat.id === activeChatId) ?? null;

  const createChat = () => {
    const chat = makeChat();
    const nextChats = [chat, ...chats];
    setChats(nextChats);
    setActiveChatId(chat.id);
    saveChats(nextChats);
    setMobileSidebarOpen(false);
  };

  useEffect(() => {
    const handleGlobalShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        createChat();
      }
    };

    window.addEventListener("keydown", handleGlobalShortcut);
    return () => window.removeEventListener("keydown", handleGlobalShortcut);
  }, [chats]);

  const selectChat = (chatId: string) => {
    setActiveChatId(chatId);
    setMobileSidebarOpen(false);
  };

  const deleteChat = (chatId: string) => {
    const remainingChats = chats.filter((chat) => chat.id !== chatId);
    const nextChats = remainingChats.length > 0 ? remainingChats : [makeChat()];
    setChats(nextChats);
    saveChats(nextChats);

    if (activeChatId === chatId) {
      const nextActiveChat = nextChats.find((chat) => chat.messages.some((message) => message.role === "user")) ?? nextChats[0];
      setActiveChatId(nextActiveChat?.id ?? null);
    }
    setMobileSidebarOpen(false);
  };

  const renameChat = (chatId: string, title: string) => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    setChats((currentChats) => {
      const nextChats = currentChats.map((chat) =>
        chat.id === chatId ? { ...chat, title: trimmedTitle, titleEdited: true } : chat,
      );
      saveChats(nextChats);
      return nextChats;
    });
  };

  const updateGeneratedTitle = (chatId: string, title: string) => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    setChats((currentChats) => {
      const currentChat = currentChats.find((chat) => chat.id === chatId);
      if (!currentChat || currentChat.titleEdited) return currentChats;

      const nextChats = currentChats.map((chat) =>
        chat.id === chatId ? { ...chat, title: trimmedTitle, titleEdited: true } : chat,
      );
      saveChats(nextChats);
      return nextChats;
    });
  };

  const updateMessages = (chatId: string, messages: StoredMessage[]) => {
    setChats((currentChats) => {
      const currentChat = currentChats.find((chat) => chat.id === chatId);
      if (!currentChat || messagesMatch(currentChat.messages, messages)) return currentChats;

      const existingUserMessageIds = new Set(
        currentChat.messages.filter((message) => message.role === "user").map((message) => message.id),
      );
      const hasNewUserMessage = messages.some(
        (message) => message.role === "user" && !existingUserMessageIds.has(message.id),
      );
      const updatedChat = {
        ...currentChat,
        messages,
        title: currentChat.titleEdited ? currentChat.title : titleFromMessages(messages),
        updatedAt: hasNewUserMessage ? new Date().toISOString() : currentChat.updatedAt,
      };

      const remainingChats = currentChats.filter((chat) => chat.id !== chatId);
      const nextChats = hasNewUserMessage ? [updatedChat, ...remainingChats] : currentChats.map((chat) => chat.id === chatId ? updatedChat : chat);
      saveChats(nextChats);
      return nextChats;
    });
  };

  function messagesMatch(left: StoredMessage[], right: StoredMessage[]) {
    if (left.length !== right.length) return false;
    return left.every((message, index) => {
      const other = right[index];
      return other?.id === message.id && other.role === message.role && other.content === message.content;
    });
  }

  if (!hydrated) {
    return <main className="flex min-h-screen items-center justify-center bg-[hsl(var(--background))] text-sm text-slate-400">Loading workspace…</main>;
  }

  return (
    <main className="flex h-screen min-h-screen overflow-hidden bg-[hsl(var(--background))]">
      <div className="hidden h-full md:block">
        <Sidebar chats={chats} activeChatId={activeChatId} onSelectChat={selectChat} onNewChat={createChat} onDeleteChat={deleteChat} onRenameChat={renameChat} />
      </div>
      <AnimatedSheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent forceMount side="left" className="w-[286px] max-w-[286px] p-0">
          <Sidebar chats={chats} activeChatId={activeChatId} onSelectChat={selectChat} onNewChat={createChat} onDeleteChat={deleteChat} onRenameChat={renameChat} />
        </SheetContent>
      </AnimatedSheet>
      {activeChat ? (
        <FocalChat
          key={activeChat.id}
          chat={activeChat}
          onOpenSidebar={() => setMobileSidebarOpen(true)}
          onMessagesChange={(messages) => updateMessages(activeChat.id, messages)}
          onTitleChange={(title) => updateGeneratedTitle(activeChat.id, title)}
        />
      ) : (
        <div className="flex flex-1 items-center justify-center text-sm text-slate-400">Create a chat to get started.</div>
      )}
    </main>
  );
}
