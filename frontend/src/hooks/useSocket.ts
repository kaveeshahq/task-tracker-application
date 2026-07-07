import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import type { Task } from "../types";

interface TaskEventHandlers {
  onCreated?: (task: Task) => void;
  onUpdated?: (task: Task) => void;
  onDeleted?: (task: Task) => void;
}

export function useSocket(handlers: TaskEventHandlers) {
  const socketRef = useRef<Socket | null>(null);
  // Keep the latest handlers without reconnecting the socket
  const handlersRef = useRef(handlers);

  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const socket = io(import.meta.env.VITE_SOCKET_URL, {
      auth: { token },
    });
    socketRef.current = socket;

    socket.on("task:created", (task: Task) =>
      handlersRef.current.onCreated?.(task),
    );
    socket.on("task:updated", (task: Task) =>
      handlersRef.current.onUpdated?.(task),
    );
    socket.on("task:deleted", (task: Task) =>
      handlersRef.current.onDeleted?.(task),
    );

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  return socketRef;
}
