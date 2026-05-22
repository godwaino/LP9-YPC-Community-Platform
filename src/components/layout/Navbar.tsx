"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Menu, X, Briefcase, User, LayoutDashboard, LogOut, Shield } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface NavbarProps {
  user?: { id: string; email?: string } | null;
  isAdmin?: boolean;
}

export default function Navbar({ user, isAdmin }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const navLinks = [
    { href: "/jobs", label: "Jobs", icon: Briefcase },
    { href: "/about", label: "About", icon: null },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-brand-700 flex items-center justify-center">
              <span className="text-white font-black text-sm">LP9</span>
            </div>
            <div className="hidden sm:block">
              <p className="font-bold text-slate-900 text-sm leading-none">LP9 YPC</p>
              <p className="text-xs text-slate-500 leading-none mt-0.5">Young Professionals Club</p>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  pathname === href
                    ? "bg-brand-50 text-brand-700"
                    : "text-slate-600 hover:text-brand-700 hover:bg-slate-50"
                )}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                {isAdmin && (
                  <Link href="/admin" className="btn-ghost text-sm py-2">
                    <Shield size={16} /> Admin
                  </Link>
                )}
                <Link href="/dashboard" className="btn-ghost text-sm py-2">
                  <LayoutDashboard size={16} /> Dashboard
                </Link>
                <button onClick={handleSignOut} className="btn-ghost text-sm py-2 text-slate-500">
                  <LogOut size={16} /> Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="btn-ghost text-sm py-2">
                  Sign in
                </Link>
                <Link href="/register" className="btn-primary text-sm py-2 px-4">
                  <User size={16} /> Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-3 space-y-1">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium",
                pathname === href
                  ? "bg-brand-50 text-brand-700"
                  : "text-slate-700 hover:bg-slate-50"
              )}
            >
              {label}
            </Link>
          ))}
          <div className="pt-2 border-t border-slate-100 space-y-1">
            {user ? (
              <>
                {isAdmin && (
                  <Link href="/admin" onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-brand-700 hover:bg-brand-50">
                    <Shield size={16} /> Admin Dashboard
                  </Link>
                )}
                <Link href="/dashboard" onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50">
                  <LayoutDashboard size={16} /> My Dashboard
                </Link>
                <button onClick={() => { setOpen(false); handleSignOut(); }} className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-50">
                  <LogOut size={16} /> Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50">
                  Sign in
                </Link>
                <Link href="/register" onClick={() => setOpen(false)} className="btn-primary w-full justify-center mt-1">
                  <User size={16} /> Register Free
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
