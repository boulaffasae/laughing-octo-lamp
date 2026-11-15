import * as Sentry from "@sentry/nextjs";
import posthog from "posthog-js";
import { sentryDsn, scrubEvent, dataCollection } from "./lib/sentry-options";

Sentry.init({
  dsn: sentryDsn,
  dataCollection,
  tracesSampleRate: 0,
  beforeSend: scrubEvent,
});

const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim();
if (posthogKey) {
  posthog.init(posthogKey, {
    api_host:
      process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
    capture_pageview: "history_change",
    capture_pageleave: false,
    autocapture: false,
    disable_session_recording: true,
    disable_surveys: true,
    disable_external_dependency_loading: true,
    advanced_disable_flags: true,
    person_profiles: "never",
    persistence: "memory",
    before_send: (event) => {
      if (event?.event !== "$pageview") return null;
      const original = event.properties;
      const path =
        typeof original.$pathname === "string" ? original.$pathname : "/";
      const pathname =
        /^\/(fr|ar)(?:\/(?:new|espace|info\/(?:mentions-legales|confidentialite|conditions|contact)))?\/?$/.test(
          path,
        )
          ? path
          : "/";
      return {
        ...event,
        properties: {
          distinct_id: original.distinct_id,
          $pathname: pathname,
          $current_url: window.location.origin + pathname,
        },
      };
    },
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
