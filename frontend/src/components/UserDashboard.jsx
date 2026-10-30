import { useEffect, useState } from 'react';
import { api } from '../api.js';
import OrdersTable from './OrdersTable.jsx';

const ETH_ADDRESS = /^0x[a-fA-F0-9]{40}$/;

export default function UserDashboard({ onAuthError }) {
  const [orders, setOrders] = useState([]);
  const [amount, setAmount] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadOrders = async () => {
    try {
      const res = await api.getMyOrders();
      setOrders(res.data.orders);
    } catch (err) {
      if (/log in/i.test(err.message)) onAuthError();
      else setError(err.message);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!ETH_ADDRESS.test(walletAddress)) {
      setError('Please enter a valid Ethereum wallet address (0x + 40 hex characters).');
      return;
    }
    setSubmitting(true);
    try {
      await api.requestOrder(amount, walletAddress);
      setMessage('Request submitted. An admin will process it.');
      setAmount('');
      setWalletAddress('');
      loadOrders();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="card">
        <h2>Request Tokens</h2>
        <form onSubmit={handleSubmit} className="inline-form">
          <label>
            Amount
            <input
              type="number"
              min="0"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 10"
              required
            />
          </label>
          <label className="grow">
            Wallet Address
            <input
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value.trim())}
              placeholder="0x..."
              required
            />
          </label>
          <button className="btn" type="submit" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
        {error && <p className="error">{error}</p>}
        {message && <p className="success">{message}</p>}
      </div>

      <div className="card">
        <div className="card-header">
          <h2>My Orders</h2>
          <button className="btn btn-secondary" onClick={loadOrders}>
            Refresh
          </button>
        </div>
        <OrdersTable orders={orders} />
      </div>
    </>
  );
}
