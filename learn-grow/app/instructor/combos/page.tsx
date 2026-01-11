/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Chip,
  Input,
  Card,
  CardBody,
  Tooltip,
  Pagination,
  Spinner,
} from "@nextui-org/react";
import {
  FaEdit,
  FaTrash,
  FaEye,
  FaPlus,
  FaSearch,
} from "react-icons/fa";
import { useGetAllCombosQuery, useDisableComboMutation } from "@/redux/api/comboApi";

const ROWS_PER_PAGE = 10;

export default function InstructorCombosPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const { data: combosData, isLoading, error } = useGetAllCombosQuery({ page: 1, limit: 100 });
  const [disableCombo] = useDisableComboMutation();

  const combos = Array.isArray(combosData?.data) ? combosData.data : [];

  const filteredCombos = useMemo(() => {
    return combos.filter((combo: any) =>
      combo.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      combo.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [combos, searchTerm]);

  const paginatedCombos = useMemo(() => {
    const start = (page - 1) * ROWS_PER_PAGE;
    const end = start + ROWS_PER_PAGE;
    return filteredCombos.slice(start, end);
  }, [filteredCombos, page]);

  const handleDelete = async (comboId: string) => {
    if (window.confirm("Are you sure you want to delete this combo?")) {
      try {
        await disableCombo(comboId).unwrap();
      } catch (err: any) {
        alert(err?.data?.message || "Failed to delete combo");
      }
    }
  };

  const pages = Math.ceil(filteredCombos.length / ROWS_PER_PAGE);

  return (
    <div className="w-full p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Course Combos</h1>
        <Button
          color="primary"
          startContent={<FaPlus />}
          onPress={() => router.push("/instructor/combos/create")}
        >
          New Combo
        </Button>
      </div>

      <Card className="mb-6">
        <CardBody>
          <Input
            isClearable
            classNames={{
              base: "w-full",
              mainWrapper: "h-full",
              input: "text-sm",
            }}
            placeholder="Search combos..."
            startContent={<FaSearch />}
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
        </CardBody>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner label="Loading combos..." />
        </div>
      ) : error ? (
        <Card className="border-red-500">
          <CardBody className="text-red-600">
            Failed to load combos. Please try again.
          </CardBody>
        </Card>
      ) : combos.length === 0 ? (
        <Card className="text-center py-12">
          <CardBody>
            <p className="text-gray-600 mb-4">No combos yet. Create your first combo!</p>
            <Button
              color="primary"
              startContent={<FaPlus />}
              onPress={() => router.push("/instructor/combos/create")}
            >
              Create New Combo
            </Button>
          </CardBody>
        </Card>
      ) : (
        <>
          <div className="rounded-lg border border-gray-200 overflow-hidden">
            <Table
              aria-label="Instructor combos table"
              className="w-full"
              color="default"
              selectionMode="none"
            >
              <TableHeader>
                <TableColumn>NAME</TableColumn>
                <TableColumn>COURSES</TableColumn>
                <TableColumn>DISCOUNT</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn align="end">ACTIONS</TableColumn>
              </TableHeader>
              <TableBody>
                {paginatedCombos.map((combo: any) => (
                  <TableRow key={combo._id}>
                    <TableCell>
                      <div>
                        <p className="font-semibold">{combo.name}</p>
                        <p className="text-sm text-gray-500">
                          {combo.description?.substring(0, 50)}...
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="sm"
                        variant="flat"
                        color="primary"
                      >
                        {combo.courses?.length || 0} courses
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold">
                        {combo.discountPercentage}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="sm"
                        variant="flat"
                        color={combo.isActive ? "success" : "warning"}
                      >
                        {combo.isActive ? "Active" : "Inactive"}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Tooltip color="default" content="View details">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            color="primary"
                            onPress={() => router.push(`/instructor/combos/${combo._id}`)}
                          >
                            <FaEye />
                          </Button>
                        </Tooltip>
                        <Tooltip color="default" content="Edit combo">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            color="warning"
                            onPress={() => router.push(`/instructor/combos/${combo._id}/edit`)}
                          >
                            <FaEdit />
                          </Button>
                        </Tooltip>
                        <Tooltip color="danger" content="Delete combo">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            color="danger"
                            onPress={() => handleDelete(combo._id)}
                          >
                            <FaTrash />
                          </Button>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {pages > 1 && (
            <div className="flex justify-center mt-6">
              <Pagination
                isCompact
                showControls
                showShadow
                color="primary"
                page={page}
                total={pages}
                onChange={setPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
