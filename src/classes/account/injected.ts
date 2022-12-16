import type { Account } from "./";

// export default class MetaMaskAccount implements Account {

//   // Possible signer objects:
//   private ethersSigner: Ethers.Signer | undefined;
//   private wcSigner: WCSigner | undefined;

//   /**
//    * Initializes the account with an Ethers Signer
//    * @param signer Ethers Signer
//    */
//   constructor(signer: Ethers.Signer)
//   /**
//    * Initializes the account with a Wallet Connect Sign Client
//    * @param signer Wallet Connect Sign Client
//    */
//   constructor(signer: WCSigner)
//   constructor(signer: Ethers.Signer | WCSigner) {
//     if(signer instanceof Ethers.Signer) {
//       this.ethersSigner = signer;
//     } else if (signer instanceof WCSigner) {
//       this.wcSigner = signer;
//     }
//   }

//   public async getAddress() {
//     if(this.ethersSigner) {
//       return await this.ethersSigner.getAddress();
//     } else if(this.wcSigner) {
//       return this.wcSigner.
//     }
//   }

// }