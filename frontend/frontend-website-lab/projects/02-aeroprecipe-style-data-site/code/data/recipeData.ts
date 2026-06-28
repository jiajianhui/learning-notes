import type { Recipe } from "@/data/types/recipe/recipe";

export const recipeData: Recipe[] = [
  {
    id: 0,
    slug: "james-hoffmanns-ultimate-aeropress-recipe",
    title: "James Hoffmann's Ultimate AeroPress Recipe",
    intro: "James Hoffmann's Ultimate AeroPress Recipe",
    isCold: false,
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
        filter: "Paper filter",
      },
      coffee: {
        amount: 11,
        unit: "g",
        description: "Light roast",
      },
      grind: {
        level: "Finer end of medium",
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
          url: "https://aeropress.com/",
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
        filter: "Paper filter",
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
          url: "https://aeropress.com/",
        },
        {
          id: 2,
          name: "Hario Buono Gooseneck Kettle",
        },
        {
          id: 3,
          name: "Hario V60 Drip Scale",
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
        filter: "Paper filter",
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
          url: "https://aeropress.com/",
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
        filter: "Two paper filters",
      },
      coffee: {
        amount: 20,
        unit: "g",
        description: "A vibrant, light-roasted coffee",
      },
      grind: {
        level: "Medium",
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
          url: "https://aeropress.com/",
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
        filter: "Paper filter",
      },
      coffee: {
        amount: 14,
        unit: "g",
        description: "A light-roasted coffee of your choice",
      },
      grind: {
        level: "Medium",
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
          url: "https://aeropress.com/",
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
        filter: "Two paper filters",
      },
      coffee: {
        amount: 14,
        unit: "g",
        description: "East African coffee from Ethiopia or Kenya",
      },
      grind: {
        level: "Medium-fine",
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
          url: "https://aeropress.com/",
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
        filter: "Paper filter",
      },
      coffee: {
        amount: 18,
        unit: "g",
        description: "Monsooned Malabar",
      },
      grind: {
        level: "Medium-fine",
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
          url: "https://aeropress.com/",
        },
        {
          id: 2,
          name: "Porlex Mini Hand Grinder",
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
        filter: "Two paper filters",
      },
      coffee: {
        amount: 15,
        unit: "g",
        description: "Any coffee you prefer",
      },
      grind: {
        level: "Medium",
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
          url: "https://aeropress.com/",
        },
        {
          id: 2,
          name: "Hario V60 Drip Scale",
        },
        {
          id: 3,
          name: "Comandante C40 Grinder",
        },
        {
          id: 4,
          name: "Brewista Artisan Gooseneck Kettle",
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
        filter: "Paper filter",
      },
      coffee: {
        amount: 30,
        unit: "g",
        description: "Any coffee, preferably a light roast",
      },
      grind: {
        level: "Medium-fine",
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
          url: "https://aeropress.com/",
        },
        {
          id: 2,
          name: "Hario V60 Drip Scale",
        },
        {
          id: 3,
          name: "Hario Buono Gooseneck Kettle",
        },
        {
          id: 4,
          name: "Porlex Mini Hand Grinder",
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
        filter: "Two paper filters",
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
          url: "https://aeropress.com/",
        },
        {
          id: 2,
          name: "Aesir Filter",
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
        filter: "Paper filter",
      },
      coffee: {
        amount: 20,
        unit: "g",
        description: "Medium to dark roast",
      },
      grind: {
        level: "Fine, similar to sand",
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
          url: "https://aeropress.com/",
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
        filter: "Two paper filters",
      },
      coffee: {
        amount: 24,
        unit: "g",
        description: "Coffee with prominent sweet flavour notes",
      },
      grind: {
        level: "Medium",
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
          url: "https://aeropress.com/",
        },
      ],
    },
  },
];
