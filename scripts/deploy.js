const { ethers } = require("hardhat");
const fs = require("fs");
require("dotenv").config();

async function main() {
  console.log("🚀 DEPLOYING TO SEPOLIA");
  console.log("=".repeat(60));
  
  // Network bilgilerini göster
  const network = await ethers.provider.getNetwork();
  console.log("📡 Network:", network.name, "(" + network.chainId + ")");
  
  const [deployer] = await ethers.getSigners();
  console.log("👤 Deployer:", deployer.address);
  console.log("💰 Balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH");
  
  const walletA = process.env.WALLET_A_ADDRESS;
  const walletB = process.env.WALLET_B_ADDRESS;
  const walletX = process.env.WALLET_X_ADDRESS;
  const entryPoint = process.env.ENTRYPOINT_ADDRESS;
  
  console.log("\n🎯 Test Participants:");
  console.log("Wallet A (sender):", walletA);
  console.log("Wallet B (receiver):", walletB);
  console.log("Wallet X (sponsor):", walletX);
  console.log("EntryPoint:", entryPoint);

  // 1. Deploy TestToken
  console.log("\n📄 Deploying TestToken...");
  const TestToken = await ethers.getContractFactory("TestToken");
  const testToken = await TestToken.deploy("Test USDC", "TUSDC", 1000000);
  await testToken.waitForDeployment();
  const testTokenAddress = await testToken.getAddress();
  console.log("✅ TestToken deployed:", testTokenAddress);
  console.log("🔗 Etherscan:", `https://sepolia.etherscan.io/address/${testTokenAddress}`);

  // 2. Deploy PaymasterContract
  console.log("\n💰 Deploying PaymasterContract...");
  const PaymasterContract = await ethers.getContractFactory("PaymasterContract");
  const paymaster = await PaymasterContract.deploy();
  await paymaster.waitForDeployment();
  const paymasterAddress = await paymaster.getAddress();
  console.log("✅ PaymasterContract deployed:", paymasterAddress);
  console.log("🔗 Etherscan:", `https://sepolia.etherscan.io/address/${paymasterAddress}`);

  // 3. Deploy SimpleAccount
  console.log("\n👤 Deploying SimpleAccount...");
  const SimpleAccount = await ethers.getContractFactory("SimpleAccount");
  const simpleAccount = await SimpleAccount.deploy(entryPoint);
  await simpleAccount.waitForDeployment();
  const simpleAccountAddress = await simpleAccount.getAddress();
  
  // Initialize with Wallet A as owner
  console.log("⚙️ Initializing SimpleAccount...");
  await simpleAccount.initialize(walletA);
  console.log("✅ SimpleAccount deployed and initialized:", simpleAccountAddress);
  console.log("🔗 Etherscan:", `https://sepolia.etherscan.io/address/${simpleAccountAddress}`);

  // 4. Initial setup
  console.log("\n⚙️ Initial Setup...");
  
  // Add Wallet X as sponsor
  console.log("Adding sponsor...");
  await paymaster.addSponsor(walletX);
  console.log("✅ Added Wallet X as authorized sponsor");

  // Mint tokens to SimpleAccount
  console.log("Minting tokens...");
  await testToken.mint(simpleAccountAddress, ethers.parseUnits("1000", 18));
  console.log("✅ Minted 1000 TUSDC to SimpleAccount");

  // Update .env file with contract addresses
  console.log("\n📝 Updating .env file...");
  const envPath = '.env';
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Replace contract addresses
  envContent = envContent.replace(/TEST_TOKEN_ADDRESS=.*/, `TEST_TOKEN_ADDRESS=${testTokenAddress}`);
  envContent = envContent.replace(/PAYMASTER_ADDRESS=.*/, `PAYMASTER_ADDRESS=${paymasterAddress}`);
  envContent = envContent.replace(/SIMPLE_ACCOUNT_ADDRESS=.*/, `SIMPLE_ACCOUNT_ADDRESS=${simpleAccountAddress}`);
  
  fs.writeFileSync(envPath, envContent);
  console.log("✅ Contract addresses updated in .env");

  console.log("\n🎉 DEPLOYMENT COMPLETED!");
  console.log("=".repeat(60));
  console.log("📋 DEPLOYED CONTRACTS:");
  console.log("TestToken:", testTokenAddress);
  console.log("PaymasterContract:", paymasterAddress);
  console.log("SimpleAccount:", simpleAccountAddress);
  console.log("");
  console.log("🔗 ETHERSCAN LINKS:");
  console.log("TestToken:", `https://sepolia.etherscan.io/address/${testTokenAddress}`);
  console.log("PaymasterContract:", `https://sepolia.etherscan.io/address/${paymasterAddress}`);
  console.log("SimpleAccount:", `https://sepolia.etherscan.io/address/${simpleAccountAddress}`);
  console.log("=".repeat(60));
  
  console.log("\n📝 NEXT STEPS:");
  console.log("1. Run demo: npx hardhat run scripts/demo.js --network sepolia");
  console.log("2. Run test: npx hardhat run scripts/testScenario.js --network sepolia");

  return {
    testToken: testTokenAddress,
    paymaster: paymasterAddress,
    simpleAccount: simpleAccountAddress
  };
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});