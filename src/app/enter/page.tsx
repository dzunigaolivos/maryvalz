'use client';

import { useState } from 'react';

export default function EnterPage() {
  const [key, setKey] = useState('');
  const [error, setError] = useState('');

  const from = typeof window !== 'undefined' ? new URL(window.location.href).searchParams.get('from') || '/' : '/';

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-4">Acceso restringido</h1>
        <p className="text-sm text-gray-600 mb-4">Introduce la clave para acceder a esta sección.</p>

        {/* Use a plain POST form so the browser handles Set-Cookie and redirect */}
        <form action="/api/grant" method="post" className="flex flex-col gap-3">
          <input
            name="key"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Clave"
            className="px-4 py-2 border rounded"
            type="password"
            autoFocus
          />
          <input type="hidden" name="to" value={from} />
          <button className="px-4 py-2 bg-burgundy text-cream rounded font-semibold">Entrar</button>
        </form>

        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
    </div>
  );
}
