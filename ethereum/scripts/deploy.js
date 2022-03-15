// const hre = require("hardhat");
const { ethers, upgrades } = require('hardhat');

async function main() {
  const CampaignFactory = await ethers.getContractFactory('CampaignFactory');
  console.log('Deploying CampaignFactory...');
  const cFactory = await upgrades.deployProxy(CampaignFactory);
  await cFactory.deployed();
  console.log('CampaignFactory deployed to:', cFactory.address);
}


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
