import React from "react";
import { Helmet } from "react-helmet-async";
import ForgotPassword from "../components/auth/ForgotPassword";

const ForgotPasswordPage = () => {
  return (
    <>
      <Helmet>
        <title>Forgot Password - Elegance Perfumes</title>
        <meta
          name="description"
          content="Reset your Elegance Perfumes account password."
        />
      </Helmet>
      <ForgotPassword />
    </>
  );
};

export default ForgotPasswordPage;
