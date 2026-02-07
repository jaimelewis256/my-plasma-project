const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Lock", function () {
  it("Should set the right unlockTime", async function () {
    const unlockTime = (await ethers.provider.getBlock("latest")).timestamp + 60;
    const Lock = await ethers.getContractFactory("Lock");
    const lock = await Lock.deploy(unlockTime, { value: ethers.parseEther("0.001") });

    expect(await lock.unlockTime()).to.equal(unlockTime);
  });

  it("Should set the right owner", async function () {
    const [owner] = await ethers.getSigners();
    const unlockTime = (await ethers.provider.getBlock("latest")).timestamp + 60;
    const Lock = await ethers.getContractFactory("Lock");
    const lock = await Lock.deploy(unlockTime, { value: ethers.parseEther("0.001") });

    expect(await lock.owner()).to.equal(owner.address);
  });

  it("Should fail if the unlockTime is not in the future", async function () {
    const latestTime = (await ethers.provider.getBlock("latest")).timestamp;
    const Lock = await ethers.getContractFactory("Lock");

    await expect(
      Lock.deploy(latestTime, { value: ethers.parseEther("0.001") })
    ).to.be.revertedWith("Unlock time should be in the future");
  });
});
