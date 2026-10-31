import { SiteLogo } from "./site-logo";
import { getCopy } from "@/app/translations/server";

export async function SiteFooter() {
  const copy = await getCopy();
  return (
    <footer>
      <SiteLogo />
      <p>{copy.footerTagline}</p>
      <span>
        © 2026 Louma <span className="footer-star">✳</span> Made for Morocco
      </span>
    </footer>
  );
}
