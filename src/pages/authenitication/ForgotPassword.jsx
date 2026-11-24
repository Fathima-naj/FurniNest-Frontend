
import React, { useRef, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Mail,
  ShieldCheck,
  Eye,
  EyeOff,
  LockKeyhole,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";

import axiosInstance from "../../api/axiosinstance";

const initialValues = {
  email: "",
};

const emailValidationSchema = Yup.object({
  email: Yup.string()
    .email("Enter a valid email address")
    .required("Email is required"),
});

const passwordInitialValues = {
  newPassword: "",
  confirmPassword: "",
};

const passwordValidationSchema = Yup.object({
  newPassword: Yup.string()
    .min(6, "Password must contain at least 6 characters")
    .required("New password is required"),

  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Passwords do not match")
    .required("Please confirm your password"),
});

function ForgotPassword() {
  const [stage, setStage] = useState("email");
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [verifiedOtp, setVerifiedOtp] = useState("");

  const otpRefs = useRef([]);

  // Send OTP
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const email = values.email.trim().toLowerCase();

      const response = await axiosInstance.post(
        "/users/forgot-password",
        { email }
      );

      setRegisteredEmail(email);
      setStage("otp");
      toast.success(response.data.message);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to send reset OTP. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Handle OTP input
  const handleOtpChange = (value, index) => {
    const digit = value.replace(/\D/g, "").slice(-1);

    const updatedOtp = [...otp];
    updatedOtp[index] = digit;

    setOtp(updatedOtp);

    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste
  const handlePaste = (e) => {
    e.preventDefault();

    const pastedOtp = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    const updatedOtp = ["", "", "", "", "", ""];

    pastedOtp.split("").forEach((digit, index) => {
      updatedOtp[index] = digit;
    });

    setOtp(updatedOtp);

    otpRefs.current[Math.min(pastedOtp.length, 5)]?.focus();
  };

  // Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    const enteredOtp = otp.join("");

    if (enteredOtp.length !== 6) {
      toast.error("Please enter the complete 6-digit OTP");
      return;
    }

    try {
      setIsVerifying(true);

      const response = await axiosInstance.post(
        "/users/verify-reset-otp",
        {
          email: registeredEmail,
          otp: enteredOtp,
        }
      );

      setVerifiedOtp(enteredOtp);
      setStage("reset");
      toast.success(response.data.message);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Invalid OTP. Please try again."
      );
    } finally {
      setIsVerifying(false);
    }
  };

  // Reset password
  const handleResetPassword = async (values, { setSubmitting }) => {
    try {
      const response = await axiosInstance.post(
        "/users/reset-password",
        {
          email: registeredEmail,
          otp: verifiedOtp,
          newPassword: values.newPassword,
        }
      );

      toast.success(response.data.message);

      setStage("success");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to reset password. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3.5 rounded-xl border border-[#E5DED6] bg-[#FCFAF7] text-[#49372D] outline-none focus:border-[#A45D5D] focus:ring-2 focus:ring-[#A45D5D]/10 transition";

  return (
    <div className="min-h-screen bg-[#F7F3ED] flex items-center justify-center p-4">
      <ToastContainer position="top-right" autoClose={2500} />

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 sm:p-10">
        <Link
          to="/"
          className="text-2xl font-bold tracking-wide text-[#8A6652]"
        >
          FurniNest<span className="text-[#C08B8B]">.</span>
        </Link>

        {/* EMAIL STAGE */}
        {stage === "email" && (
          <>
            <div className="mt-12 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-[#F7F3ED] flex items-center justify-center text-[#A45D5D]">
                <Mail size={26} />
              </div>

              <h2 className="text-3xl font-semibold text-[#49372D] mt-6">
                Forgot password?
              </h2>

              <p className="text-sm text-gray-500 mt-3 leading-6">
                Enter your registered email address. We'll send you
                an OTP to reset your password.
              </p>
            </div>

            <Formik
              initialValues={initialValues}
              validationSchema={emailValidationSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting }) => (
                <Form className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-[#49372D] mb-2">
                      Email address
                    </label>

                    <Field
                      type="email"
                      name="email"
                      placeholder="Enter your registered email"
                      className={inputClass}
                    />

                    <ErrorMessage
                      name="email"
                      component="p"
                      className="text-red-500 text-xs mt-1.5"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 bg-[#8A6652] hover:bg-[#70503F] text-white py-3.5 rounded-xl font-medium transition disabled:opacity-60"
                  >
                    {isSubmitting ? "Sending OTP..." : "Send OTP"}
                    {!isSubmitting && <ArrowRight size={18} />}
                  </button>
                </Form>
              )}
            </Formik>
          </>
        )}

        {/* OTP STAGE */}
        {stage === "otp" && (
          <>
            <div className="mt-12 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-[#F7F3ED] flex items-center justify-center text-[#A45D5D]">
                <ShieldCheck size={26} />
              </div>

              <h2 className="text-3xl font-semibold text-[#49372D] mt-6">
                Verify OTP
              </h2>

              <p className="text-sm text-gray-500 mt-3 leading-6">
                Enter the 6-digit OTP sent to{" "}
                <span className="font-medium text-[#49372D]">
                  {registeredEmail}
                </span>
              </p>
            </div>

            <form onSubmit={handleVerifyOtp}>
              <div className="flex justify-between gap-2 mb-7">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (otpRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength="1"
                    value={digit}
                    onChange={(e) =>
                      handleOtpChange(e.target.value, index)
                    }
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className="w-11 h-12 sm:w-12 sm:h-14 text-center text-xl font-semibold rounded-xl border border-[#E5DED6] bg-[#FCFAF7] text-[#49372D] outline-none focus:border-[#A45D5D] focus:ring-2 focus:ring-[#A45D5D]/10 transition"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={isVerifying}
                className="w-full flex items-center justify-center gap-2 bg-[#8A6652] hover:bg-[#70503F] text-white py-3.5 rounded-xl font-medium transition disabled:opacity-60"
              >
                {isVerifying ? "Verifying..." : "Verify OTP"}
                {!isVerifying && <ArrowRight size={18} />}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Didn't receive the OTP?{" "}
              <button
                type="button"
                onClick={() => setStage("email")}
                className="text-[#A45D5D] font-semibold hover:underline"
              >
                Try again
              </button>
            </p>
          </>
        )}

        {/* RESET PASSWORD STAGE */}
        {stage === "reset" && (
          <>
            <div className="mt-12 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-[#F7F3ED] flex items-center justify-center text-[#A45D5D]">
                <LockKeyhole size={26} />
              </div>

              <h2 className="text-3xl font-semibold text-[#49372D] mt-6">
                Create new password
              </h2>

              <p className="text-sm text-gray-500 mt-3 leading-6">
                Choose a new password for your FurniNest account.
              </p>
            </div>

            <Formik
              initialValues={passwordInitialValues}
              validationSchema={passwordValidationSchema}
              onSubmit={handleResetPassword}
            >
              {({ isSubmitting }) => (
                <Form className="space-y-5">
                  {/* New password */}
                  <div>
                    <label className="block text-sm font-medium text-[#49372D] mb-2">
                      New password
                    </label>

                    <div className="relative">
                      <Field
                        type={showPassword ? "text" : "password"}
                        name="newPassword"
                        placeholder="Enter new password"
                        className={`${inputClass} pr-12`}
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#8A6652]"
                      >
                        {showPassword ? (
                          <EyeOff size={19} />
                        ) : (
                          <Eye size={19} />
                        )}
                      </button>
                    </div>

                    <ErrorMessage
                      name="newPassword"
                      component="p"
                      className="text-red-500 text-xs mt-1.5"
                    />
                  </div>

                  {/* Confirm password */}
                  <div>
                    <label className="block text-sm font-medium text-[#49372D] mb-2">
                      Confirm new password
                    </label>

                    <div className="relative">
                      <Field
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        placeholder="Confirm new password"
                        className={`${inputClass} pr-12`}
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#8A6652]"
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={19} />
                        ) : (
                          <Eye size={19} />
                        )}
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
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 bg-[#8A6652] hover:bg-[#70503F] text-white py-3.5 rounded-xl font-medium transition disabled:opacity-60"
                  >
                    {isSubmitting ? "Updating password..." : "Reset Password"}
                    {!isSubmitting && <ArrowRight size={18} />}
                  </button>
                </Form>
              )}
            </Formik>
          </>
        )}

        {/* SUCCESS STAGE */}
        {stage === "success" && (
          <div className="mt-12 text-center">
            <ShieldCheck
              size={52}
              className="mx-auto text-green-600"
            />

            <h2 className="text-2xl font-semibold text-[#49372D] mt-5">
              Password reset successful!
            </h2>

            <p className="text-sm text-gray-500 mt-3 leading-6">
              Your password has been updated. You can now log in
              using your new password.
            </p>

            <Link
              to="/login"
              className="mt-7 w-full flex items-center justify-center gap-2 bg-[#8A6652] hover:bg-[#70503F] text-white py-3.5 rounded-xl font-medium transition"
            >
              Back to Login
              <ArrowRight size={18} />
            </Link>
          </div>
        )}

        {stage !== "success" && (
          <p className="text-center text-sm text-gray-500 mt-8">
            Remember your password?{" "}
            <Link
              to="/login"
              className="text-[#A45D5D] font-semibold hover:underline"
            >
              Back to login
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
