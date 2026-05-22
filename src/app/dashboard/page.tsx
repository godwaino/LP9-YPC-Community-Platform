import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import DashboardClient from "./DashboardClient";
import { Briefcase, Bookmark, User, ArrowRight } from "lucide-react";
import type { Profile, MemberCareerPath, Job } from "@/types";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string }>;
}) {
  const { welcome } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [profileRes, careerPathsRes, savedJobsRes, latestJobsRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("member_career_paths").select("*, career_paths(*)").eq("member_id", user.id),
    supabase.from("saved_jobs").select("*, jobs(*, career_paths(*))").eq("member_id", user.id).order("created_at", { ascending: false }).limit(5),
    supabase.from("jobs").select("*, career_paths(*)").eq("is_active", true).order("created_at", { ascending: false }).limit(6),
  ]);

  const profile = profileRes.data as Profile | null;
  const memberCareerPaths = (careerPathsRes.data ?? []) as MemberCareerPath[];
  const savedJobs = (savedJobsRes.data ?? []) as { jobs: Job }[];
  const latestJobs = (latestJobsRes.data ?? []) as Job[];
  const isAdmin = profile?.role === "admin";

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar user={user} isAdmin={isAdmin} />

      <main className="flex-1 max-w-5xl mx-auto px-4 py-6 w-full">
        {welcome && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-2xl p-4 mb-6 flex items-center gap-3">
            <span className="text-2xl">🎉</span>
            <div>
              <p className="font-semibold">Welcome to LP9 YPC!</p>
              <p className="text-sm">You&apos;re now a member. Explore jobs and connect with your community.</p>
            </div>
          </div>
        )}

        {/* Profile summary */}
        <div className="card p-5 mb-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-brand-700 flex items-center justify-center shrink-0">
                <span className="text-white font-black text-lg">
                  {profile?.full_name?.charAt(0)?.toUpperCase() ?? "?"}
                </span>
              </div>
              <div>
                <p className="font-bold text-slate-900">{profile?.full_name ?? "Member"}</p>
                <p className="text-sm text-slate-500">{profile?.profession ?? profile?.employment_status ?? "LP9 YPC Member"}</p>
              </div>
            </div>
            <Link href="/dashboard/profile" className="btn-ghost text-sm py-2 shrink-0">
              <User size={15} /> Edit Profile
            </Link>
          </div>

          {/* Career paths */}
          {memberCareerPaths.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wide">Your Career Paths</p>
              <div className="flex flex-wrap gap-2">
                {memberCareerPaths.map((mcp) => (
                  <span key={mcp.id} className="badge bg-brand-50 text-brand-700 border border-brand-100 text-xs font-medium px-2.5 py-1">
                    {mcp.career_paths?.icon} {mcp.career_paths?.name}
                  </span>
                ))}
              </div>
              <Link href="/register/career-path" className="text-xs text-brand-700 hover:underline mt-2 inline-block">
                Update career paths
              </Link>
            </div>
          )}

          {memberCareerPaths.length === 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <Link href="/register/career-path" className="btn-primary text-sm py-2.5 w-full sm:w-auto">
                Choose Career Paths <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { icon: Briefcase, label: "Opportunities", value: latestJobs.length + "+" },
            { icon: Bookmark, label: "Saved Jobs", value: savedJobs.length },
            { icon: User, label: "Career Paths", value: memberCareerPaths.length },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="card p-4 text-center">
              <Icon size={20} className="text-brand-700 mx-auto mb-1" />
              <p className="text-xl font-black text-slate-900">{value}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          ))}
        </div>

        <DashboardClient
          latestJobs={latestJobs}
          savedJobsData={savedJobs}
          userId={user.id}
        />
      </main>

      <Footer />
    </div>
  );
}
