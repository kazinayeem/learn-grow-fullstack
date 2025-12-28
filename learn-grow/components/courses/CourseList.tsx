"use client";

import React, { useMemo, useState } from "react";
import {
  Card,
  CardBody,
  CardFooter,
  Image,
  Button,
  Spinner,
  Chip,
  Pagination,
  Select,
  SelectItem,
  Input,
} from "@nextui-org/react";
import { useGetPublishedCoursesQuery } from "@/redux/api/courseApi";
import { useGetAllCategoriesQuery } from "@/redux/api/categoryApi";
import { useRouter } from "next/navigation";
import DOMPurify from "isomorphic-dompurify";
import { FaSearch } from "react-icons/fa";

export default function CourseList() {
  const { data, isLoading, error } = useGetPublishedCoursesQuery(undefined);
  const { data: categoriesData, isLoading: isCategoriesLoading } = useGetAllCategoriesQuery(undefined);
  const router = useRouter();
  const [language] = useState<"en" | "bn">("bn");
  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const pageSize = 8;

  const categories: any[] = Array.isArray(categoriesData) ? categoriesData : [];

  const courses = useMemo(() => {
    const fromApi = data?.data || [];
    let filtered = fromApi.filter(
      (c: any) => c.isPublished && c.isAdminApproved
    );
    
    // Filter by category if selected
    if (selectedCategory) {
      filtered = filtered.filter((c: any) => {
        const categoryId = typeof c.category === 'object' ? c.category._id : c.category;
        return categoryId === selectedCategory;
      });
    }
    
    // Filter by search term (search in title and description)
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((c: any) => {
        const title = (c.title || "").toLowerCase();
        const description = (c.description || "").toLowerCase();
        return title.includes(searchLower) || description.includes(searchLower);
      });
    }
    
    return filtered.length > 0 ? filtered : [];
  }, [data, selectedCategory, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(courses.length / pageSize));
  const pagedCourses = courses.slice((page - 1) * pageSize, page * pageSize);

  // Shadows mapping for visual variety (cycling through based on index) - reused from homepage
  const shadows = [
    "hover:shadow-glow-primary",
    "hover:shadow-glow-accent",
    "hover:shadow-glow-secondary",
    "hover:shadow-xl",
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner label="Loading courses..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Search and Filter Section */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <Input
          placeholder="Search courses by name..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1);
          }}
          startContent={<FaSearch className="text-gray-400" />}
          className="flex-1"
          size="lg"
          isClearable
          onClear={() => setSearchTerm("")}
        />
        <Select
          label="Filter by Category"
          placeholder="All Categories"
          selectedKeys={selectedCategory ? [selectedCategory] : []}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setPage(1);
          }}
          className="w-full md:w-64"
          size="lg"
          isLoading={isCategoriesLoading}
        >
          <SelectItem key="" value="">All Categories</SelectItem>
          {categories.map((cat: any) => (
            <SelectItem key={cat._id} value={cat._id}>
              {cat.name}
            </SelectItem>
          ))}
        </Select>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {courses.length === 0 ? (
          <div className="col-span-full text-center py-20">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-2xl font-bold text-gray-700">
              No courses found
            </h3>
            <p className="text-gray-500">
              Please check back later for new programs!
            </p>
          </div>
        ) : (
          pagedCourses.map((course: any, index: number) => (
            <Card
              key={course._id || index}
              className={`group cursor-pointer transition-all duration-300 hover:-translate-y-2 ${shadows[index % shadows.length]} shadow-card border-0`}
              isPressable
              onPress={() => router.push(`/courses/${course._id || course.id}`)}
            >
              {/* Course Image Header */}
              <div className="relative h-48 overflow-hidden w-full">
                <Image
                  removeWrapper
                  alt={course.title}
                  className="z-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  src={
                    course.img ||
                    course.thumbnail ||
                    "https://images.unsplash.com/photo-1587620962725-abab7fe55159?q=80&w=1000&auto=format&fit=crop"
                  }
                />
                {/* Gradient Overlay - Fixed Blue Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/50 via-blue-900/20 to-transparent z-10" />

                <div className="absolute bottom-4 left-4 z-20">
                  <Chip
                    color="primary"
                    size="sm"
                    variant="flat"
                    className="bg-white/90 text-primary-700 font-bold shadow-sm"
                  >
                    {course.level}
                  </Chip>
                </div>
              </div>

              <CardBody className="p-4 sm:p-6">
                {/* Course Title */}
                <h3
                  className={`text-lg sm:text-xl font-bold text-gray-900 mb-2 line-clamp-2 ${language === "bn" ? "font-siliguri" : ""}`}
                >
                  {course.title}
                </h3>

                {/* Description */}
                <div
                  className={`text-gray-600 text-xs sm:text-sm mb-3 line-clamp-2 prose-sm max-w-none ${language === "bn" ? "font-siliguri" : ""}`}
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(String(course.description || "")) }}
                />

                {/* Price & Level */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg sm:text-xl font-bold text-primary">{course.price} BDT</span>
                  </div>
                  {course.enrolled !== undefined && (
                    <div className="text-xs sm:text-sm text-gray-600">
                      {course.enrolled} Enrolled
                    </div>
                  )}
                </div>
              </CardBody>

              <CardFooter className="p-4 sm:p-6 pt-0 flex gap-2">
                <div className="flex-1">
                  <div className="text-xs text-gray-500">
                    Click to view details
                  </div>
                </div>
              </CardFooter>
            </Card>
          ))
        )}
      </div>

      {courses.length > pageSize && (
        <div className="flex justify-center">
          <Pagination
            page={page}
            total={totalPages}
            onChange={setPage}
            color="primary"
            showControls
          />
        </div>
      )}
    </div>
  );
}
