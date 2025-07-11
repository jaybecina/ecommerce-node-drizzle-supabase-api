import { Request, Response } from 'express';
import {
  getPublishableKey,
  createPaymentIntentService,
  handleWebhookEvent,
} from '../services/stripeService.js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function getKeys(req: Request, res: Response) {
  try {
    const keys = await getPublishableKey();
    res.json(keys);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve keys' });
  }
}

export async function createPaymentIntent(req: Request, res: Response) {
  try {
    const { orderId } = req.body;

    if (!req.user?.id || !req.user?.email) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const result = await createPaymentIntentService(orderId, {
      id: Number(req.user.id),
      email: req.user.email,
    });
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: (error as Error).message || 'Failed to create payment intent' });
  }
}

export async function webhook(req: Request, res: Response) {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody!, sig!, process.env.STRIPE_ENDPOINT_SECRET!);
    await handleWebhookEvent(event);
    res.json({ received: true });
  } catch (err) {
    console.error(err);
    res.status(400).send(`Webhook Error: ${(err as Error).message}`);
  }
}
