const mongoose = require('mongoose');

const launchesSchema = new mongoose.Schema({
    flightNumber: {
        type: Number,
        required: true,
        unique: true,
    },
    mission: {
        type: String,
        required: true,
    },
    rocket: {
        type: String,
        required: true,
    },
    launchDate: {
        type: Date,
        required: true,
    },
    target: {
        type: String,
        required: true,
    },
    customers: [ String],
    upcoming: {
        type: Boolean,
        required: true,
        default: true,
    },
    success: {
        type: Boolean,
        required: true,
        default: true,
    },
});

// first argument should always be singular name of the collection ongoose will take it and make it lowercase and plural
// this will connect the model to the "launches" collection in the database
module.exports = mongoose.model("Launch", launchesSchema);