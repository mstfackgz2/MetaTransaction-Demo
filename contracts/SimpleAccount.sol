// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IAccount.sol";
import "./interfaces/UserOperation.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

interface IEntryPoint {
    function getUserOpHash(UserOperation calldata userOp) external view returns (bytes32);
}

contract SimpleAccount is IAccount {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    address public owner;
    IEntryPoint private immutable _entryPoint;
    uint256 private _nonce;
    bool private _initialized;

    event SimpleAccountInitialized(address indexed entryPoint, address indexed owner);

    modifier requireFromEntryPoint() {
        require(msg.sender == address(_entryPoint), "account: not EntryPoint");
        _;
    }

    modifier requireFromEntryPointOrOwner() {
        require(
            msg.sender == address(_entryPoint) || msg.sender == owner,
            "account: not EntryPoint or owner"
        );
        _;
    }

    constructor(IEntryPoint anEntryPoint) {
        _entryPoint = anEntryPoint;
    }

    function initialize(address anOwner) public {
        require(!_initialized, "Already initialized");
        require(anOwner != address(0), "Invalid owner");
        
        owner = anOwner;
        _initialized = true;
        
        emit SimpleAccountInitialized(address(_entryPoint), owner);
    }

    // ERC-4337 IAccount implementation
    function validateUserOp(
        UserOperation calldata userOp,
        bytes32 userOpHash,
        uint256 missingAccountFunds
    ) external override requireFromEntryPoint returns (uint256 validationData) {
        validationData = _validateSignature(userOp, userOpHash);
        _payPrefund(missingAccountFunds);
    }

    function execute(address dest, uint256 value, bytes calldata func) external requireFromEntryPointOrOwner {
        _call(dest, value, func);
    }

    function executeBatch(address[] calldata dest, bytes[] calldata func) external requireFromEntryPointOrOwner {
        require(dest.length == func.length, "wrong array lengths");
        for (uint256 i = 0; i < dest.length; i++) {
            _call(dest[i], 0, func[i]);
        }
    }

    function _validateSignature(UserOperation calldata userOp, bytes32 userOpHash)
        internal view returns (uint256 validationData) {
        bytes32 hash = userOpHash.toEthSignedMessageHash();
        if (owner != hash.recover(userOp.signature))
            return 1; // SIG_VALIDATION_FAILED
        return 0; // SIG_VALIDATION_SUCCESS
    }

    function _payPrefund(uint256 missingAccountFunds) internal {
        if (missingAccountFunds != 0) {
            (bool success,) = payable(msg.sender).call{value: missingAccountFunds}("");
            require(success, "account: failed to pay prefund");
        }
    }

    function _call(address target, uint256 value, bytes memory data) internal {
        (bool success, bytes memory result) = target.call{value: value}(data);
        if (!success) {
            assembly {
                revert(add(result, 32), mload(result))
            }
        }
    }

    function entryPoint() public view returns (IEntryPoint) {
        return _entryPoint;
    }

    function getNonce() public view returns (uint256) {
        return _nonce;
    }

    function isInitialized() public view returns (bool) {
        return _initialized;
    }

    receive() external payable {}
}