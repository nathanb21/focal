## Project

Build **Focal**, a tool that lets regulated-industry teams (pharma/genomics QA, regulatory affairs) ask plain-English questions of their internal document library and get sourced, cited answers. This is a **fictional demo** — there is no real document backend. All answers and citations are fabricated by the LLM via a system prompt. The point of the build is the product experience: chat UI, structured citations, and a citation detail panel.

## Stack

- Next.js (latest, App Router - though we're only building 1 page, TypeScript)
- Tailwind CSS
- shadcn/ui — **light mode only**, no dark mode toggle
- Vercel AI SDK (`ai` package) for streaming chat, using the Vercel AI gateway (for the free $5 token allowance, cheap model where possible as we're just making up data!)
- No database. No auth. Chat history persisted to `localStorage` only.
- Deploy target: Vercel. Repo hosted on GitHub.

## Theme

- shadcn base theme, customised:
  - **Primary**: a blue (pick a single confident mid-blue, not electric/neon — something like a `blue-600`-class value, define as a CSS variable so it's easy to swap)
  - **Secondary/neutral**: grey scale for backgrounds, borders, muted text
  - Keep it restrained — this is an enterprise compliance tool, not a consumer product. No gradients, no dark mode.

## Layout — app shell

Two-pane shell, no page navigation beyond this:

- **Left sidebar** (fixed width, collapsible optional):
  - "New chat" button at top
  - List of past chats below, each showing a title (derive from first user message, truncated) and relative timestamp
  - Clicking a chat loads it into the main pane
  - Active chat is visually highlighted
  - Chats persisted in `localStorage` (key namespaced, e.g. `focal:chats`), so history survives a refresh. No backend.
- **Main pane**:
  - Message thread (user + assistant messages)
  - Input box pinned to bottom, standard chat UX (Enter to send, Shift+Enter for newline, disabled while streaming)
  - Assistant messages render with inline citation markers (see below)

## Chat / AI integration

- Use the Vercel AI SDK's streaming chat hook against a Next.js route handler (`app/api/chat/route.ts`).
- **System prompt** (bake this in, adjust wording as needed): the model is "Focal," an assistant that answers questions from a fictional company's regulatory document library (batch records, deviation reports, SOPs, validation protocols, audit logs). It should **invent plausible answers and invent plausible supporting documents** — realistic pharma/genomics QA document IDs, titles, and short quoted-sounding snippets — since there is no real document store. It should never say it's making things up; it should respond as if the retrieval is real. Keep answers concise (2–5 sentences) and always ground claims in at least one fabricated citation.
- **Structured output**: the assistant must respond in JSON matching a fixed schema (use the AI SDK's structured output / tool-call support, or a strict JSON-mode system instruction with a parser) so the UI can render text and citation markers separately from the citation metadata. Suggested shape:

```ts
type FocalResponse = {
  answer: {
    // The answer broken into segments so citations can be inlined
    // at the right point in the text.
    segments: Array<
      | { type: "text"; content: string }
      | { type: "citation"; citationId: string; label: string } // label = short visible tag, e.g. "BR-2291"
    >;
  };
  citations: Array<{
    id: string;              // matches citationId above
    documentId: string;      // e.g. "BR-2291"
    documentType: string;    // e.g. "Batch Record", "Deviation Report", "SOP", "Audit Trail"
    title: string;           // e.g. "Batch Record — Lot 4471-B Final Release"
    excerpt: string;         // short fabricated quoted snippet, 1-2 sentences
    page?: string;           // e.g. "p. 12"
    department?: string;     // e.g. "Quality Assurance"
    lastUpdated?: string;    // ISO date, fabricated
    confidence?: "high" | "medium" | "low"; // fabricated relevance signal
  }>;
};
```

- Validate/parse the model's JSON on the server before streaming/returning it to the client; if parsing fails, retry once or fall back to a plain-text error message in the thread rather than crashing the UI.

## Citations UI

- Inline citations render as small tappable tags/badges within the assistant's message text (not full sentences — short labels like the `documentId`, e.g. `BR-2291`).
- Clicking a citation tag opens a **right-hand side panel** (use shadcn `Sheet`) showing that citation's metadata: document title, type, excerpt, page, department, last updated, confidence.
- Include a button in the panel labeled **"Open source location"** — this is a **stub only**: on click, either disable it with a tooltip ("Not available in this demo") or show a toast saying the action isn't implemented. Do not build real navigation or a real document viewer.
- If the same citation is referenced twice in a chat, reuse the same citation object rather than generating a duplicate.

## Explicit non-goals (tell Codex not to build these)

- No real document retrieval, no vector store, no file uploads
- No authentication or multi-user support
- No database — `localStorage` only, and it's fine if clearing browser storage clears history
- No dark mode / theme toggle
- No mobile-specific layout work beyond basic responsiveness (desktop-first)
- No unit tests or any kind of testing; this is a PoC, so no testing is required

## Deliverable structure (suggested)

```
app/
  layout.tsx
  page.tsx                 // renders the app shell
  api/chat/route.ts        // streaming endpoint, system prompt lives here
components/
  sidebar/
    ChatList.tsx
    NewChatButton.tsx
  chat/
    MessageThread.tsx
    MessageBubble.tsx
    ChatInput.tsx
    CitationTag.tsx
    CitationPanel.tsx      // shadcn Sheet
lib/
  storage.ts                // localStorage read/write helpers for chats
  types.ts                  // FocalResponse and related types
```

Keep components small and readable — this is a portfolio/demo piece, code should be clean enough to hand to another engineer, not over-engineered for a feature set this small.

The application should reflow for mobile screen format.
