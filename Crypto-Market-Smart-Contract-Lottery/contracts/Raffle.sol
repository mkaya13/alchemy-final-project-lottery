// Raffle
// Enter the lottery (paying some amount)
// Pick a random winner (verifiably random)
// Winner to be selected every X minutes -> Completely automated
// Chainlink oracle -> Randomness + Automated Execution (VRF + Chainlink Keepers)

// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol"; // To change the functions of the CL contract for our own usage!
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol"; // To get in touch with the orginal contract!
import "@chainlink/contracts/src/v0.8/interfaces/KeeperCompatibleInterface.sol"; // To make sure we wrote these functions!

error Raffle__NotEnoughETHEntered();
error Raffle__TransferFailed();
error Raffle__NotOpen();
error Raffle__UpKeepNotNeeded(uint256 currentBalance, uint256 numPlayers, uint256 raffleState);
error Raffle__AlreadyEntered();

/** @title A sample Raffle Contract
 *  @author Mert Kaya
 *  @notice This contract is for creating an untamperable de-cent smart contract
 *  @dev This implements Chainlink VRF v2 and Chainlink Keepers
 */

// We need to implement an interface for showing the contract to how to connect with other contract's functions!

// interface VRFCoordinatorV2Interface {
//     function requestRandomWords(
//         bytes32 keyHash,
//         uint64 subId,
//         uint16 minimumRequestConfirmations,
//         uint32 callbackGasLimit,
//         uint32 numWords
//     ) external returns (uint256 requestId);
// }

// We apply inheritance on VRF2ConsumerBaseV2 for getting the fulfillRandomWords function

contract Raffle is VRFConsumerBaseV2, KeeperCompatibleInterface {
    /* Type Declarations */
    enum RaffleState {
        OPEN,
        CALCULATING
    } // uint256 0 = OPEN, uint256 1 = CALCULATING

    /* State Variables */
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator; // Address of the chainlink VRF Coordinator Contract
    bytes32 private immutable i_gasLane; // Aka key hash value. Max gas price you are willing to pay for a request in wei
    uint64 private immutable i_subscriptionId; // Subs ID that this contract uses for funding requests
    uint32 private immutable i_callbackGasLimit; // The limit for how much gas to use for the callback request to your contract's fulfillRandomWords()
    uint16 private constant REQUEST_CONFIRMATION = 3;
    uint32 private constant NUM_WORDS = 1; // Random generated item count
    address private raffleOwner;

    // Lottery Variables
    uint256 private immutable i_entranceFee; // Entrance fee to the lottery
    address payable[] private s_players; // When one of the players wins, we need to pay them
    address private s_recentWinner;
    RaffleState private s_raffleState;
    uint256 private s_lastTimeStamp;
    uint256 private interval;

    /* Events */
    event RaffleEnter(address indexed player);
    event RequestedRaffleWinner(uint256 indexed requestId);
    event WinnerPicked(address indexed winner);

    // We have the address being passed to VRFConsumerBaseV2
    // VRFConsumerBaseV2 is the contract that makes sure the generation of VRF
    // We need to pass VRFConsumerBaseV2's constructor and pass that vrfCoordinatorV2
    // vrfCoordinatorV2 is the address of the contract that does the random number verification
    constructor(
        address vrfCoordinatorV2,
        uint256 entranceFee,
        bytes32 gasLane,
        uint64 subscriptionId,
        uint32 callbackGasLimit,
        uint256 _interval
    ) VRFConsumerBaseV2(vrfCoordinatorV2) {
        i_entranceFee = entranceFee;
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2); // Now we can connect with the CL contracts for corresponding networks
        i_gasLane = gasLane;
        i_subscriptionId = subscriptionId;
        i_callbackGasLimit = callbackGasLimit;
        s_raffleState = RaffleState.OPEN;
        s_lastTimeStamp = block.timestamp;
        interval = _interval;
        raffleOwner = msg.sender;
    }

    modifier checkIfAlreadyEntered() {
        for (uint i = 0; i < s_players.length; i++) {
            if (s_players[i] == msg.sender) revert Raffle__AlreadyEntered();
        }
        _;
    }

    modifier checkIfRaffleStateOpen() {
        if (s_raffleState != RaffleState.OPEN) revert Raffle__NotOpen();
        _;
    }

    modifier checkIfEnoughEthEntered() {
        if (msg.value < i_entranceFee) revert Raffle__NotEnoughETHEntered();
        _;
    }

    function enterRaffle()
        public
        payable
        checkIfRaffleStateOpen
        checkIfAlreadyEntered
        checkIfEnoughEthEntered
    {
        // require(msg.value < i_entraceFee, "Not Enough ETH!");
        s_players.push(payable(msg.sender));
        // Emit an event when we update a dynamic array or mapping
        // Named events with the function name reversed
        emit RaffleEnter(msg.sender);
    }

    /**
     * @dev This is the function that the Chainlink Keeper nodes call
     * they look for the `upkeepNeeded` to return true.
     * The following should be true in order to return true.
     * 1. Our time interval should have passed
     * 2. The lottery should have at least 1 player, and have some ETH
     * 3. Our subscription is funded with LINK
     * 4. The lottery should be in an "open" state.
     * Smg that we want to avoid when we are waiting for a random number to return and when we have requested a random winner, we are technically
     * in this weird limbo state where we are waiting for a random number to be returned, and we really shouldn't allow any new players to join.
     * So we need to create a state variable telling us whether the lottery is open or not, and while we are waiting for a random number to
     * get back, we will be in a closed or a calculated state.
     *
     */

    // We define some conditions to be checked in order to run performUpKeep function!
    // Off-chain computation, a node runs the checkUpkeep function.
    // If it returns upkeepNeeded then it will run performUpkeep on chain.
    // Generate data off-chain and if it returns true, then we run performUpKeep in the chain.

    // KeeperCompatibleInterface

    function checkUpkeep(
        bytes memory /* checkData */
    ) public view override returns (bool upkeepNeeded, bytes memory /* performData */) {
        bool isOpen = (RaffleState.OPEN == s_raffleState);
        bool timePassed = ((block.timestamp - s_lastTimeStamp) > interval);
        bool hasPlayers = (s_players.length > 0);
        bool hasBalance = address(this).balance > 0;
        upkeepNeeded = (isOpen && timePassed && hasPlayers && hasBalance);
        return (upkeepNeeded, "");

        // If upkeepNeded is true, its time to end the lottery and it's time to request a new VRF
        // block.timestamp - last block timestamp > interval  To calculate if enough time is passed, we need to subtract last block timestamp
        // interval is gonna be a some number is seconds to determine how long we want to wait between lottery runs.
    }

    // Having this checkData be a type bytes means that we can even specify this to call other functions.
    // There is a lot of advanced things you can do by just having input parameter as type of bytes.
    // However for now, we are not gonna use this checkData piece.

    // 14:47:50 Rename requestRandomWinner() to performUpKeep(bytes calldata /* performData */)

    // KeeperCompatibleInterface
    function performUpkeep(
        bytes calldata /* performData */ // calldata actually doesn't work with strings
    ) external override {
        // This func will be called by the chanlink keeper network so that it will run automatically without us having to interact with it
        // 1 - Request the random number
        // 2 - Once we get it, do smg with it
        // 2 txn process
        /* Having random numbers in 2 txns is actually also much better than having it in one. It it was just 1 txn, then people just brute force tries simulating
         calling this txn to see what they can manipulate to make sure that they are the winner. We want to make sure that this is absolutely fair. This func
         gonna request it and then in a second func random number to number is gonna be returned and then the txn that we actually get the random number from
         the chain link network that's when we are gonna actually send the money to the winner. The func that calls VRF is fullfillRandomWords 
        */
        // We are gonna set this up so that the CL Keepers call this on an interval.

        (bool upKeepNeeded, ) = checkUpkeep("");
        if (!upKeepNeeded) {
            revert Raffle__UpKeepNotNeeded(
                address(this).balance,
                s_players.length,
                uint256(s_raffleState)
            ); // We are gonna pass some vars so whoever was running into this bug can see why they are getting this error
        }

        s_raffleState = RaffleState.CALCULATING;

        // Which requests to the contract for corresponding network i_vrfCoordinator.requestRandomWords
        // VRFCoordinatorV2Interface

        uint256 requestId = i_vrfCoordinator.requestRandomWords(
            i_gasLane, //keyHash, //gasLane
            i_subscriptionId,
            REQUEST_CONFIRMATION,
            i_callbackGasLimit,
            NUM_WORDS
        );
        // This is redundant since VRFCoordinatorV2 already emits that parameter. But for this course we leave it
        emit RequestedRaffleWinner(requestId);
    }

    // When we trigger the i_vrfCoordinator.requestRandomWords, it gives us a random number inside randomWords[0]. Since we write the
    // i_vrfCoordinator.requestRandomWords inside performUpKeep, it's gonna create random variable periodically in terms of our defined
    // conditions inside checkUpKeep.

    // In order to call fulfillRandomWords, we are passing VRFConsumerBaseV2

    function fulfillRandomWords(
        uint256 /*requestId*/, // Since we dont use requestId, but we still need. It's like hey we know u need uint256 but we won't use requestId
        uint256[] memory randomWords
    ) internal override {
        // s_players size 10
        // randomNumber 200
        // 202 % 10 = 2
        // ..... bla bla bla many codes to get randomWords !!!

        uint256 indexOfWinner = randomWords[0] % s_players.length;
        address payable recentWinner = s_players[indexOfWinner];
        s_recentWinner = recentWinner;
        s_raffleState = RaffleState.OPEN; // Reset the RaffleState
        s_players = new address payable[](0); // Reset the s_players array!!!
        s_lastTimeStamp = block.timestamp;

        (bool success, ) = recentWinner.call{value: address(this).balance}(""); // Send all the money inside the contract!

        // require(success)
        if (!success) {
            revert Raffle__TransferFailed();
        }
        emit WinnerPicked(recentWinner);
    }

    function getEntranceFee() public view returns (uint256) {
        return i_entranceFee;
    }

    function getPlayer(uint256 index) public view returns (address) {
        return s_players[index];
    }

    function getRecentWinner() public view returns (address) {
        return s_recentWinner;
    }

    function getRaffleState() public view returns (RaffleState) {
        return s_raffleState;
    }

    function getNumWords() public pure returns (uint256) {
        return NUM_WORDS; // It doesn't read from storage
    }

    function getNumberOfPlayers() public view returns (uint256) {
        return s_players.length;
    }

    function getInterval() public view returns (uint256) {
        return interval;
    }

    function updateInterval(uint _interval) public {
        require(msg.sender == raffleOwner, "Only raffleOwner can change the interval");
        interval = _interval;
    }

    function getLatestTimeStamp() public view returns (uint256) {
        return s_lastTimeStamp;
    }

    function getRequestConfirmations() public pure returns (uint256) {
        return REQUEST_CONFIRMATION;
    }

    function moneyInContract() public view returns (uint256) {
        return address(this).balance;
    }

    function getRaffleOwner() public view returns (address) {
        return raffleOwner;
    }
}
