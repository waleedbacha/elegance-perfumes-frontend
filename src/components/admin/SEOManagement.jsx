import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Tabs,
  Tab,
  Badge,
  Alert,
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import {
  getSeoSettings,
  updateGlobalSettings,
  updatePageSettings,
  updateProductTemplates,
  updateCategoryTemplates,
  updateSitemapSettings,
  updateSocialSettings,
  runSeoAudit,
  getSeoHistory,
  resetToDefaults,
} from "../../redux/slices/seoSlice";
import toast from "react-hot-toast";
import "../../styles/pages/SEOManagement.css";

const SEOManagement = () => {
  const dispatch = useDispatch();
  const seoState = useSelector((state) => state.seo) || {};
  const { settings, isLoading, audit, history } = seoState;
  const [activeTab, setActiveTab] = useState("global");
  const [selectedPage, setSelectedPage] = useState("homepage");

  // ✅ Form state for page settings
  const [pageFormData, setPageFormData] = useState({
    title: "",
    description: "",
    keywords: "",
    og_image: "",
    canonical: "",
    no_index: false,
    no_follow: false,
  });

  // Fetch settings on mount
  useEffect(() => {
    dispatch(getSeoSettings());
  }, [dispatch]);

  // ✅ Update form data when selectedPage changes or settings load
  useEffect(() => {
    if (settings?.pages && settings.pages[selectedPage]) {
      const pageData = settings.pages[selectedPage];
      setPageFormData({
        title: pageData.title || "",
        description: pageData.description || "",
        keywords: pageData.keywords || "",
        og_image: pageData.og_image || "",
        canonical: pageData.canonical || "",
        no_index: pageData.no_index || false,
        no_follow: pageData.no_follow || false,
      });
    }
  }, [selectedPage, settings]);

  // ============================================
  // HANDLERS
  // ============================================

  const handlePageChange = (e) => {
    const newPage = e.target.value;
    setSelectedPage(newPage);
    // ✅ Form will update via the useEffect above
  };

  const handlePageFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPageFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleGlobalUpdate = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      global: {
        site_name: formData.get("site_name"),
        site_description: formData.get("site_description"),
        site_keywords: formData.get("site_keywords"),
        default_og_image: formData.get("default_og_image"),
        twitter_handle: formData.get("twitter_handle"),
        google_analytics_id: formData.get("google_analytics_id"),
        google_tag_manager_id: formData.get("google_tag_manager_id"),
        facebook_pixel_id: formData.get("facebook_pixel_id"),
        google_verification: formData.get("google_verification"),
        bing_verification: formData.get("bing_verification"),
        robots: {
          index: formData.get("robots_index") === "true",
          follow: formData.get("robots_follow") === "true",
          advanced: formData.get("robots_advanced"),
        },
      },
    };
    await dispatch(updateGlobalSettings(data)).unwrap();
    toast.success("Global settings updated!");
    dispatch(getSeoSettings());
  };

  const handlePageUpdate = async (e) => {
    e.preventDefault();
    // ✅ Use the pageFormData state instead of FormData
    const data = {
      title: pageFormData.title,
      description: pageFormData.description,
      keywords: pageFormData.keywords,
      og_image: pageFormData.og_image,
      canonical: pageFormData.canonical,
      no_index: pageFormData.no_index,
      no_follow: pageFormData.no_follow,
    };
    await dispatch(updatePageSettings({ page: selectedPage, data })).unwrap();
    toast.success(`${selectedPage} SEO updated!`);
    dispatch(getSeoSettings());
  };

  const handleProductTemplatesUpdate = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      product_templates: {
        title_template: formData.get("title_template"),
        description_template: formData.get("description_template"),
        keywords_template: formData.get("keywords_template"),
        max_title_length: parseInt(formData.get("max_title_length")) || 60,
        max_description_length:
          parseInt(formData.get("max_description_length")) || 160,
      },
    };
    await dispatch(updateProductTemplates(data)).unwrap();
    toast.success("Product templates updated!");
    dispatch(getSeoSettings());
  };

  const handleRunAudit = async () => {
    await dispatch(runSeoAudit()).unwrap();
    toast.success("SEO audit completed!");
    dispatch(getSeoSettings());
  };

  const handleReset = async () => {
    if (
      window.confirm(
        "Are you sure you want to reset all SEO settings to defaults?",
      )
    ) {
      await dispatch(resetToDefaults()).unwrap();
      toast.success("Settings reset to defaults!");
      dispatch(getSeoSettings());
    }
  };

  // ============================================
  // RENDER FUNCTIONS
  // ============================================

  const renderGlobalSettings = () => {
    const g = settings?.global || {};
    return (
      <Form onSubmit={handleGlobalUpdate} key="global-form">
        <Card className="seo-card">
          <Card.Body>
            <h5 className="section-title">🌐 General Information</h5>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Site Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="site_name"
                    defaultValue={g.site_name}
                    placeholder="HAMAMA Perfumes"
                  />
                  <Form.Text className="text-muted">
                    Your brand or site name
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Default OG Image</Form.Label>
                  <Form.Control
                    type="text"
                    name="default_og_image"
                    defaultValue={g.default_og_image}
                    placeholder="/default-og-image.jpg"
                  />
                  <Form.Text className="text-muted">
                    Default image for social sharing
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Site Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="site_description"
                defaultValue={g.site_description}
                placeholder="Luxury fragrances for men and women in Pakistan"
              />
              <Form.Text className="text-muted">
                Brief description of your site (max 160 chars)
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Site Keywords</Form.Label>
              <Form.Control
                type="text"
                name="site_keywords"
                defaultValue={g.site_keywords}
                placeholder="perfume, luxury fragrance, premium scents"
              />
              <Form.Text className="text-muted">
                Comma-separated keywords
              </Form.Text>
            </Form.Group>

            <hr />

            <h5 className="section-title">📱 Analytics & Verification</h5>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Google Analytics ID</Form.Label>
                  <Form.Control
                    type="text"
                    name="google_analytics_id"
                    defaultValue={g.google_analytics_id}
                    placeholder="UA-XXXXX-X"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Google Tag Manager ID</Form.Label>
                  <Form.Control
                    type="text"
                    name="google_tag_manager_id"
                    defaultValue={g.google_tag_manager_id}
                    placeholder="GTM-XXXX"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Facebook Pixel ID</Form.Label>
                  <Form.Control
                    type="text"
                    name="facebook_pixel_id"
                    defaultValue={g.facebook_pixel_id}
                    placeholder="1234567890"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Twitter Handle</Form.Label>
                  <Form.Control
                    type="text"
                    name="twitter_handle"
                    defaultValue={g.twitter_handle}
                    placeholder="@eleganceperfumes"
                  />
                </Form.Group>
              </Col>
            </Row>

            <hr />

            <h5 className="section-title">🤖 Robots Settings</h5>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Index</Form.Label>
                  <Form.Select
                    name="robots_index"
                    defaultValue={g.robots?.index !== false ? "true" : "false"}
                  >
                    <option value="true">Allow Indexing</option>
                    <option value="false">No Index</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Follow</Form.Label>
                  <Form.Select
                    name="robots_follow"
                    defaultValue={g.robots?.follow !== false ? "true" : "false"}
                  >
                    <option value="true">Allow Follow</option>
                    <option value="false">No Follow</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Advanced</Form.Label>
                  <Form.Control
                    type="text"
                    name="robots_advanced"
                    defaultValue={g.robots?.advanced || "noarchive, nosnippet"}
                    placeholder="noarchive, nosnippet"
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex gap-2 mt-3">
              <Button type="submit" variant="danger" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Global Settings"}
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Form>
    );
  };

  const renderPageSettings = () => {
    const pages = {
      homepage: "Homepage",
      shop: "Shop",
      collections: "Collections",
      about: "About Us",
      contact: "Contact Us",
    };

    return (
      <>
        <div className="page-selector mb-4">
          <Form.Label className="fw-bold">Select Page</Form.Label>
          <Form.Select value={selectedPage} onChange={handlePageChange}>
            {Object.entries(pages).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </Form.Select>
        </div>

        <Form onSubmit={handlePageUpdate}>
          <Card className="seo-card">
            <Card.Body>
              <h5 className="section-title">📄 {pages[selectedPage]} SEO</h5>

              <Form.Group className="mb-3">
                <Form.Label>Meta Title</Form.Label>
                <Form.Control
                  type="text"
                  name="title"
                  value={pageFormData.title}
                  onChange={handlePageFormChange}
                  placeholder="Page title for SEO"
                />
                <Form.Text className="text-muted">
                  Recommended: 50-60 characters (
                  {pageFormData.title?.length || 0}/60)
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Meta Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="description"
                  value={pageFormData.description}
                  onChange={handlePageFormChange}
                  placeholder="Page description for SEO"
                />
                <Form.Text className="text-muted">
                  Recommended: 150-160 characters (
                  {pageFormData.description?.length || 0}/160)
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Meta Keywords</Form.Label>
                <Form.Control
                  type="text"
                  name="keywords"
                  value={pageFormData.keywords}
                  onChange={handlePageFormChange}
                  placeholder="page, keywords, separated, by, commas"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>OG Image URL</Form.Label>
                <Form.Control
                  type="text"
                  name="og_image"
                  value={pageFormData.og_image}
                  onChange={handlePageFormChange}
                  placeholder="/og-image.jpg"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Canonical URL</Form.Label>
                <Form.Control
                  type="text"
                  name="canonical"
                  value={pageFormData.canonical}
                  onChange={handlePageFormChange}
                  placeholder="/page-slug"
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>No Index</Form.Label>
                    <Form.Select
                      name="no_index"
                      value={pageFormData.no_index ? "true" : "false"}
                      onChange={handlePageFormChange}
                    >
                      <option value="false">Allow Index</option>
                      <option value="true">No Index</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>No Follow</Form.Label>
                    <Form.Select
                      name="no_follow"
                      value={pageFormData.no_follow ? "true" : "false"}
                      onChange={handlePageFormChange}
                    >
                      <option value="false">Allow Follow</option>
                      <option value="true">No Follow</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Button type="submit" variant="danger" disabled={isLoading}>
                {isLoading ? "Saving..." : `Save ${pages[selectedPage]} SEO`}
              </Button>
            </Card.Body>
          </Card>
        </Form>
      </>
    );
  };

  const renderProductTemplates = () => {
    const t = settings?.product_templates || {};
    return (
      <Form onSubmit={handleProductTemplatesUpdate}>
        <Card className="seo-card">
          <Card.Body>
            <h5 className="section-title">🏷️ Product SEO Templates</h5>
            <p className="text-muted small">
              Use <code>{`{product_name}`}</code>, <code>{`{brand}`}</code>,{" "}
              <code>{`{category}`}</code>, <code>{`{description}`}</code>,{" "}
              <code>{`{site_name}`}</code> as variables
            </p>

            <Form.Group className="mb-3">
              <Form.Label>Title Template</Form.Label>
              <Form.Control
                type="text"
                name="title_template"
                defaultValue={
                  t.title_template || "{product_name} | {brand} | {site_name}"
                }
              />
              <Form.Text className="text-muted">
                Example: "Chanel No. 5 | Chanel | HAMAMA Perfumes"
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description Template</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="description_template"
                defaultValue={
                  t.description_template ||
                  "Buy {product_name} by {brand} at {site_name}. {description}"
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Keywords Template</Form.Label>
              <Form.Control
                type="text"
                name="keywords_template"
                defaultValue={
                  t.keywords_template ||
                  "{product_name}, {brand}, perfume, luxury fragrance"
                }
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Max Title Length</Form.Label>
                  <Form.Control
                    type="number"
                    name="max_title_length"
                    defaultValue={t.max_title_length || 60}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Max Description Length</Form.Label>
                  <Form.Control
                    type="number"
                    name="max_description_length"
                    defaultValue={t.max_description_length || 160}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Button type="submit" variant="danger" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Templates"}
            </Button>
          </Card.Body>
        </Card>
      </Form>
    );
  };

  const renderAudit = () => {
    const results = audit?.results || {};
    return (
      <div>
        <Card className="seo-card mb-4">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="section-title mb-0">🔍 SEO Audit</h5>
              <Button
                variant="danger"
                onClick={handleRunAudit}
                disabled={isLoading}
              >
                {isLoading ? "Running..." : "Run Audit"}
              </Button>
            </div>
            {audit?.last_run && (
              <p className="text-muted small mt-2">
                Last run: {new Date(audit.last_run).toLocaleString()}
              </p>
            )}
          </Card.Body>
        </Card>

        {results.score !== undefined && (
          <Row className="g-4">
            <Col md={4}>
              <Card className="seo-card">
                <Card.Body>
                  <h2
                    className="text-center mb-0"
                    style={{
                      color:
                        results.score >= 80
                          ? "#10B981"
                          : results.score >= 50
                            ? "#F59E0B"
                            : "#EF4444",
                    }}
                  >
                    {results.score}%
                  </h2>
                  <p className="text-center text-muted">SEO Score</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={8}>
              <Card className="seo-card">
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <p>
                        <strong>✅ Pages with meta:</strong>{" "}
                        {results.pages_with_meta || 0}
                      </p>
                      <p>
                        <strong>⚠️ Pages without meta:</strong>{" "}
                        {results.pages_without_meta || 0}
                      </p>
                    </Col>
                    <Col md={6}>
                      <p>
                        <strong>✅ Images with alt:</strong>{" "}
                        {results.images_with_alt || 0}
                      </p>
                      <p>
                        <strong>⚠️ Images without alt:</strong>{" "}
                        {results.images_without_alt || 0}
                      </p>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {results.issues?.length > 0 && (
          <Card className="seo-card mt-4">
            <Card.Body>
              <h6 className="section-title">
                🚨 Issues Found ({results.issues.length})
              </h6>
              {results.issues.map((issue, index) => (
                <div key={index} className="audit-issue">
                  <Badge
                    bg={
                      issue.severity === "high"
                        ? "danger"
                        : issue.severity === "medium"
                          ? "warning"
                          : "info"
                    }
                  >
                    {issue.severity}
                  </Badge>
                  <span className="ms-2">{issue.message}</span>
                  <small className="text-muted ms-2">({issue.page})</small>
                </div>
              ))}
            </Card.Body>
          </Card>
        )}
      </div>
    );
  };

  // Render loading state
  if (isLoading && !settings) {
    return (
      <div className="admin-loading">
        <div className="spinner" />
        <p>Loading SEO settings...</p>
      </div>
    );
  }

  return (
    <div className="seo-management">
      <div className="management-header">
        <div>
          <h1>SEO Management</h1>
          <p>Manage all SEO settings for your website</p>
        </div>
        <Button
          variant="outline-danger"
          onClick={handleReset}
          className="btn-reset"
        >
          Reset to Defaults
        </Button>
      </div>

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="seo-tabs mb-4"
        variant="tabs"
      >
        <Tab eventKey="global" title="🌐 Global">
          {renderGlobalSettings()}
        </Tab>
        <Tab eventKey="pages" title="📄 Pages">
          {renderPageSettings()}
        </Tab>
        <Tab eventKey="products" title="🏷️ Products">
          {renderProductTemplates()}
        </Tab>
        <Tab eventKey="audit" title="🔍 Audit">
          {renderAudit()}
        </Tab>
      </Tabs>
    </div>
  );
};

export default SEOManagement;
