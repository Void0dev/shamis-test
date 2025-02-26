import { Button, FixedLayout } from "@telegram-apps/telegram-ui";
import React from "react";

interface FixedBottomButtonProps {
  label: string;
  onClick: () => void;
}

const FixedBottomButton: React.FC<FixedBottomButtonProps> = ({
  label,
  onClick,
}) => {
  return (<>
  
    <div style={{ height: 32 }}></div>
    <FixedLayout style={{ padding: 16 }}>
      <Button size="l" stretched onClick={onClick}>
        {label}
      </Button>
    </FixedLayout>
    </>
  );
};

export default FixedBottomButton;
