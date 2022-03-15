// const hre = require("hardhat");
const { ethers, upgrades } = require('hardhat');
const currentChain = '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707';
async function main() {
    const CampaignFactory = await ethers.getContractFactory("CampaignFactory");
    console.log('Upgrading CampaignFactory...');
    await upgrades.upgradeProxy(currentChain, CampaignFactory);
    console.log('CampaignFactory upgraded');
}


main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
