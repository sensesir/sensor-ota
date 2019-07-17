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
    async otaUpdateStream(res, sensorUID, build=null, version=null) {
        // Fetch distribution
        const binFileName = await getBinFileName(build, version);

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

        console.log(`OTA: Updating sensor => ${sensorUID}`);
        readStream.pipe(res);
    }

    async otaUpdateNonStream(res, sensorUID, build=null, version=null){
        // Fetch distribution
        const binFileName = await getBinFileName(build, version);
        
        // Fetch the file from S3
        console.log(`OTA: Fetching binary file from S3`);
        const binFile = await getFile(binFileName);
        const binFileData = binFile.Body;
        console.log(`API: Got firmware file from S3`);

        // Simply send on
        console.log(`OTA: Updating sensor => ${sensorUID}`);
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

const getBinFileName = async (build=null, version=null) => {
    if (build && version) {
        const itemIdentifiers = {
            TableName: Constants.TABLE_FIRMWARE_DISTRIBUTIONS,
            Key: { 
                build: Number(build), 
                version: version
            }
        };

        const release = await getItem(itemIdentifiers);
        if (!release) { throw new Error('No binary file found for version & build specified') }
        
        const binFileName = release.binaryFileName;
        return binFileName;
    } 
    
    else {
        console.log(`OTA: No version or build speficied, fetching latest`);
        // TODO
    }
}

module.exports = OTAUpdate;
