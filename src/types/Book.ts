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

const BookObj = objectType({
  name: 'bookObj',
  definition(t) {
    t.int('id')
    t.string('title')
    t.int('author_id')
    t.string('status')
    t.string('condition')
    t.int('isbn')
    t.string('published_date')
    t.string('cover_url')
    t.float('price')
    t.string('description')
    t.int('rating')
    t.field('author', { type: 'authors' })
    t.field('language', { type: 'languages' })
    t.field('category', { type: 'categories' })
  },
})

export const BookPayload = objectType({
  name: 'BookPayload',
  definition(t) {
    t.field('book', { type: BookObj, nullable: true })
    t.field('errors', { type: 'Errors' })
  },
})