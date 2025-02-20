export const environment = {
    production: false,
    targetDomain: {
      domain: 'ch' 
    },
    stripePublishableKey: 'pk_test_51PVE08Ru80loAFQXg7MVGXFZuriJbluM9kOaTzZ0GteRhI0FIlkzkL2TSVDQ9QEIp1bZcVBzmzWne3fGkCITAy7X00gGODbR8a', // Your Stripe publishable key for production
    roles:[
      { role: "Admin", id: 1 },
      { role: "Club", id: 2 },
      { role: "Scout", id: 3 },
      { role: "Player", id: 4 },
    ],
    langs:[
      { language:'English', slug: "en", id: 1, flag: "England.svg" },
      { language:'German', slug: "de", id: 2, flag: "Germany.svg" },
      { language:'Italian', slug: "it", id: 3, flag: "Italy.svg"},
      { language:'French', slug: "fr", id: 4, flag: "France.svg"},
      { language:'Spanish', slug: "es", id: 5, flag: "Spain.svg" },
      { language:'Portuguese', slug: "pt", id: 6, flag: "Portugal.svg" },
      { language:'Danish', slug: "dk", id: 7, flag: "Denmark.svg" },
      { language:'Swedish', slug: "se", id: 8, flag: "Sweden-sweden.svg"},
    ],

    domains:[
      { name:'Switzerland', slug: "ch", id: 1, flag: "Switzerland.svg" },
      { name:'German', slug: "de", id: 2, flag: "Germany.svg" },
      { name:'Italy', slug: "it", id: 3, flag: "Italy.svg" },
      { name:'French Republic', slug: "fr", id: 4, flag: "France.svg" },
      { name:'United Kingdom', slug: "uk", id: 5, flag: "England.svg" },
      { name:'Estonia, Eswatini', slug: "es", id: 6, flag: "Spain.svg" },
      { name:'Portugal', slug: "pt", id: 7, flag: "Portugal.svg" },
      { name:'Belgium', slug: "be", id: 8, flag: "Belgium.svg" },
      { name:'Denmark', slug: "dk", id: 9, flag: "Denmark.svg" },
      { name:'Sweden', slug: "se", id: 10, flag: "Sweden-sweden.svg" },
    ],

    apiUrl:'https://api.socceryou.ch/api/',

    mailchimp: {
        apiUrl: 'https://us5.api.mailchimp.com/3.0/lists/7afbbb070a/members',
        apiKey: '62a0ffa8d6e9c3d5ed7c8a09e9111b41-us17',  // Correct API key
        listId: '7afbbb070a'
      }
  } as const;
  
