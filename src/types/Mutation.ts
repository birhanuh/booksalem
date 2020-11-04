import { floatArg, intArg, mutationType, stringArg } from '@nexus/schema'
import { compare, hash } from 'bcryptjs'
import { sign } from 'jsonwebtoken'
import { APP_SECRET, getUserId } from '../utils'

export const Mutation = mutationType({
  definition(t) {
    t.field('signup', {
      type: 'AuthPayload',
      args: {
        name: stringArg(),
        email: stringArg({ nullable: false }),
        password: stringArg({ nullable: false }),
      },
      resolve: async (_parent, { name, email, password }, ctx) => {
        const hashedPassword = await hash(password, 10)
        const user = await ctx.prisma.user.create({
          data: {
            name,
            email,
            password: hashedPassword,
          },
        })
        return {
          token: sign({ userId: user.id }, APP_SECRET),
          user,
        }
      },
    })

    t.field('login', {
      type: 'AuthPayload',
      args: {
        email: stringArg({ nullable: false }),
        password: stringArg({ nullable: false }),
      },
      resolve: async (_parent, { email, password }, ctx) => {
        const user = await ctx.prisma.user.findOne({
          where: {
            email,
          },
        })
        if (!user) {
          throw new Error(`No user found for email: ${email}`)
        }
        const passwordValid = await compare(password, user.password)
        if (!passwordValid) {
          throw new Error('Invalid password')
        }
        return {
          token: sign({ userId: user.id }, APP_SECRET),
          user,
        }
      },
    })

    t.field('addBook', {
      type: 'Book',
      args: {
        title: stringArg({ nullable: false }),
        author: stringArg({ nullable: false }),
        description: stringArg({ nullable: false }),
        ISBN: stringArg({ nullable: false }),
        status: stringArg({ nullable: false }),
        condition: stringArg({ nullable: false }),
        categoryId: intArg({ nullable: false }),
        languageId: intArg({ nullable: false })
      },
      resolve: async (parent, { author, title, description, ISBN, status, condition, categoryId, languageId }, ctx) => {
        const userId = getUserId(ctx)
        if (!userId) throw new Error('Could not authenticate user.')
        const book = await ctx.prisma.book.create({
          data: {
            author, title, description, ISBN, status, condition,
            category: { connect: { id: Number(categoryId) } },
            language: { connect: { id: Number(languageId) } },
            owner: { connect: { id: Number(userId) } },
          },
        })
        const user = await ctx.prisma.user.findOne({
          where: {
            id: Number(userId),
          },
        })
        return {
          author: book.author,
          condition: book.condition,
          description: book.description,
          id: book.id,
          ISBN: book.ISBN,
          rating: book.rating,
          status: book.status,
          title: book.title,
          owner: user
        }
      },
    })

    t.field('deleteBook', {
      type: 'Book',
      nullable: true,
      args: { id: intArg({ nullable: false }) },
      resolve: (parent, { id }, ctx) => {
        return ctx.prisma.book.delete({
          where: {
            id,
          },
        })
      },
    })

    t.field('createCheckout', {
      type: 'Checkout',
      nullable: true,
      args: { orderId: intArg({ nullable: false }), totalPrice: floatArg({ nullable: false }), status: stringArg({ nullable: false }), },
      resolve: async (parent, { orderId, totalPrice, status }, ctx) => {
        const userId = getUserId(ctx)
        if (!userId) throw new Error('Could not authenticate user.')
        const checkout = await ctx.prisma.checkout.create({
          data: {
            totalPrice, status, orders: { connect: { id: Number(orderId) } },
            ownerCheck: { connect: { id: Number(userId) } }
          },
        })
        const userResp = await ctx.prisma.user.findOne({
          where: {
            id: Number(checkout.userId),
          },
        })
        const ownerResp = await ctx.prisma.user.findOne({
          where: {
            id: Number(userId),
          },
        })
        return {
          id: checkout.id,
          status: checkout.status,
          totalPrice: checkout.totalPrice,
          user: userResp as any,
          owner: ownerResp as any
        }
      },
    })

    t.field('createOrder', {
      type: 'Order',
      nullable: true,
      args: { bookId: intArg({ nullable: false }), unitPrice: floatArg({ nullable: false }), quantity: intArg({ nullable: false }), },
      resolve: async (parent, { bookId, unitPrice, quantity }, ctx) => {
        const userId = getUserId(ctx)

        const order = await ctx.prisma.order.create({
          data: {
            unitPrice,
            quantity,
            book: { connect: { id: Number(bookId) } },
            user: { connect: { id: Number(userId) } },
          },
        })
        const user = await ctx.prisma.user.findOne({
          where: {
            id: Number(userId),
          },
        })
        const book = await ctx.prisma.book.findOne({
          where: {
            id: Number(bookId),
          },
        })

        return {
          id: order.id,
          unitPrice: order.unitPrice,
          quantity: order.quantity,
          book,
          user
        }
      },
    })
  },
})
