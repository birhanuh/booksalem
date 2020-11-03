import { objectType } from '@nexus/schema'

export const Book = objectType({
  name: 'Book',
  definition(t) {
    t.model.id()
    t.model.title()
    t.model.description()
    t.model.author()
    t.model.status()
    t.model.condition()
    t.model.ISBN()
    t.model.rating()
    // t.field('owner', { type: 'User', nullable: false })
    t.field('owner', { type: 'User' })
    t.field('user', { type: 'User' })
  },
})
