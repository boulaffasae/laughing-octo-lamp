"use client";

import { useCopy } from "@/app/translations";
import type { ContractBuilderState } from "./use-contract-builder";
import { Download } from "lucide-react";
import { RentalDatePicker } from "./rental-date-picker";

export function RentalForm({ builder }: { builder: ContractBuilderState }) {
  const copy = useCopy();
  const labels: Record<string, string> = copy.labels;
  const {
    rental,
    setRental,
    isRentalValid,
    isDownloading,
    errorMessage,
    downloadContract,
  } = builder;
  return (
    <form
      className="rental-form"
      onSubmit={(e) => {
        e.preventDefault();
        downloadContract();
      }}
    >
      <label className="agency-field">
        {labels.agency}
        <input
          required
          value={rental.agency}
          onChange={(e) => setRental({ ...rental, agency: e.target.value })}
        />
      </label>
      <RentalDatePicker
        start={rental.start}
        end={rental.end}
        onChange={(start, end) => setRental({ ...rental, start, end })}
      />
      <p className="contract-note">{copy.pdfNote}</p>
      <button
        type="submit"
        className="button"
        disabled={!isRentalValid || isDownloading}
      >
        <Download size={17} />
        {isDownloading ? "…" : copy.download}
      </button>
      {errorMessage && (
        <p role="alert" className="error">
          {errorMessage}
        </p>
      )}
    </form>
  );
}
