"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Plus, Pencil, Archive, Trash2, Eye, EyeOff, Download, CheckCircle } from "lucide-react";
import { cn, formatDate, WORK_MODE_LABELS, ENGAGEMENT_LABELS } from "@/lib/utils";
import type { Job, Profile, CareerPath, Announcement } from "@/types";

interface Props {
  jobs: Job[];
  members: Profile[];
  careerPaths: CareerPath[];
  announcements: Announcement[];
}

interface JobForm {
  title: string;
  company: string;
  location: string;
  work_mode: string;
  engagement_type: string;
  experience_level: string;
  deadline: string;
  description: string;
  career_path_id: string;
  application_link: string;
  salary_range: string;
}

interface AnnouncementForm {
  title: string;
  content: string;
}

type Tab = "jobs" | "members" | "announcements";

export default function AdminClient({ jobs: initialJobs, members, careerPaths, announcements: initialAnnouncements }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [tab, setTab] = useState<Tab>("jobs");
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);
  const [showJobForm, setShowJobForm] = useState(false);
  const [showAnnForm, setShowAnnForm] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [memberSearch, setMemberSearch] = useState("");

  const jobForm = useForm<JobForm>();
  const annForm = useForm<AnnouncementForm>();

  function openNewJob() {
    jobForm.reset({});
    setEditingJob(null);
    setShowJobForm(true);
  }

  function openEditJob(job: Job) {
    setEditingJob(job);
    jobForm.reset({
      title: job.title,
      company: job.company,
      location: job.location ?? "",
      work_mode: job.work_mode ?? "",
      engagement_type: job.engagement_type ?? "",
      experience_level: job.experience_level ?? "",
      deadline: job.deadline ?? "",
      description: job.description ?? "",
      career_path_id: job.career_path_id ?? "",
      application_link: job.application_link,
      salary_range: job.salary_range ?? "",
    });
    setShowJobForm(true);
  }

  async function submitJob(data: JobForm) {
    setSaving(true);
    setError("");
    const { data: { user } } = await supabase.auth.getUser();

    const payload = {
      ...data,
      deadline: data.deadline || null,
      career_path_id: data.career_path_id || null,
      posted_by: user?.id,
    };

    if (editingJob) {
      const { error: err } = await supabase.from("jobs").update({ ...payload, updated_at: new Date().toISOString() }).eq("id", editingJob.id);
      if (err) { setError(err.message); setSaving(false); return; }
    } else {
      const { error: err } = await supabase.from("jobs").insert(payload);
      if (err) { setError(err.message); setSaving(false); return; }
    }

    setSaving(false);
    setShowJobForm(false);
    router.refresh();
  }

  async function toggleJobActive(job: Job) {
    await supabase.from("jobs").update({ is_active: !job.is_active }).eq("id", job.id);
    setJobs((prev) => prev.map((j) => j.id === job.id ? { ...j, is_active: !j.is_active } : j));
  }

  async function deleteJob(jobId: string) {
    if (!confirm("Delete this job listing? This cannot be undone.")) return;
    await supabase.from("jobs").delete().eq("id", jobId);
    setJobs((prev) => prev.filter((j) => j.id !== jobId));
  }

  async function submitAnnouncement(data: AnnouncementForm) {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { data: inserted, error: err } = await supabase.from("announcements").insert({ ...data, posted_by: user?.id }).select().single();
    if (err) { setError(err.message); setSaving(false); return; }
    setAnnouncements((prev) => [inserted, ...prev]);
    setSaving(false);
    setShowAnnForm(false);
    annForm.reset();
  }

  async function toggleAnnouncement(ann: Announcement) {
    await supabase.from("announcements").update({ is_active: !ann.is_active }).eq("id", ann.id);
    setAnnouncements((prev) => prev.map((a) => a.id === ann.id ? { ...a, is_active: !a.is_active } : a));
  }

  function exportMembers() {
    const headers = ["Name", "Email", "Phone", "Area", "Profession", "Status", "Joined"];
    const rows = members.map((m) => [
      m.full_name, m.email, m.phone,
      m.area_of_residence ?? "", m.profession ?? "",
      m.employment_status ?? "",
      new Date(m.created_at).toLocaleDateString()
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "lp9ypc-members.csv"; a.click();
  }

  const filteredMembers = members.filter((m) =>
    !memberSearch || m.full_name.toLowerCase().includes(memberSearch.toLowerCase()) ||
    m.email.toLowerCase().includes(memberSearch.toLowerCase())
  );

  const tabs: { key: Tab; label: string }[] = [
    { key: "jobs", label: `Jobs (${jobs.length})` },
    { key: "members", label: `Members (${members.length})` },
    { key: "announcements", label: `Announcements (${announcements.length})` },
  ];

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-6 overflow-x-auto">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              "flex-1 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap px-3",
              tab === key ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* JOBS TAB */}
      {tab === "jobs" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900">Job Listings</h2>
            <button onClick={openNewJob} className="btn-primary text-sm py-2 px-4">
              <Plus size={16} /> Add Job
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>
          )}

          {showJobForm && (
            <div className="card p-5 mb-5">
              <h3 className="font-bold text-slate-900 mb-4">{editingJob ? "Edit Job" : "Add New Job"}</h3>
              <form onSubmit={jobForm.handleSubmit(submitJob)} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="label">Job Title *</label>
                  <input {...jobForm.register("title", { required: true })} className="input-field" placeholder="e.g. Frontend Developer" />
                </div>
                <div>
                  <label className="label">Company *</label>
                  <input {...jobForm.register("company", { required: true })} className="input-field" placeholder="Company name" />
                </div>
                <div>
                  <label className="label">Location</label>
                  <input {...jobForm.register("location")} className="input-field" placeholder="e.g. Lagos, Nigeria" />
                </div>
                <div>
                  <label className="label">Work Mode</label>
                  <select {...jobForm.register("work_mode")} className="input-field">
                    <option value="">Select</option>
                    <option value="remote">Remote</option>
                    <option value="onsite">On-site</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
                <div>
                  <label className="label">Engagement Type</label>
                  <select {...jobForm.register("engagement_type")} className="input-field">
                    <option value="">Select</option>
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                    <option value="graduate-trainee">Graduate Trainee</option>
                  </select>
                </div>
                <div>
                  <label className="label">Experience Level</label>
                  <select {...jobForm.register("experience_level")} className="input-field">
                    <option value="">Select</option>
                    <option value="entry">Entry Level</option>
                    <option value="mid">Mid Level</option>
                    <option value="senior">Senior</option>
                  </select>
                </div>
                <div>
                  <label className="label">Deadline</label>
                  <input {...jobForm.register("deadline")} type="date" className="input-field" />
                </div>
                <div>
                  <label className="label">Career Path</label>
                  <select {...jobForm.register("career_path_id")} className="input-field">
                    <option value="">Select path</option>
                    {careerPaths.map((cp) => (
                      <option key={cp.id} value={cp.id}>{cp.icon} {cp.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Salary Range</label>
                  <input {...jobForm.register("salary_range")} className="input-field" placeholder="e.g. ₦200k – ₦350k/month" />
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Application / Referral Link *</label>
                  <input {...jobForm.register("application_link", { required: true })} type="url" className="input-field" placeholder="https://..." />
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Description</label>
                  <textarea {...jobForm.register("description")} className="input-field min-h-[100px] resize-none" rows={4} placeholder="Brief description of the role…" />
                </div>
                <div className="sm:col-span-2 flex gap-3">
                  <button type="submit" disabled={saving} className="btn-primary text-sm">
                    {saving ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : <><CheckCircle size={16} /> {editingJob ? "Update Job" : "Post Job"}</>}
                  </button>
                  <button type="button" onClick={() => setShowJobForm(false)} className="btn-secondary text-sm">Cancel</button>
                </div>
              </form>
            </div>
          )}

          <div className="space-y-3">
            {jobs.length === 0 ? (
              <div className="text-center py-10 text-slate-500">No jobs posted yet. Click &quot;Add Job&quot; to get started.</div>
            ) : (
              jobs.map((job) => (
                <div key={job.id} className={cn("card p-4 flex items-start gap-3", !job.is_active && "opacity-60")}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2">
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900 text-sm">{job.title}</p>
                        <p className="text-xs text-slate-500">{job.company} · {job.work_mode ? WORK_MODE_LABELS[job.work_mode] : ""} · {job.engagement_type ? ENGAGEMENT_LABELS[job.engagement_type] : ""}</p>
                      </div>
                      <span className={cn("badge text-xs shrink-0", job.is_active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500")}>
                        {job.is_active ? "Active" : "Archived"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Deadline: {formatDate(job.deadline)} · Posted {new Date(job.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => openEditJob(job)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-brand-700" title="Edit">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => toggleJobActive(job)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-amber-600" title={job.is_active ? "Archive" : "Restore"}>
                      {job.is_active ? <Archive size={14} /> : <Eye size={14} />}
                    </button>
                    <button onClick={() => deleteJob(job.id)} className="p-2 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-600" title="Delete">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MEMBERS TAB */}
      {tab === "members" && (
        <div>
          <div className="flex items-center justify-between gap-3 mb-4">
            <input
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
              className="input-field max-w-xs"
              placeholder="Search members…"
            />
            <button onClick={exportMembers} className="btn-secondary text-sm py-2 px-4 shrink-0">
              <Download size={16} /> Export CSV
            </button>
          </div>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Name</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Email</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Profession</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Role</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMembers.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-8 text-slate-400">No members found</td></tr>
                  ) : (
                    filteredMembers.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-brand-700 flex items-center justify-center shrink-0">
                              <span className="text-white text-xs font-bold">{m.full_name.charAt(0)}</span>
                            </div>
                            <span className="font-medium text-slate-900">{m.full_name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-500 hidden sm:table-cell">{m.email}</td>
                        <td className="px-4 py-3 text-slate-500 hidden md:table-cell">{m.profession ?? "—"}</td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <span className="badge bg-slate-100 text-slate-600">{m.employment_status ?? "—"}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn("badge", m.role === "admin" ? "bg-red-100 text-red-700" : "bg-brand-50 text-brand-700")}>
                            {m.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-400 text-xs hidden sm:table-cell">
                          {new Date(m.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ANNOUNCEMENTS TAB */}
      {tab === "announcements" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900">Announcements</h2>
            <button onClick={() => setShowAnnForm(true)} className="btn-primary text-sm py-2 px-4">
              <Plus size={16} /> New
            </button>
          </div>

          {showAnnForm && (
            <div className="card p-5 mb-5">
              <h3 className="font-bold text-slate-900 mb-4">New Announcement</h3>
              <form onSubmit={annForm.handleSubmit(submitAnnouncement)} className="space-y-4">
                <div>
                  <label className="label">Title *</label>
                  <input {...annForm.register("title", { required: true })} className="input-field" placeholder="Announcement title" />
                </div>
                <div>
                  <label className="label">Content</label>
                  <textarea {...annForm.register("content")} className="input-field min-h-[80px] resize-none" rows={3} />
                </div>
                <div className="flex gap-3">
                  <button type="submit" disabled={saving} className="btn-primary text-sm">
                    {saving ? <><Loader2 size={16} className="animate-spin" /> Posting…</> : "Post Announcement"}
                  </button>
                  <button type="button" onClick={() => { setShowAnnForm(false); annForm.reset(); }} className="btn-secondary text-sm">Cancel</button>
                </div>
              </form>
            </div>
          )}

          <div className="space-y-3">
            {announcements.length === 0 ? (
              <div className="text-center py-10 text-slate-500">No announcements yet.</div>
            ) : (
              announcements.map((ann) => (
                <div key={ann.id} className={cn("card p-4 flex items-start gap-3", !ann.is_active && "opacity-60")}>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900 text-sm">{ann.title}</p>
                    {ann.content && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{ann.content}</p>}
                    <p className="text-xs text-slate-400 mt-1">{new Date(ann.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className={cn("badge text-xs", ann.is_active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500")}>
                      {ann.is_active ? "Live" : "Hidden"}
                    </span>
                    <button onClick={() => toggleAnnouncement(ann)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500" title="Toggle visibility">
                      {ann.is_active ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
