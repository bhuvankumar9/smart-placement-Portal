import { memo, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Toast from "../../components/Toast";
import useToast from "../../hooks/useToast";
import {
  addPlacedStudent,
  deletePlacedStudent,
  getPlacedStudents,
  getPlacedStudentsUpdatedEventName,
  updatePlacedStudent,
} from "../../api/placedStudentsApi";
import { getStudents } from "../../api/studentsApi";
import {
  modalBackdropVariants,
  modalPanelVariants,
} from "../../utils/modalMotion";

const emptyForm = {
  company: "",
  position: "",
  salary: "",
  placementDate: "",
  img: "",
  studentId: "",
};

const formatDate = (value) => {
  if (!value) return "-";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return String(value);
  }

  return parsed.toLocaleDateString("en-GB");
};

const toInputDateValue = (value) => {
  if (!value) return "";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return parsed.toISOString().slice(0, 10);
};

const normalizePlacedStudent = (placedStudent, studentsById) => {
  const studentName =
    studentsById.get(Number(placedStudent.studentId))?.name || "Unknown";

  return {
    ...placedStudent,
    companyValue: placedStudent.company || "-",
    positionValue: placedStudent.position || "-",
    salaryValue:
      placedStudent.salary === null || placedStudent.salary === undefined
        ? "-"
        : String(placedStudent.salary),
    placementDateValue: placedStudent.placementDate || "",
    imgValue: placedStudent.img || "",
    studentName,
  };
};

