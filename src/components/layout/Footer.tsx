import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-16">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-brand-700 flex items-center justify-center">
                <span className="text-white font-black text-xs">LP9</span>
              </div>
              <span className="font-bold text-white">LP9 YPC</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Lagos Province 9 Young Professionals Club — connecting, equipping, and empowering young professionals.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-3 text-sm">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/jobs" className="hover:text-white transition-colors">Jobs & Opportunities</Link></li>
              <li><Link href="/register" className="hover:text-white transition-colors">Register</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">About LP9 YPC</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-3 text-sm">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/login" className="hover:text-white transition-colors">Member Login</Link></li>
              <li><a href="mailto:info@lp9ypc.org" className="hover:text-white transition-colors">Contact Us</a></li>
              <li><Link href="/about#faq" className="hover:text-white transition-colors">FAQs</Link></li>
              <li><Link href="/about#privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-700 mt-8 pt-6 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} LP9 YPC Community Platform. All rights reserved.</p>
          <p className="mt-1">Built by <span className="text-slate-400 font-medium">Havilah Labs</span></p>
        </div>
      </div>
    </footer>
  );
}
