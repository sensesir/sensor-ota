/**
 *   Script to perform OTA updates
 *   Author: Josh Perry
 *   Created: 12 July 2019
 */

const AWS = require("aws-sdk");
AWS.config.loadFromPath('./Config/aws-credentials.json');  

const docClient = new AWS.DynamoDB.DocumentClient()
const storageClient = new AWS.S3();
const Constants = require('./Config/Constants');
const Stream = require('stream');      


class OTAUpdate {
    async otaUpdateSingleDevice(res, sensorUID) {
        // Fetch latest version
        const itemIdentifiers = {
            TableName: Constants.TABLE_FIRMWARE_DISTRIBUTIONS,
            Key: { release: "latest" }
        };

        const latestRelease = await getItem(itemIdentifiers);
        const binFileName = latestRelease.binaryFileName;

        // Fetch the file from S3
        console.log(`OTA: Fetching binary file from S3`);
        const binFile = await getFile(binFileName);
        const binFileData = binFile.Body;
        console.log(`API: Got firmware file from S3`);
  
        let readStream = new Stream.Readable();
        readStream._read = () => {};
        readStream.push(binFileData);
        readStream.push(null)

        readStream.on('end', () => { 
            console.log(`OTA: Completed binary stream`);
            res.end(); 
        })

        readStream.on('error', (error) => { 
            console.log(`OTA: Stream error ${error}`); 
            // TODO: handle
        });

        // Temp
        readStream.on('data', (chunk) => {
            console.log(`Received ${chunk.length} bytes of data.`);
            
        });

        readStream.pipe(res);
    }

    async otaNonStream(res, sensorUID){
        // Fetch latest version
        const itemIdentifiers = {
            TableName: Constants.TABLE_FIRMWARE_DISTRIBUTIONS,
            Key: { release: "latest" }
        };

        const latestRelease = await getItem(itemIdentifiers);
        const binFileName = latestRelease.binaryFileName;

        // Fetch the file from S3
        console.log(`OTA: Fetching binary file from S3`);
        const binFile = await getFile(binFileName);
        const binFileData = binFile.Body;
        console.log(`API: Got firmware file from S3`);

        // Simply send on
        res.send(binFileData);
    }
};

const getItem = (itemIdentifiers) => {
    return new Promise((resolve, reject) => {
        docClient.get(itemIdentifiers, (error, data) => {
            if (error) {
                return reject(error);
            }
            return resolve(data.Item);
        });
    });
}

const getFile = (filename) => {
    const params = {
        Bucket: Constants.BUCKET_FIRMWARE_BINARIES, 
        Key: filename
    };

    return new Promise((resolve, reject) => {
        storageClient.getObject(params, (error, data) => {
            if (error) {
                return reject(error);
            }

            // Deserialized data return from S3
            // data.body => Buffer (node.js) readable stream
            return resolve(data);
        });
    });
}

module.exports = OTAUpdate;
