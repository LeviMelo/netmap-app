import React, { useState, useEffect, createContext, useContext, ReactNode, useMemo } from 'react';
// Import locale files directly
import en from '../locales/en.json';
import ptBR from '../locales/pt-BR.json';

// Define available languages
export type Locale = 'en-US' | 'pt-BR';
// ** Derive TranslationKey type directly from the imported en.json **
export type TranslationKey = string; // TEMP: Relax for dev speed

// Type for the translations object using the derived key type
type Translations = Record<TranslationKey, string>;

const translationsData: Record<Locale, Translations> = {
    'en-US': en,
    'pt-BR': ptBR, // Ensure this matches the imported ptBR structure
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
    const [locale, setLocale] = useState<Locale>('pt-BR');

    useEffect(() => { /* ... Set initial locale ... */ }, []);

    const t = useMemo(() => {
        return (key: TranslationKey, params: Record<string, string> = {}): string => {
            const currentTranslations = translationsData[locale];
            // Ensure key exists before accessing - fallback to key itself
            let translation = (currentTranslations && key in currentTranslations)
                                ? currentTranslations[key]
                                : key.toString();
            Object.keys(params).forEach((paramKey) => {
                const regex = new RegExp(`\\{${paramKey}\\}`, 'g');
                translation = translation.replace(regex, params[paramKey]);
            });
            return translation;
        };
    }, [locale]);

    const contextValue = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

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