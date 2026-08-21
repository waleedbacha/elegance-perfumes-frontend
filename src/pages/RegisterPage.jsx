import React from "react";
import { Helmet } from "react-helmet-async";
import Register from "../components/auth/Register";

const RegisterPage = () => {
  return (
    <>
      <Helmet>
        <title>Register - Elegance Perfumes</title>
        <meta
          name="description"
          content="Create your Elegance Perfumes account and discover luxury fragrances."
        />
      </Helmet>
      <Register />
    </>
  );
};

export default RegisterPage;
