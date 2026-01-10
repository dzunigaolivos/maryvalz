'use client';
import HTMLFlipBook from "react-pageflip";
import React, { useState, useEffect, forwardRef } from "react";

// Hook para obtener el tamaño de la ventana
function useWindowSize() {
    const [size, setSize] = useState({ width: 0, height: 0 });
    useEffect(() => {
        function handleResize() {
            setSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        }
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);
    return size;
}

// Componente de página para el flipbook
const Page = forwardRef<HTMLDivElement, { children?: React.ReactNode; className?: string }>(
    ({ children, className = '' }, ref) => {
        return (
            <div ref={ref} className={`bg-white ${className}`}>
                {children}
            </div>
        );
    }
);
Page.displayName = 'Page';

const DemoPage = () => {
    const bookImages = Array.from({ length: 32 }, (_, i) => `/book/${i + 1}.jpg`);
    const { width, height } = useWindowSize();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    // Determinar si es móvil (una página) o desktop (dos páginas)
    const isMobile = width < 768;

    // Calcular dimensiones
    // Para modo portrait (móvil): una página ocupa el ancho
    // Para modo landscape (desktop): el ancho es de UNA página, el componente muestra dos
    let flipWidth: number;
    let flipHeight: number;

    if (isMobile) {
        // Móvil: una página, ocupa casi todo el ancho
        flipWidth = Math.min(width * 0.95, 400);
        flipHeight = Math.floor(flipWidth * 1.42); // Proporción vertical de página
    } else {
        // Desktop: dos páginas lado a lado
        // El height es 85% de la pantalla, el width de cada página mantiene proporción
        flipHeight = Math.floor(height * 0.85);
        flipWidth = Math.floor(flipHeight * 0.7); // Ancho de UNA página
    }

    if (!isClient || width === 0) {
        return (
            <div className="flex bg-gradient-to-b from-cream to-ivory w-full min-h-screen items-center justify-center">
                <p className="text-warmGray">Cargando...</p>
            </div>
        );
    }

    return (
        <div className="flex bg-gradient-to-b from-cream to-ivory w-full min-h-screen items-center justify-center p-4">
            <HTMLFlipBook
                width={flipWidth}
                height={flipHeight}
                minWidth={280}
                maxWidth={600}
                minHeight={400}
                maxHeight={900}
                style={{}}
                className="shadow-2xl"
                size="fixed"
                startPage={0}
                drawShadow={true}
                flippingTime={300}
                usePortrait={isMobile}
                startZIndex={0}
                autoSize={false}
                maxShadowOpacity={0.3}
                showCover={true}
                mobileScrollSupport={true}
                clickEventForward={true}
                useMouseEvents={true}
                swipeDistance={30}
                showPageCorners={true}
                disableFlipByClick={false}
            >
                {/* Portada */}
                <Page className="bg-cream">
                    <img
                        src="/mockup(2).png"
                        alt="Portada"
                        className="w-full h-full object-contain"
                    />
                </Page>

                {/* Página en blanco después de portada */}
                <Page className="bg-cream" />

                {/* Páginas del libro */}
                {bookImages.map((src, index) => (
                    index === 3 ? (
                        <Page key={`page-${index}`} className="bg-white" />
                    ) : (
                        <Page key={`page-${index}`}>
                            <img
                                src={src}
                                alt={`Página ${index + 1}`}
                                className="w-full h-full object-cover"
                            />
                        </Page>
                    )
                ))}

                {/* Contraportada */}
                <Page className="bg-burgundy/10" />
            </HTMLFlipBook>
        </div>
    );
};

export default DemoPage;