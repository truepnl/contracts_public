//SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "./Pool.sol";

contract VestedPool is Pool {
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
        unlockPeriod = _unlockPeriod * 1 days;
        totalUnlock = _totalUnlock * 1 days;
        cliff = _cliff * 1 days;
        unlockPerPeriod = _unlockPerPeriod;
    }

    function canClaim(address user) public view returns (bool) {
        return (getClaimableTokens(user) > 0);
    }

    function getClaimableTokens(address user) public view returns (uint256) {
        if (block.timestamp < startDate + cliff) return 0;

        uint256 claimed = allocations[user].claimed;
        uint256 amount = allocations[user].amount;
        if (block.timestamp >= totalUnlock + startDate + cliff || claimed + unlockPerPeriod > amount) return amount - claimed;

        uint256 claimable = ((block.timestamp - startDate - cliff) / unlockPeriod) * unlockPerPeriod - claimed;

        return claimable;
    }

    function buy() public override(Pool) {
        super.buy();

        uint256 tokensToClaimAfterPurchase = (allocations[msg.sender].amount * initialUnlock) / ONE_HUNDRED_PERCENT;
        allocations[msg.sender].claimed = tokensToClaimAfterPurchase;

        emit Claimed(msg.sender, tokensToClaimAfterPurchase);
    }

    function claim() public {
        uint256 claimable = getClaimableTokens(msg.sender);
        require(claimable > 0, "Nothing to claim");

        allocations[msg.sender].claimed += claimable;
        poolToken.transfer(msg.sender, claimable);

        emit Claimed(msg.sender, claimable);
    }

    function finishedClaiming(address user) external view returns (bool) {
        return (allocations[user].claimed == allocations[user].amount);
    }

    function nextClaimingAt(address wallet) external view returns (uint256) {
        if (canClaim(wallet)) return block.timestamp;
        if (block.timestamp < startDate) return startDate;

        uint256 passedThisPeriod = (block.timestamp - startDate) % unlockPeriod;

        return startDate + passedThisPeriod + unlockPeriod;
    }

    function remained(address wallet) external view returns (uint256) {
        return allocations[wallet].amount - allocations[wallet].claimed;
    }
}
