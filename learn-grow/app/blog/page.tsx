"use client";

import React, { useEffect, useState } from "react";
import { Card, CardBody, CardHeader, Image, Chip, Button, Spinner } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { defaultBlogData } from "@/lib/blogData";
import { useGetSiteContentQuery } from "@/redux/api/siteContentApi";

export default function BlogPage() {
    const router = useRouter();
    const { data: apiData, isLoading } = useGetSiteContentQuery("blog");

    // Use API data if available, otherwise default
    const data = (apiData?.data?.content && Object.keys(apiData.data.content).length > 0)
        ? apiData.data.content
        : defaultBlogData;

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" label="Loading Blog..." /></div>;
    }

    const { hero, featuredPost, posts, categories } = data;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Hero */}
            <div
                className="text-white py-20 px-6"
                style={{
                    background: 'linear-gradient(135deg, #121064 0%, #1e1b8f 50%, #2d1ba8 100%)'
                }}
            >
                <div className="container mx-auto max-w-7xl text-center">
                    <Chip className="mb-4 bg-white/10 text-white border border-white/20" variant="flat">
                        {hero.tag}
                    </Chip>
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">
                        {hero.title}
                    </h1>
                    <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                        {hero.subtitle}
                    </p>
                </div>
            </div>

            <div className="container mx-auto max-w-7xl px-6 py-12">
                {/* Categories */}
                <div className="flex flex-wrap gap-2 justify-center mb-12">
                    {categories.map((cat) => (
                        <Button key={cat} size="sm" variant={cat === "All" ? "solid" : "bordered"} color="primary">
                            {cat}
                        </Button>
                    ))}
                </div>

                {/* Featured Post */}
                <Card className="mb-12 overflow-hidden hover:shadow-xl transition-shadow">
                    <CardBody className="p-0">
                        <div className="grid grid-cols-1 md:grid-cols-2">
                            <Image
                                src={featuredPost.image}
                                alt={featuredPost.title}
                                className="w-full h-full object-cover"
                                removeWrapper
                            />
                            <div className="p-8 flex flex-col justify-center">
                                <Chip color="warning" size="sm" className="mb-4 w-fit">Featured</Chip>
                                <h2 className="text-3xl font-bold mb-4">{featuredPost.title}</h2>
                                <p className="text-gray-600 mb-6">{featuredPost.excerpt}</p>
                                <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                                    <span>{featuredPost.author}</span>
                                    <span>•</span>
                                    <span>{featuredPost.date}</span>
                                    <span>•</span>
                                    <span>{featuredPost.readTime}</span>
                                </div>
                                <Button color="primary" className="w-fit">
                                    Read More →
                                </Button>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                {/* Blog Posts Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {posts.map((post, index) => (
                        <Card key={index} isPressable className="hover:shadow-lg transition-shadow">
                            <CardHeader className="p-0">
                                <Image
                                    src={post.image}
                                    alt={post.title}
                                    className="w-full h-48 object-cover"
                                    removeWrapper
                                />
                            </CardHeader>
                            <CardBody className="p-6">
                                <Chip color="primary" size="sm" variant="flat" className="mb-3">
                                    {post.category}
                                </Chip>
                                <h3 className="text-xl font-bold mb-3 line-clamp-2">{post.title}</h3>
                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{post.excerpt}</p>
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                    <span>{post.author}</span>
                                    <span>{post.readTime}</span>
                                </div>
                                <p className="text-xs text-gray-400 mt-1">{post.date}</p>
                            </CardBody>
                        </Card>
                    ))}
                </div>

                {/* Load More */}
                <div className="text-center mt-12">
                    <Button size="lg" variant="bordered">
                        Load More Articles
                    </Button>
                </div>
            </div>
        </div>
    );
}
