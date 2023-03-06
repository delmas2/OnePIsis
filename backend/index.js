const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const app = express();
const fs = require('fs').promises;

const typeDefs = require("./schema")
const resolvers = require("./resolvers")

const server = new ApolloServer({
    typeDefs, resolvers,
    context: async ({ req }) => ({
        world: await readUserWorld(req.headers["x-user"]),
        user: req.headers["x-user"]
    })
});





   
async function readUserWorld(user) {
    try {
        const data = await fs.readFile("userworlds/" + user + "-world.json");
    return JSON.parse(data);
    }
    catch (error) {
        return world
    }
}

let world = require("./world")
app.use(express.static('public'));
server.start().then(res => {
    server.applyMiddleware({ app });
    app.listen({ port: 4000 }, () =>
        console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
    );
})