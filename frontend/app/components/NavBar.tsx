"use client";
import Link from "next/link";
import { clearAuth, getName, getRole } from "../lib/api";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function NavBar() {
  const [name, setName] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    setName(getName());
    setRole(getRole());
  }, []);

  const logout = () => {
    clearAuth();
    router.push("/login");
  };

  return (
    <nav>
      <div>
        <Link href="/dashboard">Home</Link>
        <Link href="/students">Students</Link>
        <Link href="/marks/entry">Marks</Link>
        <Link href="/analytics">Analytics</Link>
      </div>
      <div>
        {role && <span style={{ marginRight: "1rem" }}>{name} ({role})</span>}
        <button className="button" onClick={logout}>Logout</button>
      </div>
    </nav>
  );
}
