"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import JobCard from "@/components/jobs/JobCard";
import { ArrowRight, Bookmark } from "lucide-react";
import type { Job } from "@/types";

interface Props {
  latestJobs: Job[];
  savedJobsData: { jobs: Job }[];
  userId: string;
}

export default function DashboardClient({ latestJobs, savedJobsData, userId }: Props) {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<"latest" | "saved">("latest");
  const [savedIds, setSavedIds] = useState<Set<string>>(
    new Set(savedJobsData.map((s) => s.jobs?.id).filter(Boolean))
  );
  const [savedJobs, setSavedJobs] = useState<Job[]>(
    savedJobsData.map((s) => s.jobs).filter(Boolean)
  );

  async function toggleSave(jobId: string) {
    if (savedIds.has(jobId)) {
      await supabase.from("saved_jobs").delete().eq("member_id", userId).eq("job_id", jobId);
      setSavedIds((prev) => { const n = new Set(prev); n.delete(jobId); return n; });
      setSavedJobs((prev) => prev.filter((j) => j.id !== jobId));
    } else {
      await supabase.from("saved_jobs").insert({ member_id: userId, job_id: jobId });
      setSavedIds((prev) => new Set([...prev, jobId]));
    }
  }

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-4">
        <button
          onClick={() => setActiveTab("latest")}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "latest" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
        >
          Latest Jobs
        </button>
        <button
          onClick={() => setActiveTab("saved")}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${activeTab === "saved" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
        >
          <Bookmark size={14} /> Saved {savedIds.size > 0 && `(${savedIds.size})`}
        </button>
      </div>

      {activeTab === "latest" && (
        <div>
          {latestJobs.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-3xl mb-2">💼</p>
              <p className="font-semibold text-slate-700">No jobs yet</p>
              <p className="text-sm text-slate-500">Check back soon — new opportunities are posted regularly.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {latestJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    isSaved={savedIds.has(job.id)}
                    onToggleSave={toggleSave}
                  />
                ))}
              </div>
              <div className="mt-4 text-center">
                <Link href="/jobs" className="btn-secondary text-sm py-2.5">
                  View All Jobs <ArrowRight size={16} />
                </Link>
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === "saved" && (
        <div>
          {savedJobs.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-3xl mb-2">🔖</p>
              <p className="font-semibold text-slate-700">No saved jobs yet</p>
              <p className="text-sm text-slate-500 mb-4">Tap the bookmark icon on any job listing to save it here.</p>
              <Link href="/jobs" className="btn-primary text-sm py-2.5">
                Browse Jobs <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {savedJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  isSaved={savedIds.has(job.id)}
                  onToggleSave={toggleSave}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
