import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Learn Grow privacy policy - how we collect, use, and protect your information.",
};

async function fetchPolicyHtml() {
    const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    const urlBase = base.replace(/\/$/, "");
    try {
        const res = await fetch(`${urlBase}/site-content/privacy-policy`, { cache: "no-store" });
        const json = await res.json();
        if (json?.success && typeof json?.data?.content === "string") return json.data.content as string;
    } catch {}
    return "";
}

export default async function PrivacyPolicyPage() {
    const html = await fetchPolicyHtml();
    const fallback = "<p>Content will appear here once added by admin.</p>";
    return (
        <div className="container mx-auto px-4 sm:px-6 py-12 max-w-4xl">
            <h1 className="text-3xl sm:text-4xl font-bold mb-8">Privacy Policy</h1>
            <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none text-gray-700 break-words overflow-hidden" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }} dangerouslySetInnerHTML={{ __html: html || fallback }} />
        </div>
    );
}
