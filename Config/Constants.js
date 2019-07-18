/**
 * Crude setting of production env
 */

const DEV = 0;
const PROD = 1;

// Set environment here
const ENV = PROD;

// TODO: move to env vars
let envSpecificConfig = {};
if (ENV === DEV) {
    envSpecificConfig = {
        API_KEY: "878ed9d6-8729-4883-a93f-2ceb10b643ce",
        AWS_CRED_FILENAME: "aws-credentials.json", 

        // S3 Buckets
        BUCKET_FIRMWARE_BINARIES: "sensesir-firmware-releases",
    }
} else if (ENV === PROD) {
    envSpecificConfig = {
        API_KEY: "31f76620-3e10-4290-b3d8-2be6f4956484",
        AWS_CRED_FILENAME: "aws-credentials-prod.json",

        // S3 Buckets
        BUCKET_FIRMWARE_BINARIES: "sensesir-firmware-releases-prod",
    }
}

// Generic config - all envs
const configuration = {
    // HTTP
    ENDPOINT_OTA_UPDATE: "/otaUpdate",
    
    // DynampDB
    TABLE_FIRMWARE_DISTRIBUTIONS: "FirmwareDistributions",
    
    // Add env-specifics
    ...envSpecificConfig
}

module.exports = configuration;