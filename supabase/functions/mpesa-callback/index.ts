import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const url = new URL(req.url);
  const userId = url.searchParams.get('userId');
  const body = await req.json();
  const { ResultCode, CallbackMetadata } = body.Body.stkCallback;

  if (ResultCode === 0 && userId) {
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const amount = CallbackMetadata.Item.find((i: any) => i.Name === 'Amount').Value;

    // Logic: 1 KSH = 1 Token (adjust if needed)
    const { data } = await supabase.from('user_tokens').select('token_balance').eq('user_id', userId).single();
    await supabase.from('user_tokens').update({ 
      token_balance: (data?.token_balance || 0) + amount 
    }).eq('user_id', userId);
  }

  return new Response(JSON.stringify({ ResultCode: 0 }), { headers: { 'Content-Type': 'application/json' } });
});