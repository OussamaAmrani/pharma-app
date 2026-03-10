// src/pages/CategoriesPage.jsx
import React, { useEffect, useState } from "react";
import {
  Table, Button, Modal, Form, Input, Space, Card, Popconfirm, message,
  Typography, Tag, Tooltip, Row, Col, Statistic, Badge, Alert
} from "antd";
import {
  PlusOutlined, EditOutlined, DeleteOutlined, TagsOutlined,
  EyeOutlined, ReloadOutlined, InfoCircleOutlined,
  CheckCircleOutlined, StopOutlined
} from "@ant-design/icons";
import api from "../api/axiosConfig";
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedCategorie, setSelectedCategorie] = useState(null);
  const [editingCategorie, setEditingCategorie] = useState(null);
  const [stats, setStats] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchCategories();
    fetchStats();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await api.get('/categories/');
      setCategories(response.data);
    } catch (error) {
      message.error("Erreur chargement catégories");
    }
    setLoading(false);
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/categories/stats/');
      setStats(response.data);
    } catch (error) {
      console.error("Erreur chargement stats:", error);
    }
  };

  const handleSave = async (values) => {
    try {
      if (editingCategorie) {
        await api.put(`/categories/${editingCategorie.id}/`, values);
        message.success("Catégorie modifiée avec succès");
      } else {
        await api.post('/categories/', values);
        message.success("Catégorie créée avec succès");
      }
      
      setModalVisible(false);
      form.resetFields();
      setEditingCategorie(null);
      fetchCategories();
      fetchStats();
    } catch (error) {
      const errorMsg = error.response?.data?.nom?.[0] || "Erreur lors de la sauvegarde";
      message.error(errorMsg);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/categories/${id}/`);
      message.success("Catégorie supprimée");
      fetchCategories();
      fetchStats();
    } catch (error) {
      message.error("Impossible de supprimer - catégorie utilisée");
    }
  };

  const handleToggleActif = async (id, actif) => {
    try {
      await api.patch(`/categories/${id}/`, { est_actif: actif });
      message.success(`Catégorie ${actif ? 'activée' : 'désactivée'}`);
      fetchCategories();
      fetchStats();
    } catch (error) {
      message.error("Erreur lors du changement de statut");
    }
  };

  const handleViewDetails = async (categorie) => {
    try {
      const response = await api.get(`/categories/${categorie.id}/medicaments/`);
      setSelectedCategorie({
        ...categorie,
        medicaments: response.data
      });
      setDetailModalVisible(true);
    } catch (error) {
      message.error("Erreur chargement détails");
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "Nom",
      dataIndex: "nom",
      key: "nom",
      render: (text, record) => (
        <Space>
          <TagsOutlined style={{ color: '#1890ff' }} />
          <Text strong>{text}</Text>
          {!record.est_actif && (
            <Tag color="red">Inactif</Tag>
          )}
        </Space>
      ),
      sorter: (a, b) => a.nom.localeCompare(b.nom),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (text) => text || <Text type="secondary">-</Text>,
      ellipsis: true,
    },
    {
      title: "Médicaments",
      dataIndex: "medicaments_count",
      key: "medicaments_count",
      render: (count) => (
        <Badge 
          count={count} 
          showZero
          style={{ backgroundColor: count > 0 ? '#52c41a' : '#d9d9d9' }}
        />
      ),
      sorter: (a, b) => a.medicaments_count - b.medicaments_count,
    },
    {
      title: "Date création",
      dataIndex: "date_creation",
      key: "date_creation",
      render: (date) => dayjs(date).format('DD/MM/YYYY'),
      sorter: (a, b) => dayjs(a.date_creation).unix() - dayjs(b.date_creation).unix(),
    },
    {
      title: "Actions",
      key: "actions",
      width: 200,
      render: (_, record) => (
        <Space>
          <Tooltip title="Voir médicaments">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(record)}
            />
          </Tooltip>
          <Tooltip title="Modifier">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => {
                setEditingCategorie(record);
                form.setFieldsValue(record);
                setModalVisible(true);
              }}
            />
          </Tooltip>
          {record.medicaments_count === 0 && (
            <Popconfirm
              title="Supprimer cette catégorie ?"
              description="Cette action est irréversible"
              onConfirm={() => handleDelete(record.id)}
            >
              <Tooltip title="Supprimer">
                <Button type="text" danger icon={<DeleteOutlined />} />
              </Tooltip>
            </Popconfirm>
          )}
          {record.est_actif ? (
            <Popconfirm
              title="Désactiver cette catégorie ?"
              onConfirm={() => handleToggleActif(record.id, false)}
            >
              <Tooltip title="Désactiver">
                <Button type="text" icon={<StopOutlined />} />
              </Tooltip>
            </Popconfirm>
          ) : (
            <Popconfirm
              title="Activer cette catégorie ?"
              onConfirm={() => handleToggleActif(record.id, true)}
            >
              <Tooltip title="Activer">
                <Button type="text" icon={<CheckCircleOutlined />} />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      )
    }
  ];

  return (
    <Card>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* En-tête */}
        <Row justify="space-between" align="middle">
          <Title level={2}>
            <TagsOutlined /> Gestion des Catégories
          </Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingCategorie(null);
              form.resetFields();
              setModalVisible(true);
            }}
            size="large"
          >
            Nouvelle catégorie
          </Button>
        </Row>

        {/* Statistiques */}
        {stats && (
          <Row gutter={16}>
            <Col span={8}>
              <Card size="small">
                <Statistic 
                  title="Total catégories" 
                  value={stats.total} 
                  prefix={<TagsOutlined />}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small">
                <Statistic 
                  title="Avec médicaments" 
                  value={stats.avec_medicaments} 
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small">
                <Statistic 
                  title="Sans médicaments" 
                  value={stats.sans_medicaments} 
                  valueStyle={{ color: '#cf1322' }}
                />
              </Card>
            </Col>
          </Row>
        )}

       

        {/* Tableau */}
        <Table
          dataSource={categories}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ 
            pageSize: 10,
            showTotal: (total) => `Total ${total} catégories`
          }}
          locale={{ emptyText: "Aucune catégorie" }}
        />
      </Space>

      {/* Modal Ajout/Modification */}
      <Modal
        title={editingCategorie ? "Modifier la catégorie" : "Nouvelle catégorie"}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingCategorie(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item
            name="nom"
            label="Nom"
            rules={[
              { required: true, message: "Le nom est requis" },
              { min: 2, message: "Minimum 2 caractères" },
              { max: 100, message: "Maximum 100 caractères" }
            ]}
          >
            <Input placeholder="Ex: Antalgiques, Antibiotiques..." />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea 
              rows={4} 
              placeholder="Description optionnelle de la catégorie"
            />
          </Form.Item>

          <Form.Item>
            <Space style={{ float: "right" }}>
              <Button onClick={() => setModalVisible(false)}>
                Annuler
              </Button>
              <Button type="primary" htmlType="submit">
                {editingCategorie ? "Modifier" : "Créer"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Détails */}
      <Modal
        title={`Médicaments de la catégorie ${selectedCategorie?.nom}`}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Fermer
          </Button>
        ]}
        width={800}
      >
        {selectedCategorie && (
          <>
            <Descriptions bordered size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Catégorie" span={3}>
                {selectedCategorie.nom}
              </Descriptions.Item>
              <Descriptions.Item label="Description" span={3}>
                {selectedCategorie.description || 'Aucune description'}
              </Descriptions.Item>
            </Descriptions>

            <Table
              dataSource={selectedCategorie.medicaments}
              rowKey="id"
              pagination={false}
              size="small"
              columns={[
                {
                  title: "Nom",
                  dataIndex: "nom",
                  key: "nom",
                },
                {
                  title: "DCI",
                  dataIndex: "dci",
                  key: "dci",
                },
                {
                  title: "Stock",
                  dataIndex: "stock_actuel",
                  key: "stock",
                  render: (stock, record) => (
                    <Tag color={stock <= record.stock_minimum ? "orange" : "green"}>
                      {stock}
                    </Tag>
                  )
                },
                {
                  title: "Prix",
                  dataIndex: "prix_vente",
                  key: "prix",
                  render: (prix) => `${prix} €`
                }
              ]}
              locale={{ emptyText: "Aucun médicament dans cette catégorie" }}
            />
          </>
        )}
      </Modal>
    </Card>
  );
};

export default CategoriesPage;