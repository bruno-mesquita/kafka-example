import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
    street: String,
    number: String,
    city: String,
    state: String,
}, { _id: false });

const userSchema = new mongoose.Schema({
    name: String,
    lastName: String,
    address: addressSchema
}, { timestamps: true });

export default mongoose.model('User', userSchema);