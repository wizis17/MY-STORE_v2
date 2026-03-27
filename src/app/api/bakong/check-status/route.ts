import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const md5Hash = searchParams.get('md5Hash');

  if (!md5Hash) {
    return NextResponse.json({ error: 'md5Hash is required' }, { status: 400 });
  }

  // According to Bakong API documentation, you check transaction status using the hash:
  /*
    const response = await fetch('https://api-bakong.nbc.gov.kh/v1/check_transaction_by_md5', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.BAKONG_JWT_TOKEN}`
      },
      body: JSON.stringify({ md5: md5Hash })
    });
    const data = await response.json();
    return NextResponse.json({ status: data.responseCode === 0 ? 'paid' : 'pending' });
  */

  // Simulated logic for testing:
  // Set this to `true` if you want to test the success screen. 
  // Right now, it's manually set to `false` so it won't auto-confirm before you pay.
  const isPaid = false; 

  if (isPaid) {
    return NextResponse.json({ 
      status: 'paid', 
      message: 'Payment confirmed via Bakong Open API' 
    });
  }

  return NextResponse.json({ 
    status: 'pending', 
    message: 'Waiting for Bakong payment confirmation' 
  });
}
