import React, { useState, useEffect } from 'react';

interface NotificationsModalProps {
  onClose: () => void;
}

interface Notification {
    id: string;
    message: string;
    avatar: string;
}

const NotificationItem: React.FC<{ notification: Notification }> = ({ notification }) => (
    <div className="flex items-start p-3 bg-brand-pink-50/70 rounded-lg">
        <img src={notification.avatar} alt="user" className="w-8 h-8 rounded-full mr-3" />
        <p className="text-sm text-gray-700">{notification.message}</p>
    </div>
);


const NotificationsModal: React.FC<NotificationsModalProps> = ({ onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate fetching notifications
  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
        // In a real app, fetch from /api/notifications
        setNotifications([]); // Start with no notifications
        setIsLoading(false);
    }, 800);
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-0 flex items-start justify-end z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm m-4 mt-20 border border-gray-200" onClick={e => e.stopPropagation()}>
         <div className="p-6">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Notification</h3>
            <div className="space-y-3">
                {isLoading ? (
                    <p className="text-center text-gray-500 py-4">Loading...</p>
                ) : notifications.length > 0 ? (
                    notifications.map(notif => <NotificationItem key={notif.id} notification={notif} />)
                ) : (
                    <p className="text-center text-gray-500 py-4">No new notifications.</p>
                )}
            </div>
         </div>
      </div>
    </div>
  );
};

export default NotificationsModal;