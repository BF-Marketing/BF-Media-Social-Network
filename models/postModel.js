import mongoose from 'mongoose';
const postSchema = mongoose.Schema({
    username: String,
    body: String,
    imageLink: String, 
    userImageLink: String, 
    createdAt: String,
    comments: [{
        username: String,
        body: String,
        userCommentPhoto: String,
        createdAt: String
    }],
    likes: [{
        username: String,
        createdAt: String
    }],
    user: {  
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    }
});

const PostModel = mongoose.model('posts', postSchema);
export default PostModel;
