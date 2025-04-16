// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CrossChainPayment {
    event PaymentSent(address indexed from, address indexed to, uint256 amount, uint256 chainId);

    function sendPayment(address to, uint256 amount, uint256 destChainId) external payable {
        require(msg.value == amount, "Amount mismatch");
        emit PaymentSent(msg.sender, to, amount, destChainId);
    }
}
