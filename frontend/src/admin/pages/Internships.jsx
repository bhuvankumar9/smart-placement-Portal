import React, { memo, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addInternship,
  deleteInternship,
  getInternshipsUpdatedEventName,
  updateInternship,
} from "../../api/internshipsApi";
import { fetchInternshipsQuery } from "../../api/queryFns";
import { queryKeys } from "../../api/queryKeys";
import Toast from "../../components/Toast";
import useToast from "../../hooks/useToast";
import { AnimatePresence, motion } from "framer-motion";
import {
  modalBackdropVariants,
  modalPanelVariants,
} from "../../utils/modalMotion";

const formatDate = (value) => {
  if (!value) return "-";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return String(value);
  }

  return parsed.toLocaleDateString("en-GB");
};

const normalizeInternship = (internship) => ({
  ...internship,
  position: internship.title || internship.role || "",
  durationValue: internship.duration ?? "",
  startDateValue:
    internship.startDate ||
    (internship.createdAt
      ? new Date(internship.createdAt).toISOString().slice(0, 10)
      : ""),
  workTypeValue:
    internship.work_type || internship.workType || internship.location || "",
  stipendValue: internship.stipend ?? "",
  branchValue: internship.branch || internship.company || "",
  statusValue: internship.status || "Open",
  categoryValue: internship.category || "Paid",
});

