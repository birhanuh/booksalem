import { floatArg, intArg, mutationType, stringArg } from '@nexus/schema'
import { PrismaClientKnownRequestError, PrismaClientValidationError } from '@prisma/client'
import { compare, hash } from 'bcryptjs'
import { sign } from 'jsonwebtoken'
import { APP_SECRET, getUserId } from '../utils'

export const Mutation = mutationType({
  definition(t) {
    t.field('signup', {
      type: 'AuthPayload',
      args: {
        name: stringArg({ nullable: false }),
        email: stringArg({ nullable: false }),
        password: stringArg({ nullable: false }),
        phone: stringArg()
      },
      resolve: async (_parent, { name, email, password, phone }, ctx) => {
        const hashedPassword = await hash(password, 10)
        return ctx.prisma.users.create({
          data: {
            name,
            email,
            password: hashedPassword,
            phone,
            created_on: new Date(),
            updated_on: new Date()
          },
        }).then(user => {
          return {
            token: sign({ userId: user.id }, APP_SECRET),
            user,
          }
        }).catch((err: any) => {
          return {
            errors: {
              path: err.meta.target[0], message: err.message
            }
          }
        });
      },
    })

    t.field('login', {
      type: 'AuthPayload',
      args: {
        email: stringArg({ nullable: false }),
        password: stringArg({ nullable: false }),
      },
      resolve: async (_parent, { email, password }, ctx) => {
        const user = await ctx.prisma.users.findOne({
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
      type: 'books',
      args: {
        title: stringArg({ nullable: false }),
        author: stringArg({ nullable: false }),
        description: stringArg(),
        isbn: intArg(),
        status: stringArg({ nullable: false }),
        language: stringArg({ nullable: false }),
        condition: stringArg({ nullable: false }),
        price: floatArg({ nullable: false }),
        published_date: stringArg({ nullable: false }),
        rating: intArg(),
        categoryId: intArg({ nullable: false }),
      },
      resolve: async (parent, { author, title, description, isbn, language, status, condition, rating, published_date, price, categoryId }, ctx) => {
        const userId = getUserId(ctx)
        if (!userId) throw new Error('Could not authenticate users.')
        const book = await ctx.prisma.books.create({
          data: {
            author, title, description, isbn, language, status, condition, rating, price, published_date,
            categories: { connect: { id: Number(categoryId) } },
            users: { connect: { id: Number(userId) } },
            created_on: new Date(),
            updated_on: new Date()
          },
        })
        const categories = await ctx.prisma.categories.findOne({
          where: {
            id: Number(book.category_id),
          },
        })
        return {
          id: book.id,
          author: book.author,
          condition: book.condition,
          description: book.description,
          isbn: book.isbn,
          language: book.language,
          rating: book.rating,
          status: book.status,
          title: book.title,
          price: book.price,
          published_date: book.published_date
        }
      },
    })

    t.field('deleteBook', {
      type: 'books',
      nullable: true,
      args: { id: intArg({ nullable: false }) },
      resolve: (parent, { id }, ctx) => {
        return ctx.prisma.books.delete({
          where: {
            id,
          },
        })
      },
    })

    t.field('createCheckout', {
      type: 'checkouts',
      nullable: true,
      args: { orderId: intArg({ nullable: false }), price: floatArg({ nullable: false }), checkout_type: stringArg({ nullable: false }) },
      resolve: async (parent, { orderId, price, checkout_type }, ctx) => {
        const userId = getUserId(ctx)
        if (!userId) throw new Error('Could not authenticate users.')
        const checkout = await ctx.prisma.checkouts.create({
          data: {
            price, checkout_type, checkout_date: new Date(), orders: { connect: { id: Number(orderId) } },
            users: { connect: { id: Number(userId) } },
            created_on: new Date(),
            updated_on: new Date()
          },
        })
        const order = await ctx.prisma.orders.findOne({
          where: {
            id: Number(checkout.order_id),
          },
        })
        const user = await ctx.prisma.users.findOne({
          where: {
            id: Number(userId),
          },
        })
        return {
          id: checkout.id,
          price: checkout.price,
          checkout_type: checkout.checkout_type,
          checkout_date: checkout.checkout_date,
          user,
          order
        }
      },
    })

    t.field('createOrder', {
      type: 'orders',
      nullable: true,
      args: { bookId: intArg({ nullable: false }) },
      resolve: async (parent, { bookId }, ctx) => {
        const userId = getUserId(ctx)

        const order = await ctx.prisma.orders.create({
          data: {
            books: { connect: { id: Number(bookId) } },
            users: { connect: { id: Number(userId) } },
            created_on: new Date(),
            updated_on: new Date()
          },
        })
        const user = await ctx.prisma.users.findOne({
          where: {
            id: Number(userId),
          },
        })
        const book = await ctx.prisma.books.findOne({
          where: {
            id: Number(bookId),
          },
        })

        return {
          id: order.id,
          book,
          user
        }
      },
    })
  },
})
