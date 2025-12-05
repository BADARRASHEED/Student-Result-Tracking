import "./globals.css";
import type { ReactNode } from "react";
import ClientLayout from "./components/ClientLayout";

export const metadata = {
  title: "Student Result Tracking & Performance Analytics",
  description: "Streamlined academic insights with a clean, professional dashboard",
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
