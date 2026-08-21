import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Container,
  Navbar as BsNavbar,
  Form,
  InputGroup,
} from "react-bootstrap";
import {
  ShoppingBag,
  Heart,
  User,
  LogOut,
  Search,
  Menu,
  X,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../redux/slices/authSlice";
import { getNavbar } from "../../redux/slices/navbarSlice";
import "../../styles/components/Navbar.css";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { totalItems } = useSelector((state) => state.cart);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);
  const { items: navItems, isLoading } = useSelector((state) => state.navbar);
  const wishlistCount = wishlistItems?.length || 0;

  // ✅ Fetch navbar items on mount
  useEffect(() => {
    dispatch(getNavbar());
  }, [dispatch]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close search on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setSearchOpen(false);
        setSearchQuery("");
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current.focus(), 100);
    }
  }, [searchOpen]);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate("/");
    setMobileMenuOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
      setMobileMenuOpen(false);
    }
  };

  const handleSearchIconClick = () => {
    setSearchOpen(!searchOpen);
    if (!searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  };

  const isActive = (path) => location.pathname === path;

  // ✅ Use dynamic navItems from Redux, fallback to defaults if empty
  const navLinks =
    navItems?.length > 0
      ? navItems
          .filter((item) => item.isVisible && item.isActive)
          .sort((a, b) => a.order - b.order)
          .map((item) => ({
            name: item.label,
            path: item.path,
            target: item.target || "_self",
            id: item._id,
          }))
      : [
          { name: "Home", path: "/" },
          { name: "Shop", path: "/shop" },
          { name: "Collections", path: "/collections" },
          { name: "About", path: "/about" },
          { name: "Contact", path: "/contact" },
        ];

  // Show loading skeleton or minimal navbar while loading
  if (isLoading) {
    return (
      <BsNavbar className="navbar-elegance" fixed="top">
        <Container fluid className="px-3 px-md-4">
          <BsNavbar.Brand as={Link} to="/" className="brand-text">
            <span className="brand-white">REVERIE</span>
            <span className="brand-red">PERFUMES</span>
          </BsNavbar.Brand>
        </Container>
      </BsNavbar>
    );
  }

  return (
    <>
      <BsNavbar
        expand="lg"
        className={`navbar-elegance ${scrolled ? "scrolled" : ""}`}
        fixed="top"
      >
        <Container fluid className="px-3 px-md-4">
          {/* Logo */}
          <BsNavbar.Brand as={Link} to="/" className="brand-text">
            <span className="brand-white">REVERIE</span>
            <span className="brand-red">PERFUMES</span>
          </BsNavbar.Brand>

          {/* Desktop Navigation - Center */}
          <div className="d-none d-lg-flex nav-center">
            {navLinks.map((link) => (
              <Link
                key={link.id || link.path}
                to={link.path}
                target={link.target || "_self"}
                className={`nav-link-center ${isActive(link.path) ? "active" : ""}`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Desktop Actions - Right side */}
          <div className="d-none d-lg-flex align-items-center gap-3">
            {/* Search Bar - Desktop */}
            <Form onSubmit={handleSearch} className="search-form-desktop">
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="Search fragrances..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input-desktop"
                />
                <button type="submit" className="search-btn-desktop">
                  <Search size={18} />
                </button>
              </InputGroup>
            </Form>

            <Link
              to="/wishlist"
              className="icon-btn position-relative"
              title="Wishlist"
            >
              <Heart size={20} />
              {wishlistCount > 0 && (
                <span className="cart-badge">{wishlistCount}</span>
              )}
            </Link>
            <Link
              to="/cart"
              className="icon-btn position-relative"
              title="Cart"
            >
              <ShoppingBag size={20} />
              {totalItems > 0 && (
                <span className="cart-badge">{totalItems}</span>
              )}
            </Link>

            {isAuthenticated ? (
              <>
                <Link to="/profile" className="icon-btn">
                  <User size={20} />
                </Link>
                <button onClick={handleLogout} className="icon-btn logout-btn">
                  <LogOut size={20} />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link-auth">
                  Login
                </Link>
                <Link to="/register" className="btn-register">
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Actions - Right side (icons + burger) */}
          <div className="d-flex d-lg-none align-items-center gap-2">
            {/* Search Toggle - Mobile */}
            <button
              className="icon-btn mobile-search-toggle"
              onClick={handleSearchIconClick}
              aria-label="Toggle search"
            >
              <Search size={20} />
            </button>

            {/* Wishlist - Mobile */}
            <Link
              to="/wishlist"
              className="icon-btn position-relative mobile-icon"
              title="Wishlist"
            >
              <Heart size={20} />
              {wishlistCount > 0 && (
                <span className="cart-badge">{wishlistCount}</span>
              )}
            </Link>

            {/* Cart - Mobile */}
            <Link
              to="/cart"
              className="icon-btn position-relative mobile-icon"
              title="Cart"
            >
              <ShoppingBag size={20} />
              {totalItems > 0 && (
                <span className="cart-badge">{totalItems}</span>
              )}
            </Link>

            {/* Burger Menu */}
            <button
              className="mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </Container>
      </BsNavbar>

      {/* Mobile Search Bar - Expandable */}
      <div className={`mobile-search-overlay ${searchOpen ? "open" : ""}`}>
        <div className="mobile-search-container">
          <Form onSubmit={handleSearch} className="mobile-search-form">
            <InputGroup>
              <Form.Control
                ref={searchInputRef}
                type="text"
                placeholder="Search for perfumes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mobile-search-input"
                aria-label="Search"
              />
              <button type="submit" className="mobile-search-submit">
                <Search size={20} />
              </button>
              <button
                type="button"
                className="mobile-search-close"
                onClick={() => {
                  setSearchOpen(false);
                  setSearchQuery("");
                }}
              >
                <X size={20} />
              </button>
            </InputGroup>
          </Form>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${mobileMenuOpen ? "open" : ""}`}>
        <div className="mobile-menu-inner">
          <div className="mobile-menu-header">
            <span className="mobile-menu-title">Menu</span>
            <button
              className="mobile-menu-close"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X size={24} />
            </button>
          </div>

          {navLinks.map((link) => (
            <Link
              key={link.id || link.path}
              to={link.path}
              target={link.target || "_self"}
              className={`mobile-nav-link ${isActive(link.path) ? "active" : ""}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}

          <div className="mobile-auth">
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  className="mobile-nav-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profile
                </Link>
                <Link
                  to="/orders"
                  className="mobile-nav-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Orders
                </Link>
                <Link
                  to="/wishlist"
                  className="mobile-nav-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Wishlist ({wishlistCount})
                </Link>
                <button onClick={handleLogout} className="mobile-logout-btn">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="mobile-nav-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="mobile-register-btn"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Create Account
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
