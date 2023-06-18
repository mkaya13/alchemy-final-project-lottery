const { deployments, ethers, getNamedAccounts, network } = require("hardhat")
const { expect, assert } = require("chai")
const { developmentChains, networkConfig } = require("../../helper-hardhat-config")

// 1. Get our SubId for CL VRF
// 2. Deploy our contract using the SubId
// 3. Register the contract with CL VRF & its subId
// 4. Register the contract with CL Keepers
// 5. Run staging tests

// Go to vrf.chain.link open a subscribe account, add subscriptionId to helper-hardhat-config.js, then add the contract address as consumer
// Go to keepers.chain.link and register the contract for CL keepers

developmentChains.includes(network.name)
    ? describe.skip
    : describe("Raffle Unit Tests", () => {
          let deployer
          let deploymentProof
          let raffle, raffleContract
          // let VRFCoordinatorV2Mock we won't need it
          let raffleEntranceFee

          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer
              // deploymentProof = await deployments.fixture(["all"]) // It will run all the scripts with all tag

              raffleContract = await ethers.getContract("Raffle") // Then we need to connect it to a same user like newAccountsraffle = raffleContract.connect(accounts[i])
              raffle = await ethers.getContract("Raffle", deployer)

              console.log("Contract Address:", raffle.address)

              raffleEntranceFee = await raffle.getEntranceFee()
          })

          describe("fulfillRandomWords", () => {
              it("works with live Chainlink Keepers and CL VRF, we get a random winner", async () => {
                  // enter the raffle
                  const startingTimeStamp = await raffle.getLatestTimeStamp()
                  const accounts = await ethers.getSigners()
                  console.log("DeployerAccount:", accounts[0].address)

                  console.log("Setting up the listener...")
                  await new Promise(async (resolve, reject) => {
                      raffle.once("WinnerPicked", async () => {
                          console.log("WinnerPicked event fired!")
                          try {
                              console.log("Check1")
                              //const recentWinner = await raffle.getRecentWinner()
                              //const raffleState = await raffle.getRaffleState()
                              const winnerEndingBalance = await accounts[0].getBalance()
                              const endingTimeStamp = await raffle.getLatestTimeStamp()

                              console.log("Check2")

                              //expect(await raffle.getPlayer(0)).to.be.reverted()
                              //assert.equal(recentWinner.toString(), accounts[0].address)
                              //assert.equal(raffleState, 0)
                              assert.equal(
                                  winnerEndingBalance.toString(),
                                  winnerStartingBalance.add(raffleEntranceFee).toString()
                              )
                              assert(endingTimeStamp > startingTimeStamp)
                              console.log("Check3")

                              resolve()
                              // If these all go well we resolve, if there is any issue with any of these asserts we catch these errors and we are gonna reject
                          } catch (error) {
                              console.log(error)
                              reject(e)
                          }
                      })

                      // Then entering the raffle
                      console.log("Entering the raffle")
                      tx = await raffle.enterRaffle({ value: raffleEntranceFee })
                      await tx.wait(3) //
                      console.log("Ok, time to wait...")
                      const winnerStartingBalance = await accounts[0].getBalance()
                      console.log(winnerStartingBalance.toString())

                      // and this code WONT complete until our listener has finished listening
                  })

                  // setup listener before we enter the raffle
                  // Just in case the BC moves really fast

                  // await
              })
          })
      })
