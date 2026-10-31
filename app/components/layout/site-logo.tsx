import { Link } from "@/i18n/navigation";

export function SiteLogo() {
  return (
    <Link className="logo" href="/" aria-label="Louma accueil">
      <span className="logo-mark">
        <i />
        <i />
        <i />
      </span>
      louma<span className="logo-dot">.</span>
    </Link>
  );
}
