import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import * as hardhat from "hardhat";
import "@nomiclabs/hardhat-waffle";

describe("Token", function () {
  let instance: Contract;
  let signers: SignerWithAddress[];
  let owner: SignerWithAddress;

  before(async () => {
    signers = await hardhat.ethers.getSigners();
    owner = signers[0];

    const Token = await hardhat.ethers.getContractFactory("Token");
    instance = await Token.deploy(
      "Edufied",
      "XYZ",
      BigNumber.from("100000000"),
      signers.slice(1, 10).map((s) => s.address)
    );
  });

  describe("Deployment", () => {
    it("should get deployed to a non-zero address", async () => {
      expect(instance.address).not.eq(hardhat.ethers.constants.AddressZero);
    });
    it("should have the correct owner", async () => {
      expect(await instance.owner()).eq(owner.address);
    });
    it("should have the correct beneficiaries", async () => {
      for (let i = 1; i < 10; i++) {
        expect(await instance.beneficiary(signers[i].address));
      }
    });
    it("should have the correct metadata", async () => {
      expect(await instance.symbol()).eq("XYZ");
      expect(await instance.name()).eq("Edufied");
      expect(await instance.decimals()).eq(BigNumber.from(18));
    });
    it("should have the correct cap", async () => {
      expect(await instance.cap()).eq(BigNumber.from(100000000));
    });
  });

  describe("Vesting and withdrawl", () => {
    it("should not allow non-benefecieries to withdraw", async () => {
      await expect(instance.connect(owner).withdraw(100)).to.be.revertedWith(
        "XYZ: not a beneficiary"
      );
    });
    it("should not allow benefecieries to withdraw if above limit", async () => {
      // ..after 5 mins
      await hardhat.network.provider.request({
        method: "evm_increaseTime",
        params: [60 * 5],
      });
      await expect(
        instance.connect(signers[1]).withdraw(10000)
      ).to.revertedWith("XYZ: incorrect amount");
    });
    it("should allow benefecieries to withdraw", async () => {
      // ..after 5 mins
      await hardhat.network.provider.request({
        method: "evm_increaseTime",
        params: [60 * 5],
      });
      await expect(instance.connect(signers[1]).withdraw(100)).to.emit(
        instance,
        "WithdrawVested"
      );
    });
  });

  describe("Due amount", () => {
    it("should revert for non-beneficiaries", async () => {
      await expect(instance.checkDue(owner.address)).to.be.revertedWith(
        "XYZ: not a beneficiary"
      );
    });
    it("should return due withdrawable amount for beneficiaries", async () => {
      const perMin = await instance.amountPerMin();

      // ..after 5 mins
      await hardhat.network.provider.request({
        method: "evm_increaseTime",
        params: [60 * 5],
      });
      expect(await instance.checkDue(signers[2].address)).to.be.gte(
        perMin.mul(5)
      );
    });
  });
});
