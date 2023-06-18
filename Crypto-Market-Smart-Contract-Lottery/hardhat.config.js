require("@nomiclabs/hardhat-waffle")
require("@nomiclabs/hardhat-etherscan")
require("hardhat-deploy")
require("solidity-coverage")
require("hardhat-gas-reporter")
require("hardhat-contract-sizer")
require("dotenv").config()

/** @type import('hardhat/config').HardhatUserConfig */

PRIVATE_KEY = process.env.PRIVATE_KEY || "0xkey"
RINKEBY_RPC_URL = process.env.RINKEBY_RPC_URL || "https://eth-rinkeby"
GOERLI_RPC_URL = process.env.GOERLI_RPC_URL || "https://eth-goerli"
SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "https://eth-sepolia"

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "key"
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || "key"

module.exports = {
    defaultNetwork: "hardhat",
    networks: {
        localhost: {
            chainId: 31337,
        },
        hardhat: {
            chainId: 31337,
            blockConfirmations: 1,
        },
        rinkeby: {
            chainId: 4,
            blockConfirmations: 6,
            url: RINKEBY_RPC_URL,
            accounts: [PRIVATE_KEY],
        },
        goerli: {
            chainId: 5,
            blockConfirmations: 6,
            url: GOERLI_RPC_URL,
            accounts: [PRIVATE_KEY],
        },
        sepolia: {
            url: SEPOLIA_RPC_URL,
            accounts: PRIVATE_KEY !== undefined ? [PRIVATE_KEY] : [],
            //   accounts: {
            //     mnemonic: MNEMONIC,
            //   },
            saveDeployments: true,
            blockConfirmations: 6,
            chainId: 11155111,
        },
    },

    solidity: {
        compilers: [
            {
                version: "0.8.8",
            },
            {
                version: "0.8.7",
            },
            {
                version: "0.8.4",
            },
        ],
    },
    namedAccounts: {
        deployer: {
            default: 0,
            1: 0,
        },
        player: {
            default: 1,
        },
    },
    gasReporter: {
        enabled: true,
        currency: "USD",
        outputFile: "gas-report.txt",
        noColors: true,
        coinmarketCap: COINMARKETCAP_API_KEY,
        token: "ETH",
    },
    mocha: {
        timeout: 400000, // 300 seconds Max
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },
}
