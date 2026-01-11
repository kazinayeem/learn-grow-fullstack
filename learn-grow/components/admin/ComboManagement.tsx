"use client";

import React, { useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Textarea,
  Select,
  SelectItem,
  Card,
  CardBody,
  CardHeader,
  Spinner,
  Switch,
  Divider,
  Badge,
  Tooltip,
  Pagination,
} from "@nextui-org/react";
import { useGetAllCombosQuery, useCreateComboMutation, useUpdateComboMutation, useDisableComboMutation, useToggleComboStatusMutation, useDeleteComboMutation } from "@/redux/api/comboApi";
import { useGetAllCoursesQuery } from "@/redux/api/courseApi";
import { getDurationLabel } from "@/lib/access-control";
import toast from "react-hot-toast";

interface ComboFormData {
  name: string;
  description: string;
  courseIds: string[];
  price: number;
  discountPrice: number | null;
  duration: "1-month" | "2-months" | "3-months" | "lifetime";
  thumbnail: string;
  featured: boolean;
}

export default function ComboManagement() {
  const [page, setPage] = useState(1);
  const { data: combosData, isLoading, refetch } = useGetAllCombosQuery({ page, limit: 10 });
  const [courseSearch, setCourseSearch] = useState("");
  const { data: coursesData } = useGetAllCoursesQuery({ page: 1, limit: 100, search: courseSearch || undefined });
  const [createCombo] = useCreateComboMutation();
  const [updateCombo] = useUpdateComboMutation();
  const [disableCombo] = useDisableComboMutation();
  const [toggleComboStatus] = useToggleComboStatusMutation();
  const [deleteCombo] = useDeleteComboMutation();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCombo, setSelectedCombo] = useState<any>(null);

  const [formData, setFormData] = useState<ComboFormData>({
    name: "",
    description: "",
    courseIds: [],
    price: 0,
    discountPrice: null,
    duration: "lifetime",
    thumbnail: "",
    featured: false,
  });

  const combos = combosData?.data || [];
  const totalPages = combosData?.pagination?.pages || 1;

  // Handle Create
  const handleCreateOpen = () => {
    setCourseSearch("");
    setFormData({
      name: "",
      description: "",
      courseIds: [],
      price: 0,
      discountPrice: null,
      duration: "lifetime",
      thumbnail: "",
      featured: false,
    });
    setIsCreateModalOpen(true);
  };

  const handleCreate = async () => {
    if (!formData.name.trim() || formData.courseIds.length === 0 || formData.price <= 0) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      await createCombo({
        ...formData,
        courses: formData.courseIds,
      }).unwrap();
      toast.success("Combo created successfully!");
      setIsCreateModalOpen(false);
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create combo");
    }
  };

  // Handle Edit
  const handleEditOpen = (combo: any) => {
    setCourseSearch("");
    setSelectedCombo(combo);
    setFormData({
      name: combo.name,
      description: combo.description,
      courseIds: combo.courses.map((c: any) => c._id || c),
      price: combo.price,
      discountPrice: combo.discountPrice || null,
      duration: combo.duration,
      thumbnail: combo.thumbnail || "",
      featured: combo.featured || false,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!formData.name.trim() || formData.courseIds.length === 0 || formData.price <= 0) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      await updateCombo({
        comboId: selectedCombo._id,
        data: {
          ...formData,
          courses: formData.courseIds,
        },
      }).unwrap();
      toast.success("Combo updated successfully!");
      setIsEditModalOpen(false);
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update combo");
    }
  };

  // Handle status toggle
  const handleToggleStatus = async (comboId: string, current: boolean) => {
    try {
      const result = await toggleComboStatus(comboId).unwrap();
      toast.success(result?.message || `Combo ${current ? "deactivated" : "activated"}!`);
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update status");
    }
  };

  // Handle Disable (soft)
  const handleDisable = async (comboId: string) => {
    try {
      await disableCombo(comboId).unwrap();
      toast.success("Combo disabled!");
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to disable combo");
    }
  };

  // Handle Delete (hard)
  const handleDelete = async (comboId: string) => {
    const confirmed = typeof window === "undefined" ? true : window.confirm("Delete this combo permanently? This cannot be undone.");
    if (!confirmed) return;

    try {
      await deleteCombo(comboId).unwrap();
      toast.success("Combo deleted permanently!");
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete combo");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" label="Loading combos..." />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Combo Management</h1>
          <p className="text-default-500 mt-1">Create and manage course combos</p>
        </div>
        <Button
          color="success"
          onClick={handleCreateOpen}
          className="font-semibold"
        >
          + Create Combo
        </Button>
      </div>

      {/* Combos Cards (responsive) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-5">
        {(combos || []).map((combo: any) => (
          <Card 
            key={combo._id}
            className="h-full flex flex-col transition-all duration-300 hover:shadow-lg hover:scale-105 border-1 border-gray-200"
          >
            {/* Header with price */}
            <CardHeader className="flex flex-col items-start pb-2 pt-4 px-4 gap-3">
              <div className="w-full flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-foreground text-sm sm:text-base line-clamp-2">{combo.name}</p>
                  {combo.description && (
                    <p className="text-xs sm:text-sm text-default-500 line-clamp-2 mt-1">{combo.description}</p>
                  )}
                </div>
              </div>
              <div className="w-full">
                <div className="flex items-baseline gap-1">
                  <span className="text-lg sm:text-xl font-bold text-primary">৳{combo.price.toLocaleString()}</span>
                  {combo.discountPrice && (
                    <span className="text-xs text-default-500 line-through">৳{combo.discountPrice.toLocaleString()}</span>
                  )}
                </div>
              </div>
            </CardHeader>

            <Divider className="my-0" />

            {/* Content */}
            <CardBody className="gap-3 py-3 px-4 flex-1">
              <div>
                <p className="text-xs font-semibold text-default-600 uppercase mb-2">Courses ({combo.courses?.length || 0})</p>
                <div className="flex flex-wrap gap-1">
                  {(combo.courses || []).slice(0, 3).map((course: any) => (
                    <Badge key={course?._id || course} variant="flat" color="primary" size="sm">
                      <span className="text-xs">{course?.title?.substring(0, 12) || "Course"}{course?.title?.length > 12 ? "..." : ""}</span>
                    </Badge>
                  ))}
                  {(combo.courses || []).length > 3 && (
                    <Badge variant="flat" color="default" size="sm">
                      <span className="text-xs">+{(combo.courses || []).length - 3} more</span>
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                <Badge color="primary" variant="flat" size="sm">
                  <span className="text-xs">{getDurationLabel(combo.duration)}</span>
                </Badge>
                {combo.featured && (
                  <Badge color="warning" variant="flat" size="sm">
                    <span className="text-xs">⭐ Featured</span>
                  </Badge>
                )}
                <Badge color={combo.isActive ? "success" : "danger"} variant="flat" size="sm">
                  <span className="text-xs">{combo.isActive ? "Active" : "Inactive"}</span>
                </Badge>
              </div>
            </CardBody>

            <Divider className="my-0" />

            {/* Actions - Grid for better spacing */}
            <CardBody className="p-3 gap-2">
              <div className="grid grid-cols-2 gap-2">
                <Tooltip content="Edit combo">
                  <Button
                    size="sm"
                    variant="flat"
                    color="primary"
                    onClick={() => handleEditOpen(combo)}
                    className="text-xs sm:text-sm font-medium"
                  >
                    Edit
                  </Button>
                </Tooltip>
                <Tooltip content={combo.isActive ? "Deactivate" : "Activate"}>
                  <Button
                    size="sm"
                    color={combo.isActive ? "warning" : "success"}
                    variant="flat"
                    onClick={() => handleToggleStatus(combo._id, combo.isActive)}
                    className="text-xs sm:text-sm font-medium"
                  >
                    {combo.isActive ? "Pause" : "Resume"}
                  </Button>
                </Tooltip>
                <Tooltip content="Soft disable">
                  <Button
                    size="sm"
                    color="danger"
                    variant="flat"
                    onClick={() => handleDisable(combo._id)}
                    className="text-xs sm:text-sm font-medium"
                  >
                    Disable
                  </Button>
                </Tooltip>
                <Tooltip content="Delete permanently">
                  <Button
                    size="sm"
                    color="danger"
                    variant="bordered"
                    onClick={() => handleDelete(combo._id)}
                    className="text-xs sm:text-sm font-medium"
                  >
                    Delete
                  </Button>
                </Tooltip>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            total={totalPages}
            page={page}
            onChange={setPage}
            color="primary"
          />
        </div>
      )}

      {/* Create Combo Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        size="2xl"
        isDismissable={false}
        isKeyboardDismissDisabled={true}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Create New Combo</ModalHeader>
              <Divider />
              <ModalBody className="gap-4">
                <Input
                  label="Combo Name"
                  placeholder="e.g., Python Mastery Bundle"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />

                <Textarea
                  label="Description"
                  placeholder="Describe the combo..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />

                <Input
                  label="Search Courses"
                  placeholder="Search by course title..."
                  value={courseSearch}
                  onChange={(e) => setCourseSearch(e.target.value)}
                  className="mb-2"
                />

                <Select
                  label="Select Courses (Required)"
                  placeholder="Choose courses for this combo"
                  selectedKeys={new Set(formData.courseIds)}
                  onSelectionChange={(keys) => {
                    setFormData({
                      ...formData,
                      courseIds: Array.from(keys) as string[],
                    });
                  }}
                  selectionMode="multiple"
                  isMultiline
                  classNames={{
                    listboxWrapper: "max-h-[200px]",
                  }}
                >
                  {(coursesData?.data || [])
                    .filter((course: any) =>
                      course.title.toLowerCase().includes(courseSearch.toLowerCase())
                    )
                    .map((course: any) => (
                      <SelectItem key={course._id} value={course._id}>
                        {course.title}
                      </SelectItem>
                    ))}
                </Select>

                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.courseIds.length === 0 && (
                    <p className="text-default-500 text-sm">No courses selected.</p>
                  )}
                  {formData.courseIds.map((id) => {
                    const course = (coursesData?.data || []).find((c: any) => c._id === id);
                    return (
                      <Badge key={id} variant="flat" color="primary" className="flex items-center gap-1">
                        {course?.title || "Selected"}
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              courseIds: formData.courseIds.filter((cid) => cid !== id),
                            })
                          }
                        >
                          ✖️
                        </Button>
                      </Badge>
                    );
                  })}
                </div>

                <Switch
                  checked={formData.featured}
                  onChange={(e) =>
                    setFormData({ ...formData, featured: e.target.checked })
                  }
                >
                  Featured Combo
                </Switch>

                <Input
                  label="Price (৳)"
                  type="number"
                  placeholder="0"
                  value={formData.price.toString()}
                  onChange={(e) =>
                    setFormData({ ...formData, price: parseFloat(e.target.value) })
                  }
                />

                <Input
                  label="Discount Price (৳)"
                  type="number"
                  placeholder="Leave empty for no discount"
                  value={formData.discountPrice?.toString() || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      discountPrice: e.target.value ? parseFloat(e.target.value) : null,
                    })
                  }
                />

                <Select
                  label="Duration"
                  selectedKeys={new Set([formData.duration])}
                  onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0] as any;
                    setFormData({
                      ...formData,
                      duration: value,
                    });
                  }}
                >
                  <SelectItem key="1-month" value="1-month">1 Month</SelectItem>
                  <SelectItem key="2-months" value="2-months">2 Months</SelectItem>
                  <SelectItem key="3-months" value="3-months">3 Months</SelectItem>
                  <SelectItem key="lifetime" value="lifetime">Lifetime</SelectItem>
                </Select>

                <Input
                  label="Thumbnail URL"
                  placeholder="https://..."
                  value={formData.thumbnail}
                  onChange={(e) =>
                    setFormData({ ...formData, thumbnail: e.target.value })
                  }
                />
              </ModalBody>
              <ModalFooter>
                <Button color="default" onClick={onClose}>
                  Cancel
                </Button>
                <Button color="success" onClick={handleCreate}>
                  Create Combo
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Edit Combo Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        size="2xl"
        isDismissable={false}
        isKeyboardDismissDisabled={true}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Edit Combo</ModalHeader>
              <Divider />
              <ModalBody className="gap-4">
                <Input
                  label="Combo Name"
                  placeholder="e.g., Python Mastery Bundle"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />

                <Textarea
                  label="Description"
                  placeholder="Describe the combo..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />

                <Input
                  label="Search Courses"
                  placeholder="Search by course title..."
                  value={courseSearch}
                  onChange={(e) => setCourseSearch(e.target.value)}
                  className="mb-2"
                />

                <Select
                  label="Select Courses (Required)"
                  placeholder="Choose courses for this combo"
                  selectedKeys={new Set(formData.courseIds)}
                  onSelectionChange={(keys) => {
                    setFormData({
                      ...formData,
                      courseIds: Array.from(keys) as string[],
                    });
                  }}
                  selectionMode="multiple"
                  isMultiline
                  classNames={{
                    listboxWrapper: "max-h-[200px]",
                  }}
                >
                  {(coursesData?.data || [])
                    .filter((course: any) =>
                      course.title.toLowerCase().includes(courseSearch.toLowerCase())
                    )
                    .map((course: any) => (
                      <SelectItem key={course._id} value={course._id}>
                        {course.title}
                      </SelectItem>
                    ))}
                </Select>

                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.courseIds.length === 0 && (
                    <p className="text-default-500 text-sm">No courses selected.</p>
                  )}
                  {formData.courseIds.map((id) => {
                    const course = (coursesData?.data || []).find((c: any) => c._id === id);
                    return (
                      <Badge key={id} variant="flat" color="primary" className="flex items-center gap-1">
                        {course?.title || "Selected"}
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              courseIds: formData.courseIds.filter((cid) => cid !== id),
                            })
                          }
                        >
                          ✖️
                        </Button>
                      </Badge>
                    );
                  })}
                </div>

                <Switch
                  checked={formData.featured}
                  onChange={(e) =>
                    setFormData({ ...formData, featured: e.target.checked })
                  }
                >
                  Featured Combo
                </Switch>

                <Input
                  label="Price (৳)"
                  type="number"
                  placeholder="0"
                  value={formData.price.toString()}
                  onChange={(e) =>
                    setFormData({ ...formData, price: parseFloat(e.target.value) })
                  }
                />

                <Input
                  label="Discount Price (৳)"
                  type="number"
                  placeholder="Leave empty for no discount"
                  value={formData.discountPrice?.toString() || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      discountPrice: e.target.value ? parseFloat(e.target.value) : null,
                    })
                  }
                />

                <Select
                  label="Duration"
                  selectedKeys={new Set([formData.duration])}
                  onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0] as any;
                    setFormData({
                      ...formData,
                      duration: value,
                    });
                  }}
                >
                  <SelectItem key="1-month" value="1-month">1 Month</SelectItem>
                  <SelectItem key="2-months" value="2-months">2 Months</SelectItem>
                  <SelectItem key="3-months" value="3-months">3 Months</SelectItem>
                  <SelectItem key="lifetime" value="lifetime">Lifetime</SelectItem>
                </Select>

                <Input
                  label="Thumbnail URL"
                  placeholder="https://..."
                  value={formData.thumbnail}
                  onChange={(e) =>
                    setFormData({ ...formData, thumbnail: e.target.value })
                  }
                />
              </ModalBody>
              <ModalFooter>
                <Button color="default" onClick={onClose}>
                  Cancel
                </Button>
                <Button color="primary" onClick={handleUpdate}>
                  Update Combo
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
