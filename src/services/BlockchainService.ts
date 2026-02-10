import { ethers, JsonRpcProvider, Wallet, Contract, parseUnits } from 'ethers';
import dotenv from 'dotenv';
import { AppError } from '../utils/appError.js';

dotenv.config();

/**
 * Minimal ABI for the requestTokens function
 */
const CONTRACT_ABI = [
    "function requestTokens(address to, uint256 amount) public returns (bool)"
];

export class BlockchainService {
    private provider: JsonRpcProvider;
    private wallet: Wallet;
    private contract: Contract;

    constructor() {
        if (!process.env.PROVIDER_URL || !process.env.ADMIN_PRIVATE_KEY || !process.env.CONTRACT_ADDRESS) {
            throw new Error('Blockchain configuration missing in .env');
        }

        this.provider = new JsonRpcProvider(process.env.PROVIDER_URL);
        this.wallet = new Wallet(process.env.ADMIN_PRIVATE_KEY, this.provider);
        this.contract = new Contract(process.env.CONTRACT_ADDRESS, CONTRACT_ABI, this.wallet);
    }

    /**
     * Executes token request transaction on the blockchain
     */
    async executeTokenRequest(to: string, amount: string): Promise<string> {
        try {
            // Validate Ethereum address
            if (!ethers.isAddress(to)) {
                throw new AppError(`Invalid recipient address: ${to}`, 400, 'INVALID_BLOCKCHAIN_ADDRESS');
            }

            // Convert amount to BigInt (assuming 18 decimals like ERC20)
            const amountWei = parseUnits(amount, 18);

            console.log(`[Blockchain] Initiating requestTokens to ${to} for ${amount}...`);

            // Send transaction
            const tx = await this.contract.requestTokens(to, amountWei);

            console.log(`[Blockchain] Transaction submitted. Hash: ${tx.hash}`);

            return tx.hash;
        } catch (error: any) {
            console.error('[Blockchain] Error sending transaction:', error.message);
            throw new AppError(`Blockchain transaction failed: ${error.message}`, 500, 'BLOCKCHAIN_ERROR');
        }
    }

    /**
     * Waits for transaction confirmation
     */
    async waitForConfirmation(txHash: string): Promise<void> {
        try {
            console.log(`[Blockchain] Waiting for confirmation of ${txHash}...`);
            const receipt = await this.provider.waitForTransaction(txHash);

            if (!receipt || receipt.status === 0) {
                throw new Error('Transaction failed or reverted');
            }

            console.log(`[Blockchain] Transaction confirmed in block ${receipt.blockNumber}`);
        } catch (error: any) {
            console.error('[Blockchain] Confirmation error:', error.message);
            throw new Error(`Transaction confirmation failed: ${error.message}`);
        }
    }
}

export const blockchainService = new BlockchainService();
