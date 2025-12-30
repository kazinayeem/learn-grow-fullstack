"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Card,
  CardBody,
  Input,
  Button,
  Spinner,
  Select,
  SelectItem,
  Textarea,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react";
import dynamic from "next/dynamic";
import { 
  useGetBlogBySlugQuery, 
  useUpdateBlogMutation, 
  useGetAllBlogsQuery,
  useCreateBlogCategoryMutation,
  useGetAllBlogCategoriesQuery,
} from "@/redux/api/blogApi";
import { toast } from "react-toastify";
import { FaArrowLeft, FaPlus } from "react-icons/fa";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });
import "react-quill-new/dist/quill.snow.css";

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ color: [] }, { background: [] }],
    ["blockquote", "code-block"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ script: "sub" }, { script: "super" }],
    [{ indent: "-1" }, { indent: "+1" }],
    ["link", "image", "video"],
    ["clean"],
  ],
};

export default function EditBlogPage() {
  const router = useRouter();
  const params = useParams();
  const blogSlug = params?.slug as string;

  const [isAuthorized, setIsAuthorized] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDesc, setNewCategoryDesc] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    image: "",
    categoryId: "",
    metaTags: "",
    isPublished: true,
  });
  const [categories, setCategories] = useState<any[]>([]);

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

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (["student", "instructor", "admin"].includes(user.role)) {
          setUserId(user._id || user.id);
          setUserRole(user.role);
          setIsAuthorized(true);
          return;
        }
      } catch (e) {
        console.error("Auth check failed");
      }
    }
    router.replace("/login");
  }, [router]);

  const { data: blogResponse, isLoading: isBlogLoading } = useGetBlogBySlugQuery(
    blogSlug,
    { skip: !blogSlug || !isAuthorized }
  );

  const { data: categoriesResponse, refetch: refetchCategories } = useGetAllBlogCategoriesQuery(undefined, {
    skip: !isAuthorized
  });

  const [updateBlog, { isLoading: isUpdating }] = useUpdateBlogMutation();
  const [createCategory, { isLoading: isCreatingCategory }] = useCreateBlogCategoryMutation();

  useEffect(() => {
    if (blogResponse?.data) {
      const blog = blogResponse.data;
      
      // Check ownership (allow admin or blog owner)
      const isOwner = blog.author._id === userId || blog.author.id === userId;
      const isAdmin = userRole === "admin";
      
      if (!isOwner && !isAdmin) {
        toast.error("You can only edit your own blogs");
        router.push("/blog");
        return;
      }

      setFormData({
        title: blog.title || "",
        slug: blog.slug || "",
        excerpt: blog.excerpt || "",
        content: blog.content || "",
        image: blog.image || "",
        categoryId: blog.category?._id || "",
        metaTags: blog.metaTags?.join(", ") || "",
        isPublished: blog.isPublished ?? true,
      });
      
      // Set editor ready after data is loaded
      setTimeout(() => setIsEditorReady(true), 100);
    }
  }, [blogResponse, userId, userRole, router]);

  useEffect(() => {
    // Set categories directly from response
    if (categoriesResponse?.data) {
      setCategories(categoriesResponse.data);
    }
  }, [categoriesResponse]);

  const handleInputChange = (field: string, value: any) => {
    const newData = { ...formData, [field]: value };
    // Auto-generate slug from title when title changes
    if (field === "title") {
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

  const handleSubmit = async () => {
    try {
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

      await updateBlog({
        id: blogSlug,
        title: formData.title,
        slug: formData.slug,
        excerpt: formData.excerpt,
        content: formData.content,
        image: formData.image,
        categoryId: formData.categoryId,
        metaTags: formData.metaTags
          .split(",")
          .map((tag: string) => tag.trim())
          .filter(Boolean),
        isPublished: formData.isPublished,
      }).unwrap();

      toast.success("Blog updated successfully!");
      router.push("/instructor/blogs");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update blog");
    }
  };

  if (!isAuthorized) {
    return null;
  }

  if (isBlogLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" label="Loading..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto max-w-4xl px-6">
        <Button
          variant="light"
          startContent={<FaArrowLeft />}
          onPress={() => router.back()}
          className="mb-6"
        >
          Back
        </Button>

        <Card>
          <CardBody className="p-8">
            <h1 className="text-3xl font-bold mb-8">Edit Blog Post</h1>

            <div className="space-y-6">
              {/* Title */}
              <div>
                <Input
                  label="Blog Title"
                  placeholder="Enter blog title"
                  value={formData.title}
                  onValueChange={(value) =>
                    handleInputChange("title", value)
                  }
                  size="lg"
                  className="w-full"
                />
              </div>

              {/* Slug */}
              <div>
                <Input
                  label="Blog Slug (URL)"
                  placeholder="auto-generated-from-title"
                  value={formData.slug}
                  onValueChange={(value) =>
                    handleInputChange("slug", value)
                  }
                  description="Unique URL-friendly identifier. Auto-generated from title but can be manually edited."
                  helperText="Use only lowercase letters, numbers, and hyphens"
                />
              </div>

              {/* Excerpt */}
              <div>
                <Textarea
                  label="Excerpt (Summary)"
                  placeholder="Brief summary of your blog post"
                  value={formData.excerpt}
                  onValueChange={(value) =>
                    handleInputChange("excerpt", value)
                  }
                  minRows={2}
                  className="w-full"
                />
              </div>

              {/* Category */}
              <div>
                <div className="flex gap-2">
                  <Select
                    label="Category"
                    selectedKeys={formData.categoryId ? [formData.categoryId] : []}
                    onChange={(e) => handleInputChange("categoryId", e.target.value)}
                    className="flex-1"
                  >
                    {categories.map((cat) => (
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
                    className="mt-6"
                    title="Add new category"
                  >
                    <FaPlus />
                  </Button>
                </div>
              </div>

              {/* Featured Image URL */}
              <div>
                <Input
                  label="Featured Image URL"
                  placeholder="https://example.com/image.jpg"
                  value={formData.image}
                  onValueChange={(value) =>
                    handleInputChange("image", value)
                  }
                  className="w-full"
                />
                {formData.image && (
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="mt-4 max-h-48 rounded-lg"
                  />
                )}
              </div>

              {/* Meta Tags */}
              <div>
                <Input
                  label="Meta Tags (comma-separated)"
                  placeholder="tag1, tag2, tag3"
                  value={formData.metaTags}
                  onValueChange={(value) =>
                    handleInputChange("metaTags", value)
                  }
                  className="w-full"
                />
              </div>

              {/* Rich Text Editor */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Content
                </label>
                {isEditorReady ? (
                  <div className="border rounded-lg overflow-hidden">
                    <ReactQuill
                      theme="snow"
                      value={formData.content}
                      onChange={(value) => handleInputChange("content", value)}
                      modules={modules}
                      style={{ minHeight: "300px" }}
                    />
                  </div>
                ) : (
                  <div className="border rounded-lg p-8 text-center bg-gray-50">
                    <Spinner size="sm" />
                    <p className="text-sm text-gray-500 mt-2">Loading editor...</p>
                  </div>
                )}
              </div>

              {/* Publish Toggle */}
              <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={formData.isPublished}
                  onChange={(e) =>
                    handleInputChange("isPublished", e.target.checked)
                  }
                  className="w-4 h-4 rounded"
                />
                <label htmlFor="isPublished" className="text-sm font-medium">
                  Publish this post (unchecked = save as draft)
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t">
                <Button
                  color="default"
                  variant="bordered"
                  onPress={() => router.back()}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  color="primary"
                  isLoading={isUpdating}
                  onPress={handleSubmit}
                  className="flex-1"
                >
                  Update Blog
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Create Category Modal */}
        <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  Create New Category
                </ModalHeader>
                <ModalBody>
                  <Input
                    label="Category Name"
                    placeholder="Enter category name"
                    value={newCategoryName}
                    onValueChange={setNewCategoryName}
                    required
                  />
                  <Textarea
                    label="Description"
                    placeholder="Enter category description (optional)"
                    value={newCategoryDesc}
                    onValueChange={setNewCategoryDesc}
                    minRows={2}
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
                    Create
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </div>
    </div>
  );
}
