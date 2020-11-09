import { objectType } from '@nexus/schema'

export const Errors = objectType({
  name: 'Errors',
  definition(t) {
    t.string('path')
    t.string('message')
  },
})
