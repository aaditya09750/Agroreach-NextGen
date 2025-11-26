import React from 'react';
import { useNotification } from '../../context/NotificationContext';
import { X, CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

const NotificationToast: React.FC = () => {
  const { notifications, removeNotification } = useNotification();

  if (notifications.length === 0) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 min-w-[300px] max-w-[400px] flex items-start gap-3 animate-slideInRight"
        >
          {getIcon(notification.type)}
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">{notification.message}</p>
          </div>
          <button
            onClick={() => removeNotification(notification.id)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationToast;
