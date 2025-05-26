const { ethers } = require("hardhat");
require("dotenv").config();

async function createUserOperation(
  accountAddress,
  targetAddress, 
  tokenAddress,
  amount,
  paymasterAddress
) {
  // Transfer için callData oluştur
  const tokenInterface = new ethers.Interface([
    "function transfer(address to, uint256 amount) returns (bool)"
  ]);
  
  const transferCallData = tokenInterface.encodeFunctionData("transfer", [
    targetAddress,
    amount
  ]);

  // SimpleAccount execute callData
  const accountInterface = new ethers.Interface([
    "function execute(address dest, uint256 value, bytes calldata func)"
  ]);
  
  const executeCallData = accountInterface.encodeFunctionData("execute", [
    tokenAddress,
    0,
    transferCallData
  ]);

  // Gas estimations (basit değerler)
  const callGasLimit = 100000;
  const verificationGasLimit = 100000;
  const preVerificationGas = 21000;
  const maxFeePerGas = ethers.parseUnits("20", "gwei");
  const maxPriorityFeePerGas = ethers.parseUnits("2", "gwei");

  // Paymaster data (sponsor address)
  const paymasterAndData = ethers.concat([
    paymasterAddress,
    process.env.WALLET_X_ADDRESS // sponsor address
  ]);

  const userOp = {
    sender: accountAddress,
    nonce: 0, // İlk transaction için
    initCode: "0x",
    callData: executeCallData,
    callGasLimit: callGasLimit,
    verificationGasLimit: verificationGasLimit,
    preVerificationGas: preVerificationGas,
    maxFeePerGas: maxFeePerGas,
    maxPriorityFeePerGas: maxPriorityFeePerGas,
    paymasterAndData: paymasterAndData,
    signature: "0x" // Sonra imzalanacak
  };

  return userOp;
}

async function signUserOperation(userOp, privateKey, entryPointAddress, chainId) {
  // UserOperation hash oluştur
  const userOpHash = ethers.keccak256(
    ethers.AbiCoder.defaultAbiCoder().encode(
      [
        "address", "uint256", "bytes32", "bytes32",
        "uint256", "uint256", "uint256", "uint256", "uint256",
        "bytes32"
      ],
      [
        userOp.sender,
        userOp.nonce,
        ethers.keccak256(userOp.initCode),
        ethers.keccak256(userOp.callData),
        userOp.callGasLimit,
        userOp.verificationGasLimit,
        userOp.preVerificationGas,
        userOp.maxFeePerGas,
        userOp.maxPriorityFeePerGas,
        ethers.keccak256(userOp.paymasterAndData)
      ]
    )
  );

  // EntryPoint ve chainId ile final hash
  const finalHash = ethers.keccak256(
    ethers.AbiCoder.defaultAbiCoder().encode(
      ["bytes32", "address", "uint256"],
      [userOpHash, entryPointAddress, chainId]
    )
  );

  // Private key ile imzala
  const wallet = new ethers.Wallet(privateKey);
  const signature = await wallet.signMessage(ethers.getBytes(finalHash));
  
  return signature;
}

async function executeMetaTransaction() {
  console.log("🚀 Executing Meta Transaction...");
  
  // Contract adresleri (deploy'dan sonra güncellenecek)
  const accountAddress = "SIMPLE_ACCOUNT_ADDRESS";
  const tokenAddress = "TEST_TOKEN_ADDRESS"; 
  const paymasterAddress = "PAYMASTER_ADDRESS";
  
  // A'dan B'ye 100 token transfer
  const amount = ethers.parseUnits("100", 18);
  const targetAddress = process.env.WALLET_B_ADDRESS;
  
  // UserOperation oluştur
  const userOp = await createUserOperation(
    accountAddress,
    targetAddress,
    tokenAddress, 
    amount,
    paymasterAddress
  );
  
  // A cüzdanının private key'i ile imzala
  const signature = await signUserOperation(
    userOp,
    process.env.WALLET_A_PRIVATE_KEY,
    process.env.ENTRYPOINT_ADDRESS,
    11155111 // Sepolia chainId
  );
  
  userOp.signature = signature;
  
  console.log("✅ UserOperation created and signed!");
  console.log("UserOp:", userOp);
  
  return userOp;
}

module.exports = { createUserOperation, signUserOperation, executeMetaTransaction };