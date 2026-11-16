"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import type { Agreement } from "@/lib/contract/agreement";
import type { SavedDraft } from "@/lib/contract/saved-contract";

type Status = "idle" | "saving" | "saved" | "archived" | "error" | "conflict";

export function useContractSave(
  draft: Agreement,
  signedIn: boolean,
  saved?: SavedDraft,
) {
  const [autoSave, setAutoSave] = useState(Boolean(saved));
  const [status, setStatus] = useState<Status>("idle");
  const [hasSaved, setHasSaved] = useState(Boolean(saved));
  const id = useRef(saved?.id);
  const version = useRef(saved?.edit_version ?? 0);
  const savedDraft = useRef(saved?.draft);
  const archivedDraft = useRef<Agreement>(undefined);
  const queue = useRef(Promise.resolve());
  const conflict = useRef(false);

  function save(snapshot: Agreement, archive: boolean, after?: Promise<Blob>) {
    if (!signedIn || conflict.current) return;

    queue.current = queue.current.then(async () => {
      if (conflict.current) return;
      if (after) {
        try {
          await after;
        } catch {
          return; // The download action reports PDF generation errors.
        }
      }
      if (
        archive
          ? archivedDraft.current === snapshot
          : savedDraft.current === snapshot
      )
        return;

      setStatus("saving");
      try {
        id.current ??= crypto.randomUUID();
        const body = JSON.stringify({
          draft: snapshot,
          base: version.current,
          operation: crypto.randomUUID(),
          archive,
        });
        const send = () =>
          fetch(`/api/contracts/${id.current}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            signal: AbortSignal.timeout(15_000),
            body,
          });
        let response = await send().catch(() => null);
        if (!response || response.status === 503) response = await send();
        if (response.status === 409) {
          conflict.current = true;
          setStatus("conflict");
          return;
        }
        if (!response.ok) throw Error();
        version.current = (await response.json()).edit_version;
        savedDraft.current = snapshot;
        if (archive) archivedDraft.current = snapshot;
        setHasSaved(true);
        setStatus(archive ? "archived" : "saved");
      } catch {
        setStatus("error");
      }
    });
  }

  const saveAutomatically = useEffectEvent(() => save(draft, false));
  useEffect(() => {
    if (!signedIn || !autoSave) return;
    const timer = window.setTimeout(saveAutomatically, 900);
    return () => window.clearTimeout(timer);
  }, [draft, signedIn, autoSave]);

  useEffect(() => {
    if (!signedIn || (!autoSave && status !== "saving")) return;
    function warnIfSaving(event: BeforeUnloadEvent) {
      if (status === "saving" || savedDraft.current !== draft)
        event.preventDefault();
    }
    window.addEventListener("beforeunload", warnIfSaving);
    return () => window.removeEventListener("beforeunload", warnIfSaving);
  }, [draft, signedIn, autoSave, status]);

  return { autoSave, setAutoSave, status, hasSaved, save };
}
