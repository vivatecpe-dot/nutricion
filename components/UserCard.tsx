import React, { useState } from 'react';
import { BmiData } from '../types';
import { WhatsappIcon } from './icons/WhatsappIcon';

interface UserCardProps {
    data: BmiData;
    onDelete: (id: number) => Promise<void>;
    onUpdateStatus: (id: number, newStatus: string) => Promise<void>;
    onUpdateNotes: (id: number, newNotes: string) => Promise<void>;
}

const UserCard: React.FC<UserCardProps> = ({ data, onDelete, onUpdateStatus, onUpdateNotes }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [notes, setNotes] = useState(data.notas || '');
    const [isSavingNotes, setIsSavingNotes] = useState(false);

    const getCategoryStyles = (category: string): { color: string, text: string } => {
        const lowerCaseCategory = category.toLowerCase();
        if (lowerCaseCategory.includes('obesidad')) return { color: 'bg-red-500', text: 'Prioridad Alta' };
        if (lowerCaseCategory.includes('sobrepeso')) return { color: 'bg-yellow-500', text: 'Prioridad Media' };
        if (lowerCaseCategory.includes('bajo peso')) return { color: 'bg-blue-500', text: 'Seguimiento' };
        if (lowerCaseCategory.includes('peso normal')) return { color: 'bg-green-500', text: 'Saludable' };
        return { color: 'bg-gray-400', text: 'Sin Clasificar' };
    };

    const handleWhatsAppClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        const userNumber = data.telefono.replace(/[^0-9]/g, '');
        const message = `¡Hola ${data.nombre}, soy Cindy Daboin! 😊 Vi que te registraste para calcular tu IMC. ¡Felicidades por dar este gran paso hacia una vida más saludable! Me encantaría conversar contigo y contarte cómo puedo ayudarte a alcanzar tus metas. ¿Tienes un momento para charlar?`;
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${userNumber}?text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    };

    const statusOptions = ['Nuevo', 'Contactado', 'Evaluación Agendada', 'Evaluación Realizada', 'En Acompañamiento', 'Seguimiento (Post-Evaluación)', 'No Interesado'];
    const currentStatus = data.estado || 'Nuevo';

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm(`¿Estás seguro de que quieres eliminar el registro de ${data.nombre}? Esta acción no se puede deshacer.`)) {
            if(!data.id) return;
            setIsDeleting(true);
            await onDelete(data.id);
        }
    };

    const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        e.stopPropagation();
        if(!data.id) return;
        const newStatus = e.target.value;
        setIsUpdating(true);
        await onUpdateStatus(data.id, newStatus);
        setIsUpdating(false);
    };
    
    const handleSaveNotes = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!data.id) return;
        setIsSavingNotes(true);
        await onUpdateNotes(data.id, notes);
        setIsSavingNotes(false);
    };

    const { color, text } = getCategoryStyles(data.categoria);

    return (
        <div 
            className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 ease-in-out cursor-pointer"
            onClick={() => setIsExpanded(!isExpanded)}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => e.key === 'Enter' && setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
        >
            <div className="flex items-center">
                <div className={`w-2 h-auto self-stretch flex-shrink-0 ${color}`}></div>
                <div className="p-4 w-full">
                    <div className="flex justify-between items-center">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
                            <h3 className="text-lg font-bold text-gray-800">{data.nombre}</h3>
                            <span className="text-sm text-gray-600">{currentStatus}</span>
                        </div>
                        <div className="flex items-center gap-2">
                             <div className={`hidden sm:block px-2 py-1 text-xs font-semibold text-white ${color} rounded-full`}>
                                {text}
                            </div>
                            <svg className={`w-5 h-5 text-gray-500 transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>

                    {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-gray-200 space-y-4" onClick={(e) => e.stopPropagation()}>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-600">
                                <p><span className="font-semibold">Teléfono:</span> <a href={`tel:${data.telefono}`} className="text-green-700 hover:underline">{data.telefono}</a></p>
                                <p><span className="font-semibold">Edad:</span> {data.edad} años</p>
                                <p><span className="font-semibold">Peso:</span> {data.peso} kg</p>
                                <p><span className="font-semibold">Altura:</span> {data.altura} cm</p>
                            </div>
                            
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
                                <p className="text-xs text-gray-500">Resultado IMC</p>
                                <p className="text-3xl font-bold text-gray-800">{data.imc}</p>
                                <p className="text-md font-semibold text-gray-700">{data.categoria}</p>
                            </div>

                            <button
                                onClick={handleWhatsAppClick}
                                className="w-full bg-green-500 text-white py-2.5 px-4 rounded-lg font-semibold hover:bg-green-600 transition-colors duration-300 flex items-center justify-center"
                                aria-label={`Contactar a ${data.nombre} por WhatsApp`}
                            >
                                <WhatsappIcon />
                                <span className="ml-2">Contactar por WhatsApp</span>
                            </button>

                            <div>
                                <label htmlFor={`notes-${data.id}`} className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                                <textarea id={`notes-${data.id}`} rows={3} className="w-full text-sm p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transition disabled:bg-gray-100" placeholder="Añadir una nota..." value={notes} onChange={(e) => setNotes(e.target.value)} disabled={isSavingNotes} />
                                <button onClick={handleSaveNotes} disabled={isSavingNotes || notes === (data.notas || '')} className="mt-2 w-full sm:w-auto bg-green-600 text-white py-1.5 px-4 rounded-md font-semibold hover:bg-green-700 transition-colors duration-300 flex items-center justify-center text-sm disabled:bg-gray-400 disabled:cursor-not-allowed">
                                    {isSavingNotes ? (<><svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>Guardando...</>) : 'Guardar Nota'}
                                </button>
                            </div>

                            <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
                                <div className="flex items-center space-x-2">
                                    <label htmlFor={`status-${data.id}`} className="text-sm font-medium text-gray-600">Estado:</label>
                                    <select id={`status-${data.id}`} value={currentStatus} onChange={handleStatusChange} disabled={isUpdating} className="text-sm rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 disabled:bg-gray-100 transition">
                                        {statusOptions.map(option => (<option key={option} value={option}>{option}</option>))}
                                    </select>
                                    {isUpdating && <svg className="animate-spin h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>}
                                </div>
                                <button onClick={handleDelete} disabled={isDeleting} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors duration-200 disabled:opacity-50" aria-label={`Eliminar a ${data.nombre}`}>
                                    {isDeleting ? 
                                        <svg className="animate-spin h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                                        :
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
                                    }
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserCard;