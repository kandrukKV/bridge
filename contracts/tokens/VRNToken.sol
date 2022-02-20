// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./Erc20token.sol";

contract VRNToken is Erc20token {
    constructor() Erc20token("Vrungel token", "VRN") {}
}
