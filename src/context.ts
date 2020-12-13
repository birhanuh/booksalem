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
  pubsub: any
}

export function createContext(request: ContextParameters) {
  return {
    ...request,
    prisma,
    pubsub
  }
}
