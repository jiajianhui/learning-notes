type App = {
  name: string;
  description: string;
  url: string;
  icon: string;
};
export const apps: App[] = [
  {
    name: "Halide",
    description: "The best pro camera iPhone and iPad",
    url: "https://www.halide.cam/",
    icon: "/footer/halide-icon.png",
  },
  {
    name: "Spectre",
    description: "The AI-powered long exposure camera for everyone",
    url: "https://spectre.cam/",
    icon: "/footer/spectre-icon.png",
  },
  {
    name: "Kino",
    description: "Cinematic pro video camera for iPhone",
    url: "https://shotwithkino.com/",
    icon: "/footer/kino-icon.png",
  },
  {
    name: "Orion",
    description: "Turn your iPad into an HDMI monitor.",
    url: "https://orion.tube/",
    icon: "/footer/orion-icon.png",
  },
];
