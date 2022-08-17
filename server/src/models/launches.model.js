const axios = require('axios');

const launchesDatabase = require('./launches.mongo');
const planets = require('./planets.mongo');

const DEFAULT_FLIGHT_NUMBER = 100;

const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query';

async function populateLaunchData() {
    console.log('getting space x launches...');
    const response = await axios.post(SPACEX_API_URL, {
        query: {},
        options: {
            pagination: false,
            populate: [
                {
                    path: 'rocket',
                    select: {
                        name: 1,
                    }
                },
                {
                    path: 'payloads',
                    select: {
                        customers: 1,
                    }
                }
            ]
        }
    });

    if(response.status !== 200) {
        console.log('error getting space x launches');
        throw new Error('Error getting space x launches');
    }

    const launchDocs = response.data.docs;
    for(let launchDoc of launchDocs) {
        const payloads = launchDoc.payloads;
        const customers = payloads.flatMap(payload => payload.customers);
        const launch = {
            flightNumber: launchDoc.flight_number,
            mission: launchDoc.name,
            rocket: launchDoc.rocket.name,
            launchDate: launchDoc.date_local,
            customers,
            upcoming: launchDoc.upcoming,
            success: launchDoc.success,
        };

        console.log(`${launch.flightNumber} ${launch.mission}...`);

        await saveLaunch(launch);
    }
}

async function loadLaunchesData() {
    const firstLaunch = await findLaunch({
        flightNumber: 1,
        mission: 'FalconSat',
        rocket: 'Falcon 1',
    })
    if(!firstLaunch) {
        await populateLaunchData();
    }
    else {
        console.log('space x launch data already loaded');
    }
}


async function getAllLaunches(skip,limit) {
    return await launchesDatabase.find({},{
        '_id': 0,
        '__v': 0,
    })
    .sort({
        flightNumber: 1,
    })
    .skip(skip)
    .limit(limit);
}

async function findLaunch(filter) {
    return await launchesDatabase.findOne(filter, {
        '_id': 0,
        '__v': 0,
    });
}

async function existsLaunchWithId(id) {
    return findLaunch({ flightNumber: id });
}

async function getLatestFlightNumber() {
    const lastestLaunch = await launchesDatabase
        .findOne({},{ flightNumber: 1})
        .sort({
            flightNumber: -1
        });
    if(!lastestLaunch) {
        return DEFAULT_FLIGHT_NUMBER;
    }
    return lastestLaunch.flightNumber;
}

async function saveLaunch(launch) {
    // updateOne is an atomic operation but it returns a field called $setOnInsert which is set by MongoDB.
    // findOneAndUpdate is an atomic operation but it does not create nor return $setOnInsert so leaves internal info internal i.e., like what database we are using.
    await launchesDatabase.findOneAndUpdate({
        flightNumber: launch.flightNumber,
    }, 
    launch, 
    {
        upsert: true,
    });
}

async function scheduleNewLaunch(launch) {
    const planet = await planets.findOne({keplerName: launch.target});
    if (!planet) {
        //https://github.com/goldbergyoni/nodebestpractices#-22-use-only-the-built-in-error-object
        throw new Error('Planet not found');
    }
    const newflightNumber = await getLatestFlightNumber() + 1;
    const newLaunch = Object.assign(launch, {
        upcoming: true,
        success: true,
        customers: ['ZTM', 'NASA'],
        flightNumber: newflightNumber,
    });
    await saveLaunch(newLaunch);
}

async function abortLaunch(flightNumber) {
    const aborted =  await launchesDatabase.updateOne({
        flightNumber: flightNumber,
    }, 
    {
        upcoming: false,
        success: false,
    });

    return aborted.modifiedCount === 1;
}

module.exports = {
    loadLaunchesData,
    getAllLaunches,
    existsLaunchWithId,
    scheduleNewLaunch,
    abortLaunch,
};