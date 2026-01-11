"use client";

import React, { useState } from "react";
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Textarea,
  Spinner,
  Switch,
  Divider,
  Badge,
  Tooltip,
  Pagination,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Card,
  CardBody,
} from "@nextui-org/react";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaEllipsisV,
  FaSearch,
  FaBoxOpen,
  FaBook,
  FaStar,
  FaClock,
  FaPause,
  FaPlay,
  FaBan,
  FaExclamationTriangle,
  FaChevronRight,
} from "react-icons/fa";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  
  const { data: combosData, isLoading, refetch } = useGetAllCombosQuery({ page, limit: 12 });
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
  const activeCombos = combos.filter((c: any) => c.isActive).length;

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

  // Handle Delete
  const handleDelete = async (comboId: string) => {
    try {
      await deleteCombo(comboId).unwrap();
      toast.success("Combo deleted permanently!");
      setDeleteConfirm(null);
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete combo");
    }
  };

  // Filter combos
  const filteredCombos = combos.filter((combo: any) => {
    const matchesSearch = combo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         combo.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || 
                         (statusFilter === "active" && combo.isActive) ||
                         (statusFilter === "inactive" && !combo.isActive);
    return matchesSearch && matchesStatus;
  });

  // Status badge component
  const StatusBadge = ({ isActive }: { isActive: boolean }) => (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap
      ${isActive 
        ? 'bg-green-100 text-green-700' 
        : 'bg-red-100 text-red-700'}`}>
      <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-red-500'}`} />
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );

  // Combo card component
  const ComboCard = ({ combo }: { combo: any }) => {
    const discountPercent = combo.discountPrice ? Math.round((1 - combo.discountPrice / combo.price) * 100) : 0;
    
    return (
      <div className="group h-full flex flex-col bg-white rounded-xl shadow-sm hover:shadow-lg 
                      border border-gray-200 overflow-hidden transition-all duration-300 hover:-translate-y-1">
        
        {/* Header Section */}
        <div className="p-5 md:p-6 pb-4 flex-shrink-0">
          <div className="flex items-start justify-between gap-3 mb-3">
            <h3 className="text-base md:text-lg font-bold text-gray-900 line-clamp-2 flex-1">
              {combo.name}
            </h3>
            <StatusBadge isActive={combo.isActive} />
          </div>
          <p className="text-sm text-gray-600 line-clamp-2">{combo.description}</p>
        </div>

        <div className="border-t border-gray-100" />

        {/* Pricing Section */}
        <div className="px-5 md:px-6 py-4 bg-gradient-to-b from-green-50/30 to-transparent">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl md:text-4xl font-black text-green-600">
              ৳{(combo.discountPrice || combo.price).toLocaleString()}
            </span>
            {combo.discountPrice && (
              <span className="text-sm text-gray-500 line-through">
                ৳{combo.price.toLocaleString()}
              </span>
            )}
          </div>
          {combo.discountPrice && (
            <p className="text-xs font-medium text-green-700">
              Save ৳{(combo.price - combo.discountPrice).toLocaleString()} ({discountPercent}% off)
            </p>
          )}
        </div>

        <div className="border-t border-gray-100" />

        {/* Course Info */}
        <div className="px-5 md:px-6 py-4 flex-1">
          <p className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <FaBook className="text-blue-500" size={14} />
            {combo.courses.length} Courses Included
          </p>
          <div className="flex flex-wrap gap-2">
            {combo.courses.slice(0, 2).map((course: any) => (
              <span 
                key={course._id}
                className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-lg truncate max-w-[120px]"
              >
                {course?.title?.substring(0, 15) || "Course"}...
              </span>
            ))}
            {combo.courses.length > 2 && (
              <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg">
                +{combo.courses.length - 2} more
              </span>
            )}
          </div>
        </div>

        <div className="border-t border-gray-100" />

        {/* Metadata */}
        <div className="px-5 md:px-6 py-3 flex flex-wrap gap-4 text-xs text-gray-600">
          <span className="flex items-center gap-1">
            <FaClock size={12} />
            {getDurationLabel(combo.duration)}
          </span>
          {combo.featured && (
            <span className="flex items-center gap-1 text-amber-600 font-medium">
              <FaStar size={12} /> Featured
            </span>
          )}
        </div>

        <div className="border-t border-gray-100" />

        {/* Actions */}
        <div className="mt-auto p-5 md:p-6 pt-4 flex gap-2">
          <Button
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm"
            size="sm"
            startContent={<FaEdit size={14} />}
            onClick={() => handleEditOpen(combo)}
          >
            Edit
          </Button>
          <Dropdown>
            <DropdownTrigger>
              <Button
                isIconOnly
                variant="bordered"
                size="sm"
                className="border-gray-300 hover:bg-gray-50"
              >
                <FaEllipsisV size={14} />
              </Button>
            </DropdownTrigger>
            <DropdownMenu 
              aria-label="Combo actions"
              className="w-40"
            >
              <DropdownItem
                key="toggle"
                startContent={combo.isActive ? <FaPause size={14} /> : <FaPlay size={14} />}
                onClick={() => handleToggleStatus(combo._id, combo.isActive)}
              >
                {combo.isActive ? 'Pause' : 'Resume'}
              </DropdownItem>
              <DropdownItem
                key="disable"
                startContent={<FaBan size={14} />}
                color="warning"
                className="text-warning"
                onClick={() => handleDisable(combo._id)}
              >
                Disable
              </DropdownItem>
              <DropdownItem
                key="delete"
                startContent={<FaTrash size={14} />}
                color="danger"
                className="text-danger"
                onClick={() => setDeleteConfirm(combo._id)}
              >
                Delete
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>
    );
  };

  const handleDisable = async (comboId: string) => {
    try {
      await disableCombo(comboId).unwrap();
      toast.success("Combo disabled!");
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to disable combo");
    }
  };

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      {/* Sticky Top Action Bar */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
            {/* Search */}
            <Input
              isClearable
              className="sm:col-span-2"
              placeholder="Search combos by name..."
              startContent={<FaSearch className="text-default-400" />}
              value={searchQuery}
              onValueChange={setSearchQuery}
              size="lg"
              classNames={{
                input: "text-sm",
                inputWrapper: "border-2 border-gray-200 hover:border-primary-400",
              }}
            />

            {/* Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 rounded-lg border-2 border-gray-200 hover:border-primary-400 
                        focus:border-primary-500 focus:outline-none transition-colors bg-white text-sm font-medium"
            >
              <option value="">All Status</option>
              <option value="active">🟢 Active</option>
              <option value="inactive">🔴 Inactive</option>
            </select>

            {/* Create Button */}
            <Button
              color="success"
              startContent={<FaPlus />}
              onClick={handleCreateOpen}
              size="lg"
              className="lg:col-span-1 sm:col-span-2 font-semibold"
            >
              + Create Combo
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Page Header with Stats */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center gap-3 mb-2">
                <FaBoxOpen className="text-green-600" size={32} />
                Combo Management
              </h1>
              <p className="text-gray-600">Create and manage course bundles for your platform</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Card className="bg-gradient-to-br from-green-50 to-green-100 shadow-none">
                <CardBody className="p-4">
                  <p className="text-xs text-gray-600 font-medium">Active Combos</p>
                  <p className="text-3xl font-black text-green-700 mt-1">{activeCombos}</p>
                </CardBody>
              </Card>
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 shadow-none">
                <CardBody className="p-4">
                  <p className="text-xs text-gray-600 font-medium">Total Combos</p>
                  <p className="text-3xl font-black text-blue-700 mt-1">{combos.length}</p>
                </CardBody>
              </Card>
            </div>
          </div>
        </div>

        {/* Combos Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4" />
                <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                <div className="h-4 bg-gray-200 rounded w-5/6 mb-6" />
                <div className="flex gap-2">
                  <div className="h-10 bg-gray-200 rounded flex-1" />
                  <div className="h-10 bg-gray-200 rounded w-10" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredCombos.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16">
            <FaBoxOpen className="text-6xl text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-900">No combos found</h3>
            <p className="text-gray-600 mt-2">Create your first combo to get started</p>
            <Button 
              className="mt-6 bg-green-600 hover:bg-green-700 text-white font-semibold"
              startContent={<FaPlus />}
              onClick={handleCreateOpen}
            >
              Create Your First Combo
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
              {filteredCombos.map((combo: any) => (
                <ComboCard key={combo._id} combo={combo} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center">
                <Pagination
                  total={totalPages}
                  page={page}
                  onChange={setPage}
                  color="success"
                  size="lg"
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={!!deleteConfirm} 
        onOpenChange={() => setDeleteConfirm(null)}
        backdrop="blur"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex items-center gap-2 text-danger">
                <FaExclamationTriangle size={20} />
                Delete Combo
              </ModalHeader>
              <ModalBody>
                <p className="text-gray-700">Are you sure you want to permanently delete this combo?</p>
                <p className="text-sm text-gray-600">
                  This action cannot be undone. All student enrollments will be affected.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button 
                  color="danger" 
                  onPress={() => deleteConfirm && handleDelete(deleteConfirm)}
                >
                  Delete Combo
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Create/Edit Combo Modal */}
      <Modal
        isOpen={isCreateModalOpen || isEditModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateModalOpen(false);
            setIsEditModalOpen(false);
          }
        }}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {isEditModalOpen ? "Edit Combo" : "Create New Combo"}
              </ModalHeader>
              <Divider />
              <ModalBody className="gap-4">
                <Input
                  label="Combo Name"
                  placeholder="e.g., Python Mastery Bundle"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  variant="bordered"
                  size="lg"
                />

                <Textarea
                  label="Description"
                  placeholder="Describe the combo..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  variant="bordered"
                  minRows={3}
                />

                <Input
                  label="Search Courses"
                  placeholder="Search by course title..."
                  value={courseSearch}
                  onChange={(e) => setCourseSearch(e.target.value)}
                  variant="bordered"
                  size="lg"
                />

                <div>
                  <label className="text-sm font-semibold mb-2 block">Select Courses (Required)</label>
                  <div className="max-h-[200px] overflow-y-auto border border-gray-200 rounded-lg p-3 space-y-2">
                    {(coursesData?.data || [])
                      .filter((course: any) =>
                        course.title.toLowerCase().includes(courseSearch.toLowerCase())
                      )
                      .map((course: any) => (
                        <label key={course._id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.courseIds.includes(course._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  courseIds: [...formData.courseIds, course._id],
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  courseIds: formData.courseIds.filter(id => id !== course._id),
                                });
                              }
                            }}
                            className="rounded"
                          />
                          <span className="text-sm text-gray-700">{course.title}</span>
                        </label>
                      ))}
                  </div>
                  {formData.courseIds.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {formData.courseIds.map((id) => {
                        const course = (coursesData?.data || []).find((c: any) => c._id === id);
                        return (
                          <Badge key={id} className="bg-blue-100 text-blue-700">
                            {course?.title || "Selected"}
                            <button
                              className="ml-2 font-bold"
                              onClick={() =>
                                setFormData({
                                  ...formData,
                                  courseIds: formData.courseIds.filter(cid => cid !== id),
                                })
                              }
                            >
                              ✕
                            </button>
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Price (৳)"
                    type="number"
                    placeholder="0"
                    value={formData.price.toString()}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    variant="bordered"
                    size="lg"
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
                    variant="bordered"
                    size="lg"
                  />
                </div>

                <select
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value as any })}
                  className="px-4 py-3 rounded-lg border-2 border-gray-200 hover:border-primary-400 focus:border-primary-500 focus:outline-none transition-colors bg-white text-sm font-medium"
                >
                  <option value="1-month">1 Month</option>
                  <option value="2-months">2 Months</option>
                  <option value="3-months">3 Months</option>
                  <option value="lifetime">Lifetime</option>
                </select>

                <Input
                  label="Thumbnail URL"
                  placeholder="https://..."
                  value={formData.thumbnail}
                  onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                  variant="bordered"
                  size="lg"
                />

                <Switch
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                >
                  Featured Combo
                </Switch>
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button 
                  color="success" 
                  onClick={isEditModalOpen ? handleUpdate : handleCreate}
                >
                  {isEditModalOpen ? "Update Combo" : "Create Combo"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
