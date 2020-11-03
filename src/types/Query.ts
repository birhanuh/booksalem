import { intArg, queryType, stringArg } from '@nexus/schema'
import { or } from 'graphql-shield'
import { getUserId } from '../utils'

export const Query = queryType({
  definition(t) {
    t.field('me', {
      type: 'User',
      nullable: true,
      resolve: (parent, args, ctx) => {
        const userId = getUserId(ctx)
        return ctx.prisma.user.findOne({
          where: {
            id: Number(userId),
          },
        })
      },
    })

    t.list.field('getAvailableBooks', {
      type: 'Book',
      resolve: (parent, args, ctx) => {
        return ctx.prisma.book.findMany({
          where: { status: "IN STORE" },
        })
      },
    })

    t.list.field('filterBooks', {
      type: 'Book',
      args: {
        searchString: stringArg({ nullable: true }),
      },
      resolve: (parent, { searchString }, ctx) => {
        return ctx.prisma.book.findMany({
          where: {
            OR: [
              {
                title: {
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
      type: 'Order',
      nullable: true,
      args: { orderId: intArg({ nullable: false }) },
      resolve: async (parent, { orderId }, ctx) => {
        const order = await ctx.prisma.order.findOne({
          where: {
            id: Number(orderId),
          },
        })
        const userResp = order && await ctx.prisma.user.findOne({
          where: {
            id: Number(order.userId),
          },
        })
        const bookResp = order && await ctx.prisma.book.findOne({
          where: {
            id: Number(order.bookId),
          },
        })

        return {
          id: order && order.id as any,
          book: bookResp && bookResp,
          user: userResp && userResp,
          unitPrice: order && order.unitPrice as any,
          quantity: order && order.quantity as any
        }
      },
    })
  },
})
