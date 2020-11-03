import { objectType } from '@nexus/schema'

export const Checkout = objectType({
  name: 'Checkout',
  definition(t) {
    t.model.id()
    t.model.status()
    t.model.totalPrice()
    t.model.orders()
    t.field('user', { type: 'User', nullable: false })
  },
})
