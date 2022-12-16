import { ethers } from "hardhat";

async function main() {
  const Hatchery = await ethers.getContractFactory("PoolygotchiHatchery");
  const hatchery = await Hatchery.deploy();

  await hatchery.deployed();

  console.log(`Hatchery deployed to ${hatchery.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
