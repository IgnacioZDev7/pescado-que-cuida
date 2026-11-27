import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Especie } from './modules/semaforo/Especie';
import { Inicio } from './modules/semaforo/Inicio';
import { Perfil } from './modules/semaforo/Perfil';
import { Rio } from './modules/semaforo/Rio';

export function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <main className="mx-auto min-h-screen max-w-md bg-white p-4 text-gray-900">
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/rio" element={<Rio />} />
          <Route path="/especie" element={<Especie />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
