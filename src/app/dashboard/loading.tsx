import React from 'react'

export default function Loading() {
    return (
        <div className="animate-pulse space-y-8">
            <div className="space-y-3">
                <div className="h-8 bg-gray-200 rounded-lg w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded-lg w-1/2"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="h-32 bg-gray-100 rounded-xl"></div>
                <div className="h-32 bg-gray-100 rounded-xl"></div>
                <div className="h-32 bg-gray-100 rounded-xl"></div>
            </div>

            <div className="space-y-4">
                <div className="h-10 bg-gray-200 rounded-lg w-full"></div>
                <div className="space-y-2">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-16 bg-gray-100 rounded-lg w-full"></div>
                    ))}
                </div>
            </div>
        </div>
    )
}
