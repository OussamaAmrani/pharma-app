// src/components/Layout/PharmacyLayout.jsx
import React, { useState } from "react";
import { Layout, Menu, Button } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  MedicineBoxOutlined,
  ShoppingCartOutlined,
  TagsOutlined,  // 👈 IMPORT MANQUANT AJOUTÉ
} from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";

const { Header, Sider, Content } = Layout;

const PharmacyLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  console.log("📍 PharmacyLayout rendu", { path: location.pathname });

  const menuItems = [
    {
      key: "/",
      icon: <DashboardOutlined />,
      label: <Link to="/">Dashboard</Link>,
    },
    {
      key: "/categories",
      icon: <TagsOutlined />,  // 👈 MAINTENANT L'ICÔNE EST IMPORTÉE
      label: <Link to="/categories">Catégories</Link>,
    },
    {
      key: "/medicaments",
      icon: <MedicineBoxOutlined />,
      label: <Link to="/medicaments">Médicaments</Link>,
    },
    {
      key: "/ventes",
      icon: <ShoppingCartOutlined />,
      label: <Link to="/ventes">Ventes</Link>,
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div style={{ height: 32, margin: 16, background: "rgba(255,255,255,0.2)" }} />
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
        />
      </Sider>
      
      <Layout>
        <Header style={{ padding: 0, background: "#fff" }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: 16, width: 64, height: 64 }}
          />
        </Header>
        
        <Content style={{ margin: "24px 16px", padding: 24, background: "#fff", minHeight: 280 }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default PharmacyLayout;