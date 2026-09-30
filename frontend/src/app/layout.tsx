import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import AmbientCanvas from "@/components/AmbientCanvas";

export const metadata: Metadata = {
  title: "Micro Drama Studio",
  description: "AI creative production studio — craft cinematic micro-dramas with AI",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AmbientCanvas />
        <div className="studio-shell relative z-10 min-h-screen">
          <Topbar />
          <div className="flex min-h-[calc(100vh-4rem)]">
            <Sidebar />
            <main className="studio-main min-w-0 flex-1 overflow-x-hidden px-5 py-8 md:px-8 lg:px-12">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
