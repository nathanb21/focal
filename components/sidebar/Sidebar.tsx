"use client";

import { Check, FileText, Pencil, Plus, Search, Settings2, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { BrandMark } from "@/components/BrandMark";
import { Button } from "@/components/ui/button";
import { formatRelativeTime } from "@/lib/utils";
import type { StoredChat } from "@/lib/types";

type SidebarProps = {
  chats: StoredChat[];
  activeChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  onDeleteChat: (chatId: string) => void;
  onRenameChat: (chatId: string, title: string) => void;
};

export function Sidebar({ chats, activeChatId, onSelectChat, onNewChat, onDeleteChat, onRenameChat }: SidebarProps) {
  const [shortcutLabel, setShortcutLabel] = useState("⌘ K");
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const visibleChats = [...chats]
    .filter((chat) => chat.messages.some((message) => message.role === "user"))
    .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime())
    .filter((chat) => chat.title.toLowerCase().includes(searchQuery.trim().toLowerCase()));

  useEffect(() => {
    setShortcutLabel(/Mac|iPhone|iPad|iPod/.test(navigator.platform) ? "⌘ K" : "Ctrl K");
  }, []);

  useEffect(() => {
    if (editingChatId) inputRef.current?.focus();
  }, [editingChatId]);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  const beginRename = (chat: StoredChat) => {
    setEditingChatId(chat.id);
    setDraftTitle(chat.title);
  };

  const cancelRename = () => {
    setEditingChatId(null);
    setDraftTitle("");
  };

  const saveRename = (chatId: string) => {
    const title = draftTitle.trim();
    if (!title) return;
    onRenameChat(chatId, title);
    cancelRename();
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchQuery("");
  };

  return (
    <aside className="flex h-full w-[320px] shrink-0 flex-col overflow-y-auto border-r border-slate-200/80 bg-white">
      <div className="flex h-[80px] items-center gap-3 border-b border-slate-100 px-6">
        <BrandMark size="sm" />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[18px] font-semibold tracking-[-0.02em] text-slate-950">Focal</span>
          </div>
          <p className="truncate text-[12px] text-slate-400">Document intelligence</p>
        </div>
      </div>

      <div className="px-4 pt-5">
        <Button onClick={onNewChat} className="h-10 w-full justify-start px-3.5">
          <Plus className="h-4 w-4" strokeWidth={2.2} />
          New chat
          <span className="ml-auto hidden text-[11px] font-normal text-white/60 md:inline">{shortcutLabel}</span>
        </Button>
      </div>

      {searchOpen ? (
        <div className="flex items-center gap-2 px-6 pb-2 pt-8">
          <label className="flex min-w-0 flex-1 items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-blue-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100">
            <Search className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <input
              ref={searchInputRef}
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  event.preventDefault();
                  closeSearch();
                }
              }}
              placeholder="Search chats"
              className="min-w-0 flex-1 bg-transparent text-[12px] text-slate-700 outline-none placeholder:text-slate-400"
              aria-label="Search recent chats"
            />
          </label>
          <button
            onClick={closeSearch}
            className="rounded p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close chat search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between px-6 pb-2 pt-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Recent chats</p>
          <button
            onClick={() => setSearchOpen(true)}
            className="rounded p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label="Search chats"
            aria-expanded={searchOpen}
          >
            <Search className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <nav className="min-h-[180px] flex-1 overflow-y-auto px-4" aria-label="Recent chats">
        <div className="space-y-1">
          {visibleChats.length === 0 ? (
            <p className="px-2 py-4 text-xs leading-5 text-slate-400">
              {searchQuery.trim() ? "No chats found." : "Your recent questions will appear here."}
            </p>
          ) : (
            visibleChats.map((chat) => {
              const active = chat.id === activeChatId;
              return (
                <div key={chat.id} className={`group relative rounded-lg transition-colors ${active ? "bg-blue-50/90" : "hover:bg-slate-50"}`}>
                  {editingChatId === chat.id ? (
                    <form
                      onSubmit={(event) => {
                        event.preventDefault();
                        saveRename(chat.id);
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-3 pr-16"
                    >
                      <FileText className="h-3.5 w-3.5 shrink-0 text-blue-600" />
                      <input
                        ref={inputRef}
                        value={draftTitle}
                        onChange={(event) => setDraftTitle(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Escape") {
                            event.preventDefault();
                            cancelRename();
                          }
                        }}
                        className="min-w-0 flex-1 bg-transparent text-[13px] font-medium text-slate-900 outline-none"
                        aria-label={`Rename ${chat.title}`}
                      />
                    </form>
                  ) : (
                    <button
                      onClick={() => onSelectChat(chat.id)}
                      className="flex w-full items-start gap-2.5 rounded-lg px-3 py-3 pr-16 text-left text-slate-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-200"
                      aria-current={active ? "page" : undefined}
                    >
                      <FileText className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${active ? "text-blue-600" : "text-slate-400"}`} />
                      <span className="min-w-0 flex-1">
                        <span className={`block truncate text-[13px] font-medium ${active ? "text-slate-900" : "text-slate-700"}`}>
                          {chat.title}
                        </span>
                        <span className="mt-1 block text-[11px] text-slate-400">{formatRelativeTime(chat.updatedAt)}</span>
                      </span>
                    </button>
                  )}
                  {editingChatId === chat.id ? (
                    <>
                      <button
                        onClick={() => saveRename(chat.id)}
                        className="absolute right-8 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-emerald-600 transition-colors hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200"
                        aria-label="Save chat name"
                        title="Save chat name"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={cancelRename}
                        className="absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200"
                        aria-label="Cancel renaming"
                        title="Cancel"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          beginRename(chat);
                        }}
                        className="absolute right-8 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 opacity-0 transition-all hover:bg-slate-100 hover:text-slate-700 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200 group-hover:opacity-100"
                        aria-label={`Rename ${chat.title}`}
                        title="Rename conversation"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          onDeleteChat(chat.id);
                        }}
                        className="absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 opacity-0 transition-all hover:bg-red-50 hover:text-red-600 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200 group-hover:opacity-100"
                        aria-label={`Delete ${chat.title}`}
                        title="Delete conversation"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>
      </nav>

      <div className="border-t border-slate-100 p-4">
        <div className="mb-3 flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-slate-500 shadow-sm">
            <FileText className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium text-slate-700">Document library</p>
            <p className="truncate text-[11px] text-slate-400">12,842 indexed documents</p>
          </div>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        </div>
        <button className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-[12px] text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600">
          <Settings2 className="h-3.5 w-3.5" />
          Workspace settings
        </button>
      </div>
    </aside>
  );
}
