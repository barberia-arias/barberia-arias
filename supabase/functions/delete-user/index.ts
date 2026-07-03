// Supabase Edge Function: delete-user
// Borra por completo una cuenta (Supabase Auth + profile) desde el panel admin.
// Solo un usuario con rol 'admin' puede invocarla. Usa la service_role key,
// que vive únicamente en el entorno del edge function (nunca en el navegador).

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
    const { userId } = await req.json();
    if (!userId) return respond({ success: false, error: 'userId es requerido.' });

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return respond({ success: false, error: 'No autorizado.' });

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    // Cliente con la sesión de quien llama, solo para averiguar quién es.
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: caller }, error: callerError } = await callerClient.auth.getUser();
    if (callerError || !caller) return respond({ success: false, error: 'Sesión inválida.' });

    // Cliente con permisos totales (service_role) para verificar el rol y borrar.
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { data: callerProfile } = await adminClient
      .from('profiles')
      .select('rol')
      .eq('id', caller.id)
      .single();

    if (callerProfile?.rol !== 'admin') {
      return respond({ success: false, error: 'Solo un administrador puede eliminar cuentas.' });
    }

    if (caller.id === userId) {
      return respond({ success: false, error: 'No puedes eliminar tu propia cuenta.' });
    }

    // Desvincular y desactivar el barbero asociado (si existe) en vez de borrarlo,
    // para no romper el historial de reservas/servicios que lo referencian.
    await adminClient
      .from('barberos')
      .update({ usuario_id: null, estado: false })
      .eq('usuario_id', userId);

    // Borra el usuario de Auth. El profile se elimina en cascada (on delete cascade).
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId);
    if (deleteError) return respond({ success: false, error: deleteError.message });

    return respond({ success: true });
  } catch (err) {
    return respond({ success: false, error: err.message });
  }
});
