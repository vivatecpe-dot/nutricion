import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { BmiData } from '../types';
import LoadingSpinner from './LoadingSpinner';
import { UserIcon, PhoneIcon, CalendarIcon, SendIcon } from './icons/FormIcons';
import supabase from '../supabaseClient';

interface RegistrationFormProps {
    onSuccess: (data: BmiData) => void;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ onSuccess }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        telefono: '',
        edad: '',
        peso: '',
        altura: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const { nombre, telefono } = formData;
        const edad = parseInt(formData.edad);
        const peso = parseFloat(formData.peso);
        const altura = parseFloat(formData.altura);

        if (isNaN(edad) || isNaN(peso) || isNaN(altura) || altura <= 0 || peso <= 0 || edad <= 0) {
            setError('Por favor, introduce valores numéricos positivos y válidos para edad, peso y altura.');
            setIsLoading(false);
            return;
        }

        const alturaM = altura / 100;
        const imc = parseFloat((peso / (alturaM * alturaM)).toFixed(2));

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const prompt = `Una persona con un IMC de ${imc} ¿en qué categoría de peso se encuentra según la OMS? Responde SOLO con el nombre de la categoría en español (ej: "Bajo peso", "Peso normal", "Sobrepeso", "Obesidad clase I").`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });

            const categoria = response.text.trim();

            const resultData: BmiData = {
                nombre,
                telefono,
                edad,
                peso,
                altura,
                imc,
                categoria,
            };
            
            // Guardar en Supabase
            const { error: supabaseError } = await supabase
                .from('registros_imc')
                .insert([resultData]);

            if (supabaseError) {
                console.error('Supabase error:', supabaseError);
                throw new Error('No se pudo guardar el registro en la base de datos.');
            }

            onSuccess(resultData);
            // Reiniciar el formulario
            setFormData({
                nombre: '',
                telefono: '',
                edad: '',
                peso: '',
                altura: '',
            });

        } catch (err) {
            console.error(err);
            const errorMessage = (err instanceof Error && err.message.includes('Supabase'))
                ? 'Hubo un error al guardar tu registro. Por favor, inténtalo de nuevo.'
                : 'No se pudo obtener la categoría de IMC. Por favor, inténtalo de nuevo más tarde.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <UserIcon />
                    </span>
                    <input
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        placeholder="Nombre completo"
                        required
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                </div>
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <PhoneIcon />
                    </span>
                    <input
                        type="tel"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleChange}
                        placeholder="Teléfono"
                        required
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                </div>
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <CalendarIcon />
                    </span>
                    <input
                        type="number"
                        name="edad"
                        value={formData.edad}
                        onChange={handleChange}
                        placeholder="Edad"
                        required
                        min="1"
                        inputMode="numeric"
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                        <input
                            type="number"
                            name="peso"
                            value={formData.peso}
                            onChange={handleChange}
                            placeholder="Peso (kg)"
                            required
                            step="0.1"
                            min="1"
                            inputMode="decimal"
                            className="w-full pl-4 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>
                    <div className="relative">
                         <input
                            type="number"
                            name="altura"
                            value={formData.altura}
                            onChange={handleChange}
                            placeholder="Altura (cm)"
                            required
                            min="1"
                            inputMode="decimal"
                            className="w-full pl-4 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>
                </div>

                {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors duration-300 flex items-center justify-center disabled:bg-gray-400"
                >
                    {isLoading ? <LoadingSpinner /> : (
                        <>
                            <span className="mr-2">¡Empezar mi transformación!</span>
                            <SendIcon />
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default RegistrationForm;