function Internships() {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const initialForm = useMemo(
    () => ({
      title: "",
      duration: "",
      category: "Paid",
      workType: "On-site",
      stipend: "",
      branch: "",
      startDate: "",
      status: "Open",
    }),
    [],
  );

  const {
    data: internships = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.internships,
    queryFn: fetchInternshipsQuery,
  });
  const internshipsError = error?.message || null;
  const loading = isLoading;
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [searchInput, setSearchInput] = useState("");
  const [durationInput, setDurationInput] = useState("");
  const [statusInput, setStatusInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [appliedDuration, setAppliedDuration] = useState("");
  const [appliedStatus, setAppliedStatus] = useState("");
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const formRef = useRef(null);
  const titleInputRef = useRef(null);
  const { toast, showToast } = useToast();
  const navbarSearch = searchParams.get("q") || "";

  const isEditing = editingId !== null;

  const internshipList = useMemo(
    () =>
      Array.isArray(internships) ? internships.map(normalizeInternship) : [],
    [internships],
  );

  const durationOptions = useMemo(
    () => [
      ...new Set(
        internshipList
          .map((internship) => String(internship.durationValue || ""))
          .filter(Boolean),
      ),
    ],
    [internshipList],
  );

  const filteredInternships = useMemo(() => {
    const search = appliedSearch.trim().toLowerCase();

    return internshipList.filter((internship) => {
      const matchesSearch =
        !search ||
        [
          internship.position,
          internship.workTypeValue,
          internship.branchValue,
          internship.stipendValue,
        ].some((field) => String(field).toLowerCase().includes(search));

      const matchesDuration =
        !appliedDuration ||
        String(internship.durationValue) === String(appliedDuration);
      const matchesStatus =
        !appliedStatus || internship.statusValue === appliedStatus;

      return matchesSearch && matchesDuration && matchesStatus;
    });
  }, [internshipList, appliedSearch, appliedDuration, appliedStatus]);

  useEffect(() => {
    const internshipsUpdatedEvent = getInternshipsUpdatedEventName();
    const syncInternships = () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.internships });
    };

    window.addEventListener("storage", syncInternships);
    window.addEventListener(internshipsUpdatedEvent, syncInternships);

    return () => {
      window.removeEventListener("storage", syncInternships);
      window.removeEventListener(internshipsUpdatedEvent, syncInternships);
    };
  }, [queryClient]);

  useEffect(() => {
    setSearchInput(navbarSearch);
    setAppliedSearch(navbarSearch);
  }, [navbarSearch]);

  useEffect(() => {
    if (!showForm) return;

    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => {
      titleInputRef.current?.focus();
      titleInputRef.current?.select?.();
    }, 120);
  }, [showForm, editingId]);

  const handleOpenAddForm = () => {
    setEditingId(null);
    setFormData(initialForm);
    setShowForm(true);
  };

  const handleEdit = (internship) => {
    setEditingId(internship.id);
    setFormData({
      title: internship.position || "",
      duration: internship.durationValue || "",
      category: internship.categoryValue || "Paid",
      workType: internship.workTypeValue || "On-site",
      stipend: internship.stipendValue || "",
      branch: internship.branchValue || "",
      startDate: internship.startDateValue || "",
      status: internship.statusValue || "Open",
    });
    setShowForm(true);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const normalized = {
      title: formData.title.trim(),
      duration: Number(formData.duration) || 0,
      category: formData.category,
      work_type: formData.workType,
      stipend: formData.stipend ? Number(formData.stipend) : null,
      branch: formData.branch.trim(),
      status: formData.status,
      startDate: formData.startDate,
    };

    if (
      !normalized.title ||
      !normalized.duration ||
      !normalized.category ||
      !normalized.work_type ||
      !normalized.branch
    ) {
      return;
    }

    if (isEditing) {
      await updateInternship(editingId, normalized);
    } else {
      await addInternship(normalized);
    }

    queryClient.invalidateQueries({ queryKey: queryKeys.internships });
    showToast(
      isEditing
        ? "Internship updated successfully."
        : "Internship added successfully.",
    );
    setShowForm(false);
    setEditingId(null);
    setFormData(initialForm);
  };

  const handleDelete = (id) => {
    setDeleteTargetId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;

    await deleteInternship(deleteTargetId);
    queryClient.invalidateQueries({ queryKey: queryKeys.internships });
    showToast("Internship deleted successfully.");

    if (editingId === deleteTargetId) {
      setShowForm(false);
      setEditingId(null);
      setFormData(initialForm);
    }

    setDeleteTargetId(null);
  };

  const handleCancelDelete = () => {
    setDeleteTargetId(null);
  };

  const handleApplyFilter = () => {
    setAppliedSearch(searchInput);
    setAppliedDuration(durationInput);
    setAppliedStatus(statusInput);
  };

  return (
    <div className="space-y-8">
      <Toast toast={toast} />

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Internships</h1>

        <motion.button
          whileTap={{ scale: 0.9 }}
          type="button"
          onClick={handleOpenAddForm}
          className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-none text-sm font-bold transition-colors rounded-sm cursor-pointer"
        >
          + Add Internships
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
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
                setFormData(initialForm);
              }}
              aria-hidden="true"
            />

            <motion.div
              variants={modalPanelVariants}
              className="relative z-50 w-full max-w-5xl bg-white rounded-xl border border-gray-100 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">
                  {isEditing ? "Edit Internship" : "Add Internship"}
                </h3>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData(initialForm);
                  }}
                  className="text-sm px-3 py-1.5 border border-gray-300 hover:bg-gray-100 rounded-sm cursor-pointer"
                >
                  Close
                </motion.button>
              </div>

              <form
                ref={formRef}
                onSubmit={handleSubmit}
                className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="internship-title"
                    className="text-sm font-medium text-gray-700"
                  >
                    Position
                  </label>
                  <input
                    id="internship-title"
                    ref={titleInputRef}
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Position"
                    className="border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="internship-duration"
                    className="text-sm font-medium text-gray-700"
                  >
                    Duration (Months)
                  </label>
                  <input
                    id="internship-duration"
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    placeholder="Duration (in months)"
                    className="border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="internship-category"
                    className="text-sm font-medium text-gray-700"
                  >
                    Category
                  </label>
                  <select
                    id="internship-category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-500 cursor-pointer"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Unpaid">Unpaid</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="internship-work-type"
                    className="text-sm font-medium text-gray-700"
                  >
                    Work Type
                  </label>
                  <select
                    id="internship-work-type"
                    name="workType"
                    value={formData.workType}
                    onChange={handleChange}
                    className="border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-500 cursor-pointer"
                    required
                  >
                    <option value="On-site">On-site</option>
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="internship-stipend"
                    className="text-sm font-medium text-gray-700"
                  >
                    Stipend
                  </label>
                  <input
                    id="internship-stipend"
                    type="number"
                    name="stipend"
                    value={formData.stipend}
                    onChange={handleChange}
                    placeholder="Stipend"
                    className="border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="internship-branch"
                    className="text-sm font-medium text-gray-700"
                  >
                    Branch
                  </label>
                  <input
                    id="internship-branch"
                    type="text"
                    name="branch"
                    value={formData.branch}
                    onChange={handleChange}
                    placeholder="Branch"
                    className="border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="internship-start-date"
                    className="text-sm font-medium text-gray-700"
                  >
                    Start Date
                  </label>
                  <input
                    id="internship-start-date"
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className="border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="internship-status"
                    className="text-sm font-medium text-gray-700"
                  >
                    Status
                  </label>
                  <select
                    id="internship-status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-500 cursor-pointer"
                  >
                    <option value="Open">Open</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                <div className="md:col-span-2 lg:col-span-3 flex gap-3 justify-end">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingId(null);
                      setFormData(initialForm);
                    }}
                    className="border border-gray-300 hover:bg-gray-100 text-gray-700 px-6 py-2 text-sm font-semibold transition-colors rounded-sm cursor-pointer"
                  >
                    Cancel
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    type="submit"
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 text-sm font-bold transition-colors rounded-sm cursor-pointer"
                  >
                    {isEditing ? "Update Internship" : "Save Internship"}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white p-5 rounded-none shadow-sm border border-gray-100 flex gap-4 items-center flex-wrap">
        <input
          type="text"
          placeholder="Search Internships"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          className="border border-gray-300 rounded-none px-4 py-2 w-60 text-sm focus:outline-none focus:ring-1 focus:ring-red-500 transition-all"
        />

        <select
          value={durationInput}
          onChange={(event) => setDurationInput(event.target.value)}
          className="border border-gray-300 rounded-none px-4 py-2 w-40 text-sm focus:outline-none focus:ring-1 focus:ring-red-500 transition-all cursor-pointer"
        >
          <option value="">Duration</option>
          {durationOptions.map((duration) => (
            <option key={duration} value={duration}>
              {duration}
            </option>
          ))}
        </select>

        <select
          value={statusInput}
          onChange={(event) => setStatusInput(event.target.value)}
          className="border border-gray-300 rounded-none px-4 py-2 w-40 text-sm focus:outline-none focus:ring-1 focus:ring-red-500 transition-all cursor-pointer"
        >
          <option value="">Status</option>
          <option value="Open">Open</option>
          <option value="Closed">Closed</option>
        </select>

        <motion.button
          whileTap={{ scale: 0.9 }}
          type="button"
          onClick={handleApplyFilter}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-none text-sm font-bold transition-colors rounded-sm cursor-pointer"
        >
          Apply Filter
        </motion.button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <h2 className="text-2xl font-semibold p-5">Internship List</h2>

        {loading && (
          <p className="px-5 pb-4 text-sm text-gray-500">
            Loading internships...
          </p>
        )}
        {!loading && internshipsError && (
          <p className="px-5 pb-4 text-sm text-red-600">{internshipsError}</p>
        )}

        <div className="responsive-table-wrap">
          <table className="w-full">
            <thead className="bg-red-100 text-gray-700 text-sm">
              <tr>
                <th className="text-left p-4">Position</th>
                <th className="text-left p-4">Duration</th>
                <th className="text-left p-4">Start Date</th>
                <th className="text-left p-4">Work Type</th>
                <th className="text-left p-4">Stipend</th>
                <th className="text-left p-4">Branch</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Action</th>
              </tr>
            </thead>

            <tbody className="text-gray-600">
              {filteredInternships.map((internship, index) => (
                <tr key={`${internship.id}-${index}`} className="border-t">
                  <td className="p-4 font-medium text-gray-900">
                    {internship.position || "-"}
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {internship.durationValue
                      ? `${internship.durationValue} month${Number(internship.durationValue) > 1 ? "s" : ""}`
                      : "-"}
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {formatDate(internship.startDateValue)}
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {internship.workTypeValue || "-"}
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {internship.stipendValue
                      ? `₹${Number(internship.stipendValue).toLocaleString()}/month`
                      : "Unpaid"}
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {internship.branchValue || "-"}
                  </td>
                  <td
                    className={`p-4 text-sm font-semibold ${
                      internship.statusValue === "Open"
                        ? "text-green-600"
                        : "text-gray-500"
                    }`}
                  >
                    {internship.statusValue}
                  </td>
                  <td className="p-4 text-sm">
                    <div className="flex gap-2">
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        type="button"
                        onClick={() => handleEdit(internship)}
                        className="inline-flex items-center px-3 py-1.5 rounded-sm border border-gray-300 text-gray-800 bg-white hover:bg-gray-100 font-semibold transition-colors cursor-pointer"
                      >
                        Edit
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        type="button"
                        onClick={() => handleDelete(internship.id)}
                        className="inline-flex items-center px-3 py-1.5 rounded-sm border border-red-200 text-red-700 bg-red-50 hover:bg-red-600 hover:text-white font-semibold transition-colors cursor-pointer"
                      >
                        Delete
                      </motion.button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredInternships.length === 0 && (
                <tr>
                  <td
                    colSpan="8"
                    className="p-6 text-center text-sm text-gray-500"
                  >
                    No internships found for selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {deleteTargetId !== null && (
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
                  Delete Internship
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Are you sure you want to delete this internship? This action
                  cannot be undone.
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

export default memo(Internships);
