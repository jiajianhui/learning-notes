export type CollectionCard = {
  id: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  imageWidth: number;
  imageHeight: number;
  imageClassName: string;
};

export const collectionCards: CollectionCard[] = [
  {
    id: "latest",
    title: "Explore the latest",
    description: "Looking for something new? Explore the latest AeroPress recipes and get inspired!",
    image: "/illustrations/explore_the_latest.svg",
    imageAlt: "Explore the latest illustration",
    imageWidth: 110,
    imageHeight: 136,
    imageClassName: "size-28",
  },
  {
    id: "championship",
    title: "Championship Recipes",
    description: "Brew like the best - here's a list of tried and true recipes from AeroPress Champions.",
    image: "/illustrations/WAC.svg",
    imageAlt: "Championship Recipes illustration",
    imageWidth: 140,
    imageHeight: 140,
    imageClassName: "size-32",
  },
  {
    id: "share",
    title: "Share with a friend",
    description: "Coffee with friends - or two for you. Here are recipes to get more coffee from your AeroPress.",
    image: "/illustrations/friends.svg",
    imageAlt: "Share with a friend illustration",
    imageWidth: 230,
    imageHeight: 100,
    imageClassName: "w-56",
  },
  {
    id: "low-on-beans",
    title: "Low on beans",
    description: "Running low on beans? Don't worry! This collection showcases recipes big on flavour & low on bean count.",
    image: "/illustrations/lowOnBeans.svg",
    imageAlt: "Low on beans illustration",
    imageWidth: 80,
    imageHeight: 112,
    imageClassName: "w-20",
  },
  {
    id: "fast",
    title: "Fast & furious",
    description: "In a rush? These recipes under 1:30 will help you get to where you're going, quicker.",
    image: "/illustrations/fast.svg",
    imageAlt: "Fast and furious illustration",
    imageWidth: 75,
    imageHeight: 152,
    imageClassName: "w-20",
  },
  {
    id: "espresso",
    title: "AeroPress espresso",
    description: "Yeah we know the AeroPress isn't made for espresso BUT these recipes will get you close.",
    image: "/illustrations/espressoul.svg",
    imageAlt: "AeroPress espresso illustration",
    imageWidth: 140,
    imageHeight: 140,
    imageClassName: "size-32",
  },
  {
    id: "milk",
    title: "A dash of milk",
    description: "You put milk in your coffee?! Ok, ok - here are some AeroPress recipes for milk coffee lovers.",
    image: "/illustrations/a_dash_of_milk.svg",
    imageAlt: "A dash of milk illustration",
    imageWidth: 140,
    imageHeight: 140,
    imageClassName: "size-32",
  },
];
