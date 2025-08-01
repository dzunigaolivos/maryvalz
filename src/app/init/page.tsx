'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { IoVolumeHigh } from "react-icons/io5";
import { IoMdVolumeOff } from "react-icons/io";
import scrollGif from '../../../public/scroll-gif.gif';
import mockup from '../../../public/mockup.png';
import male from '../../../public/male.png';
import female from '../../../public/female.png';
import { CgPlayTrackNextO } from "react-icons/cg";




function Slide1({ onNext }: { onNext: () => void }) {
    return (
        <motion.div
            className="h-full w-full bg-cover bg-center flex items-center justify-center text-white text-4xl font-serif p-8 text-center"
            style={{ backgroundImage: 'url(/bg1.jpg)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
        >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-0" />
            <motion.div
            className='z-10 font-quintessential'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            >
                <motion.div
                    className='absolute bottom-0 right-0 z-0'
                    initial={{ opacity: 0, x: 100 }} // Comienza fuera de la pantalla a la derecha
                    animate={{ opacity: 1, x: -50 }} // Termina completamente visible en su posición original
                    transition={{ duration: 4 }} // Duración de 4 segundos
                >
                    <img src={male.src} alt="Male" className="w-[650px] mr-10 h-auto" />
                </motion.div>
            <motion.div
                className='flex flex-col w-screen h-screen items-center justify-between'
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <div />
                <div className='flex'>
                    <motion.div
                        initial={{ opacity: 1 }}
                        animate={{ opacity: 0 }}
                        transition={{ delay: 3, duration: 1 }}
                    >
                        ¿Has sentido alguna vez que el
                    </motion.div>
                    <motion.div
                    className='ml-1 mr-1'
                        initial={{ opacity: 1 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 3 }}
                    >
                        pasado
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 1 }}
                        animate={{ opacity: 0 }}
                        transition={{ delay: 3, duration: 1 }}
                    >
                        te acecha?
                    </motion.div>
                </div>
                <div className='flex justify-center items-center w-full relative'>
                <img src={scrollGif.src} alt="Scroll" className="w-20 h-20 mb-10" />
                <div className='absolute right-4 px-4 py-2'>
                    <div onClick={onNext}  className='cursor-pointer flex items-center justify-center w-full bg-slate-700 text-white text-lg rounded-full p-2'>
                        <div className='pr-2'>Siguiente</div> 
                        <CgPlayTrackNextO />
                    </div>
                </div>
                </div>
            </motion.div>
            </motion.div>
        </motion.div>
    );
}

