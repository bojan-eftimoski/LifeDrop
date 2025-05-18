import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-5xl font-bold mb-4">404</h1>
      <p className="text-lg mb-8">Page not found.</p>
      <Link
        to="/"
        className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
      >
        Go to Dashboard
      </Link>
    </div>
  );
}
