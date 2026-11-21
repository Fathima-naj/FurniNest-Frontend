
import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { GoogleLogin } from "@react-oauth/google";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import axiosInstance from "../../api/axiosinstance";
import { setUser } from "../../slice/AuthSlice";

const initialValues = {
  email: "",
  password: "",
};

const validationSchema = Yup.object({
  email: Yup.string()
    .email("Enter a valid email address")
    .required("Email is required"),

  password: Yup.string()
    .min(8, "Password must contain at least 8 characters")
    .required("Password is required"),
});

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleLogin = async (values, { setSubmitting }) => {
    try {
      const response = await axiosInstance.post("/users/login", values);

      const user = response.data.user;

      dispatch(setUser(user));

      toast.success(response.data.message || "Welcome back!");

      navigate(user.isAdmin ? "/admin" : "/");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to login. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setGoogleLoading(true);

      const response = await axiosInstance.post("/users/google", {
        credential: credentialResponse.credential,
      });

      const user = response.data.user;

      dispatch(setUser(user));

      toast.success(response.data.message || "Google login successful!");

      navigate(user.isAdmin ? "/admin" : "/");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Google authentication failed"
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F3ED] flex items-center justify-center p-4 md:p-8">
      <ToastContainer position="top-right" autoClose={2500} />

      <div className="w-full max-w-6xl min-h-[650px] bg-white rounded-3xl overflow-hidden shadow-xl grid md:grid-cols-2">

        {/* Left Image Section */}
        <div className="hidden md:block relative">
          <img
            src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0"
            alt="Beautiful modern living room"
            className="absolute inset-0 w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-black/35" />

          <div className="absolute bottom-12 left-10 right-10 text-white">
            <p className="text-sm uppercase tracking-[4px] mb-4">
              Welcome to FurniNest
            </p>

            <h1 className="text-4xl lg:text-5xl font-semibold leading-tight">
              Make your space feel like home.
            </h1>

            <p className="mt-5 text-white/85 text-sm leading-7 max-w-md">
              Discover thoughtfully designed furniture that brings comfort,
              beauty and personality into your everyday living.
            </p>
          </div>
        </div>

        {/* Login Form Section */}
        <div className="flex items-center justify-center px-6 py-12 sm:px-12 lg:px-16">

          <div className="w-full max-w-md">

            <Link
              to="/"
              className="text-2xl font-bold tracking-wide text-[#8A6652]"
            >
              FurniNest<span className="text-[#C08B8B]">.</span>
            </Link>

            <div className="mt-12 mb-8">
              <p className="text-sm text-[#A45D5D] font-medium tracking-widest uppercase">
                Welcome back
              </p>

              <h2 className="text-3xl font-semibold text-[#49372D] mt-3">
                Sign in to your account
              </h2>

              <p className="text-sm text-gray-500 mt-3">
                Enter your details to access your FurniNest account.
              </p>
            </div>

            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleLogin}
            >
              {({ isSubmitting }) => (
                <Form className="space-y-5">

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-[#49372D] mb-2">
                      Email address
                    </label>

                    <Field
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      className="w-full px-4 py-3.5 rounded-xl border border-[#E5DED6] bg-[#FCFAF7] text-[#49372D] outline-none focus:border-[#A45D5D] focus:ring-2 focus:ring-[#A45D5D]/10 transition"
                    />

                    <ErrorMessage
                      name="email"
                      component="p"
                      className="text-red-500 text-xs mt-1.5"
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-[#49372D] mb-2">
                      Password
                    </label>

                    <div className="relative">
                      <Field
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Enter your password"
                        className="w-full px-4 py-3.5 pr-12 rounded-xl border border-[#E5DED6] bg-[#FCFAF7] text-[#49372D] outline-none focus:border-[#A45D5D] focus:ring-2 focus:ring-[#A45D5D]/10 transition"
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#8A6652]"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <EyeOff size={19} />
                        ) : (
                          <Eye size={19} />
                        )}
                      </button>
                    </div>

                    <ErrorMessage
                      name="password"
                      component="p"
                      className="text-red-500 text-xs mt-1.5"
                    />
                  </div>

                  {/* Forgot Password */}
                  <div className="flex justify-end">
                    <Link
                      to="/forgot-password"
                      className="text-sm text-[#A45D5D] hover:text-[#8A6652] font-medium"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  {/* Login Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 bg-[#8A6652] hover:bg-[#70503F] text-white py-3.5 rounded-xl font-medium transition disabled:opacity-60"
                  >
                    {isSubmitting ? "Signing in..." : "Sign In"}
                    {!isSubmitting && <ArrowRight size={18} />}
                  </button>

                  {/* Divider */}
                  <div className="flex items-center gap-4 py-2">
                    <div className="flex-1 h-px bg-[#E5DED6]" />
                    <span className="text-xs text-gray-400 uppercase">
                      Or continue with
                    </span>
                    <div className="flex-1 h-px bg-[#E5DED6]" />
                  </div>

                  {/* Google Login */}
                  <div className="flex justify-center">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => toast.error("Google login failed")}
                      theme="outline"
                      shape="rectangular"
                      text="continue_with"
                      width="300"
                    />
                  </div>

                  {googleLoading && (
                    <p className="text-center text-sm text-gray-500">
                      Signing in with Google...
                    </p>
                  )}

                </Form>
              )}
            </Formik>

            <p className="text-center text-sm text-gray-500 mt-8">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-[#A45D5D] font-semibold hover:underline"
              >
                Create an account
              </Link>
            </p>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
