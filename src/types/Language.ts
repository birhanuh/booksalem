import { objectType } from '@nexus/schema'

export const Category = objectType({
  name: 'languages',
  definition(t) {
    t.model.id()
    t.model.name()
    t.model.books({ pagination: false })
  },
})
