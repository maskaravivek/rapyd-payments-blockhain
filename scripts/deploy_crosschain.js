const hre = require("hardhat");

async function main() {
  const Contract = await hre.ethers.getContractFactory("CrossChainPayment");
  const contract = await Contract.deploy();
  
  // In ethers v6, you need to wait for the transaction to be mined
  await contract.waitForDeployment();
  
  // And access the address property differently
  console.log("Contract deployed to:", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});