import { routes } from "@/navigation/routes.tsx";
import { observer } from "mobx-react-lite";
import { authStore } from "@/stores/authStore";
import {
    initData,
    useLaunchParams,
    useSignal,
} from "@telegram-apps/sdk-react";
import { AppRoot } from "@telegram-apps/telegram-ui";
import { useEffect } from "react";
import {
    BrowserRouter,
    Navigate,
    Route,
    Routes,
} from "react-router-dom";
import { Toaster } from 'react-hot-toast';

// function RedirectToIntro() {
//     const navigate = useNavigate();

//     useEffect(() => {
//         const isIntroSeen = localStorage.getItem("intro");
//         if (!isIntroSeen) {
//             navigate("/intro");
//             localStorage.setItem("intro", "true");
//         }
//     }, [navigate]);

//     return null;
// }

export const App = observer(() => {
    const lp = useLaunchParams();
    const initDataRaw = useSignal(initData.raw);

    useEffect(() => {
        if (!authStore.isAuthenticated && initDataRaw) {
            authStore.authenticate(initDataRaw);
        }
    }, [initDataRaw]);

    return (
        <BrowserRouter>
            {/* <RedirectToIntro /> */}
            <AppRoot
                appearance="dark"
                platform={["macos", "ios"].includes(lp.platform) ? "ios" : "base"}
            >
                <Toaster
                  position="bottom-center"
                  toastOptions={{
                      duration: 3000,
                  }}
                  containerStyle={{
                      bottom: 35
                  }}
                />
                <Routes>
                    {routes.map((route) => (
                        <Route key={route.path} {...route} />
                    ))}
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </AppRoot>
        </BrowserRouter>
    );
});