function Slide2({ onNext }: { onNext: () => void }) {
    return (
        <motion.div
            className="h-full w-full bg-cover bg-center flex items-center justify-center text-white text-4xl font-serif p-8 text-center"
            style={{ backgroundImage: 'url(/bg2.jpg)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
        >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-0" />
            <motion.div
                className='z-10 font-quintessential'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
            >
                <motion.div
                    className='absolute bottom-0 left-0 z-0 '
                    initial={{ opacity: 0, x: 0 }} // Comienza fuera de la pantalla a la derecha
                    animate={{ opacity: 1, x: 100 }} // Termina completamente visible en su posición original
                    transition={{ duration: 4 }} // Duración de 4 segundos
                >
                    <img src={female.src} alt="Male" className="w-[550px] mr-10 h-auto" />
                </motion.div>
                <div className='flex flex-col w-screen h-screen items-center justify-between'>
                    <div />
                    <div>
                        <div className='flex'>
                            <motion.div
                                initial={{ opacity: 1 }}
                                animate={{ opacity: 0 }}
                                transition={{ delay: 3, duration: 1 }}
                            >
                                Un encuentro inesperado desata
                            </motion.div>
                            <motion.div
                                className='ml-1'
                                initial={{ opacity: 1 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 3 }}
                            >
                                secretos...
                            </motion.div>
                        </div>
                    </div>
                    <div className='flex justify-center items-center w-full relative'>
                        <img src={scrollGif.src} alt="Scroll" className="w-20 h-20 mb-10" />
                        <div className='absolute right-4 px-4 py-2'>
                            <div onClick={onNext} className='cursor-pointer flex items-center justify-center w-full bg-slate-700 text-white text-lg rounded-full p-2'>
                                <div className='pr-2'>Siguiente</div>
                                <CgPlayTrackNextO />
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

function Slide3({ onNext }: { onNext: () => void }) {
    return (
        <motion.div
            className="h-full w-full bg-cover bg-center flex items-center justify-center text-white text-4xl font-serif p-8 text-center"
            style={{ backgroundImage: 'url(/bg3.jpg)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
        >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-0" />
            <motion.div
                className='z-10 font-quintessential'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
            >
                <div className='flex flex-col w-screen h-screen items-center justify-between'>
                    <div />
                    <div>
                        <div className='flex'>
                            <motion.div
                                initial={{ opacity: 1 }}
                                animate={{ opacity: 0 }}
                                transition={{ delay: 3, duration: 1 }}
                            >
                                ...y revive los demonios que creía
                            </motion.div>
                            <motion.div
                                className='ml-1'
                                initial={{ opacity: 1 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 3 }}
                            >
                                enterrados
                            </motion.div>
                        </div>
                    </div>
                    <div className='flex justify-center items-center w-full relative'>
                        <img src={scrollGif.src} alt="Scroll" className="w-20 h-20 mb-10" />
                        <div className='absolute right-4 px-4 py-2'>
                            <div onClick={onNext} className='cursor-pointer flex items-center justify-center w-full bg-slate-700 text-white text-lg rounded-full p-2'>
                                <div className='pr-2'>Siguiente</div>
                                <CgPlayTrackNextO />
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

function Slide4({ onNext }: { onNext: () => void }) {
    return (
        <motion.div
            className="h-full w-full bg-cover bg-center flex items-center justify-center text-white text-4xl font-serif p-8 text-center"
            style={{ backgroundImage: 'url(/bg4.jpg)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
        >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-0" />
            <motion.div
                className='z-10 font-quintessential'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
            >
                <div className='flex flex-col w-screen h-screen items-center justify-between'>
                    <div />
                    <div>
                        <div>¿Podrá el amor salvarlos?</div>
                    </div>
                    <div className='flex justify-center items-center w-full relative'>
                        <img src={scrollGif.src} alt="Scroll" className="w-20 h-20 mb-10" />
                        <div className='absolute right-4 px-4 py-2'>
                            <div onClick={onNext} className='cursor-pointer flex items-center justify-center w-full bg-slate-700 text-white text-lg rounded-full p-2'>
                                <div className='pr-2'>Entrar</div>
                                <CgPlayTrackNextO />
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

function Slide5({ onNext }: { onNext: () => void }) {
    return (
        <motion.div
            className="h-full w-full bg-cover bg-center flex items-center justify-center text-white text-4xl font-serif p-8 text-center"
            style={{ backgroundImage: 'url(/bg5.jpg)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
        >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-0" />
            <motion.div
                className='z-10 font-quintessential'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
            >
                <div className='flex flex-col w-screen h-screen items-center justify-between'>
                    <div />
                    <div className='quinnesential'>
                        <div className='flex items-center'>
                            <div>
                                <img src={mockup.src} alt="Mockup" className="w-[800px] h-auto" />
                            </div>
                            <div className='flex flex-col justify-start items-start -ml-36'>
                                <div className='text-4xl text-yellow-100' style={{textShadow: '0 2px black'}}>Mary Valz</div>
                                <div className='text-6xl font-bold text-yellow-100' style={{textShadow: '0 3px black'}}>Sombras</div>
                                <div className='text-8xl font-bold text-yellow-100' style={{textShadow: '0 3px black'}}>del Pasado</div>
                                <div>Exclusivo en:</div>
                                <div>Imagen</div>
                            </div>

                        </div>
                    </div>
                    <div className='flex justify-center items-center w-full relative'>
                        <img src={scrollGif.src} alt="Scroll" className="w-20 h-20 mb-10" />
                        <div className='absolute right-4 px-4 py-2'>
                            <div onClick={onNext} className='cursor-pointer flex items-center justify-center w-full bg-slate-700 text-white text-lg rounded-full p-2'>
                                <div className='pr-2'>Entrar</div>
                                <CgPlayTrackNextO />
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}



function Loader() {
    return (
        <div className="h-screen w-screen flex items-center justify-center bg-black text-white text-2xl">
            Cargando...
        </div>
    );
}

export default function Intro() {
    const [index, setIndex] = useState(0);
    const [isScrolling, setIsScrolling] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [audioStarted, setAudioStarted] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);
    const router = useRouter();
    const [isMuted, setIsMuted] = useState(false); // Estado para mute
    const [volume, setVolume] = useState(0.1); // Esta

    const preloadImages = () => {
        const images = ['/bg1.jpg', '/bg2.jpg', '/bg3.jpg', '/bg4.jpg','bg5.jpg'];
        let loadedCount = 0;
        images.forEach((src) => {
            const img = new Image();
            img.src = src;
            img.onload = () => {
                loadedCount++;
                if (loadedCount === images.length) {
                    setLoaded(true);
                }
            };
        });
    };

        const nextScene = () => {
            console.log('Index:', index);
        if (isScrolling) return;
        setIsScrolling(true);
            console.log('index desde 0', index);
        if (index < slides.length - 1) { // Detener en el último slide
            console.log('Avanzando al siguiente slide', slides.length);
            setIndex(index + 1);
        } else {
            localStorage.setItem('introSeen', 'true');
            router.push('/');
        }

        setTimeout(() => setIsScrolling(false), 2000); // tiempo de bloqueo temporal
    };

    const slides = [
        <Slide1 key={0} onNext={nextScene} />,
        <Slide2 key={1} onNext={nextScene} />,
        <Slide3 key={2} onNext={nextScene} />,
        <Slide4 key={3} onNext={nextScene} />,
        <Slide5 key={4} onNext={nextScene} />
    ];

    useEffect(() => {
        if (index < slides.length - 1) { // Solo avanza si no es el último slide
            const autoAdvance = setTimeout(() => {
                nextScene();
                setIsScrolling(false); // Permitir el scroll después de avanzar
            }, 7000);
            return () => clearTimeout(autoAdvance);
        }
    }, [index]);

    useEffect(() => {
        preloadImages();
    }, []);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.muted = isMuted; // Actualiza el estado de mute
        }
    }, [isMuted]);

    useEffect(() => {
        const handleClick = () => {
          if (!audioStarted && audioRef.current) {
            audioRef.current.play();
            audioRef.current.volume = volume; // Set the initial volume
            setAudioStarted(true);
          }
        };
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
      }, [audioStarted]);

    useEffect(() => {
        const handleScroll = (e: any) => {
            e.preventDefault();
            nextScene();
        };
        window.addEventListener('wheel', handleScroll, { passive: false });
        return () => window.removeEventListener('wheel', handleScroll);
    }, [index, isScrolling]);



    const handleMuteToggle = () => {
        setIsMuted(!isMuted);
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        if (audioRef.current) {
            audioRef.current.volume = newVolume;
        }
    };


    

    return (
        <div className="h-screen w-screen overflow-hidden">
            {
                !loaded ? (
                    <Loader />
                ) : (
                    <>
                    <AnimatePresence mode="wait">
                        {slides[index]}
                    </AnimatePresence>
                    <audio ref={audioRef} loop preload="auto">
                        <source src="/song1.mp3" type="audio/mpeg" />
                    </audio>
                    <div className="absolute bottom-4 left-4 flex items-center space-x-4 z-20">
                            
                            <div onClick={handleMuteToggle}>
                                {
                                    !isMuted ? (
                                        <IoVolumeHigh className="text-white" size={24} />
                                    ) : (
                                        <IoMdVolumeOff className="text-white" size={24} />
                                    )
                                }
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={volume}
                                onChange={handleVolumeChange}
                                className="w-32"
                            />
                        </div>
                    </>
                )
            }
        </div>
    );
}
