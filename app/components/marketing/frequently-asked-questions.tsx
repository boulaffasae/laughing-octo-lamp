"use client";
import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { useCopy } from "@/app/translations";

export function FrequentlyAskedQuestions() {
  const copy = useCopy();
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(0);
  return (
    <section id="faq" className="faq section">
      <div>
        <div className="eyebrow coral">FAQ</div>
        <h2>{copy.faq}</h2>
      </div>
      <div>
        {copy.faqQuestions.map((q, i) => (
          <div className="faq-item" key={q}>
            <button
              aria-expanded={expandedQuestion === i}
              onClick={() =>
                setExpandedQuestion(expandedQuestion === i ? null : i)
              }
            >
              {q}
              {expandedQuestion === i ? (
                <Minus size={18} />
              ) : (
                <Plus size={18} />
              )}
            </button>
            {expandedQuestion === i && <p>{copy.faqAnswers[i]}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}
