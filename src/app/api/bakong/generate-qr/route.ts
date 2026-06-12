import { NextRequest, NextResponse } from 'next/server';
import { sendTelegramMessage } from '@/lib/telegram';

export async function POST(req: NextRequest) {
  try {
    const { amount, currency, orderId, customerName, customerPhone, customerCity } = await req.json();
    const bakongMode = process.env.BAKONG_MODE || 'mock';

    const displayCurrency = currency || 'USD';
    const displayOrderId = orderId || `TEMP-${Date.now()}`;

    await sendTelegramMessage(
      [
        'New KHQR Payment Started',
        `Order Ref: ${displayOrderId}`,
        `Amount: ${amount} ${displayCurrency}`,
        `Customer: ${customerName || 'N/A'}`,
        `Phone: ${customerPhone || 'N/A'}`,
        `City: ${customerCity || 'N/A'}`,
      ].join('\n')
    );

    // In a real application, you would integrate with the Bakong KHQR SDK
    // or call the Bakong OpenAPI endpoint to generate a KHQR string.
    /*
      Example structure based on API docs (khqr.bakong.nbc.gov.kh):
      
      const payload = {
        bakongAccountId: process.env.BAKONG_ACCOUNT_ID, // "merchant@bakong"
        merchantName: "My Store",
        merchantCity: "Phnom Penh",
        amount: amount,
        currency: currency, // "USD" or "KHR"
        billNumber: orderId,
        storeLabel: "Online Store",
        terminalLabel: "Web Checkout"
      };

      const signResponse = await fetch('https://api-bakong.nbc.gov.kh/v1/generate_qr', { ... })
      const md5Hash = signResponse.data.md5;
      const qrString = signResponse.data.qrString;
    */

    // Mock mode: use static merchant KHQR image on frontend to avoid invalid payload scans.
    if (bakongMode !== 'real') {
      return NextResponse.json({
        qrString: null,
        md5Hash: `mock_md5_hash_${displayOrderId}`,
        useStaticKhqrImage: true,
      });
    }

    // Placeholder for real integration. Replace this with Bakong signed request when your account is active.
    return NextResponse.json({
      qrString: null,
      md5Hash: `pending_real_md5_${displayOrderId}`,
      useStaticKhqrImage: true,
    });
  } catch (error) {
    console.error('Failed to generate Bakong KHQR:', error);
    return NextResponse.json(
      { error: 'Failed to generate QR' },
      { status: 500 }
    );
  }
}
