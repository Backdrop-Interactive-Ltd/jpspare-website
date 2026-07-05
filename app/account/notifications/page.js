"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

function formatDate(value) {
  if (!value) return "Just now";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Just now";
  return date.toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function AccountNotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [error, setError] = useState("");
  const [markingId, setMarkingId] = useState("");

  async function loadNotifications(nextUnreadOnly = unreadOnly) {
    try {
      setError("");
      const params = new URLSearchParams({
        page: "1",
        limit: "50",
        unreadOnly: nextUnreadOnly ? "true" : "false",
      });
      const response = await fetch(`/api/account/notifications?${params.toString()}`, {
        cache: "no-store",
        credentials: "include",
      });

      if (response.status === 401) {
        router.push("/signin");
        return;
      }

      if (!response.ok) {
        throw new Error("Unable to load notifications");
      }

      const data = await response.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {
      setError("Unable to load notifications right now.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setError("");
        const response = await fetch("/api/account/notifications?page=1&limit=50", {
          cache: "no-store",
          credentials: "include",
        });

        if (response.status === 401) {
          router.push("/signin");
          return;
        }

        if (!response.ok) {
          throw new Error("Unable to load notifications");
        }

        const data = await response.json();
        if (active) {
          setNotifications(data.notifications || []);
          setUnreadCount(data.unreadCount || 0);
        }
      } catch {
        if (active) {
          setError("Unable to load notifications right now.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [router]);

  async function toggleUnreadOnly() {
    const next = !unreadOnly;
    setUnreadOnly(next);
    setLoading(true);
    await loadNotifications(next);
  }

  async function markAsRead(notificationId) {
    setMarkingId(notificationId);
    setError("");

    try {
      const response = await fetch(`/api/account/notifications/${notificationId}/read`, {
        method: "POST",
        credentials: "include",
      });

      if (response.status === 401) {
        router.push("/signin");
        return;
      }

      if (!response.ok) {
        throw new Error("Unable to update notification");
      }

      const data = await response.json();
      setNotifications((current) =>
        current.map((notification) => (notification.id === notificationId ? data.notification : notification)).filter((notification) => !unreadOnly || !notification.isRead),
      );
      setUnreadCount((current) => Math.max(current - 1, 0));
    } catch {
      setError("Unable to mark this notification as read.");
    } finally {
      setMarkingId("");
    }
  }

  return (
    <main className="min-h-screen bg-white text-[#111827]">
      <section className="mx-auto w-full max-w-[1500px] px-4 py-16 sm:px-6 lg:px-8 xl:px-10">
        <Link href="/account" className="text-sm font-black text-[#667085] hover:text-[#ef3338]">← Back to account</Link>
        <div className="mt-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ef3338]">My Account</p>
            <h1 className="mt-2 text-[40px] font-black tracking-[-0.04em]">Notifications</h1>
            <p className="mt-3 text-[#667085]">View updates, reminders, and account messages from JPSPARE.</p>
          </div>
          <div className="rounded-[12px] border border-red-100 bg-red-50 px-5 py-3 text-sm font-black text-[#ef3338]">
            {unreadCount} unread
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={toggleUnreadOnly}
            className={`h-11 rounded-xl px-5 text-sm font-black transition ${
              unreadOnly ? "bg-[#ef3338] text-white" : "border border-[#d0d5dd] bg-white text-[#344054] hover:border-[#ef3338] hover:text-[#ef3338]"
            }`}
          >
            {unreadOnly ? "Showing unread" : "Show unread only"}
          </button>
        </div>

        <div className="mt-8 overflow-hidden rounded-[12px] border border-[#dfe5ec] bg-white shadow-sm">
          {loading ? <p className="p-8 text-center font-bold text-[#667085]">Loading notifications...</p> : null}
          {!loading && error ? <p className="p-8 text-center font-bold text-[#df171d]">{error}</p> : null}
          {!loading && !error && !notifications.length ? (
            <div className="p-10 text-center">
              <p className="text-lg font-black text-[#111827]">No notifications yet</p>
              <p className="mt-2 text-sm font-semibold text-[#667085]">Account updates will appear here when available.</p>
            </div>
          ) : null}
          <div className="divide-y divide-[#eef0f3]">
            {notifications.map((notification) => (
              <article key={notification.id} className={`grid gap-4 p-5 md:grid-cols-[1fr_auto] md:items-center ${notification.isRead ? "bg-white" : "bg-red-50/50"}`}>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-black text-[#111827]">{notification.title}</h2>
                    {!notification.isRead ? <span className="rounded-full bg-[#ef3338] px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-white">Unread</span> : null}
                  </div>
                  <p className="mt-2 text-sm font-semibold leading-6 text-[#667085]">{notification.body}</p>
                  <p className="mt-2 text-xs font-bold text-[#98a2b3]">{formatDate(notification.createdAt)}</p>
                  {notification.actionUrl ? (
                    <Link href={notification.actionUrl} className="mt-3 inline-flex text-sm font-black text-[#ef3338] hover:text-[#c91d22]">
                      View details
                    </Link>
                  ) : null}
                </div>
                <div className="flex justify-start md:justify-end">
                  {!notification.isRead ? (
                    <button
                      type="button"
                      onClick={() => markAsRead(notification.id)}
                      disabled={markingId === notification.id}
                      className="h-10 rounded-xl border border-red-200 bg-white px-4 text-sm font-black text-[#ef3338] transition hover:bg-red-50 disabled:opacity-60"
                    >
                      {markingId === notification.id ? "Saving..." : "Mark as read"}
                    </button>
                  ) : (
                    <span className="rounded-full bg-[#f2f4f7] px-3 py-1 text-xs font-black text-[#667085]">Read</span>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
