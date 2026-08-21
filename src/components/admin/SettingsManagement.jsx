import React, { useState } from "react";
import { Card, Nav, Tab } from "react-bootstrap";
import CategorySettingsManagement from "./CategorySettingsManagement";
import CollectionSettingsManagement from "./CollectionSettingsManagement";
import ShopSettingsManagement from "./ShopSettingsManagement";
import AboutSettingsManagement from "./AboutSettingsManagement";
import "../../styles/components/SettingsManagement.css";

const SettingsManagement = () => {
  const [activeTab, setActiveTab] = useState("category");

  return (
    <div className="settings-management">
      <Card className="settings-main-card">
        <Card.Header className="settings-main-header">
          <h4>⚙️ Settings</h4>
          <p className="text-muted mb-0">
            Manage all your website settings in one place
          </p>
        </Card.Header>
        <Card.Body>
          <Tab.Container
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
          >
            <Nav variant="tabs" className="settings-nav">
              <Nav.Item>
                <Nav.Link eventKey="category" className="settings-nav-link">
                  📂 Category
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="collection" className="settings-nav-link">
                  📄 Collection
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="shop" className="settings-nav-link">
                  🛍️ Shop
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="about" className="settings-nav-link">
                  ℹ️ About
                </Nav.Link>
              </Nav.Item>
            </Nav>

            <Tab.Content className="settings-tab-content">
              <Tab.Pane eventKey="category">
                <CategorySettingsManagement />
              </Tab.Pane>
              <Tab.Pane eventKey="collection">
                <CollectionSettingsManagement />
              </Tab.Pane>
              <Tab.Pane eventKey="shop">
                <ShopSettingsManagement />
              </Tab.Pane>
              <Tab.Pane eventKey="about">
                <AboutSettingsManagement />
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        </Card.Body>
      </Card>
    </div>
  );
};

export default SettingsManagement;
