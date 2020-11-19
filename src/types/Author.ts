import { objectType } from '@nexus/schema'

export const Author = objectType({
  name: 'authors',
  definition(t) {
    t.model.id()
    t.model.name()
    t.model.books({ pagination: false })
  },
})
