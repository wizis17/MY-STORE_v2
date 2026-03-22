import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/admin/products/[id] - Get a single product
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();

    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch product
    const { data: product, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories!category_id(*),
        images:product_images!product_id(*),
        variants:product_variants!product_id(*)
      `)
      .eq('id', params.id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    // Sort images by position
    if (product.images) {
      product.images.sort((a: any, b: any) => a.position - b.position);
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/products/[id] - Update a product
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();

    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();

    // Check if slug is being changed and if it's already taken
    if (body.slug) {
      const { data: existingProduct } = await supabase
        .from('products')
        .select('id')
        .eq('slug', body.slug)
        .neq('id', params.id)
        .single();

      if (existingProduct) {
        return NextResponse.json(
          { error: 'A product with this slug already exists' },
          { status: 400 }
        );
      }
    }

    // Update product
    const { data: product, error: productError } = await supabase
      .from('products')
      .update({
        name: body.name,
        slug: body.slug,
        description: body.description || null,
        category_id: body.category_id,
        price: body.price,
        compare_at_price: body.compare_at_price || null,
        cost_per_item: body.cost_per_item || null,
        sku: body.sku || null,
        barcode: body.barcode || null,
        stock: body.stock || 0,
        track_quantity: body.track_quantity ?? true,
        continue_selling: body.continue_selling ?? false,
        status: body.status || 'draft',
        featured: body.featured ?? false,
        gender: body.gender || null,
      })
      .eq('id', params.id)
      .select()
      .single();

    if (productError) {
      console.error('Product update error:', productError);
      return NextResponse.json(
        { error: productError.message },
        { status: 500 }
      );
    }

    // Update product images
    if (body.images && Array.isArray(body.images)) {
      // Delete existing images
      await supabase
        .from('product_images')
        .delete()
        .eq('product_id', params.id);

      // Insert new images
      if (body.images.length > 0) {
        const imagesToInsert = body.images.map((img: any) => ({
          product_id: params.id,
          image_url: img.image_url,
          position: img.position,
        }));

        const { error: imagesError } = await supabase
          .from('product_images')
          .insert(imagesToInsert);

        if (imagesError) {
          console.error('Images update error:', imagesError);
          // Don't fail the whole request if images fail
        }
      }
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/products/[id] - Delete a product
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();

    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete product (cascade will handle images and variants)
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error('Product deletion error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
