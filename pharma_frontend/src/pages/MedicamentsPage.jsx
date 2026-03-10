// src/pages/MedicamentsPage.jsx
import React, { useEffect, useState } from "react";
import {
  Table, Button, Modal, Form, Input, InputNumber, Space, Card,
  Row, Col, Popconfirm, message, Typography, Empty, Tooltip, Select, Switch, Tag, Badge, Alert
} from "antd";
import {
  PlusOutlined, EditOutlined, DeleteOutlined, MedicineBoxOutlined,
  WarningOutlined, EyeOutlined, ReloadOutlined, FilterOutlined,
  ExclamationCircleOutlined
} from "@ant-design/icons";
import { getMedicaments, createMedicament, updateMedicament, deleteMedicament } from "../api/medicamentsApi";
import api from "../api/axiosConfig";
import dayjs from 'dayjs';
import MedicamentDetailModal from "./MedicamentDetailModal";

const { Title, Text } = Typography;
const { Option } = Select;

const MedicamentsPage = () => {
  const [medicaments, setMedicaments] = useState([]);
  const [filteredMedicaments, setFilteredMedicaments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedMedicament, setSelectedMedicament] = useState(null);
  const [editingMedicament, setEditingMedicament] = useState(null);
  const [form] = Form.useForm();
  
  // État des filtres
  const [filters, setFilters] = useState({
    search: '',
    categorie: '',
    ordonnance: '',
    stock: '',
    expiration: ''
  });
  
  // Alertes
  const [alertesStock, setAlertesStock] = useState([]);
  const [alertesExpiration, setAlertesExpiration] = useState([]);

  useEffect(() => {
    fetchMedicaments();
    fetchCategories();
    fetchAlertes();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [medicaments, filters]);

  const fetchMedicaments = async () => {
    setLoading(true);
    try {
      const res = await getMedicaments();
      console.log("Médicaments reçus:", res.data);
      setMedicaments(res.data);
      setFilteredMedicaments(res.data);
    } catch (error) {
      console.error("Erreur chargement:", error);
      message.error("Erreur chargement médicaments");
    }
    setLoading(false);
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories/');
      setCategories(response.data);
    } catch (error) {
      console.error("Erreur chargement catégories:", error);
    }
  };

  const fetchAlertes = async () => {
    try {
      const stockRes = await api.get('/medicaments/alerte_stock/');
      setAlertesStock(stockRes.data);
      
      const expRes = await api.get('/medicaments/alerte_expiration/');
      setAlertesExpiration(expRes.data);
    } catch (error) {
      console.error("Erreur chargement alertes:", error);
    }
  };

  const applyFilters = () => {
    let filtered = [...medicaments];

    // Recherche textuelle
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(med => 
        med.nom?.toLowerCase().includes(searchLower) ||
        med.dci?.toLowerCase().includes(searchLower) ||
        med.forme?.toLowerCase().includes(searchLower) ||
        med.dosage?.toLowerCase().includes(searchLower)
      );
    }

    // Filtre catégorie
    if (filters.categorie) {
      filtered = filtered.filter(med => 
        med.categorie?.id === parseInt(filters.categorie) ||
        med.categorie === parseInt(filters.categorie)
      );
    }

    // Filtre ordonnance
    if (filters.ordonnance) {
      const ordValue = filters.ordonnance === 'oui';
      filtered = filtered.filter(med => med.ordonnance_requise === ordValue);
    }

    // Filtre stock bas
    if (filters.stock === 'bas') {
      filtered = filtered.filter(med => med.stock_actuel <= med.stock_minimum);
    }

    // Filtre expiration
    if (filters.expiration === 'bientot') {
      const thirtyDaysFromNow = dayjs().add(30, 'days');
      filtered = filtered.filter(med => 
        dayjs(med.date_expiration).isBefore(thirtyDaysFromNow)
      );
    }

    setFilteredMedicaments(filtered);
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      categorie: '',
      ordonnance: '',
      stock: '',
      expiration: ''
    });
  };

  const resetForm = () => {
    form.resetFields();
    setEditingMedicament(null);
  };

  const saveMedicament = async (values) => {
    try {
      const dataToSend = {
        ...values,
        categorie: parseInt(values.categorie)
      };

      console.log("Données à envoyer:", dataToSend);

      if (editingMedicament) {
        await updateMedicament(editingMedicament.id, dataToSend);
        message.success("Médicament modifié avec succès");
      } else {
        await createMedicament(dataToSend);
        message.success("Médicament ajouté avec succès");
      }

      setModalVisible(false);
      resetForm();
      fetchMedicaments();
      fetchAlertes();
    } catch (error) {
      console.error("Erreur:", error.response?.data || error);
      message.error("Erreur lors de la sauvegarde");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteMedicament(id);
      message.success("Médicament supprimé");
      fetchMedicaments();
      fetchAlertes();
    } catch (error) {
      message.error("Erreur suppression");
    }
  };

  const handleViewDetails = async (medicament) => {
    try {
      const response = await api.get(`/medicaments/${medicament.id}/details/`);
      setSelectedMedicament(response.data);
      setDetailModalVisible(true);
    } catch (error) {
      message.error("Erreur chargement détails");
    }
  };

  const openEditModal = (record) => {
    console.log("Modification de:", record);
    setEditingMedicament(record);
    form.setFieldsValue({
      ...record,
      categorie: record.categorie?.id || record.categorie,
      date_expiration: record.date_expiration ? dayjs(record.date_expiration).format('YYYY-MM-DD') : null
    });
    setModalVisible(true);
  };

  const columns = [
    {
      title: "Nom",
      dataIndex: "nom",
      key: "nom",
      render: (text, record) => (
        <Space>
          <Text strong>{text}</Text>
          {record.ordonnance_requise && (
            <Tag color="orange" icon={<WarningOutlined />}>Ordonnance</Tag>
          )}
        </Space>
      ),
      sorter: (a, b) => a.nom?.localeCompare(b.nom),
    },
    {
      title: "DCI",
      dataIndex: "dci",
      key: "dci",
    },
    {
      title: "Forme/Dosage",
      key: "forme_dosage",
      render: (_, record) => `${record.forme || ''} ${record.dosage || ''}`.trim()
    },
    {
      title: "Catégorie",
      key: "categorie",
      render: (_, record) => record.categorie?.nom || record.categorie_nom || 'N/A'
    },
    {
      title: "Prix vente",
      dataIndex: "prix_vente",
      key: "prix_vente",
      render: (prix) => `${prix} €`,
      sorter: (a, b) => a.prix_vente - b.prix_vente
    },
    {
      title: "Stock",
      key: "stock",
      render: (_, record) => (
        <Space>
          <Badge 
            count={record.stock_actuel} 
            showZero
            overflowCount={999}
            style={{ 
              backgroundColor: record.stock_actuel <= record.stock_minimum ? '#f5222d' : '#52c41a',
              color: 'white'
            }}
          />
          {record.stock_actuel <= record.stock_minimum && (
            <Tooltip title="Stock bas">
              <ExclamationCircleOutlined style={{ color: '#f5222d' }} />
            </Tooltip>
          )}
        </Space>
      ),
      sorter: (a, b) => a.stock_actuel - b.stock_actuel
    },
    {
      title: "Expiration",
      dataIndex: "date_expiration",
      key: "expiration",
      render: (date) => {
        if (!date) return 'N/A';
        const jours = dayjs(date).diff(dayjs(), 'days');
        let color = "green";
        if (jours < 30) color = "orange";
        if (jours < 7) color = "red";
        
        return (
          <Tooltip title={`Expire le ${dayjs(date).format('DD/MM/YYYY')}`}>
            <Tag color={color}>
              {jours > 0 ? `${jours} jours` : "Expiré"}
            </Tag>
          </Tooltip>
        );
      },
      sorter: (a, b) => dayjs(a.date_expiration).unix() - dayjs(b.date_expiration).unix()
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Tooltip title="Voir détails">
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
              onClick={() => openEditModal(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Supprimer ce médicament ?"
            description="Cette action est irréversible"
            onConfirm={() => handleDelete(record.id)}
            okText="Oui"
            cancelText="Non"
          >
            <Tooltip title="Supprimer">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '0 24px' }}>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* En-tête avec bouton Nouveau */}
          <Row justify="space-between" align="middle">
            <Title level={2}>
              <MedicineBoxOutlined /> Gestion des Médicaments
            </Title>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                console.log("✅ Bouton Nouveau cliqué");
                resetForm();
                setModalVisible(true);
              }}
              size="large"
            >
              Nouveau médicament
            </Button>
          </Row>

          {/* Alertes */}
          {(alertesStock.length > 0 || alertesExpiration.length > 0) && (
            <Space direction="vertical" style={{ width: '100%' }}>
              {alertesStock.length > 0 && (
                <Alert
                  message={`⚠️ ${alertesStock.length} médicament(s) avec stock bas`}
                  type="warning"
                  showIcon
                  closable
                />
              )}
              {alertesExpiration.length > 0 && (
                <Alert
                  message={`📅 ${alertesExpiration.length} médicament(s) proches de l'expiration`}
                  type="info"
                  showIcon
                  closable
                />
              )}
            </Space>
          )}

          {/* Barre de filtres */}
          <Card size="small" title={<><FilterOutlined /> Filtres</>}>
            <Row gutter={16} align="middle">
              <Col span={6}>
                <Input
                  placeholder="Rechercher..."
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                  allowClear
                />
              </Col>
              <Col span={4}>
                <Select
                  placeholder="Catégorie"
                  value={filters.categorie}
                  onChange={(value) => setFilters({...filters, categorie: value})}
                  allowClear
                  style={{ width: '100%' }}
                >
                  {categories.map(cat => (
                    <Option key={cat.id} value={cat.id}>{cat.nom}</Option>
                  ))}
                </Select>
              </Col>
              <Col span={3}>
                <Select
                  placeholder="Ordonnance"
                  value={filters.ordonnance}
                  onChange={(value) => setFilters({...filters, ordonnance: value})}
                  allowClear
                  style={{ width: '100%' }}
                >
                  <Option value="oui">Ordonnance requise</Option>
                  <Option value="non">Sans ordonnance</Option>
                </Select>
              </Col>
              <Col span={3}>
                <Select
                  placeholder="Stock"
                  value={filters.stock}
                  onChange={(value) => setFilters({...filters, stock: value})}
                  allowClear
                  style={{ width: '100%' }}
                >
                  <Option value="bas">Stock bas</Option>
                </Select>
              </Col>
              <Col span={3}>
                <Select
                  placeholder="Expiration"
                  value={filters.expiration}
                  onChange={(value) => setFilters({...filters, expiration: value})}
                  allowClear
                  style={{ width: '100%' }}
                >
                  <Option value="bientot">Expire bientôt</Option>
                </Select>
              </Col>
              <Col span={2}>
                <Button icon={<ReloadOutlined />} onClick={resetFilters}>
                  Reset
                </Button>
              </Col>
            </Row>
          </Card>

          {/* Résultats */}
          <Text type="secondary">
            {filteredMedicaments.length} médicament(s) trouvé(s)
          </Text>

          {/* Tableau */}
          <Table
            dataSource={filteredMedicaments}
            columns={columns}
            rowKey="id"
            loading={loading}
            pag={{ 
              pageSize: 10,
              showTotal: (total) => `Total ${total} médicaments`
            }}
            locale={{ emptyText: <Empty description="Aucun médicament" /> }}
          />
        </Space>
      </Card>

      {/* Modal d'ajout/modification */}
      <Modal
        title={editingMedicament ? "Modifier Médicament" : "Nouveau Médicament"}
        open={modalVisible}
        onCancel={() => {
          console.log("Annulation");
          setModalVisible(false);
          resetForm();
        }}
        footer={[
          <Button key="cancel" onClick={() => {
            setModalVisible(false);
            resetForm();
          }}>
            Annuler
          </Button>,
          <Button key="submit" type="primary" onClick={() => form.submit()}>
            {editingMedicament ? "Modifier" : "Enregistrer"}
          </Button>
        ]}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={saveMedicament}
          initialValues={{ est_actif: true, ordonnance_requise: false }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="nom"
                label="Nom"
                rules={[{ required: true, message: "Le nom est requis" }]}
              >
                <Input placeholder="Ex: Doliprane" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="dci"
                label="DCI"
                rules={[{ required: true, message: "La DCI est requise" }]}
              >
                <Input placeholder="Ex: Paracétamol" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="forme"
                label="Forme"
                rules={[{ required: true, message: "La forme est requise" }]}
              >
                <Input placeholder="Ex: Comprimé" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="dosage"
                label="Dosage"
                rules={[{ required: true, message: "Le dosage est requis" }]}
              >
                <Input placeholder="Ex: 500mg" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="categorie"
                label="Catégorie"
                rules={[{ required: true, message: "La catégorie est requise" }]}
              >
                <Select placeholder="Sélectionnez une catégorie">
                  {categories.map(cat => (
                    <Option key={cat.id} value={cat.id}>{cat.nom}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="prix_achat"
                label="Prix d'achat (€)"
                rules={[{ required: true, message: "Le prix d'achat est requis" }]}
              >
                <InputNumber style={{ width: '100%' }} min={0} step={0.01} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="prix_vente"
                label="Prix de vente (€)"
                rules={[{ required: true, message: "Le prix de vente est requis" }]}
              >
                <InputNumber style={{ width: '100%' }} min={0} step={0.01} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="stock_actuel"
                label="Stock actuel"
                rules={[{ required: true, message: "Le stock est requis" }]}
              >
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="stock_minimum"
                label="Stock minimum"
                rules={[{ required: true, message: "Le stock minimum est requis" }]}
              >
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="date_expiration"
                label="Date d'expiration"
                rules={[{ required: true, message: "La date d'expiration est requise" }]}
              >
                <Input type="date" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="ordonnance_requise"
                label="Ordonnance requise"
                valuePropName="checked"
              >
                <Switch checkedChildren="Oui" unCheckedChildren="Non" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="est_actif"
            label="Actif"
            valuePropName="checked"
          >
            <Switch checkedChildren="Actif" unCheckedChildren="Inactif" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal de détails */}
      <MedicamentDetailModal
        visible={detailModalVisible}
        medicament={selectedMedicament}
        onClose={() => setDetailModalVisible(false)}
      />
    </div>
  );
};

export default MedicamentsPage;