const { ethers, network } = require("hardhat")
const fs = require("fs")

const FRONT_END_ADDRESSES_FILE = "../nextjs-smart-contract-lottery/constants/contractAddresses.json"
const FRONT_END_ABI_FILE = "../nextjs-smart-contract-lottery/constants/abi.json"

/*             
    - We need to update the Address and ABI of the front-end for corresponding networks. To do that, We write this deploy script. Each time we deploy SC's, the information
    in constants/contractAddresses.json + constants/abi.json will be updated!

    - *raffle.interface.format(ethers.utils.FormatTypes.json)* handles the contract ABI in json format

    - *JSON.stringify(currentAddresses)* First converts a javascript object to string then JSON
    
*/

module.exports = async function () {
    if (process.env.UPDATE_FRONT_END) {
        console.log("Updating front end ...")
        updateContractAddresses()
        updateAbi()
    }
}

async function updateAbi() {
    const raffle = await ethers.getContract("Raffle")
    fs.writeFileSync(FRONT_END_ABI_FILE, raffle.interface.format(ethers.utils.FormatTypes.json)) // allows us to get the ABI with 1 line of code
}

async function updateContractAddresses() {
    const raffle = await ethers.getContract("Raffle") // We want to pass this raffle object to our front-end
    const chainId = network.config.chainId.toString()
    const currentAddresses = JSON.parse(fs.readFileSync(FRONT_END_ADDRESSES_FILE, "utf8")) // It fetches the current version of contractAddresses.json
    console.log("currentAddresses:", currentAddresses)
    if (chainId in currentAddresses) {
        if (!currentAddresses[chainId].includes(raffle.address)) {
            currentAddresses[chainId].push(raffle.address)
        }
    } else {
        currentAddresses[chainId] = [raffle.address]
    }

    fs.writeFileSync(FRONT_END_ADDRESSES_FILE, JSON.stringify(currentAddresses)) // Overwrites, JSON.stringify, first converts currentAddresses to string then to json
}

module.exports.tags = ["all", "frontend"]
