import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MapPin, Calendar, Banknote, Bookmark, Briefcase } from "lucide-react";
import { createInternApplication } from "../api/internsApi";
import Toast from "../components/Toast";
import useToast from "../hooks/useToast";
import {
  addInternshipApplication,
  getAppliedInternshipIds,
} from "../utils/studentActivity";
import { fetchInternshipsQuery } from "../api/queryFns";
import { queryKeys } from "../api/queryKeys";
import { selectStudentId } from "../store/slices/authSlice";
import { AnimatePresence, motion } from "framer-motion";
import {
  modalBackdropVariants,
  modalPanelVariants,
} from "../utils/modalMotion";

const addMonthsToDate = (dateString, months) => {
  if (!dateString) return "";

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";

  const normalizedMonths = Math.max(1, Number(months) || 1);
  date.setMonth(date.getMonth() + normalizedMonths);

  return date.toISOString().slice(0, 10);
};

const getTodayInputDate = () => {
  const now = new Date();
  const timezoneOffsetMs = now.getTimezoneOffset() * 60 * 1000;
  return new Date(now.getTime() - timezoneOffsetMs).toISOString().slice(0, 10);
};

const normalizeInternCategory = (value) => {
  const category = String(value || "")
    .trim()
    .toLowerCase();

  if (category === "paid") return "paid";
  if (category === "unpaid" || category === "free") return "free";

  return "free";
};

const isInternshipClosed = (internship) =>
  String(internship?.status || "")
    .trim()
    .toLowerCase() === "closed";

const InternshipCard = ({ internship, isApplied, onApply }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
    <h3 className="text-xl font-bold text-slate-800">{internship.title}</h3>
    <p className="text-red-600 font-medium mt-1 mb-1 text-sm">
      {internship.category}
    </p>
    <p className="text-gray-400 mb-5 text-xs">{internship.branch}</p>

    <div className="space-y-3 mb-8">
      <div className="flex items-center text-gray-500 text-sm italic">
        <MapPin size={16} className="mr-3 text-gray-400 shrink-0" />{" "}
        {internship.location}
      </div>
      <div className="flex items-center text-gray-500 text-sm italic">
        <Calendar size={16} className="mr-3 text-gray-400 shrink-0" />{" "}
        {internship.duration} {internship.duration === 1 ? "month" : "months"}
      </div>
      {internship.stipend ? (
        <div className="flex items-center text-green-600 text-sm font-medium">
          <Banknote size={16} className="mr-3 shrink-0" /> ₹
          {internship.stipend.toLocaleString()}/month
        </div>
      ) : (
        <div className="flex items-center text-gray-400 text-sm italic">
          <Banknote size={16} className="mr-3 shrink-0" /> Unpaid
        </div>
      )}
    </div>

    {internship.description && (
      <p className="text-gray-500 text-xs mb-5 line-clamp-2">
        {internship.description}
      </p>
    )}

    <div className="flex items-center gap-3 mt-auto">
      {isInternshipClosed(internship) && (
        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-gray-100 text-gray-600 text-xs font-semibold">
          Closed
        </span>
      )}
      <motion.button
        whileTap={{ scale: 0.9 }}
        type="button"
        onClick={() => onApply(internship.id)}
        disabled={isApplied || isInternshipClosed(internship)}
        className={`flex-1 text-white cursor-pointer font-bold py-2.5 rounded-lg transition-colors ${
          isApplied
            ? "bg-emerald-600 cursor-not-allowed"
            : isInternshipClosed(internship)
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#FF0000] hover:bg-red-700"
        }`}
      >
        {isApplied
          ? "Applied"
          : isInternshipClosed(internship)
            ? "Closed"
            : "Apply Now"}
      </motion.button>
      <motion.button
        whileTap={{ scale: 0.9 }}
        type="button"
        className="p-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 rounded-sm cursor-pointer"
      >
        <Bookmark size={20} className="text-gray-400" />
      </motion.button>
    </div>
  </div>
);

