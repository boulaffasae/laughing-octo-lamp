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
  description: string;
  image?: string;
};

const rentalCategory: Category = {
  label: "Contrat de location de voiture",
  description:
    "Renseignez le locataire, le véhicule et les conditions de location.",
};

const featuredCategories: Category[] = [
  rentalCategory,
  {
    label: "Procuration",
    description:
      "Autorisez une personne à effectuer une démarche en votre nom.",
    image: "procuration",
  },
  {
    label: "Quittance de loyer",
    description:
      "Attestez le paiement du loyer et des charges pour une période donnée.",
    image: "quittance",
  },
  {
    label: "Invitation de mariage",
    description: "Annoncez la date et le lieu de la cérémonie à vos invités.",
    image: "mariage",
  },
  {
    label: "Règlement intérieur",
    description: "Présentez les règles de fonctionnement et de vie collective.",
  },
  {
    label: "Bon de livraison",
    description:
      "Consignez les articles et les quantités remis au destinataire.",
  },
  {
    label: "Bon de commande",
    description: "Précisez les articles commandés, les quantités et les prix.",
  },
  {
    label: "Menus de restaurants et de snacks",
    description: "Présentez les plats, les boissons et leurs prix.",
    image: "menu",
  },
];

const moreCategories = [
  {
    title: "Démarches et attestations",
    options: [
      {
        label: "Déclaration sur l’honneur",
        description: "Déclarez des faits sous votre responsabilité.",
      },
      {
        label: "Attestation d’hébergement",
        description: "Confirmez qu’une personne est hébergée à votre adresse.",
      },
      {
        label: "Autorisation parentale",
        description:
          "Formalisez l’accord d’un parent pour une activité ou une démarche.",
      },
      {
        label: "Lettre de demande",
        description: "Présentez votre demande et les éléments qui la motivent.",
      },
      {
        label: "Lettre de réclamation",
        description: "Décrivez le problème rencontré et la solution attendue.",
      },
    ],
  },
  {
    title: "Logement et location",
    options: [
      {
        label: "Bail d’habitation",
        description: "Précisez les conditions de location d’un logement.",
      },
      {
        label: "État des lieux",
        description:
          "Consignez l’état du logement et de ses équipements à l’entrée ou à la sortie.",
      },
      {
        label: "Avis d’échéance",
        description:
          "Indiquez le montant du loyer et des charges à régler ainsi que la date limite.",
      },
      {
        label: "Reçu de dépôt de garantie",
        description:
          "Confirmez le versement du dépôt de garantie par le locataire.",
      },
      {
        label: "Inventaire de location meublée",
        description:
          "Recensez le mobilier et les équipements mis à disposition.",
      },
    ],
  },
  {
    title: "Commerce et services",
    options: [
      {
        label: "Facture",
        description:
          "Détaillez les biens ou services facturés et le montant à régler.",
      },
      {
        label: "Devis",
        description:
          "Présentez les prestations proposées et leur prix avant l’accord du client.",
      },
      {
        label: "Reçu de paiement",
        description:
          "Confirmez la réception d’un paiement pour un montant et une date donnés.",
      },
      {
        label: "Catalogue de produits",
        description:
          "Présentez votre gamme avec les références et les caractéristiques des produits.",
      },
      {
        label: "Grille tarifaire",
        description: "Indiquez vos prix par prestation ou formule.",
      },
      {
        label: "Fiche d’intervention",
        description:
          "Consignez les travaux effectués, leur durée et les observations du technicien.",
      },
      {
        label: "Procès-verbal de réception",
        description:
          "Consignez l’acceptation des travaux et les réserves éventuelles.",
      },
    ],
  },
  {
    title: "Travail, école et associations",
    options: [
      {
        label: "CV",
        description:
          "Présentez votre parcours, vos formations et vos compétences.",
      },
      {
        label: "Lettre de motivation",
        description:
          "Expliquez votre intérêt pour un poste et les expériences qui appuient votre candidature.",
      },
      {
        label: "Attestation de travail",
        description: "Confirmez l’emploi occupé et la période de travail.",
      },
      {
        label: "Attestation de stage",
        description: "Confirmez les dates du stage et les missions réalisées.",
      },
      {
        label: "Autorisation de sortie scolaire",
        description:
          "Recueillez l’accord parental pour la participation d’un élève à une sortie.",
      },
      {
        label: "Bulletin d’adhésion",
        description:
          "Recueillez les coordonnées d’un nouveau membre et son choix de cotisation.",
      },
      {
        label: "Procès-verbal de réunion",
        description:
          "Consignez les participants, les décisions et les actions convenues.",
      },
    ],
  },
  {
    title: "Événements et restauration",
    options: [
      {
        label: "Invitation d’anniversaire",
        description:
          "Communiquez la date, le lieu et les modalités de réponse aux invités.",
      },
      {
        label: "Faire-part de naissance",
        description: "Annoncez la naissance de votre enfant à vos proches.",
      },
      {
        label: "Programme d’événement",
        description:
          "Présentez les horaires, les lieux et les activités prévues.",
      },
      {
        label: "Plan de table",
        description: "Indiquez à chaque invité la table qui lui est attribuée.",
      },
      {
        label: "Carte de traiteur",
        description:
          "Présentez les plats, les formules et les conditions de commande.",
      },
      {
        label: "Menu du Ramadan",
        description:
          "Présentez les plats et les formules proposés pendant le Ramadan.",
      },
      {
        label: "Carte de fidélité",
        description:
          "Indiquez comment cumuler les visites ou les achats et obtenir une récompense.",
      },
    ],
  },
];

const categories: Category[] = [
  ...featuredCategories,
  ...moreCategories.flatMap(({ options }) => options),
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
                  aria-describedby={`model-description-${template.id}`}
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
                <p id={`model-description-${template.id}`} className="sr-only">
                  {template.description}
                </p>
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
                  <p className="sr-only">{option.description}</p>
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
