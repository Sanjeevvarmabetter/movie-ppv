const { ethers } = require("hardhat");

async function main() {
    // Set a delay function for cleaner code
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

    // Deploy contract
    const StorageContract = await ethers.getContractFactory("MNFT");
    const storageContract = await StorageContract.deploy();

    // Wait until deployment is confirmed

    
    // Add a delay to ensure state consistency on the network
    await delay(5000); // 5 seconds delay, adjust if needed

    // Attempt to log the deployment details
    console.log("Contract deployed successfully.");
    console.log(`Deployer: ${storageContract.runner.address}`);
    console.log(`Deployed to: ${storageContract.target}`);
    console.log(`Transaction hash: ${storageContract.deploymentTransaction().hash}`);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });


//     Compiled 19 Solidity files successfully (evm target: paris).
// Contract deployed successfully.
// Deployer: 0xEA29129049A8B3fB0b2318b4aF2c2B45f459Eea7
// Deployed to: 0x518532f47149C41817861603952EbbE63f881BeF
// Transaction hash: 0x6f1a27788d9ac7b29be53b5ab0158e54484e139e08107c30083909717b7d6838
