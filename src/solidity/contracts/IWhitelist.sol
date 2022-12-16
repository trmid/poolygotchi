pragma solidity >=0.8.0 <0.9.0;
//SPDX-License-Identifier: MIT

import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

interface IWhitelist is IERC165 {
  
  function isWhitelisted(address _address) external view returns (bool);

}
