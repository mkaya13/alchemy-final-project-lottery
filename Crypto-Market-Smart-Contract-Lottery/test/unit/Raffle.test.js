const { deployments, ethers, getNamedAccounts, network } = require("hardhat")
const { expect, assert } = require("chai")
const { developmentChains } = require("../../helper-hardhat-config")
const { namedAccounts } = require("../../hardhat.config")
const { isCallTrace } = require("hardhat/internal/hardhat-network/stack-traces/message-trace")

// Test for Local Network First!!!

// Remember to control the constructor arguments as well

/* 
!developmentChains.includes(network.name) ?
describe.skip 
: describe {"asd", async () => {
    Define arguments:
    let a,b ...
    ...
}} 
    beforeEach("asd", async() => {
        // Get the deployer + deploymentProof
        const { deployer } = await getNamedAccounts()
        deploymentProof = await deployments.fixture(["all"])
        // Get the contracts that are deployed
        contractName = await ethers.getContract("contractName", deployer)
        
        ...

    })
    it("asd", async() => {

    })

    it("asd",async() => {

    })

//console.log("deployer:")
//console.log(deployer)
//console.log("-----------------------------")
//console.log("deployments:")
//console.log(deployments)
//console.log("------------------------------")
//console.log("raffle:")
//console.log(raffle)
//console.log("------------------------------")
//console.log("VRFCoordinatorV2Mock:")
//console.log(VRFCoordinatorV2Mock)


*/

