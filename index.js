/**
 *   Microservice to distribute OTA updates to all sensors
 *   Author: Josh Perry
 *   Created: 12 July 2019
 */

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { log, ExpressAPILogMiddleware } = require('@rama41222/node-logger');
const Constants = require('./Config/Constants');
const OTAUpdate = require('./OTAUpdates');

const config = {
    name: 'GDoor-OTA-Updater',
    port: 3000,
    host: '0.0.0.0',
};

const app = express();
const logger = log({ console: true, file: false, label: config.name });

app.use(bodyParser.json());
app.use(cors());
app.use(ExpressAPILogMiddleware(logger, { request: true }));

// API Endpoints

app.get('/', (req, res) => {
    res.status(200).send('hello world');
});

app.get(Constants.ENDPOINT_OTA_UPDATE, async (req, res) => {
    if (!veryifAPI(req)) {
        res.status(403).send('Forbidden');
        return;
    }

    console.log(`INDEX: Received request to update OTA`);
    const sensorUID = req.get('sensor-uid');
    const otaUpdate = new OTAUpdate();
    await otaUpdate.otaUpdateSingleDevice(res, sensorUID);
});

app.listen(config.port, null, (e)=> {
    if(e) {
        throw new Error('Internal Server Error');
    }
    logger.info(`${config.name} running on ${config.host}:${config.port}`);
});

const veryifAPI = (req) => {
    const providedKey = req.get('x-api-key');
    if (providedKey === Constants.API_KEY) {
        return true;
    } else {
        console.log(`INDEX: Incorrect API key => ${providedKey}`);
        return false;
    }
}