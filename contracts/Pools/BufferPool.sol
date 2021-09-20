//SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "./Pool.sol";

contract BufferPool is Pool {
    uint256 public unlockPeriod;
    uint256 public totalUnlock;
    uint256 public cliff;

    uint256 public initialUnlock;
    uint256 public unlockPerPeriod;

    uint256 public constant ONE_HUNDRED_PERCENT = 1e18 * 100;

    event Claimed(address who, uint256 tokens);

    constructor(
        address _paymentToken,
        address _poolToken,
        uint256 _startDate,
        uint256 _closeDate,
        uint256 _initialUnlock,
        uint256 _unlockPeriod,
        uint256 _totalUnlock,
        uint256 _cliff,
        uint256 _unlockPerPeriod
    ) Pool(_paymentToken, _poolToken, _startDate, _closeDate) {
        poolType = PoolTypes.Vested;
        initialUnlock = _initialUnlock;
        unlockPeriod = _unlockPeriod;
        totalUnlock = _totalUnlock;
        cliff = _cliff;
        unlockPerPeriod = _unlockPerPeriod;
    }

    function canClaim(address user) public view returns (bool) {
        return (getClaimableTokens(user) > 0);
    }

    function getClaimableTokens(address user) public view returns (uint256) {
        if (block.timestamp < startDate + cliff || !hasBought(user)) return 0;

        uint256 tokensToClaimAfterPurchase = (allocations[user].amount * initialUnlock) / ONE_HUNDRED_PERCENT;
        uint256 tokenstToClaimPerPeriod = (allocations[user].amount * unlockPerPeriod) / ONE_HUNDRED_PERCENT;
        uint256 claimed = allocations[user].claimed;
        uint256 amount = allocations[user].amount;
        if (block.timestamp >= totalUnlock + startDate + cliff || claimed + tokenstToClaimPerPeriod > amount) return amount - claimed;

        uint256 claimable = ((block.timestamp - startDate - cliff) / unlockPeriod) * tokenstToClaimPerPeriod + tokensToClaimAfterPurchase - claimed;

        return claimable;
    }

    function buy() public override(Pool) {
        super.buy();

        allocations[msg.sender].claimed = allocations[msg.sender].amount;
        allocations[msg.sender].claimedAt = block.timestamp;

        emit Claimed(msg.sender, allocations[msg.sender].claimed);
    }

    function claim() public {
        uint256 claimable = getClaimableTokens(msg.sender);
        require(claimable > 0, "Nothing to claim");

        allocations[msg.sender].claimed += claimable;
        allocations[msg.sender].claimedAt = block.timestamp;
        poolToken.transfer(msg.sender, claimable);

        emit Claimed(msg.sender, claimable);
    }

    function batchSetBuyData(
        address[] calldata _recepients,
        uint256[] calldata _amounts,
        uint256 _rate
    ) external onlyOwner {
        uint256 _tokensSold;
        uint256 _paymentsReceived;
        for (uint32 i = 0; i < _recepients.length; i++) {
            allocations[_recepients[i]].amount = _amounts[i];
            allocations[_recepients[i]].claimed = 0;
            allocations[_recepients[i]].rate = _rate;
            allocations[_recepients[i]].bought = true;
            _tokensSold += _amounts[i];
            _paymentsReceived += (_amounts[i] * _rate) / _divider;
        }
        paymentsReceived = _paymentsReceived;
        tokensSold = _tokensSold;
    }

    function finishedClaiming(address user) external view returns (bool) {
        return (allocations[user].claimed == allocations[user].amount);
    }

    function nextClaimingAt(address wallet) public view returns (uint256) {
        if (canClaim(wallet) || !hasBought(wallet)) return 0;
        uint256 periodsPassed = (allocations[wallet].claimedAt - startDate) / unlockPeriod;

        return startDate + unlockPeriod * (periodsPassed + 1);
    }

    function remained(address wallet) public view returns (uint256) {
        return allocations[wallet].amount - allocations[wallet].claimed;
    }

    function claimingInfo(address wallet)
        external
        view
        returns (
            uint256 allocation,
            uint256 claimed,
            uint256 remainedToClaim,
            uint256 available,
            bool _canClaim,
            uint256 _nextClaimingAt
        )
    {
        return (allocations[wallet].amount, allocations[wallet].claimed, remained(wallet), getClaimableTokens(wallet), canClaim(wallet), nextClaimingAt(wallet));
    }
}
