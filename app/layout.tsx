"use client";

import "./globals.css";
import { ThemeProvider, SidebarProvider, SidebarInset } from "@kognitos/lattice";
import { ChatProvider } from "@/lib/chat/chat-context";
import { AppSidebar } from "@/app/components/app-sidebar";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider defaultTheme="light">
          <ChatProvider>
            <SidebarProvider open={true}>
              <AppSidebar />
              <SidebarInset>
                <div className="flex-1 overflow-auto">{children}</div>
              </SidebarInset>
            </SidebarProvider>
          </ChatProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
