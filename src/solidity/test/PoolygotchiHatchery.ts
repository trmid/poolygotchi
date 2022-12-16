import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { type Contract, BigNumber } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { PoolygotchiHatchery } from "../typechain-types";

describe("PoolygotchiHatchery", () => {

  // Error messages:
  const NOT_OWNER_ERROR = "Ownable: caller is not the owner";

  async function deploy() {
    const [owner, account2] = await ethers.getSigners();
    const PoolygotchiHatchery = await ethers.getContractFactory("PoolygotchiHatchery");
    const hatchery = await PoolygotchiHatchery.deploy();
    return { owner, account2, hatchery };
  }

  describe("Deployment", () => {
    it("Should deploy with zero species", async () => {
      const { hatchery } = await loadFixture(deploy);
      expect(await hatchery.numSpecies()).to.equal(0);
    });
  });

});