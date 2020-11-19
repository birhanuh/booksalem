import { arg, floatArg, intArg, mutationType, stringArg } from '@nexus/schema'
import { compare, hash } from 'bcryptjs'
import { or } from 'graphql-shield'
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
              path: err.meta && err.meta.target[0], message: err.message
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
              path: err.meta && err.meta.target[0], message: err.message
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
        return ctx.prisma.users.update({
          where: {
            id: Number(userId),
          },
          data: {
            password
          },
        }).then(user => {
          return {
            user
          }
        }).catch((err: any) => {
          return {
            errors: {
              path: err.meta && err.meta.target[0], message: err.message
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
            author: author
          }
        } catch (err) {
          console.log('addAuthor err: ', err)
          return {
            errors: {
              path: err.meta && err.meta.target[0], message: err.message
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
        condition: stringArg({ nullable: false }),
        published_date: stringArg(),
        languageId: intArg({ nullable: false }),
        categoryId: intArg({ nullable: false }),
        price: floatArg({ nullable: false }),
        coverFile: arg({ type: 'Upload' }),
        description: stringArg(),
      },
      resolve: async (parent, { authorId, title, isbn, status, condition, published_date, languageId, categoryId, price, coverFile, description }, ctx) => {
        try {
          const userId = getUserId(ctx)

          const uploadPath = await processUpload(coverFile);
          const cover_url = process.env.SERVER_URL + uploadPath

          const book = await ctx.prisma.books.create({
            data: {
              title, isbn, status, condition, published_date, price, cover_url, description,
              authors: { connect: { id: Number(authorId) } },
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
              path: err.meta && err.meta.target[0], message: err.message
            }
          }
        }
      },
    })

    t.field('updateBook', {
      type: 'BookPayload',
      args: {
        bookId: intArg({ nullable: false }),
        title: stringArg({ nullable: false }),
        authorId: intArg(),
        isbn: intArg(),
        status: stringArg({ nullable: false }),
        condition: stringArg({ nullable: false }),
        published_date: stringArg(),
        languageId: intArg(),
        categoryId: intArg(),
        price: floatArg({ nullable: false }),
        coverFile: arg({ type: 'Upload' }),
        description: stringArg(),
      },
      resolve: async (parent, { bookId, authorId, title, isbn, status, condition, published_date, languageId, categoryId, price, coverFile, description }, ctx) => {
        try {
          const userId = getUserId(ctx)

          let cover_url
          console.log('FF: ', bookId, authorId, title, isbn, coverFile)
          if (coverFile.Writable) {
            const uploadPath = await processUpload(coverFile);
            cover_url = process.env.SERVER_URL + uploadPath
          } else {
            const book = await ctx.prisma.books.findOne({
              where: {
                id: Number(bookId),
              },
            })
            cover_url = book && book.cover_url;
          }

          const book = await ctx.prisma.books.update({
            where: {
              id: Number(bookId),
            },
            data: {
              title, isbn, status, condition, published_date, price, cover_url, description,
              authors: { connect: { id: Number(authorId) } },
              languages: { connect: { id: Number(languageId) } },
              categories: { connect: { id: Number(categoryId) } },
              users: { connect: { id: Number(userId) } }
            },
          })

          return {
            book
          }
        } catch (err) {
          console.log('updateBook err: ', err)
          return {
            errors: {
              path: err.meta && err.meta.target[0], message: err.message
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
      args: { orderId: intArg({ nullable: false }), price: floatArg({ nullable: false }), type: stringArg({ nullable: false }) },
      resolve: async (parent, { orderId, price, type }, ctx) => {
        const userId = getUserId(ctx)
        const checkout = await ctx.prisma.checkouts.create({
          data: {
            price, type, checkout_date: new Date(), orders: { connect: { id: Number(orderId) } },
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
          type: checkout.type,
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
            order_date: new Date(),
            books: { connect: { id: Number(bookId) } },
            users: { connect: { id: Number(userId) } }
          },
        })

        return order
      },
    })
  },
})
