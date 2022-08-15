const mongoose = require('mongoose');

const MONGO_URL = '***REMOVED***';

mongoose.connection.once('open', () => {
    console.log('MongoDB connected...');
});

mongoose.connection.on('error', (err) => {
    console.error(err);
});

async function mongooseConnect() {
    await mongoose.connect(MONGO_URL);
}

module.exports = {
    mongooseConnect
};