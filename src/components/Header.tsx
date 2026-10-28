import Link from "next/link";
import Logo from "./Logo";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
        <Link href="/" aria-label="Home">
          <Logo />
        </Link>
        <nav className="flex items-center gap-1 text-sm font-medium">
          <Link href="/#services" className="hidden rounded-lg px-3 py-2 text-muted hover:text-ink sm:block">
            Prices
          </Link>
          <Link href="/quote" className="rounded-lg px-3 py-2 text-muted hover:text-ink">
            Quote
          </Link>
          <Link href="/book" className="btn-primary !rounded-lg !px-4 !py-2 text-sm">
            Book
          </Link>
        </nav>
      </div>
    </header>
  );
}
