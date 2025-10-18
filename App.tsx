import React, { useState } from 'react';
import { BmiData } from './types';
import RegistrationForm from './components/RegistrationForm';
import ResultModal from './components/ResultModal';
import HeaderIcon from './components/icons/HeaderIcon';


const App: React.FC = () => {
  const [result, setResult] = useState<BmiData | null>(null);

  const handleSuccess = (data: BmiData) => {
    setResult(data);
  };

  const handleCloseModal = () => {
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center font-sans p-4">
      <header className="mb-8 text-center w-full max-w-md">
        <div className="inline-flex items-center justify-center p-4 bg-white rounded-full shadow-lg mb-4">
            <HeaderIcon />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
            ¡Transforma Tu Vida!
        </h1>
      </header>
      <main className="w-full flex justify-center">
         <RegistrationForm onSuccess={handleSuccess} />
         {result && <ResultModal data={result} onClose={handleCloseModal} />}
      </main>
      <footer className="mt-8 text-center text-gray-500 text-sm">
        <p>"Hoy es tu oportunidad de construir el mañana que quieres."</p>
      </footer>
    </div>
  );
};

export default App;