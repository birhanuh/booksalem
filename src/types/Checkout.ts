import { objectType } from '@nexus/schema'

export const Checkout = objectType({
  name: 'checkouts',
  definition(t) {
    t.model.id()
    t.model.type()
    t.model.checkout_date()
    t.model.return_date()
    t.model.price()
    t.model.orders()
    t.model.users()
  },
})
