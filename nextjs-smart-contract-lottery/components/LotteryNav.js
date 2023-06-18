import { useRouter } from "next/router"
import Link from "next/link"
import Header from "./Header"
import Announcement from "./Announcement"

const LotteryNav = () => {
    const router = useRouter()

    return (
        <nav>
            <ul>
                <li className={router.pathname === "/" ? "active" : ""}>
                    <Link href="/">
                        <a>ETH</a>
                    </Link>
                </li>

                <li className={router.pathname === "/megalottery" ? "active" : ""}>
                    <Link href="/megalottery">
                        <a>Mega</a>
                    </Link>
                </li>
            </ul>
        </nav>
    )
}

export default function Index() {
    return (
        <div>
            <Header />
            <Announcement />
            <LotteryNav />
        </div>
    )
}
