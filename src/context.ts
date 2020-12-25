import { PrismaClient } from '@prisma/client'
// import { ContextParameters } from 'graphql-yoga/dist/types'
// import { PubSub } from 'graphql-yoga'
const PubSub = require('PubSub')

const pubsub = new PubSub()

const prisma = new PrismaClient({
  errorFormat: 'minimal',
  log: ['query']
})

export interface Context {
  prisma: PrismaClient
  request: any
  connection: any
  pubsub: any
}

export function createContext(request: any, connection: any) {
  return {
    ...request,
    ...connection,
    prisma,
    pubsub
  }
}
