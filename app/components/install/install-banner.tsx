"use client";
import { Download, X } from "lucide-react";
import { useCopy } from "@/app/translations";
import { useInstallPrompt } from "./use-install-prompt";

export function InstallBanner() {
  const { installBanner: copy } = useCopy();
  const { installMode, isInstalling, dismissBanner, installApp } =
    useInstallPrompt();
  if (!installMode) return null;

  return (
    <aside className="install-banner" aria-labelledby="install-banner-title">
      <Download size={24} aria-hidden="true" className="install-banner-icon" />
      <div className="install-banner-copy">
        <h2 id="install-banner-title">{copy.title}</h2>
        <p>{installMode === "ios" ? copy.ios : copy.description}</p>
        {installMode === "native" && (
          <button
            className="button"
            onClick={installApp}
            disabled={isInstalling}
          >
            {isInstalling ? copy.installing : copy.install}
          </button>
        )}
      </div>
      <button
        className="install-banner-close"
        onClick={dismissBanner}
        aria-label={copy.dismiss}
      >
        <X size={20} aria-hidden="true" />
      </button>
    </aside>
  );
}
