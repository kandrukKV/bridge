// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

interface IErc20token {
    function mint(address to, uint256 amount) external;

    function burn(address owner, uint256 amount) external;
}
