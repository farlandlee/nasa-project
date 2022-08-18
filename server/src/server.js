const http = require('http');

require('dotenv').config();

const app = require('./app');
const { mongoConnect } = require('./services/mongo');
const { loadPlanetsData } = require('./models/planets.model');
const { loadLaunchesData } = require('./models/launches.model');

const PORT = process.env.PORT || 8000;

const server = http.createServer(app);

// in commonjs modules you cannot have an async fuction in the top level scope, so this is required in order to allow use to usr the await syntax for loadPlanetData to it loads before the server starts listening
async function startServer() {
    await mongoConnect();
    await loadPlanetsData();
    await loadLaunchesData();
    
    server.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}...`);
    });
}

startServer();