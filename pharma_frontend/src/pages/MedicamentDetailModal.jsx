// src/pages/MedicamentDetailModal.jsx
import React from "react";
import { Modal, Descriptions, Tag, Statistic, Row, Col, Card, Timeline } from "antd";
import { 
  MedicineBoxOutlined, 
  WarningOutlined, 
  CheckCircleOutlined,
  ShoppingCartOutlined,
  EuroCircleOutlined
} from "@ant-design/icons";
import dayjs from 'dayjs';

const MedicamentDetailModal = ({ visible, medicament, onClose }) => {
  if (!medicament) return null;

  const getStockStatus = () => {
    if (medicament.stock_actuel <= medicament.stock_minimum) {
      return <Tag color="red">Stock critique</Tag>;
    }
    if (medicament.stock_actuel <= medicament.stock_minimum * 1.5) {
      return <Tag color="orange">Stock bas</Tag>;
    }
    return <Tag color="green">Stock normal</Tag>;
  };

  const getExpirationStatus = () => {
    const jours = dayjs(medicament.date_expiration).diff(dayjs(), 'days');
    if (jours < 0) return <Tag color="red">Expiré</Tag>;
    if (jours < 30) return <Tag color="orange">Expire bientôt</Tag>;
    return <Tag color="green">Valide</Tag>;
  };

  return (
    <Modal
      title={
        <span>
          <MedicineBoxOutlined /> Détails du médicament
        </span>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      <Descriptions bordered column={2}>
        <Descriptions.Item label="Nom" span={2}>
          <strong>{medicament.nom}</strong>
        </Descriptions.Item>
        <Descriptions.Item label="DCI">{medicament.dci}</Descriptions.Item>
        <Descriptions.Item label="Catégorie">
          {medicament.categorie?.nom || medicament.categorie_nom}
        </Descriptions.Item>
        <Descriptions.Item label="Forme">{medicament.forme}</Descriptions.Item>
        <Descriptions.Item label="Dosage">{medicament.dosage}</Descriptions.Item>
        <Descriptions.Item label="Ordonnance">
          {medicament.ordonnance_requise ? 
            <Tag color="orange">Requis</Tag> : 
            <Tag color="green">Non requis</Tag>
          }
        </Descriptions.Item>
        <Descriptions.Item label="Statut">
          {medicament.est_actif ? 
            <Tag color="green">Actif</Tag> : 
            <Tag color="red">Inactif</Tag>
          }
        </Descriptions.Item>
      </Descriptions>

      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Prix d'achat"
              value={medicament.prix_achat}
              suffix="€"
              precision={2}
              prefix={<EuroCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Prix de vente"
              value={medicament.prix_vente}
              suffix="€"
              precision={2}
              prefix={<EuroCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Marge"
              value={medicament.prix_vente - medicament.prix_achat}
              suffix="€"
              precision={2}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Card title="Stock" size="small">
            <div style={{ textAlign: 'center' }}>
              <Statistic
                title="Stock actuel"
                value={medicament.stock_actuel}
                valueStyle={{ 
                  color: medicament.stock_actuel <= medicament.stock_minimum ? '#cf1322' : '#3f8600' 
                }}
              />
              <div style={{ marginTop: 8 }}>
                <Text>Stock minimum: {medicament.stock_minimum}</Text>
                <br />
                {getStockStatus()}
              </div>
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Expiration" size="small">
            <div style={{ textAlign: 'center' }}>
              <Statistic
                title="Date d'expiration"
                value={dayjs(medicament.date_expiration).format('DD/MM/YYYY')}
              />
              <div style={{ marginTop: 8 }}>
                {getExpirationStatus()}
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {medicament.statistiques && (
        <Card title="Statistiques de vente" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={8}>
              <Statistic
                title="Total vendu"
                value={medicament.statistiques.total_vendu}
                suffix="unités"
                prefix={<ShoppingCartOutlined />}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="Chiffre d'affaires"
                value={medicament.statistiques.chiffre_affaires}
                suffix="€"
                precision={2}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="Dernière vente"
                value={medicament.statistiques.derniere_vente ? 
                  dayjs(medicament.statistiques.derniere_vente).format('DD/MM/YYYY') : 
                  'Jamais'
                }
              />
            </Col>
          </Row>
        </Card>
      )}
    </Modal>
  );
};

export default MedicamentDetailModal;