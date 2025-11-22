import { ethers } from 'ethers';
import config from '@/config';
import { AppError } from '@/middleware/error.middleware';
import { Blockchain } from '@shared/types';

const USDT_ABI = [
  'function transfer(address to, uint amount) returns (bool)',
  'function balanceOf(address owner) view returns (uint)',
  'function decimals() view returns (uint8)',
];

export class CryptoService {
  private providers: Map<Blockchain, ethers.JsonRpcProvider> = new Map();
  private wallet: Map<Blockchain, ethers.Wallet> = new Map();

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders() {
    // Ethereum
    if (config.blockchain.ethereum.providerUrl) {
      const ethProvider = new ethers.JsonRpcProvider(
        config.blockchain.ethereum.providerUrl
      );
      this.providers.set(Blockchain.ETHEREUM, ethProvider);

      if (config.blockchain.platformWallet.privateKey) {
        this.wallet.set(
          Blockchain.ETHEREUM,
          new ethers.Wallet(config.blockchain.platformWallet.privateKey, ethProvider)
        );
      }
    }

    // BSC
    if (config.blockchain.bsc.providerUrl) {
      const bscProvider = new ethers.JsonRpcProvider(
        config.blockchain.bsc.providerUrl
      );
      this.providers.set(Blockchain.BSC, bscProvider);

      if (config.blockchain.platformWallet.privateKey) {
        this.wallet.set(
          Blockchain.BSC,
          new ethers.Wallet(config.blockchain.platformWallet.privateKey, bscProvider)
        );
      }
    }
  }

  async getUSDTBalance(address: string, blockchain: Blockchain): Promise<number> {
    try {
      const provider = this.providers.get(blockchain);
      if (!provider) {
        throw new AppError('Blockchain not supported', 400);
      }

      const contractAddress = this.getUSDTContractAddress(blockchain);
      const contract = new ethers.Contract(contractAddress, USDT_ABI, provider);

      const balance = await contract.balanceOf(address);
      const decimals = await contract.decimals();

      return parseFloat(ethers.formatUnits(balance, decimals));
    } catch (error: any) {
      throw new AppError(`Failed to get balance: ${error.message}`, 500);
    }
  }

  async sendUSDT(
    toAddress: string,
    amount: number,
    blockchain: Blockchain
  ): Promise<string> {
    try {
      const wallet = this.wallet.get(blockchain);
      if (!wallet) {
        throw new AppError('Wallet not configured for this blockchain', 500);
      }

      const contractAddress = this.getUSDTContractAddress(blockchain);
      const contract = new ethers.Contract(contractAddress, USDT_ABI, wallet);

      const decimals = await contract.decimals();
      const amountInWei = ethers.parseUnits(amount.toString(), decimals);

      const tx = await contract.transfer(toAddress, amountInWei);
      const receipt = await tx.wait();

      return receipt.hash;
    } catch (error: any) {
      throw new AppError(`Failed to send USDT: ${error.message}`, 500);
    }
  }

  async verifyTransaction(txHash: string, blockchain: Blockchain): Promise<boolean> {
    try {
      const provider = this.providers.get(blockchain);
      if (!provider) {
        throw new AppError('Blockchain not supported', 400);
      }

      const receipt = await provider.getTransactionReceipt(txHash);

      if (!receipt) {
        return false;
      }

      return receipt.status === 1;
    } catch (error) {
      return false;
    }
  }

  async isValidAddress(address: string): Promise<boolean> {
    return ethers.isAddress(address);
  }

  private getUSDTContractAddress(blockchain: Blockchain): string {
    switch (blockchain) {
      case Blockchain.ETHEREUM:
        return config.blockchain.ethereum.usdtContract!;
      case Blockchain.BSC:
        return config.blockchain.bsc.usdtContract!;
      default:
        throw new AppError('Unsupported blockchain', 400);
    }
  }

  async estimateGas(toAddress: string, amount: number, blockchain: Blockchain): Promise<string> {
    try {
      const provider = this.providers.get(blockchain);
      if (!provider) {
        throw new AppError('Blockchain not supported', 400);
      }

      const gasPrice = await provider.getFeeData();

      return ethers.formatEther(gasPrice.gasPrice || 0n);
    } catch (error: any) {
      throw new AppError(`Failed to estimate gas: ${error.message}`, 500);
    }
  }
}

export default new CryptoService();
