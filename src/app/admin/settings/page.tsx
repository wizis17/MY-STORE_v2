'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Store, Mail, Truck, DollarSign, CreditCard, Save, Loader2, CheckCircle } from 'lucide-react';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [settings, setSettings] = useState({
    // Store settings
    store_name: '',
    store_description: '',
    store_email: '',
    store_phone: '',
    store_address: '',
    // General settings
    currency: 'USD',
    currency_symbol: '$',
    // Tax settings
    tax_rate: 0,
    // Shipping settings
    shipping_flat_rate: 0,
    shipping_free_threshold: 0,
    // Email settings
    email_notifications: true,
    order_confirmation_email: true,
  });

  // Fetch settings
  useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await fetch('/api/admin/settings');
        if (!response.ok) {
          throw new Error('Failed to fetch settings');
        }
        const data = await response.json();
        
        // Parse JSON values and set state
        const parsedSettings: any = {};
        Object.entries(data.settings).forEach(([key, value]) => {
          // Values are already parsed from JSON in the API
          parsedSettings[key] = value;
        });
        
        setSettings(parsedSettings);
      } catch (error) {
        console.error('Error fetching settings:', error);
        alert('Failed to load settings');
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update settings');
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating settings:', error);
      alert(error instanceof Error ? error.message : 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key: string, value: any) => {
    setSettings({ ...settings, [key]: value });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your store configuration</p>
        </div>
        {success && (
          <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">Settings saved successfully!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Store Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                Store Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Store Name
                </label>
                <Input
                  value={settings.store_name}
                  onChange={(e) => handleChange('store_name', e.target.value)}
                  placeholder="MY_STORE"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Store Description
                </label>
                <Textarea
                  value={settings.store_description}
                  onChange={(e) => handleChange('store_description', e.target.value)}
                  placeholder="Brief description of your store"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Contact Email
                  </label>
                  <Input
                    type="email"
                    value={settings.store_email}
                    onChange={(e) => handleChange('store_email', e.target.value)}
                    placeholder="contact@mystore.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Contact Phone
                  </label>
                  <Input
                    value={settings.store_phone}
                    onChange={(e) => handleChange('store_phone', e.target.value)}
                    placeholder="+1234567890"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Store Address
                </label>
                <Textarea
                  value={settings.store_address}
                  onChange={(e) => handleChange('store_address', e.target.value)}
                  placeholder="123 Main St, City, Country"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Currency & Tax Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Currency
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Currency Code
                  </label>
                  <Input
                    value={settings.currency}
                    onChange={(e) => handleChange('currency', e.target.value)}
                    placeholder="USD"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Currency Symbol
                  </label>
                  <Input
                    value={settings.currency_symbol}
                    onChange={(e) => handleChange('currency_symbol', e.target.value)}
                    placeholder="$"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Tax Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tax Rate (%)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={Number(settings.tax_rate) * 100}
                    onChange={(e) => handleChange('tax_rate', parseFloat(e.target.value) / 100)}
                    placeholder="10"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Current rate: {(Number(settings.tax_rate) * 100).toFixed(2)}%
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Shipping Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Shipping Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Flat Rate Shipping Cost
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={settings.shipping_flat_rate}
                    onChange={(e) => handleChange('shipping_flat_rate', parseFloat(e.target.value))}
                    placeholder="10.00"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Standard shipping cost for all orders
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Free Shipping Threshold
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={settings.shipping_free_threshold}
                    onChange={(e) => handleChange('shipping_free_threshold', parseFloat(e.target.value))}
                    placeholder="100.00"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Minimum order amount for free shipping
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Email Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="email_notifications"
                  checked={settings.email_notifications}
                  onChange={(e) => handleChange('email_notifications', e.target.checked)}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="email_notifications" className="text-sm font-medium text-gray-700">
                  Enable Email Notifications
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="order_confirmation_email"
                  checked={settings.order_confirmation_email}
                  onChange={(e) => handleChange('order_confirmation_email', e.target.checked)}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="order_confirmation_email" className="text-sm font-medium text-gray-700">
                  Send Order Confirmation Emails
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex items-center justify-end gap-4">
            <Button
              type="submit"
              disabled={saving}
              size="lg"
            >
              {saving ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
