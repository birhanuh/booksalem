import { ApolloServer } from 'apollo-server-lambda'
import * as express from "express";
import { permissions } from './permissions'
import { schema } from './schema'
import { createContext } from './context'

// env
require("dotenv").config();

const server = new ApolloServer({
  schema,
  context: createContext,
  // middlewares: [permissions],
  playground: {
    endpoint: 'dev/graphql'
  },
  tracing: true,
  introspection: true
})

export const handler = server.createHandler({
  cors: {
    origin: '*'
  }
})

console.log(
  `🚀 Http server ready at: http://localhost:3000/dev/graphql⭐️\n🚀 WS server ready at: ws://localhost:3000/dev/graphql⭐️`
)