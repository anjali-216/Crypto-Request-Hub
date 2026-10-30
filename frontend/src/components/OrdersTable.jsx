function shorten(value) {
  return value ? `${value.slice(0, 8)}...${value.slice(-6)}` : '-';
}

export default function OrdersTable({ orders, showUser = false, renderAction }) {
  if (orders.length === 0) {
    return <p className="muted">No orders yet.</p>;
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Order ID</th>
            {showUser && <th>User ID</th>}
            <th>Amount</th>
            <th>Wallet</th>
            <th>Status</th>
            <th>Tx Hash</th>
            <th>Created</th>
            {renderAction && <th>Action</th>}
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order._id}>
              <td title={order._id}>{shorten(order._id)}</td>
              {showUser && <td title={order.userId}>{shorten(order.userId)}</td>}
              <td>{order.amount}</td>
              <td title={order.walletAddress}>{shorten(order.walletAddress)}</td>
              <td>
                <span className={`status status-${order.status.toLowerCase()}`}>{order.status}</span>
                {order.errorReason && <div className="error small">{order.errorReason}</div>}
              </td>
              <td title={order.txHash || ''}>{shorten(order.txHash)}</td>
              <td>{new Date(order.createdAt).toLocaleString()}</td>
              {renderAction && <td>{renderAction(order)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
