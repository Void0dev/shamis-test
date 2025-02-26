import { PropsWithChildren } from "react";
import { TwaAnalyticsProvider } from "@tonsolutions/telemetree-react";

export const AnalyticsProvider = ({children}: PropsWithChildren) => {
  if (!import.meta.env.VITE_DEV) {
    return (
      <TwaAnalyticsProvider
        projectId={import.meta.env.VITE_TELEMETREE_PROJECT_ID}
        apiKey={import.meta.env.VITE_TELEMETREE_API_KEY}
      >
        {children}
      </TwaAnalyticsProvider>
    );
  }

  return children;
};