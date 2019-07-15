/**
 *  Script to test the server and inspect the binary file - http clients fall short
 */

const axios = require('axios');
const Constants = require('../Config/Constants');
const fs = require('fs');
const remote = false;
const testURL = remote ? "http://ec2-34-245-168-70.eu-west-1.compute.amazonaws.com:3000/otaUpdate" : "http://0.0.0.0:3000/otaUpdate";

const getOTAUpdate = async () => {
    console.log(`TEST: Getting OTA file`);

    const requestParams = {
        method: 'GET',
        headers: { 
            'x-api-key': Constants.API_KEY,
            'sensor-uid': 'SensorJPDev'
        },
        url: testURL,
        responseType: 'stream'
    }
    
    // Response should be a readable stream?
    try {
        let response = await axios(requestParams);
    
        console.log(`TESTS: Response = ${response.data}`);
        console.log(`TESTS: Res data is instance of => ${typeof response.data}`);

        // Write file to tests folder
        let writeStream = fs.createWriteStream('sensor-main_t2_s2.bin');
        response.data.pipe(writeStream);

        response.data.on('end', () => {
            console.log('TEST: Completed stream write');
            writeStream.end();
        })
    } catch (error) {
        console.log(error);
    }
    
};

 getOTAUpdate();