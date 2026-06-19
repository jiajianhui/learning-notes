// 作者身份：列表卡片里展示的来源文案，只能从这 3 个字符串里选。
export type CreatorRole =
  | "From a Barista"
  | "From an Enthusiast"
  | "Championship";

// 配方分类：代码内部用的小写分类值，适合拿来做筛选、样式判断和路由参数。
export type RecipeCategory =
  | "barista"
  | "enthusiast"
  | "championship"
  | "experimental";

// 冲煮方式：standard 是正放，inverted 是倒置。
export type BrewMethod = "standard" | "inverted";

// 滤网类型：纸滤或金属滤。
export type FilterType = "paper" | "metal";

// 冲煮速度：用于筛选，也可以决定卡片上的时间标签。
export type BrewSpeed = "fast" | "medium" | "slow";

// 难度：fussy 表示步骤更讲究、更麻烦一点。
export type Difficulty = "easy" | "medium" | "fussy";

export type CollectionCard = {
  id: string;
  title: string;
  description: string;
  image: string;
  imageSize: string;
  imagePosition: string;
  filter: Partial<{
    category: RecipeCategory;
    brewMethod: BrewMethod;
    filterType: FilterType;
    speed: BrewSpeed;
    tags: string[];
  }>;
};

export type RecipeStep = {
  id: number;
  title: string;
  body: string;
  durationSeconds?: number;
};

export type Recipe = {
  id: string;
  slug: string;
  title: string;
  creatorName: string;
  creatorRole: CreatorRole;
  category: RecipeCategory;
  categoryIcon: string;
  likes: number;
  comments: number;
  saves: number;
  summary: string;
  description: string;
  brewMethod: BrewMethod;
  filterType: FilterType;
  speed: BrewSpeed;
  difficulty: Difficulty;
  brewTimeSeconds: number;
  coffeeGrams: number;
  waterMl: number;
  waterTempC: number;
  grind: string;
  roast: string;
  equipment: string[];
  tags: string[];
  flavorNotes: string[];
  steps: RecipeStep[];
  detailNotes: string[];
  relatedSlugs: string[];
};

const asset = (path: string) => `./reference-assets/${path}`;

export const collectionCards: CollectionCard[] = [
  {
    id: "latest",
    title: "Explore the latest",
    description:
      "Fresh brews, odd experiments, and simple recipes worth trying this week.",
    image: asset("illustrations/explore_the_latest.svg"),
    imageSize: "110px",
    imagePosition: "right 40px center",
    filter: {},
  },
  {
    id: "championship",
    title: "Championship Recipes",
    description:
      "Brew like the best with clear, measured recipes inspired by competition cups.",
    image: asset("illustrations/WAC.svg"),
    imageSize: "140px",
    imagePosition: "right 40px center",
    filter: { category: "championship" },
  },
  {
    id: "share",
    title: "Share with a friend",
    description:
      "Bigger recipes for two cups, lazy weekend tables, or one generous mug.",
    image: asset("illustrations/friends.svg"),
    imageSize: "230px",
    imagePosition: "right -30px center",
    filter: { tags: ["two cups"] },
  },
  {
    id: "low-beans",
    title: "Low on beans",
    description:
      "Small-dose recipes that still feel sweet, round, and properly brewed.",
    image: asset("illustrations/lowOnBeans.svg"),
    imageSize: "80px",
    imagePosition: "right 60px center",
    filter: { tags: ["low dose"] },
  },
  {
    id: "fast",
    title: "Fast & furious",
    description:
      "Recipes under 90 seconds for busy mornings and impatient hands.",
    image: asset("illustrations/fast.svg"),
    imageSize: "75px",
    imagePosition: "right 50px center",
    filter: { speed: "fast" },
  },
  {
    id: "espresso",
    title: "AeroPress espresso",
    description:
      "Short, strong cups that get close to espresso without pretending too hard.",
    image: asset("illustrations/espressoul.svg"),
    imageSize: "140px",
    imagePosition: "right 20px center",
    filter: { tags: ["espresso style"] },
  },
  {
    id: "milk",
    title: "A dash of milk",
    description:
      "Concentrated brews built to stay tasty after milk joins the party.",
    image: asset("illustrations/a_dash_of_milk.svg"),
    imageSize: "140px",
    imagePosition: "right 40px center",
    filter: { tags: ["milk"] },
  },
];

