export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Learn & Grow",
  description: "Empowering the next generation through world-class STEM education.",
  navItems: [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Courses",
      href: "/courses",
    },
    {
      label: "About",
      href: "/about",
    },
    {
      label: "Services",
      href: "/services",
    },
    {
      label: "Events",
      href: "/events",
    },
    {
      label: "Blog",
      href: "/blog",
    },
  ],
  navMenuItems: [
    {
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      label: "Profile",
      href: "/profile",
    },
    {
      label: "My Courses",
      href: "/courses",
    },
    {
      label: "Help",
      href: "/help",
    },
    {
      label: "Settings",
      href: "/profile",
    },
    {
      label: "Logout",
      href: "/logout",
    },
  ],
  links: {
    github: "https://github.com/learnandgrow",
    youtube: "https://www.youtube.com/channel/UCmcDLkVrrzMolsa2VWQ6yNA",
    docs: "https://learnandgrow.io/docs",
    discord: "https://discord.gg/learnandgrow",
    sponsor: "https://patreon.com/learnandgrow",
    linkedin: "https://www.linkedin.com/company/learnandgrowoffical/?viewAsMember=true",
    facebook: "https://www.facebook.com/learnandgrowofficial",
    instagram: "https://www.instagram.com/learngrow_insta/"
  },
};
