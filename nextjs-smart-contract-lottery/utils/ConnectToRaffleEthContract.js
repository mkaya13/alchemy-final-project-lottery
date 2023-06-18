import { ethers } from "ethers"
import { abi } from "../constants/index.js"

export default function ConnectToRaffleEthContract() {
    const provider = new ethers.providers.JsonRpcProvider(
        process.env.NEXT_PUBLIC_SEPOLIA_ALCHEMY_API_KEY
    )
    const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_SEPOLIA_LOTTERY_CONTRACT_ADDRESS, // Smart Contract Address
        abi,
        provider
    )

    return contract
}
