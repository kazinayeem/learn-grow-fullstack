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
import { useGetAllCombosQuery, useCreateComboMutation, useUpdateComboMutation, useDisableComboMutation } from "@/redux/api/comboApi";
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

  // Handle Disable
  const handleDisable = async (comboId: string) => {
    try {
      await disableCombo(comboId).unwrap();
      toast.success("Combo disabled!");
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to disable combo");
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

      {/* Combos Table (desktop) */}
      <Card className="hidden md:block">
        <CardBody className="p-0 overflow-x-auto">
          <Table aria-label="Combos table">
            <TableHeader>
              <TableColumn>NAME</TableColumn>
              <TableColumn>COURSES</TableColumn>
              <TableColumn>PRICE</TableColumn>
              <TableColumn>DURATION</TableColumn>
              <TableColumn>FEATURED</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody>
              {combos.map((combo: any) => (
                <TableRow key={combo._id}>
                  <TableCell>
                    <div>
                      <p className="font-semibold text-foreground">{combo.name}</p>
                      {combo.description && (
                        <p className="text-sm text-default-500 truncate">
                          {combo.description}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-[320px]">
                      {(combo.courses || []).map((course: any) => (
                        <Badge key={course?._id || course} variant="flat" color="primary">
                          {course?.title || "Course"}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-semibold">৳{combo.price.toLocaleString()}</p>
                      {combo.discountPrice && (
                        <p className="text-sm text-default-500">
                          ৳{combo.discountPrice.toLocaleString()} sale
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge color="primary" variant="flat">
                      {getDurationLabel(combo.duration)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge color={combo.featured ? "warning" : "default"} variant="flat">
                      {combo.featured ? "⭐ Yes" : "No"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge color={combo.isActive ? "success" : "danger"}>
                      {combo.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Tooltip content="Edit combo">
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          onClick={() => handleEditOpen(combo)}
                        >
                          ✏️
                        </Button>
                      </Tooltip>
                      {combo.isActive && (
                        <Tooltip content="Disable combo">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            color="danger"
                            onClick={() => handleDisable(combo._id)}
                          >
                            🚫
                          </Button>
                        </Tooltip>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* Combos Cards (mobile) */}
      <div className="grid gap-4 md:hidden">
        {(combos || []).map((combo: any) => (
          <Card key={combo._id}>
            <CardHeader className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-foreground">{combo.name}</p>
                {combo.description && (
                  <p className="text-sm text-default-500">{combo.description}</p>
                )}
              </div>
              <div className="text-right">
                <p className="font-semibold">৳{combo.price.toLocaleString()}</p>
                {combo.discountPrice && (
                  <p className="text-sm text-default-500">৳{combo.discountPrice.toLocaleString()} sale</p>
                )}
              </div>
            </CardHeader>
            <Divider />
            <CardBody className="gap-2">
              <div>
                <p className="text-sm font-medium text-default-600">Courses</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {(combo.courses || []).map((course: any) => (
                    <Badge key={course?._id || course} variant="flat" color="primary">
                      {course?.title || "Course"}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge color="primary" variant="flat">{getDurationLabel(combo.duration)}</Badge>
                <Badge color={combo.featured ? "warning" : "default"} variant="flat">
                  {combo.featured ? "⭐ Featured" : "Not Featured"}
                </Badge>
                <Badge color={combo.isActive ? "success" : "danger"}>
                  {combo.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardBody>
            <Divider />
            <CardBody>
              <div className="flex gap-2">
                <Button size="sm" variant="flat" onClick={() => handleEditOpen(combo)}>Edit</Button>
                {combo.isActive && (
                  <Button size="sm" color="danger" variant="flat" onClick={() => handleDisable(combo._id)}>Disable</Button>
                )}
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
