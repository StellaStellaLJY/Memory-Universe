/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { Background } from './components/Background';
import { Splash } from './components/Splash';
import { Home } from './components/Home';
import { TravelMap } from './components/TravelMap';
import { Page } from './types';

export default function App() {
  const [page, setPage] = useState<Page>('splash');

  return (
    <div className="relative w-full h-screen overflow-hidden text-white font-sans selection:bg-white/20">
      <Background page={page} />
      
      <AnimatePresence mode="wait">
        {page === 'splash' && (
          <Splash key="splash" onNext={() => setPage('home')} />
        )}
        {page === 'home' && (
          <Home key="home" onNext={() => setPage('map')} />
        )}
        {page === 'map' && (
          <TravelMap key="map" />
        )}
      </AnimatePresence>

      {/* Global Navigation Overlay (Optional) */}
      {page !== 'splash' && (
        <div className="fixed bottom-8 right-12 z-40 flex gap-4">
           {page === 'map' && (
             <button 
              onClick={() => setPage('home')}
              className="text-[10px] font-mono uppercase tracking-[0.3em] opacity-30 hover:opacity-100 transition-opacity"
             >
               Back to Home
             </button>
           )}
        </div>
      )}
    </div>
  );
}

