import React, { memo, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addJob,
  deleteJob,
  getJobsUpdatedEventName,
  updateJob,
} from "../../api/jobsApi";
import { fetchJobsQuery } from "../../api/queryFns";
import { queryKeys } from "../../api/queryKeys";
import Toast from "../../components/Toast";
import useToast from "../../hooks/useToast";
import { AnimatePresence, motion } from "framer-motion";
import {
  modalBackdropVariants,
  modalPanelVariants,
} from "../../utils/modalMotion";

const formatPostedDate = (value) => {
  if (!value) return "-";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return String(value);
  }

  return parsed.toLocaleDateString("en-GB");
};

const normalizeJob = (job) => ({
  ...job,
  positionValue: job.position || job.role || "",
  companyValue: job.company || "",
  locationValue: job.location || "",
  salaryValue: job.salary || job.type || "",
  jobUrlValue: job.jobURL || job.jobUrl || "",
  descriptionValue: job.description || "",
  requirementsValue: job.requirements || "",
  postedOnValue: job.createdAt || job.updatedAt || job.date || "",
});

function Jobs() {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const initialForm = useMemo(
    () => ({
      position: "",
      company: "",
      location: "",
      salary: "",
      jobURL: "",
      description: "",
      requirements: "",
    }),
    [],
  );

  const {
    data: jobs = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.jobs,
    queryFn: fetchJobsQuery,
  });
  const jobsError = error?.message || null;
  const loading = isLoading;
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [searchInput, setSearchInput] = useState("");
  const [positionInput, setPositionInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [appliedPosition, setAppliedPosition] = useState("");
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const formRef = useRef(null);
  const positionInputRef = useRef(null);
  const { toast, showToast } = useToast();
  const navbarSearch = searchParams.get("q") || "";

  const isEditing = editingId !== null;

  const jobList = useMemo(
    () => (Array.isArray(jobs) ? jobs.map(normalizeJob) : []),
    [jobs],
  );

  const positionOptions = useMemo(
    () => [...new Set(jobList.map((job) => job.positionValue).filter(Boolean))],
    [jobList],
  );

  const filteredJobs = useMemo(() => {
    const search = appliedSearch.trim().toLowerCase();

    return jobList.filter((job) => {
      const matchesSearch =
        !search ||
        [
          job.positionValue,
          job.companyValue,
          job.locationValue,
          job.salaryValue,
          job.descriptionValue,
          job.requirementsValue,
        ].some((field) => String(field).toLowerCase().includes(search));

      const matchesPosition =
        !appliedPosition || job.positionValue === appliedPosition;

      return matchesSearch && matchesPosition;
    });
  }, [jobList, appliedSearch, appliedPosition]);

  useEffect(() => {
    const jobsUpdatedEvent = getJobsUpdatedEventName();
    const syncJobs = () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs });
    };

    window.addEventListener("storage", syncJobs);
    window.addEventListener(jobsUpdatedEvent, syncJobs);

    return () => {
      window.removeEventListener("storage", syncJobs);
      window.removeEventListener(jobsUpdatedEvent, syncJobs);
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
      positionInputRef.current?.focus();
      positionInputRef.current?.select?.();
    }, 120);
  }, [showForm, editingId]);

  const handleOpenAddForm = () => {
    setEditingId(null);
    setFormData(initialForm);
    setShowForm(true);
  };

  const handleEdit = (job) => {
    setEditingId(job.id);
    setFormData({
      position: job.positionValue || "",
      company: job.companyValue || "",
      location: job.locationValue || "",
      salary: job.salaryValue || "",
      jobURL: job.jobUrlValue || "",
      description: job.descriptionValue || "",
      requirements: job.requirementsValue || "",
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
      position: formData.position.trim(),
      company: formData.company.trim(),
      location: formData.location.trim(),
      salary: formData.salary.trim(),
      jobURL: formData.jobURL.trim(),
      description: formData.description.trim(),
      requirements: formData.requirements.trim(),
    };

    if (!normalized.position || !normalized.company || !normalized.location) {
      return;
    }

    if (isEditing) {
      await updateJob(editingId, normalized);
    } else {
      await addJob(normalized);
    }

    queryClient.invalidateQueries({ queryKey: queryKeys.jobs });
    showToast(
      isEditing ? "Job updated successfully." : "Job added successfully.",
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

    await deleteJob(deleteTargetId);
    queryClient.invalidateQueries({ queryKey: queryKeys.jobs });
    showToast("Job deleted successfully.");

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
    setAppliedPosition(positionInput);
  };

  return (
    <div className="space-y-10">
      <Toast toast={toast} />

      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold text-gray-900">Jobs</h1>

        <motion.button
          whileTap={{ scale: 0.9 }}
          type="button"
          onClick={handleOpenAddForm}
          className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-none text-sm font-bold transition-colors rounded-sm cursor-pointer"
        >
          + Add jobs
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
                  {isEditing ? "Edit Job" : "Add Job"}
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
                    htmlFor="job-position"
                    className="text-sm font-medium text-gray-700"
                  >
                    Job Position
                  </label>
                  <input
                    id="job-position"
                    ref={positionInputRef}
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    placeholder="Job Position"
                    className="border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="job-company"
                    className="text-sm font-medium text-gray-700"
                  >
                    Company
                  </label>
                  <input
                    id="job-company"
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="Company"
                    className="border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="job-location"
                    className="text-sm font-medium text-gray-700"
                  >
                    Location
                  </label>
                  <input
                    id="job-location"
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Location"
                    className="border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="job-salary"
                    className="text-sm font-medium text-gray-700"
                  >
                    Salary / CTC
                  </label>
                  <input
                    id="job-salary"
                    type="text"
                    name="salary"
                    value={formData.salary}
                    onChange={handleChange}
                    placeholder="Salary / CTC"
                    className="border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="job-url"
                    className="text-sm font-medium text-gray-700"
                  >
                    Application URL
                  </label>
                  <input
                    id="job-url"
                    type="url"
                    name="jobURL"
                    value={formData.jobURL}
                    onChange={handleChange}
                    placeholder="Application URL"
                    className="border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>

                <div className="md:col-span-2 flex flex-col gap-1">
                  <label
                    htmlFor="job-description"
                    className="text-sm font-medium text-gray-700"
                  >
                    Job Description
                  </label>
                  <textarea
                    id="job-description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Job Description"
                    className="border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                    rows="4"
                  />
                </div>

                <div className="md:col-span-2 lg:col-span-1 flex flex-col gap-1">
                  <label
                    htmlFor="job-requirements"
                    className="text-sm font-medium text-gray-700"
                  >
                    Requirements
                  </label>
                  <textarea
                    id="job-requirements"
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleChange}
                    placeholder="Requirements"
                    className="border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                    rows="4"
                  />
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
                    {isEditing ? "Update Job" : "Save Job"}
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
          placeholder="Search Jobs"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          className="border border-gray-300 rounded-none px-4 py-2 w-60 text-sm focus:outline-none focus:ring-1 focus:ring-red-500 transition-all"
        />

        <select
          value={positionInput}
          onChange={(event) => setPositionInput(event.target.value)}
          className="border border-gray-300 rounded-none px-4 py-2 w-40 text-sm focus:outline-none focus:ring-1 focus:ring-red-500 transition-all cursor-pointer"
        >
          <option value="">Position</option>
          {positionOptions.map((position) => (
            <option key={position} value={position}>
              {position}
            </option>
          ))}
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
        <h2 className="text-2xl font-semibold p-5">Job List</h2>

        {loading && (
          <p className="px-5 pb-4 text-sm text-gray-500">Loading jobs...</p>
        )}
        {!loading && jobsError && (
          <p className="px-5 pb-4 text-sm text-red-600">{jobsError}</p>
        )}

        <div className="responsive-table-wrap">
          <table className="w-full">
            <thead className="bg-red-100 text-gray-700 text-sm">
              <tr>
                <th className="text-left p-4">Position</th>
                <th className="text-left p-4">Company</th>
                <th className="text-left p-4">Location</th>
                <th className="text-left p-4">Salary</th>
                <th className="text-left p-4">Apply URL</th>
                <th className="text-left p-4">Posted On</th>
                <th className="text-left p-4">Action</th>
              </tr>
            </thead>

            <tbody className="text-gray-600">
              {filteredJobs.map((job, index) => (
                <tr key={`${job.id}-${index}`} className="border-t">
                  <td className="p-4 font-medium text-gray-900">
                    {job.positionValue || "-"}
                  </td>
                  <td className="p-4">{job.companyValue || "-"}</td>
                  <td className="p-4">{job.locationValue || "-"}</td>
                  <td className="p-4">{job.salaryValue || "-"}</td>
                  <td className="p-4 max-w-[220px] truncate">
                    {job.jobUrlValue ? (
                      <a
                        href={job.jobUrlValue}
                        target="_blank"
                        rel="noreferrer"
                        className="text-red-600 hover:underline"
                      >
                        Open Link
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="p-4 text-sm text-gray-500">
                    {formatPostedDate(job.postedOnValue)}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        type="button"
                        onClick={() => handleEdit(job)}
                        className="inline-flex items-center px-3 py-1.5 rounded-sm border border-gray-300 text-gray-800 bg-white hover:bg-gray-100 font-semibold transition-colors cursor-pointer"
                      >
                        Edit
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        type="button"
                        onClick={() => handleDelete(job.id)}
                        className="inline-flex items-center px-3 py-1.5 rounded-sm border border-red-200 text-red-700 bg-red-50 hover:bg-red-600 hover:text-white font-semibold transition-colors cursor-pointer"
                      >
                        Delete
                      </motion.button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredJobs.length === 0 && (
                <tr>
                  <td
                    colSpan="7"
                    className="p-6 text-center text-sm text-gray-500"
                  >
                    No jobs found for selected filters.
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
                <h3 className="text-lg font-bold text-gray-900">Delete Job</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Are you sure you want to delete this job? This action cannot
                  be undone.
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

export default memo(Jobs);
