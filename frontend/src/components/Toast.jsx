import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { clearNotification } from '../features/notification/notificationSlice';

const Toast = () => {
  const { message, type } = useSelector((state) => state.notification);
  const dispatch = useDispatch();

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => dispatch(clearNotification()), 3000);
      return () => clearTimeout(timer);
    }
  }, [message, dispatch]);

  if (!message) return null;

  const colors = {
    success: 'bg-primary text-white',
    error: 'bg-error text-white',
    info: 'bg-ink text-white',
  };

  return (
    <div className={`fixed bottom-6 right-6 px-5 py-3 rounded-md shadow-lg font-sans text-sm z-50 ${colors[type] || colors.info}`}>
      {message}
    </div>
  );
};

export default Toast;