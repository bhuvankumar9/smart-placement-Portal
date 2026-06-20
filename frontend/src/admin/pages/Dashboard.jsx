import {
  Users,
  BookOpen,
  Briefcase,
  Trophy,
  X,
  Building2,
  Layers3,
  BarChart3,
  TrendingUp,
  CalendarDays,
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Bar, Doughnut, Line, Pie, Radar } from "react-chartjs-2";
import { Link } from "react-router-dom";
import { memo, useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import StudentForm from "../../components/StudentForm";
import Toast from "../../components/Toast";
import useToast from "../../hooks/useToast";
import { AnimatePresence, motion } from "framer-motion";
import {
  modalBackdropVariants,
  modalPanelVariants,
} from "../../utils/modalMotion";
import { addStudent, getStudentsUpdatedEventName } from "../../api/studentsApi";
import { getCoursesUpdatedEventName } from "../../api/coursesApi";
import { getInternshipsUpdatedEventName } from "../../api/internshipsApi";
import { getJobsUpdatedEventName } from "../../api/jobsApi";
import {
  fetchAdminDashboardQuery,
  fetchAdminInsightsQuery,
} from "../../api/queryFns";
import { queryKeys } from "../../api/queryKeys";

ChartJS.register(
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Tooltip,
  Legend,
  Filler,
);

const dashboardViews = [
  { id: "home", label: "Home" },
  { id: "coursePlacement", label: "Course & Placement" },
  { id: "internData", label: "Intern Data" },
];

const fallbackDashboardData = {
  stats: {
    totalStudents: 0,
    activeCourses: 0,
    internships: 0,
    placements: 0,
  },
  recentStudents: [],
};

const safeText = (value) => String(value || "").trim();

const monthKey = (value) => {
  if (!value) return "Unknown";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Unknown";
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

const monthLabel = (key) => {
  if (!key || key === "Unknown") return "Unknown";
  const [year, month] = String(key).split("-");
  const parsed = new Date(Number(year), Number(month) - 1, 1);
  if (Number.isNaN(parsed.getTime())) return "Unknown";
  return parsed.toLocaleString("en-US", { month: "short", year: "2-digit" });
};

const dateKey = (value) => {
  if (!value) return "Unknown";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Unknown";
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const dateLabel = (key) => {
  if (!key || key === "Unknown") return "Unknown";
  const [year, month, day] = String(key).split("-");
  const parsed = new Date(Number(year), Number(month) - 1, Number(day));
  if (Number.isNaN(parsed.getTime())) return "Unknown";
  return parsed.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
  });
};

const getStudentTimelineDate = (student) =>
  student?.createdAt || student?.admissionDate || student?.updatedAt || null;

const InsightCard = ({
  title,
  value,
  subtitle,
  icon,
  chipClass = "bg-red-50 text-red-700",
}) => (
  <div className="bg-white border border-slate-100 rounded-xl p-4 sm:p-5 shadow-sm">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-500">
          {title}
        </p>
        <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
          {value}
        </h3>
        <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
      </div>
      <div className={`rounded-lg p-2.5 ${chipClass}`}>{icon}</div>
    </div>
  </div>
);

const chartLegendStyle = {
  labels: {
    boxWidth: 10,
    boxHeight: 10,
    usePointStyle: true,
    pointStyle: "circle",
    color: "#334155",
  },
};

const chartTickColor = "#64748b";

const defaultLineOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      ...chartLegendStyle,
      position: "bottom",
    },
  },
  scales: {
    x: {
      ticks: { color: chartTickColor },
      grid: { display: false },
    },
    y: {
      beginAtZero: true,
      ticks: { color: chartTickColor, precision: 0 },
      grid: { color: "rgba(148, 163, 184, 0.2)" },
    },
  },
};

const defaultBarOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
  },
  scales: {
    x: {
      ticks: { color: chartTickColor },
      grid: { display: false },
    },
    y: {
      beginAtZero: true,
      ticks: { color: chartTickColor, precision: 0 },
      grid: { color: "rgba(148, 163, 184, 0.2)" },
    },
  },
};

const defaultHorizontalBarOptions = {
  ...defaultBarOptions,
  indexAxis: "y",
};

const defaultDoughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: "62%",
  plugins: {
    legend: {
      ...chartLegendStyle,
      position: "bottom",
    },
  },
};

const internshipStatusPalette = [
  "#2563eb",
  "#0ea5e9",
  "#22c55e",
  "#f97316",
  "#a855f7",
  "#e11d48",
];

const topCompaniesPalette = [
  "rgba(15, 23, 42, 0.9)",
  "rgba(30, 41, 59, 0.88)",
  "rgba(51, 65, 85, 0.86)",
  "rgba(71, 85, 105, 0.84)",
  "rgba(100, 116, 139, 0.82)",
];

const defaultRadarOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      ...chartLegendStyle,
      position: "bottom",
    },
  },
  scales: {
    r: {
      beginAtZero: true,
      ticks: {
        color: chartTickColor,
        precision: 0,
        backdropColor: "transparent",
      },
      grid: {
        color: "rgba(148, 163, 184, 0.24)",
      },
      angleLines: {
        color: "rgba(148, 163, 184, 0.24)",
      },
      pointLabels: {
        color: "#475569",
        font: {
          size: 11,
        },
      },
    },
  },
};

