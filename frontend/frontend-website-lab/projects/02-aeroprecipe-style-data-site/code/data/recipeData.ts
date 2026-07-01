import type { Recipe } from "@/data/types/recipe/recipe";

export const recipeData: Recipe[] = [
  {
    id: 0,
    slug: "james-hoffmanns-ultimate-aeropress-recipe",
    title: "James Hoffmann's Ultimate AeroPress Recipe",
    intro: "James Hoffmann's Ultimate AeroPress Recipe",
    isCold: false,
    tags: [],
    meta: {
      source: {
        icon: "/recipeIcon/noun_tamper.svg",
        name: "From a Barista",
      },
      creator: {
        name: "James Hoffmann",
      },
      likes: 1116,
      saves: 532,
      comments: 128,
      privateNotes: 9,
    },
    content: [
      {
        type: "paragraph",
        text: "James Hoffmann's Ultimate AeroPress recipe is a simple, repeatable method and a strong starting point for anyone learning the brewer.",
      },
      {
        type: "paragraph",
        text: "The method challenges several common AeroPress habits: the brewer does not need to be preheated, the paper filter does not need to be rinsed, and a gentle swirl is preferred over stirring.",
      },
      {
        type: "paragraph",
        text: "Once the basic technique feels consistent, it can be used as a foundation for experimenting with roast level, water temperature, grind size and steep time.",
      },
      {
        type: "heading",
        text: "Quick notes",
      },
      {
        type: "list",
        items: [
          "For medium roast coffee, try water between 90°C and 95°C.",
          "For dark roast coffee, try water between 85°C and 90°C.",
          "Press gently and allow roughly 30 seconds for the plunge.",
        ],
      },
      {
        type: "linkParagraph",
        text: "For a detailed explanation of the technique, watch ",
        linkText: "James Hoffmann's original video",
        href: "https://www.youtube.com/watch?v=j6VlT_jUVPc",
      },
      {
        type: "linkParagraph",
        text: "For a stronger coffee designed for milk drinks, see ",
        linkText: "James Hoffmann's espresso-style AeroPress recipe",
        href: "/recipes/james-hoffmann",
      },
      {
        type: "heading",
        text: "Grind settings recommended by users",
      },
      {
        type: "list",
        items: [
          "1Zpresso JX Pro: around 3.2.0 for a light roast.",
          "Baratza Encore: around 12–14.",
          "Comandante C40: around 11–16 clicks.",
          "Timemore C2: around 11 clicks for light roast or 12–14 for medium roast.",
        ],
      },
      {
        type: "video",
        title: "The Ultimate AeroPress Technique",
        url: "https://www.youtube.com/embed/j6VlT_jUVPc",
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
    overview: {
      brew: {
        method: "standard",
        time: 200,
        filter: "paper",
      },
      coffee: {
        amount: 11,
        unit: "g",
        description: "Light roast",
      },
      grind: {
        level: "Finer end of medium",
        grinder: {
          model: "C40",
          setting: "24",
        },
      },
      water: {
        amount: 200,
        temperature: 99,
        unit: "g",
      },
      equipment: [
        {
          id: 1,
          name: "AeroPress",
          image: "/detail/imgs/aeropress_sml.png",
          url: "https://www.apple.com/",
        },
        {
          id: 2,
          name: "Hario V60 Drip Scale",
          image: "/detail/imgs/hario_scale_grinder_sml.png",
          url: "https://www.google.com/search",
        },
        {
          id: 3,
          name: "Comandante C40 Grinder",
          image: "/detail/imgs/comandante_c40_sml.png",
          url: "https://www.apple.com/mac/",
        },
      ],
    },
  },
  {
    id: 1,
    slug: "13g-that-makes-you-happy",
    title: "13g that makes you happy",
    intro:
      "Quick & simple. Guaranteed happiness with this clean, balanced and sweet cup.",
    isCold: false,
    tags: ["sweet"],
    meta: {
      source: {
        icon: "/recipeIcon/icon_enthusiast.svg",
        name: "From an Enthusiast",
      },
      creator: {
        name: "Sigit Tri",
      },
      likes: 851,
      saves: 374,
      comments: 92,
      privateNotes: 7,
    },
    content: [
      {
        type: "paragraph",
        text: "This inverted recipe is intended to work with a wide range of coffee processing methods while producing a balanced, sweet and well-extracted cup.",
      },
      {
        type: "paragraph",
        text: "A short bloom is followed by a longer immersion, making the method easy to remember and forgiving when the coffee or roast changes.",
      },
      {
        type: "heading",
        text: "Recipe updates",
      },
      {
        type: "paragraph",
        text: "For more extraction, add five extra stirs during the second mixing stage or extend the bloom by about ten seconds.",
      },
      {
        type: "paragraph",
        text: "A later variation increased the dose slightly and lowered the water temperature:",
      },
      {
        type: "list",
        items: [
          "Use 13.5 grams of coffee.",
          "Lower the water temperature to 88°C.",
        ],
      },
      {
        type: "paragraph",
        text: "The variation produces a rounder body and a long, sweet aftertaste.",
      },
      {
        type: "heading",
        text: "Grind settings recommended by users",
      },
      {
        type: "list",
        items: [
          "Comandante C40: around 29–30 clicks for a light roast.",
          "Fellow Ode: setting 3 for medium-dark or light roast.",
          "Timemore C2: around 14 clicks for medium roast or 20 for dark roast.",
          "Timemore C3 Pro: around 14 clicks for medium roast.",
        ],
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
    overview: {
      brew: {
        method: "inverted",
        time: 150,
        filter: "metal",
      },
      coffee: {
        amount: 13,
        unit: "g",
        description: "Honey processed coffee",
      },
      grind: {
        level: "Coarse",
      },
      water: {
        amount: 180,
        temperature: 90,
        unit: "g",
      },
      equipment: [
        {
          id: 1,
          name: "AeroPress",
          image: "/detail/imgs/aeropress_sml.png",
          url: "https://www.google.com/",
        },
        {
          id: 2,
          name: "Hario Buono Gooseneck Kettle",
          image: "/detail/imgs/hario_gooseneck_sml.png",
          url: "https://www.apple.com/ipad/",
        },
        {
          id: 3,
          name: "Porlex Mini Hand Grinder",
          image: "/detail/imgs/porlex_mini_sml.png",
          url: "https://www.google.com/chrome",
        },
      ],
    },
  },
  {
    id: 2,
    slug: "james-hoffmann",
    title: "James Hoffmann",
    intro:
      "James Hoffmann's AeroPress recipe for making a good milk based coffee at home.",
    isCold: false,
    tags: [],
    meta: {
      source: {
        icon: "/recipeIcon/noun_tamper.svg",
        name: "From a Barista",
      },
      creator: {
        name: "James Hoffmann",
      },
      likes: 543,
      saves: 218,
      comments: 54,
      privateNotes: 4,
    },
    content: [
      {
        type: "paragraph",
        text: "James Hoffmann developed this concentrated AeroPress recipe as the coffee component for a cappuccino, latte or flat white made without an espresso machine.",
      },
      {
        type: "paragraph",
        text: "Use water immediately after boiling and grind slightly coarser than espresso but finer than a normal filter grind.",
      },
      {
        type: "paragraph",
        text: "The coffee should be stirred thoroughly so that no dry clumps remain, then brewed briefly before a slow press.",
      },
      {
        type: "paragraph",
        text: "For this recipe, every gram of liquid matters, so continue pressing through the final bubbling sound. The result should be approximately 65–70 grams of concentrated coffee.",
      },
      {
        type: "linkParagraph",
        text: "For the complete milk-drink walkthrough, watch ",
        linkText: "James Hoffmann's original video",
        href: "https://www.youtube.com/watch?v=ZgIVfU0xBjA",
      },
      {
        type: "linkParagraph",
        text: "For a lighter filter-style cup, try ",
        linkText: "James Hoffmann's Ultimate AeroPress Recipe",
        href: "/recipes/james-hoffmanns-ultimate-aeropress-recipe",
      },
      {
        type: "heading",
        text: "Grind settings recommended by users",
      },
      {
        type: "list",
        items: [
          "Baratza Encore: around 12.",
          "Comandante C40: around 14 clicks for medium roast or 20 for lighter roast.",
          "Timemore C2: around 12 clicks for medium to medium-dark roast.",
          "Hario Slim: around 7 clicks.",
        ],
      },
      {
        type: "video",
        title: "Milk Drinks at Home Without an Espresso Machine",
        url: "https://www.youtube.com/embed/ZgIVfU0xBjA",
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
    overview: {
      brew: {
        method: "inverted",
        time: 120,
        filter: "metal",
      },
      coffee: {
        amount: 18,
        unit: "g",
        description: "Dark roast or espresso blend",
      },
      grind: {
        level: "Fine to medium-fine",
        grinder: {
          model: "C40",
          setting: "22",
        },
      },
      water: {
        amount: 90,
        temperature: 100,
        unit: "g",
      },
      equipment: [
        {
          id: 1,
          name: "AeroPress",
          image: "/detail/imgs/aeropress_sml.png",
          url: "https://www.apple.com/watch/",
        },
        {
          id: 2,
          name: "Comandante C40 Grinder",
          image: "/detail/imgs/comandante_c40_sml.png",
          url: "https://www.google.com/maps",
        },
        {
          id: 3,
          name: "Hario V60 Drip Scale",
          image: "/detail/imgs/hario_scale_grinder_sml.png",
          url: "https://www.apple.com/iphone/",
        },
        {
          id: 4,
          name: "Brewista Artisan Gooseneck Kettle",
          image: "/detail/imgs/brewista_artisan_kettle_sml.png",
          url: "https://www.google.com/",
        },
      ],
    },
  },
  {
    id: 3,
    slug: "love-me-some-acid",
    title: "Love me some acid",
    intro:
      "2018 Portugal Aeropress Champion shares a recipe to hero the acidy fruitiness of the coffee.",
    isCold: false,
    tags: ["fruit-filter"],
    meta: {
      source: {
        icon: "/recipeIcon/cat_crown.svg",
        name: "Championship",
      },
      creator: {
        name: "Kata Muhel",
      },
      likes: 465,
      saves: 186,
      comments: 42,
      privateNotes: 3,
    },
    content: [
      {
        type: "paragraph",
        text: "Kata Muhel created this recipe after winning the 2018 Portuguese AeroPress Championship.",
      },
      {
        type: "paragraph",
        text: "The method is designed to highlight bright acidity and fruity flavours by combining cool brewing water with a short immersion and a quick press.",
      },
      {
        type: "heading",
        text: "Recipe notes",
      },
      {
        type: "list",
        items: [
          "Use two rinsed paper filters.",
          "Keep the final pressing stage to approximately 15 seconds.",
        ],
      },
      {
        type: "heading",
        text: "Grind settings recommended by users",
      },
      {
        type: "list",
        items: [
          "1Zpresso JX Pro: around 29 full points.",
          "Baratza Encore: around 16–20.",
          "Comandante C40: around 23–25 clicks for light roast.",
          "Porlex: around 10 clicks.",
        ],
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
    overview: {
      brew: {
        method: "inverted",
        time: 105,
        filter: "paper",
      },
      coffee: {
        amount: 20,
        unit: "g",
        description: "A vibrant, light-roasted coffee",
      },
      grind: {
        level: "Medium",
        grinder: {
          model: "Encore",
          setting: "15",
        },
      },
      water: {
        amount: 230,
        temperature: 81,
        unit: "g",
      },
      equipment: [
        {
          id: 1,
          name: "AeroPress",
          image: "/detail/imgs/aeropress_sml.png",
          url: "https://www.apple.com/",
        },
        {
          id: 2,
          name: "Hario Buono Gooseneck Kettle",
          image: "/detail/imgs/hario_gooseneck_sml.png",
          url: "https://www.google.com/",
        },
      ],
    },
  },
  {
    id: 4,
    slug: "tim-wendelboe",
    title: "Tim Wendelboe",
    intro:
      "A simple AeroPress recipe for a filter like coffee, as used in Tim Wendelboe cafe in Oslo, Norway.",
    isCold: false,
    tags: [],
    meta: {
      source: {
        icon: "/recipeIcon/noun_tamper.svg",
        name: "From a Barista",
      },
      creator: {
        name: "Tim Wendelboe",
        url: "https://timwendelboe.no/",
      },
      likes: 386,
      saves: 154,
      comments: 38,
      privateNotes: 5,
    },
    content: [
      {
        type: "paragraph",
        text: "Tim Wendelboe helped found the World AeroPress Championship and played an important role in popularising the brewer.",
      },
      {
        type: "paragraph",
        text: "This is the standard method used at the Tim Wendelboe café in Oslo and is designed to produce a light, clean cup similar to filter coffee.",
      },
      {
        type: "linkParagraph",
        text: "For a shorter and stronger cup, try ",
        linkText: "Tim Wendelboe's stronger AeroPress recipe",
        href: "/recipes/tim-wendelboe-stronger",
      },
      {
        type: "heading",
        text: "Brewing notes",
      },
      {
        type: "list",
        items: [
          "Rinse the paper filter before brewing.",
          "Stir exactly three times before the steep.",
          "After 60 seconds, stir three more times before pressing.",
          "A medium grind works well; Tim recommends roughly 15–20 clicks on a Comandante.",
        ],
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
    overview: {
      brew: {
        method: "standard",
        time: 90,
        filter: "paper",
      },
      coffee: {
        amount: 14,
        unit: "g",
        description: "A light-roasted coffee of your choice",
      },
      grind: {
        level: "Medium",
        grinder: {
          model: "C40",
          setting: "20",
        },
      },
      water: {
        amount: 200,
        temperature: 96,
        unit: "g",
      },
      equipment: [
        {
          id: 1,
          name: "AeroPress",
          image: "/detail/imgs/aeropress_sml.png",
          url: "https://www.google.com/search",
        },
        {
          id: 2,
          name: "Comandante C40 Grinder",
          image: "/detail/imgs/comandante_c40_sml.png",
          url: "https://www.apple.com/mac/",
        },
        {
          id: 3,
          name: "Brewista Artisan Gooseneck Kettle",
          image: "/detail/imgs/brewista_artisan_kettle_sml.png",
          url: "https://www.apple.com/ipad/",
        },
      ],
    },
  },
  {
    id: 5,
    slug: "smooooothy",
    title: "Smooooothy!",
    intro: "Learn how to brew a sweet and balanced cup of coffee.",
    isCold: false,
    tags: ["sweet"],
    meta: {
      source: {
        icon: "/recipeIcon/noun_tamper.svg",
        name: "From a Barista",
      },
      creator: {
        name: "AmirHossein Adib",
      },
      likes: 290,
      saves: 108,
      comments: 26,
      privateNotes: 2,
    },
    content: [
      {
        type: "paragraph",
        text: "This recipe is intended for anyone who wants a smooth and tasty cup of coffee.",
      },
      {
        type: "paragraph",
        text: "It uses East African coffee, a short bloom and a two-stage pour to create a sweet and balanced result.",
      },
      {
        type: "paragraph",
        text: "Give it a try and adjust the grind slightly finer or coarser to suit the coffee you are using.",
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
    overview: {
      brew: {
        method: "standard",
        time: 130,
        filter: "paper",
      },
      coffee: {
        amount: 14,
        unit: "g",
        description: "East African coffee from Ethiopia or Kenya",
      },
      grind: {
        level: "Medium-fine",
        grinder: {
          model: "JX Pro",
          setting: "2.8.0",
        },
      },
      water: {
        amount: 220,
        temperature: 92,
        unit: "g",
      },
      equipment: [
        {
          id: 1,
          name: "AeroPress",
          image: "/detail/imgs/aeropress_sml.png",
          url: "https://www.google.com/maps",
        },
        {
          id: 2,
          name: "Hario V60 Drip Scale",
          image: "/detail/imgs/hario_scale_grinder_sml.png",
          url: "https://www.google.com/chrome",
        },
      ],
    },
  },
  {
    id: 6,
    slug: "aeropress-iced-latte",
    title: "AeroPress Iced Latte",
    intro:
      "Dark chocolate, sandalwood and umami seaweed. Full bodied and gives a good kick!",
    isCold: true,
    tags: ["alcohol"],
    meta: {
      source: {
        icon: "/recipeIcon/icon_enthusiast.svg",
        name: "From an Enthusiast",
      },
      creator: {
        name: "Mark C",
      },
      likes: 261,
      saves: 94,
      comments: 22,
      privateNotes: 3,
    },
    content: [
      {
        type: "paragraph",
        text: "This recipe produces a strong, full-bodied coffee for an iced latte, with dark chocolate, sandalwood and savoury flavour notes.",
      },
      {
        type: "paragraph",
        text: "The concentrated coffee is brewed inverted and pressed directly over cold milk and ice.",
      },
      {
        type: "heading",
        text: "Before brewing",
      },
      {
        type: "list",
        items: [
          "Prepare five ice cubes.",
          "Add approximately 130 ml of milk to the serving glass.",
          "Use a medium-fine grind; the original recipe used about five clicks on a Porlex Mini.",
        ],
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
    overview: {
      brew: {
        method: "inverted",
        time: 140,
        filter: "paper",
      },
      coffee: {
        amount: 18,
        unit: "g",
        description: "Monsooned Malabar",
      },
      grind: {
        level: "Medium-fine",
        grinder: {
          model: "Porlex Mini",
          setting: "5",
        },
      },
      water: {
        amount: 60,
        temperature: 92,
        unit: "g",
      },
      equipment: [
        {
          id: 1,
          name: "AeroPress",
          image: "/detail/imgs/aeropress_sml.png",
          url: "https://www.google.com/chrome",
        },
        {
          id: 2,
          name: "Porlex Mini Hand Grinder",
          image: "/detail/imgs/porlex_mini_sml.png",
          url: "https://www.google.com/gmail",
        },
        {
          id: 3,
          name: "Hario V60 Drip Scale",
          image: "/detail/imgs/hario_scale_grinder_sml.png",
          url: "https://www.apple.com/iphone/",
        },
        {
          id: 4,
          name: "Brewista Artisan Gooseneck Kettle",
          image: "/detail/imgs/brewista_artisan_kettle_sml.png",
          url: "https://www.apple.com/",
        },
      ],
    },
  },
  {
    id: 7,
    slug: "the-only-aeropress-recipe-youll-ever-need",
    title: "The only AeroPress recipe you'll ever need",
    intro:
      "The crew at The Coffee Compass offer us a simple, versatile and tasty AeroPress recipe.",
    isCold: false,
    tags: [],
    meta: {
      source: {
        icon: "/recipeIcon/noun_tamper.svg",
        name: "From a Barista",
      },
      creator: {
        name: "The Coffee Compass",
        url: "https://www.thecoffeecompass.com/",
      },
      likes: 239,
      saves: 82,
      comments: 18,
      privateNotes: 4,
    },
    content: [
      {
        type: "paragraph",
        text: "This method from The Coffee Compass focuses on simplicity, versatility and efficient use of coffee.",
      },
      {
        type: "paragraph",
        text: "It is designed to make a full and satisfying cup with a modest 15-gram dose rather than relying on the unusually high coffee ratios found in many competition recipes.",
      },
      {
        type: "heading",
        text: "Why it works",
      },
      {
        type: "paragraph",
        text: "A medium grind and long immersion give the water enough time to extract flavour without requiring a large amount of coffee.",
      },
      {
        type: "list",
        items: [
          "Use two rinsed paper filters.",
          "Break the crust gently after the first minute.",
          "Begin pressing at four minutes and finish at approximately 4:30.",
        ],
      },
      {
        type: "linkParagraph",
        text: "Read more brewing articles from ",
        linkText: "The Coffee Compass",
        href: "https://www.thecoffeecompass.com/",
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
    overview: {
      brew: {
        method: "standard",
        time: 270,
        filter: "paper",
      },
      coffee: {
        amount: 15,
        unit: "g",
        description: "Any coffee you prefer",
      },
      grind: {
        level: "Medium",
        grinder: {
          model: "Fellow Ode",
          setting: "5",
        },
      },
      water: {
        amount: 225,
        temperature: 98,
        unit: "g",
      },
      equipment: [
        {
          id: 1,
          name: "AeroPress",
          image: "/detail/imgs/aeropress_sml.png",
          url: "https://www.apple.com/",
        },
        {
          id: 2,
          name: "Hario V60 Drip Scale",
          image: "/detail/imgs/hario_scale_grinder_sml.png",
          url: "https://www.apple.com/mac/",
        },
        {
          id: 3,
          name: "Comandante C40 Grinder",
          image: "/detail/imgs/comandante_c40_sml.png",
          url: "https://www.apple.com/ipad/",
        },
        {
          id: 4,
          name: "Brewista Artisan Gooseneck Kettle",
          image: "/detail/imgs/brewista_artisan_kettle_sml.png",
          url: "https://www.apple.com/iphone/",
        },
      ],
    },
  },
  {
    id: 8,
    slug: "two-big-cups-one-brew",
    title: "Two Big Cups - One Brew",
    intro:
      "AeroPress for 2! This recipe produces one large cup of coffee, or enough to share with a friend :)",
    isCold: false,
    tags: ["aeropress-xl"],
    meta: {
      source: {
        icon: "/recipeIcon/icon_enthusiast.svg",
        name: "From an Enthusiast",
      },
      creator: {
        name: "Niklas Backpack of Freedom",
      },
      likes: 173,
      saves: 62,
      comments: 14,
      privateNotes: 2,
    },
    content: [
      {
        type: "paragraph",
        text: "This recipe is useful when filling a travel mug or brewing enough coffee to share with another person.",
      },
      {
        type: "paragraph",
        text: "The AeroPress first produces a concentrated brew, then 150 grams of bypass water is added after pressing to reach approximately 400 grams in the final drink.",
      },
      {
        type: "paragraph",
        text: "The original recipe was developed with a light-roasted Yirgacheffe, although it can be adapted to many different coffees.",
      },
      {
        type: "heading",
        text: "Filter recommendation",
      },
      {
        type: "paragraph",
        text: "For more floral character from a light roast, use two or even three paper filters.",
      },
      {
        type: "heading",
        text: "Grinder note",
      },
      {
        type: "paragraph",
        text: "The original setting was five clicks on a Porlex Mini. A 30-gram dose nearly fills that grinder to its maximum capacity.",
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
    overview: {
      brew: {
        method: "standard",
        time: 150,
        filter: "paper",
      },
      coffee: {
        amount: 30,
        unit: "g",
        description: "Any coffee, preferably a light roast",
      },
      grind: {
        level: "Medium-fine",
        grinder: {
          model: "Baratza Encore",
          setting: "12",
        },
      },
      water: {
        amount: 400,
        temperature: 93,
        unit: "g",
      },
      equipment: [
        {
          id: 1,
          name: "AeroPress",
          image: "/detail/imgs/aeropress_sml.png",
          url: "https://www.apple.com/watch/",
        },
        {
          id: 2,
          name: "Hario V60 Drip Scale",
          image: "/detail/imgs/hario_scale_grinder_sml.png",
          url: "https://www.google.com/",
        },
        {
          id: 3,
          name: "Hario Buono Gooseneck Kettle",
          image: "/detail/imgs/hario_gooseneck_sml.png",
          url: "https://www.google.com/search",
        },
        {
          id: 4,
          name: "Porlex Mini Hand Grinder",
          image: "/detail/imgs/porlex_mini_sml.png",
          url: "https://www.google.com/maps",
        },
      ],
    },
  },
  {
    id: 9,
    slug: "v60-style-aeropress-light-roast",
    title: "V60 Style Aeropress (light roast)",
    intro:
      "For a V60 style brew with your AeroPress (the light roast version).",
    isCold: false,
    tags: ["fruit-filter"],
    meta: {
      source: {
        icon: "/recipeIcon/icon_enthusiast.svg",
        name: "From an Enthusiast",
      },
      creator: {
        name: "u/skelathon0703 on Reddit",
      },
      likes: 151,
      saves: 48,
      comments: 10,
      privateNotes: 1,
    },
    content: [
      {
        type: "paragraph",
        text: "This method aims to create a clean V60-style cup using an AeroPress and a light-roasted coffee.",
      },
      {
        type: "heading",
        text: "Key characteristics",
      },
      {
        type: "list",
        items: [
          "Use two paper filters or one Aesir filter.",
          "Use a fine grind.",
          "Do not stir.",
          "Do not use a separate bloom stage.",
        ],
      },
      {
        type: "linkParagraph",
        text: "Using a darker coffee? See the ",
        linkText: "dark-roast version of this recipe",
        href: "/recipes/v60-style-aeropress-dark",
      },
      {
        type: "paragraph",
        text: "Pour quickly, create a vacuum with the plunger and stop pressing before the final hiss for a cleaner result.",
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
    overview: {
      brew: {
        method: "standard",
        time: 70,
        filter: "paper",
      },
      coffee: {
        amount: 17,
        unit: "g",
        description: "Light roast",
      },
      grind: {
        level: "Fine",
      },
      water: {
        amount: 260,
        temperature: 95,
        unit: "g",
      },
      equipment: [
        {
          id: 1,
          name: "AeroPress",
          image: "/detail/imgs/aeropress_sml.png",
          url: "https://www.google.com/chrome",
        },
        {
          id: 2,
          name: "Hario V60 Drip Scale",
          image: "/detail/imgs/hario_scale_grinder_sml.png",
          url: "https://www.google.com/gmail",
        },
        {
          id: 3,
          name: "Porlex Mini Hand Grinder",
          image: "/detail/imgs/porlex_mini_sml.png",
          url: "https://www.apple.com/iphone/",
        },
      ],
    },
  },
  {
    id: 10,
    slug: "aeropress-espresso",
    title: "AeroPress Espresso",
    intro:
      "A great recipe to use as a base for brewing 'espresso' type coffee on the Aeropress",
    isCold: false,
    tags: [],
    meta: {
      source: {
        icon: "/recipeIcon/noun_tamper.svg",
        name: "From a Barista",
      },
      creator: {
        name: "Coffee Lovers TV",
      },
      likes: 131,
      saves: 42,
      comments: 8,
      privateNotes: 2,
    },
    content: [
      {
        type: "paragraph",
        text: "There are many ways to imitate espresso with an AeroPress, but this method focuses on the most important variable: creating as much pressure as the brewer can safely provide.",
      },
      {
        type: "paragraph",
        text: "The recipe uses a fine grind, a high coffee dose and a small amount of water. Bloom time, brewer orientation and filter choice can all be adjusted to change the final result.",
      },
      {
        type: "paragraph",
        text: "The standard version uses a paper filter, although a metal filter is worth trying when you want more body and texture.",
      },
      {
        type: "linkParagraph",
        text: "For a fuller explanation of the method, watch ",
        linkText: "Coffee Lovers TV's original video",
        href: "https://www.youtube.com/watch?v=aAGJ-QzTbjc",
      },
      {
        type: "video",
        title: "How to Make Espresso With an AeroPress",
        url: "https://www.youtube.com/embed/aAGJ-QzTbjc",
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
    overview: {
      brew: {
        method: "standard",
        time: 30,
        filter: "metal",
      },
      coffee: {
        amount: 20,
        unit: "g",
        description: "Medium to dark roast",
      },
      grind: {
        level: "Fine, similar to sand",
        grinder: {
          model: "Timemore C2",
          setting: "11",
        },
      },
      water: {
        amount: 60,
        temperature: 98,
        unit: "g",
      },
      equipment: [
        {
          id: 1,
          name: "AeroPress",
          image: "/detail/imgs/aeropress_sml.png",
          url: "https://www.apple.com/",
        },
        {
          id: 2,
          name: "Comandante C40 Grinder",
          image: "/detail/imgs/comandante_c40_sml.png",
          url: "https://www.google.com/maps",
        },
      ],
    },
  },
  {
    id: 11,
    slug: "for-the-sweetest-cup",
    title: "For the sweetest cup",
    intro: "Slow press for the sweetness. Bypass for the bright acidity.",
    isCold: false,
    tags: ["sweet"],
    meta: {
      source: {
        icon: "/recipeIcon/noun_tamper.svg",
        name: "From a Barista",
      },
      creator: {
        name: "Damaring Kalpika",
      },
      likes: 125,
      saves: 36,
      comments: 7,
      privateNotes: 1,
    },
    content: [
      {
        type: "paragraph",
        text: "Damaring Kalpika developed this recipe after becoming the 2017 Indonesian AeroPress Champion.",
      },
      {
        type: "linkParagraph",
        text: "The method was refined at ",
        linkText: "Koffiesome in Yogyakarta",
        href: "https://www.instagram.com/koffiesome/",
      },
      {
        type: "paragraph",
        text: "It was created around honey-processed coffee from Gayo, North Sumatra, with the goal of producing a sweet and clean cup with bright acidity.",
      },
      {
        type: "heading",
        text: "Recipe notes",
      },
      {
        type: "list",
        items: [
          "Use two paper filters.",
          "Press slowly to emphasise sweetness.",
          "Add bypass water after pressing to keep the intended final coffee-to-water ratio close to 1:10.",
        ],
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
    overview: {
      brew: {
        method: "inverted",
        time: 120,
        filter: "paper",
      },
      coffee: {
        amount: 24,
        unit: "g",
        description: "Coffee with prominent sweet flavour notes",
      },
      grind: {
        level: "Medium",
        grinder: {
          model: "Ode Gen 2",
          setting: "4",
        },
      },
      water: {
        amount: 240,
        temperature: 92,
        unit: "g",
      },
      equipment: [
        {
          id: 1,
          name: "AeroPress",
          image: "/detail/imgs/aeropress_sml.png",
          url: "https://www.apple.com/mac/",
        },
        {
          id: 2,
          name: "Hario Buono Gooseneck Kettle",
          image: "/detail/imgs/hario_gooseneck_sml.png",
          url: "https://www.google.com/",
        },
        {
          id: 3,
          name: "Brewista Artisan Gooseneck Kettle",
          image: "/detail/imgs/brewista_artisan_kettle_sml.png",
          url: "https://www.apple.com/watch/",
        },
      ],
    },
  },
  {
    id: 12,
    slug: "jonathan-gagne-aeropress-recipe",
    title: "Jonathan Gagne AeroPress recipe",
    intro: "A careful, high-extraction cup inspired by Jonathan Gagne style recipes.",
    isCold: false,
    tags: [],
    meta: {
      source: {
        icon: "/recipeIcon/icon_enthusiast.svg",
        name: "From an Enthusiast"
      },
      creator: {
        name: "Jonathan Gagne"
      },
      likes: 412,
      saves: 168,
      comments: 31,
      privateNotes: 3
    },
    content: [
      {
        type: "paragraph",
        text: "Jonathan Gagne AeroPress recipe is designed as a practical AeroPress recipe with a clear, repeatable method."
      },
      {
        type: "heading",
        text: "Brew notes"
      },
      {
        type: "list",
        items: [
          "Use 18g of coffee and 260g of water.",
          "Brew with a paper filter in the standard position.",
          "Adjust grind around fine to medium-fine if the cup tastes unbalanced."
        ]
      }
    ],
    steps: [
      {
        id: 1,
        text: "Prepare the AeroPress in the standard position."
      },
      {
        id: 2,
        text: "Add 18g of coffee ground fine to medium-fine."
      },
      {
        id: 3,
        text: "Pour 260g of water at 94C."
      },
      {
        id: 4,
        text: "Steep until the timer reaches 4:30."
      },
      {
        id: 5,
        text: "Press gently and serve immediately."
      }
    ],
    overview: {
      brew: {
        method: "standard",
        time: 270,
        filter: "paper"
      },
      coffee: {
        amount: 18,
        unit: "g",
        description: "Light roast with high clarity"
      },
      grind: {
        level: "Fine to medium-fine",
        grinder: {
          model: "C40",
          setting: "22"
        }
      },
      water: {
        amount: 260,
        temperature: 94,
        unit: "g"
      },
      equipment: [
        {
          id: 1,
          name: "AeroPress",
          image: "/detail/imgs/aeropress_sml.png",
          url: "https://www.apple.com/"
        },
        {
          id: 2,
          name: "Comandante C40 Grinder",
          image: "/detail/imgs/comandante_c40_sml.png",
          url: "https://www.google.com/"
        },
        {
          id: 3,
          name: "Hario V60 Drip Scale",
          image: "/detail/imgs/hario_scale_grinder_sml.png",
          url: "https://www.apple.com/mac/"
        }
      ]
    }
  },
  {
    id: 13,
    slug: "low-effort-big-reward",
    title: "Low effort big reward",
    intro: "A forgiving daily recipe with very little technique required.",
    isCold: false,
    tags: [],
    meta: {
      source: {
        icon: "/recipeIcon/icon_enthusiast.svg",
        name: "From an Enthusiast"
      },
      creator: {
        name: "AeroRecipe Community"
      },
      likes: 337,
      saves: 146,
      comments: 22,
      privateNotes: 2
    },
    content: [
      {
        type: "paragraph",
        text: "Low effort big reward is designed as a practical AeroPress recipe with a clear, repeatable method."
      },
      {
        type: "heading",
        text: "Brew notes"
      },
      {
        type: "list",
        items: [
          "Use 15g of coffee and 230g of water.",
          "Brew with a paper filter in the standard position.",
          "Adjust grind around medium if the cup tastes unbalanced."
        ]
      }
    ],
    steps: [
      {
        id: 1,
        text: "Prepare the AeroPress in the standard position."
      },
      {
        id: 2,
        text: "Add 15g of coffee ground medium."
      },
      {
        id: 3,
        text: "Pour 230g of water at 92C."
      },
      {
        id: 4,
        text: "Steep until the timer reaches 2:30."
      },
      {
        id: 5,
        text: "Press gently and serve immediately."
      }
    ],
    overview: {
      brew: {
        method: "standard",
        time: 150,
        filter: "paper"
      },
      coffee: {
        amount: 15,
        unit: "g",
        description: "Medium roast"
      },
      grind: {
        level: "Medium",
        grinder: {
          model: "Timemore C2",
          setting: "14"
        }
      },
      water: {
        amount: 230,
        temperature: 92,
        unit: "g"
      },
      equipment: [
        {
          id: 1,
          name: "AeroPress",
          image: "/detail/imgs/aeropress_sml.png",
          url: "https://www.google.com/chrome"
        },
        {
          id: 2,
          name: "Hario Buono Gooseneck Kettle",
          image: "/detail/imgs/hario_gooseneck_sml.png",
          url: "https://www.apple.com/ipad/"
        }
      ]
    }
  },
  {
    id: 14,
    slug: "2015-world-aeropress-championship",
    title: "2015 World AeroPress Championship",
    intro: "A competition-style recipe built around a strong brew and bypass water.",
    isCold: false,
    tags: ["aeropress-xl"],
    meta: {
      source: {
        icon: "/recipeIcon/cat_crown.svg",
        name: "Championship"
      },
      creator: {
        name: "WAC Archive"
      },
      likes: 505,
      saves: 218,
      comments: 44,
      privateNotes: 5
    },
    content: [
      {
        type: "paragraph",
        text: "2015 World AeroPress Championship is designed as a practical AeroPress recipe with a clear, repeatable method."
      },
      {
        type: "heading",
        text: "Brew notes"
      },
      {
        type: "list",
        items: [
          "Use 30g of coffee and 100g of water.",
          "Brew with a paper filter in the inverted position.",
          "Adjust grind around coarse if the cup tastes unbalanced."
        ]
      }
    ],
    steps: [
      {
        id: 1,
        text: "Prepare the AeroPress in the inverted position."
      },
      {
        id: 2,
        text: "Add 30g of coffee ground coarse."
      },
      {
        id: 3,
        text: "Pour 100g of water at 85C."
      },
      {
        id: 4,
        text: "Steep until the timer reaches 2:00."
      },
      {
        id: 5,
        text: "Press gently and serve immediately."
      }
    ],
    overview: {
      brew: {
        method: "inverted",
        time: 120,
        filter: "paper"
      },
      coffee: {
        amount: 30,
        unit: "g",
        description: "Competition coffee"
      },
      grind: {
        level: "Coarse",
        grinder: {
          model: "C40",
          setting: "30"
        }
      },
      water: {
        amount: 100,
        temperature: 85,
        unit: "g"
      },
      equipment: [
        {
          id: 1,
          name: "AeroPress",
          image: "/detail/imgs/aeropress_sml.png",
          url: "https://www.google.com/maps"
        },
        {
          id: 2,
          name: "Porlex Mini Hand Grinder",
          image: "/detail/imgs/porlex_mini_sml.png",
          url: "https://www.apple.com/iphone/"
        },
        {
          id: 3,
          name: "Brewista Artisan Gooseneck Kettle",
          image: "/detail/imgs/brewista_artisan_kettle_sml.png",
          url: "https://www.google.com/"
        }
      ]
    }
  },
  {
    id: 15,
    slug: "long-aeropress-espresso-shot",
    title: "Long AeroPress Espresso Shot",
    intro: "A short, intense cup that works well as a milk drink base.",
    isCold: false,
    tags: [],
    meta: {
      source: {
        icon: "/recipeIcon/noun_tamper.svg",
        name: "From a Barista"
      },
      creator: {
        name: "Coffee Shop Lab"
      },
      likes: 244,
      saves: 101,
      comments: 16,
      privateNotes: 1
    },
    content: [
      {
        type: "paragraph",
        text: "Long AeroPress Espresso Shot is designed as a practical AeroPress recipe with a clear, repeatable method."
      },
      {
        type: "heading",
        text: "Brew notes"
      },
      {
        type: "list",
        items: [
          "Use 20g of coffee and 80g of water.",
          "Brew with a metal filter in the standard position.",
          "Adjust grind around fine if the cup tastes unbalanced."
        ]
      }
    ],
    steps: [
      {
        id: 1,
        text: "Prepare the AeroPress in the standard position."
      },
      {
        id: 2,
        text: "Add 20g of coffee ground fine."
      },
      {
        id: 3,
        text: "Pour 80g of water at 96C."
      },
      {
        id: 4,
        text: "Steep until the timer reaches 1:15."
      },
      {
        id: 5,
        text: "Press gently and serve immediately."
      }
    ],
    overview: {
      brew: {
        method: "standard",
        time: 75,
        filter: "metal"
      },
      coffee: {
        amount: 20,
        unit: "g",
        description: "Espresso blend"
      },
      grind: {
        level: "Fine",
        grinder: {
          model: "JX Pro",
          setting: "2.5.0"
        }
      },
      water: {
        amount: 80,
        temperature: 96,
        unit: "g"
      },
      equipment: [
        {
          id: 1,
          name: "AeroPress",
          image: "/detail/imgs/aeropress_sml.png",
          url: "https://www.apple.com/watch/"
        },
        {
          id: 2,
          name: "Hario V60 Drip Scale",
          image: "/detail/imgs/hario_scale_grinder_sml.png",
          url: "https://www.google.com/search"
        },
        {
          id: 3,
          name: "Hario Buono Gooseneck Kettle",
          image: "/detail/imgs/hario_gooseneck_sml.png",
          url: "https://www.apple.com/"
        },
        {
          id: 4,
          name: "Comandante C40 Grinder",
          image: "/detail/imgs/comandante_c40_sml.png",
          url: "https://www.google.com/"
        }
      ]
    }
  },
  {
    id: 16,
    slug: "evp-iced-coffee",
    title: "EVP Iced Coffee",
    intro: "A cold AeroPress recipe with a bright finish and quick dilution over ice.",
    isCold: true,
    tags: ["alcohol"],
    meta: {
      source: {
        icon: "/recipeIcon/noun_tamper.svg",
        name: "From a Barista"
      },
      creator: {
        name: "EVP Coffee"
      },
      likes: 286,
      saves: 119,
      comments: 21,
      privateNotes: 2
    },
    content: [
      {
        type: "paragraph",
        text: "EVP Iced Coffee is designed as a practical AeroPress recipe with a clear, repeatable method."
      },
      {
        type: "heading",
        text: "Brew notes"
      },
      {
        type: "list",
        items: [
          "Use 18g of coffee and 160g of water.",
          "Brew with a paper filter in the inverted position.",
          "Adjust grind around medium if the cup tastes unbalanced."
        ]
      }
    ],
    steps: [
      {
        id: 1,
        text: "Prepare the AeroPress in the inverted position."
      },
      {
        id: 2,
        text: "Add 18g of coffee ground medium."
      },
      {
        id: 3,
        text: "Pour 160g of water at 88C."
      },
      {
        id: 4,
        text: "Steep until the timer reaches 3:00."
      },
      {
        id: 5,
        text: "Press gently and serve immediately."
      }
    ],
    overview: {
      brew: {
        method: "inverted",
        time: 180,
        filter: "paper"
      },
      coffee: {
        amount: 18,
        unit: "g",
        description: "Fruity washed coffee"
      },
      grind: {
        level: "Medium",
        grinder: {
          model: "Ode Gen 2",
          setting: "4"
        }
      },
      water: {
        amount: 160,
        temperature: 88,
        unit: "g"
      },
      equipment: [
        {
          id: 1,
          name: "AeroPress",
          image: "/detail/imgs/aeropress_sml.png",
          url: "https://www.apple.com/"
        },
        {
          id: 2,
          name: "Comandante C40 Grinder",
          image: "/detail/imgs/comandante_c40_sml.png",
          url: "https://www.google.com/"
        },
        {
          id: 3,
          name: "Hario V60 Drip Scale",
          image: "/detail/imgs/hario_scale_grinder_sml.png",
          url: "https://www.apple.com/mac/"
        }
      ]
    }
  },
  {
    id: 17,
    slug: "rule-of-thirds",
    title: "Rule of Thirds",
    intro: "A balanced recipe using equal parts bloom, brew and bypass.",
    isCold: false,
    tags: [],
    meta: {
      source: {
        icon: "/recipeIcon/cat_experimental.svg",
        name: "Experimental"
      },
      creator: {
        name: "AeroPress Lab"
      },
      likes: 231,
      saves: 87,
      comments: 12,
      privateNotes: 1
    },
    content: [
      {
        type: "paragraph",
        text: "Rule of Thirds is designed as a practical AeroPress recipe with a clear, repeatable method."
      },
      {
        type: "heading",
        text: "Brew notes"
      },
      {
        type: "list",
        items: [
          "Use 16g of coffee and 240g of water.",
          "Brew with a paper filter in the standard position.",
          "Adjust grind around medium-fine if the cup tastes unbalanced."
        ]
      }
    ],
    steps: [
      {
        id: 1,
        text: "Prepare the AeroPress in the standard position."
      },
      {
        id: 2,
        text: "Add 16g of coffee ground medium-fine."
      },
      {
        id: 3,
        text: "Pour 240g of water at 92C."
      },
      {
        id: 4,
        text: "Steep until the timer reaches 3:30."
      },
      {
        id: 5,
        text: "Press gently and serve immediately."
      }
    ],
    overview: {
      brew: {
        method: "standard",
        time: 210,
        filter: "paper"
      },
      coffee: {
        amount: 16,
        unit: "g",
        description: "Sweet washed coffee"
      },
      grind: {
        level: "Medium-fine",
        grinder: {
          model: "C40",
          setting: "24"
        }
      },
      water: {
        amount: 240,
        temperature: 92,
        unit: "g"
      },
      equipment: [
        {
          id: 1,
          name: "AeroPress",
          image: "/detail/imgs/aeropress_sml.png",
          url: "https://www.google.com/chrome"
        },
        {
          id: 2,
          name: "Hario Buono Gooseneck Kettle",
          image: "/detail/imgs/hario_gooseneck_sml.png",
          url: "https://www.apple.com/ipad/"
        }
      ]
    }
  },
  {
    id: 18,
    slug: "the-bright-morning-cup",
    title: "The Bright Morning Cup",
    intro: "A clean morning brew with a lively acidity and light body.",
    isCold: false,
    tags: ["fruit-filter"],
    meta: {
      source: {
        icon: "/recipeIcon/icon_enthusiast.svg",
        name: "From an Enthusiast"
      },
      creator: {
        name: "Maya Lee"
      },
      likes: 194,
      saves: 74,
      comments: 10,
      privateNotes: 1
    },
    content: [
      {
        type: "paragraph",
        text: "The Bright Morning Cup is designed as a practical AeroPress recipe with a clear, repeatable method."
      },
      {
        type: "heading",
        text: "Brew notes"
      },
      {
        type: "list",
        items: [
          "Use 13g of coffee and 200g of water.",
          "Brew with a paper filter in the standard position.",
          "Adjust grind around medium-fine if the cup tastes unbalanced."
        ]
      }
    ],
    steps: [
      {
        id: 1,
        text: "Prepare the AeroPress in the standard position."
      },
      {
        id: 2,
        text: "Add 13g of coffee ground medium-fine."
      },
      {
        id: 3,
        text: "Pour 200g of water at 94C."
      },
      {
        id: 4,
        text: "Steep until the timer reaches 1:45."
      },
      {
        id: 5,
        text: "Press gently and serve immediately."
      }
    ],
    overview: {
      brew: {
        method: "standard",
        time: 105,
        filter: "paper"
      },
      coffee: {
        amount: 13,
        unit: "g",
        description: "Light Ethiopian coffee"
      },
      grind: {
        level: "Medium-fine",
        grinder: {
          model: "Timemore C2",
          setting: "13"
        }
      },
      water: {
        amount: 200,
        temperature: 94,
        unit: "g"
      },
      equipment: [
        {
          id: 1,
          name: "AeroPress",
          image: "/detail/imgs/aeropress_sml.png",
          url: "https://www.google.com/maps"
        },
        {
          id: 2,
          name: "Porlex Mini Hand Grinder",
          image: "/detail/imgs/porlex_mini_sml.png",
          url: "https://www.apple.com/iphone/"
        },
        {
          id: 3,
          name: "Brewista Artisan Gooseneck Kettle",
          image: "/detail/imgs/brewista_artisan_kettle_sml.png",
          url: "https://www.google.com/"
        }
      ]
    }
  },
  {
    id: 19,
    slug: "gentle-sweetness",
    title: "Gentle Sweetness",
    intro: "A slower press recipe for a soft, sweet cup.",
    isCold: false,
    tags: ["sweet"],
    meta: {
      source: {
        icon: "/recipeIcon/noun_tamper.svg",
        name: "From a Barista"
      },
      creator: {
        name: "Nora Chen"
      },
      likes: 178,
      saves: 68,
      comments: 9,
      privateNotes: 1
    },
    content: [
      {
        type: "paragraph",
        text: "Gentle Sweetness is designed as a practical AeroPress recipe with a clear, repeatable method."
      },
      {
        type: "heading",
        text: "Brew notes"
      },
      {
        type: "list",
        items: [
          "Use 17g of coffee and 250g of water.",
          "Brew with a paper filter in the inverted position.",
          "Adjust grind around medium if the cup tastes unbalanced."
        ]
      }
    ],
    steps: [
      {
        id: 1,
        text: "Prepare the AeroPress in the inverted position."
      },
      {
        id: 2,
        text: "Add 17g of coffee ground medium."
      },
      {
        id: 3,
        text: "Pour 250g of water at 90C."
      },
      {
        id: 4,
        text: "Steep until the timer reaches 4:00."
      },
      {
        id: 5,
        text: "Press gently and serve immediately."
      }
    ],
    overview: {
      brew: {
        method: "inverted",
        time: 240,
        filter: "paper"
      },
      coffee: {
        amount: 17,
        unit: "g",
        description: "Honey processed coffee"
      },
      grind: {
        level: "Medium",
        grinder: {
          model: "C40",
          setting: "26"
        }
      },
      water: {
        amount: 250,
        temperature: 90,
        unit: "g"
      },
      equipment: [
        {
          id: 1,
          name: "AeroPress",
          image: "/detail/imgs/aeropress_sml.png",
          url: "https://www.apple.com/watch/"
        },
        {
          id: 2,
          name: "Hario V60 Drip Scale",
          image: "/detail/imgs/hario_scale_grinder_sml.png",
          url: "https://www.google.com/search"
        },
        {
          id: 3,
          name: "Hario Buono Gooseneck Kettle",
          image: "/detail/imgs/hario_gooseneck_sml.png",
          url: "https://www.apple.com/"
        },
        {
          id: 4,
          name: "Comandante C40 Grinder",
          image: "/detail/imgs/comandante_c40_sml.png",
          url: "https://www.google.com/"
        }
      ]
    }
  },
  {
    id: 20,
    slug: "fast-and-clean-aeropress",
    title: "Fast and clean AeroPress",
    intro: "A quick standard method for a clean cup before work.",
    isCold: false,
    tags: [],
    meta: {
      source: {
        icon: "/recipeIcon/icon_enthusiast.svg",
        name: "From an Enthusiast"
      },
      creator: {
        name: "Leo Park"
      },
      likes: 163,
      saves: 59,
      comments: 8,
      privateNotes: 0
    },
    content: [
      {
        type: "paragraph",
        text: "Fast and clean AeroPress is designed as a practical AeroPress recipe with a clear, repeatable method."
      },
      {
        type: "heading",
        text: "Brew notes"
      },
      {
        type: "list",
        items: [
          "Use 12g of coffee and 180g of water.",
          "Brew with a paper filter in the standard position.",
          "Adjust grind around fine if the cup tastes unbalanced."
        ]
      }
    ],
    steps: [
      {
        id: 1,
        text: "Prepare the AeroPress in the standard position."
      },
      {
        id: 2,
        text: "Add 12g of coffee ground fine."
      },
      {
        id: 3,
        text: "Pour 180g of water at 93C."
      },
      {
        id: 4,
        text: "Steep until the timer reaches 1:00."
      },
      {
        id: 5,
        text: "Press gently and serve immediately."
      }
    ],
    overview: {
      brew: {
        method: "standard",
        time: 60,
        filter: "paper"
      },
      coffee: {
        amount: 12,
        unit: "g",
        description: "Any fresh coffee"
      },
      grind: {
        level: "Fine",
        grinder: {
          model: "Porlex Mini",
          setting: "8"
        }
      },
      water: {
        amount: 180,
        temperature: 93,
        unit: "g"
      },
      equipment: [
        {
          id: 1,
          name: "AeroPress",
          image: "/detail/imgs/aeropress_sml.png",
          url: "https://www.apple.com/"
        },
        {
          id: 2,
          name: "Comandante C40 Grinder",
          image: "/detail/imgs/comandante_c40_sml.png",
          url: "https://www.google.com/"
        },
        {
          id: 3,
          name: "Hario V60 Drip Scale",
          image: "/detail/imgs/hario_scale_grinder_sml.png",
          url: "https://www.apple.com/mac/"
        }
      ]
    }
  },
  {
    id: 21,
    slug: "big-body-breakfast-brew",
    title: "Big body breakfast brew",
    intro: "A fuller-bodied cup with a slightly higher dose.",
    isCold: false,
    tags: ["aeropress-xl"],
    meta: {
      source: {
        icon: "/recipeIcon/noun_tamper.svg",
        name: "From a Barista"
      },
      creator: {
        name: "Rosa Kim"
      },
      likes: 205,
      saves: 91,
      comments: 15,
      privateNotes: 2
    },
    content: [
      {
        type: "paragraph",
        text: "Big body breakfast brew is designed as a practical AeroPress recipe with a clear, repeatable method."
      },
      {
        type: "heading",
        text: "Brew notes"
      },
      {
        type: "list",
        items: [
          "Use 22g of coffee and 260g of water.",
          "Brew with a metal filter in the inverted position.",
          "Adjust grind around medium if the cup tastes unbalanced."
        ]
      }
    ],
    steps: [
      {
        id: 1,
        text: "Prepare the AeroPress in the inverted position."
      },
      {
        id: 2,
        text: "Add 22g of coffee ground medium."
      },
      {
        id: 3,
        text: "Pour 260g of water at 91C."
      },
      {
        id: 4,
        text: "Steep until the timer reaches 3:00."
      },
      {
        id: 5,
        text: "Press gently and serve immediately."
      }
    ],
    overview: {
      brew: {
        method: "inverted",
        time: 180,
        filter: "metal"
      },
      coffee: {
        amount: 22,
        unit: "g",
        description: "Medium-dark roast"
      },
      grind: {
        level: "Medium",
        grinder: {
          model: "Ode Gen 2",
          setting: "5"
        }
      },
      water: {
        amount: 260,
        temperature: 91,
        unit: "g"
      },
      equipment: [
        {
          id: 1,
          name: "AeroPress",
          image: "/detail/imgs/aeropress_sml.png",
          url: "https://www.google.com/chrome"
        },
        {
          id: 2,
          name: "Hario Buono Gooseneck Kettle",
          image: "/detail/imgs/hario_gooseneck_sml.png",
          url: "https://www.apple.com/ipad/"
        }
      ]
    }
  },
  {
    id: 22,
    slug: "fruit-forward-inverted",
    title: "Fruit-forward inverted",
    intro: "An inverted recipe for fruit notes and a longer finish.",
    isCold: false,
    tags: ["fruit-filter"],
    meta: {
      source: {
        icon: "/recipeIcon/cat_experimental.svg",
        name: "Experimental"
      },
      creator: {
        name: "Sam Ortega"
      },
      likes: 221,
      saves: 83,
      comments: 13,
      privateNotes: 1
    },
    content: [
      {
        type: "paragraph",
        text: "Fruit-forward inverted is designed as a practical AeroPress recipe with a clear, repeatable method."
      },
      {
        type: "heading",
        text: "Brew notes"
      },
      {
        type: "list",
        items: [
          "Use 16g of coffee and 220g of water.",
          "Brew with a paper filter in the inverted position.",
          "Adjust grind around medium-coarse if the cup tastes unbalanced."
        ]
      }
    ],
    steps: [
      {
        id: 1,
        text: "Prepare the AeroPress in the inverted position."
      },
      {
        id: 2,
        text: "Add 16g of coffee ground medium-coarse."
      },
      {
        id: 3,
        text: "Pour 220g of water at 88C."
      },
      {
        id: 4,
        text: "Steep until the timer reaches 3:30."
      },
      {
        id: 5,
        text: "Press gently and serve immediately."
      }
    ],
    overview: {
      brew: {
        method: "inverted",
        time: 210,
        filter: "paper"
      },
      coffee: {
        amount: 16,
        unit: "g",
        description: "Natural processed coffee"
      },
      grind: {
        level: "Medium-coarse",
        grinder: {
          model: "C40",
          setting: "28"
        }
      },
      water: {
        amount: 220,
        temperature: 88,
        unit: "g"
      },
      equipment: [
        {
          id: 1,
          name: "AeroPress",
          image: "/detail/imgs/aeropress_sml.png",
          url: "https://www.google.com/maps"
        },
        {
          id: 2,
          name: "Porlex Mini Hand Grinder",
          image: "/detail/imgs/porlex_mini_sml.png",
          url: "https://www.apple.com/iphone/"
        },
        {
          id: 3,
          name: "Brewista Artisan Gooseneck Kettle",
          image: "/detail/imgs/brewista_artisan_kettle_sml.png",
          url: "https://www.google.com/"
        }
      ]
    }
  },
  {
    id: 23,
    slug: "metal-filter-morning",
    title: "Metal filter morning",
    intro: "A metal-filter recipe with more oils and a heavier texture.",
    isCold: false,
    tags: [],
    meta: {
      source: {
        icon: "/recipeIcon/icon_enthusiast.svg",
        name: "From an Enthusiast"
      },
      creator: {
        name: "Kenji Ito"
      },
      likes: 147,
      saves: 52,
      comments: 7,
      privateNotes: 0
    },
    content: [
      {
        type: "paragraph",
        text: "Metal filter morning is designed as a practical AeroPress recipe with a clear, repeatable method."
      },
      {
        type: "heading",
        text: "Brew notes"
      },
      {
        type: "list",
        items: [
          "Use 15g of coffee and 210g of water.",
          "Brew with a metal filter in the standard position.",
          "Adjust grind around medium if the cup tastes unbalanced."
        ]
      }
    ],
    steps: [
      {
        id: 1,
        text: "Prepare the AeroPress in the standard position."
      },
      {
        id: 2,
        text: "Add 15g of coffee ground medium."
      },
      {
        id: 3,
        text: "Pour 210g of water at 90C."
      },
      {
        id: 4,
        text: "Steep until the timer reaches 2:30."
      },
      {
        id: 5,
        text: "Press gently and serve immediately."
      }
    ],
    overview: {
      brew: {
        method: "standard",
        time: 150,
        filter: "metal"
      },
      coffee: {
        amount: 15,
        unit: "g",
        description: "Chocolate-forward coffee"
      },
      grind: {
        level: "Medium",
        grinder: {
          model: "Timemore C2",
          setting: "15"
        }
      },
      water: {
        amount: 210,
        temperature: 90,
        unit: "g"
      },
      equipment: [
        {
          id: 1,
          name: "AeroPress",
          image: "/detail/imgs/aeropress_sml.png",
          url: "https://www.apple.com/watch/"
        },
        {
          id: 2,
          name: "Hario V60 Drip Scale",
          image: "/detail/imgs/hario_scale_grinder_sml.png",
          url: "https://www.google.com/search"
        },
        {
          id: 3,
          name: "Hario Buono Gooseneck Kettle",
          image: "/detail/imgs/hario_gooseneck_sml.png",
          url: "https://www.apple.com/"
        },
        {
          id: 4,
          name: "Comandante C40 Grinder",
          image: "/detail/imgs/comandante_c40_sml.png",
          url: "https://www.google.com/"
        }
      ]
    }
  },
  {
    id: 24,
    slug: "aeropress-go-travel-cup",
    title: "AeroPress Go travel cup",
    intro: "A practical travel recipe with minimal gear.",
    isCold: false,
    tags: ["aeropress-go"],
    meta: {
      source: {
        icon: "/recipeIcon/icon_enthusiast.svg",
        name: "From an Enthusiast"
      },
      creator: {
        name: "Travel Brewers"
      },
      likes: 132,
      saves: 47,
      comments: 6,
      privateNotes: 0
    },
    content: [
      {
        type: "paragraph",
        text: "AeroPress Go travel cup is designed as a practical AeroPress recipe with a clear, repeatable method."
      },
      {
        type: "heading",
        text: "Brew notes"
      },
      {
        type: "list",
        items: [
          "Use 14g of coffee and 200g of water.",
          "Brew with a paper filter in the standard position.",
          "Adjust grind around medium if the cup tastes unbalanced."
        ]
      }
    ],
    steps: [
      {
        id: 1,
        text: "Prepare the AeroPress in the standard position."
      },
      {
        id: 2,
        text: "Add 14g of coffee ground medium."
      },
      {
        id: 3,
        text: "Pour 200g of water at 92C."
      },
      {
        id: 4,
        text: "Steep until the timer reaches 1:30."
      },
      {
        id: 5,
        text: "Press gently and serve immediately."
      }
    ],
    overview: {
      brew: {
        method: "standard",
        time: 90,
        filter: "paper"
      },
      coffee: {
        amount: 14,
        unit: "g",
        description: "Medium roast"
      },
      grind: {
        level: "Medium",
        grinder: {
          model: "Porlex Mini",
          setting: "9"
        }
      },
      water: {
        amount: 200,
        temperature: 92,
        unit: "g"
      },
      equipment: [
        {
          id: 1,
          name: "AeroPress",
          image: "/detail/imgs/aeropress_sml.png",
          url: "https://www.apple.com/"
        },
        {
          id: 2,
          name: "Comandante C40 Grinder",
          image: "/detail/imgs/comandante_c40_sml.png",
          url: "https://www.google.com/"
        },
        {
          id: 3,
          name: "Hario V60 Drip Scale",
          image: "/detail/imgs/hario_scale_grinder_sml.png",
          url: "https://www.apple.com/mac/"
        }
      ]
    }
  },
  {
    id: 25,
    slug: "sweet-bypass-cup",
    title: "Sweet bypass cup",
    intro: "A concentrated brew finished with bypass water for sweetness.",
    isCold: false,
    tags: ["sweet"],
    meta: {
      source: {
        icon: "/recipeIcon/noun_tamper.svg",
        name: "From a Barista"
      },
      creator: {
        name: "Cafe Bench"
      },
      likes: 188,
      saves: 71,
      comments: 11,
      privateNotes: 1
    },
    content: [
      {
        type: "paragraph",
        text: "Sweet bypass cup is designed as a practical AeroPress recipe with a clear, repeatable method."
      },
      {
        type: "heading",
        text: "Brew notes"
      },
      {
        type: "list",
        items: [
          "Use 20g of coffee and 120g of water.",
          "Brew with a paper filter in the inverted position.",
          "Adjust grind around medium-coarse if the cup tastes unbalanced."
        ]
      }
    ],
    steps: [
      {
        id: 1,
        text: "Prepare the AeroPress in the inverted position."
      },
      {
        id: 2,
        text: "Add 20g of coffee ground medium-coarse."
      },
      {
        id: 3,
        text: "Pour 120g of water at 86C."
      },
      {
        id: 4,
        text: "Steep until the timer reaches 3:10."
      },
      {
        id: 5,
        text: "Press gently and serve immediately."
      }
    ],
    overview: {
      brew: {
        method: "inverted",
        time: 190,
        filter: "paper"
      },
      coffee: {
        amount: 20,
        unit: "g",
        description: "Sweet Colombian coffee"
      },
      grind: {
        level: "Medium-coarse",
        grinder: {
          model: "C40",
          setting: "29"
        }
      },
      water: {
        amount: 120,
        temperature: 86,
        unit: "g"
      },
      equipment: [
        {
          id: 1,
          name: "AeroPress",
          image: "/detail/imgs/aeropress_sml.png",
          url: "https://www.google.com/chrome"
        },
        {
          id: 2,
          name: "Hario Buono Gooseneck Kettle",
          image: "/detail/imgs/hario_gooseneck_sml.png",
          url: "https://www.apple.com/ipad/"
        }
      ]
    }
  },
  {
    id: 26,
    slug: "dark-roast-comfort",
    title: "Dark roast comfort",
    intro: "A lower-temperature recipe for a round dark roast cup.",
    isCold: false,
    tags: [],
    meta: {
      source: {
        icon: "/recipeIcon/icon_enthusiast.svg",
        name: "From an Enthusiast"
      },
      creator: {
        name: "Mina Patel"
      },
      likes: 154,
      saves: 62,
      comments: 9,
      privateNotes: 1
    },
    content: [
      {
        type: "paragraph",
        text: "Dark roast comfort is designed as a practical AeroPress recipe with a clear, repeatable method."
      },
      {
        type: "heading",
        text: "Brew notes"
      },
      {
        type: "list",
        items: [
          "Use 16g of coffee and 220g of water.",
          "Brew with a metal filter in the standard position.",
          "Adjust grind around medium-coarse if the cup tastes unbalanced."
        ]
      }
    ],
    steps: [
      {
        id: 1,
        text: "Prepare the AeroPress in the standard position."
      },
      {
        id: 2,
        text: "Add 16g of coffee ground medium-coarse."
      },
      {
        id: 3,
        text: "Pour 220g of water at 84C."
      },
      {
        id: 4,
        text: "Steep until the timer reaches 2:40."
      },
      {
        id: 5,
        text: "Press gently and serve immediately."
      }
    ],
    overview: {
      brew: {
        method: "standard",
        time: 160,
        filter: "metal"
      },
      coffee: {
        amount: 16,
        unit: "g",
        description: "Dark roast"
      },
      grind: {
        level: "Medium-coarse",
        grinder: {
          model: "Ode Gen 2",
          setting: "6"
        }
      },
      water: {
        amount: 220,
        temperature: 84,
        unit: "g"
      },
      equipment: [
        {
          id: 1,
          name: "AeroPress",
          image: "/detail/imgs/aeropress_sml.png",
          url: "https://www.google.com/maps"
        },
        {
          id: 2,
          name: "Porlex Mini Hand Grinder",
          image: "/detail/imgs/porlex_mini_sml.png",
          url: "https://www.apple.com/iphone/"
        },
        {
          id: 3,
          name: "Brewista Artisan Gooseneck Kettle",
          image: "/detail/imgs/brewista_artisan_kettle_sml.png",
          url: "https://www.google.com/"
        }
      ]
    }
  },
  {
    id: 27,
    slug: "nordic-filter-style",
    title: "Nordic filter style",
    intro: "A light and transparent recipe inspired by Nordic filter coffee.",
    isCold: false,
    tags: ["fruit-filter"],
    meta: {
      source: {
        icon: "/recipeIcon/noun_tamper.svg",
        name: "From a Barista"
      },
      creator: {
        name: "Oslo Brew Bar"
      },
      likes: 216,
      saves: 94,
      comments: 14,
      privateNotes: 2
    },
    content: [
      {
        type: "paragraph",
        text: "Nordic filter style is designed as a practical AeroPress recipe with a clear, repeatable method."
      },
      {
        type: "heading",
        text: "Brew notes"
      },
      {
        type: "list",
        items: [
          "Use 14g of coffee and 230g of water.",
          "Brew with a paper filter in the standard position.",
          "Adjust grind around fine if the cup tastes unbalanced."
        ]
      }
    ],
    steps: [
      {
        id: 1,
        text: "Prepare the AeroPress in the standard position."
      },
      {
        id: 2,
        text: "Add 14g of coffee ground fine."
      },
      {
        id: 3,
        text: "Pour 230g of water at 96C."
      },
      {
        id: 4,
        text: "Steep until the timer reaches 2:00."
      },
      {
        id: 5,
        text: "Press gently and serve immediately."
      }
    ],
    overview: {
      brew: {
        method: "standard",
        time: 120,
        filter: "paper"
      },
      coffee: {
        amount: 14,
        unit: "g",
        description: "Light Nordic roast"
      },
      grind: {
        level: "Fine",
        grinder: {
          model: "C40",
          setting: "21"
        }
      },
      water: {
        amount: 230,
        temperature: 96,
        unit: "g"
      },
      equipment: [
        {
          id: 1,
          name: "AeroPress",
          image: "/detail/imgs/aeropress_sml.png",
          url: "https://www.apple.com/watch/"
        },
        {
          id: 2,
          name: "Hario V60 Drip Scale",
          image: "/detail/imgs/hario_scale_grinder_sml.png",
          url: "https://www.google.com/search"
        },
        {
          id: 3,
          name: "Hario Buono Gooseneck Kettle",
          image: "/detail/imgs/hario_gooseneck_sml.png",
          url: "https://www.apple.com/"
        },
        {
          id: 4,
          name: "Comandante C40 Grinder",
          image: "/detail/imgs/comandante_c40_sml.png",
          url: "https://www.google.com/"
        }
      ]
    }
  },
  {
    id: 28,
    slug: "cafe-milk-base",
    title: "Cafe milk base",
    intro: "A strong AeroPress concentrate for milk drinks.",
    isCold: false,
    tags: [],
    meta: {
      source: {
        icon: "/recipeIcon/noun_tamper.svg",
        name: "From a Barista"
      },
      creator: {
        name: "Milk Bar Coffee"
      },
      likes: 175,
      saves: 69,
      comments: 10,
      privateNotes: 1
    },
    content: [
      {
        type: "paragraph",
        text: "Cafe milk base is designed as a practical AeroPress recipe with a clear, repeatable method."
      },
      {
        type: "heading",
        text: "Brew notes"
      },
      {
        type: "list",
        items: [
          "Use 19g of coffee and 90g of water.",
          "Brew with a metal filter in the inverted position.",
          "Adjust grind around fine if the cup tastes unbalanced."
        ]
      }
    ],
    steps: [
      {
        id: 1,
        text: "Prepare the AeroPress in the inverted position."
      },
      {
        id: 2,
        text: "Add 19g of coffee ground fine."
      },
      {
        id: 3,
        text: "Pour 90g of water at 95C."
      },
      {
        id: 4,
        text: "Steep until the timer reaches 1:40."
      },
      {
        id: 5,
        text: "Press gently and serve immediately."
      }
    ],
    overview: {
      brew: {
        method: "inverted",
        time: 100,
        filter: "metal"
      },
      coffee: {
        amount: 19,
        unit: "g",
        description: "Espresso roast"
      },
      grind: {
        level: "Fine",
        grinder: {
          model: "JX Pro",
          setting: "2.3.0"
        }
      },
      water: {
        amount: 90,
        temperature: 95,
        unit: "g"
      },
      equipment: [
        {
          id: 1,
          name: "AeroPress",
          image: "/detail/imgs/aeropress_sml.png",
          url: "https://www.apple.com/"
        },
        {
          id: 2,
          name: "Comandante C40 Grinder",
          image: "/detail/imgs/comandante_c40_sml.png",
          url: "https://www.google.com/"
        },
        {
          id: 3,
          name: "Hario V60 Drip Scale",
          image: "/detail/imgs/hario_scale_grinder_sml.png",
          url: "https://www.apple.com/mac/"
        }
      ]
    }
  },
  {
    id: 29,
    slug: "long-steep-clarity",
    title: "Long steep clarity",
    intro: "A long immersion recipe that still finishes clean.",
    isCold: false,
    tags: [],
    meta: {
      source: {
        icon: "/recipeIcon/cat_experimental.svg",
        name: "Experimental"
      },
      creator: {
        name: "Quiet Cup Lab"
      },
      likes: 198,
      saves: 76,
      comments: 12,
      privateNotes: 1
    },
    content: [
      {
        type: "paragraph",
        text: "Long steep clarity is designed as a practical AeroPress recipe with a clear, repeatable method."
      },
      {
        type: "heading",
        text: "Brew notes"
      },
      {
        type: "list",
        items: [
          "Use 15g of coffee and 240g of water.",
          "Brew with a paper filter in the standard position.",
          "Adjust grind around medium if the cup tastes unbalanced."
        ]
      }
    ],
    steps: [
      {
        id: 1,
        text: "Prepare the AeroPress in the standard position."
      },
      {
        id: 2,
        text: "Add 15g of coffee ground medium."
      },
      {
        id: 3,
        text: "Pour 240g of water at 91C."
      },
      {
        id: 4,
        text: "Steep until the timer reaches 5:30."
      },
      {
        id: 5,
        text: "Press gently and serve immediately."
      }
    ],
    overview: {
      brew: {
        method: "standard",
        time: 330,
        filter: "paper"
      },
      coffee: {
        amount: 15,
        unit: "g",
        description: "Washed high-grown coffee"
      },
      grind: {
        level: "Medium",
        grinder: {
          model: "C40",
          setting: "25"
        }
      },
      water: {
        amount: 240,
        temperature: 91,
        unit: "g"
      },
      equipment: [
        {
          id: 1,
          name: "AeroPress",
          image: "/detail/imgs/aeropress_sml.png",
          url: "https://www.google.com/chrome"
        },
        {
          id: 2,
          name: "Hario Buono Gooseneck Kettle",
          image: "/detail/imgs/hario_gooseneck_sml.png",
          url: "https://www.apple.com/ipad/"
        }
      ]
    }
  },
  {
    id: 30,
    slug: "championship-bypass",
    title: "Championship bypass",
    intro: "A high-dose competition style brew with bypass control.",
    isCold: false,
    tags: ["aeropress-xl"],
    meta: {
      source: {
        icon: "/recipeIcon/cat_crown.svg",
        name: "Championship"
      },
      creator: {
        name: "AeroPress Champion"
      },
      likes: 342,
      saves: 136,
      comments: 25,
      privateNotes: 3
    },
    content: [
      {
        type: "paragraph",
        text: "Championship bypass is designed as a practical AeroPress recipe with a clear, repeatable method."
      },
      {
        type: "heading",
        text: "Brew notes"
      },
      {
        type: "list",
        items: [
          "Use 28g of coffee and 140g of water.",
          "Brew with a paper filter in the inverted position.",
          "Adjust grind around coarse if the cup tastes unbalanced."
        ]
      }
    ],
    steps: [
      {
        id: 1,
        text: "Prepare the AeroPress in the inverted position."
      },
      {
        id: 2,
        text: "Add 28g of coffee ground coarse."
      },
      {
        id: 3,
        text: "Pour 140g of water at 82C."
      },
      {
        id: 4,
        text: "Steep until the timer reaches 2:15."
      },
      {
        id: 5,
        text: "Press gently and serve immediately."
      }
    ],
    overview: {
      brew: {
        method: "inverted",
        time: 135,
        filter: "paper"
      },
      coffee: {
        amount: 28,
        unit: "g",
        description: "Competition roast"
      },
      grind: {
        level: "Coarse",
        grinder: {
          model: "C40",
          setting: "31"
        }
      },
      water: {
        amount: 140,
        temperature: 82,
        unit: "g"
      },
      equipment: [
        {
          id: 1,
          name: "AeroPress",
          image: "/detail/imgs/aeropress_sml.png",
          url: "https://www.google.com/maps"
        },
        {
          id: 2,
          name: "Porlex Mini Hand Grinder",
          image: "/detail/imgs/porlex_mini_sml.png",
          url: "https://www.apple.com/iphone/"
        },
        {
          id: 3,
          name: "Brewista Artisan Gooseneck Kettle",
          image: "/detail/imgs/brewista_artisan_kettle_sml.png",
          url: "https://www.google.com/"
        }
      ]
    }
  },
  {
    id: 31,
    slug: "iced-fruit-filter",
    title: "Iced fruit filter",
    intro: "A bright iced filter-style cup brewed hot over ice.",
    isCold: true,
    tags: ["fruit-filter", "alcohol"],
    meta: {
      source: {
        icon: "/recipeIcon/cat_experimental.svg",
        name: "Experimental"
      },
      creator: {
        name: "Cold Cup Studio"
      },
      likes: 167,
      saves: 64,
      comments: 9,
      privateNotes: 1
    },
    content: [
      {
        type: "paragraph",
        text: "Iced fruit filter is designed as a practical AeroPress recipe with a clear, repeatable method."
      },
      {
        type: "heading",
        text: "Brew notes"
      },
      {
        type: "list",
        items: [
          "Use 15g of coffee and 150g of water.",
          "Brew with a paper filter in the standard position.",
          "Adjust grind around medium-fine if the cup tastes unbalanced."
        ]
      }
    ],
    steps: [
      {
        id: 1,
        text: "Prepare the AeroPress in the standard position."
      },
      {
        id: 2,
        text: "Add 15g of coffee ground medium-fine."
      },
      {
        id: 3,
        text: "Pour 150g of water at 90C."
      },
      {
        id: 4,
        text: "Steep until the timer reaches 1:45."
      },
      {
        id: 5,
        text: "Press gently and serve immediately."
      }
    ],
    overview: {
      brew: {
        method: "standard",
        time: 105,
        filter: "paper"
      },
      coffee: {
        amount: 15,
        unit: "g",
        description: "Fruity light roast"
      },
      grind: {
        level: "Medium-fine",
        grinder: {
          model: "Timemore C2",
          setting: "13"
        }
      },
      water: {
        amount: 150,
        temperature: 90,
        unit: "g"
      },
      equipment: [
        {
          id: 1,
          name: "AeroPress",
          image: "/detail/imgs/aeropress_sml.png",
          url: "https://www.apple.com/watch/"
        },
        {
          id: 2,
          name: "Hario V60 Drip Scale",
          image: "/detail/imgs/hario_scale_grinder_sml.png",
          url: "https://www.google.com/search"
        },
        {
          id: 3,
          name: "Hario Buono Gooseneck Kettle",
          image: "/detail/imgs/hario_gooseneck_sml.png",
          url: "https://www.apple.com/"
        },
        {
          id: 4,
          name: "Comandante C40 Grinder",
          image: "/detail/imgs/comandante_c40_sml.png",
          url: "https://www.google.com/"
        }
      ]
    }
  },
  {
    id: 32,
    slug: "tiny-dose-big-flavour",
    title: "Tiny dose big flavour",
    intro: "A lower-dose recipe that still tastes full and sweet.",
    isCold: false,
    tags: [],
    meta: {
      source: {
        icon: "/recipeIcon/icon_enthusiast.svg",
        name: "From an Enthusiast"
      },
      creator: {
        name: "Ana Costa"
      },
      likes: 128,
      saves: 46,
      comments: 5,
      privateNotes: 0
    },
    content: [
      {
        type: "paragraph",
        text: "Tiny dose big flavour is designed as a practical AeroPress recipe with a clear, repeatable method."
      },
      {
        type: "heading",
        text: "Brew notes"
      },
      {
        type: "list",
        items: [
          "Use 11g of coffee and 180g of water.",
          "Brew with a paper filter in the standard position.",
          "Adjust grind around fine if the cup tastes unbalanced."
        ]
      }
    ],
    steps: [
      {
        id: 1,
        text: "Prepare the AeroPress in the standard position."
      },
      {
        id: 2,
        text: "Add 11g of coffee ground fine."
      },
      {
        id: 3,
        text: "Pour 180g of water at 94C."
      },
      {
        id: 4,
        text: "Steep until the timer reaches 2:50."
      },
      {
        id: 5,
        text: "Press gently and serve immediately."
      }
    ],
    overview: {
      brew: {
        method: "standard",
        time: 170,
        filter: "paper"
      },
      coffee: {
        amount: 11,
        unit: "g",
        description: "Sweet medium roast"
      },
      grind: {
        level: "Fine",
        grinder: {
          model: "Porlex Mini",
          setting: "7"
        }
      },
      water: {
        amount: 180,
        temperature: 94,
        unit: "g"
      },
      equipment: [
        {
          id: 1,
          name: "AeroPress",
          image: "/detail/imgs/aeropress_sml.png",
          url: "https://www.apple.com/"
        },
        {
          id: 2,
          name: "Comandante C40 Grinder",
          image: "/detail/imgs/comandante_c40_sml.png",
          url: "https://www.google.com/"
        },
        {
          id: 3,
          name: "Hario V60 Drip Scale",
          image: "/detail/imgs/hario_scale_grinder_sml.png",
          url: "https://www.apple.com/mac/"
        }
      ]
    }
  },
  {
    id: 33,
    slug: "two-cup-office-brew",
    title: "Two cup office brew",
    intro: "A larger AeroPress brew designed to share.",
    isCold: false,
    tags: ["aeropress-xl"],
    meta: {
      source: {
        icon: "/recipeIcon/icon_enthusiast.svg",
        name: "From an Enthusiast"
      },
      creator: {
        name: "Office Brewers"
      },
      likes: 139,
      saves: 51,
      comments: 6,
      privateNotes: 1
    },
    content: [
      {
        type: "paragraph",
        text: "Two cup office brew is designed as a practical AeroPress recipe with a clear, repeatable method."
      },
      {
        type: "heading",
        text: "Brew notes"
      },
      {
        type: "list",
        items: [
          "Use 24g of coffee and 320g of water.",
          "Brew with a paper filter in the standard position.",
          "Adjust grind around medium-coarse if the cup tastes unbalanced."
        ]
      }
    ],
    steps: [
      {
        id: 1,
        text: "Prepare the AeroPress in the standard position."
      },
      {
        id: 2,
        text: "Add 24g of coffee ground medium-coarse."
      },
      {
        id: 3,
        text: "Pour 320g of water at 92C."
      },
      {
        id: 4,
        text: "Steep until the timer reaches 5:00."
      },
      {
        id: 5,
        text: "Press gently and serve immediately."
      }
    ],
    overview: {
      brew: {
        method: "standard",
        time: 300,
        filter: "paper"
      },
      coffee: {
        amount: 24,
        unit: "g",
        description: "Daily blend"
      },
      grind: {
        level: "Medium-coarse",
        grinder: {
          model: "Ode Gen 2",
          setting: "7"
        }
      },
      water: {
        amount: 320,
        temperature: 92,
        unit: "g"
      },
      equipment: [
        {
          id: 1,
          name: "AeroPress",
          image: "/detail/imgs/aeropress_sml.png",
          url: "https://www.google.com/chrome"
        },
        {
          id: 2,
          name: "Hario Buono Gooseneck Kettle",
          image: "/detail/imgs/hario_gooseneck_sml.png",
          url: "https://www.apple.com/ipad/"
        }
      ]
    }
  },
  {
    id: 34,
    slug: "slow-press-sweetness",
    title: "Slow press sweetness",
    intro: "A patient inverted recipe focused on sweetness.",
    isCold: false,
    tags: ["sweet"],
    meta: {
      source: {
        icon: "/recipeIcon/noun_tamper.svg",
        name: "From a Barista"
      },
      creator: {
        name: "Damar Coffee"
      },
      likes: 159,
      saves: 58,
      comments: 8,
      privateNotes: 1
    },
    content: [
      {
        type: "paragraph",
        text: "Slow press sweetness is designed as a practical AeroPress recipe with a clear, repeatable method."
      },
      {
        type: "heading",
        text: "Brew notes"
      },
      {
        type: "list",
        items: [
          "Use 18g of coffee and 260g of water.",
          "Brew with a paper filter in the inverted position.",
          "Adjust grind around medium if the cup tastes unbalanced."
        ]
      }
    ],
    steps: [
      {
        id: 1,
        text: "Prepare the AeroPress in the inverted position."
      },
      {
        id: 2,
        text: "Add 18g of coffee ground medium."
      },
      {
        id: 3,
        text: "Pour 260g of water at 89C."
      },
      {
        id: 4,
        text: "Steep until the timer reaches 6:30."
      },
      {
        id: 5,
        text: "Press gently and serve immediately."
      }
    ],
    overview: {
      brew: {
        method: "inverted",
        time: 390,
        filter: "paper"
      },
      coffee: {
        amount: 18,
        unit: "g",
        description: "Honey or pulped natural coffee"
      },
      grind: {
        level: "Medium",
        grinder: {
          model: "C40",
          setting: "27"
        }
      },
      water: {
        amount: 260,
        temperature: 89,
        unit: "g"
      },
      equipment: [
        {
          id: 1,
          name: "AeroPress",
          image: "/detail/imgs/aeropress_sml.png",
          url: "https://www.google.com/maps"
        },
        {
          id: 2,
          name: "Porlex Mini Hand Grinder",
          image: "/detail/imgs/porlex_mini_sml.png",
          url: "https://www.apple.com/iphone/"
        },
        {
          id: 3,
          name: "Brewista Artisan Gooseneck Kettle",
          image: "/detail/imgs/brewista_artisan_kettle_sml.png",
          url: "https://www.google.com/"
        }
      ]
    }
  },
  {
    id: 35,
    slug: "experimental-low-temperature",
    title: "Experimental low temperature",
    intro: "A low-temperature recipe for delicate acidity and less bitterness.",
    isCold: true,
    tags: ["alcohol"],
    meta: {
      source: {
        icon: "/recipeIcon/cat_experimental.svg",
        name: "Experimental"
      },
      creator: {
        name: "Brew Notes Club"
      },
      likes: 121,
      saves: 43,
      comments: 5,
      privateNotes: 0
    },
    content: [
      {
        type: "paragraph",
        text: "Experimental low temperature is designed as a practical AeroPress recipe with a clear, repeatable method."
      },
      {
        type: "heading",
        text: "Brew notes"
      },
      {
        type: "list",
        items: [
          "Use 17g of coffee and 220g of water.",
          "Brew with a metal filter in the inverted position.",
          "Adjust grind around medium-coarse if the cup tastes unbalanced."
        ]
      }
    ],
    steps: [
      {
        id: 1,
        text: "Prepare the AeroPress in the inverted position."
      },
      {
        id: 2,
        text: "Add 17g of coffee ground medium-coarse."
      },
      {
        id: 3,
        text: "Pour 220g of water at 78C."
      },
      {
        id: 4,
        text: "Steep until the timer reaches 4:00."
      },
      {
        id: 5,
        text: "Press gently and serve immediately."
      }
    ],
    overview: {
      brew: {
        method: "inverted",
        time: 240,
        filter: "metal"
      },
      coffee: {
        amount: 17,
        unit: "g",
        description: "Light roast"
      },
      grind: {
        level: "Medium-coarse",
        grinder: {
          model: "Timemore C2",
          setting: "16"
        }
      },
      water: {
        amount: 220,
        temperature: 78,
        unit: "g"
      },
      equipment: [
        {
          id: 1,
          name: "AeroPress",
          image: "/detail/imgs/aeropress_sml.png",
          url: "https://www.apple.com/watch/"
        },
        {
          id: 2,
          name: "Hario V60 Drip Scale",
          image: "/detail/imgs/hario_scale_grinder_sml.png",
          url: "https://www.google.com/search"
        },
        {
          id: 3,
          name: "Hario Buono Gooseneck Kettle",
          image: "/detail/imgs/hario_gooseneck_sml.png",
          url: "https://www.apple.com/"
        },
        {
          id: 4,
          name: "Comandante C40 Grinder",
          image: "/detail/imgs/comandante_c40_sml.png",
          url: "https://www.google.com/"
        }
      ]
    }
  },
  {
    id: 36,
    slug: "jonathan-gagne-aeropress-recipe-sweet-cup",
    title: "Jonathan Gagne AeroPress recipe - Sweet cup",
    intro: "A careful, high-extraction cup inspired by Jonathan Gagne style recipes. A slightly sweeter variation for a rounded cup.",
    isCold: false,
    tags: ["sweet"],
    meta: {
      source: {
        icon: "/recipeIcon/icon_enthusiast.svg",
        name: "From an Enthusiast"
      },
      creator: {
        name: "Jonathan Gagne"
      },
      likes: 484,
      saves: 216,
      comments: 39,
      privateNotes: 3
    },
    content: [
      {
        type: "paragraph",
        text: "Jonathan Gagne AeroPress recipe - Sweet cup keeps the same direction as the base recipe, but nudges the brew toward more sweetness."
      },
      {
        type: "heading",
        text: "Brew notes"
      },
      {
        type: "list",
        items: [
          "Use 19g of coffee and 270g of water.",
          "Brew with a paper filter in the standard position.",
          "Adjust grind around fine to medium-fine if the cup tastes unbalanced."
        ]
      }
    ],
    steps: [
      {
        id: 1,
        text: "Prepare the AeroPress in the standard position."
      },
      {
        id: 2,
        text: "Add 19g of coffee ground fine to medium-fine."
      },
      {
        id: 3,
        text: "Pour 270g of water at 93C."
      },
      {
        id: 4,
        text: "Steep until the timer reaches 4:50."
      },
      {
        id: 5,
        text: "Press gently and serve immediately."
      }
    ],
    overview: {
      brew: {
        method: "standard",
        time: 290,
        filter: "paper"
      },
      coffee: {
        amount: 19,
        unit: "g",
        description: "Light roast with high clarity"
      },
      grind: {
        level: "Fine to medium-fine",
        grinder: {
          model: "C40",
          setting: "22"
        }
      },
      water: {
        amount: 270,
        temperature: 93,
        unit: "g"
      },
      equipment: [
        {
          id: 1,
          name: "AeroPress",
          image: "/detail/imgs/aeropress_sml.png",
          url: "https://www.apple.com/"
        },
        {
          id: 2,
          name: "Comandante C40 Grinder",
          image: "/detail/imgs/comandante_c40_sml.png",
          url: "https://www.google.com/"
        },
        {
          id: 3,
          name: "Hario V60 Drip Scale",
          image: "/detail/imgs/hario_scale_grinder_sml.png",
          url: "https://www.apple.com/mac/"
        }
      ]
    }
  },
  {
    id: 37,
    slug: "low-effort-big-reward-sweet-cup",
    title: "Low effort big reward - Sweet cup",
    intro: "A forgiving daily recipe with very little technique required. A slightly sweeter variation for a rounded cup.",
    isCold: false,
    tags: ["sweet"],
    meta: {
      source: {
        icon: "/recipeIcon/icon_enthusiast.svg",
        name: "From an Enthusiast"
      },
      creator: {
        name: "AeroRecipe Community"
      },
      likes: 409,
      saves: 194,
      comments: 30,
      privateNotes: 2
    },
    content: [
      {
        type: "paragraph",
        text: "Low effort big reward - Sweet cup keeps the same direction as the base recipe, but nudges the brew toward more sweetness."
      },
      {
        type: "heading",
        text: "Brew notes"
      },
      {
        type: "list",
        items: [
          "Use 16g of coffee and 240g of water.",
          "Brew with a paper filter in the standard position.",
          "Adjust grind around medium if the cup tastes unbalanced."
        ]
      }
    ],
    steps: [
      {
        id: 1,
        text: "Prepare the AeroPress in the standard position."
      },
      {
        id: 2,
        text: "Add 16g of coffee ground medium."
      },
      {
        id: 3,
        text: "Pour 240g of water at 91C."
      },
      {
        id: 4,
        text: "Steep until the timer reaches 2:50."
      },
      {
        id: 5,
        text: "Press gently and serve immediately."
      }
    ],
    overview: {
      brew: {
        method: "standard",
        time: 170,
        filter: "paper"
      },
      coffee: {
        amount: 16,
        unit: "g",
        description: "Medium roast"
      },
      grind: {
        level: "Medium",
        grinder: {
          model: "Timemore C2",
          setting: "14"
        }
      },
      water: {
        amount: 240,
        temperature: 91,
        unit: "g"
      },
      equipment: [
        {
          id: 1,
          name: "AeroPress",
          image: "/detail/imgs/aeropress_sml.png",
          url: "https://www.google.com/chrome"
        },
        {
          id: 2,
          name: "Hario Buono Gooseneck Kettle",
          image: "/detail/imgs/hario_gooseneck_sml.png",
          url: "https://www.apple.com/ipad/"
        }
      ]
    }
  },
  {
    id: 38,
    slug: "2015-world-aeropress-championship-sweet-cup",
    title: "2015 World AeroPress Championship - Sweet cup",
    intro: "A competition-style recipe built around a strong brew and bypass water. A slightly sweeter variation for a rounded cup.",
    isCold: false,
    tags: ["aeropress-xl", "sweet"],
    meta: {
      source: {
        icon: "/recipeIcon/cat_crown.svg",
        name: "Championship"
      },
      creator: {
        name: "WAC Archive"
      },
      likes: 577,
      saves: 266,
      comments: 52,
      privateNotes: 5
    },
    content: [
      {
        type: "paragraph",
        text: "2015 World AeroPress Championship - Sweet cup keeps the same direction as the base recipe, but nudges the brew toward more sweetness."
      },
      {
        type: "heading",
        text: "Brew notes"
      },
      {
        type: "list",
        items: [
          "Use 31g of coffee and 110g of water.",
          "Brew with a paper filter in the inverted position.",
          "Adjust grind around coarse if the cup tastes unbalanced."
        ]
      }
    ],
    steps: [
      {
        id: 1,
        text: "Prepare the AeroPress in the inverted position."
      },
      {
        id: 2,
        text: "Add 31g of coffee ground coarse."
      },
      {
        id: 3,
        text: "Pour 110g of water at 84C."
      },
      {
        id: 4,
        text: "Steep until the timer reaches 2:20."
      },
      {
        id: 5,
        text: "Press gently and serve immediately."
      }
    ],
    overview: {
      brew: {
        method: "inverted",
        time: 140,
        filter: "paper"
      },
      coffee: {
        amount: 31,
        unit: "g",
        description: "Competition coffee"
      },
      grind: {
        level: "Coarse",
        grinder: {
          model: "C40",
          setting: "30"
        }
      },
      water: {
        amount: 110,
        temperature: 84,
        unit: "g"
      },
      equipment: [
        {
          id: 1,
          name: "AeroPress",
          image: "/detail/imgs/aeropress_sml.png",
          url: "https://www.google.com/maps"
        },
        {
          id: 2,
          name: "Porlex Mini Hand Grinder",
          image: "/detail/imgs/porlex_mini_sml.png",
          url: "https://www.apple.com/iphone/"
        },
        {
          id: 3,
          name: "Brewista Artisan Gooseneck Kettle",
          image: "/detail/imgs/brewista_artisan_kettle_sml.png",
          url: "https://www.google.com/"
        }
      ]
    }
  },
  {
    id: 39,
    slug: "long-aeropress-espresso-shot-sweet-cup",
    title: "Long AeroPress Espresso Shot - Sweet cup",
    intro: "A short, intense cup that works well as a milk drink base. A slightly sweeter variation for a rounded cup.",
    isCold: false,
    tags: ["sweet"],
    meta: {
      source: {
        icon: "/recipeIcon/noun_tamper.svg",
        name: "From a Barista"
      },
      creator: {
        name: "Coffee Shop Lab"
      },
      likes: 316,
      saves: 149,
      comments: 24,
      privateNotes: 1
    },
    content: [
      {
        type: "paragraph",
        text: "Long AeroPress Espresso Shot - Sweet cup keeps the same direction as the base recipe, but nudges the brew toward more sweetness."
      },
      {
        type: "heading",
        text: "Brew notes"
      },
      {
        type: "list",
        items: [
          "Use 21g of coffee and 90g of water.",
          "Brew with a metal filter in the standard position.",
          "Adjust grind around fine if the cup tastes unbalanced."
        ]
      }
    ],
    steps: [
      {
        id: 1,
        text: "Prepare the AeroPress in the standard position."
      },
      {
        id: 2,
        text: "Add 21g of coffee ground fine."
      },
      {
        id: 3,
        text: "Pour 90g of water at 95C."
      },
      {
        id: 4,
        text: "Steep until the timer reaches 1:35."
      },
      {
        id: 5,
        text: "Press gently and serve immediately."
      }
    ],
    overview: {
      brew: {
        method: "standard",
        time: 95,
        filter: "metal"
      },
      coffee: {
        amount: 21,
        unit: "g",
        description: "Espresso blend"
      },
      grind: {
        level: "Fine",
        grinder: {
          model: "JX Pro",
          setting: "2.5.0"
        }
      },
      water: {
        amount: 90,
        temperature: 95,
        unit: "g"
      },
      equipment: [
        {
          id: 1,
          name: "AeroPress",
          image: "/detail/imgs/aeropress_sml.png",
          url: "https://www.apple.com/watch/"
        },
        {
          id: 2,
          name: "Hario V60 Drip Scale",
          image: "/detail/imgs/hario_scale_grinder_sml.png",
          url: "https://www.google.com/search"
        },
        {
          id: 3,
          name: "Hario Buono Gooseneck Kettle",
          image: "/detail/imgs/hario_gooseneck_sml.png",
          url: "https://www.apple.com/"
        },
        {
          id: 4,
          name: "Comandante C40 Grinder",
          image: "/detail/imgs/comandante_c40_sml.png",
          url: "https://www.google.com/"
        }
      ]
    }
  },
  {
    id: 40,
    slug: "evp-iced-coffee-sweet-cup",
    title: "EVP Iced Coffee - Sweet cup",
    intro: "A cold AeroPress recipe with a bright finish and quick dilution over ice. A slightly sweeter variation for a rounded cup.",
    isCold: true,
    tags: ["alcohol", "sweet"],
    meta: {
      source: {
        icon: "/recipeIcon/noun_tamper.svg",
        name: "From a Barista"
      },
      creator: {
        name: "EVP Coffee"
      },
      likes: 358,
      saves: 167,
      comments: 29,
      privateNotes: 2
    },
    content: [
      {
        type: "paragraph",
        text: "EVP Iced Coffee - Sweet cup keeps the same direction as the base recipe, but nudges the brew toward more sweetness."
      },
      {
        type: "heading",
        text: "Brew notes"
      },
      {
        type: "list",
        items: [
          "Use 19g of coffee and 170g of water.",
          "Brew with a paper filter in the inverted position.",
          "Adjust grind around medium if the cup tastes unbalanced."
        ]
      }
    ],
    steps: [
      {
        id: 1,
        text: "Prepare the AeroPress in the inverted position."
      },
      {
        id: 2,
        text: "Add 19g of coffee ground medium."
      },
      {
        id: 3,
        text: "Pour 170g of water at 87C."
      },
      {
        id: 4,
        text: "Steep until the timer reaches 3:20."
      },
      {
        id: 5,
        text: "Press gently and serve immediately."
      }
    ],
    overview: {
      brew: {
        method: "inverted",
        time: 200,
        filter: "paper"
      },
      coffee: {
        amount: 19,
        unit: "g",
        description: "Fruity washed coffee"
      },
      grind: {
        level: "Medium",
        grinder: {
          model: "Ode Gen 2",
          setting: "4"
        }
      },
      water: {
        amount: 170,
        temperature: 87,
        unit: "g"
      },
      equipment: [
        {
          id: 1,
          name: "AeroPress",
          image: "/detail/imgs/aeropress_sml.png",
          url: "https://www.apple.com/"
        },
        {
          id: 2,
          name: "Comandante C40 Grinder",
          image: "/detail/imgs/comandante_c40_sml.png",
          url: "https://www.google.com/"
        },
        {
          id: 3,
          name: "Hario V60 Drip Scale",
          image: "/detail/imgs/hario_scale_grinder_sml.png",
          url: "https://www.apple.com/mac/"
        }
      ]
    }
  },
  {
    id: 41,
    slug: "rule-of-thirds-sweet-cup",
    title: "Rule of Thirds - Sweet cup",
    intro: "A balanced recipe using equal parts bloom, brew and bypass. A slightly sweeter variation for a rounded cup.",
    isCold: false,
    tags: ["sweet"],
    meta: {
      source: {
        icon: "/recipeIcon/cat_experimental.svg",
        name: "Experimental"
      },
      creator: {
        name: "AeroPress Lab"
      },
      likes: 303,
      saves: 135,
      comments: 20,
      privateNotes: 1
    },
    content: [
      {
        type: "paragraph",
        text: "Rule of Thirds - Sweet cup keeps the same direction as the base recipe, but nudges the brew toward more sweetness."
      },
      {
        type: "heading",
        text: "Brew notes"
      },
      {
        type: "list",
        items: [
          "Use 17g of coffee and 250g of water.",
          "Brew with a paper filter in the standard position.",
          "Adjust grind around medium-fine if the cup tastes unbalanced."
        ]
      }
    ],
    steps: [
      {
        id: 1,
        text: "Prepare the AeroPress in the standard position."
      },
      {
        id: 2,
        text: "Add 17g of coffee ground medium-fine."
      },
      {
        id: 3,
        text: "Pour 250g of water at 91C."
      },
      {
        id: 4,
        text: "Steep until the timer reaches 3:50."
      },
      {
        id: 5,
        text: "Press gently and serve immediately."
      }
    ],
    overview: {
      brew: {
        method: "standard",
        time: 230,
        filter: "paper"
      },
      coffee: {
        amount: 17,
        unit: "g",
        description: "Sweet washed coffee"
      },
      grind: {
        level: "Medium-fine",
        grinder: {
          model: "C40",
          setting: "24"
        }
      },
      water: {
        amount: 250,
        temperature: 91,
        unit: "g"
      },
      equipment: [
        {
          id: 1,
          name: "AeroPress",
          image: "/detail/imgs/aeropress_sml.png",
          url: "https://www.google.com/chrome"
        },
        {
          id: 2,
          name: "Hario Buono Gooseneck Kettle",
          image: "/detail/imgs/hario_gooseneck_sml.png",
          url: "https://www.apple.com/ipad/"
        }
      ]
    }
  },
  {
    id: 42,
    slug: "the-bright-morning-cup-sweet-cup",
    title: "The Bright Morning Cup - Sweet cup",
    intro: "A clean morning brew with a lively acidity and light body. A slightly sweeter variation for a rounded cup.",
    isCold: false,
    tags: ["fruit-filter", "sweet"],
    meta: {
      source: {
        icon: "/recipeIcon/icon_enthusiast.svg",
        name: "From an Enthusiast"
      },
      creator: {
        name: "Maya Lee"
      },
      likes: 266,
      saves: 122,
      comments: 18,
      privateNotes: 1
    },
    content: [
      {
        type: "paragraph",
        text: "The Bright Morning Cup - Sweet cup keeps the same direction as the base recipe, but nudges the brew toward more sweetness."
      },
      {
        type: "heading",
        text: "Brew notes"
      },
      {
        type: "list",
        items: [
          "Use 14g of coffee and 210g of water.",
          "Brew with a paper filter in the standard position.",
          "Adjust grind around medium-fine if the cup tastes unbalanced."
        ]
      }
    ],
    steps: [
      {
        id: 1,
        text: "Prepare the AeroPress in the standard position."
      },
      {
        id: 2,
        text: "Add 14g of coffee ground medium-fine."
      },
      {
        id: 3,
        text: "Pour 210g of water at 93C."
      },
      {
        id: 4,
        text: "Steep until the timer reaches 2:05."
      },
      {
        id: 5,
        text: "Press gently and serve immediately."
      }
    ],
    overview: {
      brew: {
        method: "standard",
        time: 125,
        filter: "paper"
      },
      coffee: {
        amount: 14,
        unit: "g",
        description: "Light Ethiopian coffee"
      },
      grind: {
        level: "Medium-fine",
        grinder: {
          model: "Timemore C2",
          setting: "13"
        }
      },
      water: {
        amount: 210,
        temperature: 93,
        unit: "g"
      },
      equipment: [
        {
          id: 1,
          name: "AeroPress",
          image: "/detail/imgs/aeropress_sml.png",
          url: "https://www.google.com/maps"
        },
        {
          id: 2,
          name: "Porlex Mini Hand Grinder",
          image: "/detail/imgs/porlex_mini_sml.png",
          url: "https://www.apple.com/iphone/"
        },
        {
          id: 3,
          name: "Brewista Artisan Gooseneck Kettle",
          image: "/detail/imgs/brewista_artisan_kettle_sml.png",
          url: "https://www.google.com/"
        }
      ]
    }
  },
  {
    id: 43,
    slug: "gentle-sweetness-sweet-cup",
    title: "Gentle Sweetness - Sweet cup",
    intro: "A slower press recipe for a soft, sweet cup. A slightly sweeter variation for a rounded cup.",
    isCold: false,
    tags: ["sweet"],
    meta: {
      source: {
        icon: "/recipeIcon/noun_tamper.svg",
        name: "From a Barista"
      },
      creator: {
        name: "Nora Chen"
      },
      likes: 250,
      saves: 116,
      comments: 17,
      privateNotes: 1
    },
    content: [
      {
        type: "paragraph",
        text: "Gentle Sweetness - Sweet cup keeps the same direction as the base recipe, but nudges the brew toward more sweetness."
      },
      {
        type: "heading",
        text: "Brew notes"
      },
      {
        type: "list",
        items: [
          "Use 18g of coffee and 260g of water.",
          "Brew with a paper filter in the inverted position.",
          "Adjust grind around medium if the cup tastes unbalanced."
        ]
      }
    ],
    steps: [
      {
        id: 1,
        text: "Prepare the AeroPress in the inverted position."
      },
      {
        id: 2,
        text: "Add 18g of coffee ground medium."
      },
      {
        id: 3,
        text: "Pour 260g of water at 89C."
      },
      {
        id: 4,
        text: "Steep until the timer reaches 4:20."
      },
      {
        id: 5,
        text: "Press gently and serve immediately."
      }
    ],
    overview: {
      brew: {
        method: "inverted",
        time: 260,
        filter: "paper"
      },
      coffee: {
        amount: 18,
        unit: "g",
        description: "Honey processed coffee"
      },
      grind: {
        level: "Medium",
        grinder: {
          model: "C40",
          setting: "26"
        }
      },
      water: {
        amount: 260,
        temperature: 89,
        unit: "g"
      },
      equipment: [
        {
          id: 1,
          name: "AeroPress",
          image: "/detail/imgs/aeropress_sml.png",
          url: "https://www.apple.com/watch/"
        },
        {
          id: 2,
          name: "Hario V60 Drip Scale",
          image: "/detail/imgs/hario_scale_grinder_sml.png",
          url: "https://www.google.com/search"
        },
        {
          id: 3,
          name: "Hario Buono Gooseneck Kettle",
          image: "/detail/imgs/hario_gooseneck_sml.png",
          url: "https://www.apple.com/"
        },
        {
          id: 4,
          name: "Comandante C40 Grinder",
          image: "/detail/imgs/comandante_c40_sml.png",
          url: "https://www.google.com/"
        }
      ]
    }
  },
  {
    id: 44,
    slug: "fast-and-clean-aeropress-sweet-cup",
    title: "Fast and clean AeroPress - Sweet cup",
    intro: "A quick standard method for a clean cup before work. A slightly sweeter variation for a rounded cup.",
    isCold: false,
    tags: ["sweet"],
    meta: {
      source: {
        icon: "/recipeIcon/icon_enthusiast.svg",
        name: "From an Enthusiast"
      },
      creator: {
        name: "Leo Park"
      },
      likes: 235,
      saves: 107,
      comments: 16,
      privateNotes: 0
    },
    content: [
      {
        type: "paragraph",
        text: "Fast and clean AeroPress - Sweet cup keeps the same direction as the base recipe, but nudges the brew toward more sweetness."
      },
      {
        type: "heading",
        text: "Brew notes"
      },
      {
        type: "list",
        items: [
          "Use 13g of coffee and 190g of water.",
          "Brew with a paper filter in the standard position.",
          "Adjust grind around fine if the cup tastes unbalanced."
        ]
      }
    ],
    steps: [
      {
        id: 1,
        text: "Prepare the AeroPress in the standard position."
      },
      {
        id: 2,
        text: "Add 13g of coffee ground fine."
      },
      {
        id: 3,
        text: "Pour 190g of water at 92C."
      },
      {
        id: 4,
        text: "Steep until the timer reaches 1:20."
      },
      {
        id: 5,
        text: "Press gently and serve immediately."
      }
    ],
    overview: {
      brew: {
        method: "standard",
        time: 80,
        filter: "paper"
      },
      coffee: {
        amount: 13,
        unit: "g",
        description: "Any fresh coffee"
      },
      grind: {
        level: "Fine",
        grinder: {
          model: "Porlex Mini",
          setting: "8"
        }
      },
      water: {
        amount: 190,
        temperature: 92,
        unit: "g"
      },
      equipment: [
        {
          id: 1,
          name: "AeroPress",
          image: "/detail/imgs/aeropress_sml.png",
          url: "https://www.apple.com/"
        },
        {
          id: 2,
          name: "Comandante C40 Grinder",
          image: "/detail/imgs/comandante_c40_sml.png",
          url: "https://www.google.com/"
        },
        {
          id: 3,
          name: "Hario V60 Drip Scale",
          image: "/detail/imgs/hario_scale_grinder_sml.png",
          url: "https://www.apple.com/mac/"
        }
      ]
    }
  },
  {
    id: 45,
    slug: "big-body-breakfast-brew-sweet-cup",
    title: "Big body breakfast brew - Sweet cup",
    intro: "A fuller-bodied cup with a slightly higher dose. A slightly sweeter variation for a rounded cup.",
    isCold: false,
    tags: ["aeropress-xl", "sweet"],
    meta: {
      source: {
        icon: "/recipeIcon/noun_tamper.svg",
        name: "From a Barista"
      },
      creator: {
        name: "Rosa Kim"
      },
      likes: 277,
      saves: 139,
      comments: 23,
      privateNotes: 2
    },
    content: [
      {
        type: "paragraph",
        text: "Big body breakfast brew - Sweet cup keeps the same direction as the base recipe, but nudges the brew toward more sweetness."
      },
      {
        type: "heading",
        text: "Brew notes"
      },
      {
        type: "list",
        items: [
          "Use 23g of coffee and 270g of water.",
          "Brew with a metal filter in the inverted position.",
          "Adjust grind around medium if the cup tastes unbalanced."
        ]
      }
    ],
    steps: [
      {
        id: 1,
        text: "Prepare the AeroPress in the inverted position."
      },
      {
        id: 2,
        text: "Add 23g of coffee ground medium."
      },
      {
        id: 3,
        text: "Pour 270g of water at 90C."
      },
      {
        id: 4,
        text: "Steep until the timer reaches 3:20."
      },
      {
        id: 5,
        text: "Press gently and serve immediately."
      }
    ],
    overview: {
      brew: {
        method: "inverted",
        time: 200,
        filter: "metal"
      },
      coffee: {
        amount: 23,
        unit: "g",
        description: "Medium-dark roast"
      },
      grind: {
        level: "Medium",
        grinder: {
          model: "Ode Gen 2",
          setting: "5"
        }
      },
      water: {
        amount: 270,
        temperature: 90,
        unit: "g"
      },
      equipment: [
        {
          id: 1,
          name: "AeroPress",
          image: "/detail/imgs/aeropress_sml.png",
          url: "https://www.google.com/chrome"
        },
        {
          id: 2,
          name: "Hario Buono Gooseneck Kettle",
          image: "/detail/imgs/hario_gooseneck_sml.png",
          url: "https://www.apple.com/ipad/"
        }
      ]
    }
  },
  {
    id: 46,
    slug: "fruit-forward-inverted-sweet-cup",
    title: "Fruit-forward inverted - Sweet cup",
    intro: "An inverted recipe for fruit notes and a longer finish. A slightly sweeter variation for a rounded cup.",
    isCold: false,
    tags: ["fruit-filter", "sweet"],
    meta: {
      source: {
        icon: "/recipeIcon/cat_experimental.svg",
        name: "Experimental"
      },
      creator: {
        name: "Sam Ortega"
      },
      likes: 293,
      saves: 131,
      comments: 21,
      privateNotes: 1
    },
    content: [
      {
        type: "paragraph",
        text: "Fruit-forward inverted - Sweet cup keeps the same direction as the base recipe, but nudges the brew toward more sweetness."
      },
      {
        type: "heading",
        text: "Brew notes"
      },
      {
        type: "list",
        items: [
          "Use 17g of coffee and 230g of water.",
          "Brew with a paper filter in the inverted position.",
          "Adjust grind around medium-coarse if the cup tastes unbalanced."
        ]
      }
    ],
    steps: [
      {
        id: 1,
        text: "Prepare the AeroPress in the inverted position."
      },
      {
        id: 2,
        text: "Add 17g of coffee ground medium-coarse."
      },
      {
        id: 3,
        text: "Pour 230g of water at 87C."
      },
      {
        id: 4,
        text: "Steep until the timer reaches 3:50."
      },
      {
        id: 5,
        text: "Press gently and serve immediately."
      }
    ],
    overview: {
      brew: {
        method: "inverted",
        time: 230,
        filter: "paper"
      },
      coffee: {
        amount: 17,
        unit: "g",
        description: "Natural processed coffee"
      },
      grind: {
        level: "Medium-coarse",
        grinder: {
          model: "C40",
          setting: "28"
        }
      },
      water: {
        amount: 230,
        temperature: 87,
        unit: "g"
      },
      equipment: [
        {
          id: 1,
          name: "AeroPress",
          image: "/detail/imgs/aeropress_sml.png",
          url: "https://www.google.com/maps"
        },
        {
          id: 2,
          name: "Porlex Mini Hand Grinder",
          image: "/detail/imgs/porlex_mini_sml.png",
          url: "https://www.apple.com/iphone/"
        },
        {
          id: 3,
          name: "Brewista Artisan Gooseneck Kettle",
          image: "/detail/imgs/brewista_artisan_kettle_sml.png",
          url: "https://www.google.com/"
        }
      ]
    }
  },
  {
    id: 47,
    slug: "metal-filter-morning-sweet-cup",
    title: "Metal filter morning - Sweet cup",
    intro: "A metal-filter recipe with more oils and a heavier texture. A slightly sweeter variation for a rounded cup.",
    isCold: false,
    tags: ["sweet"],
    meta: {
      source: {
        icon: "/recipeIcon/icon_enthusiast.svg",
        name: "From an Enthusiast"
      },
      creator: {
        name: "Kenji Ito"
      },
      likes: 219,
      saves: 100,
      comments: 15,
      privateNotes: 0
    },
    content: [
      {
        type: "paragraph",
        text: "Metal filter morning - Sweet cup keeps the same direction as the base recipe, but nudges the brew toward more sweetness."
      },
      {
        type: "heading",
        text: "Brew notes"
      },
      {
        type: "list",
        items: [
          "Use 16g of coffee and 220g of water.",
          "Brew with a metal filter in the standard position.",
          "Adjust grind around medium if the cup tastes unbalanced."
        ]
      }
    ],
    steps: [
      {
        id: 1,
        text: "Prepare the AeroPress in the standard position."
      },
      {
        id: 2,
        text: "Add 16g of coffee ground medium."
      },
      {
        id: 3,
        text: "Pour 220g of water at 89C."
      },
      {
        id: 4,
        text: "Steep until the timer reaches 2:50."
      },
      {
        id: 5,
        text: "Press gently and serve immediately."
      }
    ],
    overview: {
      brew: {
        method: "standard",
        time: 170,
        filter: "metal"
      },
      coffee: {
        amount: 16,
        unit: "g",
        description: "Chocolate-forward coffee"
      },
      grind: {
        level: "Medium",
        grinder: {
          model: "Timemore C2",
          setting: "15"
        }
      },
      water: {
        amount: 220,
        temperature: 89,
        unit: "g"
      },
      equipment: [
        {
          id: 1,
          name: "AeroPress",
          image: "/detail/imgs/aeropress_sml.png",
          url: "https://www.apple.com/watch/"
        },
        {
          id: 2,
          name: "Hario V60 Drip Scale",
          image: "/detail/imgs/hario_scale_grinder_sml.png",
          url: "https://www.google.com/search"
        },
        {
          id: 3,
          name: "Hario Buono Gooseneck Kettle",
          image: "/detail/imgs/hario_gooseneck_sml.png",
          url: "https://www.apple.com/"
        },
        {
          id: 4,
          name: "Comandante C40 Grinder",
          image: "/detail/imgs/comandante_c40_sml.png",
          url: "https://www.google.com/"
        }
      ]
    }
  },
  {
    id: 48,
    slug: "aeropress-go-travel-cup-sweet-cup",
    title: "AeroPress Go travel cup - Sweet cup",
    intro: "A practical travel recipe with minimal gear. A slightly sweeter variation for a rounded cup.",
    isCold: false,
    tags: ["aeropress-go", "sweet"],
    meta: {
      source: {
        icon: "/recipeIcon/icon_enthusiast.svg",
        name: "From an Enthusiast"
      },
      creator: {
        name: "Travel Brewers"
      },
      likes: 204,
      saves: 95,
      comments: 14,
      privateNotes: 0
    },
    content: [
      {
        type: "paragraph",
        text: "AeroPress Go travel cup - Sweet cup keeps the same direction as the base recipe, but nudges the brew toward more sweetness."
      },
      {
        type: "heading",
        text: "Brew notes"
      },
      {
        type: "list",
        items: [
          "Use 15g of coffee and 210g of water.",
          "Brew with a paper filter in the standard position.",
          "Adjust grind around medium if the cup tastes unbalanced."
        ]
      }
    ],
    steps: [
      {
        id: 1,
        text: "Prepare the AeroPress in the standard position."
      },
      {
        id: 2,
        text: "Add 15g of coffee ground medium."
      },
      {
        id: 3,
        text: "Pour 210g of water at 91C."
      },
      {
        id: 4,
        text: "Steep until the timer reaches 1:50."
      },
      {
        id: 5,
        text: "Press gently and serve immediately."
      }
    ],
    overview: {
      brew: {
        method: "standard",
        time: 110,
        filter: "paper"
      },
      coffee: {
        amount: 15,
        unit: "g",
        description: "Medium roast"
      },
      grind: {
        level: "Medium",
        grinder: {
          model: "Porlex Mini",
          setting: "9"
        }
      },
      water: {
        amount: 210,
        temperature: 91,
        unit: "g"
      },
      equipment: [
        {
          id: 1,
          name: "AeroPress",
          image: "/detail/imgs/aeropress_sml.png",
          url: "https://www.apple.com/"
        },
        {
          id: 2,
          name: "Comandante C40 Grinder",
          image: "/detail/imgs/comandante_c40_sml.png",
          url: "https://www.google.com/"
        },
        {
          id: 3,
          name: "Hario V60 Drip Scale",
          image: "/detail/imgs/hario_scale_grinder_sml.png",
          url: "https://www.apple.com/mac/"
        }
      ]
    }
  },
  {
    id: 49,
    slug: "sweet-bypass-cup-sweet-cup",
    title: "Sweet bypass cup - Sweet cup",
    intro: "A concentrated brew finished with bypass water for sweetness. A slightly sweeter variation for a rounded cup.",
    isCold: false,
    tags: ["sweet"],
    meta: {
      source: {
        icon: "/recipeIcon/noun_tamper.svg",
        name: "From a Barista"
      },
      creator: {
        name: "Cafe Bench"
      },
      likes: 260,
      saves: 119,
      comments: 19,
      privateNotes: 1
    },
    content: [
      {
        type: "paragraph",
        text: "Sweet bypass cup - Sweet cup keeps the same direction as the base recipe, but nudges the brew toward more sweetness."
      },
      {
        type: "heading",
        text: "Brew notes"
      },
      {
        type: "list",
        items: [
          "Use 21g of coffee and 130g of water.",
          "Brew with a paper filter in the inverted position.",
          "Adjust grind around medium-coarse if the cup tastes unbalanced."
        ]
      }
    ],
    steps: [
      {
        id: 1,
        text: "Prepare the AeroPress in the inverted position."
      },
      {
        id: 2,
        text: "Add 21g of coffee ground medium-coarse."
      },
      {
        id: 3,
        text: "Pour 130g of water at 85C."
      },
      {
        id: 4,
        text: "Steep until the timer reaches 3:30."
      },
      {
        id: 5,
        text: "Press gently and serve immediately."
      }
    ],
    overview: {
      brew: {
        method: "inverted",
        time: 210,
        filter: "paper"
      },
      coffee: {
        amount: 21,
        unit: "g",
        description: "Sweet Colombian coffee"
      },
      grind: {
        level: "Medium-coarse",
        grinder: {
          model: "C40",
          setting: "29"
        }
      },
      water: {
        amount: 130,
        temperature: 85,
        unit: "g"
      },
      equipment: [
        {
          id: 1,
          name: "AeroPress",
          image: "/detail/imgs/aeropress_sml.png",
          url: "https://www.google.com/chrome"
        },
        {
          id: 2,
          name: "Hario Buono Gooseneck Kettle",
          image: "/detail/imgs/hario_gooseneck_sml.png",
          url: "https://www.apple.com/ipad/"
        }
      ]
    }
  },
  {
    id: 50,
    slug: "dark-roast-comfort-sweet-cup",
    title: "Dark roast comfort - Sweet cup",
    intro: "A lower-temperature recipe for a round dark roast cup. A slightly sweeter variation for a rounded cup.",
    isCold: false,
    tags: ["sweet"],
    meta: {
      source: {
        icon: "/recipeIcon/icon_enthusiast.svg",
        name: "From an Enthusiast"
      },
      creator: {
        name: "Mina Patel"
      },
      likes: 226,
      saves: 110,
      comments: 17,
      privateNotes: 1
    },
    content: [
      {
        type: "paragraph",
        text: "Dark roast comfort - Sweet cup keeps the same direction as the base recipe, but nudges the brew toward more sweetness."
      },
      {
        type: "heading",
        text: "Brew notes"
      },
      {
        type: "list",
        items: [
          "Use 17g of coffee and 230g of water.",
          "Brew with a metal filter in the standard position.",
          "Adjust grind around medium-coarse if the cup tastes unbalanced."
        ]
      }
    ],
    steps: [
      {
        id: 1,
        text: "Prepare the AeroPress in the standard position."
      },
      {
        id: 2,
        text: "Add 17g of coffee ground medium-coarse."
      },
      {
        id: 3,
        text: "Pour 230g of water at 83C."
      },
      {
        id: 4,
        text: "Steep until the timer reaches 3:00."
      },
      {
        id: 5,
        text: "Press gently and serve immediately."
      }
    ],
    overview: {
      brew: {
        method: "standard",
        time: 180,
        filter: "metal"
      },
      coffee: {
        amount: 17,
        unit: "g",
        description: "Dark roast"
      },
      grind: {
        level: "Medium-coarse",
        grinder: {
          model: "Ode Gen 2",
          setting: "6"
        }
      },
      water: {
        amount: 230,
        temperature: 83,
        unit: "g"
      },
      equipment: [
        {
          id: 1,
          name: "AeroPress",
          image: "/detail/imgs/aeropress_sml.png",
          url: "https://www.google.com/maps"
        },
        {
          id: 2,
          name: "Porlex Mini Hand Grinder",
          image: "/detail/imgs/porlex_mini_sml.png",
          url: "https://www.apple.com/iphone/"
        },
        {
          id: 3,
          name: "Brewista Artisan Gooseneck Kettle",
          image: "/detail/imgs/brewista_artisan_kettle_sml.png",
          url: "https://www.google.com/"
        }
      ]
    }
  },
  {
    id: 51,
    slug: "nordic-filter-style-sweet-cup",
    title: "Nordic filter style - Sweet cup",
    intro: "A light and transparent recipe inspired by Nordic filter coffee. A slightly sweeter variation for a rounded cup.",
    isCold: false,
    tags: ["fruit-filter", "sweet"],
    meta: {
      source: {
        icon: "/recipeIcon/noun_tamper.svg",
        name: "From a Barista"
      },
      creator: {
        name: "Oslo Brew Bar"
      },
      likes: 288,
      saves: 142,
      comments: 22,
      privateNotes: 2
    },
    content: [
      {
        type: "paragraph",
        text: "Nordic filter style - Sweet cup keeps the same direction as the base recipe, but nudges the brew toward more sweetness."
      },
      {
        type: "heading",
        text: "Brew notes"
      },
      {
        type: "list",
        items: [
          "Use 15g of coffee and 240g of water.",
          "Brew with a paper filter in the standard position.",
          "Adjust grind around fine if the cup tastes unbalanced."
        ]
      }
    ],
    steps: [
      {
        id: 1,
        text: "Prepare the AeroPress in the standard position."
      },
      {
        id: 2,
        text: "Add 15g of coffee ground fine."
      },
      {
        id: 3,
        text: "Pour 240g of water at 95C."
      },
      {
        id: 4,
        text: "Steep until the timer reaches 2:20."
      },
      {
        id: 5,
        text: "Press gently and serve immediately."
      }
    ],
    overview: {
      brew: {
        method: "standard",
        time: 140,
        filter: "paper"
      },
      coffee: {
        amount: 15,
        unit: "g",
        description: "Light Nordic roast"
      },
      grind: {
        level: "Fine",
        grinder: {
          model: "C40",
          setting: "21"
        }
      },
      water: {
        amount: 240,
        temperature: 95,
        unit: "g"
      },
      equipment: [
        {
          id: 1,
          name: "AeroPress",
          image: "/detail/imgs/aeropress_sml.png",
          url: "https://www.apple.com/watch/"
        },
        {
          id: 2,
          name: "Hario V60 Drip Scale",
          image: "/detail/imgs/hario_scale_grinder_sml.png",
          url: "https://www.google.com/search"
        },
        {
          id: 3,
          name: "Hario Buono Gooseneck Kettle",
          image: "/detail/imgs/hario_gooseneck_sml.png",
          url: "https://www.apple.com/"
        },
        {
          id: 4,
          name: "Comandante C40 Grinder",
          image: "/detail/imgs/comandante_c40_sml.png",
          url: "https://www.google.com/"
        }
      ]
    }
  },
  {
    id: 52,
    slug: "cafe-milk-base-sweet-cup",
    title: "Cafe milk base - Sweet cup",
    intro: "A strong AeroPress concentrate for milk drinks. A slightly sweeter variation for a rounded cup.",
    isCold: false,
    tags: ["sweet"],
    meta: {
      source: {
        icon: "/recipeIcon/noun_tamper.svg",
        name: "From a Barista"
      },
      creator: {
        name: "Milk Bar Coffee"
      },
      likes: 247,
      saves: 117,
      comments: 18,
      privateNotes: 1
    },
    content: [
      {
        type: "paragraph",
        text: "Cafe milk base - Sweet cup keeps the same direction as the base recipe, but nudges the brew toward more sweetness."
      },
      {
        type: "heading",
        text: "Brew notes"
      },
      {
        type: "list",
        items: [
          "Use 20g of coffee and 100g of water.",
          "Brew with a metal filter in the inverted position.",
          "Adjust grind around fine if the cup tastes unbalanced."
        ]
      }
    ],
    steps: [
      {
        id: 1,
        text: "Prepare the AeroPress in the inverted position."
      },
      {
        id: 2,
        text: "Add 20g of coffee ground fine."
      },
      {
        id: 3,
        text: "Pour 100g of water at 94C."
      },
      {
        id: 4,
        text: "Steep until the timer reaches 2:00."
      },
      {
        id: 5,
        text: "Press gently and serve immediately."
      }
    ],
    overview: {
      brew: {
        method: "inverted",
        time: 120,
        filter: "metal"
      },
      coffee: {
        amount: 20,
        unit: "g",
        description: "Espresso roast"
      },
      grind: {
        level: "Fine",
        grinder: {
          model: "JX Pro",
          setting: "2.3.0"
        }
      },
      water: {
        amount: 100,
        temperature: 94,
        unit: "g"
      },
      equipment: [
        {
          id: 1,
          name: "AeroPress",
          image: "/detail/imgs/aeropress_sml.png",
          url: "https://www.apple.com/"
        },
        {
          id: 2,
          name: "Comandante C40 Grinder",
          image: "/detail/imgs/comandante_c40_sml.png",
          url: "https://www.google.com/"
        },
        {
          id: 3,
          name: "Hario V60 Drip Scale",
          image: "/detail/imgs/hario_scale_grinder_sml.png",
          url: "https://www.apple.com/mac/"
        }
      ]
    }
  },
  {
    id: 53,
    slug: "long-steep-clarity-sweet-cup",
    title: "Long steep clarity - Sweet cup",
    intro: "A long immersion recipe that still finishes clean. A slightly sweeter variation for a rounded cup.",
    isCold: false,
    tags: ["sweet"],
    meta: {
      source: {
        icon: "/recipeIcon/cat_experimental.svg",
        name: "Experimental"
      },
      creator: {
        name: "Quiet Cup Lab"
      },
      likes: 270,
      saves: 124,
      comments: 20,
      privateNotes: 1
    },
    content: [
      {
        type: "paragraph",
        text: "Long steep clarity - Sweet cup keeps the same direction as the base recipe, but nudges the brew toward more sweetness."
      },
      {
        type: "heading",
        text: "Brew notes"
      },
      {
        type: "list",
        items: [
          "Use 16g of coffee and 250g of water.",
          "Brew with a paper filter in the standard position.",
          "Adjust grind around medium if the cup tastes unbalanced."
        ]
      }
    ],
    steps: [
      {
        id: 1,
        text: "Prepare the AeroPress in the standard position."
      },
      {
        id: 2,
        text: "Add 16g of coffee ground medium."
      },
      {
        id: 3,
        text: "Pour 250g of water at 90C."
      },
      {
        id: 4,
        text: "Steep until the timer reaches 5:50."
      },
      {
        id: 5,
        text: "Press gently and serve immediately."
      }
    ],
    overview: {
      brew: {
        method: "standard",
        time: 350,
        filter: "paper"
      },
      coffee: {
        amount: 16,
        unit: "g",
        description: "Washed high-grown coffee"
      },
      grind: {
        level: "Medium",
        grinder: {
          model: "C40",
          setting: "25"
        }
      },
      water: {
        amount: 250,
        temperature: 90,
        unit: "g"
      },
      equipment: [
        {
          id: 1,
          name: "AeroPress",
          image: "/detail/imgs/aeropress_sml.png",
          url: "https://www.google.com/chrome"
        },
        {
          id: 2,
          name: "Hario Buono Gooseneck Kettle",
          image: "/detail/imgs/hario_gooseneck_sml.png",
          url: "https://www.apple.com/ipad/"
        }
      ]
    }
  },
  {
    id: 54,
    slug: "championship-bypass-sweet-cup",
    title: "Championship bypass - Sweet cup",
    intro: "A high-dose competition style brew with bypass control. A slightly sweeter variation for a rounded cup.",
    isCold: false,
    tags: ["aeropress-xl", "sweet"],
    meta: {
      source: {
        icon: "/recipeIcon/cat_crown.svg",
        name: "Championship"
      },
      creator: {
        name: "AeroPress Champion"
      },
      likes: 414,
      saves: 184,
      comments: 33,
      privateNotes: 3
    },
    content: [
      {
        type: "paragraph",
        text: "Championship bypass - Sweet cup keeps the same direction as the base recipe, but nudges the brew toward more sweetness."
      },
      {
        type: "heading",
        text: "Brew notes"
      },
      {
        type: "list",
        items: [
          "Use 29g of coffee and 150g of water.",
          "Brew with a paper filter in the inverted position.",
          "Adjust grind around coarse if the cup tastes unbalanced."
        ]
      }
    ],
    steps: [
      {
        id: 1,
        text: "Prepare the AeroPress in the inverted position."
      },
      {
        id: 2,
        text: "Add 29g of coffee ground coarse."
      },
      {
        id: 3,
        text: "Pour 150g of water at 81C."
      },
      {
        id: 4,
        text: "Steep until the timer reaches 2:35."
      },
      {
        id: 5,
        text: "Press gently and serve immediately."
      }
    ],
    overview: {
      brew: {
        method: "inverted",
        time: 155,
        filter: "paper"
      },
      coffee: {
        amount: 29,
        unit: "g",
        description: "Competition roast"
      },
      grind: {
        level: "Coarse",
        grinder: {
          model: "C40",
          setting: "31"
        }
      },
      water: {
        amount: 150,
        temperature: 81,
        unit: "g"
      },
      equipment: [
        {
          id: 1,
          name: "AeroPress",
          image: "/detail/imgs/aeropress_sml.png",
          url: "https://www.google.com/maps"
        },
        {
          id: 2,
          name: "Porlex Mini Hand Grinder",
          image: "/detail/imgs/porlex_mini_sml.png",
          url: "https://www.apple.com/iphone/"
        },
        {
          id: 3,
          name: "Brewista Artisan Gooseneck Kettle",
          image: "/detail/imgs/brewista_artisan_kettle_sml.png",
          url: "https://www.google.com/"
        }
      ]
    }
  },
  {
    id: 55,
    slug: "iced-fruit-filter-sweet-cup",
    title: "Iced fruit filter - Sweet cup",
    intro: "A bright iced filter-style cup brewed hot over ice. A slightly sweeter variation for a rounded cup.",
    isCold: true,
    tags: ["fruit-filter", "alcohol", "sweet"],
    meta: {
      source: {
        icon: "/recipeIcon/cat_experimental.svg",
        name: "Experimental"
      },
      creator: {
        name: "Cold Cup Studio"
      },
      likes: 239,
      saves: 112,
      comments: 17,
      privateNotes: 1
    },
    content: [
      {
        type: "paragraph",
        text: "Iced fruit filter - Sweet cup keeps the same direction as the base recipe, but nudges the brew toward more sweetness."
      },
      {
        type: "heading",
        text: "Brew notes"
      },
      {
        type: "list",
        items: [
          "Use 16g of coffee and 160g of water.",
          "Brew with a paper filter in the standard position.",
          "Adjust grind around medium-fine if the cup tastes unbalanced."
        ]
      }
    ],
    steps: [
      {
        id: 1,
        text: "Prepare the AeroPress in the standard position."
      },
      {
        id: 2,
        text: "Add 16g of coffee ground medium-fine."
      },
      {
        id: 3,
        text: "Pour 160g of water at 89C."
      },
      {
        id: 4,
        text: "Steep until the timer reaches 2:05."
      },
      {
        id: 5,
        text: "Press gently and serve immediately."
      }
    ],
    overview: {
      brew: {
        method: "standard",
        time: 125,
        filter: "paper"
      },
      coffee: {
        amount: 16,
        unit: "g",
        description: "Fruity light roast"
      },
      grind: {
        level: "Medium-fine",
        grinder: {
          model: "Timemore C2",
          setting: "13"
        }
      },
      water: {
        amount: 160,
        temperature: 89,
        unit: "g"
      },
      equipment: [
        {
          id: 1,
          name: "AeroPress",
          image: "/detail/imgs/aeropress_sml.png",
          url: "https://www.apple.com/watch/"
        },
        {
          id: 2,
          name: "Hario V60 Drip Scale",
          image: "/detail/imgs/hario_scale_grinder_sml.png",
          url: "https://www.google.com/search"
        },
        {
          id: 3,
          name: "Hario Buono Gooseneck Kettle",
          image: "/detail/imgs/hario_gooseneck_sml.png",
          url: "https://www.apple.com/"
        },
        {
          id: 4,
          name: "Comandante C40 Grinder",
          image: "/detail/imgs/comandante_c40_sml.png",
          url: "https://www.google.com/"
        }
      ]
    }
  },
  {
    id: 56,
    slug: "tiny-dose-big-flavour-sweet-cup",
    title: "Tiny dose big flavour - Sweet cup",
    intro: "A lower-dose recipe that still tastes full and sweet. A slightly sweeter variation for a rounded cup.",
    isCold: false,
    tags: ["sweet"],
    meta: {
      source: {
        icon: "/recipeIcon/icon_enthusiast.svg",
        name: "From an Enthusiast"
      },
      creator: {
        name: "Ana Costa"
      },
      likes: 200,
      saves: 94,
      comments: 13,
      privateNotes: 0
    },
    content: [
      {
        type: "paragraph",
        text: "Tiny dose big flavour - Sweet cup keeps the same direction as the base recipe, but nudges the brew toward more sweetness."
      },
      {
        type: "heading",
        text: "Brew notes"
      },
      {
        type: "list",
        items: [
          "Use 12g of coffee and 190g of water.",
          "Brew with a paper filter in the standard position.",
          "Adjust grind around fine if the cup tastes unbalanced."
        ]
      }
    ],
    steps: [
      {
        id: 1,
        text: "Prepare the AeroPress in the standard position."
      },
      {
        id: 2,
        text: "Add 12g of coffee ground fine."
      },
      {
        id: 3,
        text: "Pour 190g of water at 93C."
      },
      {
        id: 4,
        text: "Steep until the timer reaches 3:10."
      },
      {
        id: 5,
        text: "Press gently and serve immediately."
      }
    ],
    overview: {
      brew: {
        method: "standard",
        time: 190,
        filter: "paper"
      },
      coffee: {
        amount: 12,
        unit: "g",
        description: "Sweet medium roast"
      },
      grind: {
        level: "Fine",
        grinder: {
          model: "Porlex Mini",
          setting: "7"
        }
      },
      water: {
        amount: 190,
        temperature: 93,
        unit: "g"
      },
      equipment: [
        {
          id: 1,
          name: "AeroPress",
          image: "/detail/imgs/aeropress_sml.png",
          url: "https://www.apple.com/"
        },
        {
          id: 2,
          name: "Comandante C40 Grinder",
          image: "/detail/imgs/comandante_c40_sml.png",
          url: "https://www.google.com/"
        },
        {
          id: 3,
          name: "Hario V60 Drip Scale",
          image: "/detail/imgs/hario_scale_grinder_sml.png",
          url: "https://www.apple.com/mac/"
        }
      ]
    }
  },
  {
    id: 57,
    slug: "two-cup-office-brew-sweet-cup",
    title: "Two cup office brew - Sweet cup",
    intro: "A larger AeroPress brew designed to share. A slightly sweeter variation for a rounded cup.",
    isCold: false,
    tags: ["aeropress-xl", "sweet"],
    meta: {
      source: {
        icon: "/recipeIcon/icon_enthusiast.svg",
        name: "From an Enthusiast"
      },
      creator: {
        name: "Office Brewers"
      },
      likes: 211,
      saves: 99,
      comments: 14,
      privateNotes: 1
    },
    content: [
      {
        type: "paragraph",
        text: "Two cup office brew - Sweet cup keeps the same direction as the base recipe, but nudges the brew toward more sweetness."
      },
      {
        type: "heading",
        text: "Brew notes"
      },
      {
        type: "list",
        items: [
          "Use 25g of coffee and 330g of water.",
          "Brew with a paper filter in the standard position.",
          "Adjust grind around medium-coarse if the cup tastes unbalanced."
        ]
      }
    ],
    steps: [
      {
        id: 1,
        text: "Prepare the AeroPress in the standard position."
      },
      {
        id: 2,
        text: "Add 25g of coffee ground medium-coarse."
      },
      {
        id: 3,
        text: "Pour 330g of water at 91C."
      },
      {
        id: 4,
        text: "Steep until the timer reaches 5:20."
      },
      {
        id: 5,
        text: "Press gently and serve immediately."
      }
    ],
    overview: {
      brew: {
        method: "standard",
        time: 320,
        filter: "paper"
      },
      coffee: {
        amount: 25,
        unit: "g",
        description: "Daily blend"
      },
      grind: {
        level: "Medium-coarse",
        grinder: {
          model: "Ode Gen 2",
          setting: "7"
        }
      },
      water: {
        amount: 330,
        temperature: 91,
        unit: "g"
      },
      equipment: [
        {
          id: 1,
          name: "AeroPress",
          image: "/detail/imgs/aeropress_sml.png",
          url: "https://www.google.com/chrome"
        },
        {
          id: 2,
          name: "Hario Buono Gooseneck Kettle",
          image: "/detail/imgs/hario_gooseneck_sml.png",
          url: "https://www.apple.com/ipad/"
        }
      ]
    }
  },
  {
    id: 58,
    slug: "slow-press-sweetness-sweet-cup",
    title: "Slow press sweetness - Sweet cup",
    intro: "A patient inverted recipe focused on sweetness. A slightly sweeter variation for a rounded cup.",
    isCold: false,
    tags: ["sweet"],
    meta: {
      source: {
        icon: "/recipeIcon/noun_tamper.svg",
        name: "From a Barista"
      },
      creator: {
        name: "Damar Coffee"
      },
      likes: 231,
      saves: 106,
      comments: 16,
      privateNotes: 1
    },
    content: [
      {
        type: "paragraph",
        text: "Slow press sweetness - Sweet cup keeps the same direction as the base recipe, but nudges the brew toward more sweetness."
      },
      {
        type: "heading",
        text: "Brew notes"
      },
      {
        type: "list",
        items: [
          "Use 19g of coffee and 270g of water.",
          "Brew with a paper filter in the inverted position.",
          "Adjust grind around medium if the cup tastes unbalanced."
        ]
      }
    ],
    steps: [
      {
        id: 1,
        text: "Prepare the AeroPress in the inverted position."
      },
      {
        id: 2,
        text: "Add 19g of coffee ground medium."
      },
      {
        id: 3,
        text: "Pour 270g of water at 88C."
      },
      {
        id: 4,
        text: "Steep until the timer reaches 6:50."
      },
      {
        id: 5,
        text: "Press gently and serve immediately."
      }
    ],
    overview: {
      brew: {
        method: "inverted",
        time: 410,
        filter: "paper"
      },
      coffee: {
        amount: 19,
        unit: "g",
        description: "Honey or pulped natural coffee"
      },
      grind: {
        level: "Medium",
        grinder: {
          model: "C40",
          setting: "27"
        }
      },
      water: {
        amount: 270,
        temperature: 88,
        unit: "g"
      },
      equipment: [
        {
          id: 1,
          name: "AeroPress",
          image: "/detail/imgs/aeropress_sml.png",
          url: "https://www.google.com/maps"
        },
        {
          id: 2,
          name: "Porlex Mini Hand Grinder",
          image: "/detail/imgs/porlex_mini_sml.png",
          url: "https://www.apple.com/iphone/"
        },
        {
          id: 3,
          name: "Brewista Artisan Gooseneck Kettle",
          image: "/detail/imgs/brewista_artisan_kettle_sml.png",
          url: "https://www.google.com/"
        }
      ]
    }
  },
  {
    id: 59,
    slug: "experimental-low-temperature-sweet-cup",
    title: "Experimental low temperature - Sweet cup",
    intro: "A low-temperature recipe for delicate acidity and less bitterness. A slightly sweeter variation for a rounded cup.",
    isCold: true,
    tags: ["alcohol", "sweet"],
    meta: {
      source: {
        icon: "/recipeIcon/cat_experimental.svg",
        name: "Experimental"
      },
      creator: {
        name: "Brew Notes Club"
      },
      likes: 193,
      saves: 91,
      comments: 13,
      privateNotes: 0
    },
    content: [
      {
        type: "paragraph",
        text: "Experimental low temperature - Sweet cup keeps the same direction as the base recipe, but nudges the brew toward more sweetness."
      },
      {
        type: "heading",
        text: "Brew notes"
      },
      {
        type: "list",
        items: [
          "Use 18g of coffee and 230g of water.",
          "Brew with a metal filter in the inverted position.",
          "Adjust grind around medium-coarse if the cup tastes unbalanced."
        ]
      }
    ],
    steps: [
      {
        id: 1,
        text: "Prepare the AeroPress in the inverted position."
      },
      {
        id: 2,
        text: "Add 18g of coffee ground medium-coarse."
      },
      {
        id: 3,
        text: "Pour 230g of water at 78C."
      },
      {
        id: 4,
        text: "Steep until the timer reaches 4:20."
      },
      {
        id: 5,
        text: "Press gently and serve immediately."
      }
    ],
    overview: {
      brew: {
        method: "inverted",
        time: 260,
        filter: "metal"
      },
      coffee: {
        amount: 18,
        unit: "g",
        description: "Light roast"
      },
      grind: {
        level: "Medium-coarse",
        grinder: {
          model: "Timemore C2",
          setting: "16"
        }
      },
      water: {
        amount: 230,
        temperature: 78,
        unit: "g"
      },
      equipment: [
        {
          id: 1,
          name: "AeroPress",
          image: "/detail/imgs/aeropress_sml.png",
          url: "https://www.apple.com/watch/"
        },
        {
          id: 2,
          name: "Hario V60 Drip Scale",
          image: "/detail/imgs/hario_scale_grinder_sml.png",
          url: "https://www.google.com/search"
        },
        {
          id: 3,
          name: "Hario Buono Gooseneck Kettle",
          image: "/detail/imgs/hario_gooseneck_sml.png",
          url: "https://www.apple.com/"
        },
        {
          id: 4,
          name: "Comandante C40 Grinder",
          image: "/detail/imgs/comandante_c40_sml.png",
          url: "https://www.google.com/"
        }
      ]
    }
  },
];
