import cn from "@/utils/cn";
import { backButton } from "@telegram-apps/sdk-react";
import { PropsWithChildren, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Page.module.scss";

export function Page({
  children,
  className,
  back = true,
}: PropsWithChildren<{
  /**
   * True if it is allowed to go back from this page.
   */
  back?: boolean;
  className?: string;
}>) {
  const navigate = useNavigate();

  useEffect(() => {
    if (back) {
      backButton.show();
      return backButton.onClick(() => {
        navigate(-1);
      });
    }
    backButton.hide();
  }, [back]);

  return <div className={cn(styles.regular, className)}>{children}</div>;
}
