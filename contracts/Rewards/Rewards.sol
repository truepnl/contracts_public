//SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-solidity/contracts/access/Ownable.sol";

contract Rewards is Ownable {
    struct userInfo {
        uint256 claimedPNL;
        uint256 claimedUSD;
        uint256 receivedPNL;
        uint256 receivedUSD;
    }
    mapping(address => userInfo) public claimData;

    IERC20 PNL;
    IERC20 USD;

    event ClaimedUSD(address who, uint256 amount);
    event ClaimedPNL(address who, uint256 amount);

    constructor(address _PNL, address _USD) {
        PNL = IERC20(_PNL);
        USD = IERC20(_USD);
    }

    function addEarnData(
        address[] calldata _recepients,
        uint256[] calldata _amountsUSD,
        uint256[] calldata _amountsPNL
    ) external onlyOwner {
        for (uint32 i = 0; i < _recepients.length; i++) {
            claimData[_recepients[i]].receivedUSD += _amountsUSD[i];
            claimData[_recepients[i]].receivedPNL += _amountsPNL[i];
        }
    }

    function setEarnData(
        address[] calldata _recepients,
        uint256[] calldata _amountsUSD,
        uint256[] calldata _amountsPNL,
        uint256[] calldata _amountsClaimedUSD,
        uint256[] calldata _amountsClaimedPNL
    ) external onlyOwner {
        for (uint32 i = 0; i < _recepients.length; i++) {
            claimData[_recepients[i]].receivedUSD = _amountsUSD[i];
            claimData[_recepients[i]].receivedPNL = _amountsPNL[i];
            claimData[_recepients[i]].claimedUSD = _amountsClaimedUSD[i];
            claimData[_recepients[i]].claimedPNL = _amountsClaimedPNL[i];
        }
    }

    function getEarnInfo(address who)
        external
        view
        returns (
            uint256 receivedPNL,
            uint256 receivedUSD,
            uint256 claimedPNL,
            uint256 claimedUSD,
            uint256 claimPNLAvailable,
            uint256 claimUSDTAvailable
        )
    {
        uint256 PNLAvailable = claimData[who].receivedPNL - claimData[who].claimedPNL;
        uint256 USDTAvailable = claimData[who].receivedUSD - claimData[who].claimedUSD;
        return (claimData[who].receivedPNL, claimData[who].receivedUSD, claimData[who].claimedPNL, claimData[who].claimedUSD, PNLAvailable, USDTAvailable);
    }

    function drip() public {
        claimData[msg.sender] = userInfo(108 ether, 101 ether, 1491 ether, 192 ether);
    }

    function claimUSD() external {
        uint256 amount = claimData[msg.sender].receivedUSD - claimData[msg.sender].claimedUSD;
        claimData[msg.sender].claimedUSD = claimData[msg.sender].receivedUSD;
        USD.transfer(msg.sender, amount);

        emit ClaimedUSD(msg.sender, amount);
    }

    function claimPNL() external {
        uint256 amount = claimData[msg.sender].receivedPNL - claimData[msg.sender].claimedPNL;
        claimData[msg.sender].claimedPNL = claimData[msg.sender].receivedPNL;
        PNL.transfer(msg.sender, amount);

        emit ClaimedPNL(msg.sender, amount);
    }

    function extractToken(address token) external onlyOwner {
        IERC20(token).transfer(msg.sender, IERC20(token).balanceOf(address(this)));
    }

    function extractBNB() external onlyOwner {
        payable(msg.sender).transfer(address(this).balance);
    }
}
