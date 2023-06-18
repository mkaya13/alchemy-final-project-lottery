import "../styles/globals.css"
import { MoralisProvider } from "react-moralis"
import { NotificationProvider, useNotificationProvider } from "web3uikit"
import "./index.css"
import "../components/announcements.css"
import "../components/lotterynav.css"

function MyApp({ Component, pageProps }) {
    return (
        <MoralisProvider initializeOnMount={false}>
            <NotificationProvider>
                <Component {...pageProps} />
            </NotificationProvider>
        </MoralisProvider>
    )
}

export default MyApp
