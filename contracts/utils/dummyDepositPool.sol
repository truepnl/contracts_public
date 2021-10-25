//SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

//This contract is made for compability needs

contract DummyDepositPool {
    mapping(address => uint256) public deposits;
    mapping(address => uint256) public maxDeposit;

    mapping(address => bool) public whitelisted;
    address public paymentToken;
    uint256 public startDate;
    uint256 public closeDate;
    bool public whitelistEnabled = true;
    uint256 public paymentsReceived;
    uint256 private _divider = 10000;
    uint256 public minDeposit = 100 * 1e18;

    uint256 public goal;

    constructor(
        address _paymentToken,
        uint256 _startDate,
        uint256 _closeDate,
        uint256 _goal,
        uint256 _paymentsReceived
    ) {
        paymentToken = _paymentToken;
        startDate = _startDate;
        closeDate = _closeDate;
        goal = _goal;
        paymentsReceived = _paymentsReceived;
    }

    function saleActive() public view returns (bool) {
        return false;
    }

    function canBuy(address wallet) public view returns (bool) {
        return false;
    }
}
