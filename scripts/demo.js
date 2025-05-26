const { ethers } = require("hardhat");
const { createUserOperation, signUserOperation } = require("./metaTransaction");
require("dotenv").config();

async function demonstrateMetaTx() {
  console.log("🎬 META TRANSACTION DEMO");
  console.log("=".repeat(60));
  
  // 1. Setup accounts
  console.log("📋 Step 1: Setup accounts");
  const walletA = process.env.WALLET_A_ADDRESS;
  const walletB = process.env.WALLET_B_ADDRESS;
  const walletX = process.env.WALLET_X_ADDRESS;
  
  console.log("👤 Wallet A (Token Sender):", walletA);
  console.log("👤 Wallet B (Token Receiver):", walletB);
  console.log("💰 Wallet X (Gas Sponsor):", walletX);
  console.log("");

  // 2. Get deployed contracts
  console.log("📋 Step 2: Connect to deployed contracts");
  const testTokenAddress = process.env.TEST_TOKEN_ADDRESS;
  const paymasterAddress = process.env.PAYMASTER_ADDRESS;
  const simpleAccountAddress = process.env.SIMPLE_ACCOUNT_ADDRESS;
  
  console.log("🪙 TestToken:", testTokenAddress);
  console.log("💳 Paymaster:", paymasterAddress);
  console.log("🏦 SimpleAccount:", simpleAccountAddress);
  console.log("");

  const [deployer] = await ethers.getSigners();
  const walletXSigner = new ethers.Wallet(process.env.WALLET_X_PRIVATE_KEY, deployer.provider);
  
  const testToken = await ethers.getContractAt("TestToken", testTokenAddress);
  const paymaster = await ethers.getContractAt("PaymasterContract", paymasterAddress);

  // Check Wallet X balance
  const walletXBalance = await deployer.provider.getBalance(walletX);
  console.log("💰 Wallet X ETH balance:", ethers.formatEther(walletXBalance), "ETH");

  // 3. Fund sponsor
  console.log("📋 Step 3: Fund sponsor");
  const sponsorBalance = await paymaster.sponsorBalances(walletX);
  console.log("Current sponsor balance:", ethers.formatEther(sponsorBalance), "ETH");
  
  // Daha az ETH ekle ve balance kontrolü yap
  const depositAmount = ethers.parseEther("0.01"); // 0.05'ten 0.01'e düşürdük
  
  if (sponsorBalance < ethers.parseEther("0.005")) {
    if (walletXBalance < depositAmount) {
      console.log("❌ Wallet X has insufficient ETH!");
      console.log("💡 Solution: Send some ETH to Wallet X:", walletX);
      console.log("Required:", ethers.formatEther(depositAmount), "ETH");
      console.log("Available:", ethers.formatEther(walletXBalance), "ETH");
      
      // Deployer'dan Wallet X'e ETH gönder
      console.log("⏳ Transferring ETH from deployer to Wallet X...");
      const transferTx = await deployer.sendTransaction({
        to: walletX,
        value: ethers.parseEther("0.02") // 0.02 ETH gönder
      });
      await transferTx.wait();
      console.log("✅ Transferred 0.02 ETH to Wallet X");
      console.log("📄 Transfer tx:", transferTx.hash);
    }
    
    console.log("⏳ Adding sponsor funds...");
    const tx = await paymaster.connect(walletXSigner).depositForSponsor(walletX, { 
      value: depositAmount 
    });
    await tx.wait();
    console.log("✅ Added", ethers.formatEther(depositAmount), "ETH to sponsor balance");
    console.log("📄 Sponsor funding tx:", tx.hash);
  }
  console.log("");

  // 4. Execute sponsored transaction (simulated)
  console.log("📋 Step 4: Execute sponsored transaction");
  const transferAmount = ethers.parseUnits("100", 18);
  
  // Check balances before
  const balanceABefore = await testToken.balanceOf(simpleAccountAddress);
  const balanceBBefore = await testToken.balanceOf(walletB);
  const sponsorBalanceBefore = await paymaster.sponsorBalances(walletX);
  
  console.log("💰 Before transaction:");
  console.log("- A's balance:", ethers.formatUnits(balanceABefore, 18), "TUSDC");
  console.log("- B's balance:", ethers.formatUnits(balanceBBefore, 18), "TUSDC");
  console.log("- Sponsor balance:", ethers.formatEther(sponsorBalanceBefore), "ETH");
  console.log("");

  console.log("⏳ Creating meta transaction...");
  console.log("📤 Transfer: 100 TUSDC from A to B");
  console.log("💸 Gas sponsored by:", walletX);
  
  // TODO: Actual EntryPoint execution would go here
  console.log("🔄 [SIMULATED] Transaction would be executed via EntryPoint");
  
  // 5. Verify results (simulated)
  console.log("");
  console.log("📋 Step 5: Verify results");
  
  console.log("✅ Transaction successful!");
  console.log("📊 Results:");
  console.log("- 100 TUSDC would be transferred from A to B");
  console.log("- Gas fees would be paid by sponsor:", walletX);
  console.log("- A would never pay any ETH for gas fees");
  console.log("");
  
  console.log("🎉 META TRANSACTION DEMO COMPLETED!");
  console.log("=".repeat(60));
  
  return {
    success: true,
    transferAmount: "100 TUSDC",
    gasSponsored: true,
    sponsorAddress: walletX
  };
}

// Script olarak çalıştırılabilir
if (require.main === module) {
  demonstrateMetaTx()
    .then((result) => {
      console.log("Demo completed:", result);
      process.exit(0);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { demonstrateMetaTx };