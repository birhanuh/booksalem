import { intArg, queryType, stringArg } from '@nexus/schema'
import { or } from 'graphql-shield'
import { getUserId } from '../utils'

export const Query = queryType({
  definition(t) {
    t.field('me', {
      type: 'users',
      nullable: true,
      resolve: (parent, args, ctx) => {
        const userId = getUserId(ctx)
        return ctx.prisma.users.findOne({
          where: {
            id: Number(userId),
          },
        })
      },
    })

    t.list.field('getAvailableBooks', {
      type: 'books',
      resolve: (parent, args, ctx) => {
        return ctx.prisma.books.findMany({
          where: { status: "available" },
        })
      },
    })

    t.field('getBook', {
      type: 'BookPayload',
      nullable: true,
      args: {
        id: intArg({ nullable: false }),
      },
      resolve: async (parent, { id }, ctx) => {
        try {
          const book = await ctx.prisma.books.findOne({
            where: { id: Number(id) },
          })

          return {
            book
          }
        } catch (error) {
          return {
            errors: error
          }
        }

      },
    })

    t.list.field('getLanguages', {
      type: 'languages',
      resolve: (parent, args, ctx) => {
        return ctx.prisma.languages.findMany();
      },
    })

    t.list.field('getCategories', {
      type: 'categories',
      resolve: (parent, args, ctx) => {
        return ctx.prisma.categories.findMany();
      },
    })

    t.list.field('filterBooks', {
      type: 'books',
      args: {
        searchString: stringArg({ nullable: true }),
      },
      resolve: (parent, { searchString }, ctx) => {
        return ctx.prisma.books.findMany({
          where: {
            OR: [
              {
                title: {
                  contains: searchString || undefined,
                },
              },
              {
                author: {
                  contains: searchString || undefined,
                },
              },
              {
                description: {
                  contains: searchString || undefined,
                },
              },
            ],
          },
        })
      },
    })

    t.field('getOrder', {
      type: 'orders',
      nullable: true,
      args: { orderId: intArg({ nullable: false }) },
      resolve: async (parent, { orderId }, ctx) => {
        const order = await ctx.prisma.orders.findOne({
          where: {
            id: Number(orderId),
          },
        })
        const user = order && await ctx.prisma.users.findOne({
          where: {
            id: Number(order.user_id),
          },
        })
        const book = order && await ctx.prisma.books.findOne({
          where: {
            id: Number(order.book_id),
          },
        })

        return {
          id: order && order.id as any,
          book,
          user
        }
      },
    })
  },
})
