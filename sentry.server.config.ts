import * as Sentry from "@sentry/nextjs";
import { sentryDsn, scrubEvent, dataCollection } from "./lib/sentry-options";

Sentry.init({
  dsn: sentryDsn,
  dataCollection,
  tracesSampleRate: 0,
  beforeSend: scrubEvent,
});
