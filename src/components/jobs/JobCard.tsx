"use client";

import Link from "next/link";
import { MapPin, Clock, Calendar, ExternalLink, Bookmark, BookmarkCheck } from "lucide-react";
import { cn, formatDate, isDeadlineSoon, isExpired, WORK_MODE_LABELS, ENGAGEMENT_LABELS, LEVEL_LABELS } from "@/lib/utils";
import type { Job } from "@/types";

interface JobCardProps {
  job: Job;
  isSaved?: boolean;
  onToggleSave?: (jobId: string) => void;
  showSaveButton?: boolean;
}

const WORK_MODE_COLORS: Record<string, string> = {
  remote: "bg-green-100 text-green-700",
  onsite: "bg-slate-100 text-slate-700",
  hybrid: "bg-blue-100 text-blue-700",
};

const ENGAGEMENT_COLORS: Record<string, string> = {
  "full-time": "bg-brand-100 text-brand-700",
  "part-time": "bg-amber-100 text-amber-700",
  contract: "bg-purple-100 text-purple-700",
  internship: "bg-pink-100 text-pink-700",
  "graduate-trainee": "bg-indigo-100 text-indigo-700",
};

export default function JobCard({ job, isSaved, onToggleSave, showSaveButton = true }: JobCardProps) {
  const expired = isExpired(job.deadline);
  const soon = isDeadlineSoon(job.deadline);

  return (
    <div className={cn("card p-5 flex flex-col gap-3 hover:shadow-md transition-shadow", expired && "opacity-70")}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-slate-900 text-base leading-tight line-clamp-2">
            {job.title}
          </h3>
          <p className="text-sm text-slate-500 mt-0.5">{job.company}</p>
        </div>
        {showSaveButton && onToggleSave && (
          <button
            onClick={() => onToggleSave(job.id)}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-brand-700 shrink-0 transition-colors"
            title={isSaved ? "Remove from saved" : "Save job"}
          >
            {isSaved ? <BookmarkCheck size={18} className="text-brand-700 fill-brand-100" /> : <Bookmark size={18} />}
          </button>
        )}
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        {job.work_mode && (
          <span className={cn("badge", WORK_MODE_COLORS[job.work_mode] ?? "bg-slate-100 text-slate-600")}>
            {WORK_MODE_LABELS[job.work_mode] ?? job.work_mode}
          </span>
        )}
        {job.engagement_type && (
          <span className={cn("badge", ENGAGEMENT_COLORS[job.engagement_type] ?? "bg-slate-100 text-slate-600")}>
            {ENGAGEMENT_LABELS[job.engagement_type] ?? job.engagement_type}
          </span>
        )}
        {job.experience_level && (
          <span className="badge bg-slate-100 text-slate-600">
            {LEVEL_LABELS[job.experience_level] ?? job.experience_level}
          </span>
        )}
        {job.career_paths && (
          <span className="badge bg-gold-400/20 text-amber-700">
            {job.career_paths.icon} {job.career_paths.name}
          </span>
        )}
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-3 text-xs text-slate-500">
        {job.location && (
          <span className="flex items-center gap-1">
            <MapPin size={12} /> {job.location}
          </span>
        )}
        {job.salary_range && (
          <span className="flex items-center gap-1">
            💰 {job.salary_range}
          </span>
        )}
        <span className={cn("flex items-center gap-1", soon && "text-orange-600 font-medium", expired && "text-red-500")}>
          <Calendar size={12} />
          {expired ? "Expired" : `Deadline: ${formatDate(job.deadline)}`}
          {soon && !expired && " (Soon!)"}
        </span>
      </div>

      {/* Description */}
      {job.description && (
        <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">{job.description}</p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
        <a
          href={job.application_link}
          target="_blank"
          rel="noopener noreferrer"
          className={cn("btn-primary flex-1 text-sm py-2.5", expired && "opacity-50 pointer-events-none")}
        >
          <ExternalLink size={15} />
          {expired ? "Expired" : "Apply Now"}
        </a>
        <Link
          href={`/jobs/${job.id}`}
          className="btn-secondary text-sm py-2.5 px-4"
        >
          Details
        </Link>
      </div>

      {/* Post date */}
      <p className="text-xs text-slate-400 -mt-1">
        Posted {new Date(job.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
      </p>
    </div>
  );
}
