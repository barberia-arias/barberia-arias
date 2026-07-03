// Supabase Edge Function: mp-create-preference
// Crea una preferencia de pago (Checkout Pro) en Mercado Pago para una reserva
// existente, y devuelve la URL a la que hay que redirigir al cliente.
//
// El precio se calcula del lado del servidor (a partir del servicio real en la
// base de datos), nunca se confía en un monto enviado por el cliente.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function respond(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { reservaId, origin } = await req.json();
    if (!reservaId || !origin) {
      return respond({ success: false, error: 'reservaId y origin son requeridos.' });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const mpAccessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');

    if (!mpAccessToken) {
      return respond({ success: false, error: 'Falta configurar MERCADOPAGO_ACCESS_TOKEN en el proyecto.' });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data: reserva, error: reservaError } = await supabase
      .from('reservas')
      .select('id, servicio_id, cliente_nombre, cliente_correo')
      .eq('id', reservaId)
      .single();

    if (reservaError || !reserva) {
      return respond({ success: false, error: 'Reserva no encontrada.' });
    }

    const { data: servicio, error: servicioError } = await supabase
      .from('servicios')
      .select('nombre, precio')
      .eq('id', reserva.servicio_id)
      .single();

    if (servicioError || !servicio) {
      return respond({ success: false, error: 'Servicio no encontrado.' });
    }

    const preferenceBody = {
      items: [
        {
          title: `${servicio.nombre} — Barbería ARIAS`,
          quantity: 1,
          unit_price: Number(servicio.precio),
          currency_id: 'PEN',
        },
      ],
      payer: {
        name: reserva.cliente_nombre || undefined,
        email: reserva.cliente_correo || undefined,
      },
      external_reference: reserva.id,
      back_urls: {
        success: `${origin}/reservar`,
        pending: `${origin}/reservar`,
        failure: `${origin}/reservar`,
      },
      auto_return: 'approved',
      notification_url: `${supabaseUrl}/functions/v1/mp-webhook`,
    };

    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${mpAccessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preferenceBody),
    });

    const mpData = await mpResponse.json();

    if (!mpResponse.ok) {
      return respond({ success: false, error: mpData.message || 'Mercado Pago rechazó la preferencia de pago.' });
    }

    await supabase
      .from('reservas')
      .update({ mp_preference_id: mpData.id, pago_estado: 'pendiente' })
      .eq('id', reserva.id);

    const redirectUrl = mpData.sandbox_init_point || mpData.init_point;

    return respond({ success: true, redirectUrl });
  } catch (err) {
    return respond({ success: false, error: err.message });
  }
});
