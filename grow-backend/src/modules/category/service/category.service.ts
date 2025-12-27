import slugify from "slugify";
import { Category } from "../model/category.model";

export const createCategory = async (data: any) => {
  const slug = slugify(data.name, { lower: true });
  return Category.create({ ...data, slug });
};

export const getAllCategories = () => {
  return Category.find().sort({ createdAt: -1 });
};

export const getCategoryById = (id: string) => {
  return Category.findById(id);
};

export const updateCategory = async (id: string, data: any) => {
  if (data.name) {
    data.slug = slugify(data.name, { lower: true });
  }
  return Category.findByIdAndUpdate(id, data, { new: true });
};

export const deleteCategory = (id: string) => {
  return Category.findByIdAndDelete(id);
};
