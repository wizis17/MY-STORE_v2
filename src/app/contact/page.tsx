"use client";

import { Space_Grotesk } from 'next/font/google';
import Image from 'next/image';
import { Map, MapMarker, MarkerContent } from "@/components/ui/map";

const sansFont = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
});

export default function ContactPage() {
  return (
    <div className={`min-h-screen bg-[#F2EFE9] text-[#141414] ${sansFont.className}`}>
      <div className="mx-auto max-w-7xl px-4 py-32 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 lg:gap-32">
        
        {/* Left Column: Information */}
        <div className="flex flex-col justify-center">
          <h1 className="text-5xl md:text-7xl font-light mb-12 italic tracking-widest text-[#141414]">
            Get in touch
          </h1>
          
          <div className="space-y-16">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.25em] mb-4 text-[#141414]">CONTACT INFO</h3>
              <p className="text-[#141414]/70 font-light hover:text-[#141414] transition-colors text-sm lg:text-base">
                <a href="mailto:customercare@mystore.xyz">tangkavtheng@gmail.com</a>
              </p>
              <p className="text-[#141414]/70 font-light text-sm lg:text-base">
                <a href="https://t.me/xiaochen_17" target="_blank" rel="noopener noreferrer">
                  Telegram: 016 324 283
                </a>
              </p>
            </div>
            
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.25em] mb-4 text-[#141414]">Visit Us</h3>
              <p className="text-[#141414]/70 font-light text-sm lg:text-base leading-relaxed">
                #P01, 57, ReseyKeo<br />
                Phnom Penh<br />
                Cambodia
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Map */}
        <div className="flex flex-col justify-center h-[600px] w-full relative">
          <Map
            center={[104.9126, 11.595]} // Shifted to match framing
            zoom={12.3}
            theme="light"
            interactive={true}
            scrollZoom={true}
            dragPan={true}
            className="w-full h-full rounded-sm [&_.maplibregl-canvas]:grayscale [&_.maplibregl-canvas]:contrast-[1.1] [&_.maplibregl-canvas]:mix-blend-multiply [&_.maplibregl-canvas]:opacity-90"
          >
            <MapMarker longitude={104.883087} latitude={11.628594}>
              <MarkerContent>
                <a 
                  href="https://maps.app.goo.gl/L1MtrUsqtQjw9sKk7" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block w-12 h-12 rounded-full shadow-2xl hover:scale-110 transition-transform duration-300 cursor-pointer overflow-hidden bg-[#F2EFE9] p-1 border border-black/10"
                  title="Open in Google Maps"
                >
                  <Image 
                    src="/images/circle-logo.png" 
                    alt="Store Logo" 
                    width={48} 
                    height={48} 
                    className="w-full h-full object-contain"
                  />
                </a>
              </MarkerContent>
            </MapMarker>
          </Map>
        </div>

      </div>
      </div>
    </div>
  );
}