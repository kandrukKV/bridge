// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "../../interfaces/IErc20token.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract Bridge {
  address public owner;
  IErc20token public token;
  mapping(address => mapping(uint256 => bool)) public processedNonces;
  using ECDSA for bytes32;

  event Swap(address from, uint256 amount, uint256 nonce, uint256 timestamp);

  event Redeem(
    address from,
    address to,
    uint256 amount,
    uint256 nonce,
    uint256 date
  );

  modifier onlyOwner() {
    require(msg.sender == owner, "Only admin can do it.");
    _;
  }

  constructor(address _token) {
    owner = msg.sender;
    token = IErc20token(_token);
  }

  function swap(uint256 amount, uint256 nonce) external {
    require(
      processedNonces[msg.sender][nonce] == false,
      "the transaction is completed"
    );
    processedNonces[msg.sender][nonce] = true;
    token.burn(msg.sender, amount);
    emit Swap(msg.sender, amount, nonce, block.timestamp);
  }

  function redeem(
    address to,
    uint256 amount,
    uint256 nonce,
    uint256 timestamp,
    uint8 v,
    bytes32 r,
    bytes32 s
  ) external {
    bytes32 signedDataHash = keccak256(
      abi.encodePacked(to, amount, nonce, timestamp)
    );
    // надо сделать мапу и по message => true/false
    // redeem должен вызываться самим пользователем, чтобы БЭК ничего не платил.
    bytes32 message = signedDataHash.toEthSignedMessageHash();
    address signer = message.recover(v, r, s);
    require(to == signer, "wrong signature");
    token.mint(to, amount);
    emit Redeem(to, to, amount, nonce, block.timestamp);
  }

  function mint(address to, uint256 amount) external onlyOwner {
    token.mint(to, amount);
  }

  function burn(address from, uint256 amount) external onlyOwner {
    token.burn(from, amount);
  }
}
