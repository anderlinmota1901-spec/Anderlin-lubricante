'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../auth/AuthContext';
import { useProducts } from '../../data/ProductContext';
import { getSupabaseClient } from '../../lib/supabaseClient';
import { Alert, Button, Form, Input, InputNumber, Modal, Popconfirm, Space, Table } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';

const makeEmptyForm = () => ({
  name: '',
  description: '',
  category: '',
  price: null,
  image: '',
  features: '',
});

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const { products, loading: productsLoading, error: productsError, addProduct, updateProduct, deleteProduct } = useProducts();
  const [formInstance] = Form.useForm();
  const fileInputRef = useRef(null);
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat('es-DO', {
        style: 'currency',
        currency: 'DOP',
        minimumFractionDigits: 2,
      }),
    []
  );

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(`/login?from=${encodeURIComponent('/dashboard')}`);
    }
  }, [isAuthenticated, router]);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return products;
    return products.filter((product) => {
      const haystack = [
        product.name,
        product.description,
        product.category,
        String(product.price),
        Array.isArray(product.features) ? product.features.join(' ') : '',
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [products, filter]);

  const resetForm = useCallback(() => {
    const blank = makeEmptyForm();
    formInstance.setFieldsValue(blank);
    formInstance.resetFields();
    setEditingId(null);
    setUploadError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [formInstance]);

  const openCreateModal = useCallback(() => {
    resetForm();
    setFormError('');
    setModalOpen(true);
  }, [resetForm]);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setFormError('');
    resetForm();
  }, [resetForm]);

  const handleFinish = useCallback(
    async (values) => {
      try {
        setSubmitting(true);
        setFormError('');
        const payload = {
          ...values,
          price: Number(values.price ?? 0),
        };

        if (editingId) {
          await updateProduct(editingId, payload);
        } else {
          await addProduct(payload);
        }

        closeModal();
      } catch (error) {
        console.error('submit product error', error);
        setFormError(error?.message ?? 'No se pudo guardar el producto');
      } finally {
        setSubmitting(false);
      }
    },
    [editingId, updateProduct, addProduct, closeModal]
  );

  const handleEdit = useCallback(
    (id) => {
      const product = products.find((item) => item.id === id);
      if (!product) return;
      setEditingId(id);
      formInstance.setFieldsValue({
        name: product.name ?? '',
        description: product.description ?? '',
        category: product.category ?? '',
        price: product.price ?? null,
        image: product.image ?? '',
        features: Array.isArray(product.features) ? product.features.join('\n') : product.features ?? '',
      });
      setUploadError('');
      setFormError('');
      setModalOpen(true);
    },
    [products, formInstance]
  );

  const handleDelete = useCallback(
    async (id) => {
      try {
        setDeletingId(id);
        await deleteProduct(id);
        if (editingId === id) {
          resetForm();
        }
      } catch (error) {
        console.error('delete product error', error);
        setFormError(error?.message ?? 'No se pudo eliminar el producto');
      } finally {
        setDeletingId(null);
      }
    },
    [deleteProduct, editingId, resetForm]
  );

  const onImageUpload = useCallback(async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadError('');
      setUploadingImage(true);
      const supabase = getSupabaseClient();
      const bucket = 'productos';
      const fileExt = file.name.split('.').pop();
      const normalizedExt = fileExt ? fileExt.toLowerCase() : 'jpg';
      const uniqueId = editingId ? `product-${editingId}` : `temp-${Date.now()}`;
      const filePath = `dashboard/${uniqueId}-${Math.random().toString(36).slice(2, 8)}.${normalizedExt}`;

      const { error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        throw error;
      }

      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
      formInstance.setFieldsValue({ image: data.publicUrl });
    } catch (error) {
      console.error('Error subiendo imagen', error);
      setUploadError('No se pudo subir la imagen. Intenta nuevamente.');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [formInstance, editingId]);

  if (!isAuthenticated) {
    return (
      <main className="app">
        <section className="hero" style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--muted)' }}>Validando sesión…</p>
        </section>
      </main>
    );
  }

  const columns = useMemo(
    () => [
      {
        title: 'ID',
        dataIndex: 'id',
        key: 'id',
        width: 80,
        render: (value) => <span style={{ color: 'var(--muted)' }}>{value}</span>,
      },
      {
        title: 'Nombre',
        dataIndex: 'name',
        key: 'name',
        render: (text) => <strong>{text}</strong>,
      },
      {
        title: 'Imagen',
        dataIndex: 'image',
        key: 'image',
        width: 120,
        render: (value, record) =>
          value ? (
            <img
              src={value}
              alt={record.name || 'Producto'}
              style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 12, border: '1px solid rgba(148, 163, 184, 0.2)' }}
            />
          ) : (
            <span style={{ color: 'var(--muted)' }}>Sin imagen</span>
          ),
      },
      {
        title: 'Categoría',
        dataIndex: 'category',
        key: 'category',
      },
      {
        title: 'Precio',
        dataIndex: 'price',
        key: 'price',
        width: 140,
        render: (value) => currencyFormatter.format(Number(value || 0)),
      },
      {
        title: 'Características',
        dataIndex: 'features',
        key: 'features',
        render: (value) =>
          Array.isArray(value) && value.length > 0 ? (
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {value.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
          ) : (
            <span style={{ color: 'var(--muted)' }}>—</span>
          ),
      },
      {
        title: '',
        key: 'actions',
        width: 160,
        render: (_, record) => (
          <Space>
            <Button icon={<EditOutlined />} onClick={() => handleEdit(record.id)}>
              Editar
            </Button>
            <Popconfirm
              title="Eliminar producto"
              description="¿Seguro que deseas eliminar este producto?"
              okText="Sí, eliminar"
              cancelText="Cancelar"
              onConfirm={() => handleDelete(record.id)}
            >
              <Button danger icon={<DeleteOutlined />} loading={deletingId === record.id}>
                Eliminar
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [currencyFormatter, handleEdit, handleDelete, deletingId]
  );

  return (
    <main className="app">
      <section className="hero" style={{ textAlign: 'left' }}>
        <Space direction="vertical" style={{ width: '100%' }} size={16}>
          <Space style={{ width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ margin: 0 }}>Dashboard</h1>
              <span style={{ color: 'var(--muted)' }}>Hola, {user?.username}</span>
            </div>
            <Button type="primary" onClick={logout}>
              Salir
            </Button>
          </Space>

          <Space style={{ width: '100%', justifyContent: 'space-between' }} wrap>
            <Input.Search
              placeholder="Filtrar productos"
              allowClear
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              style={{ maxWidth: 360 }}
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
              Nuevo producto
            </Button>
          </Space>

          {productsError ? <Alert type="error" message={productsError} showIcon /> : null}

          <Table
            rowKey="id"
            columns={columns}
            dataSource={filtered}
            loading={productsLoading}
            pagination={false}
            style={{ marginTop: 12 }}
            locale={{ emptyText: 'No hay productos registrados.' }}
          />
        </Space>
      </section>

      <Modal
        open={isModalOpen}
        title={editingId ? 'Editar producto' : 'Nuevo producto'}
        onCancel={closeModal}
        destroyOnClose
        footer={null}
        width={720}
      >
        {formError ? <Alert type="error" message={formError} showIcon style={{ marginBottom: 16 }} /> : null}
        <Form form={formInstance} layout="vertical" onFinish={handleFinish} initialValues={makeEmptyForm()}>
          <Form.Item
            label="Nombre"
            name="name"
            rules={[{ required: true, message: 'El nombre es obligatorio' }]}
          >
            <Input placeholder="Nombre del producto" />
          </Form.Item>

          <Form.Item
            label="Categoría"
            name="category"
            rules={[{ required: true, message: 'La categoría es obligatoria' }]}
          >
            <Input placeholder="Ej. Sintéticos" />
          </Form.Item>

          <Form.Item label="Precio (DOP)" name="price" rules={[{ required: true, message: 'Indica el precio' }]}> 
            <InputNumber
              min={0}
              step={0.01}
              style={{ width: '100%' }}
              precision={2}
              formatter={(value) =>
                typeof value === 'number' ? currencyFormatter.format(value) : value
              }
              parser={(value) => (value ? Number(value.replace(/[^0-9.-]+/g, '')) : 0)}
            />
          </Form.Item>

          <Form.Item label="Imagen (URL)" name="image">
            <Input placeholder="https://" />
          </Form.Item>

          <Form.Item label="Subir imagen">
            <Button loading={uploadingImage} onClick={() => fileInputRef.current?.click()}>
              {uploadingImage ? 'Subiendo imagen…' : 'Seleccionar desde tu equipo'}
            </Button>
            <input
              id="dashboard-image-input"
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={onImageUpload}
              disabled={uploadingImage}
              ref={fileInputRef}
            />
            {uploadError ? (
              <Alert type="error" message={uploadError} showIcon style={{ marginTop: 12 }} />
            ) : null}
            {formInstance.getFieldValue('image') ? (
              <div style={{ marginTop: 16, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(148, 163, 184, 0.2)' }}>
                <img
                  src={formInstance.getFieldValue('image')}
                  alt="Vista previa del producto"
                  style={{ width: '100%', maxHeight: 220, objectFit: 'cover' }}
                />
              </div>
            ) : null}
          </Form.Item>

          <Form.Item label="Descripción" name="description">
            <Input.TextArea rows={3} placeholder="Detalles del producto" />
          </Form.Item>

          <Form.Item label="Características (una por línea)" name="features">
            <Input.TextArea rows={3} placeholder={'Intervalos de 15.000 km\nProtección al arranque'} />
          </Form.Item>

          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={resetForm}>Limpiar</Button>
            <Button type="primary" htmlType="submit" loading={submitting}>
              {submitting ? 'Guardando…' : editingId ? 'Guardar cambios' : 'Crear producto'}
            </Button>
          </Space>
        </Form>
      </Modal>
    </main>
  );
}
