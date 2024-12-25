import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      },
      viaIR: true
    }
  },
  ignition: {
    requiredConfirmations: 1
  },
  networks: {
    hardhat: {
    },
    a8testnet: {
      url: 'https://rpcv2-testnet.ancient8.gg',
      accounts: ['0x97863b0e44341942e32b42751f751bbfcaa4c3da0223118af8ebb2e18383551a'], //0xEE92375C757b74A5f00d4e46C1CF3064142495B1
      gasPrice: 1000000000
    }
  },
  etherscan: {
    apiKey: {
      a8testnet: '',
    },
    customChains: [
      {
        network: "a8testnet",
        chainId: 28122024,
        urls: {
          apiURL: "https://scanv2-testnet.ancient8.gg/api",
          browserURL: "https://scanv2-testnet.ancient8.gg",
        }
      }
    ]
  },
  defaultNetwork: 'a8testnet',
};

export default config;
