const launchesDatabase = require('./launches.mongo');
const planets = require('./planets.mongo');

const DEFAULT_FLIGHT_NUMBER = 100;

const launch = {
    flightNumber: 100,
    mission: 'FalconSat',
    rocket: 'Falcon 1',
    launchDate: new Date('January 1, 2028'),
    target: 'Kepler-442 b',
    customers: ['ZTM', 'NASA'],
}

saveLaunch(launch);


async function getAllLaunches() {
    return await launchesDatabase.find({},{
        '_id': 0,
        '__v': 0,
    });
}

async function existsLaunchWithId(id) {
    return launchesDatabase.findOne({ flightNumber: id }, {
        '_id': 0,
        '__v': 0,
    });
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
    const planet = await planets.findOne({keplerName: launch.target});
    if (!planet) {
        //https://github.com/goldbergyoni/nodebestpractices#-22-use-only-the-built-in-error-object
        throw new Error('Planet not found');
    }
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
    getAllLaunches,
    existsLaunchWithId,
    scheduleNewLaunch,
    abortLaunch,
};