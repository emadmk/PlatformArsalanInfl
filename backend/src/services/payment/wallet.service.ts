import { AppDataSource } from '@/config/database';
import { AppError } from '@/middleware/error.middleware';
import { User } from '@/models/User.model';
import { Blockchain, TransactionType, TransactionStatus } from '@shared/types';
import transactionService from './transaction.service';

export class WalletService {
  async getWallet(userId: string) {
    const user = await User.findById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user.wallet || { balance: 0, lockedBalance: 0 };
  }

  async deposit(
    userId: string,
    amount: number,
    txHash: string,
    blockchain: Blockchain
  ): Promise<void> {
    const user = await User.findById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Create transaction record
    await transactionService.createTransaction({
      userId,
      type: TransactionType.DEPOSIT,
      amount,
      status: TransactionStatus.PENDING,
      txHash,
      blockchain,
    });

    // Update balance (will be confirmed by webhook/cron)
    if (!user.wallet) {
      user.wallet = { balance: 0, lockedBalance: 0 };
    }

    user.wallet.balance += amount;
    await user.save();
  }

  async withdraw(
    userId: string,
    amount: number,
    address: string,
    blockchain: Blockchain
  ): Promise<string> {
    const user = await User.findById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const availableBalance = (user.wallet?.balance || 0) - (user.wallet?.lockedBalance || 0);

    if (availableBalance < amount) {
      throw new AppError('Insufficient balance', 400);
    }

    // Deduct from balance
    user.wallet!.balance -= amount;
    await user.save();

    // Create withdrawal transaction
    const transaction = await transactionService.createTransaction({
      userId,
      type: TransactionType.WITHDRAWAL,
      amount,
      toAddress: address,
      blockchain,
      status: TransactionStatus.PENDING,
    });

    return transaction.id;
  }

  async lockFunds(userId: string, amount: number, reference: string): Promise<void> {
    const user = await User.findById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const availableBalance = (user.wallet?.balance || 0) - (user.wallet?.lockedBalance || 0);

    if (availableBalance < amount) {
      throw new AppError('Insufficient balance', 400);
    }

    if (!user.wallet) {
      user.wallet = { balance: 0, lockedBalance: 0 };
    }

    user.wallet.lockedBalance = (user.wallet.lockedBalance || 0) + amount;
    await user.save();
  }

  async unlockFunds(userId: string, amount: number, reference: string): Promise<void> {
    const user = await User.findById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (!user.wallet || (user.wallet.lockedBalance || 0) < amount) {
      throw new AppError('Insufficient locked balance', 400);
    }

    user.wallet.lockedBalance -= amount;
    await user.save();
  }

  async transferFunds(
    fromUserId: string,
    toUserId: string,
    amount: number,
    description: string,
    metadata?: any
  ): Promise<void> {
    const [fromUser, toUser] = await Promise.all([
      User.findById(fromUserId),
      User.findById(toUserId),
    ]);

    if (!fromUser || !toUser) {
      throw new AppError('User not found', 404);
    }

    // Deduct from sender
    if (!fromUser.wallet || fromUser.wallet.balance < amount) {
      throw new AppError('Insufficient balance', 400);
    }

    fromUser.wallet.balance -= amount;

    // Add to receiver
    if (!toUser.wallet) {
      toUser.wallet = { balance: 0, lockedBalance: 0 };
    }

    toUser.wallet.balance += amount;

    await Promise.all([fromUser.save(), toUser.save()]);

    // Create transaction records
    await Promise.all([
      transactionService.createTransaction({
        userId: fromUserId,
        type: TransactionType.PAYMENT,
        amount: -amount,
        status: TransactionStatus.COMPLETED,
        description,
        metadata,
      }),
      transactionService.createTransaction({
        userId: toUserId,
        type: TransactionType.PAYMENT,
        amount,
        status: TransactionStatus.COMPLETED,
        description,
        metadata,
      }),
    ]);
  }

  async getBalance(userId: string): Promise<{
    total: number;
    available: number;
    locked: number;
  }> {
    const user = await User.findById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const total = user.wallet?.balance || 0;
    const locked = user.wallet?.lockedBalance || 0;
    const available = total - locked;

    return { total, available, locked };
  }
}

export default new WalletService();
