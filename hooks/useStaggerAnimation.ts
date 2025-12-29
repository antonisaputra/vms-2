import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export const useStaggerAnimation = (
  selector: string,
  dependencies: any[] = []
) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ctx: gsap.Context;

    if (containerRef.current) {
      // Gunakan gsap.context untuk scoping dan cleanup otomatis yang aman di React
      ctx = gsap.context(() => {
        const elements = containerRef.current?.querySelectorAll(selector);
        
        if (elements && elements.length > 0) {
          // Matikan animasi sebelumnya pada elemen ini (jika ada) agar tidak konflik
          gsap.killTweensOf(elements);

          // Gunakan fromTo agar State Awal (0) dan Akhir (1) selalu konsisten
          gsap.fromTo(elements, 
            { 
              opacity: 0, 
              y: 20 // Sedikit turun ke bawah
            },
            {
              duration: 0.4,
              opacity: 1,
              y: 0, // Kembali ke posisi asli
              stagger: 0.05, // Jeda antar elemen
              ease: 'power2.out',
              clearProps: 'transform' // Hapus transform setelah selesai agar tidak mengganggu layout CSS
            }
          );
        }
      }, containerRef);
    }

    // Cleanup function: Kembalikan elemen ke kondisi semula saat komponen di-unmount/update
    return () => {
      if (ctx) ctx.revert();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return containerRef;
};