"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Eye, EyeOff } from "lucide-react";

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();

  async function onSubmit(data: LoginForm) {
    setLoading(true);
    setError("");
    const { error: err } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-slate-50">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 mb-8">
        <div className="w-10 h-10 rounded-xl bg-brand-700 flex items-center justify-center">
          <span className="text-white font-black text-sm">LP9</span>
        </div>
        <div>
          <p className="font-bold text-slate-900 leading-none">LP9 YPC</p>
          <p className="text-xs text-slate-500 leading-none mt-0.5">Young Professionals Club</p>
        </div>
      </Link>

      <div className="w-full max-w-sm card p-6">
        <h1 className="text-xl font-bold text-slate-900 mb-1">Welcome back</h1>
        <p className="text-sm text-slate-500 mb-6">Sign in to your LP9 YPC account.</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Email address</label>
            <input
              {...register("email", { required: "Email is required" })}
              type="email"
              className="input-field"
              placeholder="you@example.com"
              autoComplete="email"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="label">Password</label>
            <div className="relative">
              <input
                {...register("password", { required: "Password is required" })}
                type={showPw ? "text" : "password"}
                className="input-field pr-12"
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? <><Loader2 size={18} className="animate-spin" /> Signing in…</> : "Sign In"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-5">
          Not a member yet?{" "}
          <Link href="/register" className="text-brand-700 font-semibold hover:underline">
            Register free
          </Link>
        </p>
      </div>
    </div>
  );
}
