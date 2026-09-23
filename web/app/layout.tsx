import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";

// Display face: Breno's name and the chat heading -- the one place the page
// speaks in a personal, editorial voice rather than a technical one.
const displayFont = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
});

// Body/UI face: everything else (chat text, labels, buttons, contact list).
const bodyFont = IBM_Plex_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

// Citations and any inline stack/tool names -- functional, not decorative:
// it marks text that's a verifiable, structured reference (see
// app/components/Chat.tsx), not a generic "data label" treatment.
const monoFont = IBM_Plex_Mono({
  variable: "--font-mono-data",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Ask Breno",
  description: "Ask about Breno Zamponi's experience, projects and stack — every answer cites its source.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt"
      className={`${displayFont.variable} ${bodyFont.variable} ${monoFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
