import { objectType } from '@nexus/schema'

export const Order = objectType({
  name: 'Order',
  definition(t) {
    t.model.id()
    t.model.unitPrice()
    t.model.quantity()
    t.field('user', { type: 'User' })
    t.field('book', { type: 'Book' })
  },
})

export const OrderResp = objectType({
  name: 'OrderResp',
  definition(t) {
    Order || null
  },
})