export const recipes: Recipe[] = [
  {
    id: "r-001",
    slug: "quiet-morning-classic",
    title: "Quiet Morning Classic",
    creatorName: "Mira Chen",
    creatorRole: "From a Barista",
    category: "barista",
    categoryIcon: asset("icons/noun_tamper.svg"),
    likes: 1115,
    comments: 84,
    saves: 438,
    summary: "A clean, balanced cup with a soft finish and very little fuss.",
    description:
      "This is the dependable daily recipe: medium-fine grind, gentle agitation, and a short bypass to open the cup. It is designed for light to medium roasts that taste good when clarity matters more than body.",
    brewMethod: "standard",
    filterType: "paper",
    speed: "medium",
    difficulty: "easy",
    brewTimeSeconds: 150,
    coffeeGrams: 13,
    waterMl: 210,
    waterTempC: 92,
    grind: "Medium-fine, slightly coarser than V60",
    roast: "Light or medium roast",
    equipment: ["AeroPress", "Paper filter", "Kettle", "Scale", "Timer"],
    tags: ["daily", "balanced", "paper"],
    flavorNotes: ["citrus", "brown sugar", "tea-like"],
    steps: [
      {
        id: 1,
        title: "Prep",
        body: "Rinse one paper filter and add 13g coffee to the chamber.",
      },
      {
        id: 2,
        title: "Bloom",
        body: "Pour 40g water and swirl gently to wet all grounds.",
        durationSeconds: 30,
      },
      {
        id: 3,
        title: "Fill",
        body: "Pour to 200g total, attach the plunger, and let it steep.",
        durationSeconds: 75,
      },
      {
        id: 4,
        title: "Press",
        body: "Press slowly until you hear a soft hiss.",
        durationSeconds: 30,
      },
      {
        id: 5,
        title: "Bypass",
        body: "Add 10g hot water if the cup feels too concentrated.",
      },
    ],
    detailNotes: [
      "Use a slower press for more sweetness.",
      "Skip the bypass for a stronger cup.",
    ],
    relatedSlugs: [
      "tiny-dose-happy-cup",
      "filter-like-office-brew",
      "sweet-spot-bypass",
    ],
  },
  {
    id: "r-002",
    slug: "tiny-dose-happy-cup",
    title: "Tiny Dose Happy Cup",
    creatorName: "Jon Park",
    creatorRole: "From an Enthusiast",
    category: "enthusiast",
    categoryIcon: asset("icons/icon_enthusiast.svg"),
    likes: 851,
    comments: 137,
    saves: 312,
    summary: "Quick, simple, and surprisingly sweet with only 12g of coffee.",
    description:
      "A low-dose recipe for the moment when the bag is almost empty. The trick is a finer grind, a patient steep, and a small bypass after pressing.",
    brewMethod: "inverted",
    filterType: "paper",
    speed: "medium",
    difficulty: "easy",
    brewTimeSeconds: 135,
    coffeeGrams: 12,
    waterMl: 190,
    waterTempC: 90,
    grind: "Fine-medium",
    roast: "Medium roast",
    equipment: ["AeroPress", "Paper filter", "Scale", "Timer"],
    tags: ["low dose", "sweet", "budget"],
    flavorNotes: ["caramel", "apple", "soft acidity"],
    steps: [
      {
        id: 1,
        title: "Invert",
        body: "Set the AeroPress inverted and add coffee.",
      },
      {
        id: 2,
        title: "Saturate",
        body: "Pour 70g water quickly and stir three times.",
        durationSeconds: 20,
      },
      {
        id: 3,
        title: "Steep",
        body: "Pour to 160g total and wait.",
        durationSeconds: 80,
      },
      {
        id: 4,
        title: "Flip",
        body: "Cap, flip carefully, and press.",
        durationSeconds: 25,
      },
      { id: 5, title: "Open up", body: "Add 30g water to taste." },
    ],
    detailNotes: [
      "Great for practicing balance because small changes show up clearly.",
    ],
    relatedSlugs: [
      "quiet-morning-classic",
      "low-bean-bright-cup",
      "soft-sweet-no-rush",
    ],
  },
  {
    id: "r-003",
    slug: "milk-friendly-comfort",
    title: "Milk Friendly Comfort",
    creatorName: "Nora Bell",
    creatorRole: "From a Barista",
    category: "barista",
    categoryIcon: asset("icons/noun_tamper.svg"),
    likes: 542,
    comments: 45,
    saves: 229,
    summary: "A stronger brew that keeps its shape with warm milk.",
    description:
      "This recipe makes a concentrated cup with enough body for milk drinks. It is not espresso, but it gives you a compact base that feels cozy and rounded.",
    brewMethod: "inverted",
    filterType: "metal",
    speed: "medium",
    difficulty: "medium",
    brewTimeSeconds: 130,
    coffeeGrams: 18,
    waterMl: 120,
    waterTempC: 93,
    grind: "Medium-fine",
    roast: "Medium-dark roast",
    equipment: ["AeroPress", "Metal filter", "Milk pitcher", "Scale", "Timer"],
    tags: ["milk", "concentrate", "metal"],
    flavorNotes: ["chocolate", "hazelnut", "cream"],
    steps: [
      {
        id: 1,
        title: "Dose",
        body: "Add 18g coffee to an inverted AeroPress.",
      },
      {
        id: 2,
        title: "Pour",
        body: "Pour 90g water and stir firmly.",
        durationSeconds: 20,
      },
      {
        id: 3,
        title: "Steep",
        body: "Let the slurry sit before capping.",
        durationSeconds: 70,
      },
      {
        id: 4,
        title: "Press",
        body: "Press into a small cup.",
        durationSeconds: 25,
      },
      {
        id: 5,
        title: "Finish",
        body: "Add 100-140g warm milk depending on taste.",
      },
    ],
    detailNotes: [
      "A metal filter adds body.",
      "Use less milk if your coffee is light-roasted.",
    ],
    relatedSlugs: [
      "short-strong-not-espresso",
      "iced-latte-late-afternoon",
      "cocoa-milk-cup",
    ],
  },
  {
    id: "r-004",
    slug: "acid-pop-champion",
    title: "Acid Pop Champion",
    creatorName: "Leo Santos",
    creatorRole: "Championship",
    category: "championship",
    categoryIcon: asset("icons/cat_crown.svg"),
    likes: 465,
    comments: 53,
    saves: 201,
    summary:
      "Bright, juicy, and intentionally theatrical in a competition sort of way.",
    description:
      "A competition-inspired recipe that uses a lower temperature bloom and a high-temperature finish. It asks for attention, but the cup rewards you with vivid acidity.",
    brewMethod: "standard",
    filterType: "paper",
    speed: "medium",
    difficulty: "fussy",
    brewTimeSeconds: 180,
    coffeeGrams: 16,
    waterMl: 230,
    waterTempC: 88,
    grind: "Medium",
    roast: "Light roast",
    equipment: [
      "AeroPress",
      "Paper filter",
      "Gooseneck kettle",
      "Scale",
      "Timer",
    ],
    tags: ["championship", "bright", "competition"],
    flavorNotes: ["stone fruit", "lime", "honey"],
    steps: [
      {
        id: 1,
        title: "Cool bloom",
        body: "Pour 50g water at 84C and swirl.",
        durationSeconds: 35,
      },
      {
        id: 2,
        title: "Hot fill",
        body: "Pour to 180g using 92C water.",
        durationSeconds: 20,
      },
      {
        id: 3,
        title: "Wait",
        body: "Attach plunger and steep.",
        durationSeconds: 85,
      },
      {
        id: 4,
        title: "Press",
        body: "Press gently and stop before the hiss.",
        durationSeconds: 30,
      },
      { id: 5, title: "Bypass", body: "Add 50g water and stir once." },
    ],
    detailNotes: [
      "Use a light, fruity coffee.",
      "The split-temperature trick is the main point.",
    ],
    relatedSlugs: [
      "competition-style-big-sweetness",
      "quiet-morning-classic",
      "sweet-spot-bypass",
    ],
  },
  {
    id: "r-005",
    slug: "filter-like-office-brew",
    title: "Filter-like Office Brew",
    creatorName: "Timo Lane",
    creatorRole: "From a Barista",
    category: "barista",
    categoryIcon: asset("icons/noun_tamper.svg"),
    likes: 386,
    comments: 32,
    saves: 188,
    summary: "A gentle office-friendly recipe that tastes closer to pour-over.",
    description:
      "Built for a desk, a kettle, and not much else. This produces a light-bodied AeroPress cup with low bitterness and tidy sweetness.",
    brewMethod: "standard",
    filterType: "paper",
    speed: "medium",
    difficulty: "easy",
    brewTimeSeconds: 165,
    coffeeGrams: 14,
    waterMl: 220,
    waterTempC: 91,
    grind: "Medium, like table salt",
    roast: "Light roast",
    equipment: ["AeroPress", "Paper filter", "Kettle", "Mug"],
    tags: ["office", "clean", "paper"],
    flavorNotes: ["floral", "pear", "light caramel"],
    steps: [
      { id: 1, title: "Set up", body: "Add coffee and level the bed." },
      {
        id: 2,
        title: "Pour",
        body: "Pour 220g water in a steady stream.",
        durationSeconds: 30,
      },
      {
        id: 3,
        title: "Wait",
        body: "Put the plunger on top and wait.",
        durationSeconds: 100,
      },
      {
        id: 4,
        title: "Press",
        body: "Press slowly into a mug.",
        durationSeconds: 30,
      },
    ],
    detailNotes: [
      "No stir needed unless the bed looks dry.",
      "Works well with cafeteria kettles.",
    ],
    relatedSlugs: [
      "quiet-morning-classic",
      "soft-sweet-no-rush",
      "tiny-dose-happy-cup",
    ],
  },
  {
    id: "r-006",
    slug: "smooth-little-ritual",
    title: "Smooth Little Ritual",
    creatorName: "Ada Green",
    creatorRole: "From a Barista",
    category: "barista",
    categoryIcon: asset("icons/noun_tamper.svg"),
    likes: 290,
    comments: 28,
    saves: 146,
    summary: "Sweet and balanced with a slightly heavier mouthfeel.",
    description:
      "A calm, repeatable recipe with a longer steep and minimal agitation. It is especially good when a coffee tastes sharp in quicker recipes.",
    brewMethod: "inverted",
    filterType: "paper",
    speed: "slow",
    difficulty: "easy",
    brewTimeSeconds: 270,
    coffeeGrams: 15,
    waterMl: 220,
    waterTempC: 89,
    grind: "Medium-fine",
    roast: "Medium roast",
    equipment: ["AeroPress", "Paper filter", "Scale", "Timer"],
    tags: ["slow", "smooth", "sweet"],
    flavorNotes: ["molasses", "orange", "almond"],
    steps: [
      {
        id: 1,
        title: "Invert",
        body: "Add 15g coffee to the inverted brewer.",
      },
      {
        id: 2,
        title: "Pour",
        body: "Pour 180g water and stir twice.",
        durationSeconds: 20,
      },
      { id: 3, title: "Steep", body: "Wait patiently.", durationSeconds: 210 },
      {
        id: 4,
        title: "Press",
        body: "Flip and press slowly.",
        durationSeconds: 30,
      },
      { id: 5, title: "Adjust", body: "Add up to 40g water if needed." },
    ],
    detailNotes: [
      "Long steeping smooths out sharp coffees.",
      "Keep agitation low.",
    ],
    relatedSlugs: [
      "soft-sweet-no-rush",
      "sweet-spot-bypass",
      "quiet-morning-classic",
    ],
  },
  {
    id: "r-007",
    slug: "iced-latte-late-afternoon",
    title: "Iced Latte, Late Afternoon",
    creatorName: "Rae Miller",
    creatorRole: "From an Enthusiast",
    category: "enthusiast",
    categoryIcon: asset("icons/icon_enthusiast.svg"),
    likes: 260,
    comments: 31,
    saves: 172,
    summary: "Dark chocolate, cold milk, and a gentle caffeine lift.",
    description:
      "A sturdy iced milk recipe for warm afternoons. Brew short, press over ice, then add milk. The result is not watery and still tastes like coffee.",
    brewMethod: "inverted",
    filterType: "paper",
    speed: "medium",
    difficulty: "medium",
    brewTimeSeconds: 140,
    coffeeGrams: 18,
    waterMl: 70,
    waterTempC: 92,
    grind: "Fine-medium",
    roast: "Medium-dark roast",
    equipment: ["AeroPress", "Paper filter", "Ice", "Milk", "Scale"],
    tags: ["cold", "milk", "has video"],
    flavorNotes: ["dark chocolate", "vanilla", "cold cream"],
    steps: [
      {
        id: 1,
        title: "Prepare",
        body: "Add ice and 130g cold milk to a glass.",
      },
      {
        id: 2,
        title: "Brew",
        body: "Pour 70g water over 18g coffee and stir.",
        durationSeconds: 40,
      },
      {
        id: 3,
        title: "Steep",
        body: "Cap the brewer and wait.",
        durationSeconds: 70,
      },
      {
        id: 4,
        title: "Press",
        body: "Press over the milk and ice.",
        durationSeconds: 25,
      },
      { id: 5, title: "Mix", body: "Stir until chilled and glossy." },
    ],
    detailNotes: [
      "Use less ice if your milk is already very cold.",
      "A chocolatey coffee is ideal.",
    ],
    relatedSlugs: [
      "milk-friendly-comfort",
      "cocoa-milk-cup",
      "short-strong-not-espresso",
    ],
  },
  {
    id: "r-008",
    slug: "one-recipe-forever",
    title: "The One Recipe Forever",
    creatorName: "Casey Wood",
    creatorRole: "From a Barista",
    category: "barista",
    categoryIcon: asset("icons/noun_tamper.svg"),
    likes: 239,
    comments: 19,
    saves: 141,
    summary: "A flexible baseline recipe that works with almost anything.",
    description:
      "When you do not know a coffee yet, start here. This is a neutral baseline for dialing in grind, temperature, and bypass without changing everything at once.",
    brewMethod: "standard",
    filterType: "paper",
    speed: "medium",
    difficulty: "easy",
    brewTimeSeconds: 150,
    coffeeGrams: 15,
    waterMl: 225,
    waterTempC: 90,
    grind: "Medium",
    roast: "Any roast",
    equipment: ["AeroPress", "Paper filter", "Scale", "Timer"],
    tags: ["baseline", "daily", "beginner"],
    flavorNotes: ["balanced", "clean", "mild sweetness"],
    steps: [
      {
        id: 1,
        title: "Add coffee",
        body: "Use 15g coffee and one rinsed paper filter.",
      },
      {
        id: 2,
        title: "Pour",
        body: "Pour to 225g total and stir once.",
        durationSeconds: 35,
      },
      {
        id: 3,
        title: "Steep",
        body: "Let it sit with the plunger attached.",
        durationSeconds: 80,
      },
      { id: 4, title: "Press", body: "Press gently.", durationSeconds: 30 },
    ],
    detailNotes: [
      "If bitter, grind coarser.",
      "If thin, grind finer or reduce bypass.",
    ],
    relatedSlugs: [
      "quiet-morning-classic",
      "filter-like-office-brew",
      "sweet-spot-bypass",
    ],
  },
  {
    id: "r-009",
    slug: "two-cups-one-press",
    title: "Two Cups, One Press",
    creatorName: "Elena Moore",
    creatorRole: "From an Enthusiast",
    category: "enthusiast",
    categoryIcon: asset("icons/icon_enthusiast.svg"),
    likes: 173,
    comments: 22,
    saves: 110,
    summary: "A larger brew designed to split into two small cups.",
    description:
      "This recipe makes a concentrate and then dilutes it into two cups. It is useful when a friend is over and you only want to clean one brewer.",
    brewMethod: "inverted",
    filterType: "paper",
    speed: "medium",
    difficulty: "medium",
    brewTimeSeconds: 180,
    coffeeGrams: 24,
    waterMl: 360,
    waterTempC: 91,
    grind: "Medium-coarse",
    roast: "Medium roast",
    equipment: ["AeroPress", "Paper filter", "Server", "Two cups", "Scale"],
    tags: ["two cups", "share", "concentrate"],
    flavorNotes: ["toffee", "red apple", "round body"],
    steps: [
      {
        id: 1,
        title: "Invert",
        body: "Add 24g coffee to the inverted AeroPress.",
      },
      {
        id: 2,
        title: "Brew",
        body: "Pour 200g water and stir thoroughly.",
        durationSeconds: 35,
      },
      {
        id: 3,
        title: "Steep",
        body: "Wait with the cap on.",
        durationSeconds: 95,
      },
      {
        id: 4,
        title: "Press",
        body: "Press into a server.",
        durationSeconds: 35,
      },
      {
        id: 5,
        title: "Split",
        body: "Add 80g hot water to each cup, then divide the concentrate.",
      },
    ],
    detailNotes: [
      "Do not overfill the AeroPress.",
      "A server makes splitting much easier.",
    ],
    relatedSlugs: [
      "share-table-brew",
      "one-recipe-forever",
      "soft-sweet-no-rush",
    ],
  },
  {
    id: "r-010",
    slug: "v60-ish-light-roast",
    title: "V60-ish Light Roast",
    creatorName: "Sam Ito",
    creatorRole: "From an Enthusiast",
    category: "enthusiast",
    categoryIcon: asset("icons/icon_enthusiast.svg"),
    likes: 151,
    comments: 16,
    saves: 93,
    summary: "A bright paper-filter cup for people who miss pour-over.",
    description:
      "This recipe chases clarity. It uses more water in the chamber, a coarser grind, and a very gentle press to keep the cup transparent.",
    brewMethod: "standard",
    filterType: "paper",
    speed: "medium",
    difficulty: "medium",
    brewTimeSeconds: 170,
    coffeeGrams: 14,
    waterMl: 240,
    waterTempC: 94,
    grind: "Medium-coarse",
    roast: "Light roast",
    equipment: ["AeroPress", "Paper filter", "Gooseneck kettle", "Scale"],
    tags: ["clean", "light roast", "paper"],
    flavorNotes: ["jasmine", "lemon", "white peach"],
    steps: [
      {
        id: 1,
        title: "Rinse",
        body: "Rinse the filter well and preheat the brewer.",
      },
      {
        id: 2,
        title: "Pour",
        body: "Pour 240g water in two gentle circles.",
        durationSeconds: 35,
      },
      {
        id: 3,
        title: "Steep",
        body: "Let the coffee extract without stirring.",
        durationSeconds: 95,
      },
      {
        id: 4,
        title: "Press",
        body: "Press very slowly and stop before the hiss.",
        durationSeconds: 35,
      },
    ],
    detailNotes: [
      "Best with fragrant coffees.",
      "If sour, grind a touch finer.",
    ],
    relatedSlugs: [
      "filter-like-office-brew",
      "acid-pop-champion",
      "quiet-morning-classic",
    ],
  },
  {
    id: "r-011",
    slug: "short-strong-not-espresso",
    title: "Short Strong Not-Espresso",
    creatorName: "Ben Harper",
    creatorRole: "From a Barista",
    category: "barista",
    categoryIcon: asset("icons/noun_tamper.svg"),
    likes: 131,
    comments: 11,
    saves: 77,
    summary: "A tiny, intense cup for espresso-style drinks.",
    description:
      "A short and punchy AeroPress concentrate. Use it straight if you like intensity, or turn it into a tiny milk drink.",
    brewMethod: "inverted",
    filterType: "metal",
    speed: "fast",
    difficulty: "medium",
    brewTimeSeconds: 85,
    coffeeGrams: 20,
    waterMl: 80,
    waterTempC: 94,
    grind: "Fine, but not espresso fine",
    roast: "Medium-dark roast",
    equipment: ["AeroPress", "Metal filter", "Scale", "Timer"],
    tags: ["espresso style", "fast", "concentrate"],
    flavorNotes: ["cocoa", "walnut", "heavy body"],
    steps: [
      { id: 1, title: "Dose", body: "Add 20g coffee to the inverted brewer." },
      {
        id: 2,
        title: "Pour",
        body: "Pour 80g water and stir hard.",
        durationSeconds: 15,
      },
      { id: 3, title: "Steep", body: "Wait briefly.", durationSeconds: 35 },
      {
        id: 4,
        title: "Press",
        body: "Press firmly into a small cup.",
        durationSeconds: 25,
      },
    ],
    detailNotes: [
      "A metal filter keeps the body heavy.",
      "Do not grind too fine or pressing gets rough.",
    ],
    relatedSlugs: [
      "milk-friendly-comfort",
      "cocoa-milk-cup",
      "iced-latte-late-afternoon",
    ],
  },
  {
    id: "r-012",
    slug: "sweet-spot-bypass",
    title: "Sweet Spot Bypass",
    creatorName: "Owen Liu",
    creatorRole: "From a Barista",
    category: "barista",
    categoryIcon: asset("icons/noun_tamper.svg"),
    likes: 125,
    comments: 14,
    saves: 82,
    summary: "Slow press for sweetness, bypass for brightness.",
    description:
      "This is a nice recipe for learning what bypass water does. Brew a concentrated base, taste it, then open it up with hot water.",
    brewMethod: "standard",
    filterType: "paper",
    speed: "medium",
    difficulty: "easy",
    brewTimeSeconds: 160,
    coffeeGrams: 16,
    waterMl: 240,
    waterTempC: 90,
    grind: "Medium-fine",
    roast: "Light or medium roast",
    equipment: [
      "AeroPress",
      "Paper filter",
      "Scale",
      "Timer",
      "Extra hot water",
    ],
    tags: ["bypass", "sweet", "learning"],
    flavorNotes: ["honey", "orange peel", "soft finish"],
    steps: [
      {
        id: 1,
        title: "Brew base",
        body: "Add coffee and pour 180g water.",
        durationSeconds: 30,
      },
      {
        id: 2,
        title: "Steep",
        body: "Attach plunger and wait.",
        durationSeconds: 80,
      },
      {
        id: 3,
        title: "Press",
        body: "Press slowly for sweetness.",
        durationSeconds: 35,
      },
      { id: 4, title: "Bypass", body: "Add 40-60g water and taste as you go." },
    ],
    detailNotes: [
      "Taste before bypassing so you learn the difference.",
      "Use less bypass for darker roasts.",
    ],
    relatedSlugs: [
      "quiet-morning-classic",
      "one-recipe-forever",
      "acid-pop-champion",
    ],
  },
  {
    id: "r-013",
    slug: "low-effort-big-reward",
    title: "Low Effort, Big Reward",
    creatorName: "Iris Wong",
    creatorRole: "From an Enthusiast",
    category: "enthusiast",
    categoryIcon: asset("icons/icon_enthusiast.svg"),
    likes: 96,
    comments: 9,
    saves: 63,
    summary: "Throw the plunger on top and let time do the hard work.",
    description:
      "A long, low-intervention recipe. It is good for mornings when you want coffee while answering messages, and you do not mind waiting a few minutes.",
    brewMethod: "standard",
    filterType: "paper",
    speed: "slow",
    difficulty: "easy",
    brewTimeSeconds: 420,
    coffeeGrams: 15,
    waterMl: 230,
    waterTempC: 88,
    grind: "Medium-coarse",
    roast: "Medium roast",
    equipment: ["AeroPress", "Paper filter", "Timer"],
    tags: ["slow", "low effort", "gentle"],
    flavorNotes: ["brown sugar", "dried fruit", "soft body"],
    steps: [
      {
        id: 1,
        title: "Add everything",
        body: "Add coffee and pour 230g water.",
      },
      {
        id: 2,
        title: "Seal",
        body: "Place the plunger on top to stop dripping.",
        durationSeconds: 10,
      },
      {
        id: 3,
        title: "Wait",
        body: "Let the coffee sit.",
        durationSeconds: 360,
      },
      {
        id: 4,
        title: "Press",
        body: "Press slowly and stop at the hiss.",
        durationSeconds: 35,
      },
    ],
    detailNotes: [
      "This forgives uneven pouring.",
      "Use a coarser grind so the long steep stays clean.",
    ],
    relatedSlugs: [
      "smooth-little-ritual",
      "soft-sweet-no-rush",
      "filter-like-office-brew",
    ],
  },
  {
    id: "r-014",
    slug: "aeropress-go-travel-cup",
    title: "AeroPress Go Travel Cup",
    creatorName: "Max River",
    creatorRole: "From an Enthusiast",
    category: "enthusiast",
    categoryIcon: asset("icons/aeropressGo.svg"),
    likes: 83,
    comments: 7,
    saves: 55,
    summary:
      "A compact recipe for tiny counters, hotel kettles, and travel mugs.",
    description:
      "A travel-first recipe using fewer tools and a lower water volume. It keeps the workflow simple when your setup is less than ideal.",
    brewMethod: "standard",
    filterType: "paper",
    speed: "fast",
    difficulty: "easy",
    brewTimeSeconds: 90,
    coffeeGrams: 14,
    waterMl: 190,
    waterTempC: 90,
    grind: "Medium-fine",
    roast: "Medium roast",
    equipment: ["AeroPress Go", "Paper filter", "Travel mug"],
    tags: ["aeropress go", "travel", "fast"],
    flavorNotes: ["nutty", "simple", "warm finish"],
    steps: [
      { id: 1, title: "Set up", body: "Add coffee and one rinsed filter." },
      {
        id: 2,
        title: "Pour",
        body: "Pour to 170g and stir twice.",
        durationSeconds: 25,
      },
      {
        id: 3,
        title: "Wait",
        body: "Let it steep briefly.",
        durationSeconds: 35,
      },
      {
        id: 4,
        title: "Press",
        body: "Press into your travel mug.",
        durationSeconds: 25,
      },
      {
        id: 5,
        title: "Adjust",
        body: "Add 20g water if it tastes too strong.",
      },
    ],
    detailNotes: [
      "Good when you cannot control the kettle well.",
      "Use the mug as your server.",
    ],
    relatedSlugs: [
      "tiny-dose-happy-cup",
      "short-strong-not-espresso",
      "one-recipe-forever",
    ],
  },
  {
    id: "r-015",
    slug: "cocoa-milk-cup",
    title: "Cocoa Milk Cup",
    creatorName: "June Patel",
    creatorRole: "From an Enthusiast",
    category: "enthusiast",
    categoryIcon: asset("icons/icon_enthusiast.svg"),
    likes: 79,
    comments: 6,
    saves: 41,
    summary: "A mellow milk coffee with cocoa notes and low bitterness.",
    description:
      "This is a softer cousin of the short strong recipe. It uses a little more water in the brew so the final drink feels round instead of punchy.",
    brewMethod: "inverted",
    filterType: "paper",
    speed: "medium",
    difficulty: "easy",
    brewTimeSeconds: 120,
    coffeeGrams: 17,
    waterMl: 110,
    waterTempC: 91,
    grind: "Medium-fine",
    roast: "Medium-dark roast",
    equipment: ["AeroPress", "Paper filter", "Milk", "Scale"],
    tags: ["milk", "soft", "cocoa"],
    flavorNotes: ["milk chocolate", "biscuit", "soft cream"],
    steps: [
      {
        id: 1,
        title: "Invert",
        body: "Add 17g coffee to the inverted brewer.",
      },
      {
        id: 2,
        title: "Pour",
        body: "Pour 110g water and stir gently.",
        durationSeconds: 25,
      },
      {
        id: 3,
        title: "Steep",
        body: "Wait before flipping.",
        durationSeconds: 65,
      },
      { id: 4, title: "Press", body: "Press into a cup.", durationSeconds: 25 },
      { id: 5, title: "Milk", body: "Add 90-120g warm milk." },
    ],
    detailNotes: [
      "Paper filter keeps the milk drink cleaner.",
      "Try oat milk for more sweetness.",
    ],
    relatedSlugs: [
      "milk-friendly-comfort",
      "iced-latte-late-afternoon",
      "short-strong-not-espresso",
    ],
  },
  {
    id: "r-016",
    slug: "soft-sweet-no-rush",
    title: "Soft Sweet No Rush",
    creatorName: "Amelia Fox",
    creatorRole: "Championship",
    category: "championship",
    categoryIcon: asset("icons/cat_crown.svg"),
    likes: 72,
    comments: 8,
    saves: 47,
    summary: "A polished slow recipe with a silky texture and quiet acidity.",
    description:
      "A slower championship-style recipe that cares more about sweetness than drama. It is a good detail page demo because the process has distinct phases.",
    brewMethod: "inverted",
    filterType: "paper",
    speed: "slow",
    difficulty: "fussy",
    brewTimeSeconds: 300,
    coffeeGrams: 18,
    waterMl: 260,
    waterTempC: 86,
    grind: "Medium",
    roast: "Light roast",
    equipment: [
      "AeroPress",
      "Paper filter",
      "Gooseneck kettle",
      "Scale",
      "Timer",
    ],
    tags: ["championship", "slow", "sweet"],
    flavorNotes: ["apricot", "honey", "silky"],
    steps: [
      {
        id: 1,
        title: "Bloom",
        body: "Pour 60g water and swirl slowly.",
        durationSeconds: 45,
      },
      {
        id: 2,
        title: "Fill",
        body: "Pour to 200g total and stir once.",
        durationSeconds: 25,
      },
      {
        id: 3,
        title: "Long steep",
        body: "Cap and wait.",
        durationSeconds: 180,
      },
      {
        id: 4,
        title: "Press",
        body: "Flip and press with very light pressure.",
        durationSeconds: 35,
      },
      {
        id: 5,
        title: "Bypass",
        body: "Add 60g water and rest for one minute.",
      },
    ],
    detailNotes: [
      "Lower temperature protects delicate acidity.",
      "Resting the final cup makes it sweeter.",
    ],
    relatedSlugs: [
      "acid-pop-champion",
      "smooth-little-ritual",
      "low-effort-big-reward",
    ],
  },
];

export const featuredRecipes = recipes.slice(0, 3);

export const getRecipeBySlug = (slug: string) =>
  recipes.find((recipe) => recipe.slug === slug);

export const recipeFilters = {
  categories: [
    "barista",
    "enthusiast",
    "championship",
    "experimental",
  ] satisfies RecipeCategory[],
  brewMethods: ["standard", "inverted"] satisfies BrewMethod[],
  filterTypes: ["paper", "metal"] satisfies FilterType[],
  speeds: ["fast", "medium", "slow"] satisfies BrewSpeed[],
  tags: Array.from(new Set(recipes.flatMap((recipe) => recipe.tags))).sort(),
};
