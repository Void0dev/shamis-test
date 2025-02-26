import { Page } from "@/components/Page";
import ChatComponent from "@/components/ChatComponent/ChatComponent";
import { observer } from "mobx-react-lite";

export default observer(function Chat() {
  return (
    <Page title="AI Chat" back={true} className="relative">
      <div className="h-[calc(100vh-120px)]">
        <ChatComponent />
      </div>
    </Page>
  );
});
