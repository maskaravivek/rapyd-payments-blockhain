const { JsonRpcProvider, Contract, Wallet, parseUnits } = require("ethers");
require("dotenv").config();

const SEPOLIA_RPC = process.env.SEPOLIA_RPC;
const HOLESKY_RPC = process.env.HOLESKY_RPC;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

const SEPOLIA_CONTRACT = "<YOUR_CROSS_PAYMENT_SEPOLIA_ADDRESS>";
const HOLESKY_VERIFIER = "<YOUR_PAYMENT_VERIFIER_HOLESKY_ADDRESS>";

const eventAbi = [
    "event PaymentSent(address indexed from, address indexed to, uint256 amount, uint256 chainId)"
];

const verifierAbi = [
    "function verifyPayment(address to, uint256 amount, uint256 srcChainId, bytes32 txHash)"
];

async function startRelayer() {
    const sepoliaProvider = new JsonRpcProvider(SEPOLIA_RPC);
    const holeskyProvider = new JsonRpcProvider(HOLESKY_RPC);
    const wallet = new Wallet(PRIVATE_KEY, holeskyProvider);

    const sourceContract = new Contract(SEPOLIA_CONTRACT, eventAbi, sepoliaProvider);
    const verifier = new Contract(HOLESKY_VERIFIER, verifierAbi, wallet);

    console.log("Relayer is watching for events on Sepolia...");

    sourceContract.on("PaymentSent", async (from, to, amount, chainId, event) => {
        console.log("PaymentSent Detected:");
        console.log({ from, to, amount: amount.toString(), chainId });

        if (chainId.toString() !== "17000") {
            console.log("Skipping non-Holesky destination.");
            return;
        }

        try {
            // Get transaction hash from event and ensure it's in bytes32 format
            const txHash = event.log.transactionHash;

            const tx = await verifier.verifyPayment(
                to,
                BigInt(amount.toString()),
                11155111,
                txHash
            );
            console.log("Verification TX sent:", tx.hash);
        } catch (err) {
            console.error("Error verifying payment:", err.message);
            console.log("Error details:", err);
        }
    });
}

startRelayer();