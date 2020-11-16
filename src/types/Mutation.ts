import { arg, floatArg, intArg, mutationType, stringArg } from '@nexus/schema'
import { compare, hash } from 'bcryptjs'
import { processUpload } from '../upload'
import { createToken, getUserId } from '../utils'

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
            phone
          },
        }).then(user => {
          return {
            token: createToken(user.id),
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
          return {
            errors: {
              path: "email", message: `No user found for email: ${email}`
            }
          }
        }
        const passwordValid = await compare(password, user.password)
        if (!passwordValid) {
          return {
            errors: {
              path: 'password', message: 'Invalid password'
            }
          }
        }
        return {
          token: createToken(user.id),
          user,
        }
      },
    })

    t.field('addBook', {
      type: 'BookPayload',
      args: {
        title: stringArg({ nullable: false }),
        author: stringArg({ nullable: false }),
        isbn: intArg(),
        status: stringArg({ nullable: false }),
        condition: stringArg({ nullable: false }),
        published_date: stringArg(),
        languageId: intArg({ nullable: false }),
        categoryId: intArg({ nullable: false }),
        price: floatArg({ nullable: false }),
        coverFile: arg({ type: 'Upload' }),
        description: stringArg(),
      },
      resolve: async (parent, { author, title, isbn, status, condition, published_date, languageId, categoryId, price, coverFile, description }, ctx) => {
        try {
          const userId = getUserId(ctx)

          const uploadPath = await processUpload(coverFile);
          const cover_url = process.env.SERVER_URL + uploadPath

          const book = await ctx.prisma.books.create({
            data: {
              author, title, isbn, status, condition, published_date, price, cover_url, description,
              languages: { connect: { id: Number(languageId) } },
              categories: { connect: { id: Number(categoryId) } },
              users: { connect: { id: Number(userId) } }
            },
          })

          return {
            book
          }
        } catch (err) {
          console.log('addBook err: ', err)
          return {
            errors: {
              path: err.meta.target[0], message: err.message
            }
          }
        }
      },
    })

    t.field('deleteBook', {
      type: 'BookPayload',
      nullable: true,
      args: { id: intArg({ nullable: false }) },
      resolve: async (parent, { id }, ctx) => {
        const book = await ctx.prisma.books.delete({
          where: {
            id,
          },
        })

        return {
          book
        }
      },
    })

    t.field('createCheckout', {
      type: 'checkouts',
      nullable: true,
      args: { orderId: intArg({ nullable: false }), price: floatArg({ nullable: false }), checkout_type: stringArg({ nullable: false }) },
      resolve: async (parent, { orderId, price, checkout_type }, ctx) => {
        const userId = getUserId(ctx)
        const checkout = await ctx.prisma.checkouts.create({
          data: {
            price, checkout_type, checkout_date: new Date(), orders: { connect: { id: Number(orderId) } },
            users: { connect: { id: Number(userId) } }
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
            users: { connect: { id: Number(userId) } }
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
