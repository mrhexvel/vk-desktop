import { i18n, type Language } from "@/i18n";
import { useEffect, useState } from "react";

export function useTranslation() {
  const [language, setLanguage] = useState<Language>(i18n.getCurrentLanguage());

  useEffect(() => {
    const handleLanguageChange = () => {
      setLanguage(i18n.getCurrentLanguage());
    };

    window.addEventListener("languagechange", handleLanguageChange);
    return () =>
      window.removeEventListener("languagechange", handleLanguageChange);
  }, []);

  const changeLanguage = (newLanguage: Language) => {
    i18n.setLanguage(newLanguage);
    setLanguage(newLanguage);
    window.dispatchEvent(new Event("languagechange"));
  };

  return {
    t: i18n.t.bind(i18n),
    language,
    changeLanguage,
    availableLanguages: i18n.getAvailableLanguages(),
  };
}
