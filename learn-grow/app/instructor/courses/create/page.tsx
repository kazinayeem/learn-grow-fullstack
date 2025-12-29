/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, CardBody, Input, Select, SelectItem, Switch, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@nextui-org/react";
import RichTextEditor from "@/components/RichTextEditor";
import { useCreateCourseMutation } from "@/redux/api/courseApi";
import { useGetAllCategoriesQuery, useCreateCategoryMutation } from "@/redux/api/categoryApi";
import { FaPlus } from "react-icons/fa";

const COURSE_LEVELS = ["Beginner", "Intermediate", "Advanced", "Expert"];
const COURSE_LANGUAGES = ["English", "Bangla", "Spanish", "French", "German", "Chinese", "Japanese", "Arabic", "Hindi", "Portuguese"];

export default function InstructorCreateCoursePage() {
  const router = useRouter();
  const [createCourse, { isLoading }] = useCreateCourseMutation();
  const { data: categoriesData, isLoading: isCategoriesLoading } = useGetAllCategoriesQuery(undefined);
  const [createCategory, { isLoading: isCreatingCategory }] = useCreateCategoryMutation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");

  const categories = Array.isArray(categoriesData) ? categoriesData : [];

  const [form, setForm] = useState({
    title: "",
    category: "",
    type: "recorded" as "live" | "recorded",
    price: "",
    level: "Beginner",
    language: "English",
    duration: "",
    thumbnailUrl: "",
    isRegistrationOpen: false,
    registrationDeadline: "",
    descriptionHtml: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

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
      // Set the newly created category's _id
      const newCategoryId = result.data?._id || result._id;
      setForm({ ...form, category: newCategoryId });
      setNewCategoryName("");
      setNewCategoryDescription("");
      onClose();
    } catch (err: any) {
      alert(err?.data?.message || "Failed to create category");
    }
  };

  const onSubmit = async () => {
    setErrors({});
    const e: Record<string, string> = {};
    if (form.title.length < 5) e.title = "Min 5 characters";
    if (!form.descriptionHtml || form.descriptionHtml.replace(/<[^>]*>/g, "").length < 20) e.descriptionHtml = "Min 20 characters (rich text)";
    if (!form.price) e.price = "Required";
    if (!form.duration) e.duration = "Required";
    if (!form.thumbnailUrl) e.thumbnailUrl = "Required";
    if (Object.keys(e).length) { setErrors(e); return; }

    try {
      const instructorRaw = localStorage.getItem("user");
      const instructorId = instructorRaw ? JSON.parse(instructorRaw)?._id : undefined;
      await createCourse({
        title: form.title,
        description: form.descriptionHtml,
        category: form.category,
        type: form.type,
        price: parseInt(form.price),
        level: form.level,
        language: form.language,
        duration: parseInt(form.duration),
        thumbnail: form.thumbnailUrl,
        isRegistrationOpen: !!form.isRegistrationOpen,
        registrationDeadline: form.registrationDeadline || undefined,
        instructorId,
      } as any).unwrap();
      router.push("/instructor/courses");
    } catch (err: any) {
      const apiErrors = err?.data?.errors;
      if (Array.isArray(apiErrors)) {
        const fieldErrors: Record<string, string> = {};
        apiErrors.forEach((er: any) => {
          const field = er.field?.split(".").pop() || "general";
          fieldErrors[field] = er.message;
        });
        setErrors(fieldErrors);
      } else {
        setErrors({ general: "Failed to create course" });
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Create New Course</h1>
        <Button variant="flat" onPress={() => router.push("/instructor/courses")}>Back</Button>
      </div>

      {errors.general && (
        <div className="p-3 mb-4 bg-red-50 border border-red-200 rounded text-red-700">{errors.general}</div>
      )}

      <Card>
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} isInvalid={!!errors.title} errorMessage={errors.title} />
            <div className="flex gap-2">
              <Select 
                label="Category" 
                placeholder={isCategoriesLoading ? "Loading..." : "Select a category"}
                selectedKeys={form.category ? new Set([form.category]) : new Set()} 
                onSelectionChange={(keys) => setForm({ ...form, category: Array.from(keys)[0] as string })}
                className="flex-1"
                disallowEmptySelection={false}
                isLoading={isCategoriesLoading}
              >
                {categories.map((cat: any) => (
                  <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>
                ))}
              </Select>
              <Button 
                isIconOnly 
                color="primary" 
                variant="flat" 
                onPress={onOpen}
                className="mt-6"
                title="Create new category"
              >
                <FaPlus />
              </Button>
            </div>
            <Select label="Type" selectedKeys={new Set([form.type])} onSelectionChange={(keys) => setForm({ ...form, type: Array.from(keys)[0] as any })}>
              <SelectItem key="live">Live</SelectItem>
              <SelectItem key="recorded">Recorded</SelectItem>
            </Select>
            <Input label="Thumbnail URL" value={form.thumbnailUrl} onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value })} isInvalid={!!errors.thumbnailUrl} errorMessage={errors.thumbnailUrl} />
            <Input label="Price (BDT)" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} isInvalid={!!errors.price} errorMessage={errors.price} />
            <Input label="Duration (hours)" type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} isInvalid={!!errors.duration} errorMessage={errors.duration} />
            <Select label="Level" selectedKeys={new Set([form.level])} onSelectionChange={(keys) => setForm({ ...form, level: Array.from(keys)[0] as any })}>
              {COURSE_LEVELS.map((lvl) => (<SelectItem key={lvl}>{lvl}</SelectItem>))}
            </Select>
            <Select label="Language" selectedKeys={new Set([form.language])} onSelectionChange={(keys) => setForm({ ...form, language: Array.from(keys)[0] as any })}>
              {COURSE_LANGUAGES.map((lng) => (<SelectItem key={lng}>{lng}</SelectItem>))}
            </Select>
            <div className="flex items-center gap-2">
              <span className="text-sm">Open Registration?</span>
              <Switch isSelected={!!form.isRegistrationOpen} onValueChange={(v) => setForm({ ...form, isRegistrationOpen: v })} />
            </div>
            <Input label="Registration Deadline" type="date" value={form.registrationDeadline} onChange={(e) => setForm({ ...form, registrationDeadline: e.target.value })} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description (Rich Text)</label>
            <RichTextEditor value={form.descriptionHtml} onChange={(html) => setForm({ ...form, descriptionHtml: html })} />
            {errors.descriptionHtml && <p className="text-red-600 text-sm mt-1">{errors.descriptionHtml}</p>}
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="light" onPress={() => router.push("/instructor/courses")}>Cancel</Button>
            <Button color="primary" onPress={onSubmit} isLoading={isLoading}>Create</Button>
          </div>
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
