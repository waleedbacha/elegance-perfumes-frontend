import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div className="text-center py-20">
      <h1 className="text-6xl font-bold">404</h1>
      <p className="text-xl mt-4">Page Not Found</p>
      <Link to="/" className="text-secondary hover:underline mt-4 inline-block">
        Go Home
      </Link>
    </div>
  );
};
export default NotFoundPage;