function PlacedStudents() {
  const [placedStudents, setPlacedStudents] = useState([]);
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [formState, setFormState] = useState(emptyForm);
  const [searchInput, setSearchInput] = useState("");
  const [companyFilterInput, setCompanyFilterInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [appliedCompanyFilter, setAppliedCompanyFilter] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { toast, showToast } = useToast();

  const isEditing = editingId !== null;

  const studentsById = useMemo(
    () =>
      new Map(
        students
          .filter((student) => student && student.id !== undefined)
          .map((student) => [Number(student.id), student]),
      ),
    [students],
  );

  const normalizedPlacedStudents = useMemo(
    () =>
      placedStudents.map((placedStudent) =>
        normalizePlacedStudent(placedStudent, studentsById),
      ),
    [placedStudents, studentsById],
  );

  const companyOptions = useMemo(
    () => [
      ...new Set(
        normalizedPlacedStudents
          .map((item) => item.companyValue)
          .filter(Boolean),
      ),
    ],
    [normalizedPlacedStudents],
  );

  const filteredPlacedStudents = useMemo(() => {
    const search = appliedSearch.trim().toLowerCase();

    return normalizedPlacedStudents.filter((item) => {
      const matchesSearch =
        !search ||
        [
          item.studentName,
          item.companyValue,
          item.positionValue,
          item.salaryValue,
        ].some((field) => String(field).toLowerCase().includes(search));

      const matchesCompany =
        !appliedCompanyFilter || item.companyValue === appliedCompanyFilter;

      return matchesSearch && matchesCompany;
    });
  }, [normalizedPlacedStudents, appliedSearch, appliedCompanyFilter]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setLoadError("");
      const [placedStudentsData, studentsData] = await Promise.all([
        getPlacedStudents(),
        getStudents(),
      ]);
      setPlacedStudents(
        Array.isArray(placedStudentsData) ? placedStudentsData : [],
      );
      setStudents(Array.isArray(studentsData) ? studentsData : []);
    } catch (error) {
      console.error(error);
      setLoadError("Unable to load placed students data.");
      setPlacedStudents([]);
      setStudents([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const eventName = getPlacedStudentsUpdatedEventName();
    const syncPlacedStudents = () => {
      loadData();
    };

    window.addEventListener("storage", syncPlacedStudents);
    window.addEventListener(eventName, syncPlacedStudents);

    return () => {
      window.removeEventListener("storage", syncPlacedStudents);
      window.removeEventListener(eventName, syncPlacedStudents);
    };
  }, []);

  const handleApplyFilter = () => {
    setAppliedSearch(searchInput);
    setAppliedCompanyFilter(companyFilterInput);
  };

  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormState(emptyForm);
    setSubmitError("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (placedStudent) => {
    setEditingId(placedStudent.id);
    setFormState({
      company: placedStudent.company || "",
      position: placedStudent.position || "",
      salary:
        placedStudent.salary === null || placedStudent.salary === undefined
          ? ""
          : String(placedStudent.salary),
      placementDate: toInputDateValue(placedStudent.placementDate),
      img: placedStudent.img || "",
      studentId: String(placedStudent.studentId || ""),
    });
    setSubmitError("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setSubmitError("");
    setFormState(emptyForm);
  };

  const handleOpenDeleteModal = (id) => {
    setDeleteTargetId(id);
  };

  const handleCloseDeleteModal = () => {
    setDeleteTargetId(null);
  };

  const handleChangeField = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const toPayload = () => ({
    company: formState.company.trim(),
    position: formState.position.trim(),
    salary: formState.salary === "" ? null : Number(formState.salary),
    placementDate: formState.placementDate,
    img: formState.img.trim() || null,
    studentId: Number(formState.studentId),
  });

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = toPayload();

    if (
      !payload.company ||
      !payload.position ||
      !payload.placementDate ||
      !Number.isFinite(payload.studentId)
    ) {
      setSubmitError(
        "Company, position, placement date and student are required.",
      );
      return;
    }

    if (payload.salary !== null && !Number.isFinite(payload.salary)) {
      setSubmitError("Salary must be a valid number.");
      return;
    }

    try {
      setIsSaving(true);
      setSubmitError("");

      if (isEditing) {
        await updatePlacedStudent(editingId, payload);
        showToast("Placed student updated successfully.");
      } else {
        await addPlacedStudent(payload);
        showToast("Placed student added successfully.");
      }

      await loadData();
      handleCloseModal();
    } catch (error) {
      console.error(error);
      setSubmitError("Unable to save placed student. Please try again.");
      showToast("Unable to save placed student.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;

    try {
      await deletePlacedStudent(deleteTargetId);
      showToast("Placed student deleted successfully.");
      await loadData();
      handleCloseDeleteModal();

      if (editingId === deleteTargetId) {
        handleCloseModal();
      }
    } catch (error) {
      console.error(error);
      showToast("Unable to delete placed student.", "error");
    }
  };

  return (
    <div className="space-y-8">
      <Toast toast={toast} />

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Placed Students</h1>
        <motion.button
          whileTap={{ scale: 0.9 }}
          type="button"
          onClick={handleOpenAddModal}
          className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 text-sm font-bold transition-colors rounded-sm cursor-pointer"
        >
          + Add Placed Student
        </motion.button>
      </div>

      <div className="bg-white p-5 rounded-none shadow-sm border border-gray-100 flex gap-4 items-center flex-wrap">
        <input
          type="text"
          placeholder="Search by student, company or position"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          className="border border-gray-300 rounded-none px-4 py-2 w-72 text-sm focus:outline-none focus:ring-1 focus:ring-red-500 transition-all"
        />

        <select
          value={companyFilterInput}
          onChange={(event) => setCompanyFilterInput(event.target.value)}
          className="border border-gray-300 rounded-none px-4 py-2 w-56 text-sm focus:outline-none focus:ring-1 focus:ring-red-500 transition-all cursor-pointer"
        >
          <option value="">All Companies</option>
          {companyOptions.map((company) => (
            <option key={company} value={company}>
              {company}
            </option>
          ))}
        </select>

        <motion.button
          whileTap={{ scale: 0.9 }}
          type="button"
          onClick={handleApplyFilter}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 text-sm font-bold transition-colors rounded-sm cursor-pointer"
        >
          Apply Filter
        </motion.button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <h2 className="text-2xl font-semibold p-5">Placed Students List</h2>

        {isLoading && (
          <p className="px-5 pb-4 text-sm text-gray-500">
            Loading placed students...
          </p>
        )}
        {!isLoading && loadError && (
          <p className="px-5 pb-4 text-sm text-red-600">{loadError}</p>
        )}

        <div className="responsive-table-wrap">
          <table className="w-full">
            <thead className="bg-red-100 text-gray-700 text-sm">
              <tr>
                <th className="text-left p-4">Student</th>
                <th className="text-left p-4">Company</th>
                <th className="text-left p-4">Position</th>
                <th className="text-left p-4">Salary</th>
                <th className="text-left p-4">Placement Date</th>
                <th className="text-left p-4">Image</th>
                <th className="text-left p-4">Action</th>
              </tr>
            </thead>

            <tbody className="text-gray-600">
              {filteredPlacedStudents.map((item, index) => (
                <tr key={`${item.id}-${index}`} className="border-t">
                  <td className="p-4 font-medium text-gray-900">
                    {item.studentName}
                  </td>
                  <td className="p-4">{item.companyValue}</td>
                  <td className="p-4">{item.positionValue}</td>
                  <td className="p-4">{item.salaryValue}</td>
                  <td className="p-4 text-sm text-gray-500">
                    {formatDate(item.placementDateValue)}
                  </td>
                  <td className="p-4">
                    {item.imgValue ? (
                      <a
                        href={item.imgValue}
                        target="_blank"
                        rel="noreferrer"
                        className="text-red-600 hover:underline"
                      >
                        View Image
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        type="button"
                        onClick={() => handleOpenEditModal(item)}
                        className="inline-flex items-center px-3 py-1.5 rounded-sm border border-gray-300 text-gray-800 bg-white hover:bg-gray-100 font-semibold transition-colors cursor-pointer"
                      >
                        Edit
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        type="button"
                        onClick={() => handleOpenDeleteModal(item.id)}
                        className="inline-flex items-center px-3 py-1.5 rounded-sm border border-red-200 text-red-700 bg-red-50 hover:bg-red-600 hover:text-white font-semibold transition-colors cursor-pointer"
                      >
                        Delete
                      </motion.button>
                    </div>
                  </td>
                </tr>
              ))}

              {!isLoading && filteredPlacedStudents.length === 0 && (
                <tr>
                  <td
                    colSpan="7"
                    className="p-6 text-center text-sm text-gray-500"
                  >
                    No placed students found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.div
              className="fixed inset-0 bg-slate-900/45 z-40"
              variants={modalBackdropVariants}
              onClick={handleCloseModal}
              aria-hidden="true"
            />

            <motion.div
              variants={modalPanelVariants}
              className="relative z-50 w-full max-w-3xl bg-white rounded-xl border border-gray-100 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">
                  {isEditing ? "Edit Placed Student" : "Add Placed Student"}
                </h3>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={handleCloseModal}
                  className="text-sm px-3 py-1.5 border border-gray-300 hover:bg-gray-100 rounded-sm cursor-pointer"
                >
                  Close
                </motion.button>
              </div>

              <form
                onSubmit={handleSubmit}
                className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="placed-student"
                    className="text-sm font-medium text-gray-700"
                  >
                    Student
                  </label>
                  <select
                    id="placed-student"
                    name="studentId"
                    value={formState.studentId}
                    onChange={handleChangeField}
                    className="border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-500 cursor-pointer"
                    required
                  >
                    <option value="">Select Student</option>
                    {students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.name} ({student.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="placed-company"
                    className="text-sm font-medium text-gray-700"
                  >
                    Company
                  </label>
                  <input
                    id="placed-company"
                    type="text"
                    name="company"
                    value={formState.company}
                    onChange={handleChangeField}
                    placeholder="Company"
                    className="border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="placed-position"
                    className="text-sm font-medium text-gray-700"
                  >
                    Position
                  </label>
                  <input
                    id="placed-position"
                    type="text"
                    name="position"
                    value={formState.position}
                    onChange={handleChangeField}
                    placeholder="Position"
                    className="border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="placed-salary"
                    className="text-sm font-medium text-gray-700"
                  >
                    Salary
                  </label>
                  <input
                    id="placed-salary"
                    type="number"
                    min="0"
                    name="salary"
                    value={formState.salary}
                    onChange={handleChangeField}
                    placeholder="Salary"
                    className="border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="placed-placement-date"
                    className="text-sm font-medium text-gray-700"
                  >
                    Placement Date
                  </label>
                  <input
                    id="placed-placement-date"
                    type="date"
                    name="placementDate"
                    value={formState.placementDate}
                    onChange={handleChangeField}
                    className="border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                    required
                  />
                </div>

                <div className="md:col-span-2 flex flex-col gap-1">
                  <label
                    htmlFor="placed-image"
                    className="text-sm font-medium text-gray-700"
                  >
                    Image URL (optional)
                  </label>
                  <input
                    id="placed-image"
                    type="url"
                    name="img"
                    value={formState.img}
                    onChange={handleChangeField}
                    placeholder="https://..."
                    className="border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>

                {submitError && (
                  <p className="md:col-span-2 text-sm text-red-600">
                    {submitError}
                  </p>
                )}

                <div className="md:col-span-2 flex gap-3 justify-end">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    type="button"
                    onClick={handleCloseModal}
                    className="border border-gray-300 hover:bg-gray-100 text-gray-700 px-6 py-2 text-sm font-semibold transition-colors rounded-sm cursor-pointer"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    type="submit"
                    disabled={isSaving}
                    className="bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white px-6 py-2 text-sm font-bold transition-colors rounded-sm cursor-pointer"
                  >
                    {isSaving
                      ? "Saving..."
                      : isEditing
                        ? "Update Placed Student"
                        : "Save Placed Student"}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
              onClick={handleCloseDeleteModal}
              aria-hidden="true"
            />
            <motion.div
              variants={modalPanelVariants}
              className="relative z-50 w-full max-w-md bg-white rounded-xl border border-gray-200 shadow-2xl"
            >
              <div className="px-6 pt-6 pb-4 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900">
                  Delete Placed Student
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Are you sure you want to delete this placed student? This
                  action cannot be undone.
                </p>
              </div>
              <div className="px-6 py-4 flex justify-end gap-3">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={handleCloseDeleteModal}
                  className="px-4 py-2 text-sm font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-sm cursor-pointer"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={handleDelete}
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

export default memo(PlacedStudents);
