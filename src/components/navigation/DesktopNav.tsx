import Link from "next/link";
import {
  PUBLIC_NAV_PRIMARY,
  PUBLIC_NAV_FOUNDER,
  PUBLIC_PRIMARY_CTA,
} from "@/config/navigation";
import { NavLink } from "@/components/ui/NavLink";
import { buttonVariants } from "@/components/ui/Button";

export interface DesktopNavProps {
  tone?: "default" | "inverted";
}

export function DesktopNav({ tone = "default" }: DesktopNavProps) {
  return (
    <nav aria-label="Primary" className="hidden items-center gap-8 lg:flex">
      {PUBLIC_NAV_PRIMARY.map((item) => (
        <NavLink key={item.href} href={item.href} tone={tone}>
          {item.label}
        </NavLink>
      ))}
      <NavLink href={PUBLIC_NAV_FOUNDER.href} tone={tone}>
        {PUBLIC_NAV_FOUNDER.label}
      </NavLink>
      <Link href={PUBLIC_PRIMARY_CTA.href} className={buttonVariants({ size: "sm" })}>
        {PUBLIC_PRIMARY_CTA.label}
      </Link>
    </nav>
  );
}
