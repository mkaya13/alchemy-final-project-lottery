import { useWeb3Contract, useMoralis } from "react-moralis"
import { useEffect, useState } from "react"
import Marquee from "react-fast-marquee"
import ethLogo from "../assets/eth_logo.svg"
import { abi, contractAddresses } from "../constants/index.js"
import Image from "next/image"
import ConnectToRaffleEthContract from "../utils/ConnectToRaffleEthContract.js"

const Announcements = () => {
    const { chainId: chainIdHex } = useMoralis()
    const chainId = parseInt(chainIdHex)
    const raffleAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null

    const contract = ConnectToRaffleEthContract()

    const [contractRecentWinner, setContractRecentWinner] = useState("")

    const { runContractFunction: getRecentWinner } = useWeb3Contract({
        contractAddress: raffleAddress,
        abi: abi,
        functionName: "getRecentWinner",
        params: {},
    })

    const listenForWinnerPicked = async () => {
        contract.on("WinnerPicked", () => {
            updateRecentWinner()
        })
    }

    async function updateRecentWinner() {
        const recentWinnerFromCall = await getRecentWinner()
        console.log(recentWinnerFromCall)
        setContractRecentWinner(recentWinnerFromCall)
    }

    useEffect(() => {
        async function updateWinner() {
            await updateRecentWinner()
            await listenForWinnerPicked()
        }
        setTimeout(updateWinner, 400)
    }, [contractRecentWinner])

    return (
        <Marquee speed={60} gradient={false} pauseOnHover>
            <section className="announcement-section">
                <div className="field-holder">
                    <ul className="announcement-list">
                        <li>
                            <span className="eth-lottery-winner">
                                {" "}
                                <Image priority src={ethLogo} alt="ETH" height={16} width={16} />
                                Latest Winner:{" "}
                                {contractRecentWinner && contractRecentWinner.slice(0, 6)}
                                {"..."}
                                {""}
                                {contractRecentWinner && contractRecentWinner.slice(38, 42)}
                            </span>
                        </li>
                        <li className="announcement-eth-lottery-latest-winner-address"></li>
                    </ul>
                </div>
            </section>
        </Marquee>
    )
}

export default Announcements
