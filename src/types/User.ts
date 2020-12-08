import { objectType } from '@nexus/schema'

export const User = objectType({
  name: 'users',
  definition(t) {
    t.model.id()
    t.model.name()
    t.model.email()
    t.model.password()
    t.model.phone()
    t.model.is_admin()
    t.model.last_sign_in()
    t.model.books({ pagination: true })
    t.model.orders({ pagination: true })
    t.model.checkouts({ pagination: true })
  },
})

export const UserPayload = objectType({
  name: 'UserPayload',
  definition(t) {
    t.field('user', { type: 'users' })
    t.field('errors', { type: 'Errors' })
  },
})

export const AdminOrdresPayload = objectType({
  name: 'AdminOrdersPayload',
  definition(t) {
    t.field('users', { type: 'users', nullable: true })
  },
})
