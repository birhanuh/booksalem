import { objectType } from '@nexus/schema'

export const Order = objectType({
  name: 'orders',
  definition(t) {
    t.model.id()
    t.model.books()
    t.model.users()
  },
})
