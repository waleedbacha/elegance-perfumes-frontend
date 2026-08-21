import React, { useState, useEffect } from "react";
import { Card, Form, Button, Row, Col, Alert, Spinner } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllSettings,
  setSetting,
  uploadSettingImage,
  initShopSettings,
  getPublicSettings,
  clearSuccess,
  clearError,
} from "../../redux/slices/settingSlice";
import toast from "react-hot-toast";
import { Upload, X } from "lucide-react";
import "../../styles/components/ShopSettingsManagement.css";

const ShopSettingsManagement = () => {
  const dispatch = useDispatch();
  const { settings, isLoading, success, error } = useSelector(
    (state) => state.settings,
  );
  const [formData, setFormData] = useState({
    shop_page_title: "Shop Fragrances",
    shop_page_subtitle: "Discover your perfect scent",
    shop_search_placeholder: "Search for perfumes...",
    shop_hero_image: null,
    shop_page_enabled: true,
  });
  const [saving, setSaving] = useState(false);
  const [hasSettings, setHasSettings] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    loadSettings();
  }, [dispatch]);

  const loadSettings = async () => {
    try {
      await dispatch(getAllSettings()).unwrap();
      await dispatch(getPublicSettings("shop"));
    } catch (err) {
      console.log("No settings found, showing init button");
    }
  };

  useEffect(() => {
    if (settings && Object.keys(settings).length > 0) {
      const hasShopSettings = Object.keys(settings).some(
        (key) => key.startsWith("shop_") && settings[key] !== undefined,
      );
      setHasSettings(hasShopSettings);

      if (hasShopSettings) {
        // Get image URL
        let heroImage = null;
        if (settings.shop_hero_image) {
          if (typeof settings.shop_hero_image === "object") {
            heroImage = settings.shop_hero_image.url || null;
          } else {
            heroImage = settings.shop_hero_image;
          }
        }

        setFormData({
          shop_page_title: settings.shop_page_title || "Shop Fragrances",
          shop_page_subtitle:
            settings.shop_page_subtitle || "Discover your perfect scent",
          shop_search_placeholder:
            settings.shop_search_placeholder || "Search for perfumes...",
          shop_hero_image: heroImage,
          shop_page_enabled:
            settings.shop_page_enabled !== undefined
              ? settings.shop_page_enabled
              : true,
        });

        if (heroImage) {
          setImagePreview(heroImage);
        }
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

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a valid image (JPG, PNG, or WebP)");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setUploadingImage(true);

    try {
      const result = await dispatch(
        uploadSettingImage({ key: "shop_hero_image", file }),
      ).unwrap();

      const imageUrl = result.value?.url || result.value;
      setFormData((prev) => ({
        ...prev,
        shop_hero_image: imageUrl,
      }));
      setImagePreview(imageUrl);
      toast.success("Hero image uploaded successfully!");

      // Refresh settings
      await loadSettings();
    } catch (err) {
      toast.error(err || "Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = async () => {
    if (!window.confirm("Remove the hero image?")) return;

    try {
      await dispatch(
        setSetting({
          key: "shop_hero_image",
          value: null,
          type: "image",
          group: "shop",
          description: "Hero background image for shop page",
          isPublic: true,
        }),
      ).unwrap();

      setFormData((prev) => ({
        ...prev,
        shop_hero_image: null,
      }));
      setImagePreview(null);
      toast.success("Hero image removed!");
      await loadSettings();
    } catch (err) {
      toast.error(err || "Failed to remove image");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const settingsToSave = [
        {
          key: "shop_page_title",
          value: formData.shop_page_title || "Shop Fragrances",
          type: "string",
          group: "shop",
          description: "Main title for shop page",
          isPublic: true,
        },
        {
          key: "shop_page_subtitle",
          value: formData.shop_page_subtitle || "Discover your perfect scent",
          type: "string",
          group: "shop",
          description: "Subtitle for shop page",
          isPublic: true,
        },
        {
          key: "shop_search_placeholder",
          value: formData.shop_search_placeholder || "Search for perfumes...",
          type: "string",
          group: "shop",
          description: "Search input placeholder text",
          isPublic: true,
        },
        {
          key: "shop_page_enabled",
          value: formData.shop_page_enabled,
          type: "boolean",
          group: "shop",
          description: "Enable/disable shop page",
          isPublic: true,
        },
      ];

      let hasError = false;
      let errorMessages = [];

      for (const setting of settingsToSave) {
        try {
          await dispatch(setSetting(setting)).unwrap();
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
        toast.success("Shop settings saved successfully!");
        await loadSettings();
        await dispatch(getPublicSettings("shop"));

        setTimeout(async () => {
          await dispatch(getPublicSettings("shop"));
          console.log("🔄 Shop settings refreshed again");
        }, 100);

        localStorage.setItem("shopSettingsUpdated", Date.now().toString());
      } else {
        toast.error(`Failed to save: ${errorMessages.join(", ")}`);
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error(error?.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleInit = async () => {
    if (window.confirm("This will create default shop settings. Continue?")) {
      try {
        await dispatch(initShopSettings()).unwrap();
        toast.success("Shop settings initialized!");
        await loadSettings();
        setHasSettings(true);
      } catch (error) {
        toast.error(error?.message || "Failed to initialize settings");
      }
    }
  };

  const handleReset = () => {
    if (window.confirm("Reset all fields to saved values?")) {
      let heroImage = null;
      if (settings.shop_hero_image) {
        heroImage =
          typeof settings.shop_hero_image === "object"
            ? settings.shop_hero_image.url
            : settings.shop_hero_image;
      }

      setFormData({
        shop_page_title: settings.shop_page_title || "Shop Fragrances",
        shop_page_subtitle:
          settings.shop_page_subtitle || "Discover your perfect scent",
        shop_search_placeholder:
          settings.shop_search_placeholder || "Search for perfumes...",
        shop_hero_image: heroImage,
        shop_page_enabled:
          settings.shop_page_enabled !== undefined
            ? settings.shop_page_enabled
            : true,
      });
      setImagePreview(heroImage);
      toast.success("Form reset to saved values");
    }
  };

  if (isLoading && !hasSettings) {
    return (
      <div className="shop-settings-loading">
        <Spinner animation="border" variant="danger" />
        <p>Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="shop-settings-management">
      <Card className="settings-card">
        <Card.Header className="settings-header">
          <h4>Shop Page Settings</h4>
          <p className="text-muted mb-0">
            Manage the text and images displayed on the shop page
          </p>
        </Card.Header>
        <Card.Body>
          {error && (
            <Alert
              variant="danger"
              onClose={() => dispatch(clearError())}
              dismissible
            >
              {typeof error === "string" ? error : "An error occurred"}
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
              <h5>No shop settings found</h5>
              <p className="text-muted">
                Click the button below to create default shop settings
              </p>
              <Button variant="danger" onClick={handleInit}>
                Initialize Settings
              </Button>
            </div>
          ) : (
            <Form>
              {/* Hero Image Upload */}
              <Form.Group className="mb-4">
                <Form.Label>Hero Background Image</Form.Label>
                <div className="hero-image-upload">
                  {imagePreview ? (
                    <div className="hero-image-preview">
                      <img src={imagePreview} alt="Shop hero background" />
                      <button
                        type="button"
                        className="hero-image-remove"
                        onClick={handleRemoveImage}
                        disabled={uploadingImage}
                      >
                        <X size={20} />
                      </button>
                      <span className="hero-image-label">
                        Current Hero Image
                      </span>
                    </div>
                  ) : (
                    <div className="hero-image-upload-area">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hero-image-input"
                        id="shopHeroImage"
                        disabled={uploadingImage}
                      />
                      <label
                        htmlFor="shopHeroImage"
                        className="hero-image-label-btn"
                      >
                        {uploadingImage ? (
                          <>
                            <Spinner
                              animation="border"
                              size="sm"
                              className="me-2"
                            />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload size={24} />
                            <span>Upload Hero Image</span>
                            <small>
                              Recommended: 1920x400px (JPG, PNG, WebP)
                            </small>
                          </>
                        )}
                      </label>
                    </div>
                  )}
                </div>
                <Form.Text className="text-muted">
                  This image appears as the background of the shop page header
                </Form.Text>
              </Form.Group>

              <Row>
                <Col lg={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Page Title</Form.Label>
                    <Form.Control
                      type="text"
                      name="shop_page_title"
                      value={formData.shop_page_title}
                      onChange={handleChange}
                      placeholder="e.g., Shop Fragrances"
                    />
                    <Form.Text className="text-muted">
                      Main heading displayed at the top of the shop page
                    </Form.Text>
                  </Form.Group>
                </Col>

                <Col lg={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Page Subtitle</Form.Label>
                    <Form.Control
                      type="text"
                      name="shop_page_subtitle"
                      value={formData.shop_page_subtitle}
                      onChange={handleChange}
                      placeholder="e.g., Discover your perfect scent"
                    />
                    <Form.Text className="text-muted">
                      Subtitle displayed below the main heading
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col lg={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Search Placeholder</Form.Label>
                    <Form.Control
                      type="text"
                      name="shop_search_placeholder"
                      value={formData.shop_search_placeholder}
                      onChange={handleChange}
                      placeholder="e.g., Search for perfumes..."
                    />
                    <Form.Text className="text-muted">
                      Placeholder text shown in the search input field
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-4">
                <Form.Check
                  type="switch"
                  name="shop_page_enabled"
                  checked={formData.shop_page_enabled}
                  onChange={handleChange}
                  label="Enable Shop Page"
                  id="shop-page-enabled"
                />
                <Form.Text className="text-muted">
                  Toggle to show/hide the shop page
                </Form.Text>
              </Form.Group>

              <div className="settings-actions">
                <Button
                  variant="danger"
                  onClick={handleSave}
                  disabled={saving || uploadingImage}
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
                  disabled={saving || uploadingImage}
                >
                  Reset
                </Button>
              </div>

              <div className="preview-section mt-4">
                <h6 className="preview-title">Live Preview</h6>
                <div className="preview-box">
                  <div
                    className="preview-hero"
                    style={{
                      backgroundImage: imagePreview
                        ? `url(${imagePreview})`
                        : "none",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    <div className="preview-hero-overlay">
                      <h2 className="preview-title-text">
                        {(() => {
                          const title =
                            formData.shop_page_title || "Shop Fragrances";
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
                        {formData.shop_page_subtitle ||
                          "Discover your perfect scent"}
                      </p>
                      <div className="preview-search">
                        <input
                          type="text"
                          className="preview-search-input"
                          placeholder={
                            formData.shop_search_placeholder ||
                            "Search for perfumes..."
                          }
                          disabled
                        />
                        <button className="preview-search-btn">Search</button>
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

export default ShopSettingsManagement;
