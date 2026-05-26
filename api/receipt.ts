import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. Only allow secure POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const {
      customerName,
      customerEmail,
      bookTitle,
      bookPrice,
      taxAmount,
      shippingCost,
      totalAmount,
      paymentMethod,
      invoiceNumber,
      purchaseDate,
      receiptNote
    } = req.body;

    // 2. Validate crucial incoming data
    if (!customerEmail || !bookTitle || !totalAmount) {
      return res.status(400).json({ error: 'Missing customer details, book item, or pricing metrics.' });
    }

    const priceNum = Number(bookPrice) || 0;
    const taxNum = Number(taxAmount) || 0;
    const shippingNum = Number(shippingCost) || 0;
    const totalNum = Number(totalAmount) || 0;

    // 3. Craft a responsive, inline-styled transactional HTML email template
    const emailHtmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Receipt from BookSwap</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #f4f5f7; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; border: 1px solid #e1e4e8; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
          .header { background-color: #4f46e5; padding: 32px 24px; text-align: center; color: #ffffff; }
          .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
          .receipt-meta { padding: 24px; border-bottom: 1px dashed #e2e8f0; background-color: #fafbfb; }
          .meta-grid { display: table; width: 100%; }
          .meta-col { display: table-cell; width: 50%; vertical-align: top; font-size: 13px; color: #4a5568; line-height: 1.6; }
          .meta-col.right { text-align: right; }
          .meta-label { font-weight: 600; color: #1a202c; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; }
          .address-section { padding: 20px 24px; font-size: 13px; border-bottom: 1px solid #f1f5f9; }
          .item-table { width: 100%; border-collapse: collapse; text-align: left; }
          .item-table th { padding: 12px 24px; background-color: #f8fafc; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; border-bottom: 1px solid #e2e8f0; }
          .item-table td { padding: 16px 24px; font-size: 14px; color: #1e293b; border-bottom: 1px solid #f1f5f9; }
          .summary-section { padding: 16px 24px; background-color: #f8fafc; }
          .summary-row { display: table; width: 100%; margin-bottom: 8px; font-size: 14px; color: #475569; }
          .summary-label { display: table-cell; }
          .summary-val { display: table-cell; text-align: right; font-weight: 500; }
          .summary-total { border-top: 2px solid #e2e8f0; padding-top: 12px; margin-top: 12px; font-weight: 700; font-size: 18px; color: #0f172a; }
          .footer { padding: 32px 24px; text-align: center; font-size: 12px; color: #94a3b8; background-color: #fafafa; border-top: 1px solid #f1f5f9; }
          .badge { display: inline-block; padding: 4px 10px; font-size: 11px; font-weight: 700; color: #ffffff; background-color: #10b981; border-radius: 9999px; text-transform: uppercase; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>BookSwap</h1>
            <p>Your payment transaction was successful!</p>
          </div>
          
          <div class="receipt-meta">
            <div class="meta-grid">
              <div class="meta-col">
                <span class="meta-label">INVOICE TO:</span><br>
                <strong>${customerName || 'Valued Customer'}</strong><br>
                ${customerEmail}<br>
              </div>
              <div class="meta-col right">
                <span class="meta-label">INVOICE DETAILS:</span><br>
                <strong>Invoice #:</strong> ${invoiceNumber}<br>
                <strong>Date:</strong> ${purchaseDate}<br>
                <strong>Status:</strong> <span class="badge">Paid</span>
              </div>
            </div>
          </div>

          <div class="address-section">
            <div style="display: table; width: 100%;">
              <div style="display: table-cell; width: 50%;">
                <span class="meta-label">SOLD BY:</span><br>
                <strong>BookSwap Co.</strong><br>
                100 Library Lane, Suite 400<br>
                support@bookswap-psi.vercel.app
              </div>
              <div style="display: table-cell; width: 50%; text-align: right; vertical-align: top;">
                <span class="meta-label">PAYMENT DETAILS:</span><br>
                <strong>Method:</strong> ${paymentMethod || 'Card Payment'}<br>
                Authorized Secure Transaction
              </div>
            </div>
          </div>

          <table class="item-table">
            <thead>
              <tr>
                <th>Description</th>
                <th style="text-align: center; width: 60px;">Qty</th>
                <th style="text-align: right; width: 100px;">Price</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>${bookTitle}</strong><br>
                  <span style="font-size: 12px; color: #64748b;">Eco-friendly Circular Book Swap</span>
                </td>
                <td style="text-align: center;">1</td>
                <td style="text-align: right; font-weight: 600;">$${priceNum.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <div class="summary-section">
            <div class="summary-row">
              <div class="summary-label">Subtotal</div>
              <div class="summary-val">$${priceNum.toFixed(2)}</div>
            </div>
            <div class="summary-row">
              <div class="summary-label">Sales Tax</div>
              <div class="summary-val">$${taxNum.toFixed(2)}</div>
            </div>
            <div class="summary-row">
              <div class="summary-label">Shipping & Handling</div>
              <div class="summary-val">$${shippingNum.toFixed(2)}</div>
            </div>
            <div class="summary-row summary-total">
              <div class="summary-label">Total Amount Paid</div>
              <div class="summary-val">$${totalNum.toFixed(2)}</div>
            </div>
          </div>

          <div class="footer">
            <p style="font-style: italic; color: #475569; margin-bottom: 12px;">"${receiptNote || 'Thank you for supporting sustainable reading!'}"</p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 16px 0;">
            <p>If you have any questions about this receipt, please contact support@bookswap-psi.vercel.app</p>
            <p>&copy; ${new Date().getFullYear()} BookSwap. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // 4. Send email using the Resend API
    // Ensure you add RESEND_API_KEY to your .env file and Vercel environment variables
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'BookSwap <receipts@bookswap-psi.vercel.app>', // Must be from your verified domain
        to: [customerEmail],
        subject: `Your BookSwap Receipt - Invoice #${invoiceNumber}`,
        html: emailHtmlContent
      })
    });

    if (!resendResponse.ok) {
      const errorData = await resendResponse.json();
      throw new Error(`Resend Email Router failure: ${JSON.stringify(errorData)}`);
    }

    return res.status(200).json({ success: true, message: 'Receipt dispatched successfully' });

  } catch (error: any) {
    console.error('Server side error mailing receipt:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}