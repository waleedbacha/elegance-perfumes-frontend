import React, { useState, useEffect } from "react";
import { Card, Form, Button, Row, Col, Alert, Spinner } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllSettings,
  setSetting,
  uploadSettingImage,
  initCollectionSettings,
  getPublicSettings,
  clearSuccess,
  clearError,
} from "../../redux/slices/settingSlice";
import toast from "react-hot-toast";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import "../../styles/components/CollectionSettingsManagement.css";

const CollectionSettingsManagement = () => {
  const dispatch = useDispatch();
  const { settings, isLoading, success, error } = useSelector(
    (state) => state.settings,
  );
  const [formData, setFormData] = useState({
    collection_page_title: "All Collections",
    collection_page_subtitle: "Discover the perfect fragrance for every moment",
    collection_hero_image: null,
    collection_section_enabled: true,
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
      await dispatch(getPublicSettings("collection"));
    } catch (err) {
      console.log("No settings found, showing init button");
    }
  };

  useEffect(() => {
    if (settings && Object.keys(settings).length > 0) {
      const hasCollectionSettings = Object.keys(settings).some(
        (key) => key.startsWith("collection_") && settings[key] !== undefined,
      );
      setHasSettings(hasCollectionSettings);

      if (hasCollectionSettings) {
        // Get image URL
        let heroImage = null;
        if (settings.collection_hero_image) {
          if (typeof settings.collection_hero_image === "object") {
            heroImage = settings.collection_hero_image.url || null;
          } else {
            heroImage = settings.collection_hero_image;
          }
        }

        setFormData({
          collection_page_title:
            settings.collection_page_title || "All Collections",
          collection_page_subtitle:
            settings.collection_page_subtitle ||
            "Discover the perfect fragrance for every moment",
          collection_hero_image: heroImage,
          collection_section_enabled:
            settings.collection_section_enabled !== undefined
              ? settings.collection_section_enabled
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
        uploadSettingImage({ key: "collection_hero_image", file }),
      ).unwrap();

      const imageUrl = result.value?.url || result.value;
      setFormData((prev) => ({
        ...prev,
        collection_hero_image: imageUrl,
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
      // ✅ Set value to an empty string instead of null
      const result = await dispatch(
        setSetting({
          key: "collection_hero_image",
          value: "", // Use empty string instead of null
          type: "image",
          group: "collection",
          description: "Hero background image for collections page",
          isPublic: true,
        }),
      ).unwrap();

      setFormData((prev) => ({
        ...prev,
        collection_hero_image: "",
      }));
      setImagePreview(null);
      toast.success("Hero image removed!");
      await loadSettings();
    } catch (err) {
      console.error("❌ Remove image error:", err);
      toast.error(typeof err === "string" ? err : "Failed to remove image");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const settingsToSave = [
        {
          key: "collection_page_title",
          value: formData.collection_page_title,
          type: "string",
          group: "collection",
          description: "Main title for collections page",
          isPublic: true,
        },
        {
          key: "collection_page_subtitle",
          value: formData.collection_page_subtitle,
          type: "string",
          group: "collection",
          description: "Subtitle for collections page",
          isPublic: true,
        },
        {
          key: "collection_section_enabled",
          value: formData.collection_section_enabled,
          type: "boolean",
          group: "collection",
          description: "Enable/disable collections page",
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
        toast.success("Collection settings saved successfully!");

        // ✅ CRITICAL: Refresh admin settings
        await loadSettings();

        // ✅ CRITICAL: Refresh public settings for CollectionsPage
        await dispatch(getPublicSettings("collection"));

        // ✅ Force a state update by dispatching again after a small delay
        setTimeout(async () => {
          await dispatch(getPublicSettings("collection"));
          console.log("🔄 Collection settings refreshed again");
        }, 100);

        // ✅ Store timestamp in localStorage to trigger refresh
        localStorage.setItem(
          "collectionSettingsUpdated",
          Date.now().toString(),
        );
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
    if (
      window.confirm("This will create default collection settings. Continue?")
    ) {
      try {
        await dispatch(initCollectionSettings()).unwrap();
        toast.success("Collection settings initialized!");
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
      if (settings.collection_hero_image) {
        heroImage =
          typeof settings.collection_hero_image === "object"
            ? settings.collection_hero_image.url
            : settings.collection_hero_image;
      }

      setFormData({
        collection_page_title:
          settings.collection_page_title || "All Collections",
        collection_page_subtitle:
          settings.collection_page_subtitle ||
          "Discover the perfect fragrance for every moment",
        collection_hero_image: heroImage,
        collection_section_enabled:
          settings.collection_section_enabled !== undefined
            ? settings.collection_section_enabled
            : true,
      });
      setImagePreview(heroImage);
      toast.success("Form reset to saved values");
    }
  };

  if (isLoading && !hasSettings) {
    return (
      <div className="collection-settings-loading">
        <Spinner animation="border" variant="danger" />
        <p>Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="collection-settings-management">
      <Card className="settings-card">
        <Card.Header className="settings-header">
          <h4>Collection Page Settings</h4>
          <p className="text-muted mb-0">
            Manage the text and images displayed on the collections page
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
              <h5>No collection settings found</h5>
              <p className="text-muted">
                Click the button below to create default collection settings
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
                      <img src={imagePreview} alt="Hero background" />
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
                        id="heroImage"
                        disabled={uploadingImage}
                      />
                      <label
                        htmlFor="heroImage"
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
                              Recommended: 1200x400px (JPG, PNG, WebP)
                            </small>
                          </>
                        )}
                      </label>
                    </div>
                  )}
                </div>
                <Form.Text className="text-muted">
                  This image appears as the background of the collections page
                  header
                </Form.Text>
              </Form.Group>

              {/* Page Title */}
              <Form.Group className="mb-3">
                <Form.Label>Page Title</Form.Label>
                <Form.Control
                  type="text"
                  name="collection_page_title"
                  value={formData.collection_page_title}
                  onChange={handleChange}
                  placeholder="e.g., All Collections"
                />
                <Form.Text className="text-muted">
                  Main heading displayed at the top of the collections page
                </Form.Text>
              </Form.Group>

              {/* Page Subtitle */}
              <Form.Group className="mb-3">
                <Form.Label>Page Subtitle</Form.Label>
                <Form.Control
                  type="text"
                  name="collection_page_subtitle"
                  value={formData.collection_page_subtitle}
                  onChange={handleChange}
                  placeholder="e.g., Discover the perfect fragrance for every moment"
                />
                <Form.Text className="text-muted">
                  Subtitle displayed below the main heading
                </Form.Text>
              </Form.Group>

              {/* Enable/Disable */}
              <Form.Group className="mb-4">
                <Form.Check
                  type="switch"
                  name="collection_section_enabled"
                  checked={formData.collection_section_enabled}
                  onChange={handleChange}
                  label="Enable Collections Page"
                  id="collection-page-enabled"
                />
                <Form.Text className="text-muted">
                  Toggle to show/hide the collections page
                </Form.Text>
              </Form.Group>

              {/* Actions */}
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

              {/* Live Preview */}
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
                        {formData.collection_page_title || "All Collections"}
                        <span className="highlight">Fragrances</span>
                      </h2>
                      <p className="preview-subtitle">
                        {formData.collection_page_subtitle ||
                          "Discover the perfect fragrance for every moment"}
                      </p>
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

export default CollectionSettingsManagement;
