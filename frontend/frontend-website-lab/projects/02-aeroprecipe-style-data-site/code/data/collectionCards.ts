export type CollectionCard = {
  id: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  imageSize: string;
  imagePosition: string;
  mobileImageSize: string;
  mobileImagePosition: string;
};

export const collectionCards: CollectionCard[] = [
  {
    id: "latest",
    title: "Explore the latest",
    description: "Looking for something new? Explore the latest AeroPress recipes and get inspired!",
    image: "/illustrations/explore_the_latest.svg",
    imageAlt: "Explore the latest illustration",
    imageSize: "110px",
    imagePosition: "right 40px center",
    mobileImageSize: "90px",
    mobileImagePosition: "right 30px center",
  },
  {
    id: "championship",
    title: "Championship Recipes",
    description: "Brew like the best - here's a list of tried and true recipes from AeroPress Champions.",
    image: "/illustrations/WAC.svg",
    imageAlt: "Championship Recipes illustration",
    imageSize: "140px",
    imagePosition: "right 40px center",
    mobileImageSize: "110px",
    mobileImagePosition: "right 20px center",
  },
  {
    id: "share",
    title: "Share with a friend",
    description: "Coffee with friends - or two for you. Here are recipes to get more coffee from your AeroPress.",
    image: "/illustrations/friends.svg",
    imageAlt: "Share with a friend illustration",
    imageSize: "230px",
    imagePosition: "right -30px center",
    mobileImageSize: "150px",
    mobileImagePosition: "right -20px center",
  },
  {
    id: "low-on-beans",
    title: "Low on beans",
    description: "Running low on beans? Don't worry! This collection showcases recipes big on flavour & low on bean count.",
    image: "/illustrations/lowOnBeans.svg",
    imageAlt: "Low on beans illustration",
    imageSize: "80px",
    imagePosition: "right 60px center",
    mobileImageSize: "60px",
    mobileImagePosition: "right 50px center",
  },
  {
    id: "fast",
    title: "Fast & furious",
    description: "In a rush? These recipes under 1:30 will help you get to where you're going, quicker.",
    image: "/illustrations/fast.svg",
    imageAlt: "Fast and furious illustration",
    imageSize: "75px",
    imagePosition: "right 50px center",
    mobileImageSize: "60px",
    mobileImagePosition: "right 40px center",
  },
  {
    id: "espresso",
    title: "AeroPress espresso",
    description: "Yeah we know the AeroPress isn't made for espresso BUT these recipes will get you close.",
    image: "/illustrations/espressoul.svg",
    imageAlt: "AeroPress espresso illustration",
    imageSize: "140px",
    imagePosition: "right 20px center",
    mobileImageSize: "120px",
    mobileImagePosition: "right 0px center",
  },
  {
    id: "milk",
    title: "A dash of milk",
    description: "You put milk in your coffee?! Ok, ok - here are some AeroPress recipes for milk coffee lovers.",
    image: "/illustrations/a_dash_of_milk.svg",
    imageAlt: "A dash of milk illustration",
    imageSize: "140px",
    imagePosition: "right 40px center",
    mobileImageSize: "100px",
    mobileImagePosition: "right 20px center",
  },
];
