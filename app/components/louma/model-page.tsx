import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ContractEditor } from "@/app/components/louma/contract-editor";
import styles from "@/app/components/louma/home.module.css";
import { Footer, Header } from "@/app/components/louma/site";
import {
  contractTemplatePath,
  type PublicTemplate,
} from "@/lib/contract/templates";
import { absoluteUrl } from "@/lib/site-url";

function modelDescription(template: PublicTemplate) {
  return `${template.description} Personnalisez votre contrat et téléchargez-le en PDF.`;
}

export function modelMetadata(template: PublicTemplate): Metadata {
  const path = contractTemplatePath(template);
  const title = `Contrat de location de voiture — ${template.fr}`;
  const description = modelDescription(template);
  const image = absoluteUrl(`/modeles/${template.id}.png`);

  return {
    title: `${title} | Louma`,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      siteName: "Louma",
      url: absoluteUrl(path),
      images: image ? [image] : undefined,
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export function ModelPage({ template }: { template: PublicTemplate }) {
  const locale = "fr";

  return (
    <>
      <Header locale={locale} />
      <main aria-describedby="model-description">
        <h1 className="sr-only">
          Contrat de location de voiture — {template.fr}
        </h1>
        <p id="model-description" className="sr-only">
          {modelDescription(template)}
        </p>
        <div className={`shell ${styles.modelIntro}`}>
          <Link href="/#modeles">
            <ArrowLeft size={16} aria-hidden="true" />
            Retour
          </Link>
        </div>
        <ContractEditor locale={locale} initialTemplateColor={template.color} />
      </main>
      <Footer locale={locale} />
    </>
  );
}
