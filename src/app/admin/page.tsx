import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/layout/Navbar";
import AdminClient from "./AdminClient";
import type { Job, Profile, CareerPath, Announcement } from "@/types";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/dashboard");

  const [jobsRes, membersRes, careerPathsRes, announcementsRes, statsRes] = await Promise.all([
    supabase.from("jobs").select("*, career_paths(*)").order("created_at", { ascending: false }),
    supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    supabase.from("career_paths").select("*").order("name"),
    supabase.from("announcements").select("*").order("created_at", { ascending: false }),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
  ]);

  const jobs = (jobsRes.data ?? []) as Job[];
  const members = (membersRes.data ?? []) as Profile[];
  const careerPaths = (careerPathsRes.data ?? []) as CareerPath[];
  const announcements = (announcementsRes.data ?? []) as Announcement[];
  const totalMembers = statsRes.count ?? 0;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar user={user} isAdmin={true} />
      <main className="flex-1 max-w-6xl mx-auto px-4 py-6 w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-500 text-sm">Manage jobs, members, and announcements.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total Members", value: totalMembers, color: "text-brand-700" },
            { label: "Active Jobs", value: jobs.filter((j) => j.is_active).length, color: "text-green-700" },
            { label: "Archived Jobs", value: jobs.filter((j) => !j.is_active).length, color: "text-slate-500" },
            { label: "Announcements", value: announcements.length, color: "text-amber-700" },
          ].map(({ label, value, color }) => (
            <div key={label} className="card p-4">
              <p className={`text-2xl font-black ${color}`}>{value}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          ))}
        </div>

        <AdminClient
          jobs={jobs}
          members={members}
          careerPaths={careerPaths}
          announcements={announcements}
        />
      </main>
    </div>
  );
}
