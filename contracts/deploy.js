const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const NETWORK = 'testnet'; // 'devnet', 'testnet', or 'mainnet'
const GAS_BUDGET = 100000000;

// Deploy the package
function deployPackage() {
  console.log(`Deploying package to ${NETWORK}...`);
  
  try {
    // Build the package
    execSync('sui move build', { stdio: 'inherit' });
    
    // Deploy the package
    const deployOutput = execSync(`sui client publish --gas-budget ${GAS_BUDGET} --json`, { encoding: 'utf-8' });
    
    // Parse the JSON output
    const deployResult = JSON.parse(deployOutput);
    
    // Extract the package ID and other important object IDs
    const packageId = deployResult.effects.created.find(obj => obj.owner === 'Immutable').reference.objectId;
    
    console.log(`Package deployed successfully!`);
    console.log(`Package ID: ${packageId}`);
    
    // Find and log other important object IDs
    const createdObjects = deployResult.effects.created
      .filter(obj => obj.owner && obj.owner.AddressOwner !== undefined)
      .map(obj => ({
        objectId: obj.reference.objectId,
        type: obj.type
      }));
    
    // Find shared objects
    const sharedObjects = deployResult.effects.created
      .filter(obj => obj.owner === 'Shared')
      .map(obj => ({
        objectId: obj.reference.objectId,
        type: obj.type
      }));
    
    // Combine all objects
    const allObjects = [...createdObjects, ...sharedObjects];
    
    console.log('Created objects:');
    allObjects.forEach(obj => {
      console.log(`- ${obj.type}: ${obj.objectId}`);
    });
    
    // Update the constants file with the new IDs
    updateConstants(packageId, allObjects);
    
    return {
      packageId,
      createdObjects: allObjects
    };
  } catch (error) {
    console.error('Deployment failed:', error);
    throw error;
  }
}

// Update the constants file with the new IDs
function updateConstants(packageId, createdObjects) {
  const constantsPath = path.join(__dirname, '..', 'sui-peer', 'constants', 'sui.ts');
  
  if (!fs.existsSync(constantsPath)) {
    console.error(`Constants file not found: ${constantsPath}`);
    return;
  }
  
  let constantsContent = fs.readFileSync(constantsPath, 'utf-8');
  
  // Update package ID
  constantsContent = constantsContent.replace(
    /export const PACKAGE_ID = "0x[a-f0-9]+";/,
    `export const PACKAGE_ID = "${packageId}";`
  );
  
  // Update object IDs based on their types
  createdObjects.forEach(obj => {
    if (obj.type.includes('PlatformConfig')) {
      constantsContent = constantsContent.replace(
        /export const PLATFORM_CONFIG_ID = "0x[a-f0-9]+";/,
        `export const PLATFORM_CONFIG_ID = "${obj.objectId}";`
      );
    } else if (obj.type.includes('RewardsTreasury')) {
      constantsContent = constantsContent.replace(
        /export const TREASURY_ID = "0x[a-f0-9]+";/,
        `export const TREASURY_ID = "${obj.objectId}";`
      );
    } else if (obj.type.includes('ReputationRegistry')) {
      constantsContent = constantsContent.replace(
        /export const REPUTATION_REGISTRY_ID = "0x[a-f0-9]+";/,
        `export const REPUTATION_REGISTRY_ID = "${obj.objectId}";`
      );
    } else if (obj.type.includes('GovernanceRegistry')) {
      constantsContent = constantsContent.replace(
        /export const GOVERNANCE_REGISTRY_ID = "0x[a-f0-9]+";/,
        `export const GOVERNANCE_REGISTRY_ID = "${obj.objectId}";`
      );
    } else if (obj.type.includes('ZKProofVerifier')) {
      constantsContent = constantsContent.replace(
        /export const ZK_VERIFIER_ID = "0x[a-f0-9]+";/,
        `export const ZK_VERIFIER_ID = "${obj.objectId}";`
      );
    } else if (obj.type.includes('StakingPool')) {
      constantsContent = constantsContent.replace(
        /export const STAKING_POOL_ID = "0x[a-f0-9]+";/,
        `export const STAKING_POOL_ID = "${obj.objectId}";`
      );
    }
  });
  
  fs.writeFileSync(constantsPath, constantsContent);
  console.log(`Updated constants file: ${constantsPath}`);
  
  // Also update the zk-utils.ts file with the contract addresses and object IDs
  updateZkUtils(packageId, createdObjects);
}

