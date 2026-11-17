"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import type { Agreement } from "@/lib/contract/agreement";
import type { SavedDraft } from "@/lib/contract/saved-contract";

const revisionWrites = new Map<string, Promise<void>>();

export function pendingRevisionWrite(url: string) {
  return revisionWrites.get(url);
}

type Status = "idle" | "saving" | "saved" | "error" | "conflict";

export function useContractSave(
  draft: Agreement,
  signedIn: boolean,
  saved?: SavedDraft,
  onSaved?: () => void,
) {
  const [initialDraft] = useState(draft);
  const [syncedDraft, setSyncedDraft] = useState(saved?.draft);
  const [phase, setPhase] = useState<Status>(saved ? "saved" : "idle");
  const id = useRef(saved?.id);
  const version = useRef(saved?.edit_version ?? 0);
  const fingerprint = useRef(saved?.historical?.fingerprint);
  const savedDraft = useRef(saved?.draft);
  const archivedDraft = useRef<Agreement>(undefined);
  const queue = useRef(Promise.resolve());
  const conflict = useRef(false);
  const pendingSave = useRef<(() => void) | null>(null);

  function save(snapshot: Agreement) {
    if (!signedIn || conflict.current) return;

    const historical = saved?.historical;
    const revisionUrl = historical
      ? `/api/contracts/${saved.id}?revision=${historical.revision}`
      : undefined;
    const write = queue.current.then(async () => {
      if (conflict.current) return;
      if (archivedDraft.current === snapshot && savedDraft.current === snapshot)
        return;

      setPhase("saving");
      try {
        id.current ??= crypto.randomUUID();
        const url = `/api/contracts/${id.current}`;
        const body = JSON.stringify(
          historical
            ? { draft: snapshot, fingerprint: fingerprint.current }
            : {
                draft: snapshot,
                base: version.current,
                operation: crypto.randomUUID(),
                archive: true,
              },
        );
        const send = () =>
          fetch(revisionUrl ?? url, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            signal: AbortSignal.timeout(15_000),
            body,
          });
        let response = await send().catch(() => null);
        if (!response || response.status === 503) response = await send();
        if (response.status === 409) {
          conflict.current = true;
          setPhase("conflict");
          return;
        }
        if (!response.ok) throw Error();
        const result = await response.json();
        if (historical) fingerprint.current = result.fingerprint;
        else version.current = result.edit_version;
        savedDraft.current = snapshot;
        archivedDraft.current = snapshot;
        setSyncedDraft(snapshot);
        setPhase("saved");
        onSaved?.();
      } catch {
        setPhase("error");
      }
    });
    queue.current = write;
    if (revisionUrl) {
      revisionWrites.set(revisionUrl, write);
      void write.then(() => {
        if (revisionWrites.get(revisionUrl) === write)
          revisionWrites.delete(revisionUrl);
      });
    }
  }

  const needsSync = draft !== (syncedDraft ?? initialDraft);
  const status =
    needsSync && (phase === "idle" || phase === "saved") ? "saving" : phase;
  const saveAutomatically = useEffectEvent(() => save(draft));

  // Flush a debounced edit when the library closes or switches revisions.
  useEffect(() => () => pendingSave.current?.(), []);
  useEffect(() => {
    pendingSave.current = null;
    if (!signedIn || !needsSync) return;
    const flush = () => {
      pendingSave.current = null;
      saveAutomatically();
    };
    pendingSave.current = flush;
    const timer = window.setTimeout(flush, 900);
    return () => window.clearTimeout(timer);
  }, [draft, signedIn, needsSync]);

  useEffect(() => {
    if (!signedIn || (!needsSync && status !== "saving")) return;
    function warnIfSaving(event: BeforeUnloadEvent) {
      if (savedDraft.current !== draft) event.preventDefault();
    }
    window.addEventListener("beforeunload", warnIfSaving);
    return () => window.removeEventListener("beforeunload", warnIfSaving);
  }, [draft, signedIn, needsSync, status]);

  return { status, save };
}
