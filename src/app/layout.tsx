import type { Metadata } from "next";
import "./globals.css";
import AppNav from "@/components/common/AppNav";

export const metadata: Metadata = {
  title: "Algoviz - Algorithm Visualizer",
  description: "Interactive visualizations of sorting algorithms, graph algorithms, and performance analysis",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='75' font-size='75' fill='%233b82f6'>∑</text></svg>",
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
            Algoviz Atlas - Interactive algorithm maps and visual journeys
          </footer>
        </div>
      </body>
    </html>
  );
}
