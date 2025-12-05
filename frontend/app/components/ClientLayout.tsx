"use client";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import NavBar from "./NavBar";
import SideNav from "./SideNav";

type ClientLayoutProps = {
  children: ReactNode;
};

export default function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();
  const hideNav = pathname === "/login";

  return (
    <>
      {!hideNav && (
        <div className="app-shell">
          <NavBar />
          <div className="shell-body">
            <SideNav />
            <main className="page-content">{children}</main>
          </div>
        </div>
      )}
      {hideNav && <main className="page-content">{children}</main>}
    </>
  );
}
