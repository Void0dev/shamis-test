import { Page } from "@/components/Page";
import { dictionaryStore } from "@/stores/dictionaryStore";
import { TonConnectButton, useTonAddress, useTonConnectUI } from "@tonconnect/ui-react";
import { observer } from "mobx-react-lite";
import {useEffect} from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { authStore } from "@/stores/authStore";
import { Button } from "@telegram-apps/telegram-ui";

export default observer(function Index() {
    const dictionary = dictionaryStore.dictionary;
    const connectedAddressString = useTonAddress(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (connectedAddressString && authStore.isAuthenticated) {
            authStore.connectWallet(connectedAddressString);
        }
    }, [connectedAddressString, authStore.isAuthenticated]);

    return (
        <Page back={false} className="relative pt-6">
           <TonConnectButton />
           <div className="mt-6 flex flex-col items-center">
               <h1 className="text-2xl font-bold mb-4">Welcome to the App</h1>
               <Button 
                 onClick={() => navigate('/chat')}
                 className="mb-6"
               >
                 Open AI Chat
               </Button>
           </div>
        </Page>
    );
});
