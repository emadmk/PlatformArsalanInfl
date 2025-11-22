import { Router, Response } from 'express';
import { AuthRequest, authenticateToken } from '@/middleware/auth.middleware';
import walletService from '@/services/payment/wallet.service';
import transactionService from '@/services/payment/transaction.service';
import cryptoService from '@/services/payment/crypto.service';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get wallet balance
router.get('/wallet', async (req: AuthRequest, res: Response) => {
  try {
    const wallet = await walletService.getWallet(req.user!.id);
    const balance = await walletService.getBalance(req.user!.id);

    res.json({ wallet, balance });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Deposit
router.post('/deposit', async (req: AuthRequest, res: Response) => {
  try {
    const { amount, txHash, blockchain } = req.body;

    await walletService.deposit(req.user!.id, amount, txHash, blockchain);

    res.json({ message: 'Deposit initiated, waiting for confirmation' });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

// Withdraw
router.post('/withdraw', async (req: AuthRequest, res: Response) => {
  try {
    const { amount, address, blockchain } = req.body;

    // Validate address
    const isValid = await cryptoService.isValidAddress(address);
    if (!isValid) {
      res.status(400).json({ error: 'Invalid wallet address' });
      return;
    }

    const withdrawalId = await walletService.withdraw(
      req.user!.id,
      amount,
      address,
      blockchain
    );

    res.json({
      withdrawalId,
      message: 'Withdrawal request submitted for approval',
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

// Get transactions
router.get('/transactions', async (req: AuthRequest, res: Response) => {
  try {
    const { transactions, total } = await transactionService.getTransactions(
      req.user!.id,
      {
        type: req.query.type,
        status: req.query.status,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
      }
    );

    res.json({ transactions, total });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get USDT balance on blockchain
router.get('/crypto/balance', async (req: AuthRequest, res: Response) => {
  try {
    const { address, blockchain } = req.query;

    if (!address || !blockchain) {
      res.status(400).json({ error: 'Address and blockchain required' });
      return;
    }

    const balance = await cryptoService.getUSDTBalance(
      address as string,
      blockchain as any
    );

    res.json({ balance });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Verify transaction
router.get('/crypto/verify/:txHash', async (req: AuthRequest, res: Response) => {
  try {
    const { blockchain } = req.query;

    if (!blockchain) {
      res.status(400).json({ error: 'Blockchain required' });
      return;
    }

    const verified = await cryptoService.verifyTransaction(
      req.params.txHash,
      blockchain as any
    );

    res.json({ verified });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Estimate gas
router.get('/crypto/gas-estimate', async (req: AuthRequest, res: Response) => {
  try {
    const { toAddress, amount, blockchain } = req.query;

    if (!toAddress || !amount || !blockchain) {
      res.status(400).json({ error: 'Missing required parameters' });
      return;
    }

    const gasEstimate = await cryptoService.estimateGas(
      toAddress as string,
      parseFloat(amount as string),
      blockchain as any
    );

    res.json({ gasEstimate });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
