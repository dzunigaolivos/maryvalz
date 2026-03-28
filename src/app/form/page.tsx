'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getDeviceCredentials, generateAndSaveToken } from '@/lib/device';
import { motion } from 'framer-motion';

function useIsMobile() {
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);
    return isMobile;
}

interface Answer {
    id: number;
    text: string;
}

interface Question {
    id: number;
    question: string;
    answers: Answer[];
    correctAnswerId: number;
}

interface QuestionsResponse {
    has_access: boolean;
    total: number;
    questions: Question[];
}

const REQUIRED_CORRECT = 7;

// Función para mezclar un array (Fisher-Yates shuffle)
function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

export default function FormPage() {
    const router = useRouter();
    const isMobile = useIsMobile();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [correctCount, setCorrectCount] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [hasAccess, setHasAccess] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);
    const [hoveredPanel, setHoveredPanel] = useState<'left' | 'right' | null>(null);
    const [selectedCharacter, setSelectedCharacter] = useState<'jacob' | 'helena' | null>(null);

    const handleConverse = async (character: 'jacob' | 'helena') => {
        setSelectedCharacter(character);
        let charId = '';
        if (character === 'jacob') {
            charId = '8f5abcd2-f28e-4fda-95b8-5b333e029140';
        } else if (character === 'helena') {
            charId = '061b2279-2525-4f8e-81b6-278e40a3cb9e';
        }

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'register_conversation',
                    device_id: getDeviceCredentials().deviceId,
                    character_id: charId,
                }),
            });

            const res = await response.json();

            if (!res.success) {
                console.error('Error registering conversation');
                return;
            }

            const url = `/chat?character=${character}&charId=${charId}`;

            // Usar View Transitions si el navegador lo soporta
            if (document.startViewTransition) {
                document.startViewTransition(() => {
                    router.push(url);
                });
            } else {
                router.push(url);
            }
        } catch (error) {
            console.error('Error al registrar conversación:', error);
        }
    };

    // Cargar y mezclar preguntas desde el API
    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                // Obtener device_id del localStorage
                const { deviceId } = getDeviceCredentials();
                const url = deviceId
                    ? `/api/questions?device_id=${deviceId}`
                    : '/api/questions';

                const response = await fetch(url);
                const data: QuestionsResponse = await response.json();

                // Si tiene acceso, no mostrar preguntas
                if (data.has_access) {
                    setHasAccess(true);
                    return;
                }

                // Mezclar preguntas
                const shuffledQuestions = shuffleArray(data.questions);

                // Mezclar respuestas de cada pregunta
                const questionsWithShuffledAnswers = shuffledQuestions.map((q) => ({
                    ...q,
                    answers: shuffleArray(q.answers),
                }));

                setQuestions(questionsWithShuffledAnswers);
            } catch (error) {
                console.error('Error al cargar preguntas:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchQuestions();
    }, []);

    const currentQuestion = questions[currentIndex];

    // Registrar dispositivo en access_grants
    const registerDeviceAccess = async () => {
        const { deviceId } = getDeviceCredentials();

        if (!deviceId) {
            console.error('No se encontró device_id');
            return false;
        }

        // Generar y guardar el token SOLO cuando aprueba el cuestionario
        const token = generateAndSaveToken(deviceId);

        try {
            setIsRegistering(true);
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    device_id: deviceId,
                    token: token,
                }),
            });

            const data = await response.json();

            if (data.success) {
                return true;
            } else {
                return false;
            }
        } catch (error) {
            return false;
        } finally {
            setIsRegistering(false);
        }
    };

    const handleNext = async () => {
        if (selectedAnswer === null) return;

        // Verificar si es correcta
        if (selectedAnswer === currentQuestion.correctAnswerId) {
            const newCorrectCount = correctCount + 1;
            setCorrectCount(newCorrectCount);

            // Verificar si ya tiene 7 correctas
            if (newCorrectCount >= REQUIRED_CORRECT) {
                await registerDeviceAccess();
                setHasAccess(true);
                return;
            }

            // Siguiente pregunta
            if (currentIndex < questions.length - 1) {
                setCurrentIndex((prev) => prev + 1);
                setSelectedAnswer(null);
            } else {
                // Se acabaron las preguntas sin llegar a 7
                setIsFinished(true);
            }
        } else {
            // Respuesta incorrecta - mostrar modal
            setShowErrorModal(true);
        }
    };

    const handleErrorContinue = () => {
        setShowErrorModal(false);
        router.push('/');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-cream to-ivory flex items-center justify-center">
                <p className="text-warmGray font-nunito">Cargando preguntas...</p>
            </div>
        );
    }

    // Si ya tiene acceso válido, mostrar mensaje
    if (hasAccess) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-cream to-ivory flex items-center justify-center p-0 md:p-8">
                <div className="w-full min-w-screen bg-white rounded-2xl shadow-xl border border-gold/20 px-3 py-6 md:p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gold/20 flex items-center justify-center">
                        <svg
                            className="w-8 h-8 text-gold"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    </div>
                    <h2
                        className="text-2xl font-bold text-burgundy mb-4"
                        style={{ fontFamily: "'Quintessential', cursive" }}
                    >
                        ¡Ya tienes acceso!
                    </h2>
                    <p className="text-warmGray font-nunito mb-6">
                        Tu dispositivo ya está registrado y tienes acceso al contenido exclusivo.
                    </p>
                    <div className="py-4">
                        {isMobile ? (
                            /* Mobile: cards verticales con botón visible */
                            <div className="flex flex-col gap-5" style={{ paddingTop: '36px' }}>
                                {/* Jacob card */}
                                <motion.div
                                    initial={{ opacity: 0, x: -50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ type: 'spring', stiffness: 200, damping: 24 }}
                                    className="relative flex rounded-2xl shadow-xl border border-white/10"
                                    style={{ minHeight: '170px', marginTop: '36px' }}
                                >
                                    <div aria-hidden className="absolute inset-0 rounded-2xl overflow-hidden">
                                        <div className="absolute inset-0 bg-cover bg-center filter blur-sm scale-105" style={{ backgroundImage: "url('/jacob_fondo.png')" }} />
                                        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-black/55 to-black/75" />
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-gold via-gold/60 to-transparent" />
                                    </div>
                                    <div className="relative z-10 flex w-full">
                                        <div className="flex-shrink-0 flex items-end" style={{ marginTop: '-36px' }}>
                                            <img src="/jacob_ficha.png" alt="Jacob" className="h-56 w-auto object-contain drop-shadow-2xl" style={{ viewTransitionName: 'character-image-jacob' }} />
                                        </div>
                                        <div className="flex flex-col justify-center px-3 py-4 gap-2 text-left">
                                            <span className="text-gold/80 text-[10px] uppercase tracking-widest font-semibold">Protagonista</span>
                                            <h3 className="text-xl font-bold text-white leading-tight" style={{ fontFamily: "'Quintessential', cursive" }}>
                                                Jacob<br />Montero
                                            </h3>
                                            <div className="w-8 h-px bg-gold/60" />
                                            <p className="text-xs text-white/80 leading-relaxed">
                                                Empresario de 33 años marcado por un pasado de violencia. Vive en constante lucha entre el control y el caos interno.
                                            </p>
                                            <button
                                                onClick={() => handleConverse('jacob')}
                                                disabled={!!selectedCharacter}
                                                className={`mt-1 self-start px-4 py-2 rounded-full text-sm font-semibold transition-colors ${selectedCharacter === 'jacob' ? 'bg-burgundy text-cream' : 'bg-burgundy/90 text-cream hover:bg-burgundy'}`}
                                            >
                                                Conversemos
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Helena card */}
                                <motion.div
                                    initial={{ opacity: 0, x: 50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ type: 'spring', stiffness: 200, damping: 24, delay: 0.12 }}
                                    className="relative flex rounded-2xl shadow-xl border border-white/10"
                                    style={{ minHeight: '170px', marginTop: '36px' }}
                                >
                                    <div aria-hidden className="absolute inset-0 rounded-2xl overflow-hidden">
                                        <div className="absolute inset-0 bg-cover bg-center filter blur-sm scale-105" style={{ backgroundImage: "url('/helena_fondo.png')" }} />
                                        <div className="absolute inset-0 bg-gradient-to-l from-black/20 via-black/55 to-black/75" />
                                        <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-gold via-gold/60 to-transparent" />
                                    </div>
                                    <div className="relative z-10 flex flex-row-reverse w-full">
                                        <div className="flex-shrink-0 flex items-end" style={{ marginTop: '-36px' }}>
                                            <img src="/helena_ficha.png" alt="Helena" className="h-56 w-auto object-contain drop-shadow-2xl" style={{ viewTransitionName: 'character-image-helena' }} />
                                        </div>
                                        <div className="flex flex-col justify-center px-3 py-4 gap-2 text-right flex-1">
                                            <span className="text-gold/80 text-[10px] uppercase tracking-widest font-semibold">Protagonista</span>
                                            <h3 className="text-xl font-bold text-white leading-tight" style={{ fontFamily: "'Quintessential', cursive" }}>
                                                Helena<br />Aspen
                                            </h3>
                                            <div className="w-8 h-px bg-gold/60 ml-auto" />
                                            <p className="text-xs text-white/80 leading-relaxed">
                                                Diseñadora de interiores marcada por el abuso. Aprende a reconstruir su identidad y a priorizarse a sí misma.
                                            </p>
                                            <button
                                                onClick={() => handleConverse('helena')}
                                                disabled={!!selectedCharacter}
                                                className={`mt-1 self-end px-4 py-2 rounded-full text-sm font-semibold transition-colors ${selectedCharacter === 'helena' ? 'bg-gold text-white' : 'bg-gold/90 text-white hover:bg-gold'}`}
                                            >
                                                Conversemos
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        ) : (
                            /* Desktop: panel animado con hover */
                            <div className="flex w-full h-72 rounded-xl overflow-hidden shadow-md">
                                {/* Left panel (Jacob) */}
                                <motion.div
                                    className={`relative flex items-center ${hoveredPanel && hoveredPanel !== 'left' ? 'blur-sm' : ''}`}
                                    style={{ transition: 'filter 200ms ease' }}
                                    onHoverStart={() => setHoveredPanel('left')}
                                    onHoverEnd={() => setHoveredPanel(null)}
                                    animate={{ flexBasis: hoveredPanel === 'left' ? '80%' : hoveredPanel === 'right' ? '20%' : '50%' }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                >
                                    <div aria-hidden className="absolute inset-0 bg-cover bg-center filter blur-sm scale-105" style={{ backgroundImage: "url('/jacob_fondo.png')" }} />
                                    <div className="relative w-full h-full flex items-center z-10">
                                        <motion.div className="flex-1 pl-6" animate={{ opacity: hoveredPanel ? 0 : 1 }} transition={{ duration: 0.18 }}>
                                            <div className="text-white">
                                                <div className="text-2xl md:text-3xl font-bold leading-tight">Jacob</div>
                                                <div className="text-lg md:text-xl font-semibold -mt-1">Montero</div>
                                            </div>
                                        </motion.div>
                                        <div className="flex-none flex items-center justify-center h-full">
                                            <motion.div
                                                className="relative h-full flex items-center justify-center overflow-hidden"
                                                animate={{ x: hoveredPanel === 'left' ? -60 : -50 }}
                                                transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                                            >
                                                <img src="/jacob_ficha.png" alt="Jacob" className="h-full w-auto object-contain" style={{ viewTransitionName: 'character-image-jacob' }} />
                                            </motion.div>
                                        </div>
                                        <motion.div className="flex-1 pr-6" animate={{ opacity: hoveredPanel === 'left' ? 1 : 0 }} transition={{ duration: 0.18 }}>
                                            {hoveredPanel === 'left' && (
                                                <div className="max-w-xs bg-black/50 p-4 rounded-lg">
                                                    <h3 className="text-xl font-semibold text-white">Jacob Montero</h3>
                                                    <div className="mt-2">
                                                        <button
                                                            onClick={() => handleConverse('jacob')}
                                                            disabled={!!selectedCharacter}
                                                            className={`px-4 py-2 rounded-full font-semibold transition-colors ${selectedCharacter === 'jacob' ? 'bg-burgundy text-cream' : 'bg-burgundy/90 text-cream hover:bg-burgundy'}`}
                                                        >
                                                            Conversemos
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    </div>
                                </motion.div>

                                {/* Right panel (Helena) */}
                                <motion.div
                                    className={`relative flex items-center ${hoveredPanel && hoveredPanel !== 'right' ? 'blur-sm' : ''}`}
                                    style={{ transition: 'filter 200ms ease' }}
                                    onHoverStart={() => setHoveredPanel('right')}
                                    onHoverEnd={() => setHoveredPanel(null)}
                                    animate={{ flexBasis: hoveredPanel === 'right' ? '80%' : hoveredPanel === 'left' ? '20%' : '50%' }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                >
                                    <div aria-hidden className="absolute inset-0 bg-cover bg-center filter blur-sm scale-105" style={{ backgroundImage: "url('/helena_fondo.png')" }} />
                                    <div className="relative w-full h-full flex items-center z-10">
                                        <div className="w-full h-full flex items-center">
                                            <motion.div className="flex-1 pl-6 text-left" animate={{ opacity: hoveredPanel === 'right' ? 1 : 0 }} transition={{ duration: 0.18 }}>
                                                {hoveredPanel === 'right' && (
                                                    <div className="max-w-xs bg-black/50 p-4 rounded-lg">
                                                        <h3 className="text-xl font-semibold text-white">Helena Aspen</h3>
                                                        <div className="mt-2">
                                                            <button
                                                                onClick={() => handleConverse('helena')}
                                                                disabled={!!selectedCharacter}
                                                                className={`px-4 py-2 rounded-full font-semibold transition-colors ${selectedCharacter === 'helena' ? 'bg-gold text-white' : 'bg-gold/90 text-white hover:bg-gold'}`}
                                                            >
                                                                Conversemos
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </motion.div>
                                            <div className="flex-none flex items-center justify-center h-full">
                                                <motion.div
                                                    className="relative h-full flex items-center justify-center overflow-hidden"
                                                    animate={{ x: hoveredPanel === 'right' ? 60 : 0 }}
                                                    transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                                                >
                                                    <img src="/helena_ficha.png" alt="Helena" className="h-full w-auto object-contain" style={{ viewTransitionName: 'character-image-helena' }} />
                                                </motion.div>
                                            </div>
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
                        )}
                    </div>
                    <button
                        onClick={() => router.push('/')}
                        className="px-6 py-3 bg-burgundy text-cream rounded-full font-semibold shadow-md hover:bg-burgundy/90 transition-all font-nunito"
                    >
                        Volver al inicio
                    </button>
                </div>
            </div>
        );
    }

    if (isFinished) {
        const passed = correctCount >= REQUIRED_CORRECT;
        return (
            <div className="min-h-screen bg-gradient-to-b from-cream to-ivory flex items-center justify-center p-4 md:p-8">
                <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gold/20 p-8 text-center">
                    <h2
                        className="text-2xl font-bold text-burgundy mb-4"
                        style={{ fontFamily: "'Quintessential', cursive" }}
                    >
                        {passed ? '¡Felicidades!' : 'Cuestionario completado'}
                    </h2>
                    <p className="text-warmGray font-nunito mb-6">
                        {passed
                            ? `¡Lo lograste! Obtuviste ${correctCount} respuestas correctas.`
                            : `Obtuviste ${correctCount} de ${REQUIRED_CORRECT} respuestas correctas necesarias.`}
                    </p>
                    <button
                        onClick={() => router.push('/')}
                        className="px-6 py-3 bg-burgundy text-cream rounded-full font-semibold shadow-md hover:bg-burgundy/90 transition-all font-nunito"
                    >
                        Volver al inicio
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Modal de error */}
            {showErrorModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl border border-gold/20 p-6 max-w-sm w-full text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-burgundy/10 flex items-center justify-center">
                            <svg
                                className="w-8 h-8 text-burgundy"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </div>
                        <h3
                            className="text-xl font-bold text-burgundy mb-2"
                            style={{ fontFamily: "'Quintessential', cursive" }}
                        >
                            Respuesta incorrecta
                        </h3>
                        <p className="text-warmGray font-nunito mb-6">
                            Lo sentimos, esa no era la respuesta correcta. Vuelve a intentarlo.
                        </p>
                        <button
                            onClick={handleErrorContinue}
                            className="w-full px-6 py-3 bg-burgundy text-cream rounded-full font-semibold shadow-md hover:bg-burgundy/90 transition-all font-nunito"
                        >
                            Continuar
                        </button>
                    </div>
                </div>
            )}

            <div className="min-h-screen bg-gradient-to-b from-cream to-ivory flex items-center justify-center p-4 md:p-8">
                <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gold/20 flex flex-col overflow-hidden">
                    {/* Header con progreso */}
                    <header className="bg-burgundy text-cream py-3 px-4">
                        <div className="flex items-center justify-between">
                            <h1
                                className="text-xl font-bold"
                                style={{ fontFamily: "'Quintessential', cursive" }}
                            >
                                Cuestionario
                            </h1>
                            <span className="text-sm font-nunito opacity-80">
                                {correctCount} / {REQUIRED_CORRECT} correctas
                            </span>
                        </div>
                        {/* Barra de progreso */}
                        <div className="mt-2 h-1 bg-cream/30 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gold transition-all duration-300"
                                style={{ width: `${(correctCount / REQUIRED_CORRECT) * 100}%` }}
                            />
                        </div>
                    </header>

                    {/* Pregunta */}
                    <main className="flex-1 p-6">
                        <h2 className="text-lg font-semibold text-burgundy mb-6 font-nunito">
                            {currentQuestion?.question}
                        </h2>

                        {/* Alternativas */}
                        <div className="space-y-3">
                            {currentQuestion?.answers.map((answer) => (
                                <label
                                    key={answer.id}
                                    className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all font-nunito ${selectedAnswer === answer.id
                                            ? 'border-burgundy bg-burgundy/5'
                                            : 'border-gold/30 hover:border-gold/60 bg-ivory/50'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="answer"
                                        value={answer.id}
                                        checked={selectedAnswer === answer.id}
                                        onChange={() => setSelectedAnswer(answer.id)}
                                        className="w-4 h-4 text-burgundy border-gold/50 focus:ring-burgundy/50"
                                    />
                                    <span className="ml-3 text-warmGray">{answer.text}</span>
                                </label>
                            ))}
                        </div>
                    </main>

                    {/* Footer con botón siguiente */}
                    <footer className="bg-ivory/50 border-t border-gold/20 p-4">
                        <button
                            onClick={handleNext}
                            disabled={selectedAnswer === null}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-burgundy text-cream rounded-full font-semibold shadow-md hover:bg-burgundy/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-nunito"
                        >
                            <span>Siguiente</span>
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5l7 7-7 7"
                                />
                            </svg>
                        </button>
                    </footer>
                </div>
            </div>
        </>
    );
}
