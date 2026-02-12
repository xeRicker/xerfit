"use client";

import { Suspense } from "react";
import { AddProductForm } from "./_components/AddProductForm";

export default function AddPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"/></div>}>
            <AddProductForm />
        </Suspense>
    );
}
