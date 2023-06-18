<a name="readme-top"></a>

<!-- TABLE OF CONTENTS -->

# 📗 Table of Contents

- [📖 About the Project](#about-project)
  - [🛠 Built With](#built-with)
    - [Tech Stack](#tech-stack)
    - [Key Features](#key-features)
  - [🚀 Live Demo](#live-demo)
- [💻 Getting Started](#getting-started)
  - [Setup](#setup)
  - [Prerequisites](#prerequisites)
  - [Install](#install)
  - [Usage](#usage)
  - [Run tests](#run-tests)
  - [Deployment](#triangular_flag_on_post-deployment)
- [👤 Author](#author)
- [🔭 Future Features](#future-features)
- [🤝 Contributing](#contributing)
- [⭐️ Show your support](#support)
- [🙏 Acknowledgements](#acknowledgements)
- [❓ FAQ](#faq)
- [📝 License](#license)

<!-- PROJECT DESCRIPTION -->

# 📖 Decentralized Lottery <a name="about-project"></a>

Decentralized Lottery that makes it possible to run lotteries with Chainlink VRF that feeds random variable inside the Smart Contracts to provide fair chance to win for everyone.

## 🛠 Built With <a name="built-with"></a>

### Tech Stack <a name="tech-stack"></a>

<details>
  <summary>Language</summary>
  <ul>
    <li><a href="https://soliditylang.org/">Solidity</a></li>
    <li><a href="https://www.javascript.com/">JavaScript</a></li>
    <li><a href="https://www.w3schools.com/html/">HTML</a></li>
    <li><a href="https://www.w3schools.com/css/">CSS</a></li>
  </ul>
</details>

<!-- Features -->

### Key Features <a name="key-features"></a>

- **Enter to Raffle**
- **Invest 0.01 ETH for each account(player)**
- **Able to see Raffle Metrics**

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->

## 💻 Getting Started <a name="getting-started"></a>

To get a local copy up and running follow these simple example steps.

### Prerequisites

In order to run this project you need:

- Install npm on your computer

### Setup

Clone this repository by using the command line :

- `git clone https://github.com/mkaya13/alchemy-final-project-lottery.git`

### Back-End

Go inside the hardhat directory

- `cd Crypto-Market-Smart-Contract-Lottery`

## Env Variable

Create a .env and fill following metrics:

PRIVATE_KEY=<>
RINKEBY_RPC_URL =<>
GOERLI_RPC_URL =<>
SEPOLIA_RPC_URL =<>
ETHERSCAN_API_KEY=<>
COINMARKETCAP_API_KEY=<>
UPDATE_FRONT_END = <>

## Deploy the Smart Contract, You will need it to run the Front-End

npx hardhat deploy --network sepolia --tags Raffle

### Front-End

Go inside the front-end directory running the app:

`cd nextjs-smart-contract-lottery`

Install this project with:

`npm install`

### Usage

To run the project, execute the following command:

`npm start`

NB: You need to create an `.env.local` file for your database credentials
your env file should contain the following

```
NEXT_PUBLIC_SEPOLIA_ALCHEMY_API_KEY=<>
NEXT_PUBLIC_SEPOLIA_LOTTERY_CONTRACT_ADDRESS=<>
NEXT_PUBLIC_MORALIS_API_KEY=<>
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- AUTHORS -->

## 👤 Author <a name="author"></a>

👤 **Mert Kaya**

- GitHub: [@mkaya13](https://github.com/mkaya13)
- Twitter: [@mkaya133](https://twitter.com/mkaya133)
- LinkedIn: [LinkedIn](https://www.linkedin.com/in/mkaya13/)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- FUTURE FEATURES -->

## 🔭 Future Features <a name="future-features"></a>

- **Add more Token Options**
- **Add other Chainlink Services such as Chainlink Functions**
- **Show Statistics of the Players**
- **Add a dedicated front-end**

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTRIBUTING -->

## 🤝 Contributing <a name="contributing"></a>

Contributions, issues, and feature requests are welcome!

Feel free to check the [issues page](https://github.com/mkaya13/final-capstone-back-end/issues).

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- SUPPORT -->

## ⭐️ Show your support <a name="support"></a>

If you like this project by staring it.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ACKNOWLEDGEMENTS -->

## 🙏 Acknowledgments <a name="acknowledgements"></a>

I would like to thank Microverse for the project.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- LICENSE -->

## 📝 License <a name="license"></a>

This project is [MIT](./LICENSE) licensed.

<p align="right">(<a href="#readme-top">back to top</a>)</p>
