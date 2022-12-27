const { exec, spawn } = require("child_process");

console.log("Starting hardhat node...");
exec('cd src/solidity && npx hardhat node', (error, stdout, stderr) => {
  if (error) {
    console.error(`exec error: ${error}`);
    return;
  }
  // console.log(`stdout: ${stdout}`);
  if(stderr) console.error(`stderr: ${stderr}`);
});

setTimeout(() => {
  console.log("Deploying test contracts...");
  exec('cd src/solidity && npx hardhat run scripts/devDeploy.ts --network localhost', (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
    if(stderr) console.error(`stderr: ${stderr}`);
  });

  console.log("Starting dev rollup...")
  const rollup = spawn('rollup', ['-c', '-w']);
  rollup.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });
  rollup.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });
  rollup.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
  });
}, 5000);