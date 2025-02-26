import ReactDOM from 'react-dom/client';
import { StrictMode } from 'react';
import { retrieveLaunchParams } from '@telegram-apps/sdk-react';
import { Root } from '@/components/Root.tsx';
import { EnvUnsupported } from '@/components/EnvUnsupported.tsx';
import { init } from '@/init.ts';
import * as Sentry from "@sentry/browser";

import '@telegram-apps/telegram-ui/dist/styles.css';
import './index.css';
import '/assets/icons/icon.png';

// Mock the environment in case, we are outside Telegram.
import './mockEnv.ts';

const DEV_MODE = Boolean(import.meta.env.VITE_DEV);

const root = ReactDOM.createRoot(document.getElementById('root')!);

try {
  // Configure all application dependencies.
  init(retrieveLaunchParams().startParam === 'debug' || DEV_MODE);

  // if (!DEV_MODE) {
  //   const glitchtipDsn = import.meta.env.VITE_GLITCHTIP_DSN;
  //   glitchtipDsn
  //     ? Sentry.init({ dsn: glitchtipDsn })
  //     : console.error('No sentry dsn provided');
  // }

  root.render(
    <StrictMode>
      <Root/>
    </StrictMode>,
  );
} catch (e) {
  root.render(<EnvUnsupported/>);
}
