import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translations
const resources = {
  en: {
    translation: {
      "Movies": "Movies",
      "TV Shows": "TV Shows",
      "Top Rated": "Top Rated",
      "Watchlist": "Watchlist",
      "Sign In": "Sign In",
      "Search for a movie or TV show...": "Search for a movie or TV show...",
      "Popular Movies": "Popular Movies",
      "Trending Now": "Trending Now",
      "Reviews": "Reviews",
      "Add Review": "Add Review"
    }
  },
  es: {
    translation: {
      "Movies": "Películas",
      "TV Shows": "Series",
      "Top Rated": "Mejor Valoradas",
      "Watchlist": "Mi Lista",
      "Sign In": "Iniciar Sesión",
      "Search for a movie or TV show...": "Buscar película o serie...",
      "Popular Movies": "Películas Populares",
      "Trending Now": "Tendencias",
      "Reviews": "Reseñas",
      "Add Review": "Añadir Reseña"
    }
  },
  fr: {
    translation: {
      "Movies": "Films",
      "TV Shows": "Séries",
      "Top Rated": "Mieux Notés",
      "Watchlist": "Ma Liste",
      "Sign In": "Se Connecter",
      "Search for a movie or TV show...": "Rechercher un film ou une série...",
      "Popular Movies": "Films Populaires",
      "Trending Now": "Tendances",
      "Reviews": "Avis",
      "Add Review": "Ajouter un Avis"
    }
  },
  hi: {
    translation: {
      "Movies": "फ़िल्में",
      "TV Shows": "टीवी शो",
      "Top Rated": "शीर्ष रेटेड",
      "Watchlist": "वॉचलिस्ट",
      "Sign In": "साइन इन करें",
      "Search for a movie or TV show...": "फ़िल्म या टीवी शो खोजें...",
      "Popular Movies": "लोकप्रिय फ़िल्में",
      "Trending Now": "ट्रेंडिंग",
      "Reviews": "समीक्षाएं",
      "Add Review": "समीक्षा जोड़ें"
    }
  },
  te: {
    translation: {
      "Movies": "సినిమాలు",
      "TV Shows": "టీవీ షోలు",
      "Top Rated": "టాప్ రేటెడ్",
      "Watchlist": "వాచ్ లిస్ట్",
      "Sign In": "సైన్ ఇన్",
      "Search for a movie or TV show...": "సినిమా లేదా టీవీ షో కోసం వెతకండి...",
      "Popular Movies": "ప్రసిద్ధ సినిమాలు",
      "Trending Now": "ట్రెండింగ్",
      "Reviews": "సమీక్షలు",
      "Add Review": "సమీక్ష రాయండి"
    }
  },
  de: {
    translation: {
      "Movies": "Filme",
      "TV Shows": "Serien",
      "Top Rated": "Am besten bewertet",
      "Watchlist": "Merkliste",
      "Sign In": "Anmelden",
      "Search for a movie or TV show...": "Film oder Serie suchen...",
      "Popular Movies": "Beliebte Filme",
      "Trending Now": "Im Trend",
      "Reviews": "Bewertungen",
      "Add Review": "Bewertung hinzufügen"
    }
  },
  zh: {
    translation: {
      "Movies": "电影",
      "TV Shows": "电视节目",
      "Top Rated": "最高评分",
      "Watchlist": "观看列表",
      "Sign In": "登录",
      "Search for a movie or TV show...": "搜索电影或电视节目...",
      "Popular Movies": "热门电影",
      "Trending Now": "当前趋势",
      "Reviews": "评论",
      "Add Review": "添加评论"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
