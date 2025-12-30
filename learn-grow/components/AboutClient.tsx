"use client";

import React from "react";
import { Card, CardBody, Image } from "@nextui-org/react";

interface AboutClientProps {
    content: any;
}

export default function AboutClient({ content }: AboutClientProps) {
    // If content is HTML string, render it directly
    if (typeof content === 'string') {
        return (
            <div className="container mx-auto px-4 sm:px-6 py-12 max-w-6xl">
                <h1 className="text-3xl sm:text-4xl font-bold mb-8">About Us</h1>
                <div 
                    className="prose prose-sm sm:prose-base lg:prose-lg max-w-none break-words overflow-hidden"
                    style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                    dangerouslySetInnerHTML={{ __html: content }}
                />
            </div>
        );
    }

    // Check if content has the structured data
    if (!content || typeof content !== 'object') {
        return (
            <div className="container mx-auto px-4 sm:px-6 py-12 max-w-6xl">
                <h1 className="text-3xl sm:text-4xl font-bold mb-8">About Us</h1>
                <p className="text-gray-600">Content loading...</p>
            </div>
        );
    }

    // Otherwise render the structured data
    const { hero = {}, mission = {}, features = [] } = content;

    return (
        <div className="container mx-auto px-6 py-12 max-w-6xl">
            {hero.title && (
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        {hero.title}
                    </h1>
                    {hero.subtitle && (
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            {hero.subtitle}
                        </p>
                    )}
                </div>
            )}

            {(hero.image || mission.description || mission.points) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
                    {hero.image && (
                        <div>
                            <Image
                                src={hero.image}
                                alt="About Learn & Grow"
                                className="rounded-2xl shadow-2xl"
                            />
                        </div>
                    )}
                    <div>
                        <h2 className="text-3xl font-bold mb-6 text-gray-800">Our Mission</h2>
                        {mission.description && (
                            <p className="text-lg text-gray-600 leading-relaxed mb-4">{mission.description}</p>
                        )}
                        {mission.points && Array.isArray(mission.points) && (
                            <ul className="space-y-3">
                                {mission.points.map((point: string, index: number) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <span className="text-primary text-xl">✓</span>
                                        <span className="text-gray-700">{point}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}

            {features.length > 0 && (
                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Why Choose Us?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {features.map((feature: any, index: number) => (
                            <Card key={index} className="hover:shadow-xl transition-shadow">
                                <CardBody className="text-center p-8">
                                    {feature.icon && <div className="text-5xl mb-4">{feature.icon}</div>}
                                    {feature.title && <h3 className="text-xl font-bold mb-3 text-gray-800">{feature.title}</h3>}
                                    {feature.description && <p className="text-gray-600">{feature.description}</p>}
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
