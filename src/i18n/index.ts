import type { Language, Translations } from "./types"
import { en } from "./locales/en"
import { ru } from "./locales/ru"

const translations: Record<Language, Translations> = {
  en,
  ru,
}

class I18n {
  private currentLanguage: Language = "ru"
  private translations = translations

  constructor() {
    const savedLanguage = localStorage.getItem("language") as Language
    if (savedLanguage && this.translations[savedLanguage]) {
      this.currentLanguage = savedLanguage
    }
  }

  setLanguage(language: Language) {
    this.currentLanguage = language
    localStorage.setItem("language", language)
  }

  getCurrentLanguage(): Language {
    return this.currentLanguage
  }

  t(key: string, params?: Record<string, string | number>): string {
    const keys = key.split(".")
    let value: any = this.translations[this.currentLanguage]

    for (const k of keys) {
      value = value?.[k]
    }

    if (typeof value !== "string") {
      console.warn(`Translation key not found: ${key}`)
      return key
    }

    if (params) {
      return Object.entries(params).reduce((result, [param, val]) => {
        return result.replace(`{${param}}`, String(val))
      }, value)
    }

    return value
  }

  getAvailableLanguages(): Language[] {
    return Object.keys(this.translations) as Language[]
  }
}

export const i18n = new I18n()
export type { Language, Translations } from "./types"
