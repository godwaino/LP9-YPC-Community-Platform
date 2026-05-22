import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import JobsClient from "./JobsClient";
import type { Job, CareerPath } from "@/types";

export default async function JobsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let isAdmin = false;
  let savedJobIds: string[] = [];

  if (user) {
    const { data: p } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    isAdmin = p?.role === "admin";

    const { data: saved } = await supabase
      .from("saved_jobs")
      .select("job_id")
      .eq("member_id", user.id);
    savedJobIds = (saved ?? []).map((s: { job_id: string }) => s.job_id);
  }

  const { data: jobs } = await supabase
    .from("jobs")
    .select("*, career_paths(*)")
    .eq("is_active", true)
    .order("created_at", { ascending: false }) as { data: Job[] | null };

  const { data: careerPaths } = await supabase
    .from("career_paths")
    .select("*")
    .order("name") as { data: CareerPath[] | null };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar user={user} isAdmin={isAdmin} />
      <main className="flex-1">
        <div className="bg-brand-800 text-white py-10">
          <div className="max-w-5xl mx-auto px-4">
            <h1 className="text-2xl sm:text-3xl font-black mb-1">Jobs & Opportunities</h1>
            <p className="text-brand-200 text-sm">Tap <strong>Apply Now</strong> on any listing to go directly to the application page.</p>
          </div>
        </div>
        <div className="max-w-5xl mx-auto px-4 py-6">
          <JobsClient
            initialJobs={jobs ?? []}
            careerPaths={careerPaths ?? []}
            userId={user?.id ?? null}
            initialSavedIds={savedJobIds}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
