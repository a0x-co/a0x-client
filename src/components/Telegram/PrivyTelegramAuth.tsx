'use client';

import { useState, useEffect } from 'react';
import { useLoginWithTelegram, useLinkAccount } from '@privy-io/react-auth';
import axios from 'axios';

interface PrivyTelegramAuthProps {
  agentId: string;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export default function PrivyTelegramAuth({ agentId, onSuccess, onError }: PrivyTelegramAuthProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Para usuarios ya autenticados con Privy pero que quieren vincular su cuenta de Telegram
  const { linkTelegram } = useLinkAccount({
    onSuccess: async ({ user, linkedAccount }) => {
      try {
        setIsLoading(true);
        // Enviar los datos de Telegram vinculados al backend
        const response = await axios.post('/api/telegram-auth/privy-link', {
          agentId,
          telegramData: linkedAccount,
          privyUserId: user.id
        });
        
        if (onSuccess) {
          onSuccess(response.data);
        }
      } catch (err: any) {
        console.error('Error linking Telegram with Privy:', err);
        const message = err.response?.data?.error || 'Error linking Telegram account';
        setErrorMessage(message);
        if (onError) {
          onError(message);
        }
      } finally {
        setIsLoading(false);
      }
    },
    onError: (error) => {
      console.error('Privy Telegram linking error:', error);
      setErrorMessage('Failed to link Telegram account');
      if (onError) {
        onError('Failed to link Telegram account');
      }
    }
  });
  
  // Para usuarios que quieren autenticarse con Telegram directamente
  const { login: loginWithTelegram, state: telegramAuthState } = useLoginWithTelegram({
    onComplete: async ({ user, loginAccount }) => {
      try {
        setIsLoading(true);
        // Enviar los datos de autenticación de Telegram al backend
        const response = await axios.post('/api/telegram-auth/privy-auth', {
          agentId,
          telegramData: loginAccount,
          privyUserId: user.id
        });
        
        if (onSuccess) {
          onSuccess(response.data);
        }
      } catch (err: any) {
        console.error('Error authenticating with Telegram via Privy:', err);
        const message = err.response?.data?.error || 'Error authenticating with Telegram';
        setErrorMessage(message);
        if (onError) {
          onError(message);
        }
      } finally {
        setIsLoading(false);
      }
    },
    onError: (error) => {
      console.error('Privy Telegram auth error:', error);
      setErrorMessage('Failed to authenticate with Telegram');
      if (onError) {
        onError('Failed to authenticate with Telegram');
      }
    }
  });
  
  // Efecto para comprobar el estado de autenticación con Telegram
  useEffect(() => {
    if (telegramAuthState.status === 'error' && telegramAuthState.error) {
      setErrorMessage(telegramAuthState.error.message);
      if (onError) {
        onError(telegramAuthState.error.message);
      }
    }
  }, [telegramAuthState, onError]);
  
  const handleLoginClick = async () => {
    setErrorMessage(null);
    try {
      await loginWithTelegram();
    } catch (err: any) {
      console.error('Error initiating Telegram login:', err);
      setErrorMessage(err.message || 'Failed to initiate Telegram login');
      if (onError) {
        onError(err.message || 'Failed to initiate Telegram login');
      }
    }
  };
  
  const handleLinkClick = async () => {
    setErrorMessage(null);
    try {
      await linkTelegram();
    } catch (err: any) {
      console.error('Error initiating Telegram linking:', err);
      setErrorMessage(err.message || 'Failed to initiate Telegram linking');
      if (onError) {
        onError(err.message || 'Failed to initiate Telegram linking');
      }
    }
  };
  
  const isAuthenticating = telegramAuthState.status === 'loading' || isLoading;
  
  return (
    <div className="flex flex-col items-center w-full">
      <div className="flex space-x-4 mb-4">
        <button
          onClick={handleLoginClick}
          disabled={isAuthenticating}
          className="px-6 py-3 bg-[#2AABEE] hover:bg-[#229ED9] text-white font-medium rounded-lg transition-colors duration-300 disabled:bg-gray-300 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.665 3.717l-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42l10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701l-.314 4.692c.46 0 .663-.211.921-.46l2.211-2.15l4.599 3.397c.848.467 1.457.227 1.668-.785l3.019-14.228c.309-1.239-.473-1.8-1.282-1.433z"/>
          </svg>
          Connect as Administrator
        </button>
        
        <button
          onClick={handleLinkClick}
          disabled={isAuthenticating}
          className="px-6 py-3 bg-white border border-[#2AABEE] text-[#2AABEE] hover:bg-gray-50 font-medium rounded-lg transition-colors duration-300 disabled:bg-gray-50 disabled:text-gray-400 disabled:border-gray-300 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.665 3.717l-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42l10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701l-.314 4.692c.46 0 .663-.211.921-.46l2.211-2.15l4.599 3.397c.848.467 1.457.227 1.668-.785l3.019-14.228c.309-1.239-.473-1.8-1.282-1.433z"/>
          </svg>
          Link Existing Account
        </button>
      </div>
      
      {isAuthenticating && (
        <div className="text-center text-gray-600 mb-4">
          <p>Processing connection...</p>
        </div>
      )}
      
      {errorMessage && (
        <div className="p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg mb-4 w-full text-center">
          {errorMessage}
        </div>
      )}
    </div>
  );
} 