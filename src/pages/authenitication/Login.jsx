import React from 'react';
import { Form, Formik, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDispatch } from 'react-redux';
import { setLogged } from '../../slice/AdminSlice';
import axiosInstance from '../../api/axiosinstance';
import { setUser } from '../../slice/AuthSlice';
import { GoogleLogin } from "@react-oauth/google";

const initialValues = {
  password: '',
  email: '',
};

const validationSchema = Yup.object({
  email: Yup.string().email('Invalid email format').required('Email is required!'),
  password: Yup.string().required('Password is required!').min(8, 'Must be at least 8 characters'),
});

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onSubmit = async (values, { resetForm }) => {
    try {
      const response = await axiosInstance.post(`/users/login`, values);
     dispatch(setUser(response.data.user));

      const userRole = response.data.user.isAdmin ? 'admin' : 'user';
      navigate(userRole === 'admin' ? '/admin' : '/');
      resetForm();
      toast.success(response.data.message);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Something went wrong');
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
  try {
    const response = await axiosInstance.post(
      "/users/google",
      {
        credential: credentialResponse.credential,
      }
    );

    dispatch(setUser(response.data.user));

    const userRole = response.data.user.isAdmin
      ? "admin"
      : "user";

    toast.success(response.data.message);

    navigate(userRole === "admin" ? "/admin" : "/");

  } catch (error) {
    console.error("Google Login Error:", error);

    toast.error(
      error.response?.data?.message ||
      "Google authentication failed"
    );
  }
};

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('https://wallpaperaccess.com/full/2076143.jpg')" }}
    >
      <div className="border border-red-700 p-8 shadow-lg rounded-xl bg-opacity-20 backdrop-blur-lg w-96 text-white">
        <h3 className="text-2xl font-bold text-center mb-6 text-red-500">LOGIN</h3>

        <Formik initialValues={initialValues} onSubmit={onSubmit} validationSchema={validationSchema}>
          <Form>
            {/* Email Input */}
            <div className="mb-6">
              <Field
                type="email"
                placeholder="Email"
                name="email"
                className="w-full bg-transparent border border-red-500 text-white placeholder-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <ErrorMessage name="email" component="div" className="text-red-400 text-sm mt-1" />
            </div>

            {/* Password Input */}
            <div className="mb-6">
              <Field
                type="password"
                placeholder="Password"
                name="password"
                className="w-full bg-transparent border border-red-500 text-white placeholder-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <ErrorMessage name="password" component="div" className="text-red-400 text-sm mt-1" />
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full py-2 rounded-lg bg-red-500 text-gray-900 font-bold text-lg shadow-md transition hover:bg-red-600 hover:shadow-red-500/50"
            >
              Login
            </button>
            <div className="flex items-center gap-3 my-5">
  <div className="flex-1 border-t border-gray-400"></div>
  <span className="text-sm text-gray-300">OR</span>
  <div className="flex-1 border-t border-gray-400"></div>
</div>

<div className="flex justify-center">
  <GoogleLogin
    onSuccess={handleGoogleSuccess}
    onError={() => {
      toast.error("Google login failed");
    }}
    theme="outline"
    shape="rectangular"
    text="continue_with"
    width="300"
  />
</div>

            {/* Register Link */}
            <p className="mt-6 text-center text-sm text-gray-300">
              Don't have an account?{' '}
              <Link to="/register" className="text-red-500 hover:underline">
                Register
              </Link>
            </p>
          </Form>
        </Formik>

        <ToastContainer />
      </div>
    </div>
  );
}

export default Login;
