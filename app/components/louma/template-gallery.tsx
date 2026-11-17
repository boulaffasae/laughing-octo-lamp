"use client";

import {
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  Search,
  X,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
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

const categories = [
  ...featuredCategories,
  ...moreCategories.flatMap(({ labels }) => labels.map((label) => ({ label }))),
];

function normalizeSearch(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

export function TemplateGallery({
  color,
  onSelect,
}: {
  color: string;
  onSelect: (color: string) => void;
}) {
  const [category, setCategory] = useState<Category>(rentalCategory);
  const isRental = category.label === rentalCategory.label;

  const [query, setQuery] = useState("");
  const [scroll, setScroll] = useState({ previous: false, next: false });
  const track = useRef<HTMLDivElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const terms = normalizeSearch(query).split(" ").filter(Boolean);
  const results = categories.filter(({ label }) =>
    terms.every((term) => normalizeSearch(label).includes(term)),
  );

  useEffect(() => {
    const element = track.current;
    if (!element) return;

    const updateScroll = () => {
      setScroll({
        previous: element.scrollLeft > 1,
        next:
          element.scrollLeft + element.clientWidth < element.scrollWidth - 1,
      });
    };

    element.scrollLeft = 0;
    updateScroll();
    const observer = new ResizeObserver(updateScroll);
    observer.observe(element);
    element.addEventListener("scroll", updateScroll, { passive: true });
    return () => {
      observer.disconnect();
      element.removeEventListener("scroll", updateScroll);
    };
  }, [query]);

  function scrollCategories(direction: number) {
    const element = track.current;
    if (!element) return;
    element.scrollBy({
      left: direction * element.clientWidth * 0.8,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  }

  return (
    <section
      className={`shell ${styles.gallery}`}
      id="modeles"
      aria-labelledby="modeles-title"
    >
      <h2 id="modeles-title">Modèles de documents</h2>
      <div className={styles.categorySearch}>
        <Search size={18} aria-hidden />
        <input
          ref={searchInput}
          type="search"
          aria-label="Rechercher une catégorie"
          aria-controls="modeles-categories"
          placeholder="Rechercher une catégorie"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        {query && (
          <button
            className={styles.iconButton}
            type="button"
            aria-label="Effacer la recherche"
            onClick={() => {
              setQuery("");
              searchInput.current?.focus();
            }}
          >
            <X size={18} aria-hidden />
          </button>
        )}
      </div>
      <div className={styles.categorySlider}>
        <div
          id="modeles-categories"
          className={styles.categoryTrack}
          ref={track}
          role="group"
          aria-label="Catégories de documents"
        >
          {results.map((option) => (
            <button
              key={option.label}
              type="button"
              className={styles.chip}
              aria-pressed={category.label === option.label}
              aria-controls="modeles-panel"
              onClick={() => setCategory(option)}
            >
              {option.label}
              {option !== rentalCategory && (
                <span className={styles.chipStatus}>Bientôt</span>
              )}
            </button>
          ))}
        </div>
        {results.length > 0 && (
          <div
            className={styles.sliderControls}
            data-overflow={scroll.previous || scroll.next}
          >
            <button
              className={styles.iconButton}
              type="button"
              aria-label="Catégories précédentes"
              aria-controls="modeles-categories"
              disabled={!scroll.previous}
              onClick={() => scrollCategories(-1)}
            >
              <ChevronLeft size={20} aria-hidden />
            </button>
            <button
              className={styles.iconButton}
              type="button"
              aria-label="Catégories suivantes"
              aria-controls="modeles-categories"
              disabled={!scroll.next}
              onClick={() => scrollCategories(1)}
            >
              <ChevronRight size={20} aria-hidden />
            </button>
          </div>
        )}
      </div>
      <p
        className={results.length ? "sr-only" : styles.noCategories}
        role="status"
      >
        {results.length === 0
          ? "Aucune catégorie trouvée."
          : query.trim() &&
            `${results.length} catégorie${results.length === 1 ? "" : "s"}`}
      </p>

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