const Internships = () => {
  const queryClient = useQueryClient();
  const studentId = useSelector(selectStudentId);
  const [searchParams] = useSearchParams();
  const [appliedInternshipIds, setAppliedInternshipIds] = useState([]);
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const startDateInputRef = useRef(null);
  const [applicationForm, setApplicationForm] = useState({
    category: "paid",
    stipend: "",
    startDate: "",
    endDate: "",
  });
  const { toast, showToast } = useToast();
  const navbarSearch = (searchParams.get("q") || "").trim().toLowerCase();

  const {
    data: internshipList = [],
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: queryKeys.internships,
    queryFn: fetchInternshipsQuery,
  });

  const loading = isLoading || isFetching;

  const sortedInternshipList = useMemo(() => {
    return [...internshipList].sort((a, b) => {
      const aClosed = isInternshipClosed(a) ? 1 : 0;
      const bClosed = isInternshipClosed(b) ? 1 : 0;
      return aClosed - bClosed;
    });
  }, [internshipList]);

  const filteredInternshipList = useMemo(() => {
    if (!navbarSearch) {
      return sortedInternshipList;
    }

    return sortedInternshipList.filter((internship) =>
      [
        internship.title,
        internship.category,
        internship.branch,
        internship.location,
        internship.work_type,
        internship.status,
        internship.description,
      ].some((field) =>
        String(field || "")
          .toLowerCase()
          .includes(navbarSearch),
      ),
    );
  }, [sortedInternshipList, navbarSearch]);

  // Sync applied IDs from localStorage whenever studentId resolves
  useEffect(() => {
    setAppliedInternshipIds(getAppliedInternshipIds(studentId));
  }, [studentId]);

  // Cross-tab sync
  useEffect(() => {
    const handleStorage = () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.internships });
      setAppliedInternshipIds(getAppliedInternshipIds(studentId));
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [studentId, queryClient]);

  useEffect(() => {
    if (!selectedInternship) return;

    const timerId = window.setTimeout(() => {
      startDateInputRef.current?.focus();
    }, 180);

    return () => window.clearTimeout(timerId);
  }, [selectedInternship]);

  const handleApplyInternship = (internshipId) => {
    if (!studentId) {
      showToast("Please login as student to apply.", "error", 2500);
      return;
    }

    if (appliedInternshipIds.includes(String(internshipId))) {
      showToast("You already applied for this internship.", "success", 2500);
      return;
    }

    const internship = internshipList.find(
      (item) => String(item.id) === String(internshipId),
    );

    if (!internship) {
      showToast("Internship not found.", "error", 2500);
      return;
    }

    if (isInternshipClosed(internship)) {
      showToast("This internship is closed for applications.", "error", 2500);
      return;
    }

    setSelectedInternship(internship);
    const defaultStartDate = getTodayInputDate();
    setApplicationForm({
      category: normalizeInternCategory(internship.category),
      stipend: internship.stipend ? String(internship.stipend) : "",
      startDate: defaultStartDate,
      endDate: addMonthsToDate(defaultStartDate, internship.duration),
    });
  };

  const closeApplicationForm = () => {
    if (submitting) return;
    setSelectedInternship(null);
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    if (name === "startDate") {
      setApplicationForm((prev) => ({
        ...prev,
        startDate: value,
        endDate: addMonthsToDate(value, selectedInternship?.duration),
      }));
      return;
    }

    setApplicationForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitApplication = async (event) => {
    event.preventDefault();

    if (!studentId || !selectedInternship) {
      showToast("Please login as student to apply.", "error", 2500);
      return;
    }

    if (!applicationForm.startDate) {
      showToast("Please select start date.", "error", 2500);
      return;
    }

    const computedEndDate =
      applicationForm.endDate ||
      addMonthsToDate(applicationForm.startDate, selectedInternship.duration);

    if (!computedEndDate) {
      showToast(
        "Unable to calculate end date from internship duration.",
        "error",
        2500,
      );
      return;
    }

    if (new Date(computedEndDate) < new Date(applicationForm.startDate)) {
      showToast("End date cannot be before start date.", "error", 2500);
      return;
    }

    setSubmitting(true);

    try {
      await createInternApplication({
        category: normalizeInternCategory(applicationForm.category),
        stipend:
          normalizeInternCategory(applicationForm.category) === "paid"
            ? Number(applicationForm.stipend) || 0
            : null,
        start_date: applicationForm.startDate,
        end_date: computedEndDate,
        status: "active",
        internshipId: String(selectedInternship.id),
        studentId: String(studentId),
      });

      addInternshipApplication(studentId, selectedInternship.id);
      setAppliedInternshipIds(getAppliedInternshipIds(studentId));
      queryClient.invalidateQueries({
        queryKey: queryKeys.studentDashboard(studentId),
      });
      setSelectedInternship(null);
      showToast("Internship application submitted.", "success", 2500);
    } catch (error) {
      const message = String(
        error?.response?.data?.message || "",
      ).toLowerCase();

      if (message.includes("already") && message.includes("applied")) {
        addInternshipApplication(studentId, selectedInternship.id);
        setAppliedInternshipIds(getAppliedInternshipIds(studentId));
        queryClient.invalidateQueries({
          queryKey: queryKeys.studentDashboard(studentId),
        });
        setSelectedInternship(null);
        showToast("You already applied for this internship.", "success", 2500);
      } else {
        showToast(
          error?.response?.data?.message ||
            "Failed to submit internship application.",
          "error",
          3000,
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Toast toast={toast} position="inline" />

      <h1 className="text-3xl font-bold text-slate-900">
        Explore Internship Opportunities
      </h1>
      <p className="text-gray-500 mt-1 mb-8">
        Discover the best opportunities from industry leaders.
      </p>

      {loading && (
        <div className="bg-white border border-dashed border-slate-300 rounded-xl px-5 py-6 text-sm text-slate-500 mb-8">
          Loading internships...
        </div>
      )}

      {!loading && !internshipList.length && (
        <div className="bg-white border border-dashed border-slate-300 rounded-xl px-5 py-6 text-sm text-slate-500 mb-8">
          No internships available right now. New internships added by admin
          will appear here.
        </div>
      )}

      {!loading &&
        internshipList.length > 0 &&
        filteredInternshipList.length === 0 && (
          <div className="bg-white border border-dashed border-slate-300 rounded-xl px-5 py-6 text-sm text-slate-500 mb-8">
            No internships match your search.
          </div>
        )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredInternshipList.map((internship) => (
          <InternshipCard
            key={internship.id}
            internship={internship}
            isApplied={appliedInternshipIds.includes(String(internship.id))}
            onApply={handleApplyInternship}
          />
        ))}
      </div>

      <AnimatePresence>
        {selectedInternship && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.div
              className="absolute inset-0 bg-black/45"
              variants={modalBackdropVariants}
              onClick={closeApplicationForm}
              aria-hidden="true"
            />
            <motion.div
              variants={modalPanelVariants}
              className="relative w-full max-w-2xl bg-white rounded-2xl border border-gray-200 shadow-2xl"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Apply For Internship
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedInternship.title}
                  </p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={closeApplicationForm}
                  className="text-gray-500 hover:text-gray-700 font-semibold rounded-sm cursor-pointer"
                >
                  Close
                </motion.button>
              </div>

              <form
                onSubmit={handleSubmitApplication}
                className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    name="category"
                    value={applicationForm.category}
                    disabled
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-100 text-gray-700 cursor-not-allowed"
                  >
                    <option value="paid">Paid</option>
                    <option value="free">Free</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stipend
                  </label>
                  <input
                    type="number"
                    min="0"
                    name="stipend"
                    value={applicationForm.stipend}
                    readOnly
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-100 text-gray-700"
                    placeholder="e.g. 8000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    ref={startDateInputRef}
                    type="date"
                    name="startDate"
                    value={applicationForm.startDate}
                    onChange={handleFormChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                    required
                  />
                </div>

                <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    type="button"
                    onClick={closeApplicationForm}
                    className="px-5 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-sm cursor-pointer"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    type="submit"
                    disabled={submitting}
                    className={`rounded-sm px-5 py-2 rounded-md text-white font-semibold ${
                      submitting
                        ? "bg-red-300 cursor-not-allowed"
                        : "bg-red-600 hover:bg-red-700"
                    }`}
                  >
                    {submitting ? "Submitting..." : "Submit Application"}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Internships;
