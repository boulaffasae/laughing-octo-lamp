"use client";

import { useEffect, useRef, useState } from "react";
import { Download, X } from "lucide-react";
import { useCopy } from "../translations";

type InstallEvent = Event & {
  prompt(): Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISSED_KEY = "louma-install-dismissed-until";
const WEEK = 7 * 24 * 60 * 60 * 1000;

export function InstallBanner() {
  const { installBanner: copy } = useCopy();
  const prompt = useRef<InstallEvent | null>(null);
  const suppressed = useRef(false);
  const [mode, setMode] = useState<"ios" | "native" | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const display = window.matchMedia("(display-mode: standalone)");
    const isStandalone = () =>
      display.matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    let dismissed = false;
    try {
      dismissed = Number(localStorage.getItem(DISMISSED_KEY)) > Date.now();
    } catch {
      // Storage can be unavailable in private or restricted browsing.
    }
    if (isStandalone() || dismissed) return;

    let ready = false;
    let installed = false;
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const reveal = () => {
      if (installed || suppressed.current || isStandalone()) return;
      if (ready && (isIOS || prompt.current)) {
        setMode(isIOS ? "ios" : "native");
      }
    };
    const capture = (event: Event) => {
      event.preventDefault();
      prompt.current = event as InstallEvent;
      reveal();
    };
    const hide = () => {
      installed = true;
      prompt.current = null;
      setMode(null);
    };
    const displayChanged = () => {
      if (isStandalone()) hide();
    };
    const timer = window.setTimeout(() => {
      ready = true;
      reveal();
    }, 30_000);
    window.addEventListener("beforeinstallprompt", capture);
    window.addEventListener("appinstalled", hide);
    display.addEventListener("change", displayChanged);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", capture);
      window.removeEventListener("appinstalled", hide);
      display.removeEventListener("change", displayChanged);
    };
  }, []);

  function dismiss() {
    suppressed.current = true;
    setMode(null);
    try {
      localStorage.setItem(DISMISSED_KEY, String(Date.now() + WEEK));
    } catch {
      // Dismissal still works for this visit when storage is unavailable.
    }
  }

  async function install() {
    const event = prompt.current;
    if (!event) return;
    prompt.current = null;
    setBusy(true);
    try {
      const { outcome } = await event.prompt();
      if (outcome === "dismissed") dismiss();
      else setMode(null);
    } catch {
      setMode(null);
    } finally {
      setBusy(false);
    }
  }

  if (!mode) return null;

  return (
    <aside className="install-banner" aria-labelledby="install-banner-title">
      <Download size={24} aria-hidden="true" className="install-banner-icon" />
      <div className="install-banner-copy">
        <h2 id="install-banner-title">{copy.title}</h2>
        <p>{mode === "ios" ? copy.ios : copy.description}</p>
        {mode === "native" && (
          <button className="button" onClick={install} disabled={busy}>
            {busy ? copy.installing : copy.install}
          </button>
        )}
      </div>
      <button
        className="install-banner-close"
        onClick={dismiss}
        aria-label={copy.dismiss}
      >
        <X size={20} aria-hidden="true" />
      </button>
    </aside>
  );
}
