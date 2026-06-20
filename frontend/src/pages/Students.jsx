import React, { memo, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Toast from "../components/Toast";
import StudentForm from "../components/StudentForm";
import useToast from "../hooks/useToast";
import { AnimatePresence, motion } from "framer-motion";
import {
  modalBackdropVariants,
  modalPanelVariants,
} from "../utils/modalMotion";
import {
  addStudent,
  deleteStudent,
  getStudentsUpdatedEventName,
  updateStudent,
} from "../api/studentsApi";
import { fetchStudentsQuery } from "../api/queryFns";
import { queryKeys } from "../api/queryKeys";

function formatDate(value) {
  if (!value) return "-";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";

  return parsed.toLocaleDateString("en-GB");
}

const normalizeStudent = (student) => ({
  ...student,
  nameValue: student.name || "-",
  emailValue: student.email || "-",
  phoneValue: student.phone || "-",
  genderValue: student.gender || "-",
  educationValue: student.education || "-",
  collegeValue: student.college || "-",
  domainValue: student.domain || "-",
  dobValue: student.DOB || "",
});

function Students() {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const initialForm = useMemo(
    () => ({
      name: "",
      email: "",
      phone: "",
      password: "",
      gender: "",
      DOB: "",
      education: "",
      college: "",
      domain: "",
    }),
    [],
  );

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(initialForm);

  const [searchInput, setSearchInput] = useState("");
  const [domainInput, setDomainInput] = useState("");
  // College filter removed

  const [appliedSearch, setAppliedSearch] = useState("");
  const [appliedDomain, setAppliedDomain] = useState("");
  // College filter removed
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { toast, showToast } = useToast();
  const isEditing = editingId !== null;
  const navbarSearch = searchParams.get("q") || "";

  const { data: studentsData = [] } = useQuery({
    queryKey: queryKeys.students,
    queryFn: fetchStudentsQuery,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: false,
  });

  const students = useMemo(
    () =>
      Array.isArray(studentsData) ? studentsData.map(normalizeStudent) : [],
    [studentsData],
  );

  const domainOptions = useMemo(
    () => [
      ...new Set(
        students.map((student) => student.domainValue).filter(Boolean),
      ),
    ],
    [students],
  );

  // College filter removed

  const filteredStudents = useMemo(() => {
    const search = appliedSearch.trim().toLowerCase();
    return students.filter((student) => {
      const matchesSearch =
        !search ||
        [
          student.nameValue,
          student.emailValue,
          student.phoneValue,
          student.domainValue,
          student.educationValue,
        ].some((field) => String(field).toLowerCase().includes(search));
      const matchesDomain =
        !appliedDomain || student.domainValue === appliedDomain;
      return matchesSearch && matchesDomain;
    });
  }, [students, appliedSearch, appliedDomain]);

  useEffect(() => {
    const syncStudents = () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.students });
    };
    const studentsUpdatedEvent = getStudentsUpdatedEventName();

    window.addEventListener("storage", syncStudents);
    window.addEventListener(studentsUpdatedEvent, syncStudents);

    return () => {
      window.removeEventListener("storage", syncStudents);
      window.removeEventListener(studentsUpdatedEvent, syncStudents);
    };
  }, [queryClient]);

  useEffect(() => {
    setSearchInput(navbarSearch);
    setAppliedSearch(navbarSearch);
  }, [navbarSearch]);

  const handleOpenAddForm = () => {
    setEditingId(null);
    setFormData(initialForm);
    setShowForm(true);
  };

  const handleEdit = (student) => {
    setEditingId(student.id);
    setFormData({
      name: student.name || "",
      email: student.email || "",
      phone: student.phone || "",
      password: "",
      gender: student.gender || "",
      DOB: student.DOB ? String(student.DOB).slice(0, 10) : "",
      education: student.education || "",
      college: student.college || "",
      domain: student.domain || "",
    });
    setShowForm(true);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(initialForm);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const normalized = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      gender: formData.gender,
      DOB: formData.DOB || null,
      education: formData.education.trim(),
      college: formData.college.trim(),
      domain: formData.domain.trim(),
    };

    if (!isEditing) {
      normalized.password = formData.password;
    }

    if (
      !normalized.name ||
      !normalized.email ||
      !normalized.phone ||
      (!isEditing && !normalized.password)
    ) {
      showToast("Name, email, phone and password are required.", "error");
      return;
    }

    const nextStudents = isEditing
      ? await updateStudent(editingId, normalized)
      : await addStudent(normalized);
    queryClient.setQueryData(
      queryKeys.students,
      Array.isArray(nextStudents) ? nextStudents : [],
    );
    showToast(
      isEditing
        ? "Student updated successfully."
        : "Student added successfully.",
    );
    handleCloseForm();
  };

  const handleDelete = (student) => {
    setDeleteTarget(student);
  };

  const handleCancelDelete = () => {
    setDeleteTarget(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget?.id) return;

    const nextStudents = await deleteStudent(deleteTarget.id);
    queryClient.setQueryData(
      queryKeys.students,
      Array.isArray(nextStudents) ? nextStudents : [],
    );
    showToast("Student deleted successfully.");

    if (editingId === deleteTarget.id) {
      handleCloseForm();
    }

    setDeleteTarget(null);
  };

  const handleApplyFilter = () => {
    setAppliedSearch(searchInput);
    setAppliedDomain(domainInput);
  };

  return (
    <div className="space-y-8">
      <Toast toast={toast} />

      {/* Page Title */}
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <h1 className="text-3xl font-bold">Students</h1>
        <motion.button
          whileTap={{ scale: 0.9 }}
          type="button"
          onClick={handleOpenAddForm}
          className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-none text-sm font-bold transition-colors rounded-sm cursor-pointer"
        >
          + Add Student
        </motion.button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.div
              className="fixed inset-0 bg-slate-900/45 z-40"
              variants={modalBackdropVariants}
              onClick={handleCloseForm}
              aria-hidden="true"
            />

            <motion.div
              variants={modalPanelVariants}
              className="relative z-50 w-full max-w-4xl bg-white rounded-xl border border-gray-200 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">
                  {isEditing ? "Edit Student" : "Add Student"}
                </h3>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={handleCloseForm}
                  className="text-sm px-3 py-1.5 border border-gray-300 hover:bg-gray-100 rounded-sm cursor-pointer"
                >
                  Close
                </motion.button>
              </div>

              <div className="p-5">
                <StudentForm
                  formData={formData}
                  onChange={handleChange}
                  onSubmit={handleSubmit}
                  onCancel={handleCloseForm}
                  isEditing={isEditing}
                  submitLabel={isEditing ? "Update Student" : "Save Student"}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter Section */}
      <div className="bg-white p-5 rounded-none shadow-sm border border-gray-100 flex gap-4 items-center flex-wrap">
        <input
          type="text"
          placeholder="Search Student"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          className="border border-gray-300 rounded-none px-4 py-2 w-60 text-sm focus:outline-none focus:ring-1 focus:ring-red-500 transition-all"
        />

        <select
          value={domainInput}
          onChange={(event) => setDomainInput(event.target.value)}
          className="border border-gray-300 rounded-none px-4 py-2 w-40 text-sm focus:outline-none focus:ring-1 focus:ring-red-500 transition-all cursor-pointer"
        >
          <option value="">Domain</option>
          {domainOptions.map((domain) => (
            <option key={domain} value={domain}>
              {domain}
            </option>
          ))}
        </select>

        {/* College filter removed */}

        <motion.button
          whileTap={{ scale: 0.9 }}
          type="button"
          onClick={handleApplyFilter}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-none text-sm font-bold transition-colors rounded-sm cursor-pointer"
        >
          Apply Filter
        </motion.button>
      </div>

      {/* Student List */}
      <div className="bg-white rounded-lg shadow">
        <h2 className="text-2xl font-semibold p-5">Student List</h2>

        <div className="responsive-table-wrap">
          <table className="w-full">
            {/* Table Head */}
            <thead className="bg-red-100 text-gray-700 text-sm">
              <tr>
                <th className="text-left p-4">Student Name</th>
                <th className="text-left p-4">Phone</th>
                <th className="text-left p-4">Domain</th>
                <th className="text-left p-4">Education</th>
                <th className="text-left p-4">DOB</th>
                <th className="text-left p-4">Action</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="text-gray-600">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="border-t">
                  <td className="p-4">{student.nameValue}</td>
                  <td className="p-4 text-sm">{student.phoneValue}</td>
                  <td className="p-4 text-sm">{student.domainValue}</td>
                  <td className="p-4 text-sm">{student.educationValue}</td>
                  <td className="p-4 text-sm">
                    {formatDate(student.dobValue)}
                  </td>

                  <td className="p-4 text-sm">
                    <div className="flex items-center gap-3 flex-wrap">
                      <Link
                        to={`/admin/students/${student.id}`}
                        className="inline-flex items-center px-3 py-1.5 rounded-sm border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 font-semibold transition-colors"
                      >
                        View
                      </Link>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        type="button"
                        onClick={() => handleEdit(student)}
                        className="inline-flex items-center px-3 py-1.5 rounded-sm border border-gray-300 text-gray-800 bg-white hover:bg-gray-100 font-semibold transition-colors cursor-pointer"
                      >
                        Edit
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        type="button"
                        onClick={() => handleDelete(student)}
                        className="inline-flex items-center px-3 py-1.5 rounded-sm border border-red-200 text-red-700 bg-red-50 hover:bg-red-600 hover:text-white font-semibold transition-colors cursor-pointer"
                      >
                        Delete
                      </motion.button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredStudents.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="p-6 text-center text-sm text-gray-500"
                  >
                    No students found for selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.div
              className="fixed inset-0 bg-slate-900/45 z-40"
              variants={modalBackdropVariants}
              onClick={handleCancelDelete}
              aria-hidden="true"
            />
            <motion.div
              variants={modalPanelVariants}
              className="relative z-50 w-full max-w-md bg-white rounded-xl border border-gray-200 shadow-2xl"
            >
              <div className="px-6 pt-6 pb-4 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900">
                  Delete Student
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-gray-900">
                    {deleteTarget.nameValue || "this student"}
                  </span>
                  ? This action cannot be undone.
                </p>
              </div>
              <div className="px-6 py-4 flex justify-end gap-3">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={handleCancelDelete}
                  className="px-4 py-2 text-sm font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-sm cursor-pointer"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 text-sm font-semibold bg-red-600 hover:bg-red-700 text-white rounded-sm cursor-pointer"
                >
                  Delete
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default memo(Students);
