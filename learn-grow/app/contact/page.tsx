import React from "react";
import { Metadata } from "next";
import { defaultContactData } from "@/lib/contactData";
import ContactClient from "@/components/ContactClient";

export const metadata: Metadata = {
  title: "Contact Us - Learn & Grow Academy",
  description: "Get in touch with Learn & Grow Academy. We're here to answer your questions about our robotics and STEM courses. Contact us via email, phone, or fill out our contact form.",
  keywords: [
    "contact Learn and Grow",
    "get in touch",
    "customer support",
    "robotics education",
    "STEM education support"
  ],
  openGraph: {
    title: "Contact Learn & Grow - Get in Touch",
    description: "Reach out to our team with any questions about our courses and services.",
    url: "https://learnandgrow.io/contact",
    type: "website",
  },
  alternates: {
    canonical: "https://learnandgrow.io/contact",
  },
};

async function getContactContent() {
    try {
        const apiBase = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://learnandgrow.io/api";
        const res = await fetch(`${apiBase}/site-content/contact`, {
            next: { revalidate: 3600 },
        });
        if (!res.ok) return defaultContactData;
        const data = await res.json();
        return data?.data?.content || defaultContactData;
    } catch (error) {
        return defaultContactData;
    }
}

export default async function ContactPage() {
    const content = await getContactContent();
    return <ContactClient content={content} />;}