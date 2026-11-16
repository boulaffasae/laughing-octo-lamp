"use client";

import { useEffect, useRef } from "react";

const reuseForMs = 5_000;

export type PreviewRequest<T> = {
  result: Promise<T>;
  abort: () => void;
};

// Keep at most one speculative request per library. Opening takes ownership of
// it, so hovering other cards cannot cancel the visible preview.
export function usePreviewRequest<T, Item>(
  getKey: (item: Item) => string,
  load: (item: Item, signal: AbortSignal) => Promise<T>,
) {
  const pending = useRef<{
    key: string;
    started: number;
    request: PreviewRequest<T>;
  }>(null);

  const active = useRef<PreviewRequest<T>>(null);

  useEffect(
    () => () => {
      pending.current?.request.abort();
      active.current?.abort();
    },
    [],
  );

  function prepare(item: Item) {
    const key = getKey(item);
    const now = Date.now();
    const current = pending.current;
    if (current?.key === key && now - current.started < reuseForMs)
      return current.request;

    current?.request.abort();
    const controller = new AbortController();
    const signal = AbortSignal.any([
      controller.signal,
      AbortSignal.timeout(30_000),
    ]);
    const request = {
      result: load(item, signal),
      abort: () => controller.abort(),
    };
    pending.current = { key, started: now, request };
    // Intent alone must neither surface an error nor prevent a retry on click.
    void request.result.catch(() => {
      if (pending.current?.request === request) pending.current = null;
    });
    return request;
  }

  return {
    warm: (item: Item) => {
      prepare(item);
    },
    take: (item: Item) => {
      const request = prepare(item);
      pending.current = null;
      active.current = request;
      return {
        result: request.result,
        abort: () => {
          if (active.current === request) active.current = null;
          request.abort();
        },
      };
    },
  };
}
