import React from "react";
import { Helmet } from "react-helmet-async";
import ForgotPassword from "../components/auth/ForgotPassword";

const ForgotPasswordPage = () => {
  return (
    <>
      <Helmet>
        <title>Forgot Password - HAMAMA Perfumes</title>
        <meta
          name="description"
          content="Reset your HAMAMA Perfumes account password."
        />
      </Helmet>
      <ForgotPassword />
    </>
  );
};

export default ForgotPasswordPage;
