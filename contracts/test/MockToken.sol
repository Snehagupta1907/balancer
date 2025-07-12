// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.7.0;

import "@balancer-labs/v2-solidity-utils/contracts/openzeppelin/ERC20.sol";

/**
 * @dev Mock token for testing LST pool functionality
 * This simulates LST tokens without needing real rate providers
 */
contract MockToken is ERC20 {
    uint8 private _decimals;

    constructor(
        string memory name,
        string memory symbol,
        uint8 decimals_
    ) ERC20(name, symbol) {
        _decimals = decimals_;
        _mint(msg.sender, 1000000 * 10**decimals_); // Mint 1M tokens to deployer
    }

 
    /**
     * @dev Mint tokens for testing
     */
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    /**
     * @dev Burn tokens for testing
     */
    function burn(address from, uint256 amount) external {
        _burn(from, amount);
    }
} 