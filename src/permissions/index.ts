import { rule, shield } from 'graphql-shield'
import { getUserId } from '../utils'

const rules = {
  isAuthenticatedUser: rule()((parent, args, context) => {
    const userId = getUserId(context)
    return Boolean(userId)
  }),
  isBookOwner: rule()(async (parent, { id }, context) => {
    const userId = getUserId(context)
    const author = await context.prisma.book
      .findOne({
        where: {
          id: Number(id),
        },
      })
      .author()
    return userId === author.id
  }),
}

export const permissions = shield({
  Query: {
    me: rules.isAuthenticatedUser,
    filterBooks: rules.isAuthenticatedUser,
    getOrder: rules.isAuthenticatedUser,
  },
  Mutation: {
    addBook: rules.isAuthenticatedUser,
    deleteBook: rules.isBookOwner,
    checkout: rules.isBookOwner,
  },
})
