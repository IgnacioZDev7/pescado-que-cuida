import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Paciente } from './modules/paciente/Paciente';
import { Evaluacion } from './modules/semaforo/Evaluacion';
import { Resultado } from './modules/semaforo/Resultado';
import { Camara } from './modules/vision/Camara';
import { Lenguas } from './modules/voz/Lenguas';
import { BarraNavegacion } from './ui/BarraNavegacion';
import { Encabezado } from './ui/Encabezado';

export function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <div className="min-h-screen bg-fondo text-gray-900">
        <Encabezado />
        {/* Padding inferior para que la barra fija no tape el contenido. */}
        <main className="mx-auto max-w-md px-4 pb-28 pt-4">
          <Routes>
            <Route path="/" element={<Navigate to="/evaluacion" replace />} />
            <Route path="/evaluacion" element={<Evaluacion />} />
            <Route path="/camara" element={<Camara />} />
            <Route path="/resultado" element={<Resultado />} />
            <Route path="/lenguas" element={<Lenguas />} />
            <Route path="/paciente" element={<Paciente />} />
            <Route path="*" element={<Navigate to="/evaluacion" replace />} />
          </Routes>
        </main>
        <BarraNavegacion />
      </div>
    </BrowserRouter>
  );
}
