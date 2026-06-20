import { useEffect, useState } from "react";

const defaultToast = {
    show: false,
    type: "success",
    message: "",
    duration: 2500,
};

export default function useToast() {
    const [toast, setToast] = useState(defaultToast);

    const showToast = (message, type = "success", duration = 2500) => {
        setToast({ show: true, type, message, duration });
    };

    useEffect(() => {
        if (!toast.show) return undefined;

        const timeoutId = window.setTimeout(() => {
            setToast(defaultToast);
        }, toast.duration);

        return () => window.clearTimeout(timeoutId);
    }, [toast]);

    return { toast, showToast };
}
