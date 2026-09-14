import type { Metadata } from "next";
import { NotFoundContent } from "@/components/errors/NotFoundContent";
import { CookieNotice } from "@/components/ui/CookieNotice";
import { Footer } from "@/components/navigation/Footer";
import { Header } from "@/components/navigation/Header";
import { HeaderVariantProvider } from "@/components/navigation/HeaderVariantContext";
import { SitePageLoader } from "@/components/navigation/SitePageLoader";
import { PageContent } from "@/components/navigation/PageContent";
import { SearchOverlay } from "@/components/search/SearchOverlay";
import { SearchProvider } from "@/components/search/SearchContext";
import { getSiteNavDataAsync } from "@/lib/siteNavDataAsync";
import { companySettingsRepository, COMPANY_SETTINGS_ID } from "@/features/settings/repository";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The page you're looking for doesn't exist.",
};

/**
 * Catches a genuinely unmatched URL (a typo, an old bookmark) — anything
 * outside every defined route, including outside the `(public)` group
 * entirely, so that group's own `not-found.tsx` never sees it. Renders
 * directly under the root layout, which is why it rebuilds the public
 * shell (Header/Footer) by hand instead of inheriting it — same three
 * components `(public)/layout.tsx` uses, so the result looks identical,
 * including fetching the same live nav data for search/tab titles.
 */
export default async function RootNotFound() {
  const [{ projects, units, listings, newsArticles }, settings] = await Promise.all([
    getSiteNavDataAsync(),
    companySettingsRepository.findById(COMPANY_SETTINGS_ID),
  ]);

  return (
    <HeaderVariantProvider>
      <SearchProvider>
        <Header />
        <PageContent>
          <NotFoundContent />
        </PageContent>
        <Footer settings={settings} />
        <SitePageLoader routeTitleData={{ projects, units, newsArticles }} />
        <SearchOverlay searchData={{ projects, listings, newsArticles }} />
        <CookieNotice />
      </SearchProvider>
    </HeaderVariantProvider>
  );
}
