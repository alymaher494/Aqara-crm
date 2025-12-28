'use client'

import { useState, useEffect } from 'react'
import { dictionaries, Language, Dictionary } from '@/lib/i18n/dictionaries'

export function useTranslation() {
  // بنحاول نجيب اللغة من اللوكال ستوريج، لو مفيش يبقى انجليزي
  const [lang, setLang] = useState<Language>('en')

  // عشان نتأكد اننا في الكلاينت مش السيرفر
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const storedLang = localStorage.getItem('app-lang') as Language
    if (storedLang && (storedLang === 'en' || storedLang === 'ar')) {
      setLang(storedLang)
      document.body.dir = storedLang === 'ar' ? 'rtl' : 'ltr'
    }
  }, [])

  const toggleLanguage = () => {
    const newLang = lang === 'en' ? 'ar' : 'en'
    setLang(newLang)
    localStorage.setItem('app-lang', newLang)
    document.body.dir = newLang === 'ar' ? 'rtl' : 'ltr'
    // بنعمل ريلود عشان الستايل يتظبط 100%
    window.location.reload()
  }

  const dir = lang === 'ar' ? 'rtl' : 'ltr'
  const t: Dictionary = dictionaries[lang]

  return {
    t,
    lang,
    dir,
    toggleLanguage,
    mounted
  }
}