export function fallbackChatTitle(message: string) {
  const normalized = message.trim().replace(/\s+/g, " ").replace(/[?!.]+$/, "");
  const lowerMessage = normalized.toLowerCase();

  if (lowerMessage.includes("batch") || lowerMessage.includes("disposition") || lowerMessage.includes("release")) {
    return "Batch release readiness";
  }
  if (lowerMessage.includes("deviation") || lowerMessage.includes("capa")) {
    return "Deviation and CAPA review";
  }
  if (lowerMessage.includes("sop") || lowerMessage.includes("procedure")) {
    return "SOP and procedure guidance";
  }
  if (lowerMessage.includes("audit") || lowerMessage.includes("inspection")) {
    return "Audit and inspection readiness";
  }

  const words = normalized.split(" ").filter(Boolean);
  return words.length > 6 ? `${words.slice(0, 6).join(" ")} question` : normalized || "Document library question";
}
