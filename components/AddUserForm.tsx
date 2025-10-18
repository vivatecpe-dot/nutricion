import React, { useState, useEffect } from 'react';
import supabase from '../supabaseClient';
import { BmiData } from '../types';
import LoadingSpinner from './LoadingSpinner';

interface AddUserFormProps {
    onClose: () => void;
    onSuccess: () => void;
}

const getBmiCategory = (imc: number): string => {
    if (imc < 18.5) return 'Bajo peso';
    if (imc >= 18.5 && imc < 25) return 'Peso normal';
    if (imc >= 25 && imc < 30) return 'Sobrepeso';
    if (imc >= 30 && imc < 35) return 'Obesidad clase I';
    if (imc >= 35 && imc < 40) return 'Obesidad clase II';
    if (imc >= 40) return 'Obesidad clase III';
    return 'Categoría no determinada';
};

const bmiCategories = [
    'Bajo peso',
    'Peso normal',
    'Sobrepeso',
    'Obesidad clase I',
    'Obesidad clase II',
    'Obesidad clase III',
];

const AddUserForm: React.FC<AddUserFormProps> = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        telefono: '',
        edad: '',
        peso: '',
        altura: '',
        imc: '',
        categoria: 'Peso normal',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const peso = parseFloat(formData.peso);
        const altura = parseFloat(formData.altura);

        if (!isNaN(peso) && peso > 0 && !isNaN(altura) && altura > 0) {
            const alturaM = altura / 100;
            const calculatedImc = parseFloat((peso / (alturaM * alturaM)).toFixed(2));
            const calculatedCategory = getBmiCategory(calculatedImc);
            setFormData(prev => ({
                ...prev,
                imc: calculatedImc.toString(),
                categoria: calculatedCategory,
            }));
        }
    }, [formData.peso, formData.altura]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const { nombre, telefono, categoria } = formData;
        const edad = parseInt(formData.edad);
        const peso = parseFloat(formData.peso);
        const altura = parseFloat(formData.altura);
        const imc = parseFloat(formData.imc);

        if (isNaN(edad) || isNaN(peso) || isNaN(altura) || isNaN(imc) || altura <= 0 || peso <= 0 || edad <= 0) {
            setError('Por favor, introduce valores numéricos positivos y válidos.');
            setIsLoading(false);
            return;
        }

        const resultData: Omit<BmiData, 'id' | 'created_at'> = {
            nombre,
            telefono,
            edad,
            peso,
            altura,
            imc,
            categoria,
        };
        
        try {
            const { error: supabaseError } = await supabase
                .from('registros_imc')
                .insert([resultData]);

            if (supabaseError) {
                console.error('Supabase error:', supabaseError);
                throw new Error('No se pudo guardar el registro en la base de datos.');
            }

            onSuccess();

        } catch (err) {
            console.error(err);
            setError('Hubo un error al guardar el registro. Por favor, inténtalo de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300" onClick={onClose}>
            <div 
                className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-lg p-6 overflow-y-auto animate-slide-in-right"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Añadir Nuevo Registro</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
                        <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Ej: Juan Pérez" required className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                        <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} placeholder="Ej: 51987654321" required className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Edad</label>
                        <input type="number" name="edad" value={formData.edad} onChange={handleChange} placeholder="Ej: 30" required min="1" inputMode="numeric" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Peso (kg)</label>
                            <input type="number" name="peso" value={formData.peso} onChange={handleChange} placeholder="Ej: 70.5" required step="0.1" min="1" inputMode="decimal" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Altura (cm)</label>
                            <input type="number" name="altura" value={formData.altura} onChange={handleChange} placeholder="Ej: 165" required min="1" inputMode="decimal" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
                        </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border">
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Resultado IMC (auto-calculado)</h3>
                        <div className="grid grid-cols-2 gap-4">
                           <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">IMC</label>
                                <input type="number" name="imc" value={formData.imc} onChange={handleChange} required step="0.01" inputMode="decimal" className="w-full px-4 py-2 border rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                                <select name="categoria" value={formData.categoria} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500">
                                    {bmiCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors duration-300 flex items-center justify-center disabled:bg-gray-400"
                        >
                            {isLoading ? <LoadingSpinner /> : 'Guardar Registro'}
                        </button>
                    </div>
                </form>
            </div>
            <style>{`
                @keyframes slide-in-right {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
                .animate-slide-in-right {
                    animation: slide-in-right 0.3s ease-out;
                }
            `}</style>
        </div>
    );
};

export default AddUserForm;
