import { useEffect, useState } from 'react';
import { api } from '../api.js';
import OrdersTable from './OrdersTable.jsx';

const STATUSES = ['ALL', 'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'];

export default function AdminDashboard({ onAuthError }) {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [processingId, setProcessingId] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadOrders = async () => {
    try {
      const res = await api.getAllOrders();
      setOrders(res.data.orders);
    } catch (err) {
      if (/log in/i.test(err.message)) onAuthError();
      else setError(err.message);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleProcess = async (orderId) => {
    setError('');
    setMessage('');
    setProcessingId(orderId);
    try {
      const res = await api.processOrder(orderId);
      setMessage(res.message);
      loadOrders();
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const counts = STATUSES.reduce((acc, s) => {
    acc[s] = s === 'ALL' ? orders.length : orders.filter((o) => o.status === s).length;
    return acc;
  }, {});

  const visibleOrders = filter === 'ALL' ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="card">
      <div className="card-header">
        <h2>All Orders</h2>
        <button className="btn btn-secondary" onClick={loadOrders}>
          Refresh
        </button>
      </div>

      <div className="filters">
        {STATUSES.map((s) => (
          <button
            key={s}
            className={`chip ${filter === s ? 'chip-active' : ''}`}
            onClick={() => setFilter(s)}
          >
            {s} ({counts[s]})
          </button>
        ))}
      </div>

      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}

      <OrdersTable
        orders={visibleOrders}
        showUser
        renderAction={(order) =>
          order.status === 'PENDING' ? (
            <button
              className="btn btn-small"
              disabled={processingId === order._id}
              onClick={() => handleProcess(order._id)}
            >
              {processingId === order._id ? 'Queuing...' : 'Process'}
            </button>
          ) : (
            <span className="muted">-</span>
          )
        }
      />
    </div>
  );
}
