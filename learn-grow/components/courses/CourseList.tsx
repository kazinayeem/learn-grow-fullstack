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
  Skeleton,
  Avatar,
} from "@nextui-org/react";
import { useGetPublishedCoursesQuery } from "@/redux/api/courseApi";
import { useGetAllCategoriesQuery } from "@/redux/api/categoryApi";
import { useRouter } from "next/navigation";
import { FaSearch, FaClock, FaBook, FaUser, FaStar, FaPlayCircle } from "react-icons/fa";

// Skeleton Loader Component
const CourseCardSkeleton = () => (
  <Card className="w-full space-y-5 p-0" radius="lg">
    <Skeleton className="rounded-t-lg">
      <div className="h-52 rounded-t-lg bg-default-300"></div>
    </Skeleton>
    <div className="space-y-3 px-4 pb-4">
      <Skeleton className="w-3/5 rounded-lg">
        <div className="h-3 w-3/5 rounded-lg bg-default-200"></div>
      </Skeleton>
      <Skeleton className="w-4/5 rounded-lg">
        <div className="h-6 w-4/5 rounded-lg bg-default-200"></div>
      </Skeleton>
      <Skeleton className="w-full rounded-lg">
        <div className="h-3 w-full rounded-lg bg-default-300"></div>
      </Skeleton>
      <div className="flex gap-2">
        <Skeleton className="w-16 rounded-lg">
          <div className="h-5 w-16 rounded-lg bg-default-200"></div>
        </Skeleton>
        <Skeleton className="w-20 rounded-lg">
          <div className="h-5 w-20 rounded-lg bg-default-200"></div>
        </Skeleton>
      </div>
    </div>
  </Card>
);

