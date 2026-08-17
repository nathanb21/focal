import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Focal — Document intelligence for regulated teams",
  description: "A sourced-answer workspace for regulated-industry document libraries.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
