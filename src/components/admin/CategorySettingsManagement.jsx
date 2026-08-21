import React, { useState, useEffect } from "react";
import { Card, Form, Button, Row, Col, Alert, Spinner } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllSettings,
  setSetting,
  initCategorySettings,
  getPublicSettings,
  clearSuccess,
  clearError,
} from "../../redux/slices/settingSlice";
import toast from "react-hot-toast";
import "../../styles/components/CategorySettingsManagement.css";

const CategorySettingsManagement = () => {
  const dispatch = useDispatch();
  const { settings, isLoading, success, error } = useSelector(
    (state) => state.settings,
  );
  const [formData, setFormData] = useState({
    category_section_title: "Explore Our Collections",
    category_section_subtitle:
      "Discover the perfect fragrance for every moment",
    category_badge_text: "Collection",
    category_shop_now_text: "Shop Now",
    category_section_enabled: true,
  });
  const [saving, setSaving] = useState(false);
  const [hasSettings, setHasSettings] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);

  useEffect(() => {
    loadSettings();
  }, [dispatch]);

  const loadSettings = async () => {
    try {
      await dispatch(getAllSettings()).unwrap();
      // Also fetch public settings to ensure they're in sync
      await dispatch(getPublicSettings("category"));
    } catch (err) {
      console.log("No settings found, showing init button");
    }
  };

  useEffect(() => {
    if (settings && Object.keys(settings).length > 0) {
      const hasCategorySettings = Object.keys(settings).some(
        (key) => key.startsWith("category_") && settings[key] !== undefined,
      );
      setHasSettings(hasCategorySettings);

      if (hasCategorySettings) {
        setFormData({
          category_section_title:
            settings.category_section_title || "Explore Our Collections",
          category_section_subtitle:
            settings.category_section_subtitle ||
            "Discover the perfect fragrance for every moment",
          category_badge_text: settings.category_badge_text || "Collection",
          category_shop_now_text: settings.category_shop_now_text || "Shop Now",
          category_section_enabled:
            settings.category_section_enabled !== undefined
              ? settings.category_section_enabled
              : true,
        });
      }
    }
  }, [settings]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const settingsToSave = Object.entries(formData).map(([key, value]) => ({
        key,
        value,
        type: typeof value === "boolean" ? "boolean" : "string",
        group: "category",
        description: `Category section ${key.replace("category_", "").replace(/_/g, " ")}`,
        isPublic: true,
      }));

      let hasError = false;
      let errorMessages = [];

      for (const setting of settingsToSave) {
        try {
          const result = await dispatch(setSetting(setting)).unwrap();
          console.log(`✅ Saved ${setting.key}:`, result);
        } catch (err) {
          console.error(`❌ Failed to save ${setting.key}:`, err);
          const errorMsg =
            typeof err === "string"
              ? err
              : err?.message || "Failed to save setting";
          errorMessages.push(`${setting.key}: ${errorMsg}`);
          hasError = true;
        }
      }

      if (!hasError) {
        toast.success("All category settings saved successfully!");

        // ✅ CRITICAL: Refresh admin settings
        await loadSettings();

        // ✅ CRITICAL: Refresh public settings for CategorySection
        await dispatch(getPublicSettings("category"));

        // ✅ Force a state update by dispatching again after a small delay
        setTimeout(async () => {
          await dispatch(getPublicSettings("category"));
          console.log("🔄 Settings refreshed again");
        }, 100);

        // ✅ Store timestamp in localStorage to trigger refresh
        localStorage.setItem("categorySettingsUpdated", Date.now().toString());
      } else {
        toast.error(`Failed to save: ${errorMessages.join(", ")}`);
      }
    } catch (error) {
      console.error("Save error:", error);
      const errorMsg =
        typeof error === "string"
          ? error
          : error?.message || "Failed to save settings";
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleInit = async () => {
    if (
      window.confirm("This will create default category settings. Continue?")
    ) {
      try {
        await dispatch(initCategorySettings()).unwrap();
        toast.success("Category settings initialized!");
        await loadSettings();
        setHasSettings(true);
      } catch (error) {
        const errorMsg =
          typeof error === "string"
            ? error
            : error?.message || "Failed to initialize settings";
        toast.error(errorMsg);
      }
    }
  };

  const handleReset = () => {
    if (
      window.confirm(
        "This will reset all fields to their current saved values. Continue?",
      )
    ) {
      setFormData({
        category_section_title:
          settings.category_section_title || "Explore Our Collections",
        category_section_subtitle:
          settings.category_section_subtitle ||
          "Discover the perfect fragrance for every moment",
        category_badge_text: settings.category_badge_text || "Collection",
        category_shop_now_text: settings.category_shop_now_text || "Shop Now",
        category_section_enabled:
          settings.category_section_enabled !== undefined
            ? settings.category_section_enabled
            : true,
      });
      toast.success("Form reset to saved values");
    }
  };

  // Convert error to string for display
  const getErrorMessage = (err) => {
    if (!err) return null;
    if (typeof err === "string") return err;
    if (err?.message) return err.message;
    if (err?.error?.message) return err.error.message;
    return "An error occurred";
  };

  const errorMessage = getErrorMessage(error);

  if (isLoading && !hasSettings) {
    return (
      <div className="category-settings-loading">
        <Spinner animation="border" variant="danger" />
        <p>Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="category-settings-management">
      <Card className="settings-card">
        <Card.Header className="settings-header">
          <h4>Category Section Settings</h4>
          <p className="text-muted mb-0">
            Manage the text content displayed in the category section
          </p>
        </Card.Header>
        <Card.Body>
          {errorMessage && (
            <Alert
              variant="danger"
              onClose={() => dispatch(clearError())}
              dismissible
            >
              {errorMessage}
            </Alert>
          )}
          {success && (
            <Alert
              variant="success"
              onClose={() => dispatch(clearSuccess())}
              dismissible
            >
              {success}
            </Alert>
          )}

          {!hasSettings ? (
            <div className="text-center py-4">
              <h5>No category settings found</h5>
              <p className="text-muted">
                Click the button below to create default category settings
              </p>
              <Button variant="danger" onClick={handleInit}>
                Initialize Settings
              </Button>
            </div>
          ) : (
            <Form>
              <Row>
                <Col lg={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Section Title</Form.Label>
                    <Form.Control
                      type="text"
                      name="category_section_title"
                      value={formData.category_section_title}
                      onChange={handleChange}
                      placeholder="e.g., Explore Our Collections"
                    />
                    <Form.Text className="text-muted">
                      Main heading displayed above the category cards. The last
                      word will be highlighted in red.
                    </Form.Text>
                  </Form.Group>
                </Col>

                <Col lg={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Section Subtitle</Form.Label>
                    <Form.Control
                      type="text"
                      name="category_section_subtitle"
                      value={formData.category_section_subtitle}
                      onChange={handleChange}
                      placeholder="e.g., Discover the perfect fragrance for every moment"
                    />
                    <Form.Text className="text-muted">
                      Subtitle displayed below the main heading
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col lg={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Badge Text</Form.Label>
                    <Form.Control
                      type="text"
                      name="category_badge_text"
                      value={formData.category_badge_text}
                      onChange={handleChange}
                      placeholder="e.g., Collection"
                    />
                    <Form.Text className="text-muted">
                      Text shown on the badge overlay of each category card
                    </Form.Text>
                  </Form.Group>
                </Col>

                <Col lg={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Shop Now Button Text</Form.Label>
                    <Form.Control
                      type="text"
                      name="category_shop_now_text"
                      value={formData.category_shop_now_text}
                      onChange={handleChange}
                      placeholder="e.g., Shop Now"
                    />
                    <Form.Text className="text-muted">
                      Text for the call-to-action button on category cards
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-4">
                <Form.Check
                  type="switch"
                  name="category_section_enabled"
                  checked={formData.category_section_enabled}
                  onChange={handleChange}
                  label="Enable Category Section"
                  id="category-section-enabled"
                />
                <Form.Text className="text-muted">
                  Toggle to show/hide the category section on the homepage
                </Form.Text>
              </Form.Group>

              <div className="settings-actions">
                <Button
                  variant="danger"
                  onClick={handleSave}
                  disabled={saving}
                  className="save-btn"
                >
                  {saving ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        className="me-2"
                      />
                      Saving...
                    </>
                  ) : (
                    "Save Settings"
                  )}
                </Button>
                <Button
                  variant="outline-secondary"
                  onClick={handleReset}
                  disabled={saving}
                >
                  Reset
                </Button>
              </div>

              <div className="preview-section mt-4">
                <h6 className="preview-title">Live Preview</h6>
                <div className="preview-box">
                  <div className="preview-header">
                    {/* ✅ FIX: Only render the title once with proper highlighting */}
                    <h2 className="preview-title-text">
                      {(() => {
                        const title =
                          formData.category_section_title ||
                          "Explore Our Collections";
                        const words = title.split(" ");
                        if (words.length <= 1) {
                          return title;
                        }
                        const lastWord = words.pop();
                        return (
                          <>
                            {words.join(" ")}{" "}
                            <span className="highlight">{lastWord}</span>
                          </>
                        );
                      })()}
                    </h2>
                    <p className="preview-subtitle">
                      {formData.category_section_subtitle ||
                        "Discover the perfect fragrance for every moment"}
                    </p>
                  </div>
                  <div className="preview-cards">
                    <div className="preview-card">
                      <div className="preview-card-overlay">
                        <span className="preview-badge">
                          {formData.category_badge_text || "Collection"}
                        </span>
                        <h4 className="preview-card-name">MEN</h4>
                        <p className="preview-card-desc">
                          Bold. Strong. Confident.
                        </p>
                        <span className="preview-shop-btn">
                          {formData.category_shop_now_text || "Shop Now"}
                        </span>
                      </div>
                    </div>
                    <div className="preview-card preview-card-women">
                      <div className="preview-card-overlay">
                        <span className="preview-badge">
                          {formData.category_badge_text || "Collection"}
                        </span>
                        <h4 className="preview-card-name">WOMEN</h4>
                        <p className="preview-card-desc">
                          Elegant. Timeless. Charming.
                        </p>
                        <span className="preview-shop-btn">
                          {formData.category_shop_now_text || "Shop Now"}
                        </span>
                      </div>
                    </div>
                    <div className="preview-card preview-card-unisex">
                      <div className="preview-card-overlay">
                        <span className="preview-badge">
                          {formData.category_badge_text || "Collection"}
                        </span>
                        <h4 className="preview-card-name">UNISEX</h4>
                        <p className="preview-card-desc">
                          Unique. Modern. Memorable.
                        </p>
                        <span className="preview-shop-btn">
                          {formData.category_shop_now_text || "Shop Now"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Form>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default CategorySettingsManagement;
