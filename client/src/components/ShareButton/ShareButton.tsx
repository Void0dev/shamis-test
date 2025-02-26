import { useCallback } from "react";
import { shareURL } from "@telegram-apps/sdk-react";

import styles from './ShareButton.module.css';
import {authStore} from "@/stores/authStore.ts";

const SHARE_TEXT = 'Play and Earn! Bet, not bad!';

export const ShareButton = () => {
  const telegramId = authStore.user?.telegramId;

  const handleClick = useCallback(() => {
    if (!telegramId) return;

    const url = new URL(import.meta.env.VITE_TG_APP_URL);
    url.searchParams.set('startapp', telegramId);
    shareURL(url.href, SHARE_TEXT);

    navigator.clipboard.writeText(url.href);
  }, [telegramId]);

  return (
    <button onClick={handleClick} className={styles.button}>
      Invite friends
    </button>
  );
};