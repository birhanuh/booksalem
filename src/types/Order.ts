import { objectType } from '@nexus/schema'

export const Order = objectType({
  name: 'orders',
  definition(t) {
    t.model.id()
    t.model.user_id()
    t.model.book_id()
    t.model.status()
    t.model.order_date()
    t.model.books()
    t.model.users()
    t.model.checkouts()
  }
})

export const OrderPayload = objectType({
  name: 'OrderPayload',
  definition(t) {
    t.field('order', { type: 'orders', nullable: true })
    t.field('errors', { type: 'Errors' })
  },
})