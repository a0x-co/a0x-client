'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

type TelegramUser = {
  id: string;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
};

interface TelegramLoginProps {
  botUsername: string; // Nombre de usuario del bot de Telegram
  agentId: string;     // ID del agente al que se vinculará la autenticación
  buttonSize?: 'large' | 'medium' | 'small';
  cornerRadius?: number;
  requestAccess?: 'write';
  showUserpic?: boolean;
  onAuthCallback?: (success: boolean, userData?: any) => void;
}

/**
 * Componente para integrar el widget de login de Telegram
 */
export default function TelegramLoginWidget({
  botUsername,
  agentId,
  buttonSize = 'medium',
  cornerRadius = 20,
  requestAccess,
  showUserpic = true,
  onAuthCallback
}: TelegramLoginProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función que será llamada por el widget de Telegram cuando se complete la autenticación
  const handleTelegramAuth = async (telegramUser: TelegramUser) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Enviar datos de autenticación a nuestro endpoint
      const response = await axios.post('/api/telegram-auth', {
        telegramData: telegramUser,
        agentId
      });
      
      console.log('Telegram authentication successful:', response.data);
      
      // Llamar al callback si se proporcionó
      if (onAuthCallback) {
        onAuthCallback(true, response.data);
      }
    } catch (error: any) {
      console.error('Error during Telegram authentication:', error);
      
      // Extraer mensaje de error detallado si está disponible
      let errorMessage = 'Authentication failed';
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.details) {
        errorMessage = error.response.data.details;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      
      // Llamar al callback de error si se proporcionó
      if (onAuthCallback) {
        onAuthCallback(false, { error: errorMessage });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar el script de Telegram al montar el componente
  useEffect(() => {
    // Definir la función global que será llamada por el widget
    window.onTelegramAuth = handleTelegramAuth;
    
    // Crear y cargar el script de Telegram
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.async = true;
    script.setAttribute('data-telegram-login', botUsername);
    script.setAttribute('data-size', buttonSize);
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.setAttribute('data-radius', cornerRadius.toString());
    
    if (requestAccess) {
      script.setAttribute('data-request-access', requestAccess);
    }
    
    if (showUserpic) {
      script.setAttribute('data-userpic', 'true');
    }
    
    // Agregar el script al documento
    document.body.appendChild(script);
    
    // Limpiar al desmontar
    return () => {
      document.body.removeChild(script);
      // Asignar undefined en lugar de usar delete
      window.onTelegramAuth = undefined as any;
    };
  }, [botUsername, buttonSize, cornerRadius, requestAccess, showUserpic]);

  return (
    <div className="telegram-login-container">
      {/* Widget container - el script se cargará aquí */}
      <div id="telegram-login"></div>
      
      {isLoading && <p>Authenticating...</p>}
      {error && <p className="error">{error}</p>}
      
      <style jsx>{`
        .telegram-login-container {
          margin: 20px 0;
        }
        .error {
          color: red;
          margin-top: 10px;
        }
      `}</style>
    </div>
  );
}

// Añadir la propiedad al objeto window para TypeScript
declare global {
  interface Window {
    onTelegramAuth?: (user: TelegramUser) => void;
  }
} 