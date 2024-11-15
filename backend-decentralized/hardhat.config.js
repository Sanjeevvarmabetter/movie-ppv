require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();


/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",

  networks: {
    taiko: {
      url: "https://rpc.hekla.taiko.xyz",
      accounts: [process.env.PRIVATE_KEY] 
    }
  }
};




