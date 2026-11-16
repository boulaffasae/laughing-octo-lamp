"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ChevronDown } from "lucide-react";
import { useAuth, useClerk, useUser } from "@clerk/nextjs";
import { words } from "@/lib/contract/agreement";
import type { Locale } from "@/i18n/locales";

type Account = {
  signedIn: boolean;
  ready: boolean;
  available: boolean;
  avatarUrl?: string;
  signOut?: (redirectUrl: string) => Promise<void>;
  signIn: () => void;
  signUp: () => void;
};
const Context = createContext<Account>({
  signedIn: false,
  ready: true,
  available: false,
  signIn: () => {},
  signUp: () => {},
});
export const useAccount = () => useContext(Context);

export function AccountContext({ children }: { children: ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();
  const clerk = useClerk();
  const { user } = useUser();
  return (
    <Context.Provider
      value={{
        signedIn: Boolean(isSignedIn),
        ready: isLoaded,
        available: true,
        avatarUrl: user?.imageUrl,
        signOut: (redirectUrl) => clerk.signOut({ redirectUrl }),
        signIn: () => clerk.openSignIn(),
        signUp: () => clerk.openSignUp(),
      }}
    >
      {children}
    </Context.Provider>
  );
}

function AccountMenu({
  locale,
  avatar,
  signOut,
}: {
  locale: Locale;
  avatar: ReactNode;
  signOut: Account["signOut"];
}) {
  const t = words(locale);
  const menu = useRef<HTMLDetailsElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    function dismiss(event: Event) {
      if (
        menu.current?.open &&
        event.target instanceof Node &&
        !menu.current.contains(event.target)
      )
        menu.current.open = false;
    }
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("focusin", dismiss);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("focusin", dismiss);
    };
  }, []);

  async function confirmSignOut() {
    if (!signOut || busy) return;
    setBusy(true);
    setError(false);
    try {
      await signOut(`/${locale}`);
      dialog.current?.close();
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <details
        ref={menu}
        className="account-menu"
        onKeyDown={(event) => {
          if (event.key === "Escape" && event.currentTarget.open) {
            event.currentTarget.open = false;
            event.currentTarget.querySelector("summary")?.focus();
          }
        }}
      >
        <summary className="button secondary account-link">
          {avatar}
          {t("Mon compte", "حسابي")}
          <ChevronDown size={16} aria-hidden />
        </summary>
        <div className="account-menu-panel">
          <button
            className="button secondary"
            type="button"
            onClick={() => {
              if (menu.current) menu.current.open = false;
              setError(false);
              dialog.current?.showModal();
            }}
          >
            {t("Se déconnecter", "تسجيل الخروج")}
          </button>
        </div>
      </details>
      <dialog
        ref={dialog}
        className="workspace-dialog"
        aria-labelledby="sign-out-title"
        onCancel={(event) => {
          if (busy) event.preventDefault();
        }}
        onClose={() => menu.current?.querySelector("summary")?.focus()}
      >
        <h2 id="sign-out-title">{t("Se déconnecter ?", "تسجيل الخروج؟")}</h2>
        <div className="dialog-actions">
          <button
            className="button secondary"
            type="button"
            autoFocus
            disabled={busy}
            onClick={() => dialog.current?.close()}
          >
            {t("Annuler", "إلغاء")}
          </button>
          <button
            className="button"
            type="button"
            disabled={busy}
            onClick={() => void confirmSignOut()}
          >
            {busy
              ? t("Déconnexion…", "جارٍ تسجيل الخروج…")
              : t("Se déconnecter", "تسجيل الخروج")}
          </button>
        </div>
        {error && (
          <p className="error" role="alert">
            {t(
              "La déconnexion a échoué. Réessayez.",
              "تعذر تسجيل الخروج. حاول مرة أخرى.",
            )}
          </p>
        )}
      </dialog>
    </>
  );
}

export function AccountButtons({
  locale,
  signup = false,
  dashboard = false,
}: {
  locale: Locale;
  signup?: boolean;
  dashboard?: boolean;
}) {
  const account = useAccount();
  const t = words(locale);
  if (account.signedIn) {
    const avatar = account.avatarUrl && (
      // eslint-disable-next-line @next/next/no-img-element -- Clerk supplies the avatar URL.
      <img
        className="account-avatar"
        src={account.avatarUrl}
        width={26}
        height={26}
        alt=""
      />
    );
    if (dashboard) {
      return (
        <AccountMenu
          locale={locale}
          avatar={avatar}
          signOut={account.signOut}
        />
      );
    }
    return (
      <a
        className="button secondary account-link"
        href={`/${locale}/dashboard`}
      >
        {avatar}
        {t("Mon espace", "مساحتي")}
      </a>
    );
  }
  return (
    <button
      className="button secondary"
      type="button"
      disabled={!account.available || !account.ready}
      onClick={signup ? account.signUp : account.signIn}
    >
      {signup
        ? t("S’inscrire", "إنشاء حساب")
        : t("Se connecter", "تسجيل الدخول")}
    </button>
  );
}
