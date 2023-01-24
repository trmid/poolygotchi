# Poolygotchi

![version](https://img.shields.io/badge/dynamic/json?color=brightgreen&label=version&query=%24.version&url=https%3A%2F%2Fraw.githubusercontent.com%2Ftrmid%2Fpoolygotchi%2Fdev%2Fpackage.json)
![svelte](https://img.shields.io/static/v1?label&logo=svelte&logoColor=white&message=Svelte&color=FF3E00)
![typescript](https://img.shields.io/static/v1?label&logo=typescript&logoColor=white&message=TypeScript&color=3178C6)
![ipfs](https://img.shields.io/static/v1?label&logo=ipfs&logoColor=white&message=IPFS.js&color=65C2CB)
![ethers](https://img.shields.io/static/v1?label&logo=ethereum&logoColor=white&message=ethers.js&color=333333)
![pwa](https://img.shields.io/static/v1?label&logo=pwa&logoColor=white&message=PWA&color=5A0FC8)

## A gamified interface for the PoolTogether protocol.

![Poolygotchi Banner](./docs/img/banner.png)

## Installation

1. Clone or fork this repo and run `npm i`.
2. Install solidity dependencies by entering the solidity folder with `cd src/solidity` and running `npm i`.
3. Compile solidity contracts by running `npx hardhat compile`.

## Development

Follow these steps to setup your development environment:

1. Optionally, open the `scripts/devDeploy.ts` file and update line 20 with your test address to be sent test funds on the local node. (An easier method will be added soon)
2. Navigate back to the root folder.
3. Run `npm run dev` to start the development server.
    - If you'd like to run the development server with the live testnet contracts, use `npm run testnet-dev` instead (`npm run testnet-dev-win` if you are on windows)

## Build

When your app is production ready, run the following command to output the static site files to the `docs` directory:

### Linux

`npm run build`

### Windows

`npm run build-win`
