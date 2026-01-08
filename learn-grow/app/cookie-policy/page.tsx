import React from 'react';
import { Metadata } from 'next';
export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'Learn about how we use cookies on our platform',
};

async function fetchCookiePolicyHtml() {
  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  try {
    const res = await fetch(`${base.replace(/\/$/, "")}/site-content/cookie-policy`, { cache: "no-store" });
    const json = await res.json();
    // Check if content exists and is not empty
    if (json?.success && json?.data?.content && typeof json.data.content === "string" && json.data.content.trim() !== "") {
      return json.data.content as string;
    }
  } catch (error) {
    console.error("Error fetching cookie policy:", error);
  }
  // Return null if no valid content found in database
  return null;
}

export default async function CookiePolicyPage() {
  const html = await fetchCookiePolicyHtml();
  
  if (html) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-12 max-w-4xl">
        <h1 className="text-3xl sm:text-4xl font-bold mb-8">Cookie Policy</h1>
        <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none text-gray-700 break-words overflow-hidden" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }} dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 max-w-4xl">
      <h1 className="text-3xl sm:text-4xl font-bold mb-8">Cookie Policy</h1>
      <div className="prose prose-lg max-w-none text-gray-700">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-600 mb-4">Cookie Policy content will appear here once added by admin.</p>
          <p className="text-sm text-gray-500">Please check back later or contact support.</p>
        </div>
      </div>
    </div>
  );
}
           