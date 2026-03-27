'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { VariantMatrixBuilder } from '@/components/admin/VariantMatrixBuilder';
import { getColorHex } from '@/lib/colorMap';
import { ArrowLeft, Save, Loader2, Upload, Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';
import { ProductFormData, ProductStatus, ProductGender, ProductSize } from '@/types';

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [images, setImages] = useState<string[]>(['', '', '']);
  const [uploadMethod, setUploadMethod] = useState<('url' | 'file')[]>(['url', 'url', 'url']);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    slug: '',
    description: '',
    category_id: '',
    price: 0,
    compare_at_price: undefined,
    cost_per_item: undefined,
    sku: '',
    barcode: '',
    stock: 0,
    track_quantity: true,
    continue_selling: false,
    status: 'draft' as ProductStatus,
    featured: false,
    gender: undefined,
    available_sizes: [],
    available_colors: [],
  });

  // Fetch categories
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch('/api/categories');
        const data = await response.json();
        setCategories(data.categories || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    }
    fetchCategories();
  }, []);

  // Auto-generate slug from name
  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, ''),
    });
  };

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...images];
    newImages[index] = value;
    setImages(newImages);
  };

  const handleFileUpload = async (index: number, file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const newImages = [...images];
        newImages[index] = base64String;
        setImages(newImages);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload image');
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          images: images.filter(img => img.trim() !== '').map((url, index) => ({
            image_url: url,
            position: index,
          })),
          available_sizes: formData.available_sizes || [],
          available_colors: formData.available_colors || [],
          variant_combinations: formData.variant_combinations || [],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create product');
      }

      router.push('/admin/products');
      router.refresh();
    } catch (error) {
      console.error('Error creating product:', error);
      alert(error instanceof Error ? error.message : 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/products">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
            <p className="text-gray-600 mt-1">Create a new product for your store</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name *
                  </label>
                  <Input
                    required
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g., Classic Cotton T-Shirt"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Slug *
                  </label>
                  <Input
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="classic-cotton-t-shirt"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    URL-friendly version of the name
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your product..."
                    rows={5}
                  />
                </div>
              </CardContent>
            </Card>



            {/* Product Variants - Sizes & Colors */}
            <Card>
              <CardHeader>
                <CardTitle>Product Variants</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Base Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Base Price * ($)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Base price for all variants (Qty × Price = Final price)
                  </p>
                </div>

                {/* Step 1: Select Available Sizes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available Sizes
                  </label>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                      <label key={size} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.available_sizes?.includes(size as ProductSize) || false}
                          onChange={(e) => {
                            const sizes = formData.available_sizes || [];
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                available_sizes: [...sizes, size as ProductSize],
                              });
                            } else {
                              setFormData({
                                ...formData,
                                available_sizes: sizes.filter(s => s !== size),
                              });
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm text-gray-700">{size}</span>
                      </label>
                    ))}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Custom Numeric Sizes
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g., 28, 30, 32, 34, 36, 38, 40, 42 (comma-separated)"
                      onChange={(e) => {
                        const sizes = formData.available_sizes || [];
                        const standardSizes = sizes.filter(s => ['XS', 'S', 'M', 'L', 'XL', 'XXL'].includes(s));
                        
                        if (e.target.value.trim()) {
                          const numericSizes = e.target.value.split(',').map(s => s.trim()).filter(s => s) as ProductSize[];
                          setFormData({
                            ...formData,
                            available_sizes: [...standardSizes, ...numericSizes],
                          });
                        } else {
                          setFormData({
                            ...formData,
                            available_sizes: standardSizes,
                          });
                        }
                      }}
                      value={
                        formData.available_sizes
                          ?.filter(s => !['XS', 'S', 'M', 'L', 'XL', 'XXL'].includes(s))
                          .join(', ') || ''
                      }
                    />
                  </div>
                </div>

                {/* Step 2: Select Available Colors */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available Colors
                  </label>
                  <div className="space-y-2">
                    {['Black', 'White', 'Navy', 'Red', 'Blue', 'Green', 'Gray', 'Beige'].map((color) => (
                      <label key={color} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.available_colors?.includes(color) || false}
                          onChange={(e) => {
                            const colors = formData.available_colors || [];
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                available_colors: [...colors, color],
                              });
                            } else {
                              setFormData({
                                ...formData,
                                available_colors: colors.filter(c => c !== color),
                              });
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm text-gray-700">{color}</span>
                      </label>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Add Custom Color
                    </label>
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="e.g., Burgundy, Emerald, Charcoal"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            const colorName = (e.target as HTMLInputElement).value.trim();
                            if (colorName && !formData.available_colors?.includes(colorName)) {
                              setFormData({
                                ...formData,
                                available_colors: [...(formData.available_colors || []), colorName],
                              });
                              (e.target as HTMLInputElement).value = '';
                            }
                          }
                        }}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement;
                          const colorName = input.value.trim();
                          if (colorName && !formData.available_colors?.includes(colorName)) {
                            setFormData({
                              ...formData,
                              available_colors: [...(formData.available_colors || []), colorName],
                            });
                            input.value = '';
                          }
                        }}
                      >
                        Add
                      </Button>
                    </div>
                    {Array.isArray(formData.available_colors) && formData.available_colors.some(c => !['Black', 'White', 'Navy', 'Red', 'Blue', 'Green', 'Gray', 'Beige'].includes(c)) && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {formData.available_colors
                          .filter(c => !['Black', 'White', 'Navy', 'Red', 'Blue', 'Green', 'Gray', 'Beige'].includes(c))
                          .map((color) => (
                            <span
                              key={color}
                              className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded"
                            >
                              <div
                                className="w-4 h-4 rounded border border-blue-700"
                                style={{ backgroundColor: getColorHex(color) }}
                                title={color}
                              />
                              {color}
                              <button
                                type="button"
                                onClick={() =>
                                  setFormData({
                                    ...formData,
                                    available_colors: formData.available_colors?.filter(c => c !== color),
                                  })
                                }
                                className="hover:text-blue-900"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Step 3: Variant Matrix Builder */}
                {(formData.available_sizes?.length || 0) > 0 && (formData.available_colors?.length || 0) > 0 && (
                  <div className="pt-4 border-t">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Size × Color Combinations
                    </label>
                    <VariantMatrixBuilder
                      sizes={formData.available_sizes || []}
                      colors={formData.available_colors || []}
                      combinations={formData.variant_combinations || []}
                      onChange={(combinations) =>
                        setFormData({
                          ...formData,
                          variant_combinations: combinations,
                        })
                      }
                      basePrice={formData.price}
                    />
                  </div>
                )}

                {(formData.available_sizes?.length || 0) === 0 || (formData.available_colors?.length || 0) === 0 ? (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded">
                    <p className="text-sm text-amber-800">
                      Select at least one size and one color to build variant combinations.
                    </p>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            {/* Product Images */}
            <Card>
              <CardHeader>
                <CardTitle>Product Images</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  Add up to 3 images for your product. Choose between URL or file upload.
                </p>
                
                {[0, 1, 2].map((index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium text-gray-700">
                        {index === 0 ? 'Primary Image' : index === 1 ? 'Second Image' : 'Third Image'}
                        {index === 0 && <span className="text-red-500"> *</span>}
                      </label>
                      
                      {/* Toggle between URL and File upload */}
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const newMethods = [...uploadMethod];
                            newMethods[index] = 'url';
                            setUploadMethod(newMethods);
                          }}
                          className={`px-3 py-1 text-xs rounded-md flex items-center gap-1 ${
                            uploadMethod[index] === 'url'
                              ? 'bg-blue-100 text-blue-700 border border-blue-300'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          <LinkIcon className="h-3 w-3" />
                          URL
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const newMethods = [...uploadMethod];
                            newMethods[index] = 'file';
                            setUploadMethod(newMethods);
                          }}
                          className={`px-3 py-1 text-xs rounded-md flex items-center gap-1 ${
                            uploadMethod[index] === 'file'
                              ? 'bg-blue-100 text-blue-700 border border-blue-300'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          <Upload className="h-3 w-3" />
                          File
                        </button>
                      </div>
                    </div>

                    {uploadMethod[index] === 'url' ? (
                      <Input
                        type="url"
                        value={images[index]}
                        onChange={(e) => handleImageChange(index, e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        required={index === 0}
                      />
                    ) : (
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(index, file);
                          }}
                          className="block w-full text-sm text-gray-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-md file:border-0
                            file:text-sm file:font-semibold
                            file:bg-blue-50 file:text-blue-700
                            hover:file:bg-blue-100
                            cursor-pointer"
                          required={index === 0 && !images[index]}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Max size: 5MB. Supported: JPG, PNG, GIF, WebP
                        </p>
                      </div>
                    )}

                    {images[index] && (
                      <div className="mt-2">
                        <img
                          src={images[index]}
                          alt={`Preview ${index + 1}`}
                          className="h-32 w-32 object-cover rounded-lg border"
                          onError={(e) => {
                            e.currentTarget.src = '';
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newImages = [...images];
                            newImages[index] = '';
                            setImages(newImages);
                          }}
                          className="mt-2 text-xs text-red-600 hover:text-red-700"
                        >
                          Remove image
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status & Organization */}
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Status *
                  </label>
                  <Select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as ProductStatus })}
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="archived">Archived</option>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <Select
                    required
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender
                  </label>
                  <Select
                    value={formData.gender || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      gender: e.target.value ? e.target.value as ProductGender : undefined 
                    })}
                  >
                    <option value="">Not specified</option>
                    <option value="men">Men</option>
                    <option value="women">Women</option>
                    <option value="unisex">Unisex</option>
                  </Select>
                </div>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">Featured product</span>
                </label>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Card>
              <CardContent className="pt-6 space-y-3">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Create Product
                    </>
                  )}
                </Button>
                <Link href="/admin/products" className="block">
                  <Button type="button" variant="outline" className="w-full">
                    Cancel
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
