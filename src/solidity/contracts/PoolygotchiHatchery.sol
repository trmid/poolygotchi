//SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "./IWhitelist.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";

contract PoolygotchiHatchery is Ownable {

  // uint constant MAX_INT32 = 2**32 - 1;
  
  struct Poolygotchi {
    uint256 goalAmountWeekly;
    uint64 goalStartDate;
    uint64 hatchDate;
    uint64 speciesId;
    uint64 environmentId;
    string name;
  }

  struct AssetLibrary {
    address whitelist;
    string uri;
  }

  event Hatch(address indexed pooler);
  event SetGoal(address indexed pooler, uint256 amountWeekly);
  event Morph(address indexed pooler, uint64 speciesId);
  event Move(address indexed pooler, uint64 environmentId);
  event Name(address indexed pooler, string name);
  event AddSpecies(uint64 indexed id, AssetLibrary species);
  event AddEnvironment(uint64 indexed id, AssetLibrary environment);

  mapping(address => Poolygotchi) private _Poolygotchi;
  mapping(uint64 => AssetLibrary) private _species;
  mapping(uint64 => AssetLibrary) private _environment;

  uint64 private _nextSpeciesId = 0;
  uint64 private _nextEnvironmentId = 0;

  constructor() Ownable() { }

  modifier validWhitelist(address whitelist) {
    require(whitelist == address(0) || IWhitelist(whitelist).supportsInterface(type(IWhitelist).interfaceId), "Hatchery: invalid whitelist");
    _;
  }

  modifier speciesExists(uint64 speciesId) {
    require(speciesId < _nextSpeciesId, "Hatchery: nonexistent species");
    _;
  }

  modifier environmentExists(uint64 environmentId) {
    require(environmentId < _nextEnvironmentId, "Hatchery: nonexistent environment");
    _;
  }

  modifier _hasPoolygotchi(address pooler) {
    require(hasPoolygotchi(pooler), "Hatchery: pooler has no pooly");
    _;
  }

  modifier _whitelisted(address whitelist) {
    require(whitelist == address(0) || IWhitelist(whitelist).isWhitelisted(_msgSender()), "Hatchery: not whitelisted");
    _;
  }

  function hasPoolygotchi(address pooler) public view returns (bool) {
    return _Poolygotchi[pooler].goalStartDate > 0;
  }

  function numSpecies() external view returns (uint64) {
    return _nextSpeciesId;
  }

  function numEnvironments() external view returns (uint64) {
    return _nextEnvironmentId;
  }

  function poolygotchiOf(address pooler) external view _hasPoolygotchi(_msgSender()) returns (Poolygotchi memory) {
    return _Poolygotchi[pooler];
  }

  // function healthFactor(address pooler, uint256 currentBalance) public view _hasPoolygotchi(pooler) returns (int32) {
  //   // returns the number of seconds that the depositor is off from their goal
  //   // factor > 0 means depositor is ahead of their goal
  //   // factor < 0 means depositor is behind their goal
  //   // maxes out at +/- MAX_INT32

  //   uint256 balanceChange;
  //   bool balanceNegative = false;
  //   if(currentBalance < _Poolygotchi[pooler].goalStartBalance) {
  //     balanceNegative = true;
  //     balanceChange = _Poolygotchi[pooler].goalStartBalance - currentBalance;
  //   } else {
  //     balanceChange = currentBalance - _Poolygotchi[pooler].goalStartBalance;
  //   }
  //   uint256 secondsOff = (1 weeks * balanceChange) / _Poolygotchi[pooler].goalAmountWeekly;
  //   if(secondsOff > MAX_INT32) {
  //     secondsOff = MAX_INT32;
  //   }
  //   int32 factor = int32(uint32(secondsOff));
  //   if(balanceNegative) {
  //     factor = factor * -1;
  //   }
  //   return factor;
  // }

  function speciesURI(uint64 speciesId) external view speciesExists(speciesId) returns (string memory) {
    return _species[speciesId].uri;
  }

  function environmentURI(uint64 environmentId) external view environmentExists(environmentId) returns (string memory) {
    return _environment[environmentId].uri;
  }

  function addSpecies(string memory uri, address whitelist) external onlyOwner() validWhitelist(whitelist) {
    uint64 id = _nextSpeciesId++;
    _species[id].uri = uri;
    _species[id].whitelist = whitelist;
    emit AddSpecies(id, _species[id]);
  }

  function addEnvironment(string memory uri, address whitelist) external onlyOwner() validWhitelist(whitelist) {
    uint64 id = _nextEnvironmentId++;
    _environment[id].uri = uri;
    _environment[id].whitelist = whitelist;
    emit AddEnvironment(id, _environment[id]);
  }

  function setGoal(uint256 amountWeekly) public _hasPoolygotchi(_msgSender()) {
    _Poolygotchi[_msgSender()].goalAmountWeekly = amountWeekly;
    _Poolygotchi[_msgSender()].goalStartDate = uint64(block.timestamp);
    emit SetGoal(_msgSender(), amountWeekly);
  }

  function morphInto(uint64 speciesId) public
    _hasPoolygotchi(_msgSender())
    _whitelisted(_species[speciesId].whitelist)
    speciesExists(speciesId)
  {
    _Poolygotchi[_msgSender()].speciesId = speciesId;
    emit Morph(_msgSender(), speciesId);
  }

  function setEnvironment(uint64 environmentId) public
    _hasPoolygotchi(_msgSender())
    _whitelisted(_environment[environmentId].whitelist)
    environmentExists(environmentId)
  {
    _Poolygotchi[_msgSender()].environmentId = environmentId;
    emit Move(_msgSender(), environmentId);
  }

  function setName(string memory name) public _hasPoolygotchi(_msgSender()) {
    _Poolygotchi[_msgSender()].name = name;
    emit Name(_msgSender(), name);
  }

  function hatch(string memory name, uint64 speciesId, uint64 environmentId, uint256 amountWeekly) external {
    require(!hasPoolygotchi(_msgSender()), "Hatchery: already hatched");
    setName(name);
    setEnvironment(environmentId);
    morphInto(speciesId);
    setGoal(amountWeekly);
    _Poolygotchi[_msgSender()].hatchDate = uint64(block.timestamp);
    emit Hatch(_msgSender());
  }

}
