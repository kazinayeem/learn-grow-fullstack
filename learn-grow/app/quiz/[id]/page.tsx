import React from "react";
import QuizClientPage from "./QuizClientPage";

// This function is required for static site generation with dynamic routes
export function generateStaticParams() {
    // Return a list of possible values for [id]
    // Since the quiz data is currently mocked in the client component and doesn't depend on the ID for content structure,
    // we can provide a few dummy IDs to allow the build to succeed.
    // In a real application, you would fetch the list of all quiz IDs from your API/database.
    return [
        { id: "1" },
        { id: "2" },
        { id: "3" },
        { id: "python-basics" },
        { id: "demo-quiz" }
    ];
}

export default function Page({ params }: { params: { id: string } }) {
    return <QuizClientPage params={params} />;
}
