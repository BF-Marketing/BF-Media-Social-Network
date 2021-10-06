import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthenticationError, UserInputError, PubSub } from 'apollo-server';
import PostModel from '../models/postModel.js';
import UserModel from '../models/userModel.js';
import { validateRegisterInput, validateLoginInput } from '../validators.js';
import checkAuth from '../checkAuth.js';
import dotenv from 'dotenv';
dotenv.config()

const pubsub = new PubSub();

// create token for the user and returns the follwoing data to the client after loggin in
function generateToken(user){
    return jwt.sign({
        id: user.id,
        email: user.email,
        username: user.username,
        profileImageLink: user.profileImageLink
    }, process.env.SECRET_KEY, { expiresIn: process.env.TOKEN_EXP });
}

// after every query, mutation or subscription
const resolvers = {
    Post: {
        likeCount: (parent) => parent.likes.length,
        commentCount: (parent) => parent.comments.length
    },
    Query: {
        async getPosts(){
            try{
                const posts = await PostModel.find().sort({ createdAt: -1 });
                return posts;
            }
            catch(err){
                throw new Error(err);
            }
        }
    },
    Mutation: {
        async login(_, { username, password }){
            const { errors, valid } = validateLoginInput(username, password);

            if(!valid){
                throw new UserInputError('Invalid credentials', { errors });
            }

            const user = await UserModel.findOne({ username });
            if(!user){
                errors.username = 'User not found';
                throw new UserInputError('User not found', { errors });
            }

            const matchPassword = await bcrypt.compare(password, user.password);
            if(!matchPassword){
                errors.password = 'Wrong password';
                throw new UserInputError('Wrong password', { errors });
            }

            const token = generateToken(user);

            return{
                ...user._doc,
                id: user._id,
                token
            }
        },

        async register(_, {registerInput: {username, email, profileImageLink, password, confirmPassword}} ){
            const { valid, errors } = validateRegisterInput(username, email, profileImageLink, password, confirmPassword);
            if(!valid){
                throw new UserInputError('Errors', { errors });
            }

            const user = await UserModel.findOne({username});
            if(user){
                throw new UserInputError('Username is taken', {
                    errors: {
                        username: 'This username is taken already'
                    }
                });
            }

            password = await bcrypt.hash(password, 12);
            const newUser = new UserModel({
                email,
                username,
                profileImageLink,
                password,
                createdAt: new Date().toISOString()
            });

            const res = await newUser.save();
            const token = generateToken(res);

            return{
                ...res._doc,
                id: res._id,
                token
            }
        },
        
        async createPost(_, { body, imageLink, userImageLink }, context){
            const user = checkAuth(context);
            if(userImageLink.trim() === ''){ throw new UserInputError('You must provide a link to your profile picture'); }
            if(imageLink.trim() === ''){ throw new UserInputError('You must provide a link to an image'); }
            if(body.trim() === ''){ throw new UserInputError('Post body must not be empty'); }

            const newPost = new PostModel({
                body,
                imageLink,
                userImageLink,
                user: user.id,
                username: user.username,
                createdAt: new Date().toISOString()
            });

            const post = await newPost.save();

            context.pubsub.publish('NEW_POST', {
                newPost: post
            });

            return post;
        },

        async deletePost(_, { postId }, context){
            const user = checkAuth(context);
            try{
                const post = await PostModel.findById(postId);
                if(user.username === post.username){
                    await post.delete();
                    return 'Post deleted successfully';
                }
                else{
                    throw new AuthenticationError('Action not allowed');
                }
            }
            catch(err){
                throw new Error(err);
            }
        },

        async likePost(_, { postId }, context){
            const { username } = checkAuth(context);
            const post = await PostModel.findById(postId);
            if(post){
                if(post.likes.find(like => like.username === username)){
                    post.likes = post.likes.filter(like => like.username !== username);
                }
                else{
                    post.likes.push({
                        username,
                        createdAt: new Date().toISOString()
                    })
                }
                await post.save();
                return post;
            }
            else{
                throw new UserInputError('Post not found');
            }
        },

        // userCommentPhoto is the user profile url photo to be displayed everytime he/she comments
        async createComment(_, { postId, userCommentPhoto, body }, context){
            const { username } = checkAuth(context);
            if(body.trim() === ''){
                throw new UserInputError('Empty comment', {
                    errors: {
                        body: 'Comment body cannot be empty'
                    }
                })
            }

            if(userCommentPhoto.trim() === ''){
                throw new UserInputError('No photo', {
                    errors: {
                        userCommentPhoto: "You must provide your profile photo's url"
                    }
                })
            }

            const post = await PostModel.findById(postId);
            if(post){
                post.comments.unshift({
                    body,
                    username,
                    userCommentPhoto,
                    createdAt: new Date().toISOString()
                })
                await post.save();
                return post;
            }
            else{
                throw new UserInputError('Post not found');
            }
        },

        async deleteComment(_, { postId, commentId }, context){
            const { username } = checkAuth(context);
            const post = await PostModel.findById(postId);
            if(post){
                const commentIndex = post.comments.findIndex((this_comment) => this_comment.id === commentId);
                if(post.comments[commentIndex].username === username){  // checks if the comment belongs to the user who's trying to delete it
                    post.comments.splice(commentIndex, 1);
                    await post.save();
                    return post;
                }
                else{
                    throw new AuthenticationError('Action not allowed');
                }
            }
            else{
                throw new UserInputError('Post not found');
            }
        }
    },
    Subscription: {
        newPost: {
            subscribe: (_, __, { pubsub }) => pubsub.asyncIterator('NEW_POST')
        }
    }
}

export default resolvers;