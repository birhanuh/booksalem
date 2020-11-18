import { objectType } from '@nexus/schema'

export const AuthorPayload = objectType({
  name: 'AuthorPayload',
  definition(t) {
    t.field('author', { type: 'authors' })
    t.field('errors', { type: 'Errors' })
  },
})