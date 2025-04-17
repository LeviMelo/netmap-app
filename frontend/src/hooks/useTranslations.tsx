import React, { useState, useEffect, createContext, useContext, ReactNode, useMemo } from 'react';
import en from '../locales/en.json';
import ptBR from '../locales/pt-BR.json';

// Define available languages and the structure of translations
export type Locale = 'en-US' | 'pt-BR'; // Export Locale type
export type TranslationKey = keyof typeof en; // Export key type based on 'en' structure

// Type for the translations object
type Translations = Record<TranslationKey, string>;

const translationsData: Record<Locale, Translations> = {
    'en-US': en,
    'pt-BR': ptBR,
};

interface LocalizationContextProps {
    locale: Locale;
    setLocale: React.Dispatch<React.SetStateAction<Locale>>; // Correct setter type
    t: (key: TranslationKey, params?: Record<string, string>) => string;
}

// Create context with undefined initial value, checked in hook
const LocalizationContext = createContext<LocalizationContextProps | undefined>(undefined);

// Define props for the provider explicitly
interface LocalizationProviderProps {
    children: ReactNode;
}

export const LocalizationProvider: React.FC<LocalizationProviderProps> = ({ children }) => {
    // Default to pt-BR, useEffect will set based on browser
    const [locale, setLocale] = useState<Locale>('pt-BR');

    // Set initial locale based on browser language, run only once
    useEffect(() => {
        const browserLang = navigator.language;
        if (browserLang.startsWith('pt')) {
             setLocale('pt-BR');
        } else {
             setLocale('en-US'); // Default fallback
        }
    }, []); // Empty dependency array ensures it runs only once

    // Memoize the translation function to avoid unnecessary recalculations
    const t = useMemo(() => {
        return (key: TranslationKey, params: Record<string, string> = {}): string => {
            // Get the dictionary for the current locale
            const currentTranslations = translationsData[locale];
            let translation = currentTranslations[key] || key.toString(); // Fallback to the key itself

            // Basic interpolation: replace {paramKey} with value
            Object.keys(params).forEach((paramKey) => {
                const regex = new RegExp(`\\{${paramKey}\\}`, 'g'); // Need 'g' flag for multiple replacements
                translation = translation.replace(regex, params[paramKey]);
            });
            return translation;
        };
    }, [locale]); // Recalculate 't' only when locale changes


    // Memoize the context value
    const contextValue = useMemo(() => ({
        locale,
        setLocale,
        t
    }), [locale, setLocale, t]); // Include 't' as it depends on 'locale'

    return (
        // Pass the memoized value to the provider
        <LocalizationContext.Provider value={contextValue}>
            {children}
        </LocalizationContext.Provider>
    );
};

// Custom hook to use translations, provides better error handling
export const useTranslations = (): LocalizationContextProps => {
    const context = useContext(LocalizationContext);
    if (context === undefined) {
        // This error means the hook was used outside of the provider
        throw new Error('useTranslations must be used within a LocalizationProvider');
    }
    return context;
};