console.log("Network:", network.name)

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Raffle Unit Tests", () => {
          let deployer
          let deploymentProof
          let raffle, raffleContract
          let VRFCoordinatorV2Mock
          let raffleEntranceFee
          let interval

          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer
              deploymentProof = await deployments.fixture(["all"]) // It will run all the scripts with all tag

              raffleContract = await ethers.getContract("Raffle")
              raffle = await ethers.getContract("Raffle", deployer)
              VRFCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer)

              raffleEntranceFee = await raffle.getEntranceFee()
              interval = await raffle.getInterval()
          })

          describe("Constructor Arguments", () => {
              it("Initializes the raffle constructor arguments correctly", async () => {
                  // Ideally we make our tests have just 1 assert per "it"
                  const entranceFee = await raffle.getEntranceFee()
                  assert.equal(entranceFee.toString(), ethers.utils.parseEther("0.01"))

                  const raffleState = await raffle.getRaffleState()
                  assert.equal(raffleState.toString(), 0)

                  assert.equal(interval.toString(), 30)
              })
          })

          describe("Enter Raffle", () => {
              it("Reverts when you pay not enough!", async () => {
                  await expect(raffle.enterRaffle()).to.be.revertedWith(
                      "Raffle__NotEnoughETHEntered"
                  )

                  await expect(
                      raffle.enterRaffle({ value: ethers.utils.parseEther("0.00001") })
                  ).to.be.revertedWith("Raffle__NotEnoughETHEntered")
              })

              it("Records player when they enter sufficient amount of ethers", async () => {
                  await raffle.enterRaffle({
                      value: ethers.utils.parseEther("0.01"),
                  })

                  const playerFromContract = await raffle.getPlayer(0)

                  assert.equal(playerFromContract, deployer)
              })
              // For grapping events
              it("Emits an event on enter", async () => {
                  await expect(raffle.enterRaffle({ value: raffleEntranceFee })).to.emit(
                      raffle,
                      "RaffleEnter"
                  )
              })
              it("Doesn't allow entrance when raffle is in CALCULATING state", async () => {
                  await raffle.enterRaffle({ value: raffleEntranceFee })
                  await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                  await network.provider.send("evm_mine", []) // await network.provider.request({method: "evm_mine", params: []})  We need to increase block count by 1
                  // We pretend to be a CL Keeper
                  await raffle.performUpkeep([]) // Pass an empty call data just by passing blank array like that []
                  await expect(raffle.enterRaffle({ value: raffleEntranceFee })).to.be.revertedWith(
                      "Raffle__NotOpen"
                  )
              })
          })

          describe("checkUpkeep", () => {
              it("returns false if people haven't sent any ETH", async () => {
                  // await raffle.enterRaffle({ value: raffleEntranceFee })
                  await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                  await network.provider.send("evm_mine", [])
                  const { upkeepNeeded } = await raffle.callStatic.checkUpkeep([])
                  assert(!upkeepNeeded) // Since ! returns true we have check mark!
              })
              it("returns false if raffle isn't open", async () => {
                  await raffle.enterRaffle({ value: raffleEntranceFee })
                  await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                  await network.provider.send("evm_mine", [])
                  await raffle.performUpkeep([]) // performUpkeep function has been started!
                  const raffleState = await raffle.getRaffleState() // returns CALCULATING
                  const { upkeepNeeded } = await raffle.callStatic.checkUpkeep([]) // returns false
                  assert.equal(raffleState.toString(), "1", upkeepNeeded == false)
                  // assert.equal(upkeepNeeded, false)
              })
              it("returns false if enough time hasn't passed", async () => {
                  await raffle.enterRaffle({ value: raffleEntranceFee })
                  await network.provider.send("evm_increaseTime", [interval.toNumber() - 5]) // use a higher number here if this test fails
                  await network.provider.request({ method: "evm_mine", params: [] })
                  const { upkeepNeeded } = await raffle.callStatic.checkUpkeep("0x") // upkeepNeeded = (timePassed && isOpen && hasBalance && hasPlayers)
                  assert(!upkeepNeeded)
              })
              it("returns true if enough time has passed, has players, eth, and is open", async () => {
                  await raffle.enterRaffle({ value: raffleEntranceFee })
                  await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                  await network.provider.request({ method: "evm_mine", params: [] })
                  const { upkeepNeeded } = await raffle.callStatic.checkUpkeep("0x") // upkeepNeeded = (timePassed && isOpen && hasBalance && hasPlayers)
                  assert(upkeepNeeded)
              })
          })
          describe("performUpkeep", () => {
              it("it can only run if checkUpkeep is true", async () => {
                  await raffle.enterRaffle({ value: raffleEntranceFee })
                  await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                  await network.provider.request({ method: "evm_mine", params: [] })
                  const tx = await raffle.performUpkeep([])
                  assert(tx)
              })
              it("reverts when checkUpkeep is false", async () => {
                  await expect(raffle.performUpkeep([])).to.be.revertedWith(
                      "Raffle__UpKeepNotNeeded"
                  )
              })
              // TO BE CONTINUED !
              it("updates the raffle state, emits an event and calls the vrf coordinator", async () => {
                  for (let i = 0; i < 2; i++) {
                      await raffle.enterRaffle({ value: ethers.utils.parseEther("0.01") })
                  }
                  await expect(raffle.performUpkeep([])).to.be.revertedWith(
                      "Raffle__UpKeepNotNeeded(20000000000000000, 2, 0)"
                  )
              })
          })
          describe("fulfillRandomWords", () => {
              beforeEach(async () => {
                  await raffle.enterRaffle({ value: raffleEntranceFee })
                  await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                  await network.provider.request({ method: "evm_mine", params: [] })
              })
              it("can only be called after performUpkeep", async () => {
                  await expect(
                      VRFCoordinatorV2Mock.fulfillRandomWords(0, raffle.address)
                  ).to.be.revertedWith("nonexistent request")
                  await expect(
                      VRFCoordinatorV2Mock.fulfillRandomWords(1, raffle.address)
                  ).to.be.revertedWith("nonexistent request")
              })
              // This test is too big...
              // This test simulates users entering the raffle and wraps the entire functionality of the raffle
              // inside a promise that will resolve if everything is successful.
              // An event listener for the WinnerPicked is set up
              // Mocks of chainlink keepers and vrf coordinator are used to kickoff this winnerPicked event
              // All the assertions are done once the WinnerPicked event is fired
              it("picks a winner, resets the lottery, and sends money", async () => {
                  let newAccountsraffle
                  const additionalEntrances = 3
                  const startingAccountIndex = 2 // deployer = 0
                  const accounts = await ethers.getSigners()
                  for (
                      let i = startingAccountIndex;
                      i <= startingAccountIndex + additionalEntrances;
                      i++
                  ) {
                      newAccountsraffle = raffleContract.connect(accounts[i]) // Returns a new instance of the Raffle contract connected to player
                      await newAccountsraffle.enterRaffle({ value: raffleEntranceFee })
                  }
                  const startingTimeStamp = await raffle.getLatestTimeStamp()

                  // performUpkeep (mock being chainlink keepers)
                  // fulfillRandomWords (mock being the CL VRF!)
                  // We will have to wait for the fulfillRandomWords to be called
                  // We do it like that since when we are doing it in the test net, we don't know when the transactions will happen!
                  await new Promise(async (resolve, reject) => {
                      raffle.once("WinnerPicked", async () => {
                          // event listener for WinnerPicked
                          console.log("WinnerPicked event is fired!")
                          try {
                              const recentWinner = await raffle.getRecentWinner()
                              const raffleState = await raffle.getRaffleState()
                              const endingTimeStamp = await raffle.getLatestTimeStamp()
                              const numPlayers = await raffle.getNumberOfPlayers()
                              const winnerEndingBalance = await accounts[2].getBalance()

                              console.log("recentWinner:", recentWinner)
                              console.log(deployer)
                              console.log(accounts[2].address)
                              console.log(accounts[4].address)
                              console.log(accounts[3].address)
                              console.log(accounts[5].address)

                              assert.equal(recentWinner.toString(), accounts[2].address)
                              assert.equal(numPlayers.toString(), "0")
                              assert.equal(raffleState.toString(), "0")
                              assert(endingTimeStamp > startingTimeStamp)
                              assert.equal(
                                  winnerEndingBalance.toString(),
                                  winnerStartingBalance
                                      .add(
                                          raffleEntranceFee
                                              .mul(additionalEntrances)
                                              .add(raffleEntranceFee) // Comes from the deployer inside beforeEach
                                              .add(raffleEntranceFee) // Comes from the player's own money
                                      )
                                      .toString()
                              )
                              resolve()
                          } catch (e) {
                              reject(e)
                          }
                      })
                      // Setting up the listener
                      // Outside of the listener but inside of the promise, we will simulate the events, so that when the listener gets WinnerPicked event, it will act
                      // below, we will fire the event, and the listener will pick it up, and resolve
                      const tx = await raffle.performUpkeep([])
                      const txReceipt = await tx.wait(1)
                      const winnerStartingBalance = await accounts[2].getBalance()
                      let entranceCount = await raffle.getNumberOfPlayers()
                      assert.equal(entranceCount.toString(), "5")

                      await VRFCoordinatorV2Mock.fulfillRandomWords(
                          txReceipt.events[1].args.requestId,
                          raffle.address
                      )
                  })
              })
          })
      })
