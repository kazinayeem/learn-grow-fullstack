"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Textarea,
  Select,
  SelectItem,
  Divider,
  Skeleton,
} from "@nextui-org/react";
import {
  FaArrowLeft,
  FaSave,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaGraduationCap,
  FaCalendar,
  FaLock,
} from "react-icons/fa";
import { useGetUserByIdQuery } from "@/redux/api/userApi";
import axios from "axios";
import { API_CONFIG } from "@/config/apiConfig";
import Cookies from "js-cookie";
import { toast } from "react-toastify";

export default function AdminStudentEditPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as string;

  const { data, isLoading, error } = useGetUserByIdQuery(studentId);
  const student = data?.data;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    institution: "",
    educationLevel: "",
    address: "",
    city: "",
    dateOfBirth: "",
    gender: "",
    bloodGroup: "",
    emergencyContact: "",
    emergencyContactName: "",
    guardianName: "",
    guardianPhone: "",
    guardianEmail: "",
    isVerified: false,
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name || "",
        email: student.email || "",
        phone: student.phone || "",
        institution: student.institution || "",
        educationLevel: student.educationLevel || "",
        address: student.address || "",
        city: student.city || "",
        dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth).toISOString().split('T')[0] : "",
        gender: student.gender || "",
        bloodGroup: student.bloodGroup || "",
        emergencyContact: student.emergencyContact || "",
        emergencyContactName: student.emergencyContactName || "",
        guardianName: student.guardianName || "",
        guardianPhone: student.guardianPhone || "",
        guardianEmail: student.guardianEmail || "",
        isVerified: student.isVerified || false,
      });
    }
  }, [student]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      const token = Cookies.get("accessToken");
      
      await axios.patch(
        `${API_CONFIG.BASE_URL}/users/${studentId}`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Student information updated successfully");
      router.push(`/admin/students/${studentId}`);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update student")
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 container mx-auto px-4 py-8 max-w-4xl">
        <Skeleton className="h-12 w-48 mb-8 rounded-lg" />
        <Card>
          <CardBody className="space-y-4">
            {[...Array(10)].map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </CardBody>
        </Card>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="min-h-screen bg-gray-50 container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardBody className="p-12 text-center">
            <FaUser className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Student not found</h3>
            <p className="text-gray-600 mb-6">
              The student you're looking for doesn't exist.
            </p>
            <Button color="primary" onPress={() => router.push("/admin/students")}>
              Back to Students
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button
            startContent={<FaArrowLeft />}
            variant="light"
            onPress={() => router.push(`/admin/students/${studentId}`)}
          >
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Student Profile</h1>
            <p className="text-sm text-gray-600">Update student information</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FaUser className="text-blue-600" />
                <h2 className="text-lg font-semibold">Basic Information</h2>
              </div>
            </CardHeader>
            <Divider />
            <CardBody className="space-y-4">
              <Input
                label="Full Name"
                placeholder="Enter student's full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                startContent={<FaUser className="text-gray-400" />}
                isRequired
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  type="email"
                  label="Email Address"
                  placeholder="student@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  startContent={<FaEnvelope className="text-gray-400" />}
                  isRequired
                />

                <Input
                  type="tel"
                  label="Phone Number"
                  placeholder="+880 1XXX-XXXXXX"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  startContent={<FaPhone className="text-gray-400" />}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  type="date"
                  label="Date of Birth"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  startContent={<FaCalendar className="text-gray-400" />}
                />

                <Select
                  label="Gender"
                  placeholder="Select gender"
                  selectedKeys={formData.gender ? [formData.gender] : []}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                >
                  <SelectItem key="male" value="male">Male</SelectItem>
                  <SelectItem key="female" value="female">Female</SelectItem>
                  <SelectItem key="other" value="other">Other</SelectItem>
                </Select>
              </div>

              <Select
                label="Blood Group"
                placeholder="Select blood group"
                selectedKeys={formData.bloodGroup ? [formData.bloodGroup] : []}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
              >
                <SelectItem key="A+" value="A+">A+</SelectItem>
                <SelectItem key="A-" value="A-">A-</SelectItem>
                <SelectItem key="B+" value="B+">B+</SelectItem>
                <SelectItem key="B-" value="B-">B-</SelectItem>
                <SelectItem key="O+" value="O+">O+</SelectItem>
                <SelectItem key="O-" value="O-">O-</SelectItem>
                <SelectItem key="AB+" value="AB+">AB+</SelectItem>
                <SelectItem key="AB-" value="AB-">AB-</SelectItem>
              </Select>
            </CardBody>
          </Card>

          {/* Educational Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FaGraduationCap className="text-purple-600" />
                <h2 className="text-lg font-semibold">Educational Information</h2>
              </div>
            </CardHeader>
            <Divider />
            <CardBody className="space-y-4">
              <Input
                label="Institution/School"
                placeholder="Enter institution name"
                value={formData.institution}
                onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                startContent={<FaGraduationCap className="text-gray-400" />}
              />

              <Select
                label="Education Level"
                placeholder="Select education level"
                selectedKeys={formData.educationLevel ? [formData.educationLevel] : []}
                onChange={(e) => setFormData({ ...formData, educationLevel: e.target.value })}
              >
                <SelectItem key="primary" value="primary">Primary School</SelectItem>
                <SelectItem key="secondary" value="secondary">Secondary School</SelectItem>
                <SelectItem key="high-school" value="high-school">High School</SelectItem>
                <SelectItem key="college" value="college">College</SelectItem>
                <SelectItem key="university" value="university">University</SelectItem>
                <SelectItem key="graduate" value="graduate">Graduate</SelectItem>
                <SelectItem key="other" value="other">Other</SelectItem>
              </Select>
            </CardBody>
          </Card>

          {/* Address Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FaMapMarkerAlt className="text-green-600" />
                <h2 className="text-lg font-semibold">Address Information</h2>
              </div>
            </CardHeader>
            <Divider />
            <CardBody className="space-y-4">
              <Textarea
                label="Address"
                placeholder="Enter full address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                minRows={2}
              />

              <Input
                label="City"
                placeholder="Enter city name"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                startContent={<FaMapMarkerAlt className="text-gray-400" />}
              />
            </CardBody>
          </Card>

          {/* Emergency Contact */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FaPhone className="text-red-600" />
                <h2 className="text-lg font-semibold">Emergency Contact</h2>
              </div>
            </CardHeader>
            <Divider />
            <CardBody className="space-y-4">
              <Input
                label="Emergency Contact Name"
                placeholder="Enter contact person name"
                value={formData.emergencyContactName}
                onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                startContent={<FaUser className="text-gray-400" />}
              />

              <Input
                type="tel"
                label="Emergency Contact Number"
                placeholder="+880 1XXX-XXXXXX"
                value={formData.emergencyContact}
                onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                startContent={<FaPhone className="text-gray-400" />}
              />
            </CardBody>
          </Card>

          {/* Guardian Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FaUser className="text-amber-600" />
                <h2 className="text-lg font-semibold">Guardian Information</h2>
              </div>
            </CardHeader>
            <Divider />
            <CardBody className="space-y-4">
              <Input
                label="Guardian Name"
                placeholder="Enter guardian's name"
                value={formData.guardianName}
                onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                startContent={<FaUser className="text-gray-400" />}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  type="tel"
                  label="Guardian Phone"
                  placeholder="+880 1XXX-XXXXXX"
                  value={formData.guardianPhone}
                  onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                  startContent={<FaPhone className="text-gray-400" />}
                />

                <Input
                  type="email"
                  label="Guardian Email"
                  placeholder="guardian@example.com"
                  value={formData.guardianEmail}
                  onChange={(e) => setFormData({ ...formData, guardianEmail: e.target.value })}
                  startContent={<FaEnvelope className="text-gray-400" />}
                />
              </div>
            </CardBody>
          </Card>

          {/* Account Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FaLock className="text-indigo-600" />
                <h2 className="text-lg font-semibold">Account Settings</h2>
              </div>
            </CardHeader>
            <Divider />
            <CardBody className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Email Verified</p>
                  <p className="text-sm text-gray-600">Mark student's email as verified</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isVerified}
                    onChange={(e) => setFormData({ ...formData, isVerified: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-800">
                  <strong>Note:</strong> To change the password, the student must use the "Forgot Password" feature from the login page.
                </p>
              </div>
            </CardBody>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pb-8">
            <Button
              variant="light"
              onPress={() => router.push(`/admin/students/${studentId}`)}
            >
              Cancel
            </Button>
            <Button
              color="primary"
              type="submit"
              startContent={<FaSave />}
              isLoading={saving}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
