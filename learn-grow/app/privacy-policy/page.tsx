import React from "react";

async function fetchPolicyHtml() {
    const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    try {
        const res = await fetch(`${base.replace(/\/$/, "")}/site-content/privacy-policy`, { cache: "no-store" });
        const json = await res.json();
        if (json?.success && typeof json?.data?.content === "string") return json.data.content as string;
    } catch {}
    return "";
}

export default async function PrivacyPolicyPage() {
    const html = await fetchPolicyHtml();
    if (html) {
        return (
            <div className="container mx-auto px-6 py-12 max-w-4xl">
                <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
                <div className="prose prose-lg max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: html }} />
            export default async function PrivacyPolicyPage() {
                const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
                let html = "";
                try {
                    const res = await fetch(`${base}/site-content/privacy-policy`, { cache: "no-store" });
                    const data = await res.json();
                    if (data?.success && typeof data?.data?.content === "string") {
                        html = data.data.content as string;
                    }
                } catch {}

                return (
                    <div className="container mx-auto px-6 py-12 max-w-4xl">
                        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
                        <div className="prose prose-lg max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: html || "<p>Content will appear here once added by admin.</p>" }} />
                    </div>
                );
            }
