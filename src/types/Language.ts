import { objectType } from '@nexus/schema'

export const Language = objectType({
  name: 'Language',
  definition(t) {
    t.model.id()
    t.model.name()
  },
})
