"use client";

import { ArrowDown, FileText } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { contractTemplates } from "@/lib/contract/templates";
import styles from "./home.module.css";

type Category = {
  label: string;
  image?: string;
  fields?: string;
};

const rentalCategory: Category = { label: "Contrat de location de voiture" };

const featuredCategories: Category[] = [
  rentalCategory,
  {
    label: "Procuration",
    image: "procuration",
    fields: "Noms, objet du mandat et durée.",
  },
  {
    label: "Quittance de loyer",
    image: "quittance",
    fields: "Adresse, période de location et montant payé.",
  },
  {
    label: "Invitation de mariage",
    image: "mariage",
    fields: "Prénoms, date, lieu et coordonnées pour la réponse.",
  },
  { label: "Règlement intérieur" },
  { label: "Bon de livraison" },
  { label: "Bon de commande" },
  {
    label: "Menus de restaurants et de snacks",
    image: "menu",
    fields: "Rubriques, plats, descriptions et prix.",
  },
];

const moreCategories = [
  {
    title: "Démarches et attestations",
    labels: [
      "Déclaration sur l’honneur",
      "Attestation d’hébergement",
      "Autorisation parentale",
      "Lettre de demande",
      "Lettre de réclamation",
    ],
  },
  {
    title: "Logement et location",
    labels: [
      "Bail d’habitation",
      "État des lieux",
      "Avis d’échéance",
      "Reçu de dépôt de garantie",
      "Inventaire de location meublée",
    ],
  },
  {
    title: "Commerce et services",
    labels: [
      "Facture",
      "Devis",
      "Reçu de paiement",
      "Catalogue de produits",
      "Grille tarifaire",
      "Fiche d’intervention",
      "Procès-verbal de réception",
    ],
  },
  {
    title: "Travail, école et associations",
    labels: [
      "CV",
      "Lettre de motivation",
      "Attestation de travail",
      "Attestation de stage",
      "Autorisation de sortie scolaire",
      "Bulletin d’adhésion",
      "Procès-verbal de réunion",
    ],
  },
  {
    title: "Événements et restauration",
    labels: [
      "Invitation d’anniversaire",
      "Faire-part de naissance",
      "Programme d’événement",
      "Plan de table",
      "Carte de traiteur",
      "Menu du Ramadan",
      "Carte de fidélité",
    ],
  },
];

export function TemplateGallery({
  color,
  onSelect,
}: {
  color: string;
  onSelect: (color: string) => void;
}) {
  const [category, setCategory] = useState<Category>(rentalCategory);
  const isRental = category.label === rentalCategory.label;

  function categoryChip(option: Category) {
    return (
      <button
        key={option.label}
        type="button"
        className={styles.chip}
        aria-pressed={category.label === option.label}
        aria-controls="modeles-panel"
        onClick={() => setCategory(option)}
      >
        {option.label}
      </button>
    );
  }

  return (
    <section
      className={`shell ${styles.gallery}`}
      id="modeles"
      aria-labelledby="modeles-title"
    >
      <h2 id="modeles-title">Modèles de documents</h2>
      <div
        className={styles.filters}
        role="group"
        aria-label="Catégories de documents"
      >
        {featuredCategories.map(categoryChip)}
      </div>
      <details className={styles.more}>
        <summary>Plus de catégories</summary>
        <div className={styles.categoryGroups}>
          {moreCategories.map(({ title, labels }) => (
            <div key={title} role="group" aria-label={title}>
              <h3>{title}</h3>
              <div className={styles.filters}>
                {labels.map((label) => categoryChip({ label }))}
              </div>
            </div>
          ))}
        </div>
      </details>

      <div
        id="modeles-panel"
        className={styles.panel}
        aria-labelledby="category-title"
      >
        <p className="sr-only" role="status">
          {category.label} · {isRental ? "4 modèles disponibles" : "Bientôt"}
        </p>
        {isRental ? (
          <>
            <h3 id="category-title">{category.label}</h3>
            <ul className={styles.cards} role="list">
              {contractTemplates.map((template) => (
                <li key={template.id}>
                  <a
                    href="#contrat"
                    className={styles.cardLink}
                    aria-current={color === template.color ? "true" : undefined}
                    onClick={() => onSelect(template.color)}
                  >
                    <Image
                      src={`/modeles/${template.id}.png`}
                      width={640}
                      height={640}
                      sizes="(max-width: 520px) 88vw, (max-width: 900px) 45vw, 300px"
                      alt=""
                    />
                    <div className={styles.cardBody}>
                      <div>
                        <h4>{template.fr}</h4>
                        <span>Utiliser</span>
                      </div>
                      <ArrowDown size={18} aria-hidden />
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <div className={styles.upcoming}>
            {category.image ? (
              <Image
                src={`/modeles/${category.image}.png`}
                width={600}
                height={400}
                sizes="(max-width: 520px) 88vw, 280px"
                alt=""
              />
            ) : (
              <div className={styles.placeholder} aria-hidden>
                <FileText size={34} strokeWidth={1.5} />
              </div>
            )}
            <div className={styles.upcomingBody}>
              <span className={styles.badge}>Bientôt</span>
              <h3 id="category-title">{category.label}</h3>
              {category.fields && <p>À personnaliser · {category.fields}</p>}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
