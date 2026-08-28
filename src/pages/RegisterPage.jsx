import React from "react";
import { Helmet } from "react-helmet-async";
import Register from "../components/auth/Register";

const RegisterPage = () => {
  return (
    <>
      <Helmet>
        <title>Register - HAMAMA Perfumes</title>
        <meta
          name="description"
          content="Create your HAMAMA Perfumes account and discover luxury fragrances."
        />
      </Helmet>
      <Register />
    </>
  );
};

export default RegisterPage;
