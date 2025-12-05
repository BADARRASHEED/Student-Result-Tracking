import "./globals.css";
import type { ReactNode } from "react";
import ClientLayout from "./components/ClientLayout";

export const metadata = {
  title: "Sajana – Student Result Tracking & Performance Analytics System",
  description: "Sajana Analytics: Designed and Developed by Sajana",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
