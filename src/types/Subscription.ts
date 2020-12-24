import { subscriptionType } from '@nexus/schema'

export const Subscription = subscriptionType({
  definition(t) {
    t.field('latestOrder', {
      type: 'OrderPayload',
      subscribe(_root, _args, ctx) {
        return ctx.pubsub.asyncIterator('latestOrder')
      },
      resolve(payload) {
        return payload
      }
    })

    t.field('updatedOrder', {
      type: 'OrderPayload',
      subscribe(_root, _args, ctx) {
        return ctx.pubsub.asyncIterator('updatedOrder')
      },
      resolve: async (payload, _args: any, ctx) => {
        return payload.id === _args.orderId && payload
      }
    })

    t.field('latestCheckout', {
      type: 'CheckoutPayload',
      subscribe(_root, _args, ctx) {
        return ctx.pubsub.asyncIterator('latestCheckout')
      },
      resolve: async (payload, _args, ctx) => {
        return payload
      }
    })

    t.field('updatedCheckout', {
      type: 'CheckoutPayload',
      subscribe(_root, _args, ctx) {
        return ctx.pubsub.asyncIterator('updatedCheckout')
      },
      resolve: async (payload, _args: any, ctx) => {
        return payload.id === _args.checkoutId && payload
      }
    })
  }
})