import React, { useState, useEffect } from 'react';

interface FriendRequestsModalProps {
  onClose: () => void;
}

interface Request {
    id: string;
    name: string;
    avatar: string;
}

const FriendRequestItem: React.FC<{ request: Request }> = ({ request }) => (
    <div className="flex items-center justify-between p-3 hover:bg-brand-pink-50 rounded-lg">
        <div className="flex items-center">
            <img src={request.avatar} alt={request.name} className="w-10 h-10 rounded-full mr-3" />
            <div>
                <p className="font-semibold text-gray-800">{request.name}</p>
                <p className="text-sm text-gray-500">Wants to be your friend</p>
            </div>
        </div>
        <div className="flex items-center space-x-2">
            <button className="text-green-500 hover:text-green-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
            </button>
            <button className="text-red-500 hover:text-red-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>
    </div>
);

const FriendRequestsModal: React.FC<FriendRequestsModalProps> = ({ onClose }) => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate fetching friend requests
  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
        // In a real app, fetch from /api/friend-requests
        // setRequests([]); 
        setRequests([
            {id: 'req1', name: 'Nguyen Van A', avatar: 'https://picsum.photos/seed/nguyenvana/40/40'},
            // Add more mock requests if needed for styling
        ]);
        setIsLoading(false);
    }, 800);
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-start justify-end z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm m-4 mt-20" onClick={e => e.stopPropagation()}>
         <div className="p-6">
            <h3 className="text-xl font-bold mb-4 text-brand-pink-500">Friend Requests</h3>
            <div className="space-y-2">
                {isLoading ? (
                    <p className="text-gray-500 text-center py-4">Loading requests...</p>
                ) : requests.length > 0 ? (
                    requests.map(req => <FriendRequestItem key={req.id} request={req} />)
                ) : (
                    <p className="text-gray-500 text-center py-4">No new friend requests.</p>
                )}
            </div>
         </div>
      </div>
    </div>
  );
};

export default FriendRequestsModal;