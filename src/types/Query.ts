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
      resolve: async (parent, args, ctx) =>
        ctx.prisma.books.findMany({
          include: {
            authors: true,
            categories: true,
            languages: true,
            users: true
          },
          orderBy: {
            created_at: "desc",
          }
        })
    })

    t.field('getBook', {
      type: 'books',
      nullable: true,
      args: {
        id: intArg({ nullable: false }),
      },
      resolve: async (parent, { id }, ctx) =>
        ctx.prisma.books.findOne({
          where: {
            id: Number(id),
          },
          include: {
            authors: true,
            categories: true,
            languages: true,
            users: true
          }
        })
    })

    t.list.field('getAuthors', {
      type: 'authors',
      resolve: (parent, args, ctx) => {
        return ctx.prisma.authors.findMany({
          orderBy: {
            created_at: "desc",
          }
        });
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

    t.field('getOrderById', {
      type: 'orders',
      nullable: true,
      args: { id: intArg({ nullable: false }) },
      resolve: (parent, { id }, ctx) => {
        return ctx.prisma.orders.findOne({
          where: {
            id: Number(id),
          }
        })
      },
    })

    t.list.field('getUsersOrders', {
      type: 'orders',
      nullable: true,
      resolve: async (parent, args, ctx) => {
        const userId = await getUserId(ctx)

        return ctx.prisma.orders.findMany({
          where: {
            user_id: Number(userId)
          }
        })
      },
    })

    t.list.field('getUsersOrdersAdmin', {
      type: 'users',
      nullable: true,
      resolve: async (parent, args, ctx) =>
        ctx.prisma.users.findMany({
          include: {
            orders: {
              select: {
                user_id: true, // Pick users where their id is found inside orders table
              }
            }
          }
        })
    })

    t.field('getUserOrdersAdmin', {
      type: 'users',
      args: { userId: intArg({ nullable: false }) },
      resolve: async (parent, { userId }, ctx) =>
        ctx.prisma.users.findOne({
          where: {
            id: Number(userId)
          },
          include: {
            orders: {
              select: {
                user_id: true, // Pick users where their id is found inside orders table              
              }
            }
          }
        })
    })
  }
})
