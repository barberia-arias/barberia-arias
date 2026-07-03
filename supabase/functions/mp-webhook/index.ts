// Supabase Edge Function: mp-webhook
// Recibe las notificaciones (IPN/webhooks) de Mercado Pago cuando cambia el
// estado de un pago. Nunca confía en el cuerpo de la notificación en sí —
// siempre vuelve a consultar el pago real en la API de Mercado Pago con el
// Access Token antes de actualizar la reserva.
//
// Esta función se despliega SIN verificación de JWT (ver supabase/config.toml),
// porque la llama Mercado Pago directamente, no nuestro frontend.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

function ok() {
  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

const ESTADO_POR_STATUS = {
  approved: 'pagado',
  rejected: 'rechazado',
  cancelled: 'rechazado',
  refunded: 'rechazado',
  charged_back: 'rechazado',
  pending: 'pendiente',
  in_process: 'pendiente',
  in_mediation: 'pendiente',
};

Deno.serve(async (req) => {
  // Mercado Pago espera una respuesta 200 rápida. Cualquier problema se loguea
  // pero igual respondemos OK para evitar reintentos infinitos por errores
  // que no se van a resolver solos.
  try {
    const url = new URL(req.url);
    let paymentId = url.searchParams.get('data.id') || url.searchParams.get('id');

    if (!paymentId && req.method === 'POST') {
      try {
        const body = await req.json();
        paymentId = body?.data?.id || body?.id || null;
      } catch {
        // cuerpo vacío o no-JSON, ignorar
      }
    }

    const type = url.searchParams.get('type') || url.searchParams.get('topic');
    if (!paymentId || (type && type !== 'payment')) {
      return ok();
    }

    const mpAccessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    const paymentRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${mpAccessToken}` },
    });
    if (!paymentRes.ok) {
      console.error('No se pudo consultar el pago en Mercado Pago', paymentId);
      return ok();
    }
    const payment = await paymentRes.json();

    const reservaId = payment.external_reference;
    if (!reservaId) return ok();

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const pagoEstado = ESTADO_POR_STATUS[payment.status] || 'pendiente';

    const updates = {
      pago_estado: pagoEstado,
      pago_monto: payment.transaction_amount,
      mp_payment_id: String(payment.id),
    };

    // Solo confirmamos la reserva automáticamente si sigue pendiente
    // (evita reactivar una reserva que el admin ya canceló manualmente).
    if (pagoEstado === 'pagado') {
      const { data: reserva } = await supabase
        .from('reservas')
        .select('estado')
        .eq('id', reservaId)
        .single();
      if (reserva?.estado === 'pendiente') {
        updates.estado = 'confirmada';
      }
    }

    await supabase.from('reservas').update(updates).eq('id', reservaId);

    return ok();
  } catch (err) {
    console.error('Error en mp-webhook:', err.message);
    return ok();
  }
});
