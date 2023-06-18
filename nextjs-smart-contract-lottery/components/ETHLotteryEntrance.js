// We need to have a function to enter the lottery
// To interact with the contract, we are gonna use Morales hooks
// Moralis chainId returns hex version of chainId thus we need to convert it to a real number with *parseInt()* function.

import { useWeb3Contract, useMoralis } from "react-moralis"
import { abi, contractAddresses } from "../constants/index.js"
import { useEffect, useState } from "react"
import { useNotification } from "web3uikit"
import { ethers } from "ethers"
import ConnectToRaffleEthContract from "../utils/ConnectToRaffleEthContract.js"

export default function ETHLotteryEntrance() {
    const { chainId: chainIdHex, isWeb3Enabled, isAuthenticated, account } = useMoralis()
    const chainId = parseInt(chainIdHex)
    const raffleAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null

    const dispatch = useNotification()

    const [entranceFee, setEntranceFee] = useState("0")
    const [numPlayer, setNumPlayer] = useState("0")
    const [contractRecentWinner, setContractRecentWinner] = useState("0")
    const [connectedAddress, setConnectedAddress] = useState()
    const [ifEntered, setIfEntered] = useState(false)
    const [waitingTx, setWaitingTx] = useState()
    const [waitingErrorTx, setWaitingErrorTx] = useState()

    // Smart Contract Connection
    const contract = ConnectToRaffleEthContract()

    const {
        runContractFunction: enterRaffle,
        isLoading,
        isFetching,
    } = useWeb3Contract({
        contractAddress: raffleAddress,
        abi: abi,
        functionName: "enterRaffle",
        params: {},
        msgValue: entranceFee,
    })

    const getConnectedAddress = async () => {
        if (account) {
            setConnectedAddress(account)
        }
    }

    const { runContractFunction: getEntranceFee } = useWeb3Contract({
        contractAddress: raffleAddress,
        abi: abi,
        functionName: "getEntranceFee",
        params: {},
    })

    const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
        contractAddress: raffleAddress,
        abi: abi,
        functionName: "getNumberOfPlayers",
        params: {},
    })

    const { runContractFunction: getRecentWinner } = useWeb3Contract({
        contractAddress: raffleAddress,
        abi: abi,
        functionName: "getRecentWinner",
        params: {},
    })

    async function updateRecentWinner() {
        const recentWinnerFromCall = (await getRecentWinner()).toString()
        setContractRecentWinner(recentWinnerFromCall)
    }

    async function updateUI() {
        const entranceFeeFromCall = (await getEntranceFee()).toString()
        const numPlayersFromCall = (await getNumberOfPlayers()).toString()
        // const recentWinnerFromCall = (await getRecentWinner()).toString()

        setEntranceFee(entranceFeeFromCall) // parseEther opposite
        setNumPlayer(numPlayersFromCall)
        // setContractRecentWinner(recentWinnerFromCall)
    }

    async function checkIfEnteredToRuffle() {
        for (let i = 0; i < numPlayer; i++) {
            const player = await contract.getPlayer(i)
            if (player.toLowerCase() === account.toLowerCase()) {
                setIfEntered(true)
                return
            }
        }
        setIfEntered(false)
    }

    const handleSuccess = async function (tx) {
        setWaitingTx(true)
        await tx.wait(1)
        setWaitingTx(false)
        handleNewNotification(tx)
        updateUI()
        updateRecentWinner()
    }

    const handleErrorNotification = function () {
        dispatch({
            type: "error", // info , warning, error,
            message: "Transaction Error!",
            title: "Tx Notification",
            position: "bottomR", // topL, bottomR, bottomL
            //  icon: "bell",
        })
    }

    const handleError = async function (tx) {
        setWaitingErrorTx(true)
        await tx.wait(1)
        setWaitingErrorTx(false)
        handleErrorNotification(tx)
        updateUI()
    }

    const handleNewNotification = function () {
        dispatch({
            type: "success", // info , warning, error,
            message: "Transaction Complete!",
            title: "Tx Notification",
            position: "bottomR",
            // topL, bottomR, bottomL
            //  icon: "bell",
        })
    }

    const handleAlreadyJoined = function () {
        dispatch({
            type: "error", // info , warning, error,
            message: "You have already joined!",
            title: "Tx Notification",
            position: "bottomR", // topL, bottomR, bottomL
            //  icon: "bell",
        })
    }

    const announceWinner = function (winnerAddress) {
        dispatch({
            type: "success", // info , warning, error,
            message: `The winner address ${winnerAddress}`,
            title: "Annouence Winner",
            position: "bottomR", // topL, bottomR, bottomL
            //  icon: "bell",
        })
    }

    const listenForWinnerPicked = async () => {
        contract.on("WinnerPicked", (recentWinner) => {
            updateUI()
            updateRecentWinner()
            let transferEvent = {
                recentWinner: recentWinner,
            }
            console.log("recentWinner event is Fired!")
            console.log(JSON.stringify(transferEvent, null, 1))
            announceWinner(recentWinner)
        })

        // Skip it, and ask it !!!!   Try it with moralis later if still exists!!!! Test it again later.

        // provider.once("block", () => {
        //     contract.on("WinnerPicked", (recentWinner) => {
        //         updateUI()
        //         let transferEvent = {
        //             recentWinner: recentWinner,
        //         }
        //         console.log("recentWinner event is Fired!")
        //         console.log(JSON.stringify(transferEvent, null, 1))
        //         announceWinner()
        //     })
        // })
    }

    useEffect(() => {
        updateRecentWinner()
        if (isWeb3Enabled) {
            updateUI()
        }
        getConnectedAddress()
        checkIfEnteredToRuffle()
        listenForWinnerPicked()
    }, [isWeb3Enabled, connectedAddress, account, numPlayer])

    return (
        <div>
            <div className="whole-lottery-page">
                {raffleAddress ? (
                    <div className="first-lottery">
                        <h2>Current Prize: {numPlayer * 0.01} ETH</h2>
                        <div className="first-lottery-box">
                            <ul>
                                <div className="lottery-remaining-time-section">
                                    <span>Time Remaining</span>
                                    <span>
                                        <hr />
                                    </span>
                                    <button
                                        className=""
                                        onClick={async function () {
                                            !ifEntered
                                                ? await enterRaffle({
                                                      onSuccess: handleSuccess,
                                                      onError: handleError,
                                                  })
                                                : handleAlreadyJoined()
                                        }}
                                        disable={isLoading || isFetching || waitingTx}
                                    >
                                        {isLoading || isFetching || waitingTx ? (
                                            <div className="lottery-enter-button entering">
                                                Entering...
                                            </div>
                                        ) : ifEntered ? (
                                            <div className="lottery-enter-button already-entered">
                                                Already Entered
                                            </div>
                                        ) : (
                                            <div className="lottery-enter-button enter">Enter</div>
                                        )}
                                    </button>
                                </div>

                                <li>
                                    Entrance fee is:
                                    {ethers.utils.formatUnits(entranceFee, "ether")} ETH
                                </li>
                                <li>Number Of Players in Current Raffle: {numPlayer}</li>
                            </ul>
                        </div>
                    </div>
                ) : (
                    <div>
                        <h1>No Raffle Address Detected</h1>
                    </div>
                )}
            </div>
        </div>
    )
}
