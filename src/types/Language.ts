import { objectType } from '@nexus/schema'

export const Language = objectType({
  name: 'languages',
  definition(t) {
    t.model.id()
    t.model.language()
    t.model.books({ pagination: false })
  },
})
