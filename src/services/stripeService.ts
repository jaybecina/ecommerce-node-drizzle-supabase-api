import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { orderItemsTable, ordersTable } from '../db/ordersSchema.js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function getPublishableKey() {
  return { publishableKey: process.env.STRIPE_PUBLISHABLE_KEY };
}

export async function createPaymentIntentService(
  orderId: number,
  user: { id: number; email: string },
) {
  // Validate order exists and belongs to the user
  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, orderId));

  if (!order) {
    throw new Error('Order not found');
  }

  if (order.userId !== user.id) {
    throw new Error('Not authorized to pay for this order');
  }

  const orderItems = await db
    .select()
    .from(orderItemsTable)
    .where(eq(orderItemsTable.orderId, orderId));

  // Calculate total sum of orderItems price * quantity
  const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const amount = Math.floor(total * 100);

  if (amount === 0) {
    throw new Error('Order total is 0');
  }

  const customer = await stripe.customers.create({
    email: user.email,
    metadata: {
      userId: String(user.id),
    },
  });

  const ephemeralKey = await stripe.ephemeralKeys.create(
    { customer: customer.id },
    { apiVersion: '2023-10-16' },
  );

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: 'usd',
    customer: customer.id,
    metadata: {
      orderId: String(orderId),
      userId: String(user.id),
    },
  });

  // Store paymentIntent.id in order database
  await db
    .update(ordersTable)
    .set({ stripePaymentIntentId: paymentIntent.id })
    .where(eq(ordersTable.id, orderId));

  return {
    paymentIntent: paymentIntent.client_secret,
    ephemeralKey: ephemeralKey.secret,
    customer: customer.id,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  };
}

export async function handleWebhookEvent(event: Stripe.Event) {
  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await db
        .update(ordersTable)
        .set({ status: 'payed' })
        .where(eq(ordersTable.stripePaymentIntentId, paymentIntent.id));
      break;
    }
    case 'payment_intent.payment_failed': {
      const paymentIntentFailed = event.data.object as Stripe.PaymentIntent;
      await db
        .update(ordersTable)
        .set({ status: 'payment_failed' })
        .where(eq(ordersTable.stripePaymentIntentId, paymentIntentFailed.id));
      break;
    }
    case 'payment_method.attached': {
      // Handle payment method attachment if needed
      break;
    }
    default: {
      console.log(`Unhandled event type ${event.type}`);
    }
  }
}
