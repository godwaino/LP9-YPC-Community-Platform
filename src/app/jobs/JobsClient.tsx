"use client";

import { useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import JobCard from "@/components/jobs/JobCard";
import type { Job, CareerPath } from "@/types";

interface Props {
  initialJobs: Job[];
  careerPaths: CareerPath[];
  userId: string | null;
  initialSavedIds: string[];
}

export default function JobsClient({ initialJobs, careerPaths, userId, initialSavedIds }: Props) {
  const supabase = createClient();
  const [q, setQ] = useState("");
  const [activePaths, setActivePaths] = useState<string[]>([]);
  const [type, setType] = useState("all");
  const [level, setLevel] = useState("all");
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set(initialSavedIds));
  const [toast, setToast] = useState("");

  const filtered = useMemo(() => initialJobs.filter((j) => {
    if (activePaths.length && j.career_paths && !activePaths.includes(j.career_paths.slug)) return false;
    if (type !== "all" && j.engagement_type !== type) return false;
    if (level !== "all" && j.experience_level !== level) return false;
    if (q) {
      const s = q.toLowerCase();
      if (!j.title.toLowerCase().includes(s) && !j.company.toLowerCase().includes(s) && !(j.description?.toLowerCase().includes(s))) return false;
    }
    return true;
  }), [initialJobs, q, activePaths, type, level]);

  function togglePath(slug: string) {
    setActivePaths((p) => p.includes(slug) ? p.filter((x) => x !== slug) : [...p, slug]);
  }

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(""), 2200); }

  async function toggleSave(jobId: string) {
    if (!userId) { window.location.href = "/login"; return; }
    if (savedIds.has(jobId)) {
      await supabase.from("saved_jobs").delete().eq("member_id", userId).eq("job_id", jobId);
      setSavedIds((s) => { const n = new Set(s); n.delete(jobId); return n; });
      showToast("Removed from saved");
    } else {
      await supabase.from("saved_jobs").insert({ member_id: userId, job_id: jobId });
      setSavedIds((s) => new Set([...s, jobId]));
      showToast("Saved to your profile");
    }
  }

  const SelectStyle = { padding: "10px 14px", border: "1px solid var(--line)", borderRadius: 99, background: "var(--paper)", fontSize: 14, fontWeight: 500, color: "var(--ink)", cursor: "pointer" };

  return (
    <>
      {/* Filter row */}
      <div className="filter-row">
        <div className="search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
          <input placeholder="Search by title, company, skill…" value={q} onChange={(e) => setQ(e.target.value)} />
          {q && <button onClick={() => setQ("")} style={{ color: "#999", padding: 0, lineHeight: 1 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>}
        </div>
        <select value={type} onChange={(e) => setType(e.target.value)} style={SelectStyle}>
          <option value="all">All types</option>
          <option value="full-time">Full-time</option>
          <option value="part-time">Part-time</option>
          <option value="contract">Contract</option>
          <option value="internship">Internship</option>
          <option value="graduate-trainee">Graduate Trainee</option>
        </select>
        <select value={level} onChange={(e) => setLevel(e.target.value)} style={SelectStyle}>
          <option value="all">All levels</option>
          <option value="entry">Entry</option>
          <option value="mid">Mid</option>
          <option value="senior">Senior</option>
        </select>
      </div>

      {/* Career path chips */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", padding: "20px 0 12px" }}>
        <button className={`chip${activePaths.length === 0 ? " on" : ""}`} onClick={() => setActivePaths([])}>All paths</button>
        {careerPaths.map((cp) => (
          <button key={cp.id} className={`chip${activePaths.includes(cp.slug) ? " on" : ""}`} onClick={() => togglePath(cp.slug)}>
            <span style={{ fontSize: 14 }}>{cp.icon}</span>
            {cp.name.split(" & ")[0]}
          </button>
        ))}
      </div>

      {/* Result count */}
      <p style={{ fontSize: 14, color: "#888", marginBottom: 0 }}>
        <strong style={{ color: "var(--blue)", fontFamily: "var(--font-display)", fontSize: 18 }}>{filtered.length}</strong> roles open
        {(q || activePaths.length || type !== "all" || level !== "all") && " (filtered)"}
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="empty" style={{ marginTop: 24 }}>No jobs match those filters. Try clearing one.</div>
      ) : (
        <div className="jobs-grid">
          {filtered.map((j) => (
            <JobCard key={j.id} job={j} isSaved={savedIds.has(j.id)} onToggleSave={userId ? toggleSave : undefined} />
          ))}
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </>
  );
}
