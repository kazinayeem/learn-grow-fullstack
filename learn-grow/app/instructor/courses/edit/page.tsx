"use client";

import React, { useEffect, useState, Suspense } from "react";
import { Card, CardBody, CardHeader, Input, Textarea, Button, Select, SelectItem, Switch, Spinner, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@nextui-org/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useGetCourseByIdQuery, useUpdateCourseMutation } from "@/redux/api/courseApi";
import { useGetAllCategoriesQuery, useCreateCategoryMutation } from "@/redux/api/categoryApi";
import RichTextEditor from "@/components/RichTextEditor";
import { FaPlus } from "react-icons/fa";

function EditInstructorCourseContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("id");

  const { data: courseData, isLoading: isFetching } = useGetCourseByIdQuery(courseId ?? "", { skip: !courseId });
  const course = courseData?.data;
  const { data: categoriesData, isLoading: isCategoriesLoading } = useGetAllCategoriesQuery(undefined);
  const [createCategory, { isLoading: isCreatingCategory }] = useCreateCategoryMutation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");

  const categories = Array.isArray(categoriesData) ? categoriesData : [];

  const [updateCourse, { isLoading: isUpdating }] = useUpdateCourseMutation();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    level: "Beginner",
    category: "",
    thumbnail: "",
    isPublished: true,
    type: "recorded",
    isRegistrationOpen: false,
    registrationDeadline: "",
  });

  useEffect(() => {
    if (course) {
      // Handle category: if it's an object with _id, use _id; otherwise use the string value
      const categoryValue = typeof course.category === 'object' && course.category?._id 
        ? course.category._id 
        : course.category || "";
        
      setFormData({
        title: course.title || "",
        description: course.description || "",
        price: String(course.price || ""),
        level: course.level || "Beginner",
        category: categoryValue,
        thumbnail: course.thumbnail || "",
        type: course.type || "recorded",
        isRegistrationOpen: !!course.isRegistrationOpen,
        registrationDeadline: course.registrationDeadline ? new Date(course.registrationDeadline).toISOString().slice(0, 10) : "",
        isPublished: course.isPublished ?? true,
      });
    }
  }, [course]);

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      alert("Category name is required");
      return;
    }
    try {
      const result = await createCategory({
        name: newCategoryName,
        description: newCategoryDescription,
      }).unwrap();
      const newCategoryId = result.data?._id || result._id;
      setFormData({ ...formData, category: newCategoryId });
      setNewCategoryName("");
      setNewCategoryDescription("");
      onClose();
    } catch (err: any) {
      alert(err?.data?.message || "Failed to create category");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId) return;
    try {
      const payload = { id: courseId, ...formData, price: Number(formData.price), registrationDeadline: formData.registrationDeadline || undefined } as any;
      await updateCourse(payload).unwrap();
      alert("Course updated successfully!");
      router.push("/instructor/courses");
    } catch (error: any) {
      alert(`Failed to update course: ${error?.data?.message || error?.message}`);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (isFetching) {
    return (
      <div className="flex justify-center p-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!courseId) {
    return <div className="p-10 text-center">No Course ID provided</div>;
  }

  return (
    <div className="container mx-auto px-6 py-8 max-w-4xl">
      <div className="flex gap-3 mb-6">
        <Button variant="light" onPress={() => router.back()}>← Back</Button>
        <Button variant="flat" onPress={() => router.push("/instructor/courses")}>Back to My Courses</Button>
      </div>

      <Card>
        <CardHeader className="flex-col items-start p-6">
          <h1 className="text-2xl font-bold">Edit Course</h1>
          <p className="text-gray-600">Update course details</p>
        </CardHeader>
        <CardBody className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input label="Course Title" name="title" value={formData.title} onChange={handleChange} isRequired variant="bordered" />
            <div>
              <label className="block text-sm font-medium mb-2">Description (Rich Text)</label>
              <RichTextEditor 
                value={formData.description} 
                onChange={(html) => setFormData({ ...formData, description: html })} 
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input type="number" label="Price (BDT)" name="price" value={formData.price} onChange={handleChange} isRequired variant="bordered" />
              <Select label="Level" selectedKeys={new Set([formData.level])} onSelectionChange={(keys) => {
                const value = Array.from(keys)[0] as string;
                setFormData({ ...formData, level: value });
              }} variant="bordered">
                <SelectItem key="Beginner" value="Beginner">Beginner</SelectItem>
                <SelectItem key="Intermediate" value="Intermediate">Intermediate</SelectItem>
                <SelectItem key="Advanced" value="Advanced">Advanced</SelectItem>
              </Select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex gap-2">
                <Select 
                  label="Category" 
                  placeholder={isCategoriesLoading ? "Loading..." : "Select a category"}
                  selectedKeys={formData.category ? new Set([formData.category]) : new Set()} 
                  onSelectionChange={(keys) => setFormData({ ...formData, category: Array.from(keys)[0] as string })}
                  variant="bordered"
                  className="flex-1"
                  isLoading={isCategoriesLoading}
                >
                  {categories.map((cat: any) => (
                    <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>
                  ))}
                </Select>
                <Button 
                  isIconOnly 
                  color="primary\" 
                  variant="flat" 
                  onPress={onOpen}
                  className="mt-6"
                  title="Create new category"
                >
                  <FaPlus />
                </Button>
              </div>
              <Select label="Course Type" selectedKeys={new Set([formData.type])} onSelectionChange={(keys) => {
                const value = Array.from(keys)[0] as string;
                setFormData({ ...formData, type: value });
              }} variant="bordered">
                <SelectItem key="live" value="live">Live</SelectItem>
                <SelectItem key="recorded" value="recorded">Recorded</SelectItem>
              </Select>
              <div className="flex items-center gap-2">
                <span className="text-sm">Open Registration?</span>
                <Switch isSelected={!!formData.isRegistrationOpen} onValueChange={(isSelected) => setFormData({ ...formData, isRegistrationOpen: isSelected })} />
              </div>
            </div>
            <Input label="Registration Deadline" type="date" name="registrationDeadline" value={formData.registrationDeadline} onChange={handleChange} variant="bordered" description="Optional: deadline to allow registrations (for live courses)" />
            <Input label="Thumbnail URL" name="thumbnail" value={formData.thumbnail} onChange={handleChange} variant="bordered" />
            <div className="flex items-center gap-2">
              <span className="text-sm">Is Published?</span>
              <Switch isSelected={formData.isPublished} onValueChange={(isSelected) => setFormData({ ...formData, isPublished: isSelected })} />
            </div>
            <div className="flex gap-4 pt-4">
              <Button type="submit" color="primary" size="lg" className="flex-1" isLoading={isUpdating}>Update Course</Button>
              <Button type="button" variant="bordered" size="lg" onPress={() => router.back()}>Cancel</Button>
            </div>
          </form>
        </CardBody>
      </Card>

      {/* Create Category Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalContent>
          <ModalHeader>Create New Category</ModalHeader>
          <ModalBody>
            <Input
              label="Category Name"
              placeholder="e.g., Web Development"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              isRequired
            />
            <Input
              label="Description (Optional)"
              placeholder="Brief description of this category"
              value={newCategoryDescription}
              onChange={(e) => setNewCategoryDescription(e.target.value)}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>Cancel</Button>
            <Button color="primary" onPress={handleCreateCategory} isLoading={isCreatingCategory}>
              Create Category
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}

export default function EditInstructorCoursePage() {
  return (
    <Suspense fallback={<div className="flex justify-center p-20"><Spinner size="lg" /></div>}>
      <EditInstructorCourseContent />
    </Suspense>
  );
}
