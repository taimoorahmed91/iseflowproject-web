import type { Metadata } from "next";
import "./globals.css";
import { DataProvider } from "@/lib/DataContext";

export const metadata: Metadata = {
  title: "ISE Policy Visualizer",
  description: "Visualize Cisco ISE network access policies as interactive flowcharts",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <DataProvider>{children}</DataProvider>
      </body>
    </html>
  );
}
