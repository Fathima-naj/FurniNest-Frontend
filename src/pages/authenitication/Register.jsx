
import React, { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowRight, ShieldCheck, Mail } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import axiosInstance from "../../api/axiosinstance";

const initialValues = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

const validationSchema = Yup.object({
  name: Yup.string().required("Name is required"),
  email: Yup.string()
    .email("Enter a valid email address")
    .required("Email is required"),
  password: Yup.string()
    .required("Password is required")
    .min(8, "Must be at least 8 characters")
    .matches(/[A-Z]/, "Include an uppercase letter")
    .matches(/[a-z]/, "Include a lowercase letter")
    .matches(/[0-9]/, "Include a number")
    .matches(/[@$!%*?&#]/, "Include a special character"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Confirm your password"),
});

const otpSchema = Yup.object({
  otp: Yup.string()
    .matches(/^\d{6}$/, "Enter a valid 6-digit OTP")
    .required("OTP is required"),
});

const inputClass =
  "w-full px-4 py-3.5 rounded-xl border border-[#E5DED6] bg-[#FCFAF7] text-[#49372D] outline-none focus:border-[#A45D5D] focus:ring-2 focus:ring-[#A45D5D]/10 transition";

function Register() {
  const navigate = useNavigate();

  const [isOtpStage, setIsOtpStage] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Registration
  const onSubmit = async (values, { resetForm }) => {
    try {
      setIsSubmitting(true);

      const { confirmPassword, ...dataToSend } = values;

      const res = await axiosInstance.post(
        "/users/register",
        dataToSend
      );

      setRegisteredEmail(values.email.trim().toLowerCase());
      setResendTimer(60);
      setIsOtpStage(true);

      resetForm();

      toast.success(res.data.message || "OTP sent to your email!");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Registration failed"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // OTP Verification
  const verifyOtp = async (values, { resetForm }) => {
    try {
      setIsSubmitting(true);

      const res = await axiosInstance.post("/users/verify-otp", {
        email: registeredEmail,
        otp: values.otp,
      });

      toast.success(
        res.data.message || "Email verified successfully!"
      );

      resetForm();

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "OTP verification failed"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // OTP Countdown
  useEffect(() => {
    if (!isOtpStage || resendTimer <= 0) return;

    const timer = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isOtpStage, resendTimer]);

  // Resend OTP
  const handleResendOtp = async () => {
    try {
      setIsResending(true);

      const response = await axiosInstance.post("/users/resend-otp", {
        email: registeredEmail,
      });

      toast.success(response.data.message);
      setResendTimer(60);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to resend OTP"
      );
    } finally {
      setIsResending(false);
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
            alt="Modern furniture interior"
            className="absolute inset-0 w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-black/35" />

          <div className="absolute bottom-12 left-10 right-10 text-white">

            <p className="text-sm uppercase tracking-[4px] mb-4">
              Welcome to FurniNest
            </p>

            <h1 className="text-4xl lg:text-5xl font-semibold leading-tight">
              Create a space that feels like you.
            </h1>

            <p className="mt-5 text-white/85 text-sm leading-7 max-w-md">
              Discover thoughtfully designed furniture that
              brings comfort, beauty and personality into
              your everyday living.
            </p>

          </div>
        </div>

        {/* Registration Section */}
        <div className="flex items-center justify-center px-6 py-12 sm:px-12 lg:px-16">

          <div className="w-full max-w-md">

            <Link
              to="/"
              className="text-2xl font-bold tracking-wide text-[#8A6652]"
            >
              FurniNest<span className="text-[#C08B8B]">.</span>
            </Link>

            <div className="mt-10 mb-8">

              <p className="text-sm text-[#A45D5D] font-medium tracking-widest uppercase">
                {isOtpStage ? "Email verification" : "Join FurniNest"}
              </p>

              <h2 className="text-3xl font-semibold text-[#49372D] mt-3">
                {isOtpStage
                  ? "Verify your email"
                  : "Create your account"}
              </h2>

              <p className="text-sm text-gray-500 mt-3 leading-6">
                {isOtpStage
                  ? `We've sent a verification code to ${registeredEmail}`
                  : "Create an account to explore beautiful furniture for your home."}
              </p>

            </div>

            {!isOtpStage ? (

              /* Registration Form */
              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={onSubmit}
              >
                {({ isSubmitting: formSubmitting }) => (
                  <Form className="space-y-5" noValidate>

                    <div>
                      <label className="block text-sm font-medium text-[#49372D] mb-2">
                        Full name
                      </label>

                      <Field
                        name="name"
                        type="text"
                        placeholder="Enter your name"
                        className={inputClass}
                      />

                      <ErrorMessage
                        name="name"
                        component="p"
                        className="text-red-500 text-xs mt-1.5"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#49372D] mb-2">
                        Email address
                      </label>

                      <Field
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        className={inputClass}
                      />

                      <ErrorMessage
                        name="email"
                        component="p"
                        className="text-red-500 text-xs mt-1.5"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#49372D] mb-2">
                        Password
                      </label>

                      <div className="relative">
                        <Field
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a password"
                          className={`${inputClass} pr-12`}
                        />

                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#8A6652]"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                        </button>
                      </div>

                      <ErrorMessage
                        name="password"
                        component="p"
                        className="text-red-500 text-xs mt-1.5"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#49372D] mb-2">
                        Confirm password
                      </label>

                      <div className="relative">
                        <Field
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                          className={`${inputClass} pr-12`}
                        />

                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#8A6652]"
                          aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                        >
                          {showConfirmPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                        </button>
                      </div>

                      <ErrorMessage
                        name="confirmPassword"
                        component="p"
                        className="text-red-500 text-xs mt-1.5"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={formSubmitting || isSubmitting}
                      className="w-full flex items-center justify-center gap-2 bg-[#8A6652] hover:bg-[#70503F] text-white py-3.5 rounded-xl font-medium transition disabled:opacity-60"
                    >
                      {formSubmitting || isSubmitting
                        ? "Sending OTP..."
                        : "Create Account"}

                      {!formSubmitting && !isSubmitting && (
                        <ArrowRight size={18} />
                      )}
                    </button>

                  </Form>
                )}
              </Formik>

            ) : (

              /* OTP Verification Form */
              <Formik
                initialValues={{ otp: "" }}
                validationSchema={otpSchema}
                onSubmit={verifyOtp}
              >
                {({ values, setFieldValue, isSubmitting: formSubmitting }) => (
                  <Form noValidate>

                    <div className="flex justify-center mb-6">
                      <div className="w-16 h-16 rounded-2xl bg-[#F7F3ED] flex items-center justify-center text-[#A45D5D]">
                        <ShieldCheck size={32} />
                      </div>
                    </div>

                    <div className="flex justify-center gap-2 sm:gap-3 mb-3">
                      {Array.from({ length: 6 }).map((_, index) => (
                        <input
                          key={index}
                          id={`otp-${index}`}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          autoComplete={index === 0 ? "one-time-code" : "off"}
                          value={(values.otp || "")[index] || ""}
                          onChange={(e) => {
                            const digit = e.target.value.replace(/\D/g, "");
                            const otp = (values.otp || "").split("");

                            otp[index] = digit.slice(-1);
                            setFieldValue("otp", otp.join(""));

                            if (digit && index < 5) {
                              document.getElementById(`otp-${index + 1}`)?.focus();
                            }
                          }}
                          onKeyDown={(e) => {
                            if (
                              e.key === "Backspace" &&
                              !values.otp[index] &&
                              index > 0
                            ) {
                              document.getElementById(`otp-${index - 1}`)?.focus();
                            }
                          }}
                          onPaste={(e) => {
                            e.preventDefault();

                            const pasted = e.clipboardData
                              .getData("text")
                              .replace(/\D/g, "")
                              .slice(0, 6);

                            setFieldValue("otp", pasted);

                            document.getElementById(
                              `otp-${Math.min(pasted.length, 5)}`
                            )?.focus();
                          }}
                          className="w-10 h-12 sm:w-12 sm:h-14 border border-[#E5DED6] bg-[#FCFAF7] rounded-xl text-center text-xl font-semibold text-[#49372D] outline-none focus:border-[#A45D5D] focus:ring-2 focus:ring-[#A45D5D]/10 transition"
                        />
                      ))}
                    </div>

                    <ErrorMessage
                      name="otp"
                      component="p"
                      className="text-red-500 text-xs text-center mb-3"
                    />

                    <div className="text-center mb-6">
                      {resendTimer > 0 ? (
                        <p className="text-sm text-gray-500">
                          Didn't receive the code? Resend in{" "}
                          <span className="font-semibold text-[#8A6652]">
                            {resendTimer}s
                          </span>
                        </p>
                      ) : (
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          disabled={isResending}
                          className="text-sm font-semibold text-[#A45D5D] hover:text-[#8A6652] hover:underline disabled:opacity-50"
                        >
                          {isResending ? "Sending..." : "Resend OTP"}
                        </button>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={formSubmitting || isSubmitting || isResending}
                      className="w-full flex items-center justify-center gap-2 bg-[#8A6652] hover:bg-[#70503F] text-white py-3.5 rounded-xl font-medium transition disabled:opacity-60"
                    >
                      {formSubmitting || isSubmitting
                        ? "Verifying..."
                        : "Verify Email"}

                      {!formSubmitting && !isSubmitting && (
                        <ArrowRight size={18} />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsOtpStage(false)}
                      className="w-full mt-4 text-sm text-gray-500 hover:text-[#A45D5D] transition"
                    >
                      Back to registration
                    </button>

                  </Form>
                )}
              </Formik>

            )}

            {!isOtpStage && (
              <p className="text-center text-sm text-gray-500 mt-8">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-[#A45D5D] font-semibold hover:underline"
                >
                  Sign in
                </Link>
              </p>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
