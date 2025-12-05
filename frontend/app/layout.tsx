"use client";
import "./globals.css";
import type { ReactNode } from "react";
import NavBar from "./components/NavBar";
import { usePathname } from "next/navigation";

export const metadata = {
  title: "Student Result Tracking",
  description: "Performance analytics for schools",
};

function LayoutWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const hideNav = pathname === "/login";
  return (
    <html lang="en">
      <body>
        {!hideNav && <NavBar />}
        <div className="container">{children}</div>
      </body>
    </html>
  );
}

export default LayoutWrapper;
