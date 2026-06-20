const typeClasses = {
    success: "bg-green-600 text-white",
    error: "bg-red-600 text-white",
};

export default function Toast({ toast, position = "top-right" }) {
    if (!toast?.show) return null;

    const wrapperClass =
        position === "inline"
            ? "mb-4"
            : "fixed right-6 top-6 z-[60]";

    const boxClass =
        position === "inline"
            ? `inline-flex rounded-lg px-3 py-2 text-sm font-medium ${
                  toast.type === "error" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
              }`
            : `px-4 py-3 rounded-lg shadow-lg text-sm font-semibold ${typeClasses[toast.type] || typeClasses.success}`;

    return (
        <div className={wrapperClass}>
            <div className={boxClass}>{toast.message}</div>
        </div>
    );
}
