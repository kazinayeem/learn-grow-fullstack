import {
  Fira_Code as FontMono,
  Inter as FontSans,
  Roboto as FontRoboto,
  Playpen_Sans as FontPlaypen,
  Hind_Siliguri as FontHindSiliguri,
  Atma as FontAtma,
  Outfit as FontOutfit,
  Poppins as FontPoppins,
} from "next/font/google";

// Inter - Modern, friendly body text with excellent readability
export const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

// Poppins - Bold, geometric headlines with strong contrast
export const fontPoppins = FontPoppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const fontMono = FontMono({
  subsets: ["latin"],
  variable: "--font-mono",
});

// Outfit - Modern, clean UI font
export const fontOutfit = FontOutfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const fontRoboto = FontRoboto({
  subsets: ["latin"],
  variable: "--font-roboto",
  weight: ["100", "300", "400", "500", "700", "900"],
});

export const fontPlaypen = FontPlaypen({
  subsets: ["latin"],
  variable: "--font-playpen",
});

export const fontHindSiliguri = FontHindSiliguri({
  subsets: ["latin"],
  variable: "--font-hind-siliguri",
  weight: ["300", "400", "500", "600", "700"],
});

export const fontAtma = FontAtma({
  subsets: ["latin", "bengali"],
  variable: "--font-atma",
  weight: ["300", "400", "500", "600", "700"],
})