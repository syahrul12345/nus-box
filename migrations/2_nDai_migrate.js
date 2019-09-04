const nDAI = artifacts.require("nDAI");

module.exports = deployer => {
  deployer.deploy(nDAI);
};
