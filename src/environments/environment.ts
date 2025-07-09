export const environment = {
  production: false,
  googleApiKey: 'gfdgfhgfhfj',

  targetDomain: {
    name: 'Switzerland', domain: "ch", id: 1, default_lang: 1, flag: "Switzerland.svg"
  },

  stripePublishableKey: 'pk_test_51PVE08Ru80loAFQXg7MVGXFZuriJbluM9kOaTzZ0GteRhI0FIlkzkL2TSVDQ9QEIp1bZcVBzmzWne3fGkCITAy7X00gGODbR8a', // Your Stripe publishable key for production
  // stripePublishableKey: 'pk_live_51PVE08Ru80loAFQXNIL4kBDfjj9YNWZNgyZZQRzDJXl1Xc629uJkegyUbV3qCSnFyfVlaKlM4u1Qmrs4waZB6Q55001haMAUKO', // Your Stripe publishable key for production

  roles: [
    { role: "Admin", name: "Admin", slug: "admin", id: 1 },
    { role: "Club", name: "Club", slug: "club", id: 2 },
    { role: "Scout", name: "Scout", slug: "scout", id: 3 },
    { role: "Talent", name: "Talent", slug: "talent", id: 4 },
  ],

  roles_de: [
    { role: "Admin", name: "Admin", slug: "admin", id: 1 },
    { role: "Club", name: "Club", slug: "club", id: 2 },
    { role: "Scout", name: "Scout", slug: "scout", id: 3 },
    { role: "Talente", name: "Talente", slug: "talent", id: 4 },
  ],



  adminLangs: [
    { language: 'English', slug: "en", id: 1, flag: "England.svg" },
    { language: 'German', slug: "de", id: 2, flag: "Germany.svg" },
  ],

  // langs:[
  //   { language:'English', slug: "en", id: 1, flag: "England.svg" },
  //   { language:'German', slug: "de", id: 2, flag: "Germany.svg" },
  //   { language:'Italian', slug: "it", id: 3, flag: "Italy.svg"},
  //   { language:'French', slug: "fr", id: 4, flag: "France.svg"},
  //   { language:'Spanish', slug: "es", id: 5, flag: "Spain.svg" },
  //   { language:'Portuguese', slug: "pt", id: 6, flag: "Portugal.svg" },
  //   { language:'Danish', slug: "dk", id: 7, flag: "Denmark.svg" },
  //   { language:'Swedish', slug: "se", id: 8, flag: "Sweden-sweden.svg"},
  // ],

  // domains:[
  //   { name:'Switzerland', slug: "ch", id: 1, flag: "Switzerland.svg" },
  //   { name:'German', slug: "de", id: 2, flag: "Germany.svg" },
  //   { name:'Italy', slug: "it", id: 3, flag: "Italy.svg" },
  //   { name:'France', slug: "fr", id: 4, flag: "France.svg" },
  //   { name:'United Kingdom', slug: "uk", id: 5, flag: "England.svg" },
  //   { name:'Spain', slug: "es", id: 6, flag: "Spain.svg" },
  //   { name:'Portugal', slug: "pt", id: 7, flag: "Portugal.svg" },
  //   { name:'Belgium', slug: "be", id: 8, flag: "Belgium.svg" },
  //   { name:'Denmark', slug: "dk", id: 9, flag: "Denmark.svg" },
  //   { name:'Sweden', slug: "se", id: 10, flag: "Sweden-sweden.svg" },
  // ],

  langs: [
    { language: 'English', slug: 'en', id: 1, flag: 'England.svg', locale: 'en-US' },
    { language: 'German', slug: 'de', id: 2, flag: 'Germany.svg', locale: 'de-DE' },
    { language: 'Italian', slug: 'it', id: 3, flag: 'Italy.svg', locale: 'it-IT' },
    { language: 'French', slug: 'fr', id: 4, flag: 'France.svg', locale: 'fr-FR' },
    { language: 'Spanish', slug: 'es', id: 5, flag: 'Spain.svg', locale: 'es-ES' },
    { language: 'Portuguese', slug: 'pt', id: 6, flag: 'Portugal.svg', locale: 'pt-PT' },
    { language: 'Danish', slug: 'dk', id: 7, flag: 'Denmark.svg', locale: 'da-DK' },
    { language: 'Swedish', slug: 'sv', id: 8, flag: 'Sweden-sweden.svg', locale: 'sv-SE' },
  ],

  langs_de: [
    { language: 'Englisch', slug: 'en', id: 1, flag: 'England.svg', locale: 'en-US' },
    { language: 'Deutsch', slug: 'de', id: 2, flag: 'Germany.svg', locale: 'de-DE' },
    { language: 'Italienisch', slug: 'it', id: 3, flag: 'Italy.svg', locale: 'it-IT' },
    { language: 'Französisch', slug: 'fr', id: 4, flag: 'France.svg', locale: 'fr-FR' },
    { language: 'Spanisch', slug: 'es', id: 5, flag: 'Spain.svg', locale: 'es-ES' },
    { language: 'Portugiesisch', slug: 'pt', id: 6, flag: 'Portugal.svg', locale: 'pt-PT' },
    { language: 'Dänisch', slug: 'dk', id: 7, flag: 'Denmark.svg', locale: 'da-DK' },
    { language: 'Schwedisch', slug: 'sv', id: 8, flag: 'Sweden-sweden.svg', locale: 'sv-SE' },
  ],



  domains: [
    { name: 'Switzerland', slug: 'ch', id: 1, flag: 'Switzerland.svg', locale: 'de-CH' }, // Assuming German is predominant
    { name: 'German', slug: 'de', id: 2, flag: 'Germany.svg', locale: 'de-DE' },
    { name: 'Italy', slug: 'it', id: 3, flag: 'Italy.svg', locale: 'it-IT' },
    { name: 'France', slug: 'fr', id: 4, flag: 'France.svg', locale: 'fr-FR' },
    { name: 'United Kingdom', slug: 'uk', id: 5, flag: 'England.svg', locale: 'en-GB' },
    { name: 'Spain', slug: 'es', id: 6, flag: 'Spain.svg', locale: 'es-ES' },
    { name: 'Portugal', slug: 'pt', id: 7, flag: 'Portugal.svg', locale: 'pt-PT' },
    { name: 'Belgium', slug: 'be', id: 8, flag: 'Belgium.svg', locale: 'fr-BE' }, // or 'nl-BE' depending on the language
    { name: 'Denmark', slug: 'dk', id: 9, flag: 'Denmark.svg', locale: 'da-DK' },
    { name: 'Sweden', slug: 'se', id: 10, flag: 'Sweden-sweden.svg', locale: 'sv-SE' },
  ],


  domains_de: [
    { name: 'Schweiz', slug: 'ch', id: 1, flag: 'Switzerland.svg', locale: 'de-CH' }, // Assuming German is predominant
    { name: 'Deutschland', slug: 'de', id: 2, flag: 'Germany.svg', locale: 'de-DE' },
    { name: 'Italien', slug: 'it', id: 3, flag: 'Italy.svg', locale: 'it-IT' },
    { name: 'Frankreich', slug: 'fr', id: 4, flag: 'France.svg', locale: 'fr-FR' },
    { name: 'England', slug: 'uk', id: 5, flag: 'England.svg', locale: 'en-GB' },
    { name: 'Spanien', slug: 'es', id: 6, flag: 'Spain.svg', locale: 'es-ES' },
    { name: 'Portugal', slug: 'pt', id: 7, flag: 'Portugal.svg', locale: 'pt-PT' },
    { name: 'Belgien', slug: 'be', id: 8, flag: 'Belgium.svg', locale: 'fr-BE' }, // or 'nl-BE' depending on the language
    { name: 'Dänemark', slug: 'dk', id: 9, flag: 'Denmark.svg', locale: 'da-DK' },
    { name: 'Schweden', slug: 'se', id: 10, flag: 'Sweden-sweden.svg', locale: 'sv-SE' },
  ],


  // colors: [
  //   // Reds and Pinks
  //   '#FF0000', // Red
  //   '#FFCDD2', // Light Red
  //   '#DC143C', // Crimson
  //   '#FF4500', // Orange Red
  //   '#FF69B4', // Hot Pink
  //   '#FFC0CB', // Pink
  //   '#FF1493', // Deep Pink
  //   '#F8BBD0', // Light Pink

  //   // Oranges and Yellows
  //   '#FFA500', // Orange
  //   '#FFE0B2', // Light Orange
  //   '#FFD700', // Gold
  //   '#FFECB3', // Light Amber
  //   '#FFF9C4', // Light Yellow
  //   '#F0E68C', // Khaki
  //   '#FFDAB9', // Peach

  //   // Greens
  //   '#00FF00', // Lime Green
  //   '#C8E6C9', // Light Green
  //   '#008000', // Dark Green
  //   '#ADFF2F', // Green Yellow
  //   '#7CFC00', // Lawn Green
  //   '#3CB371', // Medium Sea Green
  //   '#B2DFDB', // Light Teal

  //   // Blues and Cyans
  //   '#0000FF', // Blue
  //   '#BBDEFB', // Light Blue
  //   '#1E90FF', // Dodger Blue
  //   '#4169E1', // Royal Blue
  //   '#00FFFF', // Cyan
  //   '#B2EBF2', // Light Cyan
  //   '#40E0D0', // Turquoise
  //   '#7FFFD4', // Aquamarine

  //   // Purples and Violets
  //   '#800080', // Purple
  //   '#E1BEE7', // Light Purple
  //   '#8A2BE2', // Blue Violet
  //   '#9370DB', // Medium Purple
  //   '#DA70D6', // Orchid
  //   '#EE82EE', // Violet
  //   '#DDA0DD', // Plum

  //   // Browns and Neutrals
  //   '#A52A2A', // Brown
  //   '#D7CCC8', // Light Brown
  //   '#CD853F', // Peru
  //   '#D2691E', // Chocolate
  //   '#F5F5F5', // Light Grey
  //   '#808080', // Gray
  //   '#C0C0C0', // Silver
  //   '#FFFFFF', // White
  //   '#000000', // Black

  //   // Additional Colors
  //   '#4B0082', // Indigo
  //   '#6A5ACD', // Slate Blue
  //   '#FF00FF', // Magenta
  //   '#E6E6FA', // Lavender
  //   '#FA8072', // Salmon
  //   '#CD5C5C', // Indian Red
  //   '#008080', // Teal
  //   '#000080', // Navy
  //   '#808000', // Olive
  // ],
  colors: [
    // Reds and Pinks
    '#FF0000', // Red
    '#e05263', // Light Mode red
    '#357525', // Light Mode Green
    '#bde34e' // Dark Mode Green
  ],

  pages: [
    'home', 'talent', 'clubs_and_scouts', 'about_us', 'pricing', 'news', 'contact', 'imprint', 'privacy_policy', 'terms_and_conditions', 'cookie_policy', 'faq', 'content_page'
  ],
  apiUrl: 'https://api.socceryou.ch/api/',
  url: 'https://api.socceryou.ch/',
  socketUrl: 'https://alerts.socceryou.ch/',
  mailchimp: {
    apiUrl: 'https://us5.api.mailchimp.com/3.0/lists/7afbbb070a/members',
    apiKey: '62a0ffa8d6e9c3d5ed7c8a09e9111b41-us17',  // Correct API key
  },

  //6Ld7hb8qAAAAAOVuEobWsckFQVqnzeqmXm6ljs_W
  //for staging : 6LegcsYqAAAAAGqGAxm-bpXs96qJdYcxBMIOrD26
  captchaKey: '6LdrnMcqAAAAAFF3MvbmI8vhzplwmf_EIUuQc1jZ'
} as const;

