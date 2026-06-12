import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { sendTelegramMessage } from '@/lib/telegram';

// Use the Service Role Key to bypass RLS so guests can create orders
const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, customerInfo, paymentStatus, total } = body;

    // 1. Create the Order
    // Note: If you want guests to checkout, you MUST run this SQL in your Supabase SQL Editor:
    // ALTER TABLE orders ALTER COLUMN user_id DROP NOT NULL;
    
    // Create a random order number
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_name: customerInfo.fullName,
        customer_phone: customerInfo.phone,
        delivery_address: `${customerInfo.address}, ${customerInfo.city}`,
        subtotal: total,
        total: total,
        status: 'pending',
        payment_status: paymentStatus || 'paid', 
        payment_method: 'bakong',
      })
      .select()
      .single();

    if (orderError) {
      console.error('Failed to insert order:', orderError);
      return NextResponse.json({ error: 'Failed to create order', details: orderError }, { status: 500 });
    }

    // 2. Create the Order Items
    const orderItemsToInsert = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.product.id,
      variant_id: item.variant?.id || null,
      product_name: item.product.name,
      product_slug: item.product.slug,
      variant_size: item.variant?.size || null,
      variant_color: item.variant?.color || null,
      quantity: item.quantity,
      price: item.price,
      subtotal: item.price * item.quantity,
    }));

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItemsToInsert);

    if (itemsError) {
      console.error('Failed to insert order items:', itemsError);
      return NextResponse.json({ error: 'Failed to create order items', details: itemsError }, { status: 500 });
    }

    if ((paymentStatus || 'paid') === 'paid') {
      await sendTelegramMessage(
        [
          '🔔 PAYMENT CONFIRMED (Verify ABA/Bakong)',
          `Order: ${order.order_number}`,
          `Amount: ${total} USD`,
          `Customer: ${customerInfo.fullName}`,
          `Phone: ${customerInfo.phone}`,
          `Address: ${customerInfo.address}, ${customerInfo.city}`,
          `Items: ${items.length}`,
          'ℹ️ Customer clicked "I Already Paid". Please check your ABA/Bakong app notification to verify.',
        ].join('\n')
      );
    }

    return NextResponse.json({ success: true, orderId: order.id, orderNumber });

  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while saving the order' },
      { status: 500 }
    );
  }
}
