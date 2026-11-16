"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type FocusEvent,
  type FormEvent,
} from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { words } from "@/lib/contract/agreement";
import type { Locale } from "@/i18n/locales";

const steps = [
  ["Importer votre logo", "أضف شعارك"],
  ["Ajouter le nom de l’agence", "أضف اسم الوكالة"],
  ["Renseigner le locataire", "أدخل معلومات المستأجر"],
  ["Renseigner le véhicule", "أدخل معلومات السيارة"],
  ["Indiquer le départ et le retour", "حدّد موعدي التسليم والإرجاع"],
  ["Décrire l’état du véhicule", "صِف حالة السيارة"],
  ["Saisir le total et la caution", "أدخل المجموع والضمان"],
  ["Indiquer le lieu et la date de signature", "أدخل مكان وتاريخ التوقيع"],
  ["Mettre à jour les coordonnées de l’agence", "حدّث بيانات الوكالة"],
] as const;

export function useContractTour(locale: Locale, startOpen: boolean) {
  const t = words(locale);
  const id = useId();
  const [step, setStep] = useState(startOpen ? 1 : 0);
  const activeHint = useRef<HTMLDivElement>(null);
  const edited = useRef(false);
  const shouldScroll = useRef(false);
  const shouldFocus = useRef(false);
  const Previous = locale === "ar" ? ChevronRight : ChevronLeft;

  function go(next: number, focus = false) {
    edited.current = false;
    if (next === step && next > 0) {
      activeHint.current?.scrollIntoView({ block: "center" });
      if (focus) activeHint.current?.focus({ preventScroll: true });
      return;
    }
    shouldFocus.current = focus;
    shouldScroll.current = next > 0;
    setStep(next);
  }

  useEffect(() => {
    if (!step || !shouldScroll.current) return;
    shouldScroll.current = false;
    activeHint.current?.scrollIntoView({ block: "center" });
    if (shouldFocus.current) activeHint.current?.focus({ preventScroll: true });
  }, [step]);

  function next(focus = false) {
    go(step === steps.length ? 0 : step + 1, focus);
  }

  function onChange(event: FormEvent<HTMLElement>) {
    const target = event.target;
    if (
      step > 1 &&
      target instanceof HTMLElement &&
      target.closest("[data-tour-step]")?.getAttribute("data-tour-step") ===
        String(step)
    ) {
      edited.current = true;
    }
  }

  function onBlur(event: FocusEvent<HTMLElement>) {
    if (!edited.current || !(event.target instanceof HTMLElement)) return;
    const section = event.target.closest("[data-tour-step]");
    if (section?.getAttribute("data-tour-step") !== String(step)) return;
    const destination = event.relatedTarget;
    if (
      destination instanceof HTMLElement &&
      (section.contains(destination) || destination.closest(".contract-tour"))
    )
      return;
    next();
  }

  function hint(number: number) {
    if (step !== number) return null;
    const [fr, ar] = steps[number - 1];
    return (
      <div
        className="contract-tour"
        ref={activeHint}
        tabIndex={-1}
        dir={locale === "ar" ? "rtl" : "ltr"}
      >
        <p id={id} className="contract-tour-title" role="status">
          <span className="contract-tour-count">
            {number} / {steps.length}
          </span>
          {t(fr, ar)}
        </p>
        <div className="contract-tour-actions">
          {number > 1 && (
            <button
              type="button"
              aria-label={t("Étape précédente", "الخطوة السابقة")}
              onClick={() => go(number - 1, true)}
            >
              <Previous size={17} aria-hidden />
            </button>
          )}
          <button
            type="button"
            className="contract-tour-next"
            onClick={() => next(true)}
          >
            {number === steps.length
              ? t("Terminer", "إنهاء")
              : number === 1
                ? t("Passer", "تخطّي")
                : t("Suivant", "التالي")}
          </button>
          <button
            type="button"
            aria-label={t("Fermer le guide", "إغلاق الدليل")}
            onClick={() => go(0)}
          >
            <X size={17} aria-hidden />
          </button>
        </div>
      </div>
    );
  }

  return {
    step,
    hint,
    onChange,
    onBlur,
    start: () => go(1, true),
    logoUploaded: () => {
      shouldScroll.current = true;
      shouldFocus.current = false;
      setStep((current) => (current === 1 ? 2 : current));
    },
    describedBy: (number: number) => (step === number ? id : undefined),
  };
}
