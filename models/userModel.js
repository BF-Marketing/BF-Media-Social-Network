import mongoose from 'mongoose';
const userSchema = mongoose.Schema({
    username: String,
    password: String,
    email: String,
    profileImageLink: String, 
    createdAt: String
});

const UserModel = mongoose.model('users', userSchema);
export default UserModel;