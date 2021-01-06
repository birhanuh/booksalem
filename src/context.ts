import { PrismaClient } from '@prisma/client'
import { ContextParameters } from 'graphql-yoga/dist/types'
import { PubSub } from 'graphql-yoga'

const pubsub = new PubSub()

const prisma = new PrismaClient({
  errorFormat: 'minimal',
})

export interface Context {
  prisma: PrismaClient
  request: any
  connection: any
  pubsub: any
}

export const createContext: any = (request: ContextParameters, connection: ContextParameters) => {
  return {
    ...request,
    ...connection,
    prisma,
    pubsub
  }
}
