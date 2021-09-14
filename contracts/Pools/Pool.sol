//SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-solidity/contracts/access/Ownable.sol";

abstract contract Pool is Ownable {
    enum PoolTypes {
        Regular,
        Vested
    }

    PoolTypes public poolType;

    struct Allocation {
        uint256 amount;
        bool bought;
        uint256 claimed;
        uint256 rate;
        uint256 claimedAt;
    }
    mapping(address => Allocation) public allocations;

    IERC20 public paymentToken;
    IERC20 public poolToken;
    address _receiver = 0x31F73671543477121c219C80D7a4835DEb219BB8;

    uint256 public startDate;
    uint256 public closeDate;

    uint256 public paymentsReceived;
    uint256 public tokensSold;

    uint256 private _divider = 1000;

    event TokensBought(address participant, uint256 amount, uint256 spent);

    function saleActive() public view returns (bool) {
        return (block.timestamp >= startDate && block.timestamp <= closeDate);
    }

    function canBuy(address wallet) public view returns (bool) {
        if (!saleActive()) return false;
        if (allocations[wallet].amount == 0 || allocations[wallet].bought == true) return false;
        return true;
    }

    function hasBought(address wallet) public view returns (bool) {
        return (allocations[wallet].bought);
    }

    function isVested() external view returns (bool) {
        return poolType == PoolTypes.Vested;
    }

    function buy() public virtual {
        require(saleActive(), "The sale is not active");
        require(canBuy(msg.sender), "You cant buy tokens");
        require(!hasBought(msg.sender), "Youve already bought tokens");

        uint256 rate = allocations[msg.sender].rate;
        uint256 amount = allocations[msg.sender].amount;

        uint256 paymentToReceive = (amount * rate) / _divider;
        require(paymentToken.allowance(msg.sender, address(this)) >= paymentToReceive, "Payment token wasnt approved");

        allocations[msg.sender].bought = true;

        paymentToken.transferFrom(msg.sender, _receiver, paymentToReceive);

        tokensSold += amount;
        paymentsReceived += paymentToReceive;

        emit TokensBought(msg.sender, amount, paymentToReceive);
    }

    constructor(
        address _paymentToken,
        address _poolToken,
        uint256 _startDate,
        uint256 _closeDate
    ) {
        require(_startDate < _closeDate, "Wrong dates");

        paymentToken = IERC20(_paymentToken);
        poolToken = IERC20(_poolToken);
        startDate = _startDate;
        closeDate = _closeDate;
    }

    function setSaleDates(uint256 _startDate, uint256 _closeDate) external onlyOwner {
        require(startDate < closeDate && startDate != 0 && closeDate != 0, "Wrong dates");
        startDate = _startDate;
        closeDate = _closeDate;
    }

    function setPoolTokens(address _paymentToken, address _poolToken) external onlyOwner {
        paymentToken = IERC20(_paymentToken);
        poolToken = IERC20(_poolToken);
    }

    function setAllocation(
        address _to,
        uint256 _amount,
        uint256 _rate
    ) external onlyOwner {
        allocations[_to].amount = _amount;
        allocations[_to].claimed = 0;
        allocations[_to].rate = _rate;
        allocations[_to].bought = false;
    }

    function batchSetAllocations(
        address[] calldata _recepients,
        uint256[] calldata _amounts,
        uint256 _rate
    ) external onlyOwner {
        for (uint32 i = 0; i < _recepients.length; i++) {
            allocations[_recepients[i]].amount = _amounts[i];
            allocations[_recepients[i]].claimed = 0;
            allocations[_recepients[i]].rate = _rate;
            allocations[_recepients[i]].bought = false;
        }
    }

    function extractPaymentToken() external onlyOwner {
        paymentToken.transfer(msg.sender, paymentToken.balanceOf(address(this)));
    }

    function extractPoolToken() external onlyOwner {
        poolToken.transfer(msg.sender, paymentToken.balanceOf(address(this)));
    }

    function extractBNB() external onlyOwner {
        msg.sender.call{value: address(this).balance}("");
    }
}
