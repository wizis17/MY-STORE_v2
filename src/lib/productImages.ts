// Product Image Upload Helper - Maximum 3 Images
// Position 0 = Primary, Position 1 = Secondary, Position 2 = Tertiary

export const MAX_PRODUCT_IMAGES = 3;

export interface ProductImage {
  id?: string;
  product_id: string;
  image_url: string;
  alt_text?: string;
  position: 0 | 1 | 2; // Only 3 positions allowed
}

export const PRODUCT_IMAGE_POSITIONS = {
  PRIMARY: 0,
  SECONDARY: 1,
  TERTIARY: 2,
} as const;

export const PRODUCT_IMAGE_LABELS = {
  0: 'Primary Image',
  1: 'Second Image',
  2: 'Third Image',
} as const;

/**
 * Validate product images array
 * @param images - Array of product images
 * @returns Validation result
 */
export function validateProductImages(images: ProductImage[]): {
  valid: boolean;
  error?: string;
} {
  if (images.length > MAX_PRODUCT_IMAGES) {
    return {
      valid: false,
      error: `Maximum ${MAX_PRODUCT_IMAGES} images allowed per product`,
    };
  }

  const positions = images.map((img) => img.position);
  const uniquePositions = new Set(positions);

  if (positions.length !== uniquePositions.size) {
    return {
      valid: false,
      error: 'Each image must have a unique position',
    };
  }

  const invalidPositions = positions.filter((pos) => pos < 0 || pos > 2);
  if (invalidPositions.length > 0) {
    return {
      valid: false,
      error: 'Image positions must be 0, 1, or 2',
    };
  }

  return { valid: true };
}

/**
 * Get the next available position for a new image
 * @param existingImages - Current product images
 * @returns Next available position or null if all positions are taken
 */
export function getNextImagePosition(
  existingImages: ProductImage[]
): 0 | 1 | 2 | null {
  const usedPositions = existingImages.map((img) => img.position);

  for (let pos = 0; pos <= 2; pos++) {
    if (!usedPositions.includes(pos as 0 | 1 | 2)) {
      return pos as 0 | 1 | 2;
    }
  }

  return null; // All positions are taken
}

/**
 * Sort images by position for display
 * @param images - Product images
 * @returns Sorted images array
 */
export function sortImagesByPosition(images: ProductImage[]): ProductImage[] {
  return [...images].sort((a, b) => a.position - b.position);
}

// Example usage in your admin product form:
/*
const [productImages, setProductImages] = useState<ProductImage[]>([]);

const handleAddImage = (imageUrl: string) => {
  const nextPosition = getNextImagePosition(productImages);
  
  if (nextPosition === null) {
    alert(`Maximum ${MAX_PRODUCT_IMAGES} images allowed`);
    return;
  }

  const newImage: ProductImage = {
    product_id: productId,
    image_url: imageUrl,
    position: nextPosition,
    alt_text: `Product image ${nextPosition + 1}`,
  };

  setProductImages([...productImages, newImage]);
};

const handleRemoveImage = (position: 0 | 1 | 2) => {
  setProductImages(productImages.filter(img => img.position !== position));
};
*/
