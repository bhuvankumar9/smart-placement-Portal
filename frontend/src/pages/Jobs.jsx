import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { BriefcaseBusiness, Bookmark, MapPin } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Toast from "../components/Toast";
import useToast from "../hooks/useToast";
import { addJobApplication, getAppliedJobIds } from "../utils/studentActivity";
import { fetchJobsQuery } from "../api/queryFns";
import { queryKeys } from "../api/queryKeys";
import { selectStudentId } from "../store/slices/authSlice";
import { motion } from "framer-motion";

const normalizeJobUrl = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return "";

  if (/^https?:\/\//i.test(raw)) {
    return raw;
  }

  return `https://${raw}`;
};

export default function Jobs() {
  const queryClient = useQueryClient();
  const studentId = useSelector(selectStudentId);
  const [searchParams] = useSearchParams();
  const [brokenLogos, setBrokenLogos] = useState(new Set());
  const [appliedJobIds, setAppliedJobIds] = useState([]);
  const { toast, showToast } = useToast();
  const query = (searchParams.get("q") || "").trim().toLowerCase();

  const {
    data: jobList = [],
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: queryKeys.jobs,
    queryFn: fetchJobsQuery,
  });

  const loading = isLoading || isFetching;

  useEffect(() => {
    setAppliedJobIds(getAppliedJobIds(studentId));
  }, [studentId]);

  useEffect(() => {
    const handleStorage = () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs });
      setAppliedJobIds(getAppliedJobIds(studentId));
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [studentId, queryClient]);

  const handleLogoError = (id) => {
    setBrokenLogos((prev) => new Set(prev).add(id));
  };
  const filteredJobs = jobList.filter((job) => {
    if (!query) return true;

    return [job.position, job.company, job.location, job.salary].some((field) =>
      String(field ?? "")
        .toLowerCase()
        .includes(query),
    );
  });

  const handleApplyJob = (job) => {
    const jobId = String(job?.id);

    if (!jobId) {
      showToast("Invalid job selected.", "error", 2500);
      return;
    }

    if (!studentId) {
      showToast("Please login as student to apply.", "error", 2500);
      return;
    }

    const created = addJobApplication(studentId, jobId);
    setAppliedJobIds(getAppliedJobIds(studentId));
    queryClient.invalidateQueries({
      queryKey: queryKeys.studentDashboard(studentId),
    });

    if (!created) {
      showToast("You already applied for this job.", "success", 2500);
      return;
    }

    showToast("Job application submitted.", "success", 2500);

    const targetUrl = normalizeJobUrl(job?.jobURL);
    if (!targetUrl) {
      showToast("Job application link is not available.", "error", 3000);
      return;
    }

    window.location.assign(targetUrl);
  };

  return (
    <section className="bg-[#e8ebf0] rounded-xl border border-gray-200 p-4 md:p-6 space-y-6">
      <Toast toast={toast} position="inline" />

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Explore Job Openings
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Discover the best opportunities from industry leaders around the
            globe.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {loading && (
          <div className="bg-white border border-dashed border-slate-300 rounded-xl px-5 py-6 text-sm text-slate-500">
            Loading jobs...
          </div>
        )}

        {!loading && !jobList.length && (
          <div className="bg-white border border-dashed border-slate-300 rounded-xl px-5 py-6 text-sm text-slate-500">
            No jobs available right now. New openings added by admin will appear
            here.
          </div>
        )}

        {!loading && jobList.length > 0 && filteredJobs.length === 0 && (
          <div className="bg-white border border-dashed border-slate-300 rounded-xl px-5 py-6 text-sm text-slate-500">
            No jobs match your search.
          </div>
        )}

        {filteredJobs.map((job) => {
          const applied = appliedJobIds.includes(String(job.id));

          return (
            <article
              key={job.id}
              className="bg-white border border-slate-200 rounded-xl py-3 px-4 md:px-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
            >
              <div className="flex items-start gap-4">
                {job.logo && !brokenLogos.has(job.id) ? (
                  <img
                    src={job.logo}
                    alt={job.company}
                    className="w-10 h-10 rounded-lg object-contain border border-slate-100 shrink-0 bg-white"
                    onError={() => handleLogoError(job.id)}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-700 to-purple-900 text-white flex items-center justify-center shrink-0">
                    <BriefcaseBusiness size={18} />
                  </div>
                )}

                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    {job.position}
                  </h3>
                  <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1.5">
                      <BriefcaseBusiness size={12} />
                      {job.company}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin size={12} />
                      {job.location}
                    </span>
                    {job.salary && (
                      <span className="inline-flex items-center gap-1.5 text-green-600 font-medium">
                        {job.salary}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end md:self-auto">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  className="p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-sm cursor-pointer"
                  aria-label="Save job"
                >
                  <Bookmark size={17} />
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={() => handleApplyJob(job)}
                  disabled={applied}
                  className={`text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors ${
                    applied
                      ? "bg-emerald-600 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {applied ? "Applied" : "Apply Now"}
                </motion.button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
