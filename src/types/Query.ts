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
        return ctx.prisma.$queryRaw`SELECT books.*, languages.language, categories.category, authors.author FROM books LEFT JOIN languages
        ON books.language_id = languages.id LEFT JOIN authors ON books.author_id = authors.id
        LEFT JOIN categories ON books.category_id = categories.id WHERE books.status = 'available';`
      },
    })

    t.field('getBook', {
      type: 'BookPayload',
      nullable: true,
      args: {
        id: intArg({ nullable: false }),
      },
      resolve: async (parent, { id }, ctx) => {
        const book = await ctx.prisma.$queryRaw`SELECT books.*, languages.language, categories.category, authors.author FROM books LEFT JOIN languages
          ON books.language_id = languages.id LEFT JOIN authors ON books.author_id = authors.id
          LEFT JOIN categories ON books.category_id = categories.id WHERE books.id = ${Number(id)};`.then(res => res[0])

        const bookStructured = {
          ...book, language: { id: book.language_id, language: book.language }, category: { id: book.category_id, category: book.category }, author: { id: book.author_id, author: book.author }
        }

        return {
          book: bookStructured
        }

      },
    })

    t.list.field('getAuthors', {
      type: 'authors',
      resolve: (parent, args, ctx) => {
        return ctx.prisma.authors.findMany();
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
        ON books.language_id = languages.id LEFT JOIN categories ON books.author_id = authors.id LEFT JOIN authors
        ON books.category_id = categories.id WHERE books.title ILIKE ${searchString} OR books.author ILIKE ${searchString} OR books.description ILIKE ${searchString};`
      },
    })

    t.field('getOrder', {
      type: 'orders',
      nullable: true,
      args: { orderId: intArg({ nullable: false }) },
      resolve: (parent, { orderId }, ctx) => {
        return ctx.prisma.orders.findOne({
          where: {
            id: Number(orderId),
          }
        })
      },
    })

    t.list.field('getOrders', {
      type: 'orders',
      nullable: true,
      resolve: async (parent, args, ctx) => {
        const userId = getUserId(ctx)

        const user = await ctx.prisma.users.findOne({
          where: {
            id: Number(userId)
          }
        })

        if (user && user.is_admin) {
          return ctx.prisma.orders.findMany()
        }

        return ctx.prisma.orders.findMany({
          where: {
            user_id: Number(userId)
          }
        })
      },
    })
  },
})
