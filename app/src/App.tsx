import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Resultado } from './modules/semaforo/Resultado';
import { BarraNavegacion } from './ui/BarraNavegacion';
import { Encabezado } from './ui/Encabezado';
import { EnPreparacion } from './ui/EnPreparacion';

export function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <div className="min-h-screen bg-fondo text-gray-900">
        <Encabezado />
        {/* Padding inferior para que la barra fija no tape el contenido. */}
        <main className="mx-auto max-w-md px-4 pb-28 pt-4">
          <Routes>
            <Route path="/" element={<Navigate to="/evaluacion" replace />} />
            <Route path="/evaluacion" element={<EnPreparacion titulo="Evaluación" />} />
            <Route path="/camara" element={<EnPreparacion titulo="Cámara" />} />
            <Route path="/resultado" element={<Resultado />} />
            <Route path="/lenguas" element={<EnPreparacion titulo="Lenguas" />} />
            <Route path="/paciente" element={<EnPreparacion titulo="Paciente" />} />
            <Route path="*" element={<Navigate to="/evaluacion" replace />} />
          </Routes>
        </main>
        <BarraNavegacion />
      </div>
    </BrowserRouter>
  );
}
