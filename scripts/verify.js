const { run } = require("hardhat");
require("dotenv").config();

async function verifyContracts() {
  console.log("🔍 VERIFYING CONTRACTS ON ETHERSCAN");
  console.log("=".repeat(50));

  const testTokenAddress = process.env.TEST_TOKEN_ADDRESS;
  const paymasterAddress = process.env.PAYMASTER_ADDRESS;
  const simpleAccountAddress = process.env.SIMPLE_ACCOUNT_ADDRESS;
  const entryPoint = process.env.ENTRYPOINT_ADDRESS;

  console.log("📋 Contract addresses to verify:");
  console.log("TestToken:", testTokenAddress);
  console.log("PaymasterContract:", paymasterAddress);
  console.log("SimpleAccount:", simpleAccountAddress);
  console.log("");

  // Address kontrolü
  if (!testTokenAddress || !paymasterAddress || !simpleAccountAddress) {
    console.error("❌ Contract addresses not found in .env!");
    console.log("Please check your .env file contains:");
    console.log("TEST_TOKEN_ADDRESS=...");
    console.log("PAYMASTER_ADDRESS=...");
    console.log("SIMPLE_ACCOUNT_ADDRESS=...");
    return;
  }

  try {
    // Verify TestToken
    console.log("📄 Verifying TestToken...");
    await run("verify:verify", {
      address: testTokenAddress,
      constructorArguments: ["Test USDC", "TUSDC", 1000000],
    });
    console.log("✅ TestToken verified");

    // Verify PaymasterContract
    console.log("\n💰 Verifying PaymasterContract...");
    await run("verify:verify", {
      address: paymasterAddress,
      constructorArguments: [],
    });
    console.log("✅ PaymasterContract verified");

    // Verify SimpleAccount
    console.log("\n👤 Verifying SimpleAccount...");
    await run("verify:verify", {
      address: simpleAccountAddress,
      constructorArguments: [entryPoint],
    });
    console.log("✅ SimpleAccount verified");

    console.log("\n🎉 ALL CONTRACTS VERIFIED!");
    console.log("=".repeat(50));
    console.log("🔗 VERIFIED ETHERSCAN LINKS:");
    console.log("TestToken:", `https://sepolia.etherscan.io/address/${testTokenAddress}#code`);
    console.log("PaymasterContract:", `https://sepolia.etherscan.io/address/${paymasterAddress}#code`);
    console.log("SimpleAccount:", `https://sepolia.etherscan.io/address/${simpleAccountAddress}#code`);

  } catch (error) {
    console.error("❌ Verification failed:", error.message);
    
    // Eğer already verified hatası ise
    if (error.message.includes("already verified")) {
      console.log("ℹ️  Some contracts may already be verified");
    }
  }
}

if (require.main === module) {
  verifyContracts()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { verifyContracts };