const { default: axios } = require("axios");
const { exec, spawn } = require("child_process");

async function main() {
  console.log("Starting hardhat node...");
  exec('cd src/solidity && npx hardhat node', (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    // console.log(`stdout: ${stdout}`);
    if(stderr) console.error(`stderr: ${stderr}`);
  });

  // Wait for node to start before running deployment script:
  let status = 0;
  do {
    try {
      const res = await axios.get("http://127.0.0.1:8545/");
      status = res.status;
    } catch(err){
      await new Promise(r => setTimeout(r, 1000));
    }
  } while(status !== 200);

  // Deploy test contracts:
  console.log("Deploying test contracts...");
  exec('cd src/solidity && npx hardhat run scripts/devDeploy.ts --network localhost', (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
    if(stderr) console.error(`stderr: ${stderr}`);
  });

  // Start dev rollup:
  console.log("Starting dev rollup...")
  const rollup = spawn('npx', ['rollup', '-c', '-w'], { shell: true });
  rollup.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });
  rollup.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });
  rollup.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
  });
}

main().catch(console.error);