"use client";

import { ArrowDown, Columns2, LayoutList, SquaresExclude } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { contractTemplates } from "@/lib/contract/templates";
import styles from "./home.module.css";

const filters = [
  { id: "all", label: "Tous les modèles", Icon: SquaresExclude },
  { id: "columns", label: "Deux colonnes", Icon: Columns2 },
  { id: "wide", label: "Section pleine largeur", Icon: LayoutList },
] as const;

export function TemplateGallery({
  color,
  onSelect,
}: {
  color: string;
  onSelect: (color: string) => void;
}) {
  const [filter, setFilter] = useState<(typeof filters)[number]["id"]>("all");
  const templates = contractTemplates.filter(
    (template) =>
      filter === "all" || filter === (template.wideFields ? "wide" : "columns"),
  );

  return (
    <section
      className={`shell ${styles.gallery}`}
      id="modeles"
      aria-labelledby="modeles-title"
    >
      <h2 id="modeles-title">Modèles de contrat de location de voiture</h2>
      <div
        className={styles.filters}
        role="group"
        aria-label="Filtrer par mise en page"
      >
        {filters.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            className={styles.chip}
            aria-pressed={filter === id}
            aria-controls="modeles-list"
            onClick={() => setFilter(id)}
          >
            <Icon size={16} aria-hidden />
            {label}
          </button>
        ))}
      </div>
      <p className="sr-only" role="status">
        {templates.length} modèles affichés
      </p>
      <ul className={styles.cards} id="modeles-list">
        {templates.map((template) => (
          <li key={template.id} className={styles.card}>
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
                sizes="(max-width: 520px) calc(100vw - 32px), (max-width: 900px) 45vw, 300px"
                alt=""
              />
              <div className={styles.cardBody}>
                <div>
                  <h3>{template.fr}</h3>
                  <span>Utiliser ce modèle</span>
                </div>
                <ArrowDown size={18} aria-hidden />
              </div>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
