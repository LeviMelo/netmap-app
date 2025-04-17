import React, { useState, useEffect, createContext, useContext, ReactNode, useMemo } from 'react';
import en from '../locales/en.json';
import ptBR from '../locales/pt-BR.json';

// Define available languages and the structure of translations
export type Locale = 'en-US' | 'pt-BR';
export type TranslationKey = keyof typeof en;

// Type for the translations object
type Translations = Record<TranslationKey, string>;

const translationsData: Record<Locale, Translations> = {
    'en-US': en,
    'pt-BR': ptBR,
};

interface LocalizationContextProps {
    locale: Locale;
    setLocale: React.Dispatch<React.SetStateAction<Locale>>;
    t: (key: TranslationKey, params?: Record<string, string>) => string;
}

const LocalizationContext = createContext<LocalizationContextProps | undefined>(undefined);

interface LocalizationProviderProps {
    children: ReactNode;
}

export const LocalizationProvider: React.FC<LocalizationProviderProps> = ({ children }) => {
    const [locale, setLocale] = useState<Locale>('pt-BR'); // Default

    // Set initial locale based on browser language
    useEffect(() => {
        const browserLang = navigator.language;
        if (browserLang.startsWith('pt')) {
             setLocale('pt-BR');
        } else {
             setLocale('en-US');
        }
    }, []);


    const t = useMemo(() => {
        return (key: TranslationKey, params: Record<string, string> = {}): string => {
            const currentTranslations = translationsData[locale];
            let translation = currentTranslations[key] || key.toString();
            Object.keys(params).forEach((paramKey) => {
                const regex = new RegExp(`\\{${paramKey}\\}`, 'g');
                translation = translation.replace(regex, params[paramKey]);
            });
            return translation;
        };
    }, [locale]);


    const contextValue = useMemo(() => ({
        locale,
        setLocale,
        t
    }), [locale, setLocale, t]);

    return (
        <LocalizationContext.Provider value={contextValue}>
            {children}
        </LocalizationContext.Provider>
    );
};

export const useTranslations = (): LocalizationContextProps => {
    const context = useContext(LocalizationContext);
    if (context === undefined) {
        throw new Error('useTranslations must be used within a LocalizationProvider');
    }
    return context;
};