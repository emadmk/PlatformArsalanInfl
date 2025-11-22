import { AppDataSource } from '@/config/database';
import { AppError } from '@/middleware/error.middleware';

export class TransactionService {
  async createTransaction(data: any): Promise<any> {
    const transactionRepo = AppDataSource.getRepository('transactions');

    const transaction = transactionRepo.create(data);
    await transactionRepo.save(transaction);

    return transaction;
  }

  async getTransactions(userId: string, filters: any = {}) {
    const transactionRepo = AppDataSource.getRepository('transactions');

    const query = transactionRepo
      .createQueryBuilder('transaction')
      .where('transaction.userId = :userId', { userId });

    if (filters.type) {
      query.andWhere('transaction.type = :type', { type: filters.type });
    }

    if (filters.status) {
      query.andWhere('transaction.status = :status', { status: filters.status });
    }

    const page = filters.page || 1;
    const limit = filters.limit || 20;

    query.skip((page - 1) * limit).take(limit).orderBy('transaction.createdAt', 'DESC');

    const [transactions, total] = await query.getManyAndCount();

    return { transactions, total };
  }

  async updateTransactionStatus(txId: string, status: string, txHash?: string): Promise<void> {
    const transactionRepo = AppDataSource.getRepository('transactions');

    await transactionRepo.update(txId, {
      status,
      ...(txHash && { txHash }),
      ...(status === 'completed' && { completedAt: new Date() }),
    });
  }
}

export default new TransactionService();