// Update the zk-utils.ts file with the contract addresses and object IDs
function updateZkUtils(packageId, createdObjects) {
  const zkUtilsPath = path.join(__dirname, '..', 'sui-peer', 'utils', 'zk-utils.ts');
  
  if (!fs.existsSync(zkUtilsPath)) {
    console.error(`ZK utils file not found: ${zkUtilsPath}`);
    return;
  }
  
  let zkUtilsContent = fs.readFileSync(zkUtilsPath, 'utf-8');
  
  // Update CONTRACT_ADDRESSES
  zkUtilsContent = zkUtilsContent.replace(
    /PLATFORM_ZK: '0x[a-f0-9]+'/,
    `PLATFORM_ZK: '${packageId}'`
  );
  
  zkUtilsContent = zkUtilsContent.replace(
    /ZK_VERIFIER: '0x[a-f0-9]+'/,
    `ZK_VERIFIER: '${packageId}'`
  );
  
  // Update OBJECT_IDS based on their types
  createdObjects.forEach(obj => {
    if (obj.type.includes('PlatformConfig')) {
      zkUtilsContent = zkUtilsContent.replace(
        /PLATFORM_CONFIG: '0x[a-f0-9]+'/,
        `PLATFORM_CONFIG: '${obj.objectId}'`
      );
    } else if (obj.type.includes('ZKProofVerifier')) {
      zkUtilsContent = zkUtilsContent.replace(
        /ZK_VERIFIER_OBJECT: '0x[a-f0-9]+'/,
        `ZK_VERIFIER_OBJECT: '${obj.objectId}'`
      );
    } else if (obj.type.includes('ReputationRegistry')) {
      zkUtilsContent = zkUtilsContent.replace(
        /REPUTATION_REGISTRY: '0x[a-f0-9]+'/,
        `REPUTATION_REGISTRY: '${obj.objectId}'`
      );
    } else if (obj.type.includes('GovernanceRegistry')) {
      zkUtilsContent = zkUtilsContent.replace(
        /GOVERNANCE_REGISTRY: '0x[a-f0-9]+'/,
        `GOVERNANCE_REGISTRY: '${obj.objectId}'`
      );
    } else if (obj.type.includes('RewardsTreasury')) {
      zkUtilsContent = zkUtilsContent.replace(
        /REWARDS_TREASURY: '0x[a-f0-9]+'/,
        `REWARDS_TREASURY: '${obj.objectId}'`
      );
    }
  });
  
  fs.writeFileSync(zkUtilsPath, zkUtilsContent);
  console.log(`Updated ZK utils file: ${zkUtilsPath}`);
}

// Main function
function main() {
  try {
    const { packageId, createdObjects } = deployPackage();
    
    // Also update the zk-utils.ts file
    const zkUtilsPath = path.join(__dirname, '..', 'sui-peer', 'utils', 'zk-utils.ts');
    if (fs.existsSync(zkUtilsPath)) {
      let zkUtilsContent = fs.readFileSync(zkUtilsPath, 'utf-8');
      
      // Update CONTRACT_ADDRESSES
      zkUtilsContent = zkUtilsContent.replace(
        /PLATFORM_ZK: '0x[a-f0-9]+'/,
        `PLATFORM_ZK: '${packageId}'`
      );
      
      // Update OBJECT_IDS based on their types
      createdObjects.forEach(obj => {
        if (obj.type.includes('PlatformConfig')) {
          zkUtilsContent = zkUtilsContent.replace(
            /PLATFORM_CONFIG: '0x[a-f0-9]+'/,
            `PLATFORM_CONFIG: '${obj.objectId}'`
          );
        } else if (obj.type.includes('ZKProofVerifier')) {
          zkUtilsContent = zkUtilsContent.replace(
            /ZK_VERIFIER_OBJECT: '0x[a-f0-9]+'/,
            `ZK_VERIFIER_OBJECT: '${obj.objectId}'`
          );
        } else if (obj.type.includes('ReputationRegistry')) {
          zkUtilsContent = zkUtilsContent.replace(
            /REPUTATION_REGISTRY: '0x[a-f0-9]+'/,
            `REPUTATION_REGISTRY: '${obj.objectId}'`
          );
        } else if (obj.type.includes('GovernanceRegistry')) {
          zkUtilsContent = zkUtilsContent.replace(
            /GOVERNANCE_REGISTRY: '0x[a-f0-9]+'/,
            `GOVERNANCE_REGISTRY: '${obj.objectId}'`
          );
        } else if (obj.type.includes('RewardsTreasury')) {
          zkUtilsContent = zkUtilsContent.replace(
            /REWARDS_TREASURY: '0x[a-f0-9]+'/,
            `REWARDS_TREASURY: '${obj.objectId}'`
          );
        }
      });
      
      fs.writeFileSync(zkUtilsPath, zkUtilsContent);
      console.log(`Updated ZK utils file: ${zkUtilsPath}`);
    }
    
    console.log('Deployment completed successfully!');
  } catch (error) {
    console.error('Deployment failed:', error);
    process.exit(1);
  }
}

main();