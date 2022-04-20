//SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-solidity/contracts/access/Ownable.sol";

contract VestedDepositPool is Ownable {
    struct Allocation {
        uint256 size;
        uint256 bought;
    }
    mapping(address => Allocation) public allocations;

    IERC20 public paymentToken;
    address _receiver = 0x2983cF6AEc2165BBd314252fE2Ab2aC1671e592D;

    uint256 public startDate;
    uint256 public closeDate;
    uint256 public paymentsReceived;
    uint256 public goal;
    uint256 internal _divider = 100000;

    event Deposit(address participant, uint256 amount);

    function saleActive() public view returns (bool) {
        return (block.timestamp >= startDate && block.timestamp <= closeDate);
    }

    function canBuy(address wallet) public view returns (bool) {
        if (!saleActive()) return false;
        if (allocations[wallet].size == 0 || allocations[wallet].bought >= allocations[wallet].size) return false;
        return true;
    }

    function amountBought(address wallet) public view returns (uint256) {
        return (allocations[wallet].bought);
    }

    function deposit(uint256 amount) public virtual {
        require(saleActive(), "The sale is not active");
        require(canBuy(msg.sender), "You cant buy tokens");
        require(paymentsReceived <= goal, "Sale goal reached");

        uint256 alloRemained = allocations[msg.sender].size - allocations[msg.sender].bought;
        uint256 globalAlloRemained = goal - paymentsReceived;

        uint256 paymentToTransfer = amount;
        if (globalAlloRemained < alloRemained && amount > globalAlloRemained) paymentToTransfer = globalAlloRemained;
        if (globalAlloRemained >= alloRemained && amount > alloRemained) paymentToTransfer = alloRemained;

        paymentToken.transferFrom(msg.sender, _receiver, paymentToTransfer);

        allocations[msg.sender].bought += paymentToTransfer;
        paymentsReceived += paymentToTransfer;
        emit Deposit(msg.sender, paymentToTransfer);
    }

    constructor(
        address _paymentToken,
        uint256 _startDate,
        uint256 _closeDate,
        uint256 _goal
    ) {
        require(_startDate < _closeDate, "Wrong dates");
        goal = _goal;
        paymentToken = IERC20(_paymentToken);
        startDate = _startDate;
        closeDate = _closeDate;
    }

    function setGoal(uint256 _goal) external onlyOwner {
        goal = _goal;
    }

    function setSaleDates(uint256 _startDate, uint256 _closeDate) external onlyOwner {
        require(startDate < closeDate && startDate != 0 && closeDate != 0, "Wrong dates");
        startDate = _startDate;
        closeDate = _closeDate;
    }

    function setPaymentToken(address _paymentToken) external onlyOwner {
        paymentToken = IERC20(_paymentToken);
    }

    function setAllocation(address _to, uint256 _amount) external onlyOwner {
        allocations[_to].size = _amount;
        allocations[_to].bought = 0;
    }

    function batchSetAllocations(address[] calldata _recepients, uint256[] calldata _sizes) external onlyOwner {
        for (uint32 i = 0; i < _recepients.length; i++) {
            allocations[_recepients[i]].size = _sizes[i];
            allocations[_recepients[i]].bought = 0;
        }
    }

    function extractPaymentToken() external onlyOwner {
        paymentToken.transfer(msg.sender, paymentToken.balanceOf(address(this)));
    }

    function extractSomeToken(address token) external onlyOwner {
        IERC20(token).transfer(msg.sender, IERC20(token).balanceOf(address(this)));
    }

    function extractBNB() external onlyOwner {
        payable(msg.sender).transfer(address(this).balance);
    }
}
