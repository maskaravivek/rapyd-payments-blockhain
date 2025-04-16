// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract PaymentVerifier {
    event PaymentVerified(address indexed to, uint256 amount, uint256 srcChainId, bytes32 txHash);

    function verifyPayment(address to, uint256 amount, uint256 srcChainId, bytes32 txHash) external {
        // Assume txHash is verified by off-chain relayer (simplified for demo)
        emit PaymentVerified(to, amount, srcChainId, txHash);
    }
}
