"use client";
import { Check, CreditCard, CarFront, ShieldCheck } from "lucide-react";
import { useCopy } from "@/app/translations";
export function DocumentChecklist({
  documentIndex,
}: {
  documentIndex: number;
}) {
  const copy = useCopy();
  return (
    <div className="checklist-panel">
      <div className="progress-title">
        <b>{copy.documentsLabel}</b>
        <span>{Math.min(documentIndex, 3)} / 3</span>
      </div>
      <div className="progress-track">
        <span style={{ width: `${(documentIndex / 3) * 100}%` }} />
      </div>
      {copy.docs.map((name, i) => {
        const Icon = [CreditCard, CreditCard, CarFront][i];
        return (
          <div
            className={`checklist-row ${i === documentIndex ? "active" : ""} ${i < documentIndex ? "complete" : ""}`}
            key={name}
          >
            <div className="step-number">
              {i < documentIndex ? <Check size={17} /> : i + 1}
            </div>
            <div className="document-name">
              <h3>{name}</h3>
              <p>{copy.detail[i]}</p>
              <span>
                {i < documentIndex
                  ? copy.checked
                  : i === documentIndex
                    ? copy.current
                    : copy.next}
              </span>
            </div>
            <Icon size={21} />
          </div>
        );
      })}
      <div className="checklist-security">
        <ShieldCheck size={18} />
        <span>{copy.privacy}</span>
      </div>
    </div>
  );
}