function Dashboard() {
  const queryClient = useQueryClient();
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

  const {
    data: dashboardData = fallbackDashboardData,
    isLoading: dashboardLoading,
  } = useQuery({
    queryKey: queryKeys.adminDashboard,
    queryFn: fetchAdminDashboardQuery,
  });

  const {
    data: insightData = {
      courses: [],
      enrollments: [],
      internships: [],
      jobs: [],
      placedStudents: [],
      students: [],
    },
    isLoading: insightLoading,
  } = useQuery({
    queryKey: queryKeys.adminInsights,
    queryFn: fetchAdminInsightsQuery,
  });

  const [activeView, setActiveView] = useState("home");
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [studentTrendView, setStudentTrendView] = useState("month");
  const [hoveredEnrollmentIndex, setHoveredEnrollmentIndex] = useState(null);
  const [hoveredCompanyIndex, setHoveredCompanyIndex] = useState(null);
  const [hoveredInternTimelineIndex, setHoveredInternTimelineIndex] =
    useState(null);
  const [formData, setFormData] = useState(initialForm);
  const { toast, showToast } = useToast();

  const derived = useMemo(() => {
    const courses = Array.isArray(insightData.courses)
      ? insightData.courses
      : [];
    const enrollments = Array.isArray(insightData.enrollments)
      ? insightData.enrollments
      : [];
    const internships = Array.isArray(insightData.internships)
      ? insightData.internships
      : [];
    const jobs = Array.isArray(insightData.jobs) ? insightData.jobs : [];
    const placedStudents = Array.isArray(insightData.placedStudents)
      ? insightData.placedStudents
      : [];
    const students = Array.isArray(insightData.students)
      ? insightData.students
      : [];

    const totalStudents = Number(
      dashboardData.stats.totalStudents || students.length || 0,
    );
    const totalPlaced = Number(
      dashboardData.stats.placements || placedStudents.length || 0,
    );
    const placementRate =
      totalStudents > 0
        ? ((totalPlaced / totalStudents) * 100).toFixed(1)
        : "0.0";

    const enrollmentsByCourseId = enrollments.reduce((acc, item) => {
      const key = Number(item.courseId) || 0;
      if (!key) return acc;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const placedByCourseKey = placedStudents.reduce((acc, student) => {
      const courseKey =
        Number(student.courseId) ||
        safeText(student.course || student.courseName || student.courseTitle);

      if (!courseKey) return acc;
      acc[courseKey] = (acc[courseKey] || 0) + 1;
      return acc;
    }, {});

    const courseEnrollmentRows = courses
      .map((course) => ({
        id: course.id,
        title: safeText(course.title) || `Course ${course.id}`,
        enrolled: enrollmentsByCourseId[Number(course.id)] || 0,
      }))
      .sort((a, b) => b.enrolled - a.enrolled)
      .slice(0, 6);

    const admissionsByMonth = students.reduce((acc, student) => {
      const key = monthKey(getStudentTimelineDate(student));
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const monthTrendRows = Object.entries(admissionsByMonth)
      .map(([key, count]) => ({ key, label: monthLabel(key), count }))
      .filter((item) => item.key !== "Unknown")
      .sort((a, b) => a.key.localeCompare(b.key))
      .slice(-12);

    const admissionsByDate = students.reduce((acc, student) => {
      const key = dateKey(getStudentTimelineDate(student));
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const dateTrendRows = Object.entries(admissionsByDate)
      .map(([key, count]) => ({ key, label: dateLabel(key), count }))
      .filter((item) => item.key !== "Unknown")
      .sort((a, b) => a.key.localeCompare(b.key))
      .slice(-14);

    const latestDateRow = dateTrendRows[dateTrendRows.length - 1] || null;
    const peakDateRow = [...dateTrendRows].sort((a, b) => b.count - a.count)[0];

    const coursePlacementRows = courses
      .map((course) => {
        const numericKey = Number(course.id) || 0;
        const nameKey = safeText(course.title);
        const enrolled = enrollmentsByCourseId[numericKey] || 0;
        const placed =
          placedByCourseKey[numericKey] || placedByCourseKey[nameKey] || 0;

        return {
          id: numericKey || nameKey,
          title: nameKey || `Course ${course.id}`,
          enrolled,
          placed,
          placementRate:
            enrolled > 0 ? Number(((placed / enrolled) * 100).toFixed(1)) : 0,
        };
      })
      .sort((a, b) => b.enrolled - a.enrolled)
      .slice(0, 6);

    const internshipByMonth = internships.reduce((acc, internship) => {
      const key = monthKey(internship.createdAt || internship.startDate);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const jobsByMonth = jobs.reduce((acc, job) => {
      const key = monthKey(job.createdAt || job.updatedAt || job.date);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const internTimelineRows = Array.from(
      new Set([...Object.keys(internshipByMonth), ...Object.keys(jobsByMonth)]),
    )
      .filter((key) => key !== "Unknown")
      .sort((a, b) => a.localeCompare(b))
      .slice(-6)
      .map((key) => ({
        key,
        label: monthLabel(key),
        internships: internshipByMonth[key] || 0,
        jobs: jobsByMonth[key] || 0,
      }));

    const placementTypeRows = placedStudents.reduce((acc, student) => {
      const label = safeText(
        student.placementType || student.type || "Unknown",
      );
      acc[label] = (acc[label] || 0) + 1;
      return acc;
    }, {});

    const placementTypeChart = Object.entries(placementTypeRows).map(
      ([label, count]) => ({ label, count }),
    );

    const internshipStatusRows = internships.reduce((acc, internship) => {
      const label = safeText(internship.status || "Open");
      acc[label] = (acc[label] || 0) + 1;
      return acc;
    }, {});

    const internshipStatusChart = Object.entries(internshipStatusRows).map(
      ([label, count]) => ({ label, count }),
    );

    const internshipCategoryRows = internships.reduce((acc, internship) => {
      const label = safeText(internship.category || "Unspecified");
      acc[label] = (acc[label] || 0) + 1;
      return acc;
    }, {});

    const internshipCategoryChart = Object.entries(internshipCategoryRows).map(
      ([label, count]) => ({ label, count }),
    );

    const companiesRows = jobs.reduce((acc, job) => {
      const company = safeText(job.company || "Unknown");
      acc[company] = (acc[company] || 0) + 1;
      return acc;
    }, {});

    const topCompanies = Object.entries(companiesRows)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const paidInternships = internships.filter(
      (item) => safeText(item.category).toLowerCase() === "paid",
    ).length;
    const openInternships = internships.filter((item) =>
      ["open", "active"].includes(safeText(item.status).toLowerCase()),
    ).length;

    return {
      totalStudents,
      totalPlaced,
      placementRate,
      courseEnrollmentRows,
      monthTrendRows,
      dateTrendRows,
      latestAdmissionDate: latestDateRow?.label || "-",
      latestAdmissionCount: latestDateRow?.count || 0,
      peakAdmissionDate: peakDateRow?.label || "-",
      peakAdmissionCount: peakDateRow?.count || 0,
      coursePlacementRows,
      internTimelineRows,
      placementTypeChart,
      internshipStatusChart,
      internshipCategoryChart,
      topCompanies,
      openInternships,
      paidInternships,
      jobsCount: jobs.length,
      internshipsCount: internships.length,
      enrollmentsCount: enrollments.length,
    };
  }, [insightData, dashboardData]);

  const hoveredEnrollmentCourse = useMemo(() => {
    if (!derived.courseEnrollmentRows.length) return null;

    if (
      hoveredEnrollmentIndex !== null &&
      derived.courseEnrollmentRows[hoveredEnrollmentIndex]
    ) {
      return derived.courseEnrollmentRows[hoveredEnrollmentIndex];
    }

    return derived.courseEnrollmentRows[0];
  }, [derived.courseEnrollmentRows, hoveredEnrollmentIndex]);

  const courseEnrollmentFunnelOptions = useMemo(
    () => ({
      ...defaultHorizontalBarOptions,
      interaction: {
        mode: "nearest",
        axis: "y",
        intersect: false,
      },
      plugins: {
        ...defaultHorizontalBarOptions.plugins,
        tooltip: {
          callbacks: {
            title: (items) => items?.[0]?.label || "Course",
            label: (context) => `Enrolled Students: ${context.parsed.x}`,
            afterLabel: (context) => {
              const total = Number(derived.enrollmentsCount || 0);
              const share =
                total > 0
                  ? ((Number(context.parsed.x || 0) / total) * 100).toFixed(1)
                  : "0.0";
              return `Share of total enrollments: ${share}%`;
            },
          },
        },
      },
      onHover: (_, activeElements, chart) => {
        chart.canvas.style.cursor = activeElements.length
          ? "pointer"
          : "default";
        if (!activeElements.length) return;
        const nextIndex = activeElements[0].index;
        if (nextIndex !== hoveredEnrollmentIndex) {
          setHoveredEnrollmentIndex(nextIndex);
        }
      },
    }),
    [derived.enrollmentsCount, hoveredEnrollmentIndex],
  );

  const internClusteredPremiumOptions = useMemo(
    () => ({
      ...defaultBarOptions,
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: "index",
        intersect: false,
      },
      plugins: {
        ...defaultBarOptions.plugins,
        legend: {
          ...chartLegendStyle,
          position: "bottom",
        },
        tooltip: {
          callbacks: {
            title: (items) => items?.[0]?.label || "Month",
            label: (context) => `${context.dataset.label}: ${context.parsed.y}`,
            footer: (items) => {
              const internships =
                items.find((item) => item.dataset.label === "Internships")
                  ?.parsed.y || 0;
              const jobs =
                items.find((item) => item.dataset.label === "Jobs")?.parsed.y ||
                0;
              return `Total Opportunities: ${internships + jobs}`;
            },
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: chartTickColor,
            maxRotation: 0,
          },
          grid: { display: false },
        },
        y: {
          beginAtZero: true,
          ticks: { color: chartTickColor, precision: 0 },
          grid: { color: "rgba(148, 163, 184, 0.22)" },
        },
      },
    }),
    [],
  );

  const topCompaniesPremiumOptions = useMemo(
    () => ({
      ...defaultHorizontalBarOptions,
      interaction: {
        mode: "nearest",
        axis: "y",
        intersect: false,
      },
      plugins: {
        ...defaultHorizontalBarOptions.plugins,
        tooltip: {
          callbacks: {
            title: (items) => items?.[0]?.label || "Company",
            label: (context) => `Openings: ${context.parsed.x}`,
            afterLabel: (context) => {
              const total = derived.topCompanies.reduce(
                (acc, item) => acc + Number(item.count || 0),
                0,
              );
              const share =
                total > 0
                  ? ((Number(context.parsed.x || 0) / total) * 100).toFixed(1)
                  : "0.0";
              return `Contribution: ${share}%`;
            },
          },
        },
      },
      onHover: (_, activeElements, chart) => {
        chart.canvas.style.cursor = activeElements.length
          ? "pointer"
          : "default";
        if (!activeElements.length) return;
        const nextIndex = activeElements[0].index;
        if (nextIndex !== hoveredCompanyIndex) {
          setHoveredCompanyIndex(nextIndex);
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: {
            color: chartTickColor,
            precision: 0,
          },
          grid: { color: "rgba(148, 163, 184, 0.18)" },
        },
        y: {
          ticks: { color: chartTickColor },
          grid: { display: false },
        },
      },
    }),
    [derived.topCompanies, hoveredCompanyIndex],
  );

  const internTimelinePremiumOptions = useMemo(
    () => ({
      ...defaultLineOptions,
      interaction: {
        mode: "index",
        intersect: false,
      },
      plugins: {
        ...defaultLineOptions.plugins,
        legend: {
          ...chartLegendStyle,
          position: "bottom",
          labels: {
            ...chartLegendStyle.labels,
            boxWidth: 12,
            boxHeight: 12,
          },
        },
        tooltip: {
          callbacks: {
            title: (items) => items?.[0]?.label || "Month",
            label: (context) => `${context.dataset.label}: ${context.parsed.y}`,
            footer: (items) => {
              const internships =
                items.find((item) => item.dataset.label === "Internships")
                  ?.parsed.y || 0;
              const jobs =
                items.find((item) => item.dataset.label === "Jobs")?.parsed.y ||
                0;
              return `Total Opportunities: ${internships + jobs}`;
            },
          },
        },
      },
      onHover: (_, activeElements, chart) => {
        chart.canvas.style.cursor = activeElements.length
          ? "pointer"
          : "default";
        if (!activeElements.length) return;
        const nextIndex = activeElements[0].index;
        if (nextIndex !== hoveredInternTimelineIndex) {
          setHoveredInternTimelineIndex(nextIndex);
        }
      },
      scales: {
        x: {
          ticks: {
            color: chartTickColor,
            maxRotation: 0,
          },
          grid: {
            color: "rgba(148, 163, 184, 0.12)",
          },
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: chartTickColor,
            precision: 0,
          },
          grid: {
            color: "rgba(148, 163, 184, 0.18)",
          },
        },
      },
    }),
    [hoveredInternTimelineIndex],
  );

  const charts = useMemo(() => {
    const courseEnrollment = {
      labels: derived.courseEnrollmentRows.map((item) => item.title),
      datasets: [
        {
          label: "Enrolled Students",
          data: derived.courseEnrollmentRows.map((item) => item.enrolled),
          backgroundColor: "rgba(239, 68, 68, 0.75)",
          borderRadius: 6,
          maxBarThickness: 36,
        },
      ],
    };

    const admissionTrend = {
      labels: derived.monthTrendRows.map((item) => item.label),
      datasets: [
        {
          label: "Admissions",
          data: derived.monthTrendRows.map((item) => item.count),
          borderColor: "#f97316",
          backgroundColor: "rgba(249, 115, 22, 0.2)",
          fill: true,
          tension: 0.35,
          pointRadius: 4,
          pointBackgroundColor: "#f97316",
        },
      ],
    };

    const admissionTrendByDate = {
      labels: derived.dateTrendRows.map((item) => item.label),
      datasets: [
        {
          label: "Students Added",
          data: derived.dateTrendRows.map((item) => item.count),
          borderColor: "#2563eb",
          backgroundColor: "rgba(37, 99, 235, 0.18)",
          fill: true,
          tension: 0.3,
          pointRadius: 4,
          pointBackgroundColor: "#2563eb",
        },
      ],
    };

    const placementType = {
      labels: derived.placementTypeChart.map((item) => item.label),
      datasets: [
        {
          label: "Placement Count",
          data: derived.placementTypeChart.map((item) => item.count),
          backgroundColor: "rgba(99, 102, 241, 0.8)",
          borderRadius: 6,
          maxBarThickness: 36,
        },
      ],
    };

    const placementOverview = {
      labels: ["Placed", "Unplaced"],
      datasets: [
        {
          label: "Students",
          data: [
            derived.totalPlaced,
            Math.max(derived.totalStudents - derived.totalPlaced, 0),
          ],
          backgroundColor: ["#22c55e", "#ef4444"],
          borderWidth: 0,
        },
      ],
    };

    const courseClusteredColumn = {
      labels: derived.coursePlacementRows.map((item) => item.title),
      datasets: [
        {
          label: "Enrolled",
          data: derived.coursePlacementRows.map((item) => item.enrolled),
          borderColor: "rgba(249, 115, 22, 0.95)",
          backgroundColor: "rgba(249, 115, 22, 0.25)",
          pointBackgroundColor: "rgba(249, 115, 22, 1)",
          pointBorderColor: "#ffffff",
          pointRadius: 4,
          pointHoverRadius: 6,
          fill: true,
          tension: 0.3,
        },
        {
          label: "Placed",
          data: derived.coursePlacementRows.map((item) => item.placed),
          borderColor: "rgba(37, 99, 235, 0.95)",
          backgroundColor: "rgba(37, 99, 235, 0.20)",
          pointBackgroundColor: "rgba(37, 99, 235, 1)",
          pointBorderColor: "#ffffff",
          pointRadius: 4,
          pointHoverRadius: 6,
          fill: true,
          tension: 0.3,
        },
      ],
    };

    const placementArea = {
      labels: derived.coursePlacementRows.map((item) => item.title),
      datasets: [
        {
          label: "Placement Rate %",
          data: derived.coursePlacementRows.map((item) => item.placementRate),
          borderColor: "#6366f1",
          backgroundColor: "rgba(99, 102, 241, 0.25)",
          fill: true,
          tension: 0.35,
          pointRadius: 4,
          pointBackgroundColor: "#6366f1",
        },
      ],
    };

    const internshipStatus = {
      labels: derived.internshipStatusChart.map((item) => item.label),
      datasets: [
        {
          label: "Internships",
          data: derived.internshipStatusChart.map((item) => item.count),
          backgroundColor: derived.internshipStatusChart.map(
            (_, index) =>
              internshipStatusPalette[index % internshipStatusPalette.length],
          ),
          borderColor: "#ffffff",
          borderWidth: 2,
          hoverOffset: 10,
        },
      ],
    };

    const internshipCategory = {
      labels: derived.internshipCategoryChart.map((item) => item.label),
      datasets: [
        {
          label: "Category",
          data: derived.internshipCategoryChart.map((item) => item.count),
          backgroundColor: ["#16a34a", "#0ea5e9", "#f97316", "#a855f7"],
          borderWidth: 0,
        },
      ],
    };

    const internTimeline = {
      labels: derived.internTimelineRows.map((item) => item.label),
      datasets: [
        {
          label: "Internships",
          data: derived.internTimelineRows.map((item) => item.internships),
          borderColor: "#0ea5e9",
          backgroundColor: (context) => {
            const { chart } = context;
            const { ctx, chartArea } = chart;
            if (!chartArea) return "rgba(14, 165, 233, 0.24)";

            const gradient = ctx.createLinearGradient(
              0,
              chartArea.top,
              0,
              chartArea.bottom,
            );
            gradient.addColorStop(0, "rgba(14, 165, 233, 0.42)");
            gradient.addColorStop(1, "rgba(14, 165, 233, 0.06)");
            return gradient;
          },
          fill: true,
          tension: 0.42,
          pointRadius: 4.5,
          pointHoverRadius: 7,
          pointBorderWidth: 2,
          pointBorderColor: "#ffffff",
          pointBackgroundColor: "#0ea5e9",
          borderWidth: 2.5,
        },
        {
          label: "Jobs",
          data: derived.internTimelineRows.map((item) => item.jobs),
          borderColor: "#22c55e",
          backgroundColor: (context) => {
            const { chart } = context;
            const { ctx, chartArea } = chart;
            if (!chartArea) return "rgba(34, 197, 94, 0.2)";

            const gradient = ctx.createLinearGradient(
              0,
              chartArea.top,
              0,
              chartArea.bottom,
            );
            gradient.addColorStop(0, "rgba(34, 197, 94, 0.34)");
            gradient.addColorStop(1, "rgba(34, 197, 94, 0.06)");
            return gradient;
          },
          fill: true,
          tension: 0.42,
          pointRadius: 4.5,
          pointHoverRadius: 7,
          pointBorderWidth: 2,
          pointBorderColor: "#ffffff",
          pointBackgroundColor: "#22c55e",
          borderWidth: 2.5,
        },
      ],
    };

    const internClusteredColumn = {
      labels: derived.internTimelineRows.map((item) => item.label),
      datasets: [
        {
          label: "Internships",
          data: derived.internTimelineRows.map((item) => item.internships),
          backgroundColor: "rgba(37, 99, 235, 0.88)",
          hoverBackgroundColor: "rgba(37, 99, 235, 1)",
          borderRadius: 8,
          borderSkipped: false,
          maxBarThickness: 30,
          barPercentage: 0.58,
          categoryPercentage: 0.62,
        },
        {
          label: "Jobs",
          data: derived.internTimelineRows.map((item) => item.jobs),
          backgroundColor: "rgba(249, 115, 22, 0.88)",
          hoverBackgroundColor: "rgba(249, 115, 22, 1)",
          borderRadius: 8,
          borderSkipped: false,
          maxBarThickness: 30,
          barPercentage: 0.58,
          categoryPercentage: 0.62,
        },
      ],
    };

    const topCompanies = {
      labels: derived.topCompanies.map((item) => item.label),
      datasets: [
        {
          label: "Openings",
          data: derived.topCompanies.map((item) => item.count),
          backgroundColor: derived.topCompanies.map(
            (_, index) =>
              topCompaniesPalette[index % topCompaniesPalette.length],
          ),
          hoverBackgroundColor: "rgba(15, 23, 42, 0.95)",
          borderColor: "rgba(255, 255, 255, 0.85)",
          borderWidth: 1,
          borderRadius: 8,
          borderSkipped: false,
          maxBarThickness: 30,
          barPercentage: 0.62,
          categoryPercentage: 0.68,
        },
      ],
    };

    return {
      courseEnrollment,
      admissionTrend,
      admissionTrendByDate,
      placementType,
      placementOverview,
      courseClusteredColumn,
      placementArea,
      internshipStatus,
      internshipCategory,
      internTimeline,
      internClusteredColumn,
      topCompanies,
    };
  }, [derived]);

  const internshipStatusMeta = useMemo(() => {
    const labels = charts.internshipStatus.labels || [];
    const values = charts.internshipStatus.datasets?.[0]?.data || [];
    const total = values.reduce((acc, item) => acc + Number(item || 0), 0);

    return labels.map((label, index) => {
      const value = Number(values[index] || 0);
      const percent = total > 0 ? ((value / total) * 100).toFixed(1) : "0.0";

      return {
        label,
        value,
        percent,
        color: internshipStatusPalette[index % internshipStatusPalette.length],
      };
    });
  }, [charts.internshipStatus]);

  const internshipStatusTotal = useMemo(
    () =>
      internshipStatusMeta.reduce(
        (acc, item) => acc + Number(item.value || 0),
        0,
      ),
    [internshipStatusMeta],
  );

  const internshipStatusCenterLabelPlugin = useMemo(
    () => ({
      id: "internshipStatusCenterLabel",
      beforeDraw(chart) {
        const { ctx } = chart;
        const meta = chart.getDatasetMeta(0);
        if (!meta?.data?.length) return;

        const x = meta.data[0].x;
        const y = meta.data[0].y;

        ctx.save();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.fillStyle = "#64748b";
        ctx.font = "600 11px Inter, system-ui, sans-serif";
        ctx.fillText("Total Internships", x, y - 10);

        ctx.fillStyle = "#0f172a";
        ctx.font = "700 24px Inter, system-ui, sans-serif";
        ctx.fillText(String(internshipStatusTotal), x, y + 14);
        ctx.restore();
      },
    }),
    [internshipStatusTotal],
  );

  const internTimelineTotals = useMemo(
    () => ({
      internships: derived.internTimelineRows.reduce(
        (acc, item) => acc + Number(item.internships || 0),
        0,
      ),
      jobs: derived.internTimelineRows.reduce(
        (acc, item) => acc + Number(item.jobs || 0),
        0,
      ),
    }),
    [derived.internTimelineRows],
  );

  const internTimelineMeta = useMemo(() => {
    const rows = derived.internTimelineRows;
    const latest = rows[rows.length - 1] || null;
    const previous = rows[rows.length - 2] || null;
    const latestTotal = latest
      ? Number(latest.internships || 0) + Number(latest.jobs || 0)
      : 0;
    const previousTotal = previous
      ? Number(previous.internships || 0) + Number(previous.jobs || 0)
      : 0;
    const growthPercent =
      previousTotal > 0
        ? (((latestTotal - previousTotal) / previousTotal) * 100).toFixed(1)
        : latestTotal > 0
          ? "100.0"
          : "0.0";

    return {
      growthPercent,
    };
  }, [derived.internTimelineRows]);

  const highlightedInternTimelineRow = useMemo(() => {
    if (!derived.internTimelineRows.length) return null;
    if (
      hoveredInternTimelineIndex !== null &&
      derived.internTimelineRows[hoveredInternTimelineIndex]
    ) {
      return derived.internTimelineRows[hoveredInternTimelineIndex];
    }

    return derived.internTimelineRows[derived.internTimelineRows.length - 1];
  }, [derived.internTimelineRows, hoveredInternTimelineIndex]);

  const topCompaniesMeta = useMemo(() => {
    const totalOpenings = derived.topCompanies.reduce(
      (acc, item) => acc + Number(item.count || 0),
      0,
    );
    const leaderCount = Number(derived.topCompanies[0]?.count || 0);

    return derived.topCompanies.map((company, index) => ({
      ...company,
      rank: index + 1,
      color: topCompaniesPalette[index % topCompaniesPalette.length],
      gapToLeader: Math.max(leaderCount - Number(company.count || 0), 0),
      share:
        totalOpenings > 0
          ? ((Number(company.count || 0) / totalOpenings) * 100).toFixed(1)
          : "0.0",
    }));
  }, [derived.topCompanies]);

  const highlightedCompany = useMemo(() => {
    if (!topCompaniesMeta.length) return null;
    if (hoveredCompanyIndex !== null && topCompaniesMeta[hoveredCompanyIndex]) {
      return topCompaniesMeta[hoveredCompanyIndex];
    }
    return topCompaniesMeta[0];
  }, [topCompaniesMeta, hoveredCompanyIndex]);

  useEffect(() => {
    if (!derived.courseEnrollmentRows.length) {
      setHoveredEnrollmentIndex(null);
      return;
    }

    const isInvalidIndex =
      hoveredEnrollmentIndex !== null &&
      !derived.courseEnrollmentRows[hoveredEnrollmentIndex];

    if (isInvalidIndex) {
      setHoveredEnrollmentIndex(0);
    }
  }, [derived.courseEnrollmentRows, hoveredEnrollmentIndex]);

  useEffect(() => {
    if (!topCompaniesMeta.length) {
      setHoveredCompanyIndex(null);
      return;
    }

    const isInvalidIndex =
      hoveredCompanyIndex !== null && !topCompaniesMeta[hoveredCompanyIndex];

    if (isInvalidIndex) {
      setHoveredCompanyIndex(0);
    }
  }, [topCompaniesMeta, hoveredCompanyIndex]);

  useEffect(() => {
    if (!derived.internTimelineRows.length) {
      setHoveredInternTimelineIndex(null);
      return;
    }

    const isInvalidIndex =
      hoveredInternTimelineIndex !== null &&
      !derived.internTimelineRows[hoveredInternTimelineIndex];

    if (isInvalidIndex) {
      setHoveredInternTimelineIndex(derived.internTimelineRows.length - 1);
    }
  }, [derived.internTimelineRows, hoveredInternTimelineIndex]);

  useEffect(() => {
    const studentsUpdatedEvent = getStudentsUpdatedEventName();
    const coursesUpdatedEvent = getCoursesUpdatedEventName();
    const internshipsUpdatedEvent = getInternshipsUpdatedEventName();
    const jobsUpdatedEvent = getJobsUpdatedEventName();

    const syncDashboard = () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminDashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminInsights });
    };

    window.addEventListener("storage", syncDashboard);
    window.addEventListener(studentsUpdatedEvent, syncDashboard);
    window.addEventListener(coursesUpdatedEvent, syncDashboard);
    window.addEventListener(internshipsUpdatedEvent, syncDashboard);
    window.addEventListener(jobsUpdatedEvent, syncDashboard);

    return () => {
      window.removeEventListener("storage", syncDashboard);
      window.removeEventListener(studentsUpdatedEvent, syncDashboard);
      window.removeEventListener(coursesUpdatedEvent, syncDashboard);
      window.removeEventListener(internshipsUpdatedEvent, syncDashboard);
      window.removeEventListener(jobsUpdatedEvent, syncDashboard);
    };
  }, [queryClient]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCloseStudentForm = () => {
    setShowStudentForm(false);
    setFormData(initialForm);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const normalized = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      password: formData.password,
      gender: formData.gender,
      DOB: formData.DOB || null,
      education: formData.education.trim(),
      college: formData.college.trim(),
      domain: formData.domain.trim(),
    };

    if (
      !normalized.name ||
      !normalized.email ||
      !normalized.phone ||
      !normalized.password
    ) {
      showToast("Name, email, phone and password are required.", "error");
      return;
    }

    await addStudent(normalized);
    queryClient.invalidateQueries({ queryKey: queryKeys.adminDashboard });
    queryClient.invalidateQueries({ queryKey: queryKeys.adminInsights });
    showToast("Student added successfully.");
    handleCloseStudentForm();
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <Toast toast={toast} />

      <AnimatePresence>
        {showStudentForm && (
          <motion.div
            className="fixed inset-0 z-50 flex items-start justify-center p-4 md:p-8 overflow-y-auto"
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.div
              className="fixed inset-0 bg-slate-900/40 z-40"
              variants={modalBackdropVariants}
              onClick={handleCloseStudentForm}
              aria-hidden="true"
            />
            <motion.div
              variants={modalPanelVariants}
              className="relative z-50 w-full max-w-5xl bg-white rounded-xl shadow-2xl border border-gray-100"
            >
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900">
                  Add Student
                </h2>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={handleCloseStudentForm}
                  className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 inline-flex items-center justify-center rounded-sm cursor-pointer"
                  aria-label="Close add student form"
                >
                  <X size={18} />
                </motion.button>
              </div>
              <div className="p-5">
                <StudentForm
                  formData={formData}
                  onChange={handleChange}
                  onSubmit={handleSubmit}
                  onCancel={handleCloseStudentForm}
                  submitLabel="Save Student"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="overflow-x-auto">
        <div className="inline-flex min-w-full gap-2 bg-white border border-slate-100 rounded-xl p-1.5">
          {dashboardViews.map((view) => (
            <button
              key={view.id}
              type="button"
              onClick={() => setActiveView(view.id)}
              className={`px-4 py-2.5 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeView === view.id
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {view.label}
            </button>
          ))}
        </div>
      </div>

      {activeView === "home" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 sm:gap-5">
            <InsightCard
              title="Total Students"
              value={derived.totalStudents}
              subtitle="Current student base"
              icon={<Users size={18} />}
              chipClass="bg-sky-100 text-sky-700"
            />
            <InsightCard
              title="Placement Rate"
              value={`${derived.placementRate}%`}
              subtitle={`${derived.totalPlaced}/${derived.totalStudents} students placed`}
              icon={<Trophy size={18} />}
              chipClass="bg-amber-100 text-amber-700"
            />
            <InsightCard
              title="Jobs Published"
              value={derived.jobsCount}
              subtitle="Open opportunities tracked"
              icon={<Building2 size={18} />}
              chipClass="bg-blue-100 text-blue-700"
            />
            <InsightCard
              title="Enrollments"
              value={derived.enrollmentsCount}
              subtitle="Course enrollments recorded"
              icon={<Layers3 size={18} />}
              chipClass="bg-emerald-100 text-emerald-700"
            />
            <InsightCard
              title="Open Internships"
              value={derived.openInternships}
              subtitle={`${derived.internshipsCount} internships in total`}
              icon={<Briefcase size={18} />}
              chipClass="bg-orange-100 text-orange-700"
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <div className="bg-white border border-slate-100 rounded-xl p-4 sm:p-5 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-lg font-bold text-slate-900">
                  Admissions Trend
                </h3>
                <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
                  <button
                    type="button"
                    onClick={() => setStudentTrendView("month")}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                      studentTrendView === "month"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Month Wise
                  </button>
                  <button
                    type="button"
                    onClick={() => setStudentTrendView("date")}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                      studentTrendView === "date"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Date Wise
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <p className="text-[11px] uppercase tracking-wide text-slate-500">
                    Total Students
                  </p>
                  <p className="text-lg font-bold text-slate-900 mt-1">
                    {derived.totalStudents}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <p className="text-[11px] uppercase tracking-wide text-slate-500">
                    Latest Admission
                  </p>
                  <p className="text-lg font-bold text-slate-900 mt-1">
                    {derived.latestAdmissionDate}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <p className="text-[11px] uppercase tracking-wide text-slate-500">
                    Peak Day
                  </p>
                  <p className="text-lg font-bold text-slate-900 mt-1">
                    {derived.peakAdmissionDate}
                  </p>
                </div>
              </div>

              <div className="h-72">
                {(studentTrendView === "month"
                  ? charts.admissionTrend.labels.length
                  : charts.admissionTrendByDate.labels.length) > 0 ? (
                  <Line
                    data={
                      studentTrendView === "month"
                        ? charts.admissionTrend
                        : charts.admissionTrendByDate
                    }
                    options={defaultLineOptions}
                  />
                ) : (
                  <p className="text-sm text-slate-500">
                    No admissions data available for this view.
                  </p>
                )}
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-xl p-4 sm:p-5 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4">
                Placement Type
              </h3>
              <div className="h-72">
                {charts.placementOverview.labels.length > 0 ? (
                  <Doughnut
                    data={charts.placementOverview}
                    options={defaultDoughnutOptions}
                  />
                ) : (
                  <p className="text-sm text-slate-500">
                    No placement type data available.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-none">
                Recent Students
              </h2>
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <motion.div whileTap={{ scale: 0.92 }}>
                  <button
                    type="button"
                    onClick={() => setShowStudentForm(true)}
                    className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 text-sm font-semibold transition-colors cursor-pointer rounded-sm"
                  >
                    Add Student
                  </button>
                </motion.div>
                <motion.div whileTap={{ scale: 0.92 }}>
                  <Link
                    to="/admin/students"
                    className="bg-red-600 rounded-sm hover:bg-red-700 text-white px-4 py-2 text-sm font-semibold transition-colors cursor-pointer inline-flex items-center"
                  >
                    View All Students
                  </Link>
                </motion.div>
              </div>
            </div>

            <div className="md:hidden p-3 space-y-3">
              {dashboardData.recentStudents.map((student) => (
                <div
                  key={student.id}
                  className="border border-slate-100 rounded-lg p-3 bg-slate-50"
                >
                  <div className="flex items-center justify-between gap-2">
                    <Link
                      to={`/admin/students/${student.id}`}
                      className="text-sm font-semibold text-slate-900"
                    >
                      NITS{String(student.id ?? "").padStart(3, "0")}
                    </Link>
                    <p className="text-xs text-slate-500">
                      {student.domain || "-"}
                    </p>
                  </div>
                  <p className="text-sm text-slate-700 mt-2">
                    {student.name || "-"}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 break-all">
                    {student.email || "-"}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {student.education || "-"}
                  </p>
                </div>
              ))}

              {!dashboardLoading &&
                dashboardData.recentStudents.length === 0 && (
                  <p className="p-3 text-center text-sm text-gray-500">
                    No recent students found.
                  </p>
                )}
            </div>

            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-red-100/60">
                  <tr className="text-left">
                    <th className="p-4 text-sm font-bold text-gray-700 uppercase tracking-wide">
                      Student ID
                    </th>
                    <th className="p-4 text-sm font-bold text-gray-700 uppercase tracking-wide">
                      Student Name
                    </th>
                    <th className="p-4 text-sm font-bold text-gray-700 uppercase tracking-wide">
                      Email
                    </th>
                    <th className="p-4 text-sm font-bold text-gray-700 uppercase tracking-wide">
                      Domain
                    </th>
                    <th className="p-4 text-sm font-bold text-gray-700 uppercase tracking-wide">
                      Education
                    </th>
                    <th className="p-4 text-sm font-bold text-gray-700 uppercase tracking-wide">
                      Institute
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {dashboardData.recentStudents.map((student) => (
                    <tr
                      key={student.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-4 text-sm text-gray-900 font-semibold">
                        <Link
                          to={`/admin/students/${student.id}`}
                          className="hover:text-red-600 transition-colors"
                        >
                          NITS{String(student.id ?? "").padStart(3, "0")}
                        </Link>
                      </td>
                      <td className="p-4 text-sm text-slate-600">
                        {student.name || "-"}
                      </td>
                      <td className="p-4 text-sm text-slate-600">
                        {student.email || "-"}
                      </td>
                      <td className="p-4 text-sm text-slate-600">
                        {student.domain || "-"}
                      </td>
                      <td className="p-4 text-sm text-slate-600">
                        {student.education || "-"}
                      </td>
                      <td className="p-4 text-sm text-slate-600">
                        {student.college || "-"}
                      </td>
                    </tr>
                  ))}

                  {!dashboardLoading &&
                    dashboardData.recentStudents.length === 0 && (
                      <tr>
                        <td
                          colSpan="6"
                          className="p-6 text-center text-sm text-gray-500"
                        >
                          No recent students found.
                        </td>
                      </tr>
                    )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeView === "coursePlacement" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <InsightCard
              title="Total Enrollments"
              value={derived.enrollmentsCount}
              subtitle="Students enrolled across all courses"
              icon={<BookOpen size={18} />}
              chipClass="bg-red-100 text-red-700"
            />
            <InsightCard
              title="Total Placed"
              value={derived.totalPlaced}
              subtitle="Overall placement records"
              icon={<Trophy size={18} />}
              chipClass="bg-amber-100 text-amber-700"
            />
            <InsightCard
              title="Placement Rate"
              value={`${derived.placementRate}%`}
              subtitle="Placed vs total students"
              icon={<BarChart3 size={18} />}
              chipClass="bg-indigo-100 text-indigo-700"
            />
            <InsightCard
              title="On-Campus Focus"
              value={
                derived.placementTypeChart.find((item) =>
                  safeText(item.label).toLowerCase().includes("on"),
                )?.count || 0
              }
              subtitle="On-campus placements"
              icon={<Building2 size={18} />}
              chipClass="bg-emerald-100 text-emerald-700"
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-white to-rose-50/40 p-4 sm:p-5 shadow-sm space-y-4">
              <div className="pointer-events-none absolute -top-14 -right-10 h-36 w-36 rounded-full bg-rose-200/40 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-16 -left-8 h-40 w-40 rounded-full bg-orange-200/30 blur-3xl" />

              <div className="relative flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Course Enrollment Funnel
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Hover bars to inspect enrollment count and contribution
                    share.
                  </p>
                </div>
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5">
                  <p className="text-[11px] uppercase tracking-wide text-rose-600 font-semibold">
                    Total Enrollments
                  </p>
                  <p className="text-lg font-bold text-slate-900 leading-none mt-1">
                    {derived.enrollmentsCount}
                  </p>
                </div>
              </div>

              {charts.courseEnrollment.labels.length > 0 ? (
                <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2 h-72">
                    <Bar
                      data={charts.courseEnrollment}
                      options={courseEnrollmentFunnelOptions}
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="rounded-xl border border-slate-200 bg-white/90 px-3 py-3">
                      <p className="text-[11px] uppercase tracking-wide text-slate-500">
                        Hovered Course
                      </p>
                      <p className="text-sm font-semibold text-slate-900 mt-1 truncate">
                        {hoveredEnrollmentCourse?.title || "-"}
                      </p>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <div className="rounded-lg bg-slate-100 px-2 py-2">
                          <p className="text-[10px] uppercase text-slate-500">
                            Enrolled
                          </p>
                          <p className="text-base font-bold text-slate-900 mt-1">
                            {hoveredEnrollmentCourse?.enrolled || 0}
                          </p>
                        </div>
                        <div className="rounded-lg bg-slate-100 px-2 py-2">
                          <p className="text-[10px] uppercase text-slate-500">
                            Share
                          </p>
                          <p className="text-base font-bold text-slate-900 mt-1">
                            {derived.enrollmentsCount > 0
                              ? `${(
                                  ((hoveredEnrollmentCourse?.enrolled || 0) /
                                    derived.enrollmentsCount) *
                                  100
                                ).toFixed(1)}%`
                              : "0.0%"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white/90 px-3 py-2.5 space-y-2">
                      {derived.courseEnrollmentRows.map((course, index) => (
                        <button
                          key={course.id}
                          type="button"
                          onMouseEnter={() => setHoveredEnrollmentIndex(index)}
                          className={`w-full text-left rounded-lg px-2.5 py-2 transition-colors cursor-pointer ${
                            index === hoveredEnrollmentIndex ||
                            (hoveredEnrollmentIndex === null && index === 0)
                              ? "bg-rose-100 border border-rose-200"
                              : "hover:bg-slate-100"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-semibold text-slate-700 truncate">
                              #{index + 1} {course.title}
                            </p>
                            <span className="text-xs font-bold text-slate-900">
                              {course.enrolled}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  No enrollment data available.
                </p>
              )}
            </div>

            <div className="bg-white border border-slate-100 rounded-xl p-4 sm:p-5 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-slate-900">
                Admission Trend
              </h3>
              {charts.admissionTrend.labels.length > 0 ? (
                <div className="h-72">
                  <Line
                    data={charts.admissionTrend}
                    options={defaultLineOptions}
                  />
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  No admissions data available.
                </p>
              )}
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-xl p-4 sm:p-5 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900">
              Placement Type Mix
            </h3>
            {charts.placementType.labels.length > 0 ? (
              <div className="h-72 max-w-3xl">
                <Bar data={charts.placementType} options={defaultBarOptions} />
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                No placement type data available.
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <div className="bg-white border border-slate-100 rounded-xl p-4 sm:p-5 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-slate-900">
                Course Placement (Radar View)
              </h3>
              {charts.courseClusteredColumn.labels.length > 0 ? (
                <div className="h-72">
                  <Radar
                    data={charts.courseClusteredColumn}
                    options={defaultRadarOptions}
                  />
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  No clustered course data available.
                </p>
              )}
            </div>

            <div className="bg-white border border-slate-100 rounded-xl p-4 sm:p-5 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-slate-900">
                Placement Rate by Course (Area)
              </h3>
              {charts.placementArea.labels.length > 0 ? (
                <div className="h-72">
                  <Line
                    data={charts.placementArea}
                    options={{
                      ...defaultLineOptions,
                      scales: {
                        ...defaultLineOptions.scales,
                        y: {
                          ...defaultLineOptions.scales.y,
                          max: 100,
                        },
                      },
                    }}
                  />
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  No placement-rate area data available.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeView === "internData" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <InsightCard
              title="Internships"
              value={derived.internshipsCount}
              subtitle="Total internship records"
              icon={<Briefcase size={18} />}
              chipClass="bg-orange-100 text-orange-700"
            />
            <InsightCard
              title="Open"
              value={derived.openInternships}
              subtitle="Open or active opportunities"
              icon={<Layers3 size={18} />}
              chipClass="bg-blue-100 text-blue-700"
            />
            <InsightCard
              title="Paid"
              value={derived.paidInternships}
              subtitle="Paid internship share"
              icon={<Building2 size={18} />}
              chipClass="bg-emerald-100 text-emerald-700"
            />
            <InsightCard
              title="Jobs Linked"
              value={derived.jobsCount}
              subtitle="Jobs in portal for conversion"
              icon={<BarChart3 size={18} />}
              chipClass="bg-violet-100 text-violet-700"
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-cyan-50/35 to-emerald-50/45 p-4 sm:p-5 shadow-sm space-y-4">
              <div className="pointer-events-none absolute -top-12 -right-10 h-32 w-32 rounded-full bg-cyan-200/35 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-14 -left-8 h-36 w-36 rounded-full bg-emerald-200/30 blur-3xl" />

              <div className="relative flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Opportunity Momentum Timeline
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Interactive month-wise view of internship and job momentum.
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="rounded-full bg-cyan-100 text-cyan-700 text-xs font-semibold px-2.5 py-1 inline-flex items-center gap-1.5">
                    <CalendarDays size={13} />
                    {derived.internTimelineRows.length} points
                  </span>
                  <span className="rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold px-2.5 py-1 inline-flex items-center gap-1.5">
                    <TrendingUp size={13} />
                    {Number(internTimelineMeta.growthPercent) >= 0 ? "+" : ""}
                    {internTimelineMeta.growthPercent}% trend
                  </span>
                </div>
              </div>

              {charts.internTimeline.labels.length > 0 ? (
                <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2 space-y-3">
                    <div className="h-72">
                      <Line
                        data={charts.internTimeline}
                        options={internTimelinePremiumOptions}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="rounded-xl border border-slate-200 bg-white/90 px-3 py-3">
                      <p className="text-[11px] uppercase tracking-wide text-slate-500">
                        Highlighted Month
                      </p>
                      <p className="text-sm font-semibold text-slate-900 mt-1 truncate">
                        {highlightedInternTimelineRow?.label || "-"}
                      </p>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <div className="rounded-lg bg-cyan-50 px-2 py-2">
                          <p className="text-[10px] uppercase text-cyan-700">
                            Internships
                          </p>
                          <p className="text-base font-bold text-slate-900 mt-1">
                            {highlightedInternTimelineRow?.internships || 0}
                          </p>
                        </div>
                        <div className="rounded-lg bg-emerald-50 px-2 py-2">
                          <p className="text-[10px] uppercase text-emerald-700">
                            Jobs
                          </p>
                          <p className="text-base font-bold text-slate-900 mt-1">
                            {highlightedInternTimelineRow?.jobs || 0}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 mt-2">
                        Total opportunities:{" "}
                        {Number(
                          highlightedInternTimelineRow?.internships || 0,
                        ) + Number(highlightedInternTimelineRow?.jobs || 0)}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white/90 px-3 py-2.5 space-y-2">
                      {derived.internTimelineRows.map((row, index) => (
                        <button
                          key={row.key}
                          type="button"
                          onMouseEnter={() =>
                            setHoveredInternTimelineIndex(index)
                          }
                          className={`w-full text-left rounded-lg px-2.5 py-2 transition-colors cursor-pointer ${
                            index === hoveredInternTimelineIndex ||
                            (hoveredInternTimelineIndex === null &&
                              index === derived.internTimelineRows.length - 1)
                              ? "bg-cyan-100 border border-cyan-200"
                              : "hover:bg-slate-100"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-semibold text-slate-700 truncate">
                              {row.label}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  No internship timeline data available.
                </p>
              )}
            </div>

            <div className="bg-white border border-slate-100 rounded-xl p-4 sm:p-5 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-slate-900">
                Internship Status
              </h3>
              {charts.internshipStatus.labels.length > 0 ? (
                <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-sky-50/40 to-indigo-50/40 p-3 sm:p-4">
                  <div className="pointer-events-none absolute -top-10 -right-8 h-32 w-32 rounded-full bg-sky-200/40 blur-3xl" />
                  <div className="pointer-events-none absolute -bottom-12 -left-8 h-32 w-32 rounded-full bg-indigo-200/30 blur-3xl" />

                  <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="h-64 lg:h-72">
                      <Doughnut
                        data={charts.internshipStatus}
                        plugins={[internshipStatusCenterLabelPlugin]}
                        options={{
                          ...defaultDoughnutOptions,
                          cutout: "70%",
                          plugins: {
                            ...defaultDoughnutOptions.plugins,
                            tooltip: {
                              callbacks: {
                                title: (items) => items?.[0]?.label || "Status",
                                label: (context) => `Count: ${context.parsed}`,
                              },
                            },
                          },
                        }}
                      />
                    </div>

                    <div className="space-y-2.5">
                      {internshipStatusMeta.map((item) => (
                        <div
                          key={item.label}
                          className="rounded-lg border border-slate-200 bg-white/80 px-3 py-2.5"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 min-w-0">
                              <span
                                className="inline-block h-2.5 w-2.5 rounded-full"
                                style={{ backgroundColor: item.color }}
                              />
                              <p className="text-sm font-semibold text-slate-800 truncate">
                                {item.label}
                              </p>
                            </div>
                            <p className="text-sm font-bold text-slate-900">
                              {item.value}
                            </p>
                          </div>
                          <div className="mt-2 h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${Math.min(Number(item.percent), 100)}%`,
                                backgroundColor: item.color,
                              }}
                            />
                          </div>
                          <p className="mt-1 text-[11px] text-slate-500">
                            {item.percent}% share
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  No internship status data available.
                </p>
              )}
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-white to-orange-50/35 p-4 sm:p-5 shadow-sm space-y-4">
              <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-orange-200/35 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-14 -left-8 h-36 w-36 rounded-full bg-blue-200/25 blur-3xl" />

              <div className="relative flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Internship vs Jobs
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Month-wise opportunity momentum across internships and jobs.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-1">
                    Internships: {internTimelineTotals.internships}
                  </span>
                  <span className="rounded-full bg-orange-100 text-orange-700 text-xs font-semibold px-2.5 py-1">
                    Jobs: {internTimelineTotals.jobs}
                  </span>
                </div>
              </div>

              {charts.internClusteredColumn.labels.length > 0 ? (
                <div className="h-72">
                  <Bar
                    data={charts.internClusteredColumn}
                    options={internClusteredPremiumOptions}
                  />
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  No clustered month data available.
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <div className="bg-white border border-slate-100 rounded-xl p-4 sm:p-5 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-slate-900">
                Category Split
              </h3>
              {charts.internshipCategory.labels.length > 0 ? (
                <div className="h-72">
                  <Pie
                    data={charts.internshipCategory}
                    options={{
                      ...defaultDoughnutOptions,
                      cutout: 0,
                    }}
                  />
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  No internship category data available.
                </p>
              )}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-white to-slate-50 p-4 sm:p-5 shadow-sm space-y-4">
            <div className="pointer-events-none absolute -top-10 -right-8 h-32 w-32 rounded-full bg-slate-200/45 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-14 -left-8 h-36 w-36 rounded-full bg-blue-200/20 blur-3xl" />

            <div className="relative flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Top Hiring Companies
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Ranked by openings with contribution share and quick
                  comparison.
                </p>
              </div>
              <span className="rounded-full bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-1">
                Top {topCompaniesMeta.length || 0}
              </span>
            </div>

            {charts.topCompanies.labels.length > 0 ? (
              <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 space-y-3">
                  <div className="rounded-xl border border-slate-200 bg-white/90 px-3 py-3">
                    <p className="text-[11px] uppercase tracking-wide text-slate-500">
                      Featured Recruiter
                    </p>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">
                          #{highlightedCompany?.rank || 1}{" "}
                          {highlightedCompany?.label || "-"}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {highlightedCompany?.share || "0.0"}% contribution
                        </p>
                      </div>
                      <span className="rounded-full bg-slate-900 text-white text-xs font-semibold px-2.5 py-1">
                        {highlightedCompany?.count || 0} openings
                      </span>
                    </div>
                  </div>

                  <div className="h-60 sm:h-64">
                    <Bar
                      data={charts.topCompanies}
                      options={topCompaniesPremiumOptions}
                    />
                  </div>
                </div>

                <div className="space-y-2.5">
                  {topCompaniesMeta.map((company, index) => (
                    <button
                      key={company.label}
                      type="button"
                      onMouseEnter={() => setHoveredCompanyIndex(index)}
                      className={`w-full text-left rounded-lg border px-3 py-2.5 transition-colors cursor-pointer ${
                        index === hoveredCompanyIndex ||
                        (hoveredCompanyIndex === null && index === 0)
                          ? "border-slate-300 bg-slate-100"
                          : "border-slate-200 bg-white/90 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-slate-700 truncate flex items-center gap-2">
                          <span
                            className="inline-block h-2 w-2 rounded-full"
                            style={{ backgroundColor: company.color }}
                          />
                          #{company.rank} {company.label}
                        </p>
                        <span className="text-xs font-bold text-slate-900">
                          {company.count}
                        </span>
                      </div>
                      <div className="mt-2 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-slate-700"
                          style={{
                            width: `${Math.min(Number(company.share), 100)}%`,
                          }}
                        />
                      </div>
                      <p className="mt-1 text-[11px] text-slate-500 flex items-center justify-between gap-2">
                        <span>{company.share}% share</span>
                        <span>
                          {company.gapToLeader === 0
                            ? "Leader"
                            : `${company.gapToLeader} behind leader`}
                        </span>
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                No company trend data available.
              </p>
            )}
          </div>
        </div>
      )}

      {dashboardLoading && (
        <div className="bg-white border border-dashed border-slate-300 rounded-xl px-5 py-6 text-sm text-slate-500">
          Loading dashboard data...
        </div>
      )}

      {insightLoading && (
        <div className="bg-white border border-dashed border-slate-300 rounded-xl px-5 py-6 text-sm text-slate-500">
          Loading insight widgets...
        </div>
      )}
    </div>
  );
}

export default memo(Dashboard);
