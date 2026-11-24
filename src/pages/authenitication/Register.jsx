
import React, { useState,useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axiosInstance from '../../api/axiosinstance';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link, useNavigate } from 'react-router-dom';

const initialValues = {
  name: '',
  password: '',
  email: '',
  confirmPassword: '',
};

const validationSchema = Yup.object({
  name: Yup.string().required('Name is required!'),
  email: Yup.string()
    .email('Invalid email format')
    .required('Email is required!'),
  password: Yup.string()
    .required('Password is required!')
    .min(6, 'Must be at least 6 characters'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Password must match')
    .required('Confirm your password'),
});

const otpSchema = Yup.object({
  otp: Yup.string()
    .matches(/^\d{6}$/, 'Enter a valid 6-digit OTP')
    .required('OTP is required'),
});

function Register() {
  const navigate = useNavigate();

  const [isOtpStage, setIsOtpStage] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [resendTimer, setResendTimer] = useState(60);
const [isResending, setIsResending] = useState(false);

  // Registration
  const onSubmit = async (values, { resetForm }) => {
    try {
      setIsSubmitting(true);

      const { confirmPassword, ...dataToSend } = values;

      const res = await axiosInstance.post(
        '/users/register',
        dataToSend
      );

      setRegisteredEmail(values.email.trim().toLowerCase());
setResendTimer(60);
setIsOtpStage(true);

      resetForm();

      toast.success(
        res.data.message || 'OTP sent to your email!'
      );

    } catch (error) {
      console.error('Registration error:', error);

      toast.error(
        error.response?.data?.message || 'Registration failed. Try again!'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // OTP Verification
  const verifyOtp = async (values, { resetForm }) => {
    try {
      setIsSubmitting(true);

      const res = await axiosInstance.post(
        '/users/verify-otp',
        {
          email: registeredEmail,
          otp: values.otp,
        }
      );

      toast.success(
        res.data.message || 'Email verified successfully!'
      );

      resetForm();

      setTimeout(() => {
        navigate('/login');
      }, 1500);

    } catch (error) {
      console.error('OTP verification error:', error);

      toast.error(
        error.response?.data?.message || 'OTP verification failed!'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
  if (!isOtpStage || resendTimer <= 0) return;

  const timer = setInterval(() => {
    setResendTimer((prev) => prev - 1);
  }, 1000);

  return () => clearInterval(timer);
}, [isOtpStage, resendTimer]);

const handleResendOtp = async () => {
  try {
    setIsResending(true);

    const response = await axiosInstance.post('/users/resend-otp', {
      email: registeredEmail,
    });

    toast.success(response.data.message);
    setResendTimer(60);
  } catch (error) {
    toast.error(
      error.response?.data?.message || 'Unable to resend OTP'
    );
  } finally {
    setIsResending(false);
  }
};

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-6">

      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">

        <h3 className="text-2xl font-bold text-center mb-2">
          {isOtpStage ? 'Verify Your Email' : 'Create Account'}
        </h3>

        <p className="text-gray-500 text-sm text-center mb-6">
          {isOtpStage
            ? `Enter the 6-digit OTP sent to ${registeredEmail}`
            : 'Register to get started with FurniNest'}
        </p>

        {!isOtpStage ? (

          // Registration Form
          <Formik
            initialValues={initialValues}
            onSubmit={onSubmit}
            validationSchema={validationSchema}
          >
            <Form noValidate>

              <div className="mb-4">
                <Field
                  type="text"
                  name="name"
                  placeholder="Name"
                  className="w-full px-3 py-2 border rounded-lg"
                />
                <ErrorMessage
                  name="name"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              <div className="mb-4">
                <Field
                  type="email"
                  name="email"
                  placeholder="Email"
                  className="w-full px-3 py-2 border rounded-lg"
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              <div className="mb-4">
                <Field
                  type="password"
                  name="password"
                  placeholder="Password"
                  className="w-full px-3 py-2 border rounded-lg"
                />
                <ErrorMessage
                  name="password"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              <div className="mb-4">
                <Field
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm password"
                  className="w-full px-3 py-2 border rounded-lg"
                />
                <ErrorMessage
                  name="confirmPassword"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                {isSubmitting ? 'Sending OTP...' : 'Create Account'}
              </button>

              <p className="mt-4 text-center text-sm">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-500 hover:underline">
                  Login
                </Link>
              </p>

            </Form>
          </Formik>

        ) : (

          // OTP Form

<Formik
  initialValues={{ otp: '' }}
  validationSchema={otpSchema}
  onSubmit={verifyOtp}
>
  {({ values, setFieldValue, isSubmitting }) => (
    <Form noValidate>
      <div className="mb-5">
        <div className="flex justify-center gap-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              autoComplete={index === 0 ? "one-time-code" : "off"}
              value={(values.otp || '')[index] || ''}
              onChange={(e) => {
                const digit = e.target.value.replace(/\D/g, '');

             const otp = (values.otp || '').split('');
                otp[index] = digit.slice(-1);

                setFieldValue('otp', otp.join(''));

                if (digit && index < 5) {
                  document.getElementById(`otp-${index + 1}`)?.focus();
                }
              }}
              onKeyDown={(e) => {
                if (
                  e.key === 'Backspace' &&
                  !values.otp[index] &&
                  index > 0
                ) {
                  document.getElementById(`otp-${index - 1}`)?.focus();
                }
              }}
              onPaste={(e) => {
                e.preventDefault();

                const pasted = e.clipboardData
                  .getData('text')
                  .replace(/\D/g, '')
                  .slice(0, 6);

                setFieldValue('otp', pasted);

                document.getElementById(
                  `otp-${Math.min(pasted.length, 5)}`
                )?.focus();
              }}
              className="w-11 h-12 sm:w-12 sm:h-14 border border-gray-300 rounded-lg text-center text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-[#A45D5D] focus:border-[#A45D5D]"
            />
          ))}
        </div>

        <ErrorMessage
          name="otp"
          component="div"
          className="text-red-500 text-sm mt-2 text-center"
        />
      </div>

      <div className="mt-4 mb-4 text-center">
        {resendTimer > 0 ? (
          <p className="text-sm text-gray-500">
            Resend OTP in{' '}
            <span className="font-semibold">{resendTimer}s</span>
          </p>
        ) : (
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={isResending}
            className="text-sm font-semibold text-[#A45D5D] hover:underline disabled:opacity-50"
          >
            {isResending ? 'Sending...' : 'Resend OTP'}
          </button>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting || isResending}
        className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
      >
        {isSubmitting ? 'Verifying...' : 'Verify Email'}
      </button>

      <button
        type="button"
        onClick={() => setIsOtpStage(false)}
        className="w-full mt-3 text-gray-600 hover:text-blue-500"
      >
        Back to Registration
      </button>
    </Form>
  )}
</Formik>



        )}

        <ToastContainer position="top-right" />

      </div>
    </div>
  );
}

export default Register;
