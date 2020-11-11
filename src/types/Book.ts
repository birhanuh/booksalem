import { objectType } from '@nexus/schema'

export const Book = objectType({
  name: 'books',
  definition(t) {
    t.model.id()
    t.model.title()
    t.model.author()
    t.model.status()
    t.model.condition()
    t.model.isbn()
    t.model.published_date()
    t.model.cover_url()
    t.model.price()
    t.model.description()
    t.model.rating()
    t.model.orders({ pagination: false })
    t.field('errors', { type: 'Errors' })
  },
})

export const AddBookPayload = objectType({
  name: 'AddBookPayload',
  definition(t) {
    t.field('books', { type: 'books' })
    t.field('errors', { type: 'Errors' })
  },
})