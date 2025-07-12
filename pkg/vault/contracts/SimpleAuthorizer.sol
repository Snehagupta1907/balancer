// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.7.0;

import "@balancer-labs/v2-interfaces/contracts/vault/IAuthorizer.sol";

/**
 * @dev Simple Authorizer for deployment - allows the owner to perform any action
 */
contract SimpleAuthorizer is IAuthorizer {
    address private immutable _owner;

    constructor(address owner) {
        _owner = owner;
    }

    function canPerform(
        bytes32 actionId,
        address account,
        address where
    ) external view override returns (bool) {
        return account == _owner;
    }

    function getOwner() external view returns (address) {
        return _owner;
    }
} 