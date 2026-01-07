"use client";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
  }, [error]);

  return (
    <div className="container mx-auto px-6 py-10 max-w-4xl">
      <h2 className="text-3xl font-bold mb-3">Course Page Error</h2>
      <p className="text-gray-700 mb-4">{error?.message || "Unexpected error"}</p>
      {error?.stack && (
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto mb-6">
          {error.stack}
        </pre>
      )}
      <div className="flex gap-3">
        <button
          className="px-4 py-2 rounded bg-primary-600 text-white"
          onClick={() => reset()}
        >
          Try again
        </button>
        <a href="/instructor" className="px-4 py-2 rounded border">Back to Instructor</a>
      </div>
    </div>
  );
}
