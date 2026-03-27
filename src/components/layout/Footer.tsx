import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

export function Footer() {
  return (
    <footer className="text-white mt-auto" style={{backgroundColor: '#303030'}}>
      <div className="container-padding mx-auto py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Image src="/images/circle-logo.png" alt="Flux Logo" width={84} height={64} />
            </div>
            <h3 className="font-gveret text-white text-xl font-bold">Flux Studio</h3>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="hover:text-coral transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-coral transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-coral transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-coral transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-white font-bold mb-4">Shop</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <Link href="/products" className="text-gray-300 hover:text-coral transition-colors">
                  All Products
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-bold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-coral transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-gray-300 hover:text-coral transition-colors">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-gray-300 hover:text-coral transition-colors">
                  Returns
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-white font-bold mb-4">Account</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <Link href="/account" className="text-gray-300 hover:text-coral transition-colors">
                  My Account
                </Link>
              </li>
              <li>
                <Link href="/account/orders" className="text-gray-300 hover:text-coral transition-colors">
                  Order History
                </Link>
              </li>
              <li>
                <Link href="/account/settings" className="text-gray-300 hover:text-coral transition-colors">
                  Settings
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-300">
          <p>&copy; {new Date().getFullYear()} Flux Store. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy" className="text-gray-300 hover:text-coral transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-gray-300 hover:text-coral transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
