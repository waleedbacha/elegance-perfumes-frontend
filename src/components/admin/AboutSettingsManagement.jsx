import React, { useState, useEffect } from "react";
import { Card, Form, Button, Row, Col, Alert, Spinner } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllSettings,
  setSetting,
  initAboutSettings,
  getPublicSettings,
  clearSuccess,
  clearError,
} from "../../redux/slices/settingSlice";
import toast from "react-hot-toast";
import "../../styles/components/AboutSettingsManagement.css";

const AboutSettingsManagement = () => {
  const dispatch = useDispatch();
  const { settings, isLoading, success, error } = useSelector(
    (state) => state.settings,
  );
  const [formData, setFormData] = useState({
    // Hero
    about_hero_badge: "✦ About Elegance",
    about_hero_title: "Crafting Luxury Fragrances Since 2015",
    about_hero_subtitle: "We believe that luxury is an experience...",
    about_hero_btn_primary_text: "Explore Collection",
    about_hero_btn_primary_link: "/shop",
    about_hero_btn_secondary_text: "Our Story",
    about_hero_btn_secondary_link: "/collections",
    // Story
    about_story_tag: "Our Story",
    about_story_title: "The Art of Perfumery",
    about_story_text_1: "",
    about_story_text_2: "",
    about_story_features: [],
    // Values
    about_values_tag: "Our Values",
    about_values_title: "What Drives Us",
    about_values_subtitle: "Our core values guide everything we do...",
    about_values_items: [],
    // Testimonial
    about_testimonial_text: "",
    about_testimonial_author_name: "Zara Malik",
    about_testimonial_author_title:
      "Luxury Beauty Influencer • 500K+ Followers",
    about_testimonial_rating: 5,
    // Stats
    about_stats: [],
    // CTA
    about_cta_badge: "✦ Experience Luxury",
    about_cta_title: "Find Your Signature Scent",
    about_cta_subtitle: "Discover our curated collection...",
    about_cta_btn_primary_text: "Shop Now",
    about_cta_btn_primary_link: "/shop",
    about_cta_btn_secondary_text: "Explore Collections",
    about_cta_btn_secondary_link: "/collections",
    // Contact
    about_contact_info: [],
    // Enable
    about_page_enabled: true,
  });
  const [saving, setSaving] = useState(false);
  const [hasSettings, setHasSettings] = useState(false);
  const [activeTab, setActiveTab] = useState("hero");

  useEffect(() => {
    loadSettings();
  }, [dispatch]);

  const loadSettings = async () => {
    try {
      await dispatch(getAllSettings()).unwrap();
      await dispatch(getPublicSettings("about"));
    } catch (err) {
      console.log("No settings found, showing init button");
    }
  };

  useEffect(() => {
    if (settings && Object.keys(settings).length > 0) {
      const hasAboutSettings = Object.keys(settings).some(
        (key) => key.startsWith("about_") && settings[key] !== undefined,
      );
      setHasSettings(hasAboutSettings);

      if (hasAboutSettings) {
        setFormData({
          // Hero
          about_hero_badge: settings.about_hero_badge || "✦ About Elegance",
          about_hero_title:
            settings.about_hero_title ||
            "Crafting Luxury Fragrances Since 2015",
          about_hero_subtitle:
            settings.about_hero_subtitle ||
            "We believe that luxury is an experience, not just a product. Every fragrance we create is a masterpiece of artistry, quality, and passion.",
          about_hero_btn_primary_text:
            settings.about_hero_btn_primary_text || "Explore Collection",
          about_hero_btn_primary_link:
            settings.about_hero_btn_primary_link || "/shop",
          about_hero_btn_secondary_text:
            settings.about_hero_btn_secondary_text || "Our Story",
          about_hero_btn_secondary_link:
            settings.about_hero_btn_secondary_link || "/collections",
          // Story
          about_story_tag: settings.about_story_tag || "Our Story",
          about_story_title:
            settings.about_story_title || "The Art of Perfumery",
          about_story_text_1: settings.about_story_text_1 || "",
          about_story_text_2: settings.about_story_text_2 || "",
          about_story_features: settings.about_story_features || [],
          // Values
          about_values_tag: settings.about_values_tag || "Our Values",
          about_values_title: settings.about_values_title || "What Drives Us",
          about_values_subtitle:
            settings.about_values_subtitle ||
            "Our core values guide everything we do, from sourcing to serving you.",
          about_values_items: settings.about_values_items || [],
          // Testimonial
          about_testimonial_text: settings.about_testimonial_text || "",
          about_testimonial_author_name:
            settings.about_testimonial_author_name || "Zara Malik",
          about_testimonial_author_title:
            settings.about_testimonial_author_title ||
            "Luxury Beauty Influencer • 500K+ Followers",
          about_testimonial_rating: settings.about_testimonial_rating || 5,
          // Stats
          about_stats: settings.about_stats || [],
          // CTA
          about_cta_badge: settings.about_cta_badge || "✦ Experience Luxury",
          about_cta_title:
            settings.about_cta_title || "Find Your Signature Scent",
          about_cta_subtitle:
            settings.about_cta_subtitle ||
            "Discover our curated collection of luxury fragrances and find the scent that defines you.",
          about_cta_btn_primary_text:
            settings.about_cta_btn_primary_text || "Shop Now",
          about_cta_btn_primary_link:
            settings.about_cta_btn_primary_link || "/shop",
          about_cta_btn_secondary_text:
            settings.about_cta_btn_secondary_text || "Explore Collections",
          about_cta_btn_secondary_link:
            settings.about_cta_btn_secondary_link || "/collections",
          // Contact
          about_contact_info: settings.about_contact_info || [],
          // Enable
          about_page_enabled:
            settings.about_page_enabled !== undefined
              ? settings.about_page_enabled
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

  const handleArrayChange = (key, index, field, value) => {
    const updatedArray = [...(formData[key] || [])];
    if (field) {
      updatedArray[index] = { ...updatedArray[index], [field]: value };
    } else {
      updatedArray[index] = value;
    }
    setFormData((prev) => ({ ...prev, [key]: updatedArray }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const settingsToSave = Object.entries(formData).map(([key, value]) => {
        let type = "string";
        if (typeof value === "boolean") {
          type = "boolean";
        } else if (typeof value === "number") {
          type = "number";
        } else if (Array.isArray(value)) {
          type = "array";
        } else if (typeof value === "object" && value !== null) {
          type = "object";
        }

        return {
          key,
          value,
          type,
          group: "about",
          description: `About page ${key.replace("about_", "").replace(/_/g, " ")}`,
          isPublic: true,
        };
      });

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
        toast.success("About page settings saved successfully!");
        await loadSettings();
        await dispatch(getPublicSettings("about"));

        setTimeout(async () => {
          await dispatch(getPublicSettings("about"));
          console.log("🔄 About settings refreshed again");
        }, 100);

        localStorage.setItem("aboutSettingsUpdated", Date.now().toString());
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
      window.confirm("This will create default about page settings. Continue?")
    ) {
      try {
        await dispatch(initAboutSettings()).unwrap();
        toast.success("About page settings initialized!");
        await loadSettings();
        setHasSettings(true);
      } catch (error) {
        toast.error(error?.message || "Failed to initialize settings");
      }
    }
  };

  const handleReset = () => {
    if (window.confirm("Reset all fields to saved values?")) {
      // Reset logic
    }
  };

  if (isLoading && !hasSettings) {
    return (
      <div className="about-settings-loading">
        <Spinner animation="border" variant="danger" />
        <p>Loading settings...</p>
      </div>
    );
  }

  // ✅ Render tab content based on activeTab
  const renderTabContent = () => {
    switch (activeTab) {
      case "hero":
        return (
          <div className="settings-panel">
            <h5>Hero Section</h5>
            <Form.Group className="mb-3">
              <Form.Label>Badge Text</Form.Label>
              <Form.Control
                type="text"
                name="about_hero_badge"
                value={formData.about_hero_badge}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                name="about_hero_title"
                value={formData.about_hero_title}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Subtitle</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="about_hero_subtitle"
                value={formData.about_hero_subtitle}
                onChange={handleChange}
              />
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Primary Button Text</Form.Label>
                  <Form.Control
                    type="text"
                    name="about_hero_btn_primary_text"
                    value={formData.about_hero_btn_primary_text}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Primary Button Link</Form.Label>
                  <Form.Control
                    type="text"
                    name="about_hero_btn_primary_link"
                    value={formData.about_hero_btn_primary_link}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Secondary Button Text</Form.Label>
                  <Form.Control
                    type="text"
                    name="about_hero_btn_secondary_text"
                    value={formData.about_hero_btn_secondary_text}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Secondary Button Link</Form.Label>
                  <Form.Control
                    type="text"
                    name="about_hero_btn_secondary_link"
                    value={formData.about_hero_btn_secondary_link}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>
          </div>
        );

      case "story":
        return (
          <div className="settings-panel">
            <h5>Story Section</h5>
            <Form.Group className="mb-3">
              <Form.Label>Section Tag</Form.Label>
              <Form.Control
                type="text"
                name="about_story_tag"
                value={formData.about_story_tag}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                name="about_story_title"
                value={formData.about_story_title}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Paragraph 1</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="about_story_text_1"
                value={formData.about_story_text_1}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Paragraph 2</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="about_story_text_2"
                value={formData.about_story_text_2}
                onChange={handleChange}
              />
            </Form.Group>
          </div>
        );

      case "values":
        return (
          <div className="settings-panel">
            <h5>Values Section</h5>
            <Form.Group className="mb-3">
              <Form.Label>Section Tag</Form.Label>
              <Form.Control
                type="text"
                name="about_values_tag"
                value={formData.about_values_tag}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                name="about_values_title"
                value={formData.about_values_title}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Subtitle</Form.Label>
              <Form.Control
                type="text"
                name="about_values_subtitle"
                value={formData.about_values_subtitle}
                onChange={handleChange}
              />
            </Form.Group>
          </div>
        );

      case "testimonial":
        return (
          <div className="settings-panel">
            <h5>Testimonial Section</h5>
            <Form.Group className="mb-3">
              <Form.Label>Testimonial Text</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="about_testimonial_text"
                value={formData.about_testimonial_text}
                onChange={handleChange}
              />
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Author Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="about_testimonial_author_name"
                    value={formData.about_testimonial_author_name}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Author Title</Form.Label>
                  <Form.Control
                    type="text"
                    name="about_testimonial_author_title"
                    value={formData.about_testimonial_author_title}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>
          </div>
        );

      case "cta":
        return (
          <div className="settings-panel">
            <h5>CTA Section</h5>
            <Form.Group className="mb-3">
              <Form.Label>Badge Text</Form.Label>
              <Form.Control
                type="text"
                name="about_cta_badge"
                value={formData.about_cta_badge}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                name="about_cta_title"
                value={formData.about_cta_title}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Subtitle</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="about_cta_subtitle"
                value={formData.about_cta_subtitle}
                onChange={handleChange}
              />
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Primary Button Text</Form.Label>
                  <Form.Control
                    type="text"
                    name="about_cta_btn_primary_text"
                    value={formData.about_cta_btn_primary_text}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Primary Button Link</Form.Label>
                  <Form.Control
                    type="text"
                    name="about_cta_btn_primary_link"
                    value={formData.about_cta_btn_primary_link}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Secondary Button Text</Form.Label>
                  <Form.Control
                    type="text"
                    name="about_cta_btn_secondary_text"
                    value={formData.about_cta_btn_secondary_text}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Secondary Button Link</Form.Label>
                  <Form.Control
                    type="text"
                    name="about_cta_btn_secondary_link"
                    value={formData.about_cta_btn_secondary_link}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>
          </div>
        );

      // Add to the switch case in renderTabContent
      case "contact":
        return (
          <div className="settings-panel">
            <h5>Contact Information</h5>
            <p className="text-muted mb-3">
              Edit the contact information displayed on the about page.
            </p>

            {/* Contact Item 1 - Visit Us */}
            <div className="contact-item-edit">
              <h6>📍 Visit Us</h6>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-2">
                    <Form.Label>Address Line 1</Form.Label>
                    <Form.Control
                      type="text"
                      value={
                        formData.about_contact_info?.[0]?.details?.[0] ||
                        "Luxury Fragrance House"
                      }
                      onChange={(e) => {
                        const newContact = Array.isArray(
                          formData.about_contact_info,
                        )
                          ? [...formData.about_contact_info]
                          : [];

                        if (!newContact[0]) {
                          newContact[0] = {
                            icon: "MapPin",
                            title: "Visit Us",
                            details: ["", ""],
                          };
                        }

                        const details = [...(newContact[0].details || [])];
                        details[0] = e.target.value;
                        newContact[0] = { ...newContact[0], details };

                        setFormData((prev) => ({
                          ...prev,
                          about_contact_info: newContact,
                        }));
                      }}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-2">
                    <Form.Label>Address Line 2</Form.Label>
                    <Form.Control
                      type="text"
                      value={
                        formData.about_contact_info?.[0]?.details?.[1] ||
                        "Islamabad, Pakistan"
                      }
                      onChange={(e) => {
                        const newContact = Array.isArray(
                          formData.about_contact_info,
                        )
                          ? [...formData.about_contact_info]
                          : [];

                        if (!newContact[0]) {
                          newContact[0] = {
                            icon: "MapPin",
                            title: "Visit Us",
                            details: ["", ""],
                          };
                        }

                        const details = [...(newContact[0].details || [])];
                        details[1] = e.target.value;
                        newContact[0] = { ...newContact[0], details };

                        setFormData((prev) => ({
                          ...prev,
                          about_contact_info: newContact,
                        }));
                      }}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </div>

            <hr />

            {/* Contact Item 2 - Email Us */}
            <div className="contact-item-edit">
              <h6>📧 Email Us</h6>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-2">
                    <Form.Label>Email 1</Form.Label>
                    <Form.Control
                      type="text"
                      value={
                        formData.about_contact_info?.[1]?.details?.[0] ||
                        "elegance.myperfume@gmail.com"
                      }
                      onChange={(e) => {
                        const newContact = Array.isArray(
                          formData.about_contact_info,
                        )
                          ? [...formData.about_contact_info]
                          : [];

                        if (!newContact[1]) {
                          newContact[1] = {
                            icon: "Mail",
                            title: "Email Us",
                            details: ["", ""],
                          };
                        }

                        const details = [...(newContact[1].details || [])];
                        details[0] = e.target.value;
                        newContact[1] = { ...newContact[1], details };

                        setFormData((prev) => ({
                          ...prev,
                          about_contact_info: newContact,
                        }));
                      }}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-2">
                    <Form.Label>Email 2</Form.Label>
                    <Form.Control
                      type="text"
                      value={
                        formData.about_contact_info?.[1]?.details?.[1] ||
                        "info@elegance.pk"
                      }
                      onChange={(e) => {
                        const newContact = Array.isArray(
                          formData.about_contact_info,
                        )
                          ? [...formData.about_contact_info]
                          : [];

                        if (!newContact[1]) {
                          newContact[1] = {
                            icon: "Mail",
                            title: "Email Us",
                            details: ["", ""],
                          };
                        }

                        const details = [...(newContact[1].details || [])];
                        details[1] = e.target.value;
                        newContact[1] = { ...newContact[1], details };

                        setFormData((prev) => ({
                          ...prev,
                          about_contact_info: newContact,
                        }));
                      }}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </div>

            <hr />

            {/* Contact Item 3 - Call Us */}
            <div className="contact-item-edit">
              <h6>📞 Call Us</h6>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-2">
                    <Form.Label>Phone Number</Form.Label>
                    <Form.Control
                      type="text"
                      value={
                        formData.about_contact_info?.[2]?.details?.[0] ||
                        "+923199457143"
                      }
                      onChange={(e) => {
                        const newContact = Array.isArray(
                          formData.about_contact_info,
                        )
                          ? [...formData.about_contact_info]
                          : [];

                        if (!newContact[2]) {
                          newContact[2] = {
                            icon: "Phone",
                            title: "Call Us",
                            details: ["", ""],
                          };
                        }

                        const details = [...(newContact[2].details || [])];
                        details[0] = e.target.value;
                        newContact[2] = { ...newContact[2], details };

                        setFormData((prev) => ({
                          ...prev,
                          about_contact_info: newContact,
                        }));
                      }}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-2">
                    <Form.Label>Hours</Form.Label>
                    <Form.Control
                      type="text"
                      value={
                        formData.about_contact_info?.[2]?.details?.[1] ||
                        "Mon-Sat, 9AM - 9PM"
                      }
                      onChange={(e) => {
                        const newContact = Array.isArray(
                          formData.about_contact_info,
                        )
                          ? [...formData.about_contact_info]
                          : [];

                        if (!newContact[2]) {
                          newContact[2] = {
                            icon: "Phone",
                            title: "Call Us",
                            details: ["", ""],
                          };
                        }

                        const details = [...(newContact[2].details || [])];
                        details[1] = e.target.value;
                        newContact[2] = { ...newContact[2], details };

                        setFormData((prev) => ({
                          ...prev,
                          about_contact_info: newContact,
                        }));
                      }}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </div>
          </div>
        );
        return (
          <div className="settings-panel">
            <h5>Contact Information</h5>
            <p className="text-muted mb-3">
              Edit the contact information displayed on the about page.
            </p>

            {/* Contact Item 1 - Visit Us */}
            <div className="contact-item-edit">
              <h6>Visit Us</h6>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-2">
                    <Form.Label>Address Line 1</Form.Label>
                    <Form.Control
                      type="text"
                      value={
                        formData.about_contact_info?.[0]?.details?.[0] ||
                        "Luxury Fragrance House"
                      }
                      onChange={(e) => {
                        const newContact = [
                          ...(formData.about_contact_info || []),
                        ];
                        if (!newContact[0])
                          newContact[0] = {
                            icon: "MapPin",
                            title: "Visit Us",
                            details: [],
                          };
                        newContact[0].details[0] = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          about_contact_info: newContact,
                        }));
                      }}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-2">
                    <Form.Label>Address Line 2</Form.Label>
                    <Form.Control
                      type="text"
                      value={
                        formData.about_contact_info?.[0]?.details?.[1] ||
                        "Islamabad, Pakistan"
                      }
                      onChange={(e) => {
                        const newContact = [
                          ...(formData.about_contact_info || []),
                        ];
                        if (!newContact[0])
                          newContact[0] = {
                            icon: "MapPin",
                            title: "Visit Us",
                            details: [],
                          };
                        newContact[0].details[1] = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          about_contact_info: newContact,
                        }));
                      }}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </div>

            <hr />

            {/* Contact Item 2 - Email Us */}
            <div className="contact-item-edit">
              <h6>Email Us</h6>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-2">
                    <Form.Label>Email 1</Form.Label>
                    <Form.Control
                      type="text"
                      value={
                        formData.about_contact_info?.[1]?.details?.[0] ||
                        "elegance.myperfume@gmail.com"
                      }
                      onChange={(e) => {
                        const newContact = [
                          ...(formData.about_contact_info || []),
                        ];
                        if (!newContact[1])
                          newContact[1] = {
                            icon: "Mail",
                            title: "Email Us",
                            details: [],
                          };
                        newContact[1].details[0] = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          about_contact_info: newContact,
                        }));
                      }}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-2">
                    <Form.Label>Email 2</Form.Label>
                    <Form.Control
                      type="text"
                      value={
                        formData.about_contact_info?.[1]?.details?.[1] ||
                        "info@elegance.pk"
                      }
                      onChange={(e) => {
                        const newContact = [
                          ...(formData.about_contact_info || []),
                        ];
                        if (!newContact[1])
                          newContact[1] = {
                            icon: "Mail",
                            title: "Email Us",
                            details: [],
                          };
                        newContact[1].details[1] = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          about_contact_info: newContact,
                        }));
                      }}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </div>

            <hr />

            {/* Contact Item 3 - Call Us */}
            <div className="contact-item-edit">
              <h6>Call Us</h6>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-2">
                    <Form.Label>Phone Number</Form.Label>
                    <Form.Control
                      type="text"
                      value={
                        formData.about_contact_info?.[2]?.details?.[0] ||
                        "+923199457143"
                      }
                      onChange={(e) => {
                        const newContact = [
                          ...(formData.about_contact_info || []),
                        ];
                        if (!newContact[2])
                          newContact[2] = {
                            icon: "Phone",
                            title: "Call Us",
                            details: [],
                          };
                        newContact[2].details[0] = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          about_contact_info: newContact,
                        }));
                      }}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-2">
                    <Form.Label>Hours</Form.Label>
                    <Form.Control
                      type="text"
                      value={
                        formData.about_contact_info?.[2]?.details?.[1] ||
                        "Mon-Sat, 9AM - 9PM"
                      }
                      onChange={(e) => {
                        const newContact = [
                          ...(formData.about_contact_info || []),
                        ];
                        if (!newContact[2])
                          newContact[2] = {
                            icon: "Phone",
                            title: "Call Us",
                            details: [],
                          };
                        newContact[2].details[1] = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          about_contact_info: newContact,
                        }));
                      }}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </div>
          </div>
        );

      case "settings":
        return (
          <div className="settings-panel">
            <h5>Page Settings</h5>
            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                name="about_page_enabled"
                checked={formData.about_page_enabled}
                onChange={handleChange}
                label="Enable About Page"
              />
              <Form.Text className="text-muted">
                Toggle to show/hide the about page
              </Form.Text>
            </Form.Group>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="about-settings-management">
      <Card className="settings-card">
        <Card.Header className="settings-header">
          <h4>About Page Settings</h4>
          <p className="text-muted mb-0">
            Manage all text content displayed on the about page
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
              <h5>No about page settings found</h5>
              <p className="text-muted">
                Click the button below to create default about page settings
              </p>
              <Button variant="danger" onClick={handleInit}>
                Initialize Settings
              </Button>
            </div>
          ) : (
            <Form>
              {/* Tabs for sections */}
              <div className="settings-tabs">
                <button
                  type="button"
                  className={`tab-btn ${activeTab === "hero" ? "active" : ""}`}
                  onClick={() => setActiveTab("hero")}
                >
                  Hero
                </button>
                <button
                  type="button"
                  className={`tab-btn ${activeTab === "story" ? "active" : ""}`}
                  onClick={() => setActiveTab("story")}
                >
                  Story
                </button>
                <button
                  type="button"
                  className={`tab-btn ${activeTab === "values" ? "active" : ""}`}
                  onClick={() => setActiveTab("values")}
                >
                  Values
                </button>
                <button
                  type="button"
                  className={`tab-btn ${activeTab === "testimonial" ? "active" : ""}`}
                  onClick={() => setActiveTab("testimonial")}
                >
                  Testimonial
                </button>
                <button
                  type="button"
                  className={`tab-btn ${activeTab === "cta" ? "active" : ""}`}
                  onClick={() => setActiveTab("cta")}
                >
                  CTA
                </button>
                <button
                  type="button"
                  className={`tab-btn ${activeTab === "contact" ? "active" : ""}`}
                  onClick={() => setActiveTab("contact")}
                >
                  Contact
                </button>
                <button
                  type="button"
                  className={`tab-btn ${activeTab === "settings" ? "active" : ""}`}
                  onClick={() => setActiveTab("settings")}
                >
                  Settings
                </button>
              </div>

              {/* ✅ Render the active tab content */}
              <div className="settings-content">{renderTabContent()}</div>

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
            </Form>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default AboutSettingsManagement;
