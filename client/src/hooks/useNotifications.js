import { useEffect } from 'react';
import { useSocket } from './useSocket';
import toast from 'react-hot-toast';

export const useNotifications = () => {
  const { on, off } = useSocket();

  useEffect(() => {
    const handleNotification = (data) => {
      toast.custom((t) => (
        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
          <div className="p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-primary-600 text-lg">🔔</span>
                </div>
              </div>
              <div className="ml-3 w-0 flex-1">
                <p className="text-sm font-medium text-gray-900">{data.title}</p>
                <p className="mt-1 text-sm text-gray-500">{data.body}</p>
              </div>
            </div>
          </div>
        </div>
      ), { duration: 5000 });
    };

    on('notification', handleNotification);

    return () => {
      off('notification');
    };
  }, [on, off]);
};
