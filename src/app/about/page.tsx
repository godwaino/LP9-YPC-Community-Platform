import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ArrowRight, Target, Eye, Heart } from "lucide-react";

export default async function AboutPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data: p } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    isAdmin = p?.role === "admin";
  }

  const faqs = [
    { q: "Who can join LP9 YPC?", a: "Any young professional connected to Lagos Province 9 can join. Whether you are employed, self-employed, a student, or job-seeking, LP9 YPC has a place for you." },
    { q: "Is registration free?", a: "Yes. Membership and registration on the platform are completely free." },
    { q: "How do I find a job?", a: "After registering and selecting your career path, go to the Jobs page. You can filter by work mode, type, and career path, then tap 'Apply Now' to go directly to the application page." },
    { q: "Can I apply to multiple career paths?", a: "Absolutely. You can select multiple career paths that reflect your interests and background." },
    { q: "How are job listings verified?", a: "All job listings are reviewed and approved by LP9 YPC coordinators before going live. Application links are tested to ensure they work correctly." },
    { q: "How do I update my profile?", a: "After logging in, go to your Dashboard and click 'Edit Profile' to update your details at any time." },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar user={user} isAdmin={isAdmin} />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-brand-800 text-white py-14">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h1 className="text-3xl sm:text-4xl font-black mb-3">About LP9 YPC</h1>
            <p className="text-brand-100 text-lg leading-relaxed">
              Lagos Province 9 Young Professionals Club is a community of driven, ambitious professionals committed to mutual growth, career advancement, and service.
            </p>
          </div>
        </section>

        <div className="max-w-3xl mx-auto px-4 py-12 space-y-12">

          {/* Vision & Mission */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: Eye, title: "Vision", text: "To be the foremost community platform for young professionals in Lagos Province 9, empowering members to reach their full potential." },
              { icon: Target, title: "Mission", text: "To connect young professionals with career opportunities, mentors, and resources that accelerate personal and professional growth." },
              { icon: Heart, title: "Values", text: "Community, excellence, integrity, inclusivity, and continuous learning guide everything we do." },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="card p-5 text-center">
                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center mx-auto mb-3">
                  <Icon size={20} className="text-brand-700" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>

          {/* What the platform offers */}
          <div>
            <h2 className="section-title mb-4">What This Platform Offers</h2>
            <div className="space-y-3">
              {[
                "A fast and simple member registration process",
                "Career path selection tailored to your profession",
                "A curated jobs and opportunities board with direct application links",
                "A personal dashboard to track saved jobs and career activities",
                "Announcements and updates from LP9 YPC coordinators",
                "Resources and tips to support your career journey",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-brand-100 flex items-center justify-center shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-brand-700" />
                  </div>
                  <p className="text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* FAQs */}
          <div id="faq">
            <h2 className="section-title mb-4">Frequently Asked Questions</h2>
            <div className="space-y-3">
              {faqs.map(({ q, a }) => (
                <details key={q} className="card group">
                  <summary className="flex items-start justify-between gap-4 p-4 cursor-pointer font-semibold text-slate-900 list-none">
                    {q}
                    <span className="text-brand-700 font-bold group-open:rotate-45 transition-transform shrink-0">+</span>
                  </summary>
                  <div className="px-4 pb-4 text-slate-600 text-sm leading-relaxed border-t border-slate-100 pt-3">
                    {a}
                  </div>
                </details>
              ))}
            </div>
          </div>

          {/* Privacy */}
          <div id="privacy" className="card p-6 bg-slate-50 border-slate-200">
            <h2 className="font-bold text-slate-900 mb-2">Privacy & Data Notice</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              LP9 YPC collects only the information necessary to manage your membership and connect you with relevant opportunities. Your data is stored securely and never shared with third parties without your consent. You may update or delete your information at any time through your dashboard. By registering, you consent to receive relevant career and community updates from LP9 YPC.
            </p>
          </div>

          {/* CTA */}
          <div className="text-center pt-4">
            <h2 className="text-xl font-bold text-slate-900 mb-2">Ready to get started?</h2>
            <p className="text-slate-500 mb-6">Registration is free and takes less than two minutes.</p>
            <Link href="/register" className="btn-primary">
              Register Now <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
