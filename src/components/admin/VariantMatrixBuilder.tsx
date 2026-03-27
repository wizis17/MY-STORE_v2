'use client';

import { useState } from 'react';
import { VariantCombination, ProductSize } from '@/types';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Trash2, Plus } from 'lucide-react';

interface VariantMatrixBuilderProps {
  sizes: (ProductSize | string)[];
  colors: string[];
  combinations: VariantCombination[];
  onChange: (combinations: VariantCombination[]) => void;
  basePrice: number;
}

const COLOR_MAP: Record<string, string> = {
  'Black': '#000000',
  'White': '#ffffff',
  'Navy': '#001f3f',
  'Red': '#dc2626',
  'Blue': '#2563eb',
  'Green': '#16a34a',
  'Gray': '#6b7280',
  'Beige': '#d2b48c',
};

// Fallback color for custom/unknown colors
const getColorHex = (color: string): string => {
  if (COLOR_MAP[color]) {
    return COLOR_MAP[color];
  }
  // For custom colors, return a neutral gray as placeholder
  // In a real app, you could store hex values alongside color names
  return '#9ca3af';
};

export function VariantMatrixBuilder({
  sizes,
  colors,
  combinations,
  onChange,
  basePrice,
}: VariantMatrixBuilderProps) {
  const [showMatrix, setShowMatrix] = useState(true);

  // Get combination for specific size/color
  const getCombination = (size: string, color: string): VariantCombination | undefined => {
    return combinations.find(c => c.size === size && c.color === color);
  };

  // Toggle combination on/off
  const toggleCombination = (size: string, color: string) => {
    const existing = getCombination(size, color);
    if (existing) {
      onChange(combinations.filter(c => !(c.size === size && c.color === color)));
    } else {
      onChange([
        ...combinations,
        {
          size,
          color,
          quantity: 0,
          price_adjustment: 0,
        },
      ]);
    }
  };

  // Update combination value
  const updateCombination = (
    size: string,
    color: string,
    field: keyof VariantCombination,
    value: number | string
  ) => {
    const existing = getCombination(size, color);
    if (!existing) return;

    const updated = combinations.map(c =>
      c.size === size && c.color === color
        ? { ...c, [field]: value }
        : c
    );
    onChange(updated);
  };



  if (!showMatrix) {
    return (
      <div className="border rounded-lg p-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowMatrix(true)}
          size="sm"
        >
          Show Variant Matrix
        </Button>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4 bg-white space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-gray-900">Variant Matrix</h3>
        <p className="text-xs text-gray-500">
          {combinations.length} combination{combinations.length !== 1 ? 's' : ''} configured
        </p>
      </div>

      {/* Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded p-3">
        <p className="text-sm text-gray-700 mb-2">
          <strong>How to use:</strong> Check the boxes below to enable size/color combinations. 
          Set quantity for each (Final price = Qty × Base price).
        </p>
        <p className="text-xs text-gray-600">
          Base price: <strong>${basePrice.toFixed(2)}</strong>
        </p>
      </div>

      {/* Matrix */}
      {sizes.length > 0 && colors.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="border border-gray-200 bg-gray-50 p-2 text-left font-semibold text-gray-700 w-24">
                  Size / Color
                </th>
                {sizes.map((size) => (
                  <th
                    key={size}
                    className="border border-gray-200 bg-gray-50 p-2 text-center font-semibold text-gray-700 min-w-32"
                  >
                    {size}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {colors.map((color) => (
                <tr key={color}>
                  <td className="border border-gray-200 bg-gray-50 p-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded border border-gray-300"
                        style={{ backgroundColor: getColorHex(color) }}
                        title={color}
                      />
                      <span className="font-medium text-gray-700">{color}</span>
                    </div>
                  </td>
                  {sizes.map((size) => {
                    const combo = getCombination(size, color);
                    const isSelected = !!combo;

                    return (
                      <td key={`${size}-${color}`} className="border border-gray-200 p-2">
                        <div className="flex flex-col gap-2">
                          {/* Checkbox */}
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleCombination(size, color)}
                            className="rounded border-gray-300 cursor-pointer"
                            title={`${size} - ${color}`}
                          />

                          {/* Inputs - show only if selected */}
                          {isSelected && combo && (
                            <div className="space-y-1 bg-blue-50 p-2 rounded border border-blue-100">
                              <div className="flex flex-col gap-1">
                                <label className="text-xs font-medium text-gray-600">
                                  Qty
                                </label>
                                <Input
                                  type="number"
                                  min="0"
                                  value={combo.quantity}
                                  onChange={(e) =>
                                    updateCombination(
                                      size,
                                      color,
                                      'quantity',
                                      parseInt(e.target.value) || 0
                                    )
                                  }
                                  placeholder="0"
                                  className="h-8 text-xs"
                                />
                              </div>
                              <div className="text-xs text-gray-600 font-semibold pt-1 border-t border-blue-200">
                                Final: ${(basePrice * combo.quantity).toFixed(2)}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>Please select at least one size and one color to build variants.</p>
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex gap-2 pt-2 border-t">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            // Select all combinations
            const allCombos = sizes.flatMap((size) =>
              colors.map((color) => ({
                size,
                color,
                quantity: 0,
                price_adjustment: 0,
              }))
            );
            onChange(allCombos);
          }}
        >
          <Plus className="h-3 w-3 mr-1" />
          Select All
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onChange([])}
        >
          <Trash2 className="h-3 w-3 mr-1" />
          Clear All
        </Button>
      </div>

      {/* Combinations summary */}
      {combinations.length > 0 && (
        <div className="mt-4 p-3 bg-gray-50 rounded border border-gray-200 max-h-48 overflow-y-auto">
          <p className="text-xs font-semibold text-gray-700 mb-2">
            Active Combinations:
          </p>
          <div className="space-y-1">
            {combinations.map((combo, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs bg-white p-2 rounded border border-gray-200">
                <span className="text-gray-700">
                  <strong>{combo.size}</strong> - <strong>{combo.color}</strong>
                </span>
                <div className="flex gap-3 text-gray-600">
                  <span>Qty: {combo.quantity}</span>
                  <span>
                    Final: ${(basePrice * combo.quantity).toFixed(2)}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      onChange(
                        combinations.filter(
                          (c) => !(c.size === combo.size && c.color === combo.color)
                        )
                      )
                    }
                    className="text-red-600 hover:text-red-700"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
