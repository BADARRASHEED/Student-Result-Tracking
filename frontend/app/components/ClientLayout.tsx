"use client";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import NavBar from "./NavBar";

type ClientLayoutProps = {
  children: ReactNode;
};

export default function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();
  const hideNav = pathname === "/login";

  return (
    <>
      {!hideNav && <NavBar />}
      <div className="container">{children}</div>
    </>
  );
}
