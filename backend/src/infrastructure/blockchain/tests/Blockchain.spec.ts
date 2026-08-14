import { describe, it, expect } from "vitest";
import { JsonRpcClient } from "../clients/JsonRpcClient.js";
import { MockWalletProvider } from "../providers/MockWalletProvider.js";
import { MockPaymentGateway } from "../providers/MockPaymentGateway.js";
import { MockSettlementProvider } from "../providers/MockSettlementProvider.js";
import { MockExchangeRateProvider } from "../providers/MockExchangeRateProvider.js";
import { WalletManager } from "../wallets/WalletManager.js";
import { TransactionBroadcaster } from "../transactions/TransactionBroadcaster.js";
import { ConfirmationTracker } from "../confirmations/ConfirmationTracker.js";
import { SettlementVerifier } from "../settlement/SettlementVerifier.js";
import { BlockchainFactory } from "../factories/BlockchainFactory.js";

describe("Blockchain Infrastructure Layer Tests (Task 34.8)", () => {
  const rpc = BlockchainFactory.createRpcClient();

  describe("JsonRpcClient simulation", () => {
    it("should resolve mocked balances and sending transaction hashes", async () => {
      const balance = await rpc.call<string>("eth_getBalance", ["0x123"]);
      expect(balance).toBe("0xde0b6b3a7640000");

      const txHash = await rpc.call<string>("eth_sendRawTransaction", ["0xabc"]);
      expect(txHash.startsWith("0x")).toBe(true);
      expect(txHash.length).toBe(10);
    });
  });

  describe("Mock Gateway Providers", () => {
    it("should verify wallet address creation, balances, and transfer hash routing", async () => {
      const provider = BlockchainFactory.createWalletProvider();

      const addrRes = await provider.generateDepositAddress("user-777", "ETH");
      expect(addrRes.isSuccess).toBe(true);
      expect(addrRes.value.startsWith("0x")).toBe(true);

      const balRes = await provider.getBalance(addrRes.value, "ETH");
      expect(balRes.isSuccess).toBe(true);
      expect(balRes.value.balance).toBe(100.0);

      const transferRes = await provider.transfer("0xfrom", "0xto", 10.0, "ETH");
      expect(transferRes.isSuccess).toBe(true);
      expect(transferRes.value.startsWith("0x")).toBe(true);
    });

    it("should verify card gateway charges, refunds, and query options", async () => {
      const gateway = BlockchainFactory.createPaymentGateway();

      const chargeRes = await gateway.charge({
        amount: 250.0,
        currency: "USD",
        referenceId: "ref-9988"
      });
      expect(chargeRes.isSuccess).toBe(true);
      expect(chargeRes.value.status).toBe("SUCCESS");
      expect(chargeRes.value.amountCharged).toBe(250.0);

      const refundRes = await gateway.refund(chargeRes.value.transactionId);
      expect(refundRes.isSuccess).toBe(true);

      const statusRes = await gateway.getTransactionStatus(chargeRes.value.transactionId);
      expect(statusRes.isSuccess).toBe(true);
      expect(statusRes.value.amountCharged).toBe(100.0);
    });

    it("should coordinate ACH/Wise settlements and verify settlement status", async () => {
      const settlement = BlockchainFactory.createSettlementProvider();

      const payoutRes = await settlement.payout({
        amount: 4500.0,
        currency: "USD",
        destinationAccount: "acc-9988-77",
        referenceId: "settle-111"
      });
      expect(payoutRes.isSuccess).toBe(true);
      expect(payoutRes.value.status).toBe("COMPLETED");

      const verifyRes = await settlement.verifySettlementStatus(payoutRes.value.settlementId);
      expect(verifyRes.isSuccess).toBe(true);
      expect(verifyRes.value.status).toBe("COMPLETED");
    });

    it("should retrieve mock oracle quotes for currency pair conversion", async () => {
      const oracle = BlockchainFactory.createExchangeRateProvider();

      const rateRes = await oracle.getRate("USD", "EUR");
      expect(rateRes.isSuccess).toBe(true);
      expect(rateRes.value).toBe(1.15);

      const sameRateRes = await oracle.getRate("USD", "USD");
      expect(sameRateRes.isSuccess).toBe(true);
      expect(sameRateRes.value).toBe(1.0);
    });
  });

  describe("WalletManager & TransactionBroadcaster", () => {
    it("should hash public keys to wallet address standard and generate HMAC signatures", async () => {
      const pubKey = "ACOS-PUBLIC-KEY-HASH-Milestone";
      const addr = WalletManager.generateAddressFromPublicKey(pubKey);

      expect(addr.startsWith("0x")).toBe(true);
      expect(addr.length).toBe(42);

      const signature = WalletManager.signTransaction("priv-key-secret", "tx-payload-data");
      expect(signature.length).toBe(64);
    });

    it("should broadcast signed transaction payloads through client channels", async () => {
      const broadcaster = new TransactionBroadcaster(rpc);
      const txHash = await broadcaster.broadcast("0xdeadbeef");

      expect(txHash.startsWith("0x")).toBe(true);
    });
  });

  describe("ConfirmationTracker & SettlementVerifier finality matcher", () => {
    it("should monitor block confirmations increment progression and verify finality states", () => {
      const tracker = new ConfirmationTracker();
      const verifier = new SettlementVerifier(tracker);

      const tx = "0xtesttransactionhash12345";
      tracker.registerTransaction(tx);

      // Verify not final at 0 confirmations
      const check1 = verifier.verifySettlement(tx, 6);
      expect(check1.isSuccess).toBe(true);
      expect(check1.value).toBe(false);

      // Increment confirmations to 5
      for (let i = 0; i < 5; i++) {
        tracker.incrementConfirmations(tx);
      }
      expect(tracker.getConfirmations(tx)).toBe(5);

      // Verify still not final at 5 out of 6
      const check2 = verifier.verifySettlement(tx, 6);
      expect(check2.value).toBe(false);

      // Increment confirmations to 6
      tracker.incrementConfirmations(tx);
      expect(tracker.getConfirmations(tx)).toBe(6);

      // Verify finality achieved at 6 confirmations
      const check3 = verifier.verifySettlement(tx, 6);
      expect(check3.value).toBe(true);
    });
  });
});
