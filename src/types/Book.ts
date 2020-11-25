import { objectType, stringArg } from '@nexus/schema'
import { type } from 'os'

export const Book = objectType({
  name: 'books',
  definition(t) {
    t.model.id()
    t.model.title()
    t.model.status()
    t.model.condition()
    t.model.isbn()
    t.model.published_date()
    t.model.cover_url()
    t.model.price()
    t.model.description()
    t.model.rating()
    t.field('authors', { type: 'authors' })
    t.field('languages', { type: 'languages' })
    t.field('categories', { type: 'categories' })
    t.field('users', { type: 'users' })
    t.model.orders({ pagination: true })
  },
})

export const BookPayload = objectType({
  name: 'BookPayload',
  definition(t) {
    t.field('book', { type: 'books', nullable: true })
    t.field('errors', { type: 'Errors' })
  },
})