"use client";

import { useEffect, useState } from "react";
import { socket } from "@/lib/socket";

type Notification = {
  message: string;
  type?: "success" | "error" | "info";
};

export default function Notification() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // 🔔 general admin notifications
    socket.on("admin:notification", (data: Notification) => {
      setNotifications((prev) => [data, ...prev]);
    });

    // 🌱 campaign updates
    socket.on("admin:campaign:new", (data) => {
      setNotifications((prev) => [
        { message: "New campaign created", type: "info" },
        ...prev,
      ]);
    });

    // 🧹 cleaning updates
    socket.on("admin:cleaning:new", (data) => {
      setNotifications((prev) => [
        { message: "New cleaning request received", type: "info" },
        ...prev,
      ]);
    });

    return () => {
      socket.off("admin:notification");
      socket.off("admin:campaign:new");
      socket.off("admin:cleaning:new");
    };
  }, []);

  return (
    <div className="fixed top-4 right-4 w-80 space-y-2 z-50">
      {notifications.map((n, index) => (
        <div
          key={index}
          className={`
            p-3 rounded-lg shadow-md border text-sm animate-fade-in
            ${
              n.type === "success"
                ? "bg-green-100 border-green-500 text-green-800"
                : n.type === "error"
                ? "bg-red-100 border-red-500 text-red-800"
                : "bg-white border-gray-200 text-gray-800"
            }
          `}
        >
          {n.message}
        </div>
      ))}
    </div>
  );
}