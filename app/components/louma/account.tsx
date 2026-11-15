"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useAuth, useClerk, UserButton } from "@clerk/nextjs";
import { words } from "@/lib/contract/agreement";
import type { Locale } from "@/i18n/locales";

type Account = {
  signedIn: boolean;
  ready: boolean;
  available: boolean;
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
  return (
    <Context.Provider
      value={{
        signedIn: Boolean(isSignedIn),
        ready: isLoaded,
        available: true,
        signIn: () => clerk.openSignIn(),
        signUp: () => clerk.openSignUp(),
      }}
    >
      {children}
    </Context.Provider>
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
  if (account.signedIn)
    return (
      <div className="account-actions">
        <a className="button secondary" href={`/${locale}/mes-fichiers`}>
          {t("Mes fichiers", "ملفاتي")}
        </a>
        {!signup && <UserButton />}
      </div>
    );
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
