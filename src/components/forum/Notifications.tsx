import React, { useEffect, useState } from 'react';
import { getFirestore, collection, query, orderBy, limit, onSnapshot, writeBatch, doc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { ForumNotification } from '../../types';
import { Bell, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '../../lib/utils';


const db = getFirestore();

export const Notifications: React.FC = () => {
    const { currentUser: user } = useAuth();
    const [notifications, setNotifications] = useState<ForumNotification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, 'users', user.uid, 'notifications'),
            orderBy('createdAt', 'desc'),
            limit(10)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as ForumNotification[];
            setNotifications(items);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const markAsRead = async (notificationId: string) => {
        if (!user) return;
        try {
            await writeBatch(db).update(
                doc(db, 'users', user.uid, 'notifications', notificationId),
                { read: true }
            ).commit();
        } catch (error) {
            console.error("Error marking read", error);
        }
    };

    if (loading) return null;
    if (notifications.length === 0) return null;

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Bell className="w-5 h-5 mr-2 text-gray-500" />
                    Notifications
                    {unreadCount > 0 && (
                        <span className="ml-2 bg-[#c2002f] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                            {unreadCount}
                        </span>
                    )}
                </h3>
            </div>
            
            <div className="space-y-3">
                {notifications.map(notification => (
                    <div 
                        key={notification.id} 
                        className={cn(
                            "p-3 rounded-md text-sm flex justify-between items-start transition-colors",
                            notification.read ? "bg-gray-50 text-gray-500" : "bg-red-50 text-gray-900 border border-red-100"
                        )}
                    >
                        <div className="flex-1">
                             <p className="mb-1">{notification.message}</p>
                             <div className="flex items-center text-xs text-gray-400">
                                {notification.createdAt?.toDate && formatDistanceToNow(notification.createdAt.toDate(), { addSuffix: true })}
                             </div>
                        </div>
                        {!notification.read && (
                            <button 
                                onClick={() => markAsRead(notification.id)}
                                className="text-gray-400 hover:text-[#c2002f] ml-2"
                                title="Mark as read"
                            >
                                <Check className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
