import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/admin/products - List all products (admin view, includes drafts)
export async function GET(request: NextRequest) {
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

    // Fetch all products (including drafts and archived)
    const { data: products, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories!category_id(*),
        images:product_images!product_id(*),
        variants:product_variants!product_id(*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Sort images by position
    const productsWithImages = products?.map((product) => ({
      ...product,
      images: product.images?.sort((a: any, b: any) => a.position - b.position) || [],
    }));

    return NextResponse.json({ products: productsWithImages });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/products - Create a new product
export async function POST(request: NextRequest) {
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

    // Validate required fields
    if (!body.name || !body.slug || !body.category_id || body.price === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: name, slug, category_id, price' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const { data: existingProduct } = await supabase
      .from('products')
      .select('id')
      .eq('slug', body.slug)
      .single();

    if (existingProduct) {
      return NextResponse.json(
        { error: 'A product with this slug already exists' },
        { status: 400 }
      );
    }

    // Create product
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert({
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
        available_sizes: body.available_sizes || [],
        available_colors: body.available_colors || [],
      })
      .select()
      .single();

    if (productError) {
      console.error('Product creation error:', productError);
      return NextResponse.json(
        { error: productError.message },
        { status: 500 }
      );
    }

    // Add product images if provided
    if (body.images && Array.isArray(body.images) && body.images.length > 0) {
      const imagesToInsert = body.images.map((img: any) => ({
        product_id: product.id,
        image_url: img.image_url,
        position: img.position,
      }));

      const { error: imagesError } = await supabase
        .from('product_images')
        .insert(imagesToInsert);

      if (imagesError) {
        console.error('Images creation error:', imagesError);
        // Don't fail the whole request if images fail
      }
    }

    // Note: variant_combinations are stored for reference but can be computed from available_sizes and available_colors
    // They're included in the response for client-side state management
    const productResponse = {
      ...product,
      variant_combinations: body.variant_combinations || [],
    };

    return NextResponse.json({ product: productResponse }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
