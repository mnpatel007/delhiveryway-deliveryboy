// Notification Manager to prevent spam and handle duplicates
class NotificationManager {
    constructor() {
        this.activeNotifications = new Map();
        this.notificationQueue = [];
        this.isProcessing = false;
    }

    // Add notification with duplicate prevention
    addNotification(notification) {
        const key = this.generateKey(notification);

        // Check if notification already exists
        if (this.activeNotifications.has(key)) {
            console.log('Duplicate notification prevented:', notification.title);
            return false;
        }

        // Add to active notifications
        this.activeNotifications.set(key, {
            ...notification,
            timestamp: Date.now(),
            id: key
        });

        // Auto-remove after 5 seconds
        setTimeout(() => {
            this.removeNotification(key);
        }, 5000);

        return true;
    }

    // Generate unique key for notification
    generateKey(notification) {
        return `${notification.type}_${notification.title}_${notification.message}`.replace(/\s+/g, '_');
    }

    // Remove notification
    removeNotification(key) {
        this.activeNotifications.delete(key);
    }

    // Get all active notifications
    getActiveNotifications() {
        return Array.from(this.activeNotifications.values());
    }

    // Clear all notifications
    clearAll() {
        this.activeNotifications.clear();
    }

    // Clean old notifications (older than 30 seconds)
    cleanOldNotifications() {
        const now = Date.now();
        const maxAge = 30000; // 30 seconds

        for (const [key, notification] of this.activeNotifications.entries()) {
            if (now - notification.timestamp > maxAge) {
                this.removeNotification(key);
            }
        }
    }
}

export default new NotificationManager();