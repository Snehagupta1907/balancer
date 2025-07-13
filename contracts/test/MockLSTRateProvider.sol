// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.7.0;

import "@balancer-labs/v2-interfaces/contracts/pool-utils/IRateProvider.sol";
import "@balancer-labs/v2-solidity-utils/contracts/math/FixedPoint.sol";

/**
 * @dev Mock rate provider for LST tokens with hardcoded rates
 * Rates are relative to WMON (1 WMON = X LST tokens)
 */
contract MockLSTRateProvider is IRateProvider {
    using FixedPoint for uint256;

    // Hardcoded rates (18 decimals)
    // 1 WMON = 0.9842 shMON
    uint256 private constant SHMON_RATE = 984200000000000000; // 0.9842 * 1e18
    
    // 1 WMON = 1.0004 gMON  
    uint256 private constant GMON_RATE = 1000400000000000000; // 1.0004 * 1e18
    
    // 1 WMON = 0.996 aprMON
    uint256 private constant APRMON_RATE = 996000000000000000; // 0.996 * 1e18
    
    // 1 WMON = 0.9852 sMON
    uint256 private constant SMON_RATE = 985200000000000000; // 0.9852 * 1e18

    // Token type enum
    enum TokenType { SHMON, SMON, GMON, APRMON }

    TokenType private immutable _tokenType;

    constructor(TokenType tokenType) {
        _tokenType = tokenType;
    }

    /**
     * @dev Returns the rate for the specific LST token
     * Rate represents how many LST tokens equal 1 WMON
     */
    function getRate() external view override returns (uint256) {
        if (_tokenType == TokenType.SHMON) {
            return SHMON_RATE;
        } else if (_tokenType == TokenType.SMON) {
            return SMON_RATE;
        } else if (_tokenType == TokenType.GMON) {
            return GMON_RATE;
        } else if (_tokenType == TokenType.APRMON) {
            return APRMON_RATE;
        } else {
            revert("Invalid token type");
        }
    }

    /**
     * @dev Get the token type for this rate provider
     */
    function getTokenType() external view returns (TokenType) {
        return _tokenType;
    }

    /**
     * @dev Get the rate as a human-readable string
     */
    function getRateDescription() external view returns (string memory) {
        if (_tokenType == TokenType.SHMON) {
            return "1 WMON = 0.9842 shMON";
        } else if (_tokenType == TokenType.SMON) {
            return "1 WMON = 0.9852 sMON";
        } else if (_tokenType == TokenType.GMON) {
            return "1 WMON = 1.0004 gMON";
        } else if (_tokenType == TokenType.APRMON) {
            return "1 WMON = 0.996 aprMON";
        } else {
            return "Invalid token type";
        }
    }
} 