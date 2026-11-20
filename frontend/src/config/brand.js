// Change the company name in frontend/.env (VITE_COMPANY_NAME) and replace public/logo.svg with your logo.
export const BRAND = {
  name: import.meta.env.VITE_COMPANY_NAME || "Elysium Academy",
  product: "LMS",
  tagline: "Teach, track and certify - beautifully organised.",
  sub: "Courses, batches, attendance, assignments, fees and certificates for your institute in one place.",
  logo: "/logo.svg",
  year: new Date().getFullYear(),
};
