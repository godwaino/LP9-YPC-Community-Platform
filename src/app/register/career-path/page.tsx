"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, CheckCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CareerPath } from "@/types";

export default function CareerPathPage() {
  const router = useRouter();
  const supabase = createClient();
  const [careerPaths, setCareerPaths] = useState<CareerPath[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUserId(user.id);

      const { data } = await supabase.from("career_paths").select("*").order("name");
      setCareerPaths(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function handleSave() {
    if (!userId) return;
    if (selected.size === 0) { setError("Please select at least one career path."); return; }
    setSaving(true);
    setError("");

    const rows = Array.from(selected).map((cid) => ({
      member_id: userId,
      career_path_id: cid,
    }));

    const { error: err } = await supabase.from("member_career_paths").upsert(rows, { onConflict: "member_id,career_path_id" });
    if (err) { setError(err.message); setSaving(false); return; }

    router.push("/dashboard?welcome=1");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-brand-700" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="max-w-xl mx-auto">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-6">
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-full bg-green-500 text-white text-xs flex items-center justify-center">
              <CheckCircle size={14} />
            </div>
            <span className="text-sm text-slate-400">Basic Info</span>
          </div>
          <div className="flex-1 h-0.5 bg-brand-700" />
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-full bg-brand-700 text-white text-xs font-bold flex items-center justify-center">2</div>
            <span className="text-sm font-medium text-brand-700">Career Path</span>
          </div>
        </div>

        <div className="card p-6">
          <h1 className="text-xl font-bold text-slate-900 mb-1">Choose your career path</h1>
          <p className="text-sm text-slate-500 mb-6">
            Select one or more areas that match your profession or interests. We&apos;ll use this to show you relevant opportunities.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 mb-6">
            {careerPaths.map((cp) => {
              const isSelected = selected.has(cp.id);
              return (
                <button
                  key={cp.id}
                  type="button"
                  onClick={() => toggle(cp.id)}
                  className={cn(
                    "relative p-4 rounded-2xl border-2 text-left transition-all active:scale-95",
                    isSelected
                      ? "border-brand-700 bg-brand-50"
                      : "border-slate-200 bg-white hover:border-brand-300"
                  )}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-brand-700 flex items-center justify-center">
                      <CheckCircle size={12} className="text-white fill-white" />
                    </div>
                  )}
                  <span className="text-2xl block mb-2">{cp.icon}</span>
                  <span className={cn("text-xs font-semibold leading-tight block", isSelected ? "text-brand-800" : "text-slate-700")}>
                    {cp.name}
                  </span>
                </button>
              );
            })}
          </div>

          {selected.size > 0 && (
            <p className="text-sm text-brand-700 font-medium mb-4 text-center">
              {selected.size} path{selected.size > 1 ? "s" : ""} selected
            </p>
          )}

          <button onClick={handleSave} disabled={saving} className="btn-primary w-full">
            {saving
              ? <><Loader2 size={18} className="animate-spin" /> Saving…</>
              : <>Go to Dashboard <ArrowRight size={18} /></>
            }
          </button>

          <button
            type="button"
            onClick={() => router.push("/dashboard?welcome=1")}
            className="w-full text-center text-sm text-slate-400 hover:text-slate-600 mt-3 py-2"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
