import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { selectStudentId } from "../store/slices/authSlice";
import { fetchStudentDashboardStatsQuery } from "../api/queryFns";
import { queryKeys } from "../api/queryKeys";

const StatCard = ({ label, value }) => (
  <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between min-h-[160px] w-full">
    <p className="text-gray-500 font-medium text-sm">{label}</p>
    <h3 className="text-4xl font-bold text-slate-800 mt-4">{value}</h3>
  </div>
);

const formatStat = (value) => String(value).padStart(2, "0");

const Dashboard = () => {
  const queryClient = useQueryClient();
  const studentId = useSelector(selectStudentId);
  const {
    data: stats = { enrolledCourses: 0, jobsApplied: 0, internshipsApplied: 0 },
  } = useQuery({
    queryKey: queryKeys.studentDashboard(studentId),
    queryFn: () => fetchStudentDashboardStatsQuery(studentId),
    enabled: Boolean(studentId),
    staleTime: 0,
  });

  // Cross-tab sync: another tab updated localStorage (job/internship applied)
  useEffect(() => {
    const handleStorageSync = () => {
      if (studentId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.studentDashboard(studentId),
        });
      }
    };

    window.addEventListener("storage", handleStorageSync);
    return () => {
      window.removeEventListener("storage", handleStorageSync);
    };
  }, [studentId, queryClient]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl">
      <StatCard
        label="enrolled courses"
        value={formatStat(stats.enrolledCourses)}
      />
      <StatCard label="jobs applied" value={formatStat(stats.jobsApplied)} />
      <StatCard
        label="internships applied"
        value={formatStat(stats.internshipsApplied)}
      />
    </div>
  );
};

export default Dashboard;
