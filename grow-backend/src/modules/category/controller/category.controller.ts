import { Request, Response } from "express";
import * as service from "../service/category.service";

export const createCategory = async (req: Request, res: Response) => {
  const category = await service.createCategory(req.body);
  res.status(201).json(category);
};

export const getAllCategories = async (_: Request, res: Response) => {
  const categories = await service.getAllCategories();
  res.json(categories);
};

export const getCategoryById = async (req: Request, res: Response) => {
  const category = await service.getCategoryById(req.params.id);
  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }
  res.json(category);
};

export const updateCategory = async (req: Request, res: Response) => {
  const category = await service.updateCategory(req.params.id, req.body);
  res.json(category);
};

export const deleteCategory = async (req: Request, res: Response) => {
  await service.deleteCategory(req.params.id);
  res.json({ message: "Category deleted" });
};
