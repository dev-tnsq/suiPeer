pragma circom 2.0.0;

include "node_modules/circomlib/circuits/poseidon.circom";
include "node_modules/circomlib/circuits/comparators.circom";

template ResearcherCredentials() {
    // Private inputs
    signal input privateCredentialHash;
    signal input privateInstitutionId;
    signal input privateResearcherId;
    signal input privateEducationLevel;
    signal input privateYearsExperience;
    
    // Public inputs
    signal input publicCredentialCommitment;
    signal input publicInstitutionVerified;
    signal input publicMinEducationLevel;
    signal input publicMinExperience;
    signal input publicDomainId;
    
    // Output
    signal output verified;
    
    // 1. Verify the credential hash matches the commitment
    component hasher = Poseidon(5);
    hasher.inputs[0] <== privateCredentialHash;
    hasher.inputs[1] <== privateInstitutionId;
    hasher.inputs[2] <== privateResearcherId;
    hasher.inputs[3] <== privateEducationLevel;
    hasher.inputs[4] <== privateYearsExperience;
    
    component hashCheck = IsEqual();
    hashCheck.in[0] <== hasher.out;
    hashCheck.in[1] <== publicCredentialCommitment;
    
    // 2. Verify the institution is verified
    component institutionCheck = IsEqual();
    institutionCheck.in[0] <== publicInstitutionVerified;
    institutionCheck.in[1] <== 1;
    
    // 3. Verify education level meets minimum requirements
    component educationCheck = GreaterEqThan(4);
    educationCheck.in[0] <== privateEducationLevel;
    educationCheck.in[1] <== publicMinEducationLevel;
    
    // 4. Verify years of experience meets minimum requirements
    component experienceCheck = GreaterEqThan(8);
    experienceCheck.in[0] <== privateYearsExperience;
    experienceCheck.in[1] <== publicMinExperience;
    
    // All checks must pass for verification to succeed
    // Break down the multiplication into intermediate steps to avoid non-quadratic constraints
    signal intermediate1;
    signal intermediate2;
    
    intermediate1 <== hashCheck.out * institutionCheck.out;
    intermediate2 <== educationCheck.out * experienceCheck.out;
    verified <== intermediate1 * intermediate2;
}

component main = ResearcherCredentials();