/* eslint-env node */
/* global process */

/**
 * Netlify Function: create-checkout-session
 *
 * Crea una sesión de checkout en Stripe para planes Pro/Lifetime.
 * Requiere JWT válido de Supabase en Authorization header.
 *
 * Env vars necesarias:
 *   STRIPE_SECRET_KEY
 *   STRIPE_PRICE_PRO_MONTHLY
 *   STRIPE_PRICE_PRO_YEARLY
 *   STRIPE_PRICE_LIFETIME
 *   SUPABASE_URL
 *   SUPABASE_ANON_KEY
 *   URL  (Netlify lo inyecta automáticamente con el dominio del sitio)
 */

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

async function authenticateUser(event, supabaseUrl, supabaseAnonKey) {
  const authHeader = event.headers.authorization || event.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('missing_auth');
  }
  const token = authHeader.slice('Bearer '.length).trim();
  if (!token) throw new Error('missing_auth');

  const authClient = createClient(supabaseUrl, supabaseAnonKey);
  const { data, error } = await authClient.auth.getUser(token);
  if (error || !data?.user?.id) throw new Error('invalid_auth');

  return data.user;
}

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Método no permitido' }) };
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
  const siteUrl = process.env.URL || 'http://localhost:8888';

  if (!stripeSecretKey || !supabaseUrl || !supabaseAnonKey) {
    console.error('[create-checkout-session] Variables de entorno faltantes');
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Servicio temporalmente no disponible' }),
    };
  }

  let user;
  try {
    user = await authenticateUser(event, supabaseUrl, supabaseAnonKey);
  } catch {
    return { statusCode: 401, body: JSON.stringify({ error: 'No autorizado' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'JSON inválido' }) };
  }

  const { planId, billingCycle } = body;

  // Mapear planId + billingCycle → precio en Stripe y tipo de cobro
  let priceId;
  let mode;
  let planType;

  if (planId === 'pro' && billingCycle === 'monthly') {
    priceId = process.env.STRIPE_PRICE_PRO_MONTHLY;
    mode = 'subscription';
    planType = 'pro_monthly';
  } else if (planId === 'pro' && billingCycle === 'yearly') {
    priceId = process.env.STRIPE_PRICE_PRO_YEARLY;
    mode = 'subscription';
    planType = 'pro_yearly';
  } else if (planId === 'lifetime') {
    priceId = process.env.STRIPE_PRICE_LIFETIME;
    mode = 'payment';
    planType = 'lifetime';
  } else {
    return { statusCode: 400, body: JSON.stringify({ error: 'Plan inválido' }) };
  }

  if (!priceId) {
    console.error(`[create-checkout-session] Price ID no configurado para planType=${planType}`);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Este plan no está disponible aún. Contáctanos.' }),
    };
  }

  const stripe = new Stripe(stripeSecretKey);

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode,
      success_url: `${siteUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/?cancelled=true`,
      customer_email: user.email,
      // userId y planType viajan en metadata para que el webhook pueda
      // actualizar Supabase al confirmar el pago.
      metadata: {
        userId: user.id,
        planType,
      },
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: session.id, url: session.url }),
    };
  } catch (error) {
    console.error('[create-checkout-session] Stripe error:', error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'No se pudo crear la sesión de pago' }),
    };
  }
};
