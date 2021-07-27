import { ApolloServer, PubSub } from 'apollo-server';
import mongoose from 'mongoose';

import {MONGODB} from './config.js';
import typeDefs from './graphql/typeDefs.js';
import resolvers from './graphql/resolvers.js';

const pubsub = new PubSub();
const PORT = process.env.PORT || 5000;

const server = new ApolloServer({
    typeDefs: typeDefs,
    resolvers: resolvers,
    context: ({ req }) => ({ req, pubsub })
});

mongoose.connect(MONGODB, {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true})
    .then(() => {
        console.log('Connected to MongoDB database...');
        return server.listen({port: PORT});
    }).then(res => {
        console.log(`Server running at ${res.url}`);
    })
    .catch(err => {
        console.error(err)
    })