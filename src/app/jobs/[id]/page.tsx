import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ArrowLeft, ExternalLink, MapPin, Calendar, Briefcase } from "lucide-react";
import { formatDate, isExpired, WORK_MODE_LABELS, ENGAGEMENT_LABELS, LEVEL_LABELS } from "@/lib/utils";
import type { Job } from "@/types";

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data: p } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    isAdmin = p?.role === "admin";
  }

  const { data: job } = await supabase
    .from("jobs")
    .select("*, career_paths(*)")
    .eq("id", id)
    .single() as { data: Job | null };

  if (!job) notFound();

  const expired = isExpired(job.deadline);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar user={user} isAdmin={isAdmin} />

      <main className="flex-1 max-w-3xl mx-auto px-4 py-8 w-full">
        <Link href="/jobs" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-brand-700 mb-6 transition-colors">
          <ArrowLeft size={16} /> Back to Jobs
        </Link>

        <div className="card p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-black text-slate-900 leading-tight mb-1">{job.title}</h1>
                <p className="text-brand-700 font-semibold text-lg">{job.company}</p>
              </div>
              {job.career_paths && (
                <div className="text-center shrink-0">
                  <span className="text-3xl">{job.career_paths.icon}</span>
                  <p className="text-xs text-slate-500 mt-1 max-w-[80px] leading-tight">{job.career_paths.name}</p>
                </div>
              )}
            </div>
          </div>

          {/* Key details */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {job.location && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <MapPin size={16} className="text-brand-600 shrink-0" />
                {job.location}
              </div>
            )}
            {job.work_mode && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Briefcase size={16} className="text-brand-600 shrink-0" />
                {WORK_MODE_LABELS[job.work_mode] ?? job.work_mode}
              </div>
            )}
            {job.engagement_type && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span className="text-brand-600">⏱</span>
                {ENGAGEMENT_LABELS[job.engagement_type] ?? job.engagement_type}
              </div>
            )}
            {job.experience_level && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span className="text-brand-600">📈</span>
                {LEVEL_LABELS[job.experience_level] ?? job.experience_level}
              </div>
            )}
            {job.salary_range && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span className="text-brand-600">💰</span>
                {job.salary_range}
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <Calendar size={16} className="text-brand-600 shrink-0" />
              <span className={expired ? "text-red-500 font-medium" : "text-slate-600"}>
                {expired ? "Expired" : `Deadline: ${formatDate(job.deadline)}`}
              </span>
            </div>
          </div>

          {/* Apply CTA - most prominent */}
          <div className="bg-brand-50 border border-brand-200 rounded-2xl p-5 mb-6 text-center">
            <p className="text-sm text-slate-600 mb-3">
              {expired
                ? "This listing has expired. Check other opportunities below."
                : "Tap the button below to go directly to the application page."}
            </p>
            <a
              href={job.application_link}
              target="_blank"
              rel="noopener noreferrer"
              className={`btn-primary text-base py-4 px-8 w-full sm:w-auto ${expired ? "opacity-50 pointer-events-none" : ""}`}
            >
              <ExternalLink size={18} />
              {expired ? "Application Closed" : "Apply Now — Open Application Page"}
            </a>
            {!expired && (
              <p className="text-xs text-slate-400 mt-2">Opens in a new tab</p>
            )}
          </div>

          {/* Description */}
          {job.description && (
            <div className="mb-6">
              <h2 className="font-bold text-slate-900 mb-3">About This Role</h2>
              <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{job.description}</div>
            </div>
          )}

          {/* Footer */}
          <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
            <p className="text-xs text-slate-400">
              Posted {new Date(job.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
            </p>
            <Link href="/jobs" className="btn-ghost text-sm">
              <ArrowLeft size={16} /> All Jobs
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
