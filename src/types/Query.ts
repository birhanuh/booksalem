import { intArg, queryType, stringArg } from '@nexus/schema'
import { compare } from 'bcryptjs'
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
      resolve: async (parent, args, ctx) => {
        return ctx.prisma.$queryRaw`SELECT books.*, languages.language, categories.category FROM books LEFT JOIN languages
        ON books.language_id = languages.id LEFT JOIN categories
        ON books.category_id = categories.id WHERE books.status = 'available';`
      },
    })

    t.field('getBook', {
      type: 'BookPayload',
      nullable: true,
      args: {
        id: intArg({ nullable: false }),
      },
      resolve: async (parent, { id }, ctx) => {
        const book = await ctx.prisma.$queryRaw`SELECT books.*, languages.language, categories.category FROM books LEFT JOIN languages
          ON books.language_id = languages.id LEFT JOIN categories
          ON books.category_id = categories.id WHERE books.id = ${Number(id)};`.then(res => res[0])

        const bookStructured = {
          ...book, language: { id: book.language_id, language: book.language }, category: { id: book.category_id, category: book.category }
        }

        return {
          book: bookStructured
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
        return ctx.prisma.$queryRaw`SELECT * FROM books LEFT JOIN languages
        ON books.language_id = languages.id LEFT JOIN categories
        ON books.category_id = categories.id WHERE books.title ILIKE ${searchString} OR books.author ILIKE ${searchString} OR books.description ILIKE ${searchString};`
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
