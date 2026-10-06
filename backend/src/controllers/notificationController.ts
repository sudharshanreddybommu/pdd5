import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { memoryDb } from '../database/db.js';

export async function getUserNotifications(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.json({ success: true, notifications: [], unreadCount: 0 });
      return;
    }

    const notifications = memoryDb.notifications
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const unreadCount = notifications.filter(n => !n.isRead).length;

    res.json({ success: true, count: notifications.length, unreadCount, notifications });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Error fetching notifications.' });
  }
}

export async function markNotificationAsRead(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const notification = memoryDb.notifications.find(n => n.id === id && n.userId === userId);
    if (notification) {
      notification.isRead = true;
      memoryDb.save();
    }

    res.json({ success: true, message: 'Notification marked as read.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Error marking notification as read.' });
  }
}

export async function markAllNotificationsAsRead(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    memoryDb.notifications.forEach(n => {
      if (n.userId === userId) {
        n.isRead = true;
      }
    });
    memoryDb.save();

    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Error updating notifications.' });
  }
}
