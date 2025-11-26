import React from 'react';
import { Link } from 'react-router-dom';

const OrderHistoryTable: React.FC = () => {
  // Mock data - replace with actual API call later
  const orders: any[] = [];

  return (
    <div className="border border-border-color rounded-lg">
      <div className="p-6 flex justify-between items-center">
        <h3 className="text-xl font-medium text-text-dark">Recent Order History</h3>
        <Link to="/dashboard/order-history" className="text-base font-medium text-primary">
          View All
        </Link>
      </div>
      {orders.length > 0 ? (
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-xs font-medium text-text-light uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-xs font-medium text-text-light uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-xs font-medium text-text-light uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-xs font-medium text-text-light uppercase tracking-wider">Status</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-color">
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-dark-gray">
                    #{order.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-dark-gray">{order.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-dark-gray">
                    {order.total}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-dark-gray">{order.status}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link to={`/dashboard/order/${order.id}`} className="text-primary hover:text-green-700">
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-8 text-center">
          <p className="text-text-muted">No orders yet. Start shopping to see your order history!</p>
          <Link 
            to="/" 
            className="inline-block mt-4 px-6 py-2 bg-primary text-white rounded-full hover:bg-opacity-90 transition-colors"
          >
            Shop Now
          </Link>
        </div>
      )}
    </div>
  );
};

export default OrderHistoryTable;
