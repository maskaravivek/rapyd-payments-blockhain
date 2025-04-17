const { WebSocketProvider, JsonRpcProvider, Contract, Wallet } = require("ethers");
require("dotenv").config();

// Use WebSocket for Sepolia (where we're listening for events)
const SEPOLIA_WSS = process.env.SEPOLIA_WSS;
const HOLESKY_RPC = process.env.HOLESKY_RPC;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

const SEPOLIA_CONTRACT = "0x45d88f6DD0f0eDB69C563233Be73458c9980b519";
const HOLESKY_VERIFIER = "0x11ddd4b07B095802B537267358fB8Eb954B29d99";

const eventAbi = [
    "event PaymentSent(address indexed from, address indexed to, uint256 amount, uint256 chainId)"
];

const verifierAbi = [
    "function verifyPayment(address to, uint256 amount, uint256 srcChainId, bytes32 txHash)"
];

async function startRelayer() {
    // Use WebSocketProvider for event monitoring
    const sepoliaProvider = new WebSocketProvider(SEPOLIA_WSS);
    const holeskyProvider = new JsonRpcProvider(HOLESKY_RPC);
    const wallet = new Wallet(PRIVATE_KEY, holeskyProvider);

    const sourceContract = new Contract(SEPOLIA_CONTRACT, eventAbi, sepoliaProvider);
    const verifier = new Contract(HOLESKY_VERIFIER, verifierAbi, wallet);

    console.log("Relayer is watching for events on Sepolia via WebSocket...");

    // Set up reconnection logic
    sepoliaProvider.websocket.on('close', (code) => {
        console.log(`WebSocket connection closed with code ${code}. Reconnecting...`);
        setTimeout(startRelayer, 3000);
    });

    // Listen for events using WebSocket
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
    
    // Handle process termination
    process.on('SIGINT', async () => {
        console.log('Closing WebSocket connection...');
        await sepoliaProvider.destroy();
        process.exit();
    });
}

// In case of connection errors, restart the relayer
try {
    startRelayer();
} catch (error) {
    console.error("Error starting relayer:", error);
    setTimeout(startRelayer, 3000);
}