"use client";

import { useReducer } from "react";
import type { Agreement } from "@/lib/contract/agreement";

type History = {
  current: Agreement;
  past: Agreement[];
  future: Agreement[];
  editing: boolean;
};

type Action =
  | { type: "edit"; apply: (current: Agreement) => Agreement; group: boolean }
  | { type: "finish" | "undo" | "redo" };

function reduce(history: History, action: Action): History {
  const { current, past, future } = history;
  switch (action.type) {
    case "edit":
      return {
        current: action.apply(current),
        past:
          action.group && history.editing
            ? past
            : [...past.slice(-29), current],
        future: [],
        editing: action.group,
      };
    case "finish":
      return history.editing ? { ...history, editing: false } : history;
    case "undo":
      return past.length
        ? {
            current: past[past.length - 1],
            past: past.slice(0, -1),
            future: [current, ...future],
            editing: false,
          }
        : history;
    case "redo":
      return future.length
        ? {
            current: future[0],
            past: [...past, current],
            future: future.slice(1),
            editing: false,
          }
        : history;
  }
}

export function useAgreementHistory(initial: () => Agreement) {
  const [history, dispatch] = useReducer(reduce, initial, (initialize) => ({
    current: initialize(),
    past: [],
    future: [],
    editing: false,
  }));

  return {
    agreement: history.current,
    setAgreement: (apply: (current: Agreement) => Agreement, group = true) =>
      dispatch({ type: "edit", apply, group }),
    finishEdit: () => dispatch({ type: "finish" }),
    undo: () => dispatch({ type: "undo" }),
    redo: () => dispatch({ type: "redo" }),
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
  };
}
