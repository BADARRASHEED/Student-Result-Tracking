"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/students", label: "Students" },
  { href: "/marks/entry", label: "Marks Entry" },
  { href: "/analytics", label: "Analytics" },
];

export default function SideNav() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <h4>Quick navigate</h4>
      <div className="nav-links">
        {links.map((link) => (
          <Link
            key={link.href}
            className={`nav-link ${pathname.startsWith(link.href) ? "active" : ""}`}
            href={link.href}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </aside>
  );
}
