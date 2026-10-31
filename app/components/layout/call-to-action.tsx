import { Link } from "@/i18n/navigation";
import { ArrowUpRight } from "lucide-react";
import { getCopy } from "@/app/translations/server";

export async function CallToAction() {
  const copy = await getCopy();
  return (
    <section className="bottom-cta">
      <span className="eyebrow">{copy.sub}</span>
      <h2>{copy.bottomTitle}</h2>
      <Link href="/new" className="button">
        {copy.cta}
        <ArrowUpRight size={18} />
      </Link>
    </section>
  );
}
