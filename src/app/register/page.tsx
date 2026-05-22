"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Eye, EyeOff, CheckCircle } from "lucide-react";
import { EMPLOYMENT_STATUS_OPTIONS, WORK_MODE_OPTIONS } from "@/lib/utils";

interface RegisterForm {
  full_name: string;
  phone: string;
  email: string;
  password: string;
  area_of_residence: string;
  parish_unit: string;
  profession: string;
  employment_status: string;
  preferred_work_mode: string;
  consent_updates: boolean;
}

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    defaultValues: { consent_updates: true },
  });

  async function onSubmit(data: RegisterForm) {
    setLoading(true);
    setError("");

    const { error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.full_name,
          phone: data.phone,
          area_of_residence: data.area_of_residence,
          parish_unit: data.parish_unit,
          profession: data.profession,
          employment_status: data.employment_status,
          preferred_work_mode: data.preferred_work_mode,
          consent_updates: data.consent_updates,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    router.push("/register/career-path");
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="max-w-md mx-auto">
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

        {/* Progress */}
        <div className="flex items-center gap-2 mb-6">
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-full bg-brand-700 text-white text-xs font-bold flex items-center justify-center">1</div>
            <span className="text-sm font-medium text-brand-700">Basic Info</span>
          </div>
          <div className="flex-1 h-0.5 bg-slate-200" />
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-400 text-xs font-bold flex items-center justify-center">2</div>
            <span className="text-sm text-slate-400">Career Path</span>
          </div>
        </div>

        <div className="card p-6">
          <h1 className="text-xl font-bold text-slate-900 mb-1">Create your account</h1>
          <p className="text-sm text-slate-500 mb-6">Quick and easy — just the essentials to get started.</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">Full Name *</label>
              <input
                {...register("full_name", { required: "Full name is required" })}
                className="input-field"
                placeholder="Adaeze Okonkwo"
              />
              {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>}
            </div>

            <div>
              <label className="label">Phone Number *</label>
              <input
                {...register("phone", { required: "Phone number is required" })}
                type="tel"
                className="input-field"
                placeholder="080xxxxxxxx"
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
            </div>

            <div>
              <label className="label">Email Address *</label>
              <input
                {...register("email", {
                  required: "Email is required",
                  pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email" },
                })}
                type="email"
                className="input-field"
                placeholder="you@example.com"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label">Password *</label>
              <div className="relative">
                <input
                  {...register("password", {
                    required: "Password is required",
                    minLength: { value: 6, message: "Minimum 6 characters" },
                  })}
                  type={showPw ? "text" : "password"}
                  className="input-field pr-12"
                  placeholder="Min. 6 characters"
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

            <div>
              <label className="label">Area / Parish / Unit <span className="text-slate-400 font-normal">(optional)</span></label>
              <input
                {...register("area_of_residence")}
                className="input-field"
                placeholder="e.g. Ikeja, Surulere"
              />
            </div>

            <div>
              <label className="label">Parish / Unit <span className="text-slate-400 font-normal">(optional)</span></label>
              <input
                {...register("parish_unit")}
                className="input-field"
                placeholder="e.g. Holy Cross Parish"
              />
            </div>

            <div>
              <label className="label">Profession / Field of Work <span className="text-slate-400 font-normal">(optional)</span></label>
              <input
                {...register("profession")}
                className="input-field"
                placeholder="e.g. Software Engineer, Accountant"
              />
            </div>

            <div>
              <label className="label">Employment Status <span className="text-slate-400 font-normal">(optional)</span></label>
              <select {...register("employment_status")} className="input-field">
                <option value="">Select status</option>
                {EMPLOYMENT_STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Preferred Work Mode <span className="text-slate-400 font-normal">(optional)</span></label>
              <select {...register("preferred_work_mode")} className="input-field">
                <option value="">Select preference</option>
                {WORK_MODE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                {...register("consent_updates")}
                type="checkbox"
                className="w-5 h-5 rounded accent-brand-700 mt-0.5 shrink-0"
              />
              <span className="text-sm text-slate-600">
                I agree to receive career opportunities and community updates from LP9 YPC. You can unsubscribe anytime.
              </span>
            </label>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading
                ? <><Loader2 size={18} className="animate-spin" /> Creating account…</>
                : <><CheckCircle size={18} /> Continue to Career Path</>
              }
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-5">
            Already a member?{" "}
            <Link href="/login" className="text-brand-700 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
