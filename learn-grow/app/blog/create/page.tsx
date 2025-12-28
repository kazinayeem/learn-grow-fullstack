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
  Chip,
  Spinner,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
  useCreateBlogMutation,
  useGetAllBlogCategoriesQuery,
} from "@/redux/api/blogApi";
import { toast } from "react-toastify";
import { FaArrowLeft } from "react-icons/fa";

export default function CreateBlogPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    category: "",
    metaTags: "" as any,
    image: "",
    isPublished: false,
  });

  const { data: categoriesResponse } = useGetAllBlogCategoriesQuery();
  const [createBlog, { isLoading: isCreating }] = useCreateBlogMutation();

  const categories = categoriesResponse?.data || [];

  // Check authorization
  useEffect(() => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        if (["student", "instructor", "admin"].includes(user.role)) {
          setIsAuthorized(true);
        }
      }
    } catch (e) {
      console.error("Auth check failed");
    }

    if (!isAuthorized) {
      router.replace("/login");
    }
  }, [isAuthorized, router]);

  const handleInputChange = (
    field: string,
    value: any
  ) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent, publish: boolean = false) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Title is required");
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
      const errorMsg =
        err?.data?.message || "Failed to save blog";
      toast.error(errorMsg);
    }
  };

  if (!isAuthorized) {
    return null;
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

        <Card className="mb-8">
          <CardBody className="p-8">
            <h1 className="text-3xl font-bold mb-2">Create Blog Post</h1>
            <p className="text-gray-600 mb-6">
              Share your knowledge with the community
            </p>

            <form className="space-y-6">
              {/* Title */}
              <Input
                label="Blog Title"
                placeholder="Enter blog title"
                value={formData.title}
                onValueChange={(value) =>
                  handleInputChange("title", value)
                }
                required
                minLength={5}
                maxLength={200}
              />

              {/* Category */}
              <Select
                label="Category"
                placeholder="Select a category"
                selectedKeys={formData.category ? [formData.category] : []}
                onChange={(e) => handleInputChange("category", e.target.value)}
                required
              >
                {categories.map((cat: any) => (
                  <SelectItem key={cat._id} value={cat._id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </Select>

              {/* Excerpt */}
              <Textarea
                label="Excerpt"
                placeholder="Brief summary of your blog"
                value={formData.excerpt}
                onValueChange={(value) =>
                  handleInputChange("excerpt", value)
                }
                required
                minLength={10}
                maxLength={500}
                rows={3}
              />

              {/* Content Editor */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Content
                </label>
                <ReactQuill
                  value={formData.content}
                  onChange={(value) => handleInputChange("content", value)}
                  modules={{
                    toolbar: [
                      [{ header: [1, 2, 3, false] }],
                      ["bold", "italic", "underline", "strike"],
                      ["blockquote", "code-block"],
                      [{ list: "ordered" }, { list: "bullet" }],
                      [{ script: "sub" }, { script: "super" }],
                      [{ indent: "-1" }, { indent: "+1" }],
                      ["link", "image", "video"],
                      ["clean"],
                    ],
                  }}
                  theme="snow"
                  className="bg-white rounded-lg"
                />
              </div>

              {/* Featured Image URL */}
              <Input
                label="Featured Image URL"
                placeholder="https://example.com/image.jpg"
                value={formData.image}
                onValueChange={(value) =>
                  handleInputChange("image", value)
                }
              />

              {/* Meta Tags */}
              <Input
                label="Meta Tags"
                placeholder="tag1, tag2, tag3 (comma separated)"
                value={formData.metaTags}
                onValueChange={(value) =>
                  handleInputChange("metaTags", value)
                }
              />

              {/* Buttons */}
              <div className="flex gap-4 pt-4">
                <Button
                  color="primary"
                  size="lg"
                  isLoading={isCreating}
                  onPress={(e) => handleSubmit(e as any, true)}
                >
                  Publish Now
                </Button>
                <Button
                  variant="bordered"
                  size="lg"
                  isLoading={isCreating}
                  onPress={(e) => handleSubmit(e as any, false)}
                >
                  Save as Draft
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
