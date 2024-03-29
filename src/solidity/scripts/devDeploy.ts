import { ethers } from "hardhat";
import fs from "fs";
import { BigNumber } from "ethers";

async function main() {
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
  (await hatchery.hatch("Gerald", 0, 0, 100000000, 0)).wait();
  
  // Send test funds to local wallet:
  const [deployer] = await ethers.getSigners();
  deployer.sendTransaction({ to: "0xF80A7327CED2d6Aba7246E0DE1383DDb57fd4475", from: deployer.address, value: BigNumber.from("0xffffffffffffffff") }).catch(console.error);

  // Modify config:
  const configPath = `${__dirname}/../../config.ts`;
  console.log(configPath);
  let config = fs.readFileSync(configPath, { encoding: 'utf-8' });
  config = config.replace(/const devHatcheryAddress = "[0-9a-zA-Z]*"\;/, `const devHatcheryAddress = "${hatchery.address}";`);
  fs.writeFileSync(configPath, config);
  console.log("Wrote to config file.");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
