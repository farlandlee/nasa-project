const {
  getAllLaunches,
  existsLaunchWithId,
  scheduleNewLaunch,
  abortLaunch,
} = require('../../models/launches.model');

async function httpGetAllLaunches(req, res) {
  return res.status(200).json( await getAllLaunches());
}

async function httpAddNewLaunch(req, res) {
  const launch = req.body;
  if(!launch.mission || !launch.rocket || !launch.target || !launch.launchDate) {
    return res.status(400).json({
      error: 'Missing required parameter',
    });
  }

  launch.launchDate = new Date(launch.launchDate);
  // using isNaN on a date object will automatically call toString on it and check if it is a valid date
  if(isNaN(launch.launchDate)) {
    return res.status(400).json({
      error: 'Invalid launch date',
    });
  }

  await scheduleNewLaunch(launch);

  return res.status(201).json(launch);
}

async function httpAbortLaunch(req, res) {
  const flightNumber = Number(req.params.id); // same as parseInt(req.params.id);
  const exists = existsLaunchWithId(flightNumber);
  if(!exists) {
    return res.status(404).json({
      error: 'Launch not found',
    });
  }
  const aborted = await abortLaunch(flightNumber);
  if(!aborted) {
    return res.status(400).json({
      error: 'Failed to abort launch',
    });
  }
  return res.status(200).json({
    ok: true,
  });
}

module.exports = {
    httpGetAllLaunches,
    httpAddNewLaunch,
    httpAbortLaunch
};