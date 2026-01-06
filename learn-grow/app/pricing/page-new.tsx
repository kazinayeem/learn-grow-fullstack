import { Metadata } from 'next';
import PricingClient from './pricing-client';

export const metadata: Metadata = {
  title: "Pricing Plans - Affordable Robotics Courses & STEM Kits",
  description: "Explore flexible pricing plans for Learn & Grow robotics courses and STEM education kits. Choose from single courses, quarterly subscriptions, or institutional packages. Start learning today!",
  keywords: [
    "robotics course pricing",
    "STEM education plans",
    "affordable robotics courses",
    "course subscription",
    "educational packages",
    "robotics kit prices",
    "learning plans"
  ],
  openGraph: {
    title: "Pricing Plans - Learn & Grow Academy",
    description: "Flexible pricing options for robotics courses and STEM education. Find the perfect plan for your learning journey.",
    url: "https://learnandgrow.io/pricing",
    type: "website",
    images: [
      {
        url: "https://learnandgrow.io/og-pricing.jpg",
        width: 1200,
        height: 630,
        alt: "Learn & Grow Pricing Plans",
      },
    ],
  },
  alternates: {
    canonical: "https://learnandgrow.io/pricing",
  },
};

export default function PricingPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "OfferCatalog",
    "name": "Learn & Grow Course Pricing",
    "description": "Flexible pricing plans for robotics and STEM education courses",
    "url": "https://learnandgrow.io/pricing",
    "itemListElement": [
      {
        "@type": "Offer",
        "name": "Single Course",
        "price": "3500",
        "priceCurrency": "BDT",
        "description": "Access to one specific course for 3 months"
      },
      {
        "@type": "Offer",
        "name": "Quarterly Subscription",
        "price": "9999",
        "priceCurrency": "BDT",
        "description": "Unlimited access to all courses for 3 months"
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PricingClient />
    </>
  );
}
