import { objectType } from '@nexus/schema'

export const Checkout = objectType({
  name: 'checkouts',
  definition(t) {
    t.model.id()
    t.model.checkout_date()
    t.model.return_date()
    t.model.total_price()
    t.model.orders()
    t.model.users()
  },
})

export const CheckoutPayload = objectType({
  name: 'CheckoutPayload',
  definition(t) {
    t.field('checkout', { type: 'checkouts', nullable: true })
    t.field('errors', { type: 'Errors' })
  },
})