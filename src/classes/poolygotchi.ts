import WeaverFi from "weaverfi";
import type { BigNumber } from "ethers";
import type { ABI, Address, Chain } from "weaverfi/dist/types";
import type { BaseAccount } from "./account";

export class Poolygotchi {

  /* Static vars */
  static chain: Chain = "op";
  static address: Address = "0x"; // TODO: set contract address
  static abi: ABI = [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint64",
          "name": "id",
          "type": "uint64"
        },
        {
          "components": [
            {
              "internalType": "contract IWhitelist",
              "name": "whitelist",
              "type": "address"
            },
            {
              "internalType": "string",
              "name": "uri",
              "type": "string"
            }
          ],
          "indexed": false,
          "internalType": "struct PoolygotchiHatchery.AssetLibrary",
          "name": "environment",
          "type": "tuple"
        }
      ],
      "name": "AddEnvironment",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint64",
          "name": "id",
          "type": "uint64"
        },
        {
          "components": [
            {
              "internalType": "contract IWhitelist",
              "name": "whitelist",
              "type": "address"
            },
            {
              "internalType": "string",
              "name": "uri",
              "type": "string"
            }
          ],
          "indexed": false,
          "internalType": "struct PoolygotchiHatchery.AssetLibrary",
          "name": "species",
          "type": "tuple"
        }
      ],
      "name": "AddSpecies",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "pooler",
          "type": "address"
        }
      ],
      "name": "Hatch",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "pooler",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint64",
          "name": "speciesId",
          "type": "uint64"
        }
      ],
      "name": "Morph",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "pooler",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint64",
          "name": "environmentId",
          "type": "uint64"
        }
      ],
      "name": "Move",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "pooler",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "name",
          "type": "string"
        }
      ],
      "name": "Name",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "previousOwner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "OwnershipTransferred",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "pooler",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "startBalance",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amountWeekly",
          "type": "uint256"
        }
      ],
      "name": "SetGoal",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "uri",
          "type": "string"
        },
        {
          "internalType": "contract IWhitelist",
          "name": "whitelist",
          "type": "address"
        }
      ],
      "name": "addEnvironment",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "uri",
          "type": "string"
        },
        {
          "internalType": "contract IWhitelist",
          "name": "whitelist",
          "type": "address"
        }
      ],
      "name": "addSpecies",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "pooler",
          "type": "address"
        }
      ],
      "name": "hasPoolygotchi",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "name",
          "type": "string"
        },
        {
          "internalType": "uint64",
          "name": "speciesId",
          "type": "uint64"
        },
        {
          "internalType": "uint64",
          "name": "environmentId",
          "type": "uint64"
        },
        {
          "internalType": "uint256",
          "name": "startBalance",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "amountWeekly",
          "type": "uint256"
        }
      ],
      "name": "hatch",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint64",
          "name": "speciesId",
          "type": "uint64"
        }
      ],
      "name": "morphInto",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "numEnvironments",
      "outputs": [
        {
          "internalType": "uint64",
          "name": "",
          "type": "uint64"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "numSpecies",
      "outputs": [
        {
          "internalType": "uint64",
          "name": "",
          "type": "uint64"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "pooler",
          "type": "address"
        }
      ],
      "name": "PoolygotchiOf",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "goalStartBalance",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "goalAmountWeekly",
              "type": "uint256"
            },
            {
              "internalType": "uint64",
              "name": "goalStartDate",
              "type": "uint64"
            },
            {
              "internalType": "uint64",
              "name": "hatchDate",
              "type": "uint64"
            },
            {
              "internalType": "uint64",
              "name": "speciesId",
              "type": "uint64"
            },
            {
              "internalType": "uint64",
              "name": "environmentId",
              "type": "uint64"
            },
            {
              "internalType": "string",
              "name": "name",
              "type": "string"
            }
          ],
          "internalType": "struct PoolygotchiHatchery.Poolygotchi",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "renounceOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint64",
          "name": "environmentId",
          "type": "uint64"
        }
      ],
      "name": "setEnvironment",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "startBalance",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "amountWeekly",
          "type": "uint256"
        }
      ],
      "name": "setGoal",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "name",
          "type": "string"
        }
      ],
      "name": "setName",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "transferOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];

  /* Private vars */
  private address: Address;

  /* Constructor */
  constructor(address: Address) {
    this.address = address;
  }

  /* Functions */
  public rawData() {
    return Poolygotchi.PoolygotchiOf(this.address);
  }

  /* Static Functions */
  static contract = {
    call: (method: string, args?: any[]) => WeaverFi[this.chain].query(Poolygotchi.address, Poolygotchi.abi, method, args ?? [])
  }

  static hasPoolygotchi(address: Address): Promise<boolean> {
    return this.contract.call("hasPoolygotchi", [address]);
  }

  static numSpecies(): Promise<BigNumber> {
    return this.contract.call("numSpecies");
  }

  static numEnvironments(): Promise<BigNumber> {
    return this.contract.call("numEnvironments");
  }

  static speciesURI(speciesId: BigNumber) {
    return this.contract.call("speciesURI", [speciesId]);
  }

  static environmentURI(environmentId: BigNumber) {
    return this.contract.call("environmentURI", [environmentId]);
  }

  static PoolygotchiOf(address: Address): Promise<BigNumber> {
    return this.contract.call("PoolygotchiOf", [address]);
  }

}

export class PoolygotchiSigner extends Poolygotchi {

  /* Private vars */
  private account: BaseAccount;

  /* Constructor */
  constructor(account: BaseAccount) {
    super(account.address);
    this.account = account;
  }

  /* Functions */
  public setGoal(startBalance: BigNumber, amountWeekly: BigNumber) {
    // return this.account.
  }

}