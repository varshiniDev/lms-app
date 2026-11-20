export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: { brand: { DEFAULT: "#FF5A44", dark: "#E8442E", orange: "#F58220", soft: "#FFF1EE" }, ink: "#202020" },
      fontFamily: { sans: ["Inter", "system-ui", "sans-serif"] },
    },
  },
  plugins: [],
};
