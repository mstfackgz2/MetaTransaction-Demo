const { ethers } = require("hardhat");
const { createUserOperation, signUserOperation } = require("./metaTransaction");
require("dotenv").config();

async function runTestScenario() {
  console.log("🧪 Starting Test Scenario...");
  console.log("=".repeat(50));

  // Tüm bilgileri .env'den al
  const testTokenAddress = process.env.TEST_TOKEN_ADDRESS;
  const paymasterAddress = process.env.PAYMASTER_ADDRESS;
  const simpleAccountAddress = process.env.SIMPLE_ACCOUNT_ADDRESS;
  const entryPointAddress = process.env.ENTRYPOINT_ADDRESS;

  const walletA = process.env.WALLET_A_ADDRESS;
  const walletB = process.env.WALLET_B_ADDRESS;
  const walletX = process.env.WALLET_X_ADDRESS;

  // Adres kontrolü
  if (!testTokenAddress || !paymasterAddress || !simpleAccountAddress) {
    console.error("❌ Contract addresses not found in .env! Run deploy script first and update .env");
    console.log("Missing addresses:");
    if (!testTokenAddress) console.log("- TEST_TOKEN_ADDRESS");
    if (!paymasterAddress) console.log("- PAYMASTER_ADDRESS");
    if (!simpleAccountAddress) console.log("- SIMPLE_ACCOUNT_ADDRESS");
    process.exit(1);
  }

  console.log("📋 Contract Addresses (from .env):");
  console.log("TestToken:", testTokenAddress);
  console.log("PaymasterContract:", paymasterAddress);
  console.log("SimpleAccount:", simpleAccountAddress);
  console.log("EntryPoint:", entryPointAddress);
  console.log("");

  console.log("👥 Test Participants (from .env):");
  console.log("Wallet A (sender):", walletA);
  console.log("Wallet B (receiver):", walletB);
  console.log("Wallet X (sponsor):", walletX);
  console.log("");

  // Signers oluştur
  const [deployer] = await ethers.getSigners();
  const walletXSigner = new ethers.Wallet(process.env.WALLET_X_PRIVATE_KEY, deployer.provider);

  // Contract instance'ları
  const testToken = await ethers.getContractAt("TestToken", testTokenAddress);
  const paymaster = await ethers.getContractAt("PaymasterContract", paymasterAddress);
  const simpleAccount = await ethers.getContractAt("SimpleAccount", simpleAccountAddress);

  console.log("📋 Step 1: Check initial balances");
  const initialTokenBalanceA = await testToken.balanceOf(simpleAccountAddress);
  const initialTokenBalanceB = await testToken.balanceOf(walletB);
  const initialEthBalanceX = await deployer.provider.getBalance(walletX);
  const sponsorBalance = await paymaster.sponsorBalances(walletX);

  console.log("A's token balance:", ethers.formatUnits(initialTokenBalanceA, 18), "TUSDC");
  console.log("B's token balance:", ethers.formatUnits(initialTokenBalanceB, 18), "TUSDC");
  console.log("X's ETH balance:", ethers.formatEther(initialEthBalanceX), "ETH");
  console.log("X's sponsor balance:", ethers.formatEther(sponsorBalance), "ETH");
  console.log("");

  console.log("📋 Step 2: Setup sponsor balance");
  const minSponsorBalance = ethers.parseEther("0.01");
  if (sponsorBalance < minSponsorBalance) {
    console.log("⏳ Adding sponsor balance for X...");
    const depositAmount = ethers.parseEther("0.05");
    await paymaster.connect(walletXSigner).depositForSponsor(walletX, { 
      value: depositAmount 
    });
    console.log("✅ Added", ethers.formatEther(depositAmount), "ETH sponsor balance");
  } else {
    console.log("✅ Sponsor balance sufficient");
  }
  console.log("");

  console.log("📋 Step 3: Create UserOperation for A→B transfer");
  const transferAmount = ethers.parseUnits("100", 18);
  
  const userOp = await createUserOperation(
    simpleAccountAddress,
    walletB,
    testTokenAddress,
    transferAmount,
    paymasterAddress
  );

  console.log("📋 Step 4: Sign UserOperation with A's private key");
  const signature = await signUserOperation(
    userOp,
    process.env.WALLET_A_PRIVATE_KEY,
    entryPointAddress,
    11155111
  );
  userOp.signature = signature;
  console.log("✅ UserOperation created and signed");
  console.log("");

  console.log("📋 Step 5: Display transaction details");
  console.log("Transfer details:");
  console.log("- Amount:", ethers.formatUnits(transferAmount, 18), "TUSDC");
  console.log("- From:", simpleAccountAddress);
  console.log("- To:", walletB);
  console.log("- Gas sponsor:", walletX);
  console.log("");
  
  console.log("✅ Test scenario completed successfully!");
  console.log("📝 UserOperation is ready for EntryPoint execution");
  console.log("=".repeat(50));
}

if (require.main === module) {
  runTestScenario()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { runTestScenario };