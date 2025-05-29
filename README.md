# ERC-4337 Meta Transaction Demo

Bu proje, ERC-4337 Account Abstraction standardını kullanarak meta transaction (gasless transaction) sistemini demonstre eder. Kullanıcılar gas fee ödemeden token transfer işlemleri gerçekleştirebilir.


# Mimari
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Wallet A      │    │   SimpleAccount  │    │   Wallet B      │
│   (Sender)      │───▶│   (Smart Wallet) │───▶│   (Receiver)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Wallet X      │───▶│   Paymaster      │───▶│   EntryPoint    │
│   (Sponsor)     │    │   (Gas Sponsor)  │    │   (ERC-4337)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```




# Teknolojiler

```shell
npm install --save-dev hardhat
npm install --save ethers
npm install --save @openzeppelin/contracts
npm install --save @account-abstraction/contracts
```





# Kurulum #
1. Repository'yi klonlayın
```shell
git clone https://github.com/mstfackgz2/MetaTransaction-Demo
cd MetaTransaction-Demoo
```

2. Dependencies'leri yükleyin
```shell
npm install
```

3. Environment variables'ları ayarlayın
```shell
# Network Configuration
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
ETHERSCAN_API_KEY=YOUR_ETHERSCAN_API_KEY

# EntryPoint Contract Address (ERC-4337)
ENTRYPOINT_ADDRESS=0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789

# Test Wallets
WALLET_A_PRIVATE_KEY=your_wallet_a_private_key
WALLET_A_ADDRESS=your_wallet_a_address

WALLET_B_PRIVATE_KEY=your_wallet_b_private_key  
WALLET_B_ADDRESS=your_wallet_b_address

WALLET_X_PRIVATE_KEY=your_wallet_x_private_key
WALLET_X_ADDRESS=your_wallet_x_address

# Deployer
DEPLOYER_PRIVATE_KEY=your_deployer_private_key
```

4. Contract'ları compile edin
```shell
npx hardhat compile
```





# Deployment #
1. Sepolia testnet'e deploy edin
```shell
npx hardhat run scripts/deploy.js --network sepolia
```

2. Contract'ları verify edin
```shell
npx hardhat run scripts/verify.js --network sepolia
```

# Demo Çalıştırma #

1. Temel demo
```shell
npx hardhat run scripts/demo.js --network sepolia
```

2. Detaylı test scenario
```shell
npx hardhat run scripts/testScenario.js --network sepolia
```





# Proje Yapısı #
```
├── contracts/
│   ├── interfaces/
│   │   ├── IAccount.sol
│   │   ├── IPaymaster.sol
│   │   └── UserOperation.sol
│   ├── PaymasterContract.sol
│   ├── SimpleAccount.sol
│   └── TestToken.sol
├── scripts/
│   ├── deploy.js
│   ├── demo.js
│   ├── testScenario.js
│   ├── verify.js
│   └── metaTransaction.js
├── hardhat.config.js
└── package.json
```







#Script ve aciklamasi 
```
deploy.js	          ->  Contract'ları deploy eder ve initial setup yapar
verify.js         	->  Contract'ları Etherscan'de verify eder
demo.js	            ->  Temel meta transaction demo'su
testScenario.js     -> 	Detaylı test scenario'su
metaTransaction.js  -> 	UserOperation oluşturma utilities


#Deployed Contracts (Sepolia)

TestToken: 0x446D876ba69Ac9ce3b66cd615F86Bdbf4bf3AAac
PaymasterContract: 0xeadc4C07b22c8EdDe74C8BD91327b4be7C34B5e5
SimpleAccount: 0xcDCc1b793517cA6d4CABFf2aD3602fE6222693b2
```



#Kaynaklar 

<a href="https://www.youtube.com/watch?v=MHZ0LwpKcpI">https://www.youtube.com/watch?v=MHZ0LwpKcpI</a>








