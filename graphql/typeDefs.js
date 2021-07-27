import { gql } from 'graphql-tag';

const typeDefs = gql`
    type Comment{
        id: ID!
        body: String!
        createdAt: String!
        username: String!
        userCommentPhoto: String!
    }
    type Like{
        id: ID!
        createdAt: String!
        username: String!
    }
    type Post{
        id: ID!
        body: String!
        imageLink: String!
        userImageLink: String!
        createdAt: String!
        username: String!
        comments: [Comment]!
        likes: [Like]!
        likeCount: Int!
        commentCount: Int!
    }
    type User{
        id: ID!
        email: String!
        token: String!
        username: String!
        profileImageLink: String!
        createdAt: String!
    }
    input RegisterInput{
        username: String!
        email: String!
        profileImageLink: String!
        password: String!
        confirmPassword: String!
    }
    type Query{
        getPosts: [Post]
    }
    type Mutation{
        register(registerInput: RegisterInput): User!
        login(username: String!, password: String!): User!
        createPost(body: String!, imageLink: String!, userImageLink: String!): Post!
        deletePost(postId: ID!): String!
        createComment(postId: ID!, userCommentPhoto: String!, body: String!): Post!
        deleteComment(postId: ID!, commentId: ID!): Post!
        likePost(postId: ID!): Post!
    }
    type Subscription {
        newPost: Post!
    }
`;
export default typeDefs;