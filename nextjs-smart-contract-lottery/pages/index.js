import Head from "next/head"
import Image from "next/image"
import styles from "../styles/Home.module.css"
import ETHLotteryEntrance from "../components/ETHLotteryEntrance"
import Index from "../components/LotteryNav"

export default function Home() {
    return (
        <div className={styles.container}>
            <Head>
                <title>Automated SC Lottery</title>
                <meta name="description" content="Automated SC Lottery" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Index />
            <ETHLotteryEntrance />
        </div>
    )
}
