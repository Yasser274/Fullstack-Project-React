// .Social links (single source)
// the footer and the contact page both read from here, so when i have the real accounts i only change the urls in this file
export const SOCIAL_LINKS = [
   { network: "github", url: "https://github.com/Yasser274/Fullstack-Project-React" },
];

// same look for every social icon (the brand colors made them look like a different icon set next to my line icons)
// currentColor = they take the text color around them, like the other icons
export const socialIconProps = {
   bgColor: "transparent",
   fgColor: "currentColor",
   style: { width: 40, height: 40 },
};
