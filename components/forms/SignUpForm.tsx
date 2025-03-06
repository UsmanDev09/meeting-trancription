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
} from "@heroicons/react/24/solid";
import LinkedInSvg from "../svgs/linkedInSvg";
import GoogleSvg from "../svgs/googleSvg";
import FacebookSvg from "../svgs/facebookSvg";
import supabase from "@/lib/supabase";

interface SignUpFormValues {
  email: string;
  password: string;
  confirmPassword: string;
}

const SignUpForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [signupStatus, setSignupStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const initialValues: SignUpFormValues = {
    email: "",
    password: "",
    confirmPassword: "",
  };

  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Invalid email address")
      .required("Email required"),
    password: Yup.string()
      .min(8, "Must be at least 8 characters")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Must contain at least one uppercase letter, one lowercase letter, and one number"
      )
      .required("Password required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password")], "Passwords must match")
      .required("Confirm Password required"),
  });

  const handleSubmit = async (
    values: SignUpFormValues,
    { setSubmitting }: FormikHelpers<SignUpFormValues>
  ) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          emailRedirectTo: `${window.location.origin}/verify-email`,
        },
      });

      if (error) {
        throw error;
      }

      setSignupStatus("success");
    } catch (error: any) {
      console.error("Sign up failed:", error);
      setErrorMessage(error.message || "An error occurred during sign up");
      setSignupStatus("error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSocialSignUp = async (
    provider: "google" | "facebook" | "linkedin"
  ) => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        // options: {
        //   redirectTo: `${window.location.origin}/verify-email`,
        // },
      });

      if (error) throw error;
    } catch (error: any) {
      console.error(`${provider} sign up failed:`, error);
      setErrorMessage(`Failed to sign up with ${provider}`);
      setSignupStatus("error");
    }
  };

  if (signupStatus === "success") {
    return (
      <div className="bg-whiteTransparent40 border-gray-80 border-2 border-white rounded-3xl p-8 w-full max-w-md text-center">
        <div className="flex justify-center mb-6">
          <div className="w-10 h-10 bg-primary-700 rounded-xl flex items-center justify-center">
            <span className="text-white text-2xl font-bold">S</span>
          </div>
        </div>
        <h2 className="text-2xl font-semibold mb-4">Check Your Email</h2>
        <p className="text-gray-600 mb-4">
          We&apos;ve sent you an email with a verification link. Please check
          your inbox and click the link to verify your account.
        </p>
        <p className="text-sm text-gray-500">
          Didn&apos;t receive the email?{" "}
          <button
            onClick={() => setSignupStatus("idle")}
            className="text-primary-700 hover:underline"
          >
            Try again
          </button>
        </p>
      </div>
    );
  }

  return (
    <div className="bg-whiteTransparent40 border-gray-80 border-2 border-white rounded-3xl p-5 w-full max-w-md">
      <div className="flex justify-center mb-6">
        <div className="w-10 h-10 bg-primary-700 rounded-xl flex items-center justify-center">
          <span className="text-white text-2xl font-bold">S</span>
        </div>
      </div>
      <h1 className="text-[32px] font-medium leading-32 text-center mb-2">
        Get Started
      </h1>
      <p className="text-gray-500 text-[12px] text-center mb-8">
        Ready to skill up? SaaS awaits.
        <br />
        Let&apos;s make awesome things!
      </p>

      {signupStatus === "error" && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {errorMessage}
        </div>
      )}

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-4">
            <div className="relative" style={{ marginBottom: "5.5%" }}>
              <EnvelopeIcon className="w-6 h-6 text-primary-700 absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
              <Field
                type="email"
                name="email"
                placeholder="Your email"
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 hover:border-primary-700"
              />
              <ErrorMessage
                name="email"
                component="div"
                className="text-red-500 text-custom-small mt-1 absolute left-0 -bottom-6"
              />
            </div>

            <div className="relative" style={{ marginBottom: "5.5%" }}>
              <LockClosedIcon className="w-6 h-6 text-primary-700 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <Field
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                className="w-full pl-12 pr-12 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 hover:border-primary-700"
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
                className="text-red-500 text-custom-small mt-1 absolute left-0 -bottom-6"
              />
            </div>

            <div className="relative" style={{ marginBottom: "5%" }}>
              <LockClosedIcon className="w-6 h-6 text-primary-700 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <Field
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm your password"
                className="w-full pl-12 pr-12 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 hover:border-primary-700"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {showConfirmPassword ? (
                  <EyeIcon className="w-6 h-6 text-primary-700" />
                ) : (
                  <EyeSlashIcon className="w-6 h-6 text-primary-700" />
                )}
              </button>
              <ErrorMessage
                name="confirmPassword"
                component="div"
                className="text-red-500 text-custom-small mt-1 absolute left-0 -bottom-6"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full bg-primary text-white py-3 rounded-md font-semibold hover:bg-primary-800 transition ${
                isSubmitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? "Signing up..." : "Sign up"}
            </button>
          </Form>
        )}
      </Formik>

      <p className="text-center text-wrap text-[12px] text-gray-500 mt-4">
        By signing up, I agree to the{" "}
        <Link
          href="/privacy-policy"
          className="text-primary-700 text-[12px] hover:underline"
        >
          Privacy Policy
        </Link>{" "}
        and{" "}
        <Link
          href="/terms"
          className="text-primary-700 text-[12px] hover:underline"
        >
          Terms and Conditions
        </Link>
      </p>

      <div className="flex justify-between space-x-4 mt-6">
        <button
          onClick={() => handleSocialSignUp("linkedin")}
          className="w-12 h-12 flex items-center justify-center px-[15%] py-[7%] rounded-md border bg-gray-50 border-gray-300 hover:border-primary-700 transition duration-300"
        >
          <LinkedInSvg />
        </button>
        <button
          onClick={() => handleSocialSignUp("google")}
          className="w-12 h-12 flex items-center justify-center px-[15%] py-[7%] rounded-md border bg-gray-50 border-gray-300 hover:border-primary-700 transition duration-300"
        >
          <GoogleSvg />
        </button>
        <button
          onClick={() => handleSocialSignUp("facebook")}
          className="w-12 h-12 flex items-center justify-center px-[15%] py-[7%] rounded-md border bg-gray-50 border-gray-300 hover:border-primary-700 transition duration-300"
        >
          <FacebookSvg />
        </button>
      </div>

      <p className="text-center text-sm text-gray-500 mt-6">
        Have an account?{" "}
        <Link
          href="/sign-in"
          className="text-primary-700 font-semibold hover:underline"
        >
          Login
        </Link>
      </p>
    </div>
  );
};

export default SignUpForm;
