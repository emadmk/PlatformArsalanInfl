import { z } from 'zod';

export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  COMMISSION = 'commission',
  PAYMENT = 'payment',
  REFUND = 'refund',
}

export enum TransactionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum Blockchain {
  ETHEREUM = 'ethereum',
  BSC = 'bsc',
  TRON = 'tron',
}

// Transaction Schema
export const TransactionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: z.nativeEnum(TransactionType),
  amount: z.number().positive(),
  currency: z.string().default('USDT'),
  status: z.nativeEnum(TransactionStatus).default(TransactionStatus.PENDING),
  fromAddress: z.string().optional(),
  toAddress: z.string().optional(),
  txHash: z.string().optional(),
  blockchain: z.nativeEnum(Blockchain).optional(),
  projectId: z.string().optional(),
  description: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  completedAt: z.date().optional(),
});

export type Transaction = z.infer<typeof TransactionSchema>;

// Wallet Schema
export const WalletSchema = z.object({
  id: z.string(),
  userId: z.string(),
  address: z.string(),
  blockchain: z.nativeEnum(Blockchain),
  balance: z.number().min(0).default(0),
  lockedBalance: z.number().min(0).default(0),
  isVerified: z.boolean().default(false),
  verificationCode: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Wallet = z.infer<typeof WalletSchema>;

// Withdrawal Request Schema
export const WithdrawalRequestSchema = z.object({
  id: z.string(),
  userId: z.string(),
  amount: z.number().positive(),
  address: z.string(),
  blockchain: z.nativeEnum(Blockchain),
  status: z.nativeEnum(TransactionStatus).default(TransactionStatus.PENDING),
  txHash: z.string().optional(),
  rejectionReason: z.string().optional(),
  processedBy: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  processedAt: z.date().optional(),
});

export type WithdrawalRequest = z.infer<typeof WithdrawalRequestSchema>;
