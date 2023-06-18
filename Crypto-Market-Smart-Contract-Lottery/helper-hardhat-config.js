const { ethers } = require("hardhat")

const networkConfig = {
    31337: {
        name: "hardhat",
        entranceFee: ethers.utils.parseEther("0.01"),
        gasLane: "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15", // Our mock doesn't care which gasLane we are working on. Use anything it doesn't matter
        // subscriptionId:        It is handled in the 01-deploy-raffle.js
        subscriptionId: "588",
        callbackGasLimit: "500000",
        keepersUpdateInterval: "30",
    },
    5: {
        name: "goerli",
        vrfCoordinatorV2Address: "0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D",
        entranceFee: ethers.utils.parseEther("0.01"),
        gasLane: "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
        subscriptionId: "1268",
        callbackGasLimit: "500000",
        keepersUpdateInterval: "30",
    },
    137: {
        name: "polygon",
        vrfCoordinatorV2Address: "0xAE975071Be8F8eE67addBC1A82488F1C24858067",
        entranceFee: ethers.utils.parseEther("0.01"),
        gasLane: "0xd729dc84e21ae57ffb6be0053bf2b0668aa2aaf300a2a7b2ddf7dc0bb6e875a8",
        subscriptionId: "1268",
        keepersUpdateInterval: "30",
    },
    11155111: {
        name: "sepolia",
        subscriptionId: "1253",
        gasLane: "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c", // 30 gwei
        keepersUpdateInterval: "135",
        entranceFee: ethers.utils.parseEther("0.01"), // 0.01 ETH
        callbackGasLimit: "500000", // 500,000 gas
        vrfCoordinatorV2Address: "0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625",
    },
}

const developmentChains = ["hardhat", "localhost"]

// We can also add them inside 00-deploy-mocks.js

const BASE_FEE = ethers.utils.parseEther("0.25") // 0.25 is the premium. It costs 0.25 LINK per VRF request
const GAS_PRICE_LINK = 1e9 // 10000000000 calculated value based on the gas price of the chain

// Eth price
// Chainlink Nodes pay the gas fees to give us randomness & do external execution

module.exports = {
    networkConfig,
    developmentChains,
    BASE_FEE,
    GAS_PRICE_LINK,
}