export default function CourseList() {
  const { data, isLoading, error } = useGetPublishedCoursesQuery(undefined);
  const { data: categoriesData, isLoading: isCategoriesLoading } = useGetAllCategoriesQuery(undefined);
  const router = useRouter();
  const [language] = useState<"en" | "bn">("bn");
  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const pageSize = 9;

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

  // Get level badge color
  const getLevelColor = (level: string) => {
    switch(level?.toLowerCase()) {
      case 'beginner': return 'success';
      case 'intermediate': return 'warning';
      case 'advanced': return 'danger';
      default: return 'default';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        {/* Search skeleton */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <Skeleton className="h-12 w-full md:flex-1 rounded-xl" />
          <Skeleton className="h-12 w-full md:w-64 rounded-xl" />
        </div>
        {/* Cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <CourseCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Search and Filter Section */}
      <div className="flex flex-col md:flex-row gap-4 sticky top-0 z-10 bg-white/80 backdrop-blur-lg py-4 rounded-2xl px-4 shadow-sm border border-gray-100">
        <Input
          placeholder="Search courses by name..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1);
          }}
          startContent={<FaSearch className="text-gray-400 text-lg" />}
          className="flex-1"
          size="lg"
          radius="lg"
          classNames={{
            input: "text-base",
            inputWrapper: "bg-white shadow-sm border border-gray-200 hover:border-primary transition-colors"
          }}
          isClearable
          onClear={() => setSearchTerm("")}
        />
        <Select
          label="Category"
          placeholder="All Categories"
          selectedKeys={selectedCategory ? [selectedCategory] : []}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setPage(1);
          }}
          className="w-full md:w-72"
          size="lg"
          radius="lg"
          classNames={{
            trigger: "bg-white shadow-sm border border-gray-200 hover:border-primary transition-colors"
          }}
          isLoading={isCategoriesLoading}
        >
          {[<SelectItem key="" value="">All Categories</SelectItem>,
          ...categories.map((cat: any) => (
            <SelectItem key={cat._id} value={cat._id}>
              {cat.name}
            </SelectItem>
          ))]}
        </Select>
      </div>
      
      {/* Results count */}
      {courses.length > 0 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-gray-600 text-sm">
            Showing <span className="font-semibold text-gray-900">{pagedCourses.length}</span> of <span className="font-semibold text-gray-900">{courses.length}</span> courses
          </p>
        </div>
      )}

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.length === 0 ? (
          <div className="col-span-full text-center py-20">
            <div className="text-7xl mb-6 opacity-50">📚</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              No courses found
            </h3>
            <p className="text-gray-500 mb-6">
              Try adjusting your search or filters
            </p>
            <Button
              color="primary"
              variant="flat"
              onPress={() => {
                setSearchTerm("");
                setSelectedCategory("");
              }}
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          pagedCourses.map((course: any, index: number) => {
            const categoryName = typeof course.category === "object" ? course.category?.name : null;
            const instructorName = typeof course.instructor === "object" ? course.instructor?.name : "Instructor";
            
            return (
            <Card
              key={course._id || index}
              className="group cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border border-gray-100"
              radius="lg"
            >
              {/* Course Image with Overlay Badge */}
              <div 
                className="relative h-52 overflow-hidden cursor-pointer"
                onClick={() => router.push(`/courses/${course._id || course.id}`)}
              >
                <Image
                  removeWrapper
                  alt={course.title}
                  className="z-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  src={
                    course.img ||
                    course.thumbnail ||
                    "https://images.unsplash.com/photo-1587620962725-abab7fe55159?q=80&w=1000&auto=format&fit=crop"
                  }
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                
                {/* Level Badge on Image */}
                <div className="absolute top-3 left-3">
                  <Chip
                    color={getLevelColor(course.level)}
                    size="sm"
                    variant="solid"
                    className="font-semibold shadow-lg"
                  >
                    {course.level || "Beginner"}
                  </Chip>
                </div>

                {/* Type Badge */}
                {course.type && (
                  <div className="absolute top-3 right-3">
                    <Chip
                      color="default"
                      size="sm"
                      variant="solid"
                      className="bg-white/90 text-gray-800 font-medium shadow-lg"
                      startContent={course.type === "Live" ? <FaPlayCircle className="text-red-500" /> : undefined}
                    >
                      {course.type}
                    </Chip>
                  </div>
                )}
              </div>

              <CardBody className="p-5 space-y-3">
                {/* Category Tag */}
                {categoryName && (
                  <Chip
                    size="sm"
                    variant="flat"
                    color="secondary"
                    className="w-fit"
                  >
                    {categoryName}
                  </Chip>
                )}

                {/* Course Title */}
                <h3 
                  className="text-lg font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-primary transition-colors cursor-pointer"
                  onClick={() => router.push(`/courses/${course._id || course.id}`)}
                >
                  {course.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                  {String(course.description || "").replace(/<[^>]*>/g, '').substring(0, 100)}...
                </p>

                {/* Meta Information */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {course.duration && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 px-2.5 py-1.5 rounded-lg">
                      <FaClock className="text-primary" />
                      <span className="font-medium">{course.duration}h</span>
                    </div>
                  )}
                  {course.modules && course.modules.length > 0 && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 px-2.5 py-1.5 rounded-lg">
                      <FaBook className="text-primary" />
                      <span className="font-medium">{course.modules.length} Modules</span>
                    </div>
                  )}
                  {course.enrolled !== undefined && course.enrolled > 0 && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 px-2.5 py-1.5 rounded-lg">
                      <FaUser className="text-primary" />
                      <span className="font-medium">{course.enrolled}</span>
                    </div>
                  )}
                  {course.rating && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 px-2.5 py-1.5 rounded-lg">
                      <FaStar className="text-yellow-500" />
                      <span className="font-medium">{course.rating}</span>
                    </div>
                  )}
                </div>
              </CardBody>

              {/* Footer with Price and CTA */}
              <CardFooter className="p-5 flex items-center justify-between bg-gray-50/50">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 mb-1">Price</span>
                  <span className="text-3xl font-bold text-primary">৳{course.price || 0}</span>
                </div>
                <Button
                  color="primary"
                  variant="shadow"
                  size="lg"
                  className="font-semibold"
                  onPress={() => router.push(`/courses/${course._id || course.id}`)}
                >
                  Enroll Now
                </Button>
              </CardFooter>
            </Card>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {courses.length > pageSize && (
        <div className="flex justify-center pt-8">
          <Pagination
            page={page}
            total={totalPages}
            onChange={setPage}
            color="primary"
            size="lg"
            showControls
            className="gap-2"
            radius="lg"
          />
        </div>
      )}
    </div>
  );
}
