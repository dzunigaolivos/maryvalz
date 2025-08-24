'use client';
import HTMLFlipBook from "react-pageflip";
import React, { useState, useEffect } from "react";
// Hook para obtener el tamaño de la ventana
function UseWindowSize() {
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


const demoPage = () => {
    const bookImages = Array.from({ length: 32 }, (_, i) => `/book/${i + 1}.jpg`);
    const { width, height } = UseWindowSize();
    let flipWidth, flipHeight;
    if (width < 720) {
        flipWidth = width;
        flipHeight = Math.floor(width * (1024 / 720)); // Proporción vertical
    } else {
        flipHeight = Math.floor(height * 0.8);
        flipWidth = Math.floor(flipHeight * 0.703); // Proporción horizontal
    }
    return (
        <>
            {/* Desktop: dos páginas */}
            <div className="flex bg-gray-100 p-4 w-full max-h-[100vh] h-[100vh] items-center justify-center text-gray-700">
                <HTMLFlipBook
                    width={flipWidth}
                    height={flipHeight}
                    minWidth={300}
                    maxWidth={1920}
                    minHeight={300}
                    maxHeight={1080}
                    style={{ width: flipWidth, height: flipHeight, paddingBottom: "0px" }}
                    className={"h-full w-full"}
                    size={"fixed"}
                    startPage={0}
                    drawShadow={true}
                    flippingTime={200}
                    usePortrait={true}
                    startZIndex={0}
                    autoSize={true}
                    maxShadowOpacity={0}
                    showCover={true}
                    mobileScrollSupport={true}
                    clickEventForward={true}
                    useMouseEvents={true}
                    swipeDistance={0}
                    showPageCorners={true}
                    disableFlipByClick={false}>
                        <div className="demoPage" key={`Página 00`}>
                            <img
                                src='mockup(2).png'
                                alt={`Página 00`}
                                style={{ width: "100%", height: "100%", }}
                            />
                        </div>
                        <div className="bg-white"></div>
                        {bookImages.map((src, index) => (
                            index === 3 ? (
                                <div className="demoPage" key={src}>
                                    <div className="bg-white w-full h-full"></div>
                                </div>
                            ) : (
                                <div className="demoPage" key={src}>
                                    <img
                                        src={src}
                                        alt={`Página ${index + 1}`}
                                        style={{ width: "100%", height: "100%" }}
                                    />
                                </div>
                            )
                        ))}
                        <div className="bg-white"></div>
                </HTMLFlipBook>
            </div>
            
        </>
    );
};

export default demoPage;
