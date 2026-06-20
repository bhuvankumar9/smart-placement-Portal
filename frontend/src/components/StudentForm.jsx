import { motion } from "framer-motion";
export default function StudentForm({
  formData,
  onChange,
  onSubmit,
  onCancel,
  isEditing = false,
  submitLabel = "Save Student",
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={onChange}
            placeholder="John Doe"
            className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={onChange}
            placeholder="john@example.com"
            className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number *
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={onChange}
            placeholder="9876543210"
            className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          />
        </div>

        {!isEditing && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password *
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={onChange}
              placeholder="********"
              className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Gender
          </label>
          <select
            name="gender"
            value={formData.gender}
            onChange={onChange}
            className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date of Birth
          </label>
          <input
            type="date"
            name="DOB"
            value={formData.DOB}
            onChange={onChange}
            className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Education
          </label>
          <input
            type="text"
            name="education"
            value={formData.education}
            onChange={onChange}
            placeholder="e.g. B.Tech"
            className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            College/Institute
          </label>
          <input
            type="text"
            name="college"
            value={formData.college}
            onChange={onChange}
            placeholder="e.g. NIT Silchar"
            className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Domain/Interest
          </label>
          <input
            type="text"
            name="domain"
            value={formData.domain}
            onChange={onChange}
            placeholder="e.g. Web Development"
            className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
      </div>

      <div className="mt-6 flex gap-3 justify-end">
        <motion.button
          whileTap={{ scale: 0.9 }}
          type="button"
          onClick={onCancel}
          className="border border-gray-300 hover:bg-gray-100 text-gray-700 px-6 py-2 text-sm font-semibold transition-colors rounded-sm cursor-pointer"
        >
          Cancel
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          type="submit"
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 text-sm font-bold transition-colors rounded-sm cursor-pointer"
        >
          {submitLabel}
        </motion.button>
      </div>
    </form>
  );
}
