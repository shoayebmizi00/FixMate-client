import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";

import logo from "@/assets/logo.png";

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "Browse services", href: "/services" },
  { label: "About FixMate", href: "/about" },
  { label: "Sign in", href: "/signin" },
];

const popularRepairs = [
  { label: "Smartphone", href: "/services?category=Electronics%20Repair" },
  { label: "Laptop & PC", href: "/services?category=Electronics%20Repair" },
  { label: "AC", href: "/services?category=Appliance%20Repair" },
  { label: "Refrigerator", href: "/services?category=Appliance%20Repair" },
  { label: "TV", href: "/services?category=Electronics%20Repair" },
  { label: "Washing Machine", href: "/services?category=Appliance%20Repair" },
  { label: "Electrical", href: "/services?category=Electrical" },
];

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.451-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644Z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 448 512" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="bg-[#0b1220] text-slate-400">
      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr] lg:gap-8">
          <div>
            <Link href="/" className="flex items-center gap-3">
              <span className="relative size-10 shrink-0 overflow-hidden rounded-xl ring-1 ring-white/10">
                <Image src={logo} alt="FixMate logo" fill sizes="40px" className="object-cover" />
              </span>
              <span className="text-xl font-bold tracking-tight text-white">
                Fix<span className="text-blue-500">Mate</span>
              </span>
            </Link>

            <p className="mt-6 max-w-xs text-sm leading-relaxed">
              Trusted repairs. Transparent service. Secure card checkout. Book
              verified technicians for phones, laptops, appliances and home
              electrical work.
            </p>

            <div className="mt-6 flex items-center gap-3">
              <Link
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                aria-label="FixMate on X"
                className="flex size-10 items-center justify-center rounded-full border border-white/15 text-slate-300 transition-colors hover:border-white/30 hover:bg-white/5 hover:text-white"
              >
                <XIcon className="size-4" />
              </Link>
              <Link
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                aria-label="FixMate on LinkedIn"
                className="flex size-10 items-center justify-center rounded-full border border-white/15 text-slate-300 transition-colors hover:border-white/30 hover:bg-white/5 hover:text-white"
              >
                <LinkedInIcon className="size-4" />
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-[13px] font-semibold tracking-wider text-slate-200 uppercase">
              Quick Links
            </h3>
            <ul className="mt-5 space-y-3.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[15px] transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[13px] font-semibold tracking-wider text-slate-200 uppercase">
              Popular Repairs
            </h3>
            <ul className="mt-5 space-y-3.5">
              {popularRepairs.map((repair) => (
                <li key={repair.label}>
                  <Link
                    href={repair.href}
                    className="text-[15px] transition-colors hover:text-white"
                  >
                    {repair.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[13px] font-semibold tracking-wider text-slate-200 uppercase">
              Contact
            </h3>
            <ul className="mt-5 space-y-3.5 text-[15px]">
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 size-4 shrink-0 text-blue-400" />
                <a href="mailto:support@fixmate.example" className="transition-colors hover:text-white">
                  support@fixmate.example
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 size-4 shrink-0 text-blue-400" />
                <a href="tel:+8801641418856" className="transition-colors hover:text-white">
                  +8801641-418856
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-blue-400" />
                <span className="leading-relaxed">
                  1205, Lalbagh, Dhaka, Bangladesh
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container mx-auto flex flex-col gap-2 px-4 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© 2026 FixMate. All rights reserved by Md Shoayeb Mizi.</p>
          <p>{`+8801641-418856 -> A reliable & trusted repair service.`}</p>
        </div>
      </div>
    </footer>
  );
}
