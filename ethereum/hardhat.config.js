require("@nomiclabs/hardhat-waffle");
require('@nomiclabs/hardhat-ethers');
require('@openzeppelin/hardhat-upgrades');

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 1337
    },
    // mainnet: {
    //   url: `https://mainnet.infura.io/v3/${process.env.PROJECT_ID}`,
    //   accounts: [process.env.PRIVATE_KEY]
    // },
    // rinkeby: {
    //   url: `https://rinkeby.infura.io/v3/${process.env.PROJECT_ID}`,
    //   accounts: [process.env.PRIVATE_KEY]
    // }
  },
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
}
