// src/pages/VentesPage.jsx
import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Space,
  Card,
  Row,
  Col,
  Popconfirm,
  message,
  Typography,
  Empty,
  Tooltip,
  Select,
  DatePicker,
  Tag,
  Descriptions,
  Badge
} from "antd";
import {
  PlusOutlined,
  EyeOutlined,
  DeleteOutlined,
  ShoppingCartOutlined,
  UndoOutlined,
  SearchOutlined,
  PrinterOutlined
} from "@ant-design/icons";
import api from "../api/axiosConfig";
import dayjs from 'dayjs';
// Ajoutez ces imports en haut si manquants
import { Divider } from "antd"; // Manquait dans le code précédent

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const VentesPage = () => {
  const [ventes, setVentes] = useState([]);
  const [medicaments, setMedicaments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedVente, setSelectedVente] = useState(null);
  const [form] = Form.useForm();
  const [articles, setArticles] = useState([{ medicament: null, quantite: 1 }]);
  
  // Filtres
  const [dateRange, setDateRange] = useState([]);
  const [statutFilter, setStatutFilter] = useState('');

  useEffect(() => {
    fetchVentes();
    fetchMedicaments();
  }, []);

  useEffect(() => {
    fetchVentes();
  }, [dateRange, statutFilter]);

  // Dans fetchVentes, ajoutez plus de logs
const fetchVentes = async () => {
  setLoading(true);
  try {
    console.log("🔍 Tentative de chargement des ventes...");
    const response = await api.get('/ventes/');
    console.log("✅ Réponse reçue:", response);
    console.log("📦 Données:", response.data);
    setVentes(response.data);
  } catch (error) {
    console.error("❌ Erreur complète:", error);
    console.error("❌ Response:", error.response);
    console.error("❌ Status:", error.response?.status);
    console.error("❌ Data:", error.response?.data);
    message.error("Erreur chargement ventes");
  }
  setLoading(false);
};

  // Dans VentesPage.jsx
const fetchMedicaments = async () => {
  try {
    console.log("🔍 Chargement des médicaments...");
    const response = await api.get('/medicaments/');
    console.log("✅ Médicaments reçus:", response.data);
    console.log("📦 Nombre de médicaments:", response.data.length);
    setMedicaments(response.data);
  } catch (error) {
    console.error("❌ Erreur chargement médicaments:", error);
    message.error("Erreur chargement médicaments");
  }
};

  const handleAddArticle = () => {
    setArticles([...articles, { medicament: null, quantite: 1 }]);
  };

  const handleRemoveArticle = (index) => {
    const newArticles = articles.filter((_, i) => i !== index);
    setArticles(newArticles);
  };

  const handleArticleChange = (index, field, value) => {
    const newArticles = [...articles];
    newArticles[index][field] = value;
    setArticles(newArticles);
  };

  const calculateTotal = () => {
    let total = 0;
    articles.forEach(article => {
      if (article.medicament) {
        const medicament = medicaments.find(m => m.id === article.medicament);
        if (medicament) {
          total += medicament.prix_vente * article.quantite;
        }
      }
    });
    return total.toFixed(2);
  };

  const handleCreateVente = async () => {
    try {
      // Vérifier que tous les articles ont un médicament
      for (let i = 0; i < articles.length; i++) {
        if (!articles[i].medicament) {
          message.error(`Veuillez sélectionner un médicament pour l'article ${i + 1}`);
          return;
        }
        if (articles[i].quantite <= 0) {
          message.error(`La quantité doit être positive pour l'article ${i + 1}`);
          return;
        }
      }

      // Vérifier le stock
      for (let i = 0; i < articles.length; i++) {
        const medicament = medicaments.find(m => m.id === articles[i].medicament);
        if (medicament.stock_actuel < articles[i].quantite) {
          message.error(`Stock insuffisant pour ${medicament.nom}. Disponible: ${medicament.stock_actuel}`);
          return;
        }
      }

      const details = articles.map(article => ({
        medicament: article.medicament,
        quantite: article.quantite,
        prix_unitaire: medicaments.find(m => m.id === article.medicament).prix_vente
      }));

      const venteData = {
        lignes: details
      };
      
      const response = await api.post('/ventes/', venteData);

      message.success("Vente créée avec succès");
      setModalVisible(false);
      setArticles([{ medicament: null, quantite: 1 }]);
      form.resetFields();
      fetchVentes();
    } catch (error) {
      console.error("Erreur:", error);
      message.error(error.response?.data?.message || "Erreur lors de la création");
    }
  };

  const handleViewDetails = (vente) => {
    setSelectedVente(vente);
    setDetailModalVisible(true);
  };

  const handleCancelVente = async (vente) => {
    try {
      await api.post(`/ventes/${vente.id}/annuler/`);
      message.success("Vente annulée avec succès");
      fetchVentes();
    } catch (error) {
      message.error("Erreur lors de l'annulation");
    }
  };

  const getStatutTag = (statut) => {
    const colors = {
      'completee': 'green',
      'annulee': 'red',
      'en_cours': 'orange'
    };
    const labels = {
      'completee': 'Complétée',
      'annulee': 'Annulée',
      'en_cours': 'En cours'
    };
    return <Tag color={colors[statut] || 'blue'}>{labels[statut] || statut}</Tag>;
  };

  const columns = [
    {
      title: "Référence",
      dataIndex: "reference",
      key: "reference",
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: "Date",
      dataIndex: "date_vente",
      key: "date_vente",
      render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm')
    },
    {
      title: "Total TTC",
      dataIndex: "total_ttc",
      key: "total_ttc",
      render: (total) => <Text strong>{total} €</Text>
    },
    {
      title: "Statut",
      dataIndex: "statut",
      key: "statut",
      render: (statut) => getStatutTag(statut)
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
          {record.statut === 'completee' && (
            <Popconfirm
              title="Annuler cette vente ?"
              description="Le stock sera réintégré"
              onConfirm={() => handleCancelVente(record)}
              okText="Oui"
              cancelText="Non"
            >
              <Tooltip title="Annuler la vente">
                <Button type="text" danger icon={<UndoOutlined />} />
              </Tooltip>
            </Popconfirm>
          )}
          <Tooltip title="Imprimer">
            <Button
              type="text"
              icon={<PrinterOutlined />}
              onClick={() => window.print()}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: 24, width: "100%" }}>
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col span={24}>
          <Card>
            <Row justify="space-between" align="middle">
              <Title level={3}>
                <ShoppingCartOutlined /> Gestion des Ventes
              </Title>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setModalVisible(true)}
                size="large"
              >
                Nouvelle vente
              </Button>
            </Row>
          </Card>
        </Col>
      </Row>

      <Card style={{ marginBottom: 20 }}>
        <Row gutter={16} align="middle">
          <Col span={8}>
            <RangePicker 
              style={{ width: '100%' }}
              onChange={setDateRange}
              format="DD/MM/YYYY"
              placeholder={['Date début', 'Date fin']}
            />
          </Col>
          <Col span={6}>
            <Select
              style={{ width: '100%' }}
              placeholder="Filtrer par statut"
              allowClear
              onChange={setStatutFilter}
            >
              <Option value="completee">Complétée</Option>
              <Option value="en_cours">En cours</Option>
              <Option value="annulee">Annulée</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Button 
              icon={<SearchOutlined />} 
              onClick={fetchVentes}
              type="primary"
            >
              Rechercher
            </Button>
          </Col>
        </Row>
      </Card>

      <Card>
        <Table
          dataSource={ventes}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ 
            pageSize: 10,
            showTotal: (total) => `Total ${total} ventes`
          }}
          locale={{ emptyText: <Empty description="Aucune vente" /> }}
        />
      </Card>

      {/* Modal Nouvelle Vente */}
      <Modal
        title="Nouvelle vente"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setArticles([{ medicament: null, quantite: 1 }]);
          form.resetFields();
        }}
        footer={[
          <Button key="cancel" onClick={() => setModalVisible(false)}>
            Annuler
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            onClick={handleCreateVente}
            disabled={articles.length === 0}
          >
            Enregistrer la vente
          </Button>
        ]}
        width={800}
      >
        <Form form={form} layout="vertical">
          <div style={{ maxHeight: 400, overflowY: 'auto', padding: '0 10px' }}>
            {articles.map((article, index) => (
              <Card 
                key={index} 
                style={{ marginBottom: 16, background: '#fafafa' }} 
                size="small"
                title={`Article ${index + 1}`}
                extra={
                  articles.length > 1 && (
                    <Button 
                      type="text" 
                      danger 
                      onClick={() => handleRemoveArticle(index)}
                      icon={<DeleteOutlined />}
                    />
                  )
                }
              >
                <Row gutter={16}>
                  <Col span={14}>
                    <Form.Item 
                      label="Médicament" 
                      required
                      validateStatus={article.medicament ? 'success' : 'error'}
                    >
                     <Select
  placeholder="Sélectionner un médicament"
  value={article.medicament}
  onChange={(value) => handleArticleChange(index, 'medicament', value)}
  showSearch
  optionFilterProp="children"
  notFoundContent={medicaments.length === 0 ? "Aucun médicament disponible" : "Pas de résultat"}
>
  {medicaments.map(med => (
    <Select.Option key={med.id} value={med.id}>
      {med.nom} - Stock: {med.stock_actuel} - {med.prix_vente}€
    </Select.Option>
  ))}
</Select>
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item 
                      label="Quantité"
                      required
                      validateStatus={article.quantite > 0 ? 'success' : 'error'}
                    >
                      <InputNumber
                        min={1}
                        value={article.quantite}
                        onChange={(value) => handleArticleChange(index, 'quantite', value)}
                        style={{ width: '100%' }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={4}>
                    <Form.Item label="Prix total">
                      {article.medicament ? (
                        <Text strong>
                          {(
                            medicaments.find(m => m.id === article.medicament)?.prix_vente * 
                            article.quantite
                          ).toFixed(2)} €
                        </Text>
                      ) : (
                        <Text type="secondary">-</Text>
                      )}
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            ))}
            
            <Button 
              type="dashed" 
              onClick={handleAddArticle} 
              style={{ width: '100%', marginTop: 8 }}
              icon={<PlusOutlined />}
            >
              Ajouter un article
            </Button>
          </div>

          <Divider />

          <Row justify="end">
            <Col>
              <Text strong style={{ fontSize: 16 }}>
                Total: {calculateTotal()} €
              </Text>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Modal Détails Vente */}
      <Modal
        title={`Détails de la vente ${selectedVente?.reference}`}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Fermer
          </Button>
        ]}
        width={700}
      >
        {selectedVente && (
          <>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Référence" span={2}>
                {selectedVente.reference}
              </Descriptions.Item>
              <Descriptions.Item label="Date">
                {dayjs(selectedVente.date_vente).format('DD/MM/YYYY HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label="Statut">
                {getStatutTag(selectedVente.statut)}
              </Descriptions.Item>
              <Descriptions.Item label="Total TTC" span={2}>
                <Text strong style={{ fontSize: 16 }}>
                  {selectedVente.total_ttc} €
                </Text>
              </Descriptions.Item>
              {selectedVente.notes && (
                <Descriptions.Item label="Notes" span={2}>
                  {selectedVente.notes}
                </Descriptions.Item>
              )}
            </Descriptions>

            <Divider>Articles</Divider>

            <Table
              dataSource={selectedVente.lignes || []}
              rowKey="id"
              pagination={false}
              size="small"
              columns={[
                {
                  title: "Médicament",
                  dataIndex: "medicament_nom",
                  key: "medicament_nom",
                  render: (_, record) => record.medicament?.nom || "N/A"
                },
                {
                  title: "Quantité",
                  dataIndex: "quantite",
                  key: "quantite"
                },
                {
                  title: "Prix unitaire",
                  dataIndex: "prix_unitaire",
                  key: "prix_unitaire",
                  render: (prix) => `${prix} €`
                },
                {
                  title: "Sous-total",
                  dataIndex: "sous_total",
                  key: "sous_total",
                  render: (total) => <Text strong>{total} €</Text>
                }
              ]}
            />
          </>
        )}
      </Modal>
    </div>
  );
};

export default VentesPage;