import { arg, floatArg, intArg, mutationType, stringArg } from '@nexus/schema'
import { books } from '@prisma/client'
import { compare, hash } from 'bcryptjs'
import { processUpload } from '../upload'
import { createToken, getUserId } from '../utils'

export const Mutation = mutationType({
  definition(t) {
    t.field('createAccount', {
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
            user
          }
        }).catch((err: any) => {
          return {
            errors: {
              path: err.meta && err.meta.target ? err.meta.target[0] : err.meta.details, message: err.message
            }
          }
        });
      },
    })

    t.field('signIn', {
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

    t.field('updateProfile', {
      type: 'UserPayload',
      args: {
        name: stringArg({ nullable: false }),
        email: stringArg({ nullable: false }),
        phone: stringArg()
      },
      resolve: async (_parent, { name, email, phone }, ctx) => {
        const userId = await getUserId(ctx)
        return ctx.prisma.users.update({
          where: {
            id: Number(userId),
          },
          data: {
            name,
            email,
            phone
          },
        }).then(user => {
          return {
            user
          }
        }).catch((err: any) => {
          return {
            errors: {
              path: err.meta && err.meta.target ? err.meta.target[0] : err.meta.details, message: err.message
            }
          }
        });
      }
    })

    t.field('checkPassword', {
      type: 'UserPayload',
      args: {
        password: stringArg({ nullable: false }),
      },
      resolve: async (parent, { password }, ctx) => {
        const userId = getUserId(ctx)

        const user = await ctx.prisma.users.findOne({
          where: {
            id: Number(userId),
          },
        })

        if (!user) {
          return {
            errors: {
              path: "email", message: 'No user found'
            }
          }
        }

        const passwordValid = await compare(password, user && user.password)
        if (!passwordValid) {
          return {
            errors: {
              path: 'password', message: 'Invalid password'
            }
          }
        }

        return {
          user
        }
      },
    })

    t.field('updatePassword', {
      type: 'UserPayload',
      args: {
        password: stringArg({ nullable: false })
      },
      resolve: async (_parent, { password }, ctx) => {
        const userId = await getUserId(ctx)
        const hashedPassword = await hash(password, 10)

        return ctx.prisma.users.update({
          where: {
            id: Number(userId),
          },
          data: {
            password: hashedPassword
          },
        }).then(user => {
          return {
            user
          }
        }).catch((err: any) => {
          return {
            errors: {
              path: err.meta && err.meta.target ? err.meta.target[0] : err.meta.details, message: err.message
            }
          }
        });
      }
    })

    t.field('addAuthor', {
      type: 'AuthorPayload',
      args: {
        name: stringArg({ nullable: false })
      },
      resolve: async (parent, { name }, ctx) => {
        try {
          const author = await ctx.prisma.authors.create({
            data: {
              name
            },
          })

          return {
            author
          }
        } catch (err) {
          console.log('addAuthor err: ', err)
          return {
            errors: {
              path: err.meta && err.meta.target ? err.meta.target[0] : err.meta.details, message: err.message
            }
          }
        }
      },
    })

    t.field('addBook', {
      type: 'BookPayload',
      args: {
        title: stringArg({ nullable: false }),
        authorId: intArg({ nullable: false }),
        isbn: intArg(),
        status: stringArg({ nullable: false }),
        type: stringArg(),
        condition: stringArg({ nullable: false }),
        publishedDate: stringArg(),
        languageId: intArg({ nullable: false }),
        categoryId: intArg({ nullable: false }),
        price: floatArg({ nullable: false }),
        coverFile: arg({ type: 'Upload' }),
        description: stringArg(),
      },
      resolve: async (parent, { authorId, title, isbn, status, type, condition, publishedDate, languageId, categoryId, price, coverFile, description }, ctx) => {
        try {
          const userId = getUserId(ctx)

          const uploadPath = await processUpload(coverFile);
          const cover_url = process.env.SERVER_URL + uploadPath

          const book = await ctx.prisma.books.create({
            data: {
              title, isbn, status, type, condition, published_date: publishedDate, price, cover_url, description,
              authors: { connect: { id: Number(authorId) } },
              languages: { connect: { id: Number(languageId) } },
              categories: { connect: { id: Number(categoryId) } },
              users: { connect: { id: Number(userId) } }
            },
            include: { authors: true, languages: true, categories: true, users: true }
          })

          return {
            book
          }
        } catch (err) {
          console.log('addBook err: ', err)
          return {
            errors: {
              path: err.meta && err.meta.target ? err.meta.target[0] : err.meta.details, message: err.message
            }
          }
        }
      },
    })

    t.field('updateBook', {
      type: 'BookPayload',
      args: {
        bookId: intArg({ nullable: false }),
        title: stringArg(),
        authorId: intArg(),
        isbn: intArg(),
        status: stringArg(),
        type: stringArg(),
        condition: stringArg(),
        publishedDate: stringArg(),
        languageId: intArg(),
        categoryId: intArg(),
        price: floatArg(),
        coverFile: arg({ type: 'Upload' }),
        description: stringArg(),
      },
      resolve: async (parent, { bookId, authorId, title, isbn, status, type, condition, publishedDate, languageId, categoryId, price, coverFile, description }, ctx) => {
        try {
          const data: any = {}

          if (title) {
            data.title = title
          }

          if (isbn) {
            data.isbn = isbn
          }

          if (status) {
            data.status = status
          }

          if (type) {
            data.type = type
          }

          if (condition) {
            data.condition = condition
          }

          if (publishedDate) {
            data.published_date = publishedDate
          }

          if (price) {
            data.price = price
          }

          if (description) {
            data.description = description
          }

          if (!!coverFile) {
            const uploadPath = await processUpload(coverFile);
            data.cover_url = process.env.SERVER_URL + uploadPath
          }

          if (authorId) {
            data.authors = { connect: { id: Number(authorId) } };
          }

          if (languageId) {
            data.languages = { connect: { id: Number(languageId) } };
          }

          if (categoryId) {
            data.categories = { connect: { id: Number(categoryId) } };
          }

          const book = await ctx.prisma.books.update({
            where: {
              id: Number(bookId),
            },
            data,
            include: { authors: true, languages: true, categories: true, users: true }
          })

          return {
            book
          }
        } catch (err) {
          console.log('updateBook err: ', err)
          return {
            errors: {
              path: err.meta && err.meta.target ? err.meta.target[0] : err.meta.details, message: err.message
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
        try {
          const book = await ctx.prisma.books.delete({
            where: {
              id
            }
          })

          return {
            book
          }
        } catch (err) {
          console.log('cancelOrder err: ', err)
          return {
            errors: {
              path: err.meta && err.meta.target ? err.meta.target[0] : err.meta.details, message: err.message
            }
          }
        }
      },
    })

    t.field('createOrder', {
      type: 'OrderPayload',
      nullable: true,
      args: { bookId: intArg({ nullable: false }) },
      resolve: async (parent, { bookId }, ctx) => {
        try {
          const userId = getUserId(ctx)

          const order = await ctx.prisma.orders.create({
            data: {
              order_date: new Date(),
              books: { connect: { id: Number(bookId) } },
              users: { connect: { id: Number(userId) } }
            },
          })

          return {
            order
          }
        } catch (err) {
          console.log('createOrder err: ', err)
          return {
            errors: {
              path: err.meta && err.meta.target ? err.meta.target[0] : err.meta.details, message: err.message
            }
          }
        }
      },
    })

    t.field('cancelOrder', {
      type: 'OrderPayload',
      nullable: true,
      args: { bookId: intArg({ nullable: false }) },
      resolve: async (parent, { bookId }, ctx) => {
        try {
          const userId = getUserId(ctx)

          const order = await ctx.prisma.orders.delete({
            where: {
              user_id_book_id: { book_id: Number(bookId), user_id: Number(userId) },
            },
          })

          return {
            order
          }
        } catch (err) {
          console.log('cancelOrder err: ', err)
          return {
            errors: {
              path: err.meta && err.meta.target ? err.meta.target[0] : err.meta.details, message: err.message
            }
          }
        }
      },
    })

    t.field('createCheckout', {
      type: 'CheckoutPayload',
      nullable: true,
      args: { orderId: intArg({ nullable: false }), bookStatus: stringArg({ nullable: false }), orderStatus: stringArg({ nullable: false }), totalPrice: floatArg({ nullable: false }), returnDate: arg({ type: 'DateTime' }), note: stringArg() },
      resolve: async (parent, { orderId, bookStatus, orderStatus, totalPrice, returnDate, note }, ctx) => {
        try {
          const userId = getUserId(ctx)

          const checkout = await ctx.prisma.checkouts.create({
            data: {
              total_price: totalPrice, checkout_date: new Date(), return_date: returnDate, note,
              orders: { connect: { id: Number(orderId) } },
              users: { connect: { id: Number(userId) } }
            },
          })

          // After checkouts.create is successful update orders
          if (checkout) {
            const order = await ctx.prisma.orders.update({
              where: {
                id: Number(orderId),
              },
              data: {
                status: orderStatus
              }
            })

            // After orders.update is successful update books
            if (order) {
              await ctx.prisma.books.update({
                where: {
                  id: Number(order.book_id),
                },
                data: {
                  status: bookStatus
                },
              })
            }
          }

          return {
            checkout
          }
        } catch (err) {
          console.log('createCheckout err: ', err)
          return {
            errors: {
              path: err.meta && err.meta.target ? err.meta.target[0] : err.meta.details, message: err.message
            }
          }
        }
      },
    })

    t.field('updateCheckout', {
      type: 'CheckoutPayload',
      args: {
        checkoutId: intArg({ nullable: false }),
        bookStatus: stringArg(),
        returnDate: arg({ type: 'DateTime' }),
        totalPrice: floatArg(),
        note: stringArg(),
      },
      resolve: async (parent, { checkoutId, bookStatus, returnDate, totalPrice, note }, ctx) => {
        try {
          const data: any = {}

          if (returnDate) {
            data.return_date = returnDate
          }

          if (totalPrice) {
            data.total_price = totalPrice
          }

          if (note) {
            data.note = note
          }

          const checkout = await ctx.prisma.checkouts.update({
            where: {
              id: Number(checkoutId),
            },
            data,
            include: { orders: true }
          })

          // After orders.update is successful update books
          if (checkout.orders && bookStatus) {
            await ctx.prisma.books.update({
              where: {
                id: Number(checkout.orders.book_id),
              },
              data: {
                status: bookStatus
              },
            })
          }

          return {
            checkout
          }
        } catch (err) {
          console.log('updateCheckout err: ', err)
          return {
            errors: {
              path: err.meta && err.meta.target ? err.meta.target[0] : err.meta.details, message: err.message
            }
          }
        }
      },
    })

  },
})
