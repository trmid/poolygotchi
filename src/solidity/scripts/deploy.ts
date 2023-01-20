import { ethers } from "hardhat";

async function main() {
  if(!process.env.DEPLOY_KEY) throw new Error("Missing DEPLOY_KEY from environment.");

  const Hatchery = await ethers.getContractFactory("PoolygotchiHatchery");
  const hatchery = await Hatchery.deploy();

  await hatchery.deployed();

  console.log(`Hatchery deployed to ${hatchery.address}. Adding environments and species...`);
  (await hatchery.addEnvironment(`ipfs://QmcSHwUSF2vmPXwjbtGFyTqVRhdoGkxE7uTPeCYbwAhZiq`, ethers.constants.AddressZero)).wait();
  (await hatchery.addEnvironment(`ipfs://QmSbtHWdNesSWiifrqbGUpzs5ffQkCwWobhY8fckmhxoj9`, ethers.constants.AddressZero)).wait();
  (await hatchery.addEnvironment(`ipfs://QmTeutxiyLsPQSiWk2sCtg9WDanDTR9n6H9Evwfr9qK5ox`, ethers.constants.AddressZero)).wait();
  (await hatchery.addSpecies(`ipfs://QmdBJMfBJdm7D9b6ckHA2afBayiNnizFbo4waH4gts2DKp`, ethers.constants.AddressZero)).wait();
  (await hatchery.addSpecies(`ipfs://QmctUVpak9D6m6C9mkY9BVQACg4Q9nNohCMjGMKo76vHyv`, ethers.constants.AddressZero)).wait();
  (await hatchery.addSpecies(`ipfs://QmZGmQVouFUctKHiZU9SKRfrF9Q4A25Q1E6qAM2z57qo6A`, ethers.constants.AddressZero)).wait();
  console.log(`Done!`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
