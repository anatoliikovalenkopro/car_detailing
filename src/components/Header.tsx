import Link from "next/link";
import Logo from "./Logo";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-ink/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" aria-label="Home">
          <Logo />
        </Link>
        <nav className="flex items-center gap-1 text-sm sm:gap-2">
          <Link href="/#services" className="hidden rounded-lg px-3 py-2 text-slate-300 hover:text-white sm:block">
            Services
          </Link>
          <Link href="/estimate" className="rounded-lg px-3 py-2 text-slate-300 hover:text-white">
            AI Quote
          </Link>
          <Link href="/#faq" className="hidden rounded-lg px-3 py-2 text-slate-300 hover:text-white sm:block">
            FAQ
          </Link>
          <Link href="/book" className="btn-primary !px-4 !py-2 text-sm">
            Book now
          </Link>
        </nav>
      </div>
    </header>
  );
}
