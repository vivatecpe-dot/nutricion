import React, { useState, useEffect, useCallback } from 'react';
import supabase from '../supabaseClient';
import { BmiData } from '../types';
import UserCard from './UserCard';

const AdminDashboard: React.FC = () => {
    const [registrations, setRegistrations] = useState<BmiData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const handleLogout = () => {
        sessionStorage.removeItem('isAdminAuthenticated');
        window.location.href = '/'; // Redirige a la página principal
    };

    const priorityMap: { [key: string]: number } = {
        'obesidad clase iii': 5,
        'obesidad clase ii': 4,
        'obesidad clase i': 3,
        'obesidad': 3,
        'sobrepeso': 2,
        'bajo peso': 1,
        'peso normal': 0,
    };

    const getPriority = (category: string) => {
        const lowerCaseCategory = category.toLowerCase();
        for (const key in priorityMap) {
            if (lowerCaseCategory.includes(key)) {
                return priorityMap[key];
            }
        }
        return -1; // Default/unknown
    };

    const fetchRegistrations = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        const { data, error } = await supabase
            .from('registros_imc')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching registrations:', error);
            setError('No se pudieron cargar los registros. Inténtalo de nuevo más tarde.');
        } else if (data) {
            const sortedData = data.sort((a, b) => getPriority(b.categoria) - getPriority(a.categoria));
            setRegistrations(sortedData as BmiData[]);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchRegistrations();
    }, [fetchRegistrations]);

    return (
        <div className="min-h-screen bg-gray-100 font-sans p-4 md:p-8">
            <header className="mb-8 text-center max-w-2xl mx-auto">
                <div className="flex justify-between items-center">
                    <a href="/" className="text-gray-500 hover:text-gray-800">&larr; Volver</a>
                    <button 
                        onClick={handleLogout}
                        className="bg-red-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-600 transition-colors duration-300 text-sm"
                    >
                        Cerrar Sesión
                    </button>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mt-4">Panel de Registros</h1>
                <p className="text-gray-600 mt-2">Lista de participantes ordenada por prioridad.</p>
            </header>
            <main className="max-w-2xl mx-auto">
                {isLoading && (
                    <div className="flex justify-center items-center py-16">
                        <svg className="animate-spin w-12 h-12 text-green-600" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                )}
                {error && <p className="text-red-500 text-center bg-red-100 p-4 rounded-lg">{error}</p>}
                {!isLoading && !error && (
                    registrations.length > 0 ? (
                        <div className="space-y-4">
                            {registrations.map((reg) => (
                                <UserCard key={reg.id} data={reg} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center mt-8">No hay registros todavía.</p>
                    )
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;