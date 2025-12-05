import "./globals.css";
import type { ReactNode } from "react";
import ClientLayout from "./components/ClientLayout";

export const metadata = {
  title: "Student Result Tracking",
  description: "Performance analytics for schools",
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
