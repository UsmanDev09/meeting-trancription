"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik";
import * as Yup from "yup";
import {
  EnvelopeIcon,
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
  UserIcon,
} from "@heroicons/react/24/solid";
import LinkedInSvg from "../svgs/linkedInSvg";
import GoogleSvg from "../svgs/googleSvg";
import FacebookSvg from "../svgs/facebookSvg";
import { useDispatch } from "react-redux";
import { setUser } from "@/redux/slices/authSlice";
import { signupUser } from "@/app/actions/auth";
import { toast } from "react-toastify";

export default function SignUpForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();

  interface SignUpFormValues {
    name: string;
    email: string;
    password: string;
  }

  const initialValues = {
    name: "",
    email: "",
    password: "",
  };

  const validationSchema = Yup.object({
    name: Yup.string().required("Name is required"),
    email: Yup.string()
      .email("Invalid email format")
      .required("Email is required"),
    password: Yup.string()
      .min(8, "Password must be at least 8 characters")
      .required("Password is required"),
  });

  const handleSubmit = async (
    values: SignUpFormValues,
    { setSubmitting }: FormikHelpers<SignUpFormValues>
  ) => {
    try {
      const { name, email, password } = values;
      
      const result = await signupUser(email, password, name);
      
      if (!result.success) {
        toast(result.error || "Error during sign up", { type: "error" });
      } else if (result.user) {
        dispatch(setUser({
          id: result.user.id,
          email: result.user.email,
          name: result.user.name
        }));
        
        toast("Account created successfully!", { type: "success" });
        router.push("/");
      } else {
        toast(result.message || "Please check your email to confirm your account", { type: "info" });
        router.push("/check-email");
      }
    } catch (error) {
      console.error("Sign up error:", error);
      toast("An unexpected error occurred. Please try again later.", {
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary-50 flex flex-col items-center justify-center p-4">
      <div className="bg-whiteTransparent40 border-2 border-white rounded-3xl p-5 w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="w-10 h-10 bg-primary-700 rounded-xl flex items-center justify-center">
            <span className="text-white text-2xl font-bold">S</span>
          </div>
        </div>
        <h1 className="text-[32px] font-medium leading-32 text-center mb-2">
          Create an Account
        </h1>
        <p className="text-gray-500 text-[12px] text-center mb-8">
          Start your journey with us today and unlock a world of possibilities!
        </p>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4">
              <div className="relative" style={{ marginBottom: "5%" }}>
                <UserIcon className="w-6 h-6 text-primary-700 absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                <Field
                  type="text"
                  name="name"
                  placeholder="Your name"
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-700 hover:border-primary-700"
                />
                <ErrorMessage
                  name="name"
                  component="div"
                  className="text-red-500 text-custom-small mt-1 absolute left-0 -bottom-6"
                />
              </div>
              <div className="relative" style={{ marginBottom: "5%" }}>
                <EnvelopeIcon className="w-6 h-6 text-primary-700 absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                <Field
                  type="email"
                  name="email"
                  placeholder="Your email"
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-700 hover:border-primary-700"
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-red-500 text-custom-small mt-1 absolute left-0 -bottom-6"
                />
              </div>
              <div className="relative" style={{ marginBottom: "2%" }}>
                <LockClosedIcon className="w-6 h-6 text-primary-700 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <Field
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Create a password"
                  className="w-full pl-12 pr-12 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-700 hover:border hover:border-primary-700"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeIcon className="w-6 h-6 text-primary-700" />
                  ) : (
                    <EyeSlashIcon className="w-6 h-6 text-primary-700" />
                  )}
                </button>
                <ErrorMessage
                  name="password"
                  component="div"
                  className="text-red-500 text-sm mt-1 absolute left-0 -bottom-6"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full bg-primary text-white py-3 rounded-md font-semibold hover:bg-primary-800 transition ${
                  isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isSubmitting ? "Creating Account..." : "Create Account"}
              </button>
            </Form>
          )}
        </Formik>
        <div className="text-center mt-4">
          <p className="text-gray-500 text-sm">
            By signing up, you agree to our{" "}
            <Link href="/terms" className="text-primary-700 hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-primary-700 hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
        <div className="flex justify-between space-x-4 mt-6">
          <button className="w-12 h-12 flex items-center justify-center px-[15%] py-[7%] rounded-md border bg-gray-50 border-gray-300 hover:border-primary-700 transition duration-300">
            <LinkedInSvg />
          </button>
          <button className="w-12 h-12 flex items-center justify-center px-[15%] py-[7%] rounded-md border bg-gray-50 border-gray-300 hover:border-primary-700 transition duration-300">
            <GoogleSvg />
          </button>
          <button className="w-12 h-12 flex items-center justify-center px-[15%] py-[7%] rounded-md border bg-gray-50 border-gray-300 hover:border-primary-700 transition duration-300">
            <FacebookSvg />
          </button>
        </div>
      </div>
      <p className="text-center text-sm text-gray-500 mt-6">
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className="text-primary-700 font-semibold hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
