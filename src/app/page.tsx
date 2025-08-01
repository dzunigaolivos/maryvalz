
'use client';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-100 via-blue-100 to-yellow-100 p-8">
      <div className="flex flex-col items-center gap-6 bg-white/80 rounded-2xl shadow-xl p-10 max-w-lg">
        <span className="text-6xl animate-bounce select-none">🦄</span>
        <h1 className="text-3xl font-bold text-gray-800 text-center">¡Ups! Aquí no hay nada que ver...</h1>
        <p className="text-lg text-gray-600 text-center">
          Has llegado a un rincón vacío de la web.<br />
          <span className="inline-block mt-2 text-2xl">¯\\_(ツ)_/¯</span>
        </p>
        <button
          className="mt-4 px-6 py-2 rounded-full bg-gradient-to-r from-pink-400 to-blue-400 text-white font-semibold shadow hover:scale-105 transition-transform"
          onClick={() => window.location.href = '/'}
        >
          Volver al inicio
        </button>
        <div className="mt-6 flex gap-2 text-2xl">
          <span className="animate-spin">🌈</span>
          <span className="animate-pulse">✨</span>
          <span className="animate-bounce">🎈</span>
        </div>
      </div>
      <footer className="mt-10 text-gray-400 text-sm text-center">
        <p>MaryValz &copy; {new Date().getFullYear()} — Nada por aquí, ¡pero sí buena onda!</p>
      </footer>
    </div>
  );
}
