import { GraphQLServer } from 'graphql-yoga'
import * as express from "express";
import { permissions } from './permissions'
import { schema } from './schema'
import { createContext } from './context'

// env
require("dotenv").config();

const server = new GraphQLServer({
  schema,
  context: createContext,
  // middlewares: [permissions],
})


// Serve static files
server.express.use("/uploads", express.static("uploads"));

// Start server
server.start(() =>
  console.log(
    `🚀 Server ready at: http://localhost:4000\n⭐️`,
  ),
)
