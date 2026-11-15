"use client";

import { createContext, useContext, type ReactNode } from "react";
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
        <button
          className="button secondary account-link"
          type="button"
          onClick={() => void account.signOut?.(`/${locale}`)}
        >
          {avatar}
          {t("Se déconnecter", "تسجيل الخروج")}
        </button>
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
