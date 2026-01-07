import mongoose from 'mongoose';

const Log = new mongoose.Schema({
    message: {
        type: String,
        required: true
    },
    level: {
        type: String,
        enum: ['info', 'warning', 'error'],
        default: 'info'
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    metadata: {
        type: Object,
        default: {}
    }
});

export const LogModel = mongoose.model('Log', Log);
