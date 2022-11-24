import Ethers from "ethers";
import WCSigner from "@walletconnect/sign-client";

export default interface Account {
  getAddress(): Promise<string>
  
}