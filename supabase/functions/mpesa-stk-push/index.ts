import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { amount, phoneNumber, userId } = await req.json();
    
    // 1. Get OAuth Token
    const auth = btoa(`${Deno.env.get('MPESA_CONSUMER_KEY')}:${Deno.env.get('MPESA_CONSUMER_SECRET')}`);
    const tokenRes = await fetch("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
      headers: { Authorization: `Basic ${auth}` }
    });
    const { access_token } = await tokenRes.json();

    // 2. Setup Request
    const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
    const password = btoa(`${Deno.env.get('MPESA_SHORTCODE')}${Deno.env.get('MPESA_PASSKEY')}${timestamp}`);

    const stkRes = await fetch("https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest", {
      method: 'POST',
      headers: { Authorization: `Bearer ${access_token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        BusinessShortCode: Deno.env.get('MPESA_SHORTCODE'),
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: amount,
        PartyA: phoneNumber,
        PartyB: Deno.env.get('MPESA_SHORTCODE'),
        PhoneNumber: phoneNumber,
        CallBackURL: `${Deno.env.get('SUPABASE_URL')}/functions/v1/mpesa-callback?userId=${userId}`,
        AccountReference: "BookSwap",
        TransactionDesc: "Token Purchase"
      })
    });

    const data = await stkRes.json();
    return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }
});