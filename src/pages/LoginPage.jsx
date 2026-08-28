import React from "react";
import { Helmet } from "react-helmet-async";
import Login from "../components/auth/Login";

const LoginPage = () => {
  return (
    <>
      <Helmet>
        <title>Login - HAMAMA Perfumes</title>
        <meta
          name="description"
          content="Sign in to your HAMAMA Perfumes account and explore luxury fragrances."
        />
      </Helmet>
      <Login />
    </>
  );
};

export default LoginPage;
