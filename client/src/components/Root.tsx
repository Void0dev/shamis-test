import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { App } from '@/components/App.tsx';
import { ErrorBoundary } from '@/components/ErrorBoundary.tsx';
import { publicUrl } from '@/helpers/publicUrl';
import {AnalyticsProvider} from "@/components/AnalyticsProvider.tsx";

function ErrorBoundaryError({ error }: { error: unknown }) {
    return (
        <div>
            <p>An unhandled error occurred:</p>
            <blockquote>
                <code>
                    {error instanceof Error
                        ? error.message
                        : typeof error === 'string'
                            ? error
                            : JSON.stringify(error)}
                </code>
            </blockquote>
        </div>
    );
}

export function Root() {
    return (
        <ErrorBoundary fallback={ErrorBoundaryError}>
            <TonConnectUIProvider
              manifestUrl={publicUrl('tonconnect-manifest.json')}
              actionsConfiguration={{
                twaReturnUrl: import.meta.env.VITE_TG_APP_URL,
                skipRedirectToWallet: 'ios',
                returnStrategy: 'back',
              }}
            >
              <AnalyticsProvider>
                <App />
              </AnalyticsProvider>
            </TonConnectUIProvider>
        </ErrorBoundary>
    );
}
