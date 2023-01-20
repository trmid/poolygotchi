//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { IERC165 } from "../node_modules/@openzeppelin/contracts/utils/introspection/IERC165.sol";

interface IWhitelist is IERC165 {
  
  function isWhitelisted(address _address) external view returns (bool);

}
