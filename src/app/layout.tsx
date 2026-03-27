import type { Metadata } from "next";
import "./globals.css";
import AppNav from "@/components/common/AppNav";

export const metadata: Metadata = {
  title: "Algoviz - Algorithm Visualizer",
  description: "Interactive visualizations of sorting algorithms, graph algorithms, and performance analysis",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell min-h-screen">
          <div className="app-orb app-orb-a" />
          <div className="app-orb app-orb-b" />
          <div className="app-grid" />

          <AppNav />
          <main>{children}</main>

          <footer className="border-t border-white/10 bg-black/20 py-6 text-center text-sm text-slate-400">
            Algoviz - Developed by Gimbler
          </footer>
        </div>
      </body>
    </html>
  );
}
