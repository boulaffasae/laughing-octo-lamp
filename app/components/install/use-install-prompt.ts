"use client";
import { useEffect, useRef, useState } from "react";
type InstallEvent = Event & {
  prompt(): Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISSED_KEY = "louma-install-dismissed-until";
const WEEK = 7 * 24 * 60 * 60 * 1000;

export function useInstallPrompt() {
  const installPromptRef = useRef<InstallEvent | null>(null);
  const wasDismissedRef = useRef(false);
  const [installMode, setInstallMode] = useState<"ios" | "native" | null>(null);
  const [isInstalling, setInstalling] = useState(false);

  useEffect(() => {
    const standaloneMedia = window.matchMedia("(display-mode: standalone)");
    const isStandalone = () =>
      standaloneMedia.matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    let isDismissed = false;
    try {
      isDismissed = Number(localStorage.getItem(DISMISSED_KEY)) > Date.now();
    } catch {
      // Storage can be unavailable in private or restricted browsing.
    }
    if (isStandalone() || isDismissed) return;

    let isDelayComplete = false;
    let isInstalled = false;
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const showBanner = () => {
      if (isInstalled || wasDismissedRef.current || isStandalone()) return;
      if (isDelayComplete && (isIOS || installPromptRef.current)) {
        setInstallMode(isIOS ? "ios" : "native");
      }
    };
    const captureInstallPrompt = (event: Event) => {
      event.preventDefault();
      installPromptRef.current = event as InstallEvent;
      showBanner();
    };
    const hideBanner = () => {
      isInstalled = true;
      installPromptRef.current = null;
      setInstallMode(null);
    };
    const handleDisplayChange = () => {
      if (isStandalone()) hideBanner();
    };
    const displayTimer = window.setTimeout(() => {
      isDelayComplete = true;
      showBanner();
    }, 30_000);
    window.addEventListener("beforeinstallprompt", captureInstallPrompt);
    window.addEventListener("appinstalled", hideBanner);
    standaloneMedia.addEventListener("change", handleDisplayChange);
    return () => {
      window.clearTimeout(displayTimer);
      window.removeEventListener("beforeinstallprompt", captureInstallPrompt);
      window.removeEventListener("appinstalled", hideBanner);
      standaloneMedia.removeEventListener("change", handleDisplayChange);
    };
  }, []);

  function dismissBanner() {
    wasDismissedRef.current = true;
    setInstallMode(null);
    try {
      localStorage.setItem(DISMISSED_KEY, String(Date.now() + WEEK));
    } catch {
      // Dismissal still works for this visit when storage is unavailable.
    }
  }

  async function installApp() {
    const event = installPromptRef.current;
    if (!event) return;
    installPromptRef.current = null;
    setInstalling(true);
    try {
      const { outcome } = await event.prompt();
      if (outcome === "dismissed") dismissBanner();
      else setInstallMode(null);
    } catch {
      setInstallMode(null);
    } finally {
      setInstalling(false);
    }
  }

  return { installMode, isInstalling, dismissBanner, installApp };
}
