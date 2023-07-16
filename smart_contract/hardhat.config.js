require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",

  networks:{
    Mumbai:{
      url: 'https://rpc-mumbai.maticvigil.com/',
      accounts: ['234c8ba4d3d5170a84d4a921f03b7fe8789d9d9d086d50834d5a2854d8430256']
    }
  }

};
