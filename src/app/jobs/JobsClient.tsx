"use client";

import { useState, useMemo } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import JobCard from "@/components/jobs/JobCard";
import { cn } from "@/lib/utils";
import type { Job, CareerPath } from "@/types";

interface Props {
  initialJobs: Job[];
  careerPaths: CareerPath[];
  userId: string | null;
  initialSavedIds: string[];
}

const WORK_MODES = ["remote", "onsite", "hybrid"] as const;
const ENGAGEMENT_TYPES = ["full-time", "part-time", "contract", "internship", "graduate-trainee"] as const;
const LEVELS = ["entry", "mid", "senior"] as const;

export default function JobsClient({ initialJobs, careerPaths, userId, initialSavedIds }: Props) {
  const supabase = createClient();
  const [search, setSearch] = useState("");
  const [filterMode, setFilterMode] = useState<string[]>([]);
  const [filterEngagement, setFilterEngagement] = useState<string[]>([]);
  const [filterLevel, setFilterLevel] = useState<string[]>([]);
  const [filterCareer, setFilterCareer] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set(initialSavedIds));

  function toggleArr<T extends string>(arr: T[], setArr: (v: T[]) => void, val: T) {
    setArr(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);
  }

  const filtered = useMemo(() => {
    return initialJobs.filter((job) => {
      if (search) {
        const q = search.toLowerCase();
        if (
          !job.title.toLowerCase().includes(q) &&
          !job.company.toLowerCase().includes(q) &&
          !(job.description?.toLowerCase().includes(q)) &&
          !(job.location?.toLowerCase().includes(q))
        ) return false;
      }
      if (filterMode.length && job.work_mode && !filterMode.includes(job.work_mode)) return false;
      if (filterEngagement.length && job.engagement_type && !filterEngagement.includes(job.engagement_type)) return false;
      if (filterLevel.length && job.experience_level && !filterLevel.includes(job.experience_level)) return false;
      if (filterCareer.length && job.career_path_id && !filterCareer.includes(job.career_path_id)) return false;
      return true;
    });
  }, [initialJobs, search, filterMode, filterEngagement, filterLevel, filterCareer]);

  async function toggleSave(jobId: string) {
    if (!userId) { window.location.href = "/login"; return; }
    if (savedIds.has(jobId)) {
      await supabase.from("saved_jobs").delete().eq("member_id", userId).eq("job_id", jobId);
      setSavedIds((prev) => { const n = new Set(prev); n.delete(jobId); return n; });
    } else {
      await supabase.from("saved_jobs").insert({ member_id: userId, job_id: jobId });
      setSavedIds((prev) => new Set([...prev, jobId]));
    }
  }

  const hasFilters = filterMode.length + filterEngagement.length + filterLevel.length + filterCareer.length > 0;

  function clearFilters() {
    setFilterMode([]); setFilterEngagement([]); setFilterLevel([]); setFilterCareer([]);
  }

  function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
    return (
      <button
        onClick={onClick}
        className={cn(
          "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
          active ? "bg-brand-700 text-white border-brand-700" : "bg-white text-slate-600 border-slate-200 hover:border-brand-400"
        )}
      >
        {label}
      </button>
    );
  }

  return (
    <div>
      {/* Search + Filter toggle */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
            placeholder="Search jobs, companies, keywords…"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X size={16} />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "flex items-center gap-2 px-4 py-3 rounded-xl border font-medium text-sm transition-colors min-h-[48px]",
            showFilters || hasFilters
              ? "bg-brand-700 text-white border-brand-700"
              : "bg-white text-slate-600 border-slate-300 hover:border-brand-400"
          )}
        >
          <SlidersHorizontal size={16} />
          Filters
          {hasFilters && (
            <span className="bg-white text-brand-700 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
              {filterMode.length + filterEngagement.length + filterLevel.length + filterCareer.length}
            </span>
          )}
        </button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="card p-4 mb-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 text-sm">Filter Jobs</h3>
            {hasFilters && (
              <button onClick={clearFilters} className="text-xs text-brand-700 hover:underline">Clear all</button>
            )}
          </div>

          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Work Mode</p>
            <div className="flex flex-wrap gap-2">
              {WORK_MODES.map((m) => (
                <FilterChip key={m} label={m.charAt(0).toUpperCase() + m.slice(1)} active={filterMode.includes(m)} onClick={() => toggleArr(filterMode as string[], setFilterMode, m)} />
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Type</p>
            <div className="flex flex-wrap gap-2">
              {ENGAGEMENT_TYPES.map((e) => (
                <FilterChip key={e} label={e.replace("-", " ").replace(/\b\w/g, c => c.toUpperCase())} active={filterEngagement.includes(e)} onClick={() => toggleArr(filterEngagement as string[], setFilterEngagement, e)} />
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Level</p>
            <div className="flex flex-wrap gap-2">
              {LEVELS.map((l) => (
                <FilterChip key={l} label={l.charAt(0).toUpperCase() + l.slice(1) + " Level"} active={filterLevel.includes(l)} onClick={() => toggleArr(filterLevel as string[], setFilterLevel, l)} />
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Career Path</p>
            <div className="flex flex-wrap gap-2">
              {careerPaths.map((cp) => (
                <FilterChip key={cp.id} label={`${cp.icon} ${cp.name}`} active={filterCareer.includes(cp.id)} onClick={() => toggleArr(filterCareer, setFilterCareer, cp.id)} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results count */}
      <p className="text-sm text-slate-500 mb-4">
        {filtered.length === 0
          ? "No jobs found"
          : `${filtered.length} opportunit${filtered.length === 1 ? "y" : "ies"} found`}
        {hasFilters || search ? " (filtered)" : ""}
      </p>

      {/* Job grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-semibold text-slate-700 mb-1">No matching jobs</p>
          <p className="text-sm text-slate-500">Try adjusting your search or filters.</p>
          {(hasFilters || search) && (
            <button onClick={() => { clearFilters(); setSearch(""); }} className="btn-ghost mt-4 text-sm">
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              isSaved={savedIds.has(job.id)}
              onToggleSave={toggleSave}
              showSaveButton={!!userId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
