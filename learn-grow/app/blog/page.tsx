"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Image,
  Chip,
  Button,
  Spinner,
  Input,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Pagination,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import DOMPurify from "isomorphic-dompurify";
import {
  useGetAllBlogsQuery,
  useGetAllBlogCategoriesQuery,
} from "@/redux/api/blogApi";
import { FaPlus, FaSearch, FaImage } from "react-icons/fa";

// Helper function to decode HTML entities
const decodeHtmlEntities = (html: string): string => {
  if (typeof document === "undefined") {
    // Server-side fallback
    return html
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .replace(/&nbsp;/g, " ")
      .replace(/&#39;/g, "'");
  }
  const textarea = document.createElement("textarea");
  textarea.innerHTML = html;
  return textarea.value;
};

export default function BlogPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [userRole, setUserRole] = useState<string | null>(null);

  // Get user role from localStorage
  useEffect(() => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        setUserRole(user.role);
      }
    } catch (e) {
    }
  }, []);

  // Fetch blogs and categories
  const { data: blogsResponse, isLoading: blogsLoading } = useGetAllBlogsQuery(
    {
      page,
      limit: 9,
      search: search || undefined,
      category: selectedCategory || undefined,
      status: "approved",
    }
  );

  const { data: categoriesResponse } = useGetAllBlogCategoriesQuery();

  const blogs = blogsResponse?.data || [];
  const pagination = blogsResponse?.pagination || {};
  const categories = categoriesResponse?.data || [];

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleCategoryFilter = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setPage(1);
  };

  if (blogsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" label="Loading blogs..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Hero Section */}
      <div
        className="text-white py-20 px-6"
        style={{
          background:
            "linear-gradient(135deg, #121064 0%, #1e1b8f 50%, #2d1ba8 100%)",
        }}
      >
        <div className="container mx-auto max-w-7xl text-center">
          <Chip
            className="mb-4 bg-white/10 text-white border border-white/20"
            variant="flat"
          >
            Our Blog
          </Chip>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Insights & Updates
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Discover articles, tutorials, and insights from our community
          </p>
          {userRole && ["student", "instructor", "admin"].includes(userRole) && (
            <Button
              color="primary"
              size="lg"
              startContent={<FaPlus />}
              className="mt-6"
              onPress={() => router.push("/blog/create")}
            >
              Write a Blog
            </Button>
          )}
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-6 py-12">
        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <Input
            placeholder="Search blogs..."
            startContent={<FaSearch />}
            value={search}
            onValueChange={handleSearch}
            variant="bordered"
            className="md:col-span-2"
          />
          <Dropdown>
            <DropdownTrigger>
              <Button variant="bordered" className="w-full">
                {selectedCategory
                  ? categories.find((c) => c._id === selectedCategory)?.name ||
                    "Filter"
                  : "All Categories"}
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              onAction={(key) => handleCategoryFilter(key as string)}
            >
              <DropdownItem key="">All Categories</DropdownItem>
              {categories.map((cat) => (
                <DropdownItem key={cat._id}>{cat.name}</DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        </div>

        {/* Blog Grid */}
        {blogs.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardBody className="p-12 text-center">
              <p className="text-gray-500 text-lg">No blogs found</p>
              <p className="text-gray-400 text-sm mt-2">Check back later for new articles!</p>
            </CardBody>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {blogs.map((blog: any) => (
                <Card
                  key={blog._id}
                  isPressable
                  className="hover:shadow-lg transition-shadow"
                  onPress={() => router.push(`/blog/${blog.slug}`)}
                >
                  <CardHeader className="p-0">
                    {blog.image ? (
                      <Image
                        src={blog.image}
                        alt={blog.title}
                        className="w-full h-48 object-cover"
                        removeWrapper
                        fallbackSrc="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='400'%3E%3Crect fill='%23e5e7eb' width='800' height='400'/%3E%3C/svg%3E"
                        onError={(e: any) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent && !parent.querySelector('.image-placeholder')) {
                            const placeholder = document.createElement('div');
                            placeholder.className = 'image-placeholder w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center';
                            placeholder.innerHTML = '<svg class="w-16 h-16 text-gray-400 mb-2" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"/></svg><span class="text-sm text-gray-500 font-medium">No Image Available</span>';
                            parent.appendChild(placeholder);
                          }
                        }}
                      />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center">
                        <FaImage className="w-16 h-16 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-500 font-medium">No Image Available</span>
                      </div>
                    )}
                  </CardHeader>
                  <CardBody className="p-6">
                    {blog.category && (
                      <Chip
                        color="primary"
                        size="sm"
                        variant="flat"
                        className="mb-3 w-fit"
                      >
                        {blog.category.name}
                      </Chip>
                    )}
                    <h3 className="text-xl font-bold mb-3 line-clamp-2">
                      {blog.title}
                    </h3>
                    <p
                      className="text-gray-600 text-sm mb-4 line-clamp-2"
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(decodeHtmlEntities(blog.excerpt)),
                      }}
                    />
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                      <span>{blog.author?.name || "Anonymous"}</span>
                      <span>{blog.readTime || 5} min read</span>
                    </div>
                    <p className="text-xs text-gray-400">
                      {new Date(blog.createdAt).toLocaleDateString()}
                    </p>
                  </CardBody>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {(pagination as any)?.totalPages > 1 && (
              <div className="flex justify-center">
                <Pagination
                  color="primary"
                  page={page}
                  total={(pagination as any)?.totalPages || 1}
                  onChange={setPage}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

