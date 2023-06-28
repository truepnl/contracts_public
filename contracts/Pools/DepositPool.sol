//SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-solidity/contracts/access/Ownable.sol";

contract DepositPool is Ownable {
    mapping(address => uint256) public deposits;
    mapping(address => bool) public whitelisted;

    IERC20 public paymentToken;

    address _receiver = 0x6FeF0AA142C8aA4A6bf6A9C14217b24DcA156F08;
    uint256 public startDate;
    uint256 public closeDate;
    bool public whitelistEnabled = false;
    uint256 public paymentsReceived;
    uint256 private _divider = 100000;
    uint256 public minDeposit = 50 * 1e18;
    uint256 public _maxDeposit = 250 * 1e18;
    uint256 public goal;

    event Deposit(address participant, uint256 amount, uint256 rate, uint256 newDepositTotal);

    function maxDeposit(address user) public view returns (uint256) {
        return _maxDeposit;
    }

    constructor(
        address _paymentToken,
        uint256 _startDate,
        uint256 _closeDate,
        uint256 _goal
    ) {
        require(_startDate < _closeDate, "Wrong dates");

        paymentToken = IERC20(_paymentToken);
        startDate = _startDate;
        closeDate = _closeDate;
        goal = _goal;
    }

    function saleActive() public view returns (bool) {
        if (paymentsReceived >= goal) return false;
        return (block.timestamp >= startDate && block.timestamp <= closeDate);
    }

    function canBuy(address wallet) public view returns (bool) {
        if (!saleActive()) return false;
        if (!whitelistEnabled) return true;
        if (whitelisted[wallet]) return true;
        return false;
    }

    function setWhitelist(bool enabled) public onlyOwner {
        whitelistEnabled = enabled;
    }

    function deposit(uint256 amount, uint256 rate) public {
        require(saleActive(), "The sale is not active");
        require(canBuy(msg.sender), "You cant buy tokens");
        require(deposits[msg.sender] + amount >= minDeposit, "You can't invest such small amount");
        require(paymentToken.balanceOf(msg.sender) >= amount, "You don't have enough funds to deposit");
        require(paymentToken.allowance(msg.sender, address(this)) >= amount, "Approve contract for spending your funds");
        require(deposits[msg.sender] + amount <= _maxDeposit, "You can't invest such big amount");

        paymentToken.transferFrom(msg.sender, _receiver, amount);
        deposits[msg.sender] += amount;
        paymentsReceived += amount;

        emit Deposit(msg.sender, amount, rate, deposits[msg.sender]);
    }

    function setSaleDates(uint256 _startDate, uint256 _closeDate) external onlyOwner {
        require(startDate < closeDate && startDate != 0 && closeDate != 0, "Wrong dates");
        startDate = _startDate;
        closeDate = _closeDate;
    }

    function setSaleGoal(uint256 _goal) external onlyOwner {
        goal = _goal;
    }

    function updateDepositsData(address[] calldata _investors, uint256[] calldata _amounts) external onlyOwner {
        uint256 _paymentsReceived = paymentsReceived;
        for (uint32 i = 0; i < _investors.length; i++) {
            deposits[_investors[i]] = _amounts[i];
            _paymentsReceived += _amounts[i];
        }
        paymentsReceived = _paymentsReceived;
    }

    function setPaymentToken(address _paymentToken) external onlyOwner {
        paymentToken = IERC20(_paymentToken);
    }

    function setMinMaxDepo(uint256 _minDeposit, uint256 maxDeposit) external onlyOwner {
        minDeposit = _minDeposit;
        _maxDeposit = maxDeposit;
    }

    function batchSetWhitelist(address[] calldata _recepients, bool value) external onlyOwner {
        for (uint32 i = 0; i < _recepients.length; i++) {
            whitelisted[_recepients[i]] = value;
        }
    }

    function extractPaymentToken(uint256 amount) external onlyOwner {
        paymentToken.transfer(msg.sender, amount);
    }

    function extractValue() external onlyOwner {
        msg.sender.call{value: address(this).balance}("");
    }
}
