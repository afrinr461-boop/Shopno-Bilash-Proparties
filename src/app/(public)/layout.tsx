import type { ReactNode } from "react";
import { CookieNotice } from "@/components/ui/CookieNotice";
import { Footer } from "@/components/navigation/Footer";
import { Header } from "@/components/navigation/Header";
import { HeaderVariantProvider } from "@/components/navigation/HeaderVariantContext";
import { SitePageLoader } from "@/components/navigation/SitePageLoader";
import { PageContent } from "@/components/navigation/PageContent";
import { SearchOverlay } from "@/components/search/SearchOverlay";
import { SearchProvider } from "@/components/search/SearchContext";
import { SmoothScroll } from "@/components/navigation/SmoothScroll";
import { getSiteNavDataAsync } from "@/lib/siteNavDataAsync";
import { companySettingsRepository, COMPANY_SETTINGS_ID } from "@/features/settings/repository";

/**
 * Public marketing site shell: fixed Header, route content, Footer, and
 * the branded page-transition overlay. Fetches the live CMS data both
 * `SitePageLoader` (destination titles) and `SearchOverlay` (search
 * results) need exactly once per request — same fetch-in-a-Server-
 * Component-then-pass-as-prop pattern `/properties` already uses — so
 * neither Client Component needs to (or can) `await` a repository call
 * itself.
 */
export default async function PublicLayout({ children }: { children: ReactNode }) {
  const [{ projects, units, listings, newsArticles }, settings] = await Promise.all([
    getSiteNavDataAsync(),
    companySettingsRepository.findById(COMPANY_SETTINGS_ID),
  ]);

  return (
    <HeaderVariantProvider>
      <SearchProvider>
        <SmoothScroll />
        <Header settings={settings} />
        <PageContent>{children}</PageContent>
        <Footer settings={settings} />
        <SitePageLoader routeTitleData={{ projects, units, newsArticles }} />
        <SearchOverlay searchData={{ projects, listings, newsArticles }} />
        <CookieNotice />
      </SearchProvider>
    </HeaderVariantProvider>
  );
}
