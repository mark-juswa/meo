import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone_number: "",
  });

  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();


  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };


  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const res = await axios.post(
        "/api/auth/register",
        {
          username: formData.username,
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          password: formData.password,
          phone_number: formData.phone_number,
        },
        { withCredentials: true }
      );

      console.log("Registration successful:", res.data);
      navigate("/login");
    } catch (err) {
      console.error("Registration failed:", err);
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  const closeModal = () => setError("");

  return (
    <div className="bg-white text-gray-800 pt-20 pb-20 min-h-screen flex items-center justify-center px-4 md:px-12 font-[Poppins]">
      <div className="grid w-full max-w-6xl grid-cols-1 md:grid-cols-2 items-center gap-12 md:gap-20">
        {/* Left Section */}
        <div className="flex flex-col justify-center">
          <h1 className="text-4xl font-bold text-blue-700 md:text-5xl">
            Start Your Journey
          </h1>
          <p className="mt-2 text-gray-600 text-sm md:text-base">
            Create an account to start your application process.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button className="flex items-center justify-center w-full sm:w-1/2 gap-2 border border-gray-300 rounded-lg py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
              <img src="/google.png" className="h-4" alt="Google" />
              Google
            </button>
            <button className="flex items-center justify-center w-full sm:w-1/2 gap-2 border border-gray-300 rounded-lg py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
              <img src="/facebook.png" className="h-4" alt="Facebook" />
              Facebook
            </button>
          </div>


          <div className="my-6 text-sm text-center text-gray-500">Or</div>

          <form onSubmit={handleSubmit} className="bg-gray-100 p-6 rounded-2xl shadow-sm">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700"> Username </label>

              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter Username"
                className="mb-4 w-full rounded-xl border border-gray-300 bg-white p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required />

            <label htmlFor="first_name" className="block text-sm font-medium text-gray-700"> First Name </label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="Enter First Name"
                className="mb-4 w-full rounded-xl border border-gray-300 bg-white p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required />

            <label htmlFor="last_name" className="block text-sm font-medium text-gray-700"> Last Name </label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Enter Last Name"
                className="mb-4 w-full rounded-xl border border-gray-300 bg-white p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required/>

            <label htmlFor="email" className="block text-sm font-medium text-gray-700"> Email </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter Email"
                className="mb-4 w-full rounded-xl border border-gray-300 bg-white p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required/>

            <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700"> Phone Number </label>
              <input
                type="tel"
                id="phone_number"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                placeholder="Enter Phone Number"
                className="mb-4 w-full rounded-xl border border-gray-300 bg-white p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required/>

            <label htmlFor="password" className="block text-sm font-medium text-gray-700"> Password </label>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter Password"
                className="mb-4 w-full rounded-xl border border-gray-300 bg-white p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required />

            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700"> Confirm Password </label>
              <input
                type={showPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm Password"
                className="mb-4 w-full rounded-xl border border-gray-300 bg-white p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required/>

            <button type="button" onClick={togglePasswordVisibility} className="text-xs text-blue-500">
              {showPassword ? "Hide Passwords" : "Show Passwords"}
            </button>

            <button type="submit" className="w-full rounded-3xl bg-blue-500 py-3.5 font-semibold text-white shadow-sm transition-colors hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              Sign Up
            </button>
          </form>


          <p className="mt-5 text-sm text-center text-gray-600">
            Already have an account?{" "}
            <a href="/login" className="text-blue-600 font-semibold hover:underline">
              Login
            </a>
          </p>
        </div>


        <div className="hidden md:flex justify-center">
          <img
            src="/register.png"
            alt="Register Illustration"
            className="w-full max-w-md object-contain"
          />
        </div>
      </div>


      {error && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900 bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-lg p-6 w-80 text-center">
            <h3 className="text-lg font-semibold text-red-600 mb-3">Error</h3>
            <p className="text-gray-700 mb-5">{error}</p>
            <button
              onClick={closeModal}
              className="rounded-2xl bg-blue-500 text-white px-4 py-2 font-medium hover:bg-blue-600 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterPage;
