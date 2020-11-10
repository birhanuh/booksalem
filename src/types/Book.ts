import { objectType } from '@nexus/schema'

export const Book = objectType({
  name: 'books',
  definition(t) {
    t.model.id()
    t.model.title()
    t.model.description()
    t.model.author()
    t.model.language()
    t.model.status()
    t.model.condition()
    t.model.isbn()
    t.model.rating()
    t.model.published_date()
    t.model.price()
    t.model.categories()
    t.model.orders({ pagination: false })
  },
})

