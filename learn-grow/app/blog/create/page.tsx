"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  Input,
  Textarea,
  Button,
  Select,
  SelectItem,
  Spinner,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Switch,
  Divider,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";
import {
  useCreateBlogMutation,
  useGetAllBlogCategoriesQuery,
  useCreateBlogCategoryMutation,
} from "@/redux/api/blogApi";
import {
  FaArrowLeft,
  FaPlus,
  FaPenNib,
  FaImage,
  FaTags,
  FaGlobe,
  FaSave,
  FaPaperPlane,
  FaHeading,
  FaAlignLeft,
} from "react-icons/fa";
import { toast } from "react-toastify";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

export default function CreateBlogPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDesc, setNewCategoryDesc] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    category: "",
    metaTags: "" as any,
    image: "",
    isPublished: false,
  });

  // Function to generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .substring(0, 100);
  };

  const { data: categoriesResponse, refetch: refetchCategories, isLoading: categoriesLoading } =
    useGetAllBlogCategoriesQuery(undefined);
  const [createBlog, { isLoading: isCreating }] = useCreateBlogMutation();
  const [createCategory, { isLoading: isCreatingCategory }] =
    useCreateBlogCategoryMutation();

  const categories = categoriesResponse?.data || [];

  // Check authorization
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (["student", "instructor", "admin"].includes(user.role)) {
          setIsAuthorized(true);
          return;
        }
      } catch (e) {
        console.error("Auth check failed");
      }
    }
    router.replace("/login");
  }, [router]);

  const handleInputChange = (field: string, value: any) => {
    const newData = { ...formData, [field]: value };
    // Auto-generate slug from title if slug is empty or matches previous auto-gen
    if (field === "title" && (!formData.slug || formData.slug === generateSlug(formData.title))) {
      newData.slug = generateSlug(value);
    }
    setFormData(newData);
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      await createCategory({
        name: newCategoryName,
        description: newCategoryDesc,
      }).unwrap();

      toast.success("Category created successfully!");
      setNewCategoryName("");
      setNewCategoryDesc("");
      refetchCategories();
      onOpenChange();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to create category");
    }
  };

  const handleSubmit = async (publish: boolean = false) => {
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!formData.slug.trim()) {
      toast.error("Slug is required");
      return;
    }
    if (!formData.content.trim()) {
      toast.error("Content is required");
      return;
    }
    if (!formData.excerpt.trim()) {
      toast.error("Excerpt is required");
      return;
    }
    if (!formData.category) {
      toast.error("Category is required");
      return;
    }

    try {
      const payload = {
        ...formData,
        isPublished: publish,
        metaTags: formData.metaTags
          ? formData.metaTags.split(",").map((tag: string) => tag.trim())
          : [],
      };

      await createBlog(payload).unwrap();
      toast.success(
        publish ? "Blog published successfully!" : "Blog saved as draft!"
      );
      router.push("/blog");
    } catch (err: any) {
      const errorMsg = err?.data?.message || "Failed to save blog";
      toast.error(errorMsg);
    }
  };

  if (!isAuthorized) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header Section */}
        <div className="mb-8 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <Button
              variant="light"
              startContent={<FaArrowLeft />}
              onPress={() => router.back()}
              className="mb-4 text-white/90 hover:bg-white/20"
            >
              Back to Blog
            </Button>
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-xl backdrop-blur-md">
                <FaPenNib className="text-3xl text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Create Blog Post</h1>
                <p className="text-blue-100 mt-1">Share your knowledge and insights with the community</p>
              </div>
            </div>
          </div>
          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 rounded-full bg-white opacity-10 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-40 h-40 rounded-full bg-white opacity-10 blur-2xl"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-md border border-gray-100">
              <CardBody className="p-6 space-y-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <FaHeading className="text-indigo-500" />
                  Blog Content
                </h2>

                <Input
                  label="Blog Title"
                  placeholder="Enter a catchy title..."
                  value={formData.title}
                  onValueChange={(value) => handleInputChange("title", value)}
                  required
                  variant="bordered"
                  size="lg"
                  classNames={{
                    input: "text-lg font-semibold",
                  }}
                />

                <Textarea
                  label="Excerpt"
                  placeholder="Brief summary used for previews (SEO friendly)..."
                  value={formData.excerpt}
                  onValueChange={(value) => handleInputChange("excerpt", value)}
                  required
                  variant="bordered"
                  minRows={3}
                  startContent={<FaAlignLeft className="text-gray-400 mt-1" />}
                />

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 ml-1">Full Content</label>
                  <div className="border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
                    <ReactQuill
                      value={formData.content}
                      onChange={(value) => handleInputChange("content", value)}
                      theme="snow"
                      className="bg-white min-h-[300px]"
                      modules={{
                        toolbar: [
                          [{ header: [1, 2, 3, false] }],
                          ["bold", "italic", "underline", "strike", "blockquote"],
                          [{ list: "ordered" }, { list: "bullet" }],
                          [{ color: [] }, { background: [] }],
                          ["link", "image", "video"],
                          ["clean"],
                        ],
                      }}
                    />
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-6">

            {/* Publishing Settings */}
            <Card className="shadow-md border border-gray-100">
              <CardBody className="p-6 space-y-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <FaGlobe className="text-blue-500" />
                  Publishing
                </h2>

                <Input
                  label="Slug (URL)"
                  placeholder="auto-generated-slug"
                  value={formData.slug}
                  onValueChange={(value) => handleInputChange("slug", value)}
                  variant="bordered"
                  description="Unique identifier for the URL."
                  startContent={<span className="text-gray-400 text-sm">/blog/</span>}
                />

                <div className="flex flex-col gap-3">
                  <Button
                    color="primary"
                    size="lg"
                    className="w-full font-bold shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600"
                    isLoading={isCreating}
                    startContent={<FaPaperPlane />}
                    onPress={() => handleSubmit(true)}
                  >
                    Publish Now
                  </Button>
                  <Button
                    variant="flat"
                    color="secondary"
                    size="lg"
                    className="w-full font-medium"
                    isLoading={isCreating}
                    startContent={<FaSave />}
                    onPress={() => handleSubmit(false)}
                  >
                    Save as Draft
                  </Button>
                </div>
              </CardBody>
            </Card>

            {/* Categorization */}
            <Card className="shadow-md border border-gray-100">
              <CardBody className="p-6 space-y-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <FaTags className="text-pink-500" />
                  Categorization
                </h2>

                <div className="flex gap-2 items-end">
                  <Select
                    label="Category"
                    placeholder={categoriesLoading ? "Loading..." : "Select Category"}
                    selectedKeys={formData.category ? [formData.category] : []}
                    onChange={(e) => handleInputChange("category", e.target.value)}
                    required
                    variant="bordered"
                    className="flex-1"
                    isLoading={categoriesLoading}
                  >
                    {categories.map((cat: any) => (
                      <SelectItem key={cat._id} value={cat._id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </Select>
                  <Button
                    isIconOnly
                    color="primary"
                    variant="flat"
                    onPress={onOpen}
                    className="min-h-[56px] min-w-[56px]"
                  >
                    <FaPlus />
                  </Button>
                </div>
              </CardBody>
            </Card>

            {/* Media & SEO */}
            <Card className="shadow-md border border-gray-100">
              <CardBody className="p-6 space-y-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <FaImage className="text-green-500" />
                  Media & SEO
                </h2>

                {formData.image ? (
                  <div className="w-full aspect-video rounded-xl overflow-hidden border border-gray-200 bg-gray-50 relative group">
                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs">
                      Featured Image Preview
                    </div>
                  </div>
                ) : (
                  <div className="w-full aspect-video rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center text-gray-400 gap-2">
                    <FaImage size={32} />
                    <span className="text-xs">No image provided</span>
                  </div>
                )}

                <Input
                  label="Featured Image URL"
                  placeholder="https://..."
                  value={formData.image}
                  onValueChange={(value) => handleInputChange("image", value)}
                  variant="bordered"
                  startContent={<FaImage className="text-gray-400" />}
                />

                <Input
                  label="Meta Tags"
                  placeholder="comma, separated, tags"
                  value={formData.metaTags}
                  onValueChange={(value) => handleInputChange("metaTags", value)}
                  variant="bordered"
                  startContent={<FaTags className="text-gray-400" />}
                  description="Keywords for SEO (comma separated)"
                />
              </CardBody>
            </Card>

          </div>
        </div>
      </div>

      {/* Create Category Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 text-xl font-bold">
                Create New Category
              </ModalHeader>
              <ModalBody>
                <Input
                  label="Category Name"
                  placeholder="e.g., Technology, Lifestyle"
                  value={newCategoryName}
                  onValueChange={setNewCategoryName}
                  required
                  variant="bordered"
                />
                <Textarea
                  label="Description (optional)"
                  placeholder="Brief description..."
                  value={newCategoryDesc}
                  onValueChange={setNewCategoryDesc}
                  minRows={2}
                  variant="bordered"
                />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  isLoading={isCreatingCategory}
                  onPress={handleCreateCategory}
                >
                  Create Category
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
