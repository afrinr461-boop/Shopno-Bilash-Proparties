import Link from "next/link";
import {
  PUBLIC_NAV_PRIMARY,
  PUBLIC_NAV_FOUNDER,
  PUBLIC_PRIMARY_CTA,
} from "@/config/navigation";
import { NavLink } from "@/components/ui/NavLink";
import { buttonVariants } from "@/components/ui/Button";

export function DesktopNav() {
  return (
    <nav aria-label="Primary" className="hidden items-center gap-8 lg:flex">
      {PUBLIC_NAV_PRIMARY.map((item) => (
        <NavLink key={item.href} href={item.href}>
          {item.label}
        </NavLink>
      ))}
      <NavLink href={PUBLIC_NAV_FOUNDER.href}>{PUBLIC_NAV_FOUNDER.label}</NavLink>
      {/* Deliberately NOT part of the blend-mode inversion above — the CTA
          already carries its own solid fill, so it stays a consistent,
          recognizable brand-green pill regardless of what's behind the
          header, the same way the logo does. */}
      <Link href={PUBLIC_PRIMARY_CTA.href} className={buttonVariants({ size: "sm" })}>
        {PUBLIC_PRIMARY_CTA.label}
      </Link>
    </nav>
  );
}
