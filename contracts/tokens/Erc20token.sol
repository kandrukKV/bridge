// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Erc20token is ERC20 {
  address public owner;
  address public admin;

  constructor(string memory name, string memory symbol) ERC20(name, symbol) {
    owner = msg.sender;
  }

  modifier onlyAdmin() {
    require(msg.sender == admin, "Only admin can do it");
    _;
  }

  modifier onlyOwner() {
    require(msg.sender == owner, "Only owner can do it");
    _;
  }

  function setAdmin(address _admin) external onlyOwner {
    admin = _admin;
  }

  function mint(address to, uint256 amount) external onlyAdmin {
    _mint(to, amount);
  }

  function burn(address from, uint256 amount) external onlyAdmin {
    _burn(from, amount);
  }
}
