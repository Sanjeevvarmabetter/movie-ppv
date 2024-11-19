const { ethers } = require("hardhat");

async function main() {
  // Fetching the account that will deploy the contract
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploying the contract
  const MNFT = await ethers.getContractFactory("VideoNFTMarketplace");
  const nftContract = await MNFT.deploy();
  console.log("MNFT contract deployed to:", nftContract.target);
}

  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
  

//     Compiled 19 Solidity files successfully (evm target: paris).
// Contract deployed successfully.
// Deployer: 0xEA29129049A8B3fB0b2318b4aF2c2B45f459Eea7
// Deployed to: 0x518532f47149C41817861603952EbbE63f881BeF
// Transaction hash: 0x6f1a27788d9ac7b29be53b5ab0158e54484e139e08107c30083909717b7d6838



//0xEaA5a368b47B399cf889213ED2112cf1937DB397



//0x7575870F2A9b0D29D774599e49dBc391e830a27C


// new one
//0xF795C9768cDd370B2B1C71038388D8218D45f01c


// //Compiled 1 Solidity file successfully (evm target: paris).
// Deploying contracts with the account: 0xEA29129049A8B3fB0b2318b4aF2c2B45f459Eea7
// MNFT contract deployed to: 0x6e93C9AEb54A5A04e772c48304fa433F02C79976
