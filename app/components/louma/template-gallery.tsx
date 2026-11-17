"use client";

import { ChevronLeft, ChevronRight, FileText, Search, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  contractTemplatePath,
  contractTemplates,
} from "@/lib/contract/templates";
import styles from "./home.module.css";

type Category = {
  label: string;
  image?: string;
};

const rentalCategory: Category = { label: "Contrat de location de voiture" };

const featuredCategories: Category[] = [
  rentalCategory,
  {
    label: "Procuration",
    image: "procuration",
  },
  {
    label: "Quittance de loyer",
    image: "quittance",
  },
  {
    label: "Invitation de mariage",
    image: "mariage",
  },
  { label: "Règlement intérieur" },
  { label: "Bon de livraison" },
  { label: "Bon de commande" },
  {
    label: "Menus de restaurants et de snacks",
    image: "menu",
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

const categories: Category[] = [
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

const searchStopWords = new Set([
  "a",
  "d",
  "de",
  "des",
  "du",
  "en",
  "et",
  "je",
  "l",
  "la",
  "le",
  "les",
  "pour",
  "un",
  "une",
  "veux",
  "voudrais",
]);

function searchTerms(query: string) {
  return normalizeSearch(query)
    .split(" ")
    .filter((term) => term && !searchStopWords.has(term));
}

function matchesWord(term: string, word: string) {
  if (word.startsWith(term)) return true;
  if (term.length < 4) return false;

  const prefix = word.slice(0, term.length);
  const mismatch = [...term].findIndex(
    (character, index) => character !== prefix[index],
  );
  const before = term.slice(0, mismatch);
  const tail = term.slice(mismatch + 1);
  return (
    word.startsWith(before + tail) ||
    prefix.slice(mismatch + 1) === tail ||
    word.slice(mismatch + 1).startsWith(term.slice(mismatch)) ||
    word.startsWith(
      before + term[mismatch + 1] + term[mismatch] + term.slice(mismatch + 2),
    )
  );
}

function matchesSearch(value: string, terms: string[]) {
  const words = normalizeSearch(value).split(" ");
  return terms.every((term) => words.some((word) => matchesWord(term, word)));
}

export function TemplateGallery() {
  const [category, setCategory] = useState<Category | null>(rentalCategory);
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [scroll, setScroll] = useState({ previous: false, next: false });
  const track = useRef<HTMLDivElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const modelTrack = useRef<HTMLUListElement>(null);

  const terms = searchTerms(query);
  const suggestions = categories.filter(({ label }) =>
    matchesSearch(label, terms),
  );
  const submittedTerms = searchTerms(submittedQuery);
  const models = contractTemplates
    .filter(({ fr }) =>
      category
        ? category === rentalCategory
        : matchesSearch(`${rentalCategory.label} ${fr}`, submittedTerms),
    )
    .slice(0, 10);
  const upcoming = category
    ? category === rentalCategory
      ? []
      : [category]
    : submittedTerms.length > 0
      ? categories.filter(
          (option) =>
            option !== rentalCategory &&
            matchesSearch(option.label, submittedTerms),
        )
      : [];

  function resetSearch() {
    setQuery("");
    setSubmittedQuery("");
    setCategory(rentalCategory);
  }

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
      aria-label="Catalogue des modèles"
    >
      <form
        role="search"
        className={styles.categorySearch}
        onSubmit={(event) => {
          event.preventDefault();
          setSubmittedQuery(query);
          setCategory(null);
          if (modelTrack.current) modelTrack.current.scrollLeft = 0;
        }}
      >
        <div className={styles.searchField}>
          <input
            ref={searchInput}
            type="search"
            aria-label="Décrivez votre besoin"
            aria-controls="modeles-categories"
            placeholder="Décrivez votre besoin"
            value={query}
            onChange={(event) => {
              if (event.target.value) setQuery(event.target.value);
              else resetSearch();
            }}
          />
          {query && (
            <button
              className={styles.clearSearch}
              type="button"
              aria-label="Effacer la recherche"
              onClick={() => {
                resetSearch();
                searchInput.current?.focus();
              }}
            >
              <X size={18} aria-hidden />
            </button>
          )}
        </div>
        <button className={styles.searchSubmit} type="submit">
          <Search size={18} aria-hidden />
          Rechercher
        </button>
      </form>
      <div className={styles.categorySlider}>
        <div
          id="modeles-categories"
          className={styles.categoryTrack}
          ref={track}
          role="group"
          aria-label="Catégories de documents"
        >
          {suggestions.map((option) => (
            <button
              key={option.label}
              type="button"
              className={styles.chip}
              aria-pressed={category === option}
              aria-controls="modeles-panel"
              onClick={() => {
                setCategory(option);
                if (modelTrack.current) modelTrack.current.scrollLeft = 0;
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
        {suggestions.length > 0 && (
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
        className={suggestions.length ? "sr-only" : styles.noCategories}
        role="status"
      >
        {suggestions.length === 0
          ? "Aucune catégorie trouvée."
          : query.trim() &&
            `${suggestions.length} catégorie${suggestions.length === 1 ? "" : "s"}`}
      </p>

      <div id="modeles-panel" className={styles.panel}>
        {models.length > 0 && (
          <p className="sr-only" role="status">
            {models.length}{" "}
            {models.length === 1 ? "modèle disponible" : "modèles disponibles"}
          </p>
        )}
        {models.length > 0 || upcoming.length > 0 ? (
          <ul
            className={styles.cards}
            ref={modelTrack}
            role="list"
            aria-label="Résultats des modèles"
          >
            {models.map((template) => (
              <li key={template.id}>
                <Link
                  href={contractTemplatePath(template)}
                  className={`${styles.card} ${styles.cardLink}`}
                  aria-label={`Essayer le modèle ${template.fr} de contrat de location de voiture`}
                >
                  <Image
                    src={`/modeles/${template.id}.png`}
                    width={640}
                    height={640}
                    sizes="190px"
                    alt=""
                  />
                  <div className={styles.cardBody}>
                    <span className={styles.cardTitle}>{template.fr}</span>
                    <span>Essayer</span>
                  </div>
                </Link>
              </li>
            ))}
            {upcoming.map((option) => (
              <li key={option.label}>
                <div className={styles.card}>
                  {option.image ? (
                    <Image
                      src={`/modeles/${option.image}.png`}
                      width={600}
                      height={400}
                      sizes="190px"
                      alt=""
                    />
                  ) : (
                    <div className={styles.placeholder} aria-hidden>
                      <FileText size={34} strokeWidth={1.5} />
                    </div>
                  )}
                  <div className={styles.cardBody}>
                    <span className={styles.cardTitle} title={option.label}>
                      {option.label}
                    </span>
                    <span>Bientôt</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.noCategories} role="status">
            Aucun modèle trouvé.
          </p>
        )}
      </div>
    </section>
  );
}
