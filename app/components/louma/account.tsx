"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { Button, Dropdown, Separator } from "@heroui/react";
import { LibraryModal } from "./library-modal";
import { ChevronDown, FileText, FolderOpen, LogOut } from "lucide-react";
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
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  async function confirmSignOut() {
    if (!signOut || busy) return;
    setBusy(true);
    setError(false);
    try {
      await signOut(`/${locale}`);
      setOpen(false);
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Dropdown>
        <Button variant="outline" className="account-link">
          {avatar}
          {t("Mon compte", "حسابي")}
          <ChevronDown size={15} aria-hidden />
        </Button>
        <Dropdown.Popover placement="bottom end">
          <Dropdown.Menu aria-label={t("Mon compte", "حسابي")}>
            <Dropdown.Item id="contracts" href={`/${locale}/contracts`}>
              <FolderOpen size={17} aria-hidden />
              {t("Mes contrats", "عقودي")}
            </Dropdown.Item>
            <Dropdown.Item id="documents" href={`/${locale}/documents`}>
              <FileText size={17} aria-hidden />
              {t("Mes documents", "مستنداتي")}
            </Dropdown.Item>
            <Separator />
            <Dropdown.Item
              id="logout"
              variant="danger"
              onAction={() => {
                setError(false);
                setOpen(true);
              }}
            >
              <LogOut size={17} aria-hidden />
              {t("Se déconnecter", "تسجيل الخروج")}
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown>
      <LibraryModal
        title={t("Se déconnecter ?", "تسجيل الخروج؟")}
        open={open}
        busy={busy}
        onClose={() => setOpen(false)}
        actions={
          <>
            <Button
              variant="secondary"
              autoFocus
              isDisabled={busy}
              onPress={() => setOpen(false)}
            >
              {t("Annuler", "إلغاء")}
            </Button>
            <Button
              variant="danger"
              isPending={busy}
              onPress={() => void confirmSignOut()}
            >
              {busy
                ? t("Déconnexion…", "جارٍ تسجيل الخروج…")
                : t("Se déconnecter", "تسجيل الخروج")}
            </Button>
          </>
        }
      >
        {error && (
          <p className="error" role="alert">
            {t(
              "La déconnexion a échoué. Réessayez.",
              "تعذر تسجيل الخروج. حاول مرة أخرى.",
            )}
          </p>
        )}
      </LibraryModal>
    </>
  );
}

export function AccountButtons({
  locale,
  signup = false,
}: {
  locale: Locale;
  signup?: boolean;
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
    return (
      <AccountMenu locale={locale} avatar={avatar} signOut={account.signOut} />
    );
  }
  return (
    <button
      className="site-button secondary"
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
