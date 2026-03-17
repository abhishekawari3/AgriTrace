/**
 * blockchain.js
 * ---------------------------------------------------------------------------
 * Simulates blockchain interactions for the MERN demo environment.
 * In production, replace these functions with ethers.js calls to your
 * deployed AgriTrace.sol smart contract on Ethereum / Polygon.
 * ---------------------------------------------------------------------------
 */
const crypto = require('crypto');

/**
 * Generate a deterministic SHA-256 hash that looks like an Ethereum tx hash.
 * In production: call contract.registerBatch(...) and return the real tx hash.
 */
function generateTxHash(data) {
  const payload = JSON.stringify({ ...data, nonce: Math.random(), ts: Date.now() });
  return '0x' + crypto.createHash('sha256').update(payload).digest('hex');
}

/**
 * Simulate a "genesis block" for a new batch registration.
 * In production: const tx = await agriTraceContract.registerBatch(batchId, productName, farmerId, timestamp);
 */
async function registerBatchOnChain(batchData) {
  // Simulate network latency
  await new Promise(r => setTimeout(r, 50));
  const txHash = generateTxHash(batchData);
  const blockNumber = Math.floor(1_000_000 + Math.random() * 9_000_000);
  return { txHash, blockNumber, success: true };
}

/**
 * Simulate recording a checkpoint on-chain.
 * In production: const tx = await agriTraceContract.addCheckpoint(batchId, stage, actorAddr, location, ipfsHash);
 */
async function addCheckpointOnChain(batchId, checkpoint) {
  await new Promise(r => setTimeout(r, 40));
  const txHash = generateTxHash({ batchId, ...checkpoint });
  const blockNumber = Math.floor(1_000_000 + Math.random() * 9_000_000);
  return { txHash, blockNumber, success: true };
}

/**
 * Verify the integrity of a batch by re-hashing all checkpoints.
 * In production: call agriTraceContract.verifyBatch(batchId) and compare on-chain hash.
 */
function verifyBatchIntegrity(batch) {
  const checkpointHashes = batch.checkpoints.map(cp =>
    crypto.createHash('sha256')
      .update(JSON.stringify({ stage: cp.stage, actor: cp.actor?.toString(), ts: cp.timestamp }))
      .digest('hex')
  );
  const chainHash = crypto.createHash('sha256')
    .update(batch.genesisHash + checkpointHashes.join(''))
    .digest('hex');
  return {
    valid: true, // In production compare with on-chain stored hash
    chainHash: '0x' + chainHash,
    checkpointCount: batch.checkpoints.length
  };
}

module.exports = { registerBatchOnChain, addCheckpointOnChain, verifyBatchIntegrity, generateTxHash };
