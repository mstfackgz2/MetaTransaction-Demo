// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IPaymaster.sol";
import "./interfaces/UserOperation.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PaymasterContract is IPaymaster, Ownable {
    mapping(address => bool) public authorizedSponsors;
    mapping(address => uint256) public sponsorBalances;

    event SponsorAdded(address indexed sponsor);
    event SponsorDeposit(address indexed sponsor, uint256 amount);
    event SponsorWithdraw(address indexed sponsor, uint256 amount);

    constructor() Ownable(msg.sender) {}

    function validatePaymasterUserOp(
        UserOperation calldata userOp,
        bytes32, // userOpHash - unused but required by interface
        uint256 maxCost
    ) external override returns (bytes memory context, uint256 validationData) {
        // Sponsor address'ini paymasterAndData'dan çıkar
        address sponsor = address(bytes20(userOp.paymasterAndData[20:40]));
        
        require(authorizedSponsors[sponsor], "Sponsor not authorized");
        require(sponsorBalances[sponsor] >= maxCost, "Insufficient sponsor balance");
        
        // Sponsor balance'ından düş
        sponsorBalances[sponsor] -= maxCost;
        
        return ("", 0); // Success
    }

    function postOp(
        uint8, // mode - unused but required by interface
        bytes calldata context,
        uint256 actualGasCost
    ) external override {
        // Post-operation logic burada olacak
        // Şimdilik boş
    }

    function addSponsor(address sponsor) external onlyOwner {
        authorizedSponsors[sponsor] = true;
        emit SponsorAdded(sponsor);
    }

    function depositForSponsor(address sponsor) external payable {
        require(authorizedSponsors[sponsor], "Sponsor not authorized");
        sponsorBalances[sponsor] += msg.value;
        emit SponsorDeposit(sponsor, msg.value);
    }

    function withdrawSponsorBalance(uint256 amount) external {
        require(sponsorBalances[msg.sender] >= amount, "Insufficient balance");
        sponsorBalances[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
        emit SponsorWithdraw(msg.sender, amount);
    }
}