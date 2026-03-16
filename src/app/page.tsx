'use client';

import { motion } from 'framer-motion';
import { FaInstagram } from 'react-icons/fa';
import Image from 'next/image';
import { useState, useEffect, useRef, forwardRef } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { initializeDevice } from '@/lib/device';

const purchaseLinks = [
  {
    name: 'Librería Antártica',
    logo: '/antarticaLogo.png',
    url: 'https://www.antartica.cl/sombras-del-pasado-9789564065465.html',
  },
  {
    name: 'Buscalibre',
    logo: '/buscalibreLogo.png',
    url: 'https://www.buscalibre.cl/libro-sombras-del-pasado/9789564065465/p/64317986',
  },
  {
    name: 'Trayecto Bookstore',
    logo: '/bookstoreLogo.png',
    url: 'https://www.trayectobookstore.cl/sombras-del-pasado',
  },
  {
    name: 'Trayecto Editorial',
    logo: '/editorialLogo.png',
    url: 'https://editorial-trayecto.cl/producto/sombras-del-pasado/',
    isEditorial: true,
  },
];

// Componente divisor con ornamento
const SectionDivider = ({ icon = 'flower' }: { icon?: 'flower' | 'book' | 'heart' | 'star' }) => {
  const icons = {
    flower: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C13.1 2 14 2.9 14 4C14 4.74 13.6 5.39 13 5.73V7H14C15.1 7 16 7.9 16 9C16 9.74 15.6 10.39 15 10.73V12H16C17.1 12 18 12.9 18 14C18 14.74 17.6 15.39 17 15.73V17H18C19.1 17 20 17.9 20 19C20 20.1 19.1 21 18 21H6C4.9 21 4 20.1 4 19C4 17.9 4.9 17 6 17H7V15.73C6.4 15.39 6 14.74 6 14C6 12.9 6.9 12 8 12H9V10.73C8.4 10.39 8 9.74 8 9C8 7.9 8.9 7 10 7H11V5.73C10.4 5.39 10 4.74 10 4C10 2.9 10.9 2 12 2Z" />
      </svg>
    ),
    book: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M21 5C19.89 4.65 18.67 4.5 17.5 4.5C15.55 4.5 13.45 4.9 12 6C10.55 4.9 8.45 4.5 6.5 4.5C4.55 4.5 2.45 4.9 1 6V20.65C1 20.9 1.25 21.15 1.5 21.15C1.6 21.15 1.65 21.1 1.75 21.1C3.1 20.45 5.05 20 6.5 20C8.45 20 10.55 20.4 12 21.5C13.35 20.65 15.8 20 17.5 20C19.15 20 20.85 20.3 22.25 21.05C22.35 21.1 22.4 21.1 22.5 21.1C22.75 21.1 23 20.85 23 20.6V6C22.4 5.55 21.75 5.25 21 5ZM21 18.5C19.9 18.15 18.7 18 17.5 18C15.8 18 13.35 18.65 12 19.5V8C13.35 7.15 15.8 6.5 17.5 6.5C18.7 6.5 19.9 6.65 21 7V18.5Z" />
      </svg>
    ),
    heart: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z" />
      </svg>
    ),
    star: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" />
      </svg>
    ),
  };

  return (
    <div className="flex items-center justify-center py-8">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold/40 to-gold/40 max-w-xs" />
      <div className="mx-4 text-gold/60">
        {icons[icon]}
      </div>
      <div className="flex-1 h-px bg-gradient-to-l from-transparent via-gold/40 to-gold/40 max-w-xs" />
    </div>
  );
};

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
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return size;
}

const navSections = [
  { id: 'inicio', label: 'Inicio' },
  { id: 'sobre-mi', label: 'Sobre mí' },
  { id: 'libro', label: 'El libro' },
  { id: 'personajes', label: 'Personajes' },
  { id: 'leer', label: 'Leer' },
  { id: 'desafio', label: 'Desafío' },
  { id: 'novedades', label: 'Redes' },
];

// Todas las secciones para el snap scroll (incluye las que no están en el nav)
const snapSectionIds = ['inicio', 'sobre-mi', 'libro', 'personajes', 'leer', 'desafio', 'novedades', 'footer'];

export default function Home() {
  const { width } = useWindowSize();
  const [isClient, setIsClient] = useState(false);

  // Hover state for the two-panel character cards
  const [hoveredPanel, setHoveredPanel] = useState<'left' | 'right' | null>(null);

  // UX enhancements state
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState('inicio');
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Refs for section-snap scroll
  const isSnapping = useRef(false);
  const activeSectionRef = useRef('inicio');

  useEffect(() => {
    function handleScroll() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
      setShowBackToTop(scrollTop > 400);

      // Actualiza el ref con TODAS las secciones snap (para el wheel handler)
      for (const id of [...snapSectionIds].reverse()) {
        const el = document.getElementById(id);
        if (el && scrollTop >= el.offsetTop - 120) {
          activeSectionRef.current = id;
          break;
        }
      }
      // Actualiza el estado del nav solo con las secciones visibles en él
      for (const section of [...navSections].reverse()) {
        const el = document.getElementById(section.id);
        if (el && scrollTop >= el.offsetTop - 120) {
          setActiveSection(section.id);
          break;
        }
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    function goToSection(index: number) {
      const clamped = Math.max(0, Math.min(snapSectionIds.length - 1, index));
      const el = document.getElementById(snapSectionIds[clamped]);
      if (el) {
        isSnapping.current = true;
        window.scrollTo({ top: el.offsetTop, behavior: 'smooth' });
        setTimeout(() => { isSnapping.current = false; }, 900);
      }
    }

    function handleWheel(e: WheelEvent) {
      e.preventDefault();
      if (isSnapping.current) return;
      const currentIdx = snapSectionIds.indexOf(activeSectionRef.current);
      const direction = e.deltaY > 0 ? 1 : -1;
      goToSection(currentIdx + direction);
    }

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, []);

  useEffect(() => {
    setIsClient(true);

    // Inicializar solo device_id (token se genera al aprobar cuestionario)
    const { deviceId } = initializeDevice();
    console.log('Device initialized:', { deviceId });

    // Cargar script de Instagram embed
    const script = document.createElement('script');
    script.src = 'https://www.instagram.com/embed.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Calcular dimensiones del libro para la sección
  const getBookDimensions = () => {
    if (width < 640) {
      return { width: width * 0.85, height: Math.floor(width * 0.85 * 1.42) };
    } else if (width < 1024) {
      return { width: 350, height: 497 };
    } else {
      return { width: 400, height: 568 };
    }
  };

  const bookDimensions = getBookDimensions();
  const bookImages = Array.from({ length: 32 }, (_, i) => `/book/${i + 1}.jpg`);

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream to-ivory">

      {/* Scroll progress bar */}
      <div className="fixed top-0 left-0 right-0 h-0.5 z-50 bg-obsidian/10">
        <div
          className="h-full bg-gold transition-all duration-75"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Side progress dots */}
      <div className="fixed right-4 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col gap-3">
        {navSections.map((s) => (
          <button
            key={s.id}
            title={s.label}
            onClick={() => {
              const el = document.getElementById(s.id);
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="group flex items-center justify-end gap-2"
          >
            <span className={`text-xs font-medium transition-all duration-200 opacity-0 group-hover:opacity-100 ${activeSection === s.id ? 'text-gold' : 'text-warmGray'}`}>
              {s.label}
            </span>
            <span className={`block rounded-full transition-all duration-300 ${
              activeSection === s.id
                ? 'w-3 h-3 bg-gold'
                : 'w-2 h-2 bg-warmGray/40 hover:bg-gold/60'
            }`} />
          </button>
        ))}
      </div>

      {/* Back to top button */}
      <motion.button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        initial={false}
        animate={{ opacity: showBackToTop ? 1 : 0, y: showBackToTop ? 0 : 16, pointerEvents: showBackToTop ? 'auto' : 'none' }}
        transition={{ duration: 0.25 }}
        className="fixed bottom-6 right-6 z-40 w-10 h-10 rounded-full bg-obsidian border border-gold/30 text-gold shadow-lg flex items-center justify-center hover:bg-obsidian/80 transition-colors"
        aria-label="Volver arriba"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </motion.button>

      {/* Hero Section */}
      <section id="inicio" className="relative min-h-screen flex flex-col items-center justify-center px-4 py-16">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/backHero.jpg"
            alt=""
            fill
            className="object-cover object-center"
            priority
          />
        </div>

        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-20 left-10 w-32 h-32 bg-burgundy/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-gold/10 rounded-full blur-3xl" />
        </div>

        {/* Author Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative mb-8 z-10"
        >
          {/* Decorative rings */}
          <div className="absolute inset-0 rounded-full border-2 border-gold/60 scale-150" />
          <div className="absolute inset-0 rounded-full border border-gold/40 scale-[1.35]" />
          <div className="absolute inset-0 rounded-full border-2 border-gold/70 scale-[1.20]" />
          <div className="absolute inset-0 rounded-full border border-gold/50 scale-110" />

          <div className="w-64 h-64 md:w-80 md:h-80 rounded-full bg-gradient-to-br from-gold/30 to-gold/10 border-4 border-gold shadow-2xl flex items-center justify-center overflow-hidden">
            <Image
              src="/maryValz.jpeg"
              alt="MaryValz - Autora"
              width={320}
              height={320}
              className="w-full h-full object-cover"
              priority
            />
          </div>
        </motion.div>

        {/* Author Name */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl md:text-7xl font-bold text-cream mb-4 text-center z-10"
          style={{ fontFamily: "'Quintessential', cursive" }}
        >
          MaryValz
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-xl md:text-2xl text-cream mb-8 text-center max-w-2xl px-4 z-10"
        >
          Escritora | Soñadora | Creadora de mundos
        </motion.p>

        {/* Instagram Button in Hero */}
        <motion.a
          href="https://instagram.com/mary.valz"
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-shadow z-10"
        >
          <FaInstagram className="w-5 h-5" />
          @mary.valz
        </motion.a>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="absolute bottom-8 z-10"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-cream/70"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.div>
        </motion.div>
      </section>

      {/* Wave Divider - Hero to About */}
      <SectionDivider icon="star" />

      {/* About the Author Section */}
      <section id="sobre-mi" className="py-20 px-4 bg-gradient-to-b from-ivory to-cream">
        <div className="max-w-4xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-burgundy text-center mb-16"
            style={{ fontFamily: "'Quintessential', cursive" }}
          >
            Un poco sobre mí
          </motion.h2>

          <div className="flex flex-col md:flex-row items-center gap-12">
            {/* Photo */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex-shrink-0 flex flex-col items-center gap-4"
            >
              <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-full overflow-hidden border-4 border-gold shadow-xl">
                <Image
                  src="/maryValz.jpeg"
                  alt="Mary Valz"
                  fill
                  className="object-cover"
                />
              </div>
              {/* Inspirations */}
              <div className="text-center">
                <p className="text-xs uppercase tracking-widest text-gold/70 font-semibold mb-2">Inspirada por</p>
                <div className="flex gap-2 justify-center flex-wrap">
                  {['Megan Maxwell', 'Jodi Ellen Malpas'].map((name) => (
                    <span
                      key={name}
                      className="px-3 py-1 rounded-full text-xs font-medium bg-burgundy/10 text-burgundy border border-burgundy/20"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Bio text */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex-1"
            >
              {/* Decorative quote */}
              <svg className="w-10 h-10 text-gold/40 mb-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" />
              </svg>

              <div className="space-y-4 text-warmGray leading-relaxed text-base md:text-lg">
                <p>
                  Chilena, nació en <span className="text-burgundy font-semibold">1988</span>. Estudió Diseño Gráfico en 2011, aunque buscó nuevos horizontes laborales después de sus estudios.
                </p>
                <p>
                  Una lectora ávida que, influenciada por sus escritoras favoritas, descubre su pasión por escribir. Es entonces cuando comienza a trabajar en esta historia, con personajes cercanos y una trama de búsqueda por reparar aquello que en el pasado se rompió.
                </p>
              </div>

              {/* Divider line + signature */}
              <div className="mt-8 flex items-center gap-4">
                <div className="flex-1 h-px bg-gold/30" />
                <span className="text-burgundy/60 text-lg italic" style={{ fontFamily: "'Quintessential', cursive" }}>
                  Mary Valz
                </span>
                <div className="flex-1 h-px bg-gold/30" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Divider - About to Book */}
      <SectionDivider icon="book" />

      {/* Book Section */}
      <section id="libro" className="py-20 px-4 bg-gradient-to-b from-ivory to-cream">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-burgundy text-center mb-16"
            style={{ fontFamily: "'Quintessential', cursive" }}
          >
            Mi Libro
          </motion.h2>

          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            {/* Book Image */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative w-64 md:w-80 h-auto">
                <Image
                  src="/mockup.png"
                  alt="Portada del libro"
                  width={320}
                  height={480}
                  className="rounded-lg"
                  priority
                />
              </div>
              {/* Book shadow effect */}
              <div className="absolute -bottom-4 left-4 right-4 h-8 bg-burgundy/10 blur-xl rounded-full" />
            </motion.div>

            {/* Book Info */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex-1 text-center lg:text-left"
            >
              <h3 className="text-2xl md:text-3xl font-bold text-burgundy mb-4" style={{ fontFamily: "'Quintessential', cursive" }}>
                Sombras del pasado
              </h3>
              <div className="text-warmGray mb-6 leading-relaxed max-w-lg">
                <p className="font-bold mb-3">
                  Es como una diosa entre mortales, y yo soy solo un hombre marcado por la oscuridad.
                </p>
                <p className="mb-3">
                  ¿Has sentido alguna vez que el pasado te acecha? Jacob Montero es un empresario exitoso que esconde cicatrices profundas, tanto físicas como emocionales. Su vida, construida sobre el control y el sacrificio, comienza a desmoronarse tras conocer a una misteriosa mujer pelirroja. La presencia de ella desata los demonios que creía haber enterrado para siempre, obligándolo a enfrentar un pasado oscuro que lo persigue.
                </p>
                <p className="mb-3">
                  ¿Podrá alguna vez liberarse de las sombras, o estará condenado a vivir en ellas? El amor, si llega, es tan peligroso como las heridas que lleva.
                </p>
                <p>
                  Sombras del pasado es una novela cargada de secretos, donde la traición y el deseo entrelazan sus hilos en una red que desafía la oscuridad del alma. En medio de ese abismo, el amor se abre paso, luchando por redimir aquello que parecía perdido para siempre.
                </p>
              </div>

              {/* Purchase Section */}
              <div className="mt-8">
                <h4 className="text-lg font-semibold text-burgundy mb-4">
                  ¿Dónde conseguirlo?
                </h4>
                <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                  {purchaseLinks.map((link) => (
                    <motion.a
                      key={link.name}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-md transition-colors text-sm font-medium ${link.isEditorial
                        ? 'bg-gold text-white hover:bg-gold/90'
                        : 'bg-burgundy text-cream hover:bg-burgundy/90'
                        }`}
                    >
                      <Image
                        src={link.logo}
                        alt={link.name}
                        width={20}
                        height={20}
                        className="w-5 h-5 object-contain"
                      />
                      <span>{link.name}</span>
                    </motion.a>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section id="personajes" className="py-12 px-4 bg-gradient-to-b from-cream to-burgundy/5">
        {/* Divisor visible al top al hacer snap */}
        <SectionDivider icon="book" />
        <div className="max-w-6xl mx-auto">
          <div className="flex w-full h-72 rounded-xl overflow-hidden shadow-md">
            {/* Left panel (Personaje A) */}
            <motion.div
              className={`relative flex items-center ${hoveredPanel && hoveredPanel !== 'left' ? 'blur-sm' : ''}`}
              style={{ transition: 'filter 200ms ease' }}
              onHoverStart={() => setHoveredPanel('left')}
              onHoverEnd={() => setHoveredPanel(null)}
              animate={{ flexBasis: hoveredPanel === 'left' ? '80%' : hoveredPanel === 'right' ? '20%' : '50%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {/* background image layer (blurred) */}
              <div
                aria-hidden
                className="absolute inset-0 bg-cover bg-center filter blur-sm scale-105"
                style={{ backgroundImage: "url('/jacob_fondo.png')" }}
              />
              <div className="relative w-full h-full flex items-center z-10">
                {/* left: nombre (visible solo cuando no hay hover en cualquiera) */}
                <motion.div className="flex-1 pl-6" animate={{ opacity: hoveredPanel ? 0 : 1 }} transition={{ duration: 0.18 }}>
                  <div className="text-white">
                    <div className="text-2xl md:text-3xl font-bold leading-tight">Jacob</div>
                    <div className="text-lg md:text-xl font-semibold -mt-1">Montero</div>
                  </div>
                </motion.div>

                {/* center: caja negra (imagen) */}
                <div className="flex-none flex items-center justify-center h-full">
                  <motion.div
                    className="relative h-full flex items-center justify-center overflow-hidden"
                    role="img"
                    aria-label="Avatar Jacob"
                    animate={{ x: hoveredPanel === 'left' ? -60 : -50 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                  >
                    <img src="/jacob_ficha.png" alt="Jacob" className="h-full w-auto object-contain" />
                  </motion.div>
                </div>

                {/* right: ficha (visible solo cuando hover en este panel) */}
                <motion.div className="flex-1 pr-6" animate={{ opacity: hoveredPanel === 'left' ? 1 : 0 }} transition={{ duration: 0.18 }}>
                  {hoveredPanel === 'left' && (
                    <div className="max-w-xs bg-black/50 p-4 rounded-lg">
                      <h3 className="text-xl font-semibold text-white">Jacob Montero</h3>
                      <p className="text-sm text-white/90 mt-2">es un empresario tecnológico de 33 años cuya vida está marcada por un pasado de violencia y abuso infantil que forjó en él una personalidad protectora pero dominante, reservado e intensamente emocional. Divorciado tras una traición que consolidó su miedo a la vulnerabilidad, Jacob vive en constante lucha entre el control y el caos interno, entre proteger y obsesionarse, cargando con el terror de repetir los patrones de violencia que sufrió.</p>
                    </div>
                  )}
                </motion.div>
              </div>
            </motion.div>

            {/* Right panel (Personaje B) */}
            <motion.div
              className={`relative flex items-center ${hoveredPanel && hoveredPanel !== 'right' ? 'blur-sm' : ''}`}
              style={{ transition: 'filter 200ms ease' }}
              onHoverStart={() => setHoveredPanel('right')}
              onHoverEnd={() => setHoveredPanel(null)}
              animate={{ flexBasis: hoveredPanel === 'right' ? '80%' : hoveredPanel === 'left' ? '20%' : '50%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {/* background image layer (blurred) */}
              <div
                aria-hidden
                className="absolute inset-0 bg-cover bg-center filter blur-sm scale-105"
                style={{ backgroundImage: "url('/helena_fondo.png')" }}
              />
              <div className="relative w-full h-full flex items-center z-10">
              <div className="w-full h-full flex items-center">
                {/* left: ficha (visible only when hover on this panel) - mirrored */}
                <motion.div className="flex-1 pl-6 text-left" animate={{ opacity: hoveredPanel === 'right' ? 1 : 0 }} transition={{ duration: 0.18 }}>
                  {hoveredPanel === 'right' && (
                    <div className="max-w-xs bg-black/50 p-4 rounded-lg">
                      <h3 className="text-xl font-semibold text-white">Helena Aspen</h3>
                      <p className="text-sm text-white/90 mt-2">Helena Aspen es diseñadora de interiores cuya infancia quedó marcada por el abuso. Empática y profundamente sensible, trabaja por reconstruir su identidad tras relaciones que reproducían dinámicas de desvalorización; poco a poco aprende a establecer límites, a sanar sin fracturarse y a priorizarse a sí misma, aun cuando ese proceso le resulta doloroso.</p>
                    </div>
                  )}
                </motion.div>

                {/* center: caja negra (imagen) */}
                <div className="flex-none flex items-center justify-center h-full">
                  <motion.div
                    className="relative h-full flex items-center justify-center overflow-hidden"
                    role="img"
                    aria-label="Avatar Helena"
                    animate={{ x: hoveredPanel === 'right' ? 60 : 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                  >
                    <img src="/helena_ficha.png" alt="Helena" className="h-full w-auto object-contain" />
                  </motion.div>
                </div>

                {/* right: nombre (visible solo cuando no hay hover) */}
                <motion.div className="flex-1 pr-6 text-right" animate={{ opacity: hoveredPanel ? 0 : 1 }} transition={{ duration: 0.18 }}>
                  <div className="text-white">
                    <div className="text-2xl md:text-3xl font-bold leading-tight">Helena</div>
                    <div className="text-lg md:text-xl font-semibold -mt-1">Aspen</div>
                  </div>
                </motion.div>
              </div>
            </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Wave Divider - Book to Reader */}
      <SectionDivider icon='book' />

      {/* Interactive Book Reader Section */}
      <section id="leer" className="py-20 px-4 bg-gradient-to-b from-cream to-burgundy/5">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2
              className="text-3xl md:text-4xl font-bold text-burgundy mb-4"
              style={{ fontFamily: "'Quintessential', cursive" }}
            >
              Lee una muestra
            </h2>
            <p className="text-warmGray max-w-xl mx-auto">
              Explora las primeras páginas del libro. Haz clic en las esquinas o arrastra para pasar las páginas.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex justify-center"
          >
            {isClient && width > 0 && (
              <div className="relative">
                {/* Decorative shadow behind book */}
                <div className="absolute inset-0 bg-burgundy/10 blur-2xl rounded-lg transform translate-y-4" />

                <HTMLFlipBook
                  width={bookDimensions.width}
                  height={bookDimensions.height}
                  minWidth={280}
                  maxWidth={600}
                  minHeight={400}
                  maxHeight={850}
                  style={{
                    width: bookDimensions.width,
                    height: bookDimensions.height,
                  }}
                  className="shadow-2xl rounded-lg overflow-hidden"
                  size="fixed"
                  startPage={0}
                  drawShadow={true}
                  flippingTime={400}
                  usePortrait={true}
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
                  {/* Cover */}
                  <Page className="bg-cream">
                    <img
                      src="/mockup(2).png"
                      alt="Portada"
                      className="w-full h-full object-contain"
                    />
                  </Page>

                  {/* Blank page after cover */}
                  <Page className="bg-cream" />

                  {/* Book pages */}
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

                  {/* Back cover */}
                  <Page className="bg-burgundy/10" />
                </HTMLFlipBook>

                {/* Instructions hint */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5 }}
                  className="text-center text-warmGray/60 text-sm mt-6"
                >
                  ← Arrastra o haz clic en las esquinas para pasar las páginas →
                </motion.p>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      <SectionDivider icon='book' />

      {/* Interactive Quiz Section */}
      <section id="desafio" className="relative py-16 px-4 overflow-hidden">
        {/* Background image (blurred) */}
        <div
          className="absolute inset-0 bg-cover bg-center filter blur-sm scale-105 opacity-40"
          style={{ backgroundImage: "url('/jacob_fondo.png')" }}
        />

        {/* Content container */}
        <div className="relative max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12 bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-gold/20 p-8 lg:p-12">

            {/* Left side - Character images */}
            <div className="flex-shrink-0 flex gap-4 justify-center lg:justify-start">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="relative w-32 h-56 sm:w-40 sm:h-64 md:w-48 md:h-72 lg:w-56 lg:h-80"
              >
                <Image
                  src="/jacob_ficha.png"
                  alt="Jacob"
                  fill
                  className="object-cover object-top"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="relative w-32 h-56 sm:w-40 sm:h-64 md:w-48 md:h-72 lg:w-56 lg:h-80"
              >
                <Image
                  src="/helena_ficha.png"
                  alt="Helena"
                  fill
                  className="object-cover object-top"
                />
              </motion.div>
            </div>

            {/* Right side - Text and button */}
            <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left">
              <motion.h2
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl md:text-4xl font-bold text-burgundy mb-6"
                style={{ fontFamily: "'Quintessential', cursive" }}
              >
                Una Sorpresa Te Espera
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-warmGray leading-relaxed mb-8 font-nunito text-base md:text-lg"
              >
                Si has llegado hasta aquí,
                es porque el destino te ha elegido para adentrarte más profundamente en esta historia.
                Te tenemos preparado un desafío: responde correctamente 7 preguntas sobre esta historia
                 y desbloquearás algo extraordinario. Podrás conversar directamente con
                Jacob Montero o Helena Aspen, conocer sus pensamientos más íntimos y descubrir
                secretos que ni siquiera las páginas del libro revelan. ¿Te atreves a probarte digno
                de esta experiencia única?
              </motion.p>

              <motion.a
                href="/form"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-3 px-8 py-4 bg-burgundy text-cream rounded-full font-semibold shadow-lg hover:bg-burgundy/90 transition-all font-nunito text-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Aceptar el Desafío
              </motion.a>
            </div>
          </div>
        </div>
      </section>

      {/* Wave Divider - Quiz to Instagram */}
      <SectionDivider icon='heart' />

      {/* Instagram Embed Section */}
      <section id="novedades" className="py-16 px-4 bg-gradient-to-b from-cream to-white">
        <div className="max-w-sm mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-burgundy text-center mb-8"
            style={{ fontFamily: "'Quintessential', cursive" }}
          >
            Últimas novedades
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex justify-center"
          >
            <blockquote
              className="instagram-media"
              data-instgrm-permalink="https://www.instagram.com/p/DNLy4AKOMzi/?utm_source=ig_embed&utm_campaign=loading"
              data-instgrm-version="14"
              style={{
                background: '#FFF',
                border: 0,
                borderRadius: '3px',
                boxShadow: '0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15)',
                margin: '1px',
                maxWidth: '350px',
                minWidth: '280px',
                padding: 0,
                width: '100%',
              }}
            >
              <div style={{ padding: '16px' }}>
                <a
                  href="https://www.instagram.com/p/DNLy4AKOMzi/?utm_source=ig_embed&utm_campaign=loading"
                  style={{
                    background: '#FFFFFF',
                    lineHeight: 0,
                    padding: 0,
                    textAlign: 'center',
                    textDecoration: 'none',
                    width: '100%',
                  }}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <div style={{ backgroundColor: '#F4F4F4', borderRadius: '50%', flexGrow: 0, height: '40px', marginRight: '14px', width: '40px' }}></div>
                    <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'center' }}>
                      <div style={{ backgroundColor: '#F4F4F4', borderRadius: '4px', flexGrow: 0, height: '14px', marginBottom: '6px', width: '100px' }}></div>
                      <div style={{ backgroundColor: '#F4F4F4', borderRadius: '4px', flexGrow: 0, height: '14px', width: '60px' }}></div>
                    </div>
                  </div>
                  <div style={{ padding: '19% 0' }}></div>
                  <div style={{ display: 'block', height: '50px', margin: '0 auto 12px', width: '50px' }}>
                    <FaInstagram className="w-full h-full text-black" />
                  </div>
                  <div style={{ paddingTop: '8px' }}>
                    <div style={{ color: '#3897f0', fontFamily: 'Arial,sans-serif', fontSize: '14px', fontStyle: 'normal', fontWeight: 550, lineHeight: '18px' }}>Ver esta publicación en Instagram</div>
                  </div>
                </a>
              </div>
            </blockquote>
          </motion.div>
        </div>
      </section>

      {/* Instagram Section - Compact */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row items-center justify-between gap-8 p-8 rounded-2xl bg-gradient-to-r from-purple-50 via-pink-50 to-orange-50 border border-pink-100"
          >
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400">
                <FaInstagram className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-burgundy" style={{ fontFamily: "'Quintessential', cursive" }}>
                  Sígueme en Instagram
                </h3>
                <p className="text-warmGray text-sm">
                  Novedades, adelantos y contenido exclusivo
                </p>
              </div>
            </div>
            <motion.a
              href="https://instagram.com/mary.valz"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-shadow"
            >
              <FaInstagram className="w-5 h-5" />
              Seguir
            </motion.a>
          </motion.div>
        </div>
      </section>


      {/* Footer */}
      <footer id="footer" className="py-12 px-4 bg-obsidian text-cream border-t border-gold/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4 text-gold" style={{ fontFamily: "'Quintessential', cursive" }}>
            Mary.Valz
          </h2>
          <a
            href="https://instagram.com/mary.valz"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-cream/50 hover:text-gold transition-colors mb-6"
          >
            <FaInstagram className="w-6 h-6" />
            <span>@mary.valz</span>
          </a>
          <p className="text-cream/30 text-sm">
            &copy; {new Date().getFullYear()} MaryValz. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}