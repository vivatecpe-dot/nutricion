import React from 'react';
import { BmiData } from '../types';
import { WhatsappIcon } from './icons/WhatsappIcon';

interface UserCardProps {
    data: BmiData;
}

const UserCard: React.FC<UserCardProps> = ({ data }) => {
    
    const getCategoryStyles = (category: string): { color: string, text: string } => {
        const lowerCaseCategory = category.toLowerCase();
        if (lowerCaseCategory.includes('obesidad')) {
            return { color: 'bg-red-500', text: 'Prioridad Alta' };
        }
        if (lowerCaseCategory.includes('sobrepeso')) {
            return { color: 'bg-yellow-500', text: 'Prioridad Media' };
        }
        if (lowerCaseCategory.includes('bajo peso')) {
            return { color: 'bg-blue-500', text: 'Seguimiento' };
        }
        if (lowerCaseCategory.includes('peso normal')) {
            return { color: 'bg-green-500', text: 'Saludable' };
        }
        return { color: 'bg-gray-400', text: 'Sin Clasificar' };
    };

    const handleWhatsAppClick = () => {
        const userNumber = data.telefono.replace(/[^0-9]/g, '');
        const message = `¡Hola ${data.nombre}, soy Cindy Daboin! 😊 Vi que te registraste para calcular tu IMC. ¡Felicidades por dar este gran paso hacia una vida más saludable! Me encantaría conversar contigo y contarte cómo puedo ayudarte a alcanzar tus metas. ¿Tienes un momento para charlar?`;
        const encodedMessage = encodeURIComponent(message);
        // Assuming the number includes country code for WhatsApp `wa.me` link
        const whatsappUrl = `https://wa.me/${userNumber}?text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    };

    const { color, text } = getCategoryStyles(data.categoria);

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden flex" role="listitem">
            <div className={`w-2 flex-shrink-0 ${color}`}></div>
            <div className="p-4 w-full">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-800">{data.nombre}</h3>
                    <div className={`px-2 py-1 text-xs font-semibold text-white ${color} rounded-full`}>
                        {text}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-600 mb-4">
                    <p><span className="font-semibold">Teléfono:</span> <a href={`tel:${data.telefono}`} className="text-green-700 hover:underline">{data.telefono}</a></p>
                    <p><span className="font-semibold">Edad:</span> {data.edad} años</p>
                    <p><span className="font-semibold">Peso:</span> {data.peso} kg</p>
                    <p><span className="font-semibold">Altura:</span> {data.altura} cm</p>
                </div>
                
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center mb-4">
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
            </div>
        </div>
    );
};

export default UserCard;