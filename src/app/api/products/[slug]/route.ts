import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const supabase = await createClient();

    const { data: product, error } = await supabase
      .from('products')
      .select(
        `
        *,
        category:categories!category_id(*),
        images:product_images!product_id(*),
        variants:product_variants!product_id(*)
      `
      )
      .eq('slug', slug)
      .eq('status', 'active')
      .single();

    if (error || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Order images by position
    product.images = product.images?.sort((a, b) => a.position - b.position) || [];

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
