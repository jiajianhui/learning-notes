import { Recipe } from "./types/recipe";

// 网格卡片数据
export const recipes: Recipe[] = [
  {
    id: 0,
    slug: "james-hoffmanns-ultimate-aeropress-recipe",

    source: {
      name: "From a Barista",
      icon: "/recipeIcon/noun_tamper.svg",
    },

    title: "James Hoffmann's Ultimate AeroPress Recipe",
    description: "James Hoffmann's Ultimate AeroPress Recipe",

    hasVideo: true,
    isCold: false,

    stats: {
      votes: 1116,
      saves: 0,
      comments: 0,
    },

    creator: {
      name: "James Hoffmann",
      introduction:
        "James Hoffmann presents a simple AeroPress method that challenges common assumptions about rinsing and preheating.",
    },

    introduction: [
      "James Hoffmann's Ultimate AeroPress recipe - the AeroPress recipe everyone has been waiting for!",
      "James presents us with a simple, and tasty recipe that throws away a lot of AeroPress misconceptions such as rinsing your paper filter and preheating your AeroPress. James also prefers to swirl, not stir.",
      "This recipe is a great starting point for any AeroPress enthusiast - once you get it wired, use it as a base for other recipe experiments."
    ],

    notes: [
      "Use water between 90°C and 95°C for medium roast coffee.",
      "Use water between 85°C and 90°C for dark roast coffee.",
      "There is no need to rinse the filter or preheat the brewer.",
    ],

    recipeDetails: {
      orientation: "Standard",
      brewTime: 200,
      filterType: "Paper",
      filterCount: 1,
      ratio: "1:18.2",
    },

    coffee: {
      amount: 11,
      unit: "g",
      description: "Light roast",
    },

    grind: {
      size: "Finer end of medium",
    },

    water: {
      amount: 200,
      unit: "g",
      temperatureCelsius: 99,
      temperatureFahrenheit: 210,
    },

    equipment: [
      {
        name: "AeroPress",
        url: "https://aeropress.com/",
      },
    ],

    steps: [
      {
        id: 1,
        text: "Place the AeroPress in the standard position over a server.",
      },
      {
        id: 2,
        text: "Add the coffee and quickly pour in all 200g of water.",
      },
      {
        id: 3,
        text: "Insert the plunger slightly to create a seal and prevent dripping.",
      },
      {
        id: 4,
        text: "Leave the coffee to steep for 2 minutes.",
      },
      {
        id: 5,
        text: "Hold the brewer securely and give it a gentle swirl.",
      },
      {
        id: 6,
        text: "Wait for another 30 seconds.",
      },
      {
        id: 7,
        text: "Press gently for approximately 30 seconds.",
      },
      {
        id: 8,
        text: "Serve the coffee and enjoy.",
      },
    ],
  },

  {
    id: 1,
    slug: "13g-that-makes-you-happy",

    source: {
      name: "From an Enthusiast",
      icon: "/recipeIcon/icon_enthusiast.svg",
    },

    title: "13g that makes you happy",
    description:
      "Quick & simple. Guaranteed happiness with this clean, balanced and sweet cup.",

    hasVideo: true,
    isCold: false,

    stats: {
      votes: 851,
      saves: 0,
      comments: 0,
    },

    creator: {
      name: "Sigit Tri",
      introduction:
        "Sigit Tri created a simple recipe designed to produce a balanced, sweet and well-extracted cup.",
    },

    introduction: [
      "This recipe works well with many different coffee processing methods.",
      "It uses a short bloom followed by a longer inverted immersion.",
    ],

    notes: [
      "Add five more stirs or extend the bloom by 10 seconds when more extraction is needed.",
      "A variation uses 13.5g of coffee with water at 88°C.",
    ],

    recipeDetails: {
      orientation: "Inverted",
      brewTime: 150,
      filterType: "Paper",
      filterCount: 1,
      ratio: "1:13.8",
    },

    coffee: {
      amount: 13,
      unit: "g",
      description: "Honey processed coffee",
    },

    grind: {
      size: "Coarse",
    },

    water: {
      amount: 180,
      unit: "g",
      temperatureCelsius: 90,
      temperatureFahrenheit: 194,
    },

    equipment: [
      {
        name: "AeroPress",
        url: "https://aeropress.com/",
      },
      {
        name: "Hario Buono Gooseneck Kettle",
      },
      {
        name: "Hario V60 Drip Scale",
      },
    ],

    steps: [
      {
        id: 1,
        text: "Prepare the AeroPress in the inverted position.",
      },
      {
        id: 2,
        text: "Add 13g of ground coffee.",
      },
      {
        id: 3,
        text: "Pour in 30g of water, stir five times and bloom for 30 seconds.",
      },
      {
        id: 4,
        text: "At 0:30, continue pouring until the total water reaches 180g.",
      },
      {
        id: 5,
        text: "Stir another five times and wait until 1:30.",
      },
      {
        id: 6,
        text: "Flip the AeroPress and press slowly for approximately 1 minute.",
      },
      {
        id: 7,
        text: "Rest the coffee briefly before serving.",
      },
    ],
  },

  {
    id: 2,
    slug: "james-hoffmann",

    source: {
      name: "From a Barista",
      icon: "/recipeIcon/noun_tamper.svg",
    },

    title: "James Hoffmann",
    description:
      "James Hoffmann's AeroPress recipe for making a good milk based coffee at home.",

    hasVideo: true,
    isCold: false,

    stats: {
      votes: 543,
      saves: 0,
      comments: 0,
    },

    creator: {
      name: "James Hoffmann",
      introduction:
        "James Hoffmann developed this concentrated AeroPress recipe as the coffee base for a milk drink.",
    },

    introduction: [
      "This method produces a small and strong coffee suitable for combining with warm or steamed milk.",
      "The coffee should be ground slightly coarser than espresso but finer than a typical filter grind.",
    ],

    notes: [
      "Use water immediately after boiling.",
      "Press through the bubbling sound to extract as much liquid as possible.",
      "The recipe should produce approximately 65g to 70g of concentrated coffee.",
    ],

    recipeDetails: {
      orientation: "Inverted",
      brewTime: 120,
      filterType: "Paper",
      filterCount: 1,
      ratio: "1:5",
    },

    coffee: {
      amount: 18,
      unit: "g",
      description: "Dark roast or espresso blend",
    },

    grind: {
      size: "Fine to medium-fine",
    },

    water: {
      amount: 90,
      unit: "g",
      temperatureCelsius: 100,
      temperatureFahrenheit: 212,
    },

    equipment: [
      {
        name: "AeroPress",
        url: "https://aeropress.com/",
      },
    ],

    steps: [
      {
        id: 1,
        text: "Preheat the AeroPress and place it in the inverted position.",
      },
      {
        id: 2,
        text: "Insert the plunger approximately halfway into the chamber.",
      },
      {
        id: 3,
        text: "Add 18g of ground coffee.",
      },
      {
        id: 4,
        text: "Pour in 90g of hot water.",
      },
      {
        id: 5,
        text: "Stir thoroughly until all dry clumps are broken apart.",
      },
      {
        id: 6,
        text: "Attach the filter cap and leave the coffee for 90 seconds.",
      },
      {
        id: 7,
        text: "Flip the AeroPress and give it a gentle swirl.",
      },
      {
        id: 8,
        text: "Press slowly and continue through the final bubbling sound.",
      },
      {
        id: 9,
        text: "Check that the brew produces approximately 65g to 70g of coffee.",
      },
      {
        id: 10,
        text: "Add warm, steamed or frothed milk before serving.",
      },
    ],
  },

  {
    id: 3,
    slug: "love-me-some-acid",

    source: {
      name: "Championship",
      icon: "/recipeIcon/cat_crown.svg",
    },

    title: "Love me some acid",
    description:
      "2018 Portugal Aeropress Champion shares a recipe to hero the acidy fruitiness of the coffee.",

    hasVideo: true,
    isCold: false,

    stats: {
      votes: 465,
      saves: 0,
      comments: 0,
    },

    creator: {
      name: "Kata Muhel",
      introduction: "Kata Muhel is the 2018 Portuguese AeroPress champion.",
    },

    introduction: [
      "This championship recipe is designed to emphasize bright acidity and fruity flavours.",
      "It combines relatively cool brewing water with a short immersion and press.",
    ],

    notes: [
      "Use two rinsed paper filters.",
      "The final pressing stage should take approximately 15 seconds.",
    ],

    recipeDetails: {
      orientation: "Inverted",
      brewTime: 105,
      filterType: "Paper",
      filterCount: 2,
      ratio: "1:11.5",
    },

    coffee: {
      amount: 20,
      unit: "g",
      description: "A vibrant, light-roasted coffee",
    },

    grind: {
      size: "Medium",
    },

    water: {
      amount: 230,
      unit: "g",
      temperatureCelsius: 81,
      temperatureFahrenheit: 177,
    },

    equipment: [
      {
        name: "AeroPress",
        url: "https://aeropress.com/",
      },
    ],

    steps: [
      {
        id: 1,
        text: "Prepare the AeroPress inverted and rinse two paper filters.",
      },
      {
        id: 2,
        text: "Add the coffee and pour in 70g of water at 81°C.",
      },
      {
        id: 3,
        text: "Start the timer and swirl the brewer for 15 seconds.",
      },
      {
        id: 4,
        text: "Add the remaining 160g of water.",
      },
      {
        id: 5,
        text: "At 1:00, attach the filter cap.",
      },
      {
        id: 6,
        text: "At 1:20, carefully flip the AeroPress onto the cup.",
      },
      {
        id: 7,
        text: "At 1:30, begin pressing and finish at approximately 1:45.",
      },
      {
        id: 8,
        text: "Serve immediately.",
      },
    ],
  },

  {
    id: 4,
    slug: "tim-wendelboe",

    source: {
      name: "From a Barista",
      icon: "/recipeIcon/noun_tamper.svg",
    },

    title: "Tim Wendelboe",
    description:
      "A simple AeroPress recipe for a filter like coffee, as used in Tim Wendelboe cafe in Oslo, Norway.",

    hasVideo: true,
    isCold: false,

    stats: {
      votes: 386,
      saves: 0,
      comments: 0,
    },

    creator: {
      name: "Tim Wendelboe",
      profileUrl: "https://timwendelboe.no/",
      introduction:
        "Tim Wendelboe is a Norwegian coffee professional and one of the founders of the World AeroPress Championship.",
    },

    introduction: [
      "This is the standard AeroPress recipe used at the Tim Wendelboe café in Oslo.",
      "It produces a light, clean cup similar to filter coffee.",
    ],

    notes: [
      "Stir exactly three times before steeping.",
      "Stir another three times after the 60-second steep.",
    ],

    recipeDetails: {
      orientation: "Standard",
      brewTime: 90,
      filterType: "Paper",
      filterCount: 1,
      ratio: "1:14.3",
    },

    coffee: {
      amount: 14,
      unit: "g",
      description: "A light-roasted coffee of your choice",
    },

    grind: {
      size: "Medium",
    },

    water: {
      amount: 200,
      unit: "g",
      temperatureCelsius: 96,
      temperatureFahrenheit: 204,
    },

    equipment: [
      {
        name: "AeroPress",
        url: "https://aeropress.com/",
      },
    ],

    steps: [
      {
        id: 1,
        text: "Rinse the paper filter with water.",
      },
      {
        id: 2,
        text: "Add 14g of freshly ground coffee.",
      },
      {
        id: 3,
        text: "Pour 200g of water at approximately 96°C.",
      },
      {
        id: 4,
        text: "Stir from front to back three times.",
      },
      {
        id: 5,
        text: "Insert the plunger slightly to prevent dripping.",
      },
      {
        id: 6,
        text: "Leave the coffee to steep for 60 seconds.",
      },
      {
        id: 7,
        text: "Remove the plunger and stir from front to back three more times.",
      },
      {
        id: 8,
        text: "Replace the plunger and press steadily into a cup or server.",
      },
    ],
  },

  {
    id: 5,
    slug: "smooooothy",

    source: {
      name: "From a Barista",
      icon: "/recipeIcon/noun_tamper.svg",
    },

    title: "Smooooothy!",
    description: "Learn how to brew a sweet and balanced cup of coffee.",

    hasVideo: true,
    isCold: false,

    stats: {
      votes: 290,
      saves: 0,
      comments: 0,
    },

    creator: {
      name: "AmirHossein Adib",
      introduction:
        "AmirHossein Adib created this method for a smooth, sweet and balanced cup.",
    },

    introduction: [
      "The recipe uses East African coffee and a two-stage pour.",
      "A short bloom is followed by a longer immersion before pressing.",
    ],

    notes: [
      "Use two paper filters.",
      "Rinse and preheat both filters before brewing.",
    ],

    recipeDetails: {
      orientation: "Standard",
      brewTime: 130,
      filterType: "Paper",
      filterCount: 2,
      ratio: "1:15.7",
    },

    coffee: {
      amount: 14,
      unit: "g",
      description: "East African coffee from Ethiopia or Kenya",
    },

    grind: {
      size: "Medium-fine",
    },

    water: {
      amount: 220,
      unit: "g",
      temperatureCelsius: 92,
      temperatureFahrenheit: 197,
    },

    equipment: [
      {
        name: "AeroPress",
        url: "https://aeropress.com/",
      },
    ],

    steps: [
      {
        id: 1,
        text: "Rinse and preheat two paper filters.",
      },
      {
        id: 2,
        text: "Grind 14g of coffee to a medium-fine setting.",
      },
      {
        id: 3,
        text: "Add the ground coffee to the AeroPress.",
      },
      {
        id: 4,
        text: "Pour 40g of water and bloom for 30 seconds.",
      },
      {
        id: 5,
        text: "At 0:30, add the remaining 180g of water.",
      },
      {
        id: 6,
        text: "Insert the plunger without pressing and wait until 1:30.",
      },
      {
        id: 7,
        text: "Stir once, then begin pressing at 1:50.",
      },
      {
        id: 8,
        text: "Finish the press at approximately 2:10.",
      },
    ],
  },

  {
    id: 6,
    slug: "aeropress-iced-latte",

    source: {
      name: "From an Enthusiast",
      icon: "/recipeIcon/icon_enthusiast.svg",
    },

    title: "AeroPress Iced Latte",
    description:
      "Dark chocolate, sandalwood and umami seaweed. Full bodied and gives a good kick!",

    hasVideo: true,
    isCold: true,

    stats: {
      votes: 261,
      saves: 0,
      comments: 0,
    },

    creator: {
      name: "Mark C",
      introduction:
        "Mark C created this concentrated AeroPress recipe for an iced milk drink.",
    },

    introduction: [
      "A full-bodied iced latte with dark chocolate, sandalwood and savoury flavour notes.",
      "The concentrated coffee is pressed directly over cold milk and ice.",
    ],

    notes: [
      "Prepare five ice cubes and approximately 130ml of milk.",
      "The listed brewing ratio only covers the coffee and hot water.",
    ],

    recipeDetails: {
      orientation: "Inverted",
      brewTime: 140,
      filterType: "Paper",
      filterCount: 1,
      ratio: "1:3.3",
    },

    coffee: {
      amount: 18,
      unit: "g",
      description: "Monsooned Malabar",
    },

    grind: {
      size: "Medium-fine",
    },

    water: {
      amount: 60,
      unit: "g",
      temperatureCelsius: 92,
      temperatureFahrenheit: 197,
    },

    equipment: [
      {
        name: "AeroPress",
        url: "https://aeropress.com/",
      },
      {
        name: "Porlex Mini Hand Grinder",
      },
    ],

    steps: [
      {
        id: 1,
        text: "Grind 18g of coffee to a medium-fine setting.",
      },
      {
        id: 2,
        text: "Rinse the paper filter and prepare the inverted AeroPress.",
      },
      {
        id: 3,
        text: "Add the ground coffee to the chamber.",
      },
      {
        id: 4,
        text: "Pour in 60g of water and stir continuously for 40 seconds.",
      },
      {
        id: 5,
        text: "Attach the cap and continue brewing until 2:00.",
      },
      {
        id: 6,
        text: "Place five ice cubes and 130ml of milk in a serving glass.",
      },
      {
        id: 7,
        text: "Flip the AeroPress over the glass and press for 20 seconds.",
      },
    ],
  },

  {
    id: 7,
    slug: "the-only-aeropress-recipe-youll-ever-need",

    source: {
      name: "From a Barista",
      icon: "/recipeIcon/noun_tamper.svg",
    },

    title: "The only AeroPress recipe you'll ever need",
    description:
      "The crew at The Coffee Compass offer us a simple, versatile and tasty AeroPress recipe.",

    hasVideo: true,
    isCold: false,

    stats: {
      votes: 239,
      saves: 0,
      comments: 0,
    },

    creator: {
      name: "The Coffee Compass",
      profileUrl: "https://www.thecoffeecompass.com/",
      introduction:
        "The Coffee Compass created this method around simplicity, versatility and efficient coffee use.",
    },

    introduction: [
      "A straightforward recipe that works with many different coffee beans.",
      "The method uses a relatively small dose and a long immersion.",
    ],

    notes: [
      "Use two rinsed paper filters.",
      "The recipe is designed to produce a full cup without using an unnecessarily large coffee dose.",
    ],

    recipeDetails: {
      orientation: "Standard",
      brewTime: 270,
      filterType: "Paper",
      filterCount: 2,
      ratio: "1:15",
    },

    coffee: {
      amount: 15,
      unit: "g",
      description: "Any coffee you prefer",
    },

    grind: {
      size: "Medium",
    },

    water: {
      amount: 225,
      unit: "g",
      temperatureCelsius: 98,
      temperatureFahrenheit: 208,
    },

    equipment: [
      {
        name: "AeroPress",
        url: "https://aeropress.com/",
      },
      {
        name: "Hario V60 Drip Scale",
      },
      {
        name: "Comandante C40 Grinder",
      },
      {
        name: "Brewista Artisan Gooseneck Kettle",
      },
    ],

    steps: [
      {
        id: 1,
        text: "Grind 15g of coffee to a medium setting.",
      },
      {
        id: 2,
        text: "Place two rinsed paper filters in the AeroPress cap.",
      },
      {
        id: 3,
        text: "Add 225g of hot water and insert the plunger to create a seal.",
      },
      {
        id: 4,
        text: "At 1:00, remove the plunger and gently break the surface crust.",
      },
      {
        id: 5,
        text: "Replace the plunger and begin pressing slowly at 4:00.",
      },
      {
        id: 6,
        text: "Finish the press at approximately 4:30 and serve.",
      },
    ],
  },

  {
    id: 8,
    slug: "two-big-cups-one-brew",

    source: {
      name: "From an Enthusiast",
      icon: "/recipeIcon/icon_enthusiast.svg",
    },

    title: "Two Big Cups - One Brew",
    description:
      "AeroPress for 2! This recipe produces one large cup of coffee, or enough to share with a friend :)",

    hasVideo: true,
    isCold: false,

    stats: {
      votes: 173,
      saves: 0,
      comments: 0,
    },

    creator: {
      name: "Niklas Backpack of Freedom",
      introduction:
        "Niklas created this recipe for filling a travel mug or sharing coffee with another person.",
    },

    introduction: [
      "The AeroPress is used to make a concentrated brew before adding bypass water.",
      "The final recipe produces approximately 400g of coffee.",
    ],

    notes: [
      "Use two or three filters to highlight floral flavours in light-roasted coffee.",
      "The final 150g of water is added as bypass water after pressing.",
    ],

    recipeDetails: {
      orientation: "Standard",
      brewTime: 150,
      filterType: "Paper",
      filterCount: 1,
      ratio: "1:13.3",
    },

    coffee: {
      amount: 30,
      unit: "g",
      description: "Any coffee, preferably a light roast",
    },

    grind: {
      size: "Medium-fine",
    },

    water: {
      amount: 400,
      unit: "g",
      temperatureCelsius: 93,
      temperatureFahrenheit: 199,
    },

    equipment: [
      {
        name: "AeroPress",
        url: "https://aeropress.com/",
      },
      {
        name: "Hario V60 Drip Scale",
      },
      {
        name: "Hario Buono Gooseneck Kettle",
      },
      {
        name: "Porlex Mini Hand Grinder",
      },
    ],

    steps: [
      {
        id: 1,
        text: "Preheat the AeroPress and serving vessel.",
      },
      {
        id: 2,
        text: "Rinse the paper filter.",
      },
      {
        id: 3,
        text: "Place the AeroPress over the vessel and add 30g of coffee.",
      },
      {
        id: 4,
        text: "Pour in 250g of water.",
      },
      {
        id: 5,
        text: "Stir gently for 15 seconds.",
      },
      {
        id: 6,
        text: "Insert the plunger slightly to prevent dripping.",
      },
      {
        id: 7,
        text: "Leave the coffee until the timer reaches 2:00.",
      },
      {
        id: 8,
        text: "Press for approximately 30 to 40 seconds.",
      },
      {
        id: 9,
        text: "Add 150g of bypass water to the brewed coffee.",
      },
      {
        id: 10,
        text: "Mix and serve.",
      },
    ],
  },

  {
    id: 9,
    slug: "v60-style-aeropress-light-roast",

    source: {
      name: "From an Enthusiast",
      icon: "/recipeIcon/icon_enthusiast.svg",
    },

    title: "V60 Style Aeropress (light roast)",
    description:
      "For a V60 style brew with your AeroPress (the light roast version).",

    hasVideo: true,
    isCold: false,

    stats: {
      votes: 151,
      saves: 0,
      comments: 0,
    },

    creator: {
      name: "u/skelathon0703 on Reddit",
      introduction:
        "This recipe adapts a light-roast V60-style brew for the AeroPress.",
    },

    introduction: [
      "The method uses a fine grind and a relatively large amount of water.",
      "It avoids blooming and stirring to create a cleaner filter-style cup.",
    ],

    notes: [
      "Use two normal paper filters or one Aesir filter.",
      "Do not stir the coffee.",
      "Do not use a separate bloom stage.",
    ],

    recipeDetails: {
      orientation: "Standard",
      brewTime: 70,
      filterType: "Paper",
      filterCount: 2,
      ratio: "1:15.3",
    },

    coffee: {
      amount: 17,
      unit: "g",
      description: "Light roast",
    },

    grind: {
      size: "Fine",
    },

    water: {
      amount: 260,
      unit: "g",
      temperatureCelsius: 95,
      temperatureFahrenheit: 203,
    },

    equipment: [
      {
        name: "AeroPress",
        url: "https://aeropress.com/",
      },
      {
        name: "Aesir Filter",
      },
    ],

    steps: [
      {
        id: 1,
        text: "Place two paper filters or one Aesir filter in the cap.",
      },
      {
        id: 2,
        text: "Rinse the filters and preheat the serving vessel.",
      },
      {
        id: 3,
        text: "Add 17g of finely ground coffee.",
      },
      {
        id: 4,
        text: "Quickly pour in 260g of hot water.",
      },
      {
        id: 5,
        text: "Do not stir or pause for a bloom.",
      },
      {
        id: 6,
        text: "Insert the plunger to create a seal and steep for 50 seconds.",
      },
      {
        id: 7,
        text: "Press gently for 20 seconds.",
      },
      {
        id: 8,
        text: "Stop pressing before the bubbling sound begins.",
      },
      {
        id: 9,
        text: "Serve and enjoy.",
      },
    ],
  },

  {
    id: 10,
    slug: "aeropress-espresso",

    source: {
      name: "From a Barista",
      icon: "/recipeIcon/noun_tamper.svg",
    },

    title: "AeroPress Espresso",
    description:
      "A great recipe to use as a base for brewing 'espresso' type coffee on the Aeropress",

    hasVideo: true,
    isCold: false,

    stats: {
      votes: 131,
      saves: 0,
      comments: 0,
    },

    creator: {
      name: "Coffee Lovers TV",
      introduction:
        "Coffee Lovers TV created this high-pressure AeroPress method for a short espresso-style drink.",
    },

    introduction: [
      "This recipe uses a fine grind, a high dose and a small amount of water.",
      "It can be adjusted by changing the bloom, orientation or filter type.",
    ],

    notes: [
      "A metal filter can be tested as an alternative to the paper filter.",
      "Press firmly and quickly to generate as much pressure as possible.",
    ],

    recipeDetails: {
      orientation: "Standard",
      brewTime: 30,
      filterType: "Paper",
      filterCount: 1,
      ratio: "1:3",
    },

    coffee: {
      amount: 20,
      unit: "g",
      description: "Medium to dark roast",
    },

    grind: {
      size: "Fine, similar to sand",
    },

    water: {
      amount: 60,
      unit: "g",
      temperatureCelsius: 98,
      temperatureFahrenheit: 208,
    },

    equipment: [
      {
        name: "AeroPress",
        url: "https://aeropress.com/",
      },
    ],

    steps: [
      {
        id: 1,
        text: "Rinse the filter and preheat the serving cup.",
      },
      {
        id: 2,
        text: "Place the AeroPress in the standard position.",
      },
      {
        id: 3,
        text: "Add 20g of finely ground coffee.",
      },
      {
        id: 4,
        text: "Pour in 60g of hot water within approximately 10 seconds.",
      },
      {
        id: 5,
        text: "Stir for 10 seconds to saturate all the coffee.",
      },
      {
        id: 6,
        text: "Remove the AeroPress from the scale and press quickly.",
      },
    ],
  },

  {
    id: 11,
    slug: "for-the-sweetest-cup",

    source: {
      name: "From a Barista",
      icon: "/recipeIcon/noun_tamper.svg",
    },

    title: "For the sweetest cup",
    description: "Slow press for the sweetness. Bypass for the bright acidity.",

    hasVideo: false,
    isCold: false,

    stats: {
      votes: 125,
      saves: 0,
      comments: 0,
    },

    creator: {
      name: "Damaring Kalpika",
      introduction:
        "Damaring Kalpika is the 2017 Indonesian AeroPress champion.",
    },

    introduction: [
      "This recipe was developed at Koffiesome in Yogyakarta using honey-processed coffee from Gayo, North Sumatra.",
      "It is designed to produce a sweet and clean cup with bright acidity.",
    ],

    notes: [
      "Use two paper filters.",
      "Add bypass water after pressing to maintain the intended final ratio.",
    ],

    recipeDetails: {
      orientation: "Inverted",
      brewTime: 120,
      filterType: "Paper",
      filterCount: 2,
      ratio: "1:10",
    },

    coffee: {
      amount: 24,
      unit: "g",
      description: "Coffee with prominent sweet flavour notes",
    },

    grind: {
      size: "Medium",
    },

    water: {
      amount: 240,
      unit: "g",
      temperatureCelsius: 92,
      temperatureFahrenheit: 197,
    },

    equipment: [
      {
        name: "AeroPress",
        url: "https://aeropress.com/",
      },
    ],

    steps: [
      {
        id: 1,
        text: "Rinse two paper filters and preheat the serving cup.",
      },
      {
        id: 2,
        text: "Pour in 60g of water and stir gently 15 to 20 times.",
      },
      {
        id: 3,
        text: "At 0:30, add another 180g of water using a circular pour.",
      },
      {
        id: 4,
        text: "Stir thoroughly for approximately 10 seconds.",
      },
      {
        id: 5,
        text: "Attach the filter cap and wait until 1:00.",
      },
      {
        id: 6,
        text: "Flip the AeroPress onto the preheated cup.",
      },
      {
        id: 7,
        text: "Press slowly for approximately 1 minute.",
      },
      {
        id: 8,
        text: "Add the required bypass water, mix well and serve.",
      },
    ],
  },
];
