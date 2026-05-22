import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ArrowRight, Briefcase, Users, TrendingUp, CheckCircle, Star } from "lucide-react";
import type { Announcement, CareerPath } from "@/types";

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    isAdmin = profile?.role === "admin";
  }

  const { data: announcements } = await supabase
    .from("announcements")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(3) as { data: Announcement[] | null };

  const { data: careerPaths } = await supabase
    .from("career_paths")
    .select("*")
    .order("name") as { data: CareerPath[] | null };

  const features = [
    { icon: Users, title: "Join the Community", desc: "Connect with hundreds of young professionals across Lagos Province 9." },
    { icon: Briefcase, title: "Discover Opportunities", desc: "Browse vetted jobs and internships tailored to your career path." },
    { icon: TrendingUp, title: "Grow Your Career", desc: "Access workshops, mentors, and resources to level up professionally." },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar user={user} isAdmin={isAdmin} />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-br from-brand-800 via-brand-700 to-brand-600 text-white">
          <div className="max-w-5xl mx-auto px-4 py-16 sm:py-24">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm font-medium mb-6 backdrop-blur-sm">
                <Star size={14} className="text-gold-400 fill-gold-400" />
                Lagos Province 9 Young Professionals Club
              </div>
              <h1 className="text-3xl sm:text-5xl font-black leading-tight mb-4">
                Your Career,<br />
                <span className="text-gold-400">Your Community</span>
              </h1>
              <p className="text-lg text-brand-100 leading-relaxed mb-8">
                LP9 YPC connects young professionals with job opportunities, career guidance, and a network that lifts everyone up. Join us today — it takes less than two minutes.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/register" className="btn-primary bg-white text-brand-800 hover:bg-brand-50 active:bg-brand-100">
                  Register Free <ArrowRight size={18} />
                </Link>
                <Link href="/jobs" className="btn-secondary border-white/50 text-white hover:bg-white/10 hover:border-white">
                  View Jobs
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats banner */}
        <section className="bg-brand-900 text-white">
          <div className="max-w-5xl mx-auto px-4 py-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              {[
                { label: "Members", value: "500+" },
                { label: "Jobs Posted", value: "200+" },
                { label: "Career Paths", value: "10" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-2xl font-black text-gold-400">{s.value}</p>
                  <p className="text-xs text-brand-200 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Announcements */}
        {announcements && announcements.length > 0 && (
          <section className="max-w-5xl mx-auto px-4 py-10">
            <h2 className="section-title mb-4">📢 Announcements</h2>
            <div className="space-y-3">
              {announcements.map((a) => (
                <div key={a.id} className="card p-4 flex gap-3">
                  <div className="w-2 rounded-full bg-brand-500 shrink-0 self-stretch" />
                  <div>
                    <p className="font-semibold text-slate-900">{a.title}</p>
                    {a.content && <p className="text-sm text-slate-500 mt-1">{a.content}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Features */}
        <section className="max-w-5xl mx-auto px-4 py-10">
          <h2 className="section-title text-center mb-2">Why Join LP9 YPC?</h2>
          <p className="text-slate-500 text-center mb-8">Everything you need to advance your career in one place.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card p-6 text-center">
                <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-4">
                  <Icon size={24} className="text-brand-700" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Career Paths */}
        {careerPaths && careerPaths.length > 0 && (
          <section className="bg-white py-10">
            <div className="max-w-5xl mx-auto px-4">
              <h2 className="section-title mb-2">Career Paths</h2>
              <p className="text-slate-500 mb-6">Select the path that fits you — we&apos;ll tailor opportunities to match.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {careerPaths.map((cp) => (
                  <div key={cp.id} className="card p-3 text-center hover:border-brand-200 hover:shadow-md transition-all cursor-default">
                    <span className="text-2xl">{cp.icon}</span>
                    <p className="text-xs font-medium text-slate-700 mt-2 leading-tight">{cp.name}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 text-center">
                <Link href="/register" className="btn-primary">
                  Choose Your Path <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* How it works */}
        <section className="max-w-5xl mx-auto px-4 py-10">
          <h2 className="section-title mb-2">How It Works</h2>
          <p className="text-slate-500 mb-8">Get started in three simple steps.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { step: "01", title: "Register", desc: "Fill in a short form — takes less than 2 minutes. No complicated questions." },
              { step: "02", title: "Choose Your Path", desc: "Select the career area(s) that match your profession and interests." },
              { step: "03", title: "Apply & Grow", desc: "Browse jobs, tap Apply, and access resources built for your career path." },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-brand-700 text-white font-black text-sm flex items-center justify-center shrink-0">
                  {step}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">{title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-brand-700 text-white">
          <div className="max-w-5xl mx-auto px-4 py-12 text-center">
            <h2 className="text-2xl sm:text-3xl font-black mb-3">Ready to join LP9 YPC?</h2>
            <p className="text-brand-100 mb-8 max-w-md mx-auto">
              Registration is free, fast, and takes less than two minutes. Start building your career today.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link href="/register" className="btn-primary bg-white text-brand-800 hover:bg-brand-50">
                <CheckCircle size={18} /> Register Now — It&apos;s Free
              </Link>
              <Link href="/jobs" className="btn-secondary border-white/40 text-white hover:bg-white/10">
                Browse Jobs First
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
