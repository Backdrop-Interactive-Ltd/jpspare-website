import { prisma } from "../db";

function serializeNotification(notification) {
  if (!notification) return null;
  return {
    id: notification.id,
    title: notification.title,
    body: notification.body,
    actionUrl: notification.actionUrl,
    isRead: notification.isRead,
    readAt: notification.readAt?.toISOString?.() ?? notification.readAt,
    createdAt: notification.createdAt?.toISOString?.() ?? notification.createdAt,
  };
}

function cleanText(value) {
  const text = String(value || "").trim();
  return text || null;
}

export async function createCustomerNotification({ customerId, title, body, actionUrl = null }) {
  if (!customerId) {
    throw new Error("Customer ID is required.");
  }

  const cleanTitle = cleanText(title);
  const cleanBody = cleanText(body);

  if (!cleanTitle || !cleanBody) {
    throw new Error("Notification title and body are required.");
  }

  const notification = await prisma.customerNotification.create({
    data: {
      customerId,
      title: cleanTitle,
      body: cleanBody,
      actionUrl: cleanText(actionUrl),
    },
  });

  return serializeNotification(notification);
}

export async function getCustomerNotifications({ customerId, page = 1, limit = 20, unreadOnly = false } = {}) {
  if (!customerId) {
    return {
      notifications: [],
      unreadCount: 0,
      pagination: { page: 1, limit, total: 0, totalPages: 1 },
    };
  }

  const safePage = Math.max(Number.parseInt(String(page || 1), 10), 1);
  const safeLimit = Math.min(Math.max(Number.parseInt(String(limit || 20), 10), 1), 100);
  const where = {
    customerId,
    ...(unreadOnly ? { isRead: false } : {}),
  };

  const [notifications, total, unreadCount] = await prisma.$transaction([
    prisma.customerNotification.findMany({
      where,
      orderBy: [{ isRead: "asc" }, { createdAt: "desc" }],
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
    }),
    prisma.customerNotification.count({ where }),
    prisma.customerNotification.count({ where: { customerId, isRead: false } }),
  ]);

  return {
    notifications: notifications.map(serializeNotification),
    unreadCount,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.max(Math.ceil(total / safeLimit), 1),
    },
  };
}

export async function markNotificationAsRead({ customerId, notificationId }) {
  if (!customerId || !notificationId) return null;

  const existing = await prisma.customerNotification.findFirst({
    where: { id: notificationId, customerId },
  });

  if (!existing) return null;
  if (existing.isRead) return serializeNotification(existing);

  const notification = await prisma.customerNotification.update({
    where: { id: existing.id },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });

  return serializeNotification(notification);
}
