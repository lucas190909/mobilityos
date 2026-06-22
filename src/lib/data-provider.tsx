import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  fetchClients,
  fetchClientById,
  createClient,
  updateClient,
  deleteClient,
  setClientStage,
  addDocument,
  updateDocument,
  deleteDocument,
  setDocumentStatus,
  addUniversity,
  updateUniversity,
  deleteUniversity,
  addTask,
  updateTask,
  deleteTask,
  fetchCalendarEvents,
  addCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  addNotification,
  seedDatabase,
  type Client,
  type ClientInput,
  type Document,
  type University,
  type Task,
  type CalendarEvent,
  type Notification,
  type Stage,
  type DocStatus,
} from "./database";

interface DataContextType {
  clients: Client[];
  isLoading: boolean;
  isError: boolean;
  refreshClients: () => void;
  createClient: (input: ClientInput) => Promise<Client | null>;
  updateClient: (id: string, patch: Partial<ClientInput>) => Promise<Client | null>;
  deleteClient: (id: string) => Promise<boolean>;
  setClientStage: (id: string, stage: Stage) => Promise<Client | null>;
  addDocument: (
    clientId: string,
    doc: Omit<Document, "id" | "client_id">,
  ) => Promise<Document | null>;
  updateDocument: (docId: string, patch: Partial<Document>) => Promise<Document | null>;
  deleteDocument: (docId: string) => Promise<boolean>;
  setDocumentStatus: (docId: string, status: DocStatus) => Promise<Document | null>;
  addUniversity: (
    clientId: string,
    u: Omit<University, "id" | "client_id">,
  ) => Promise<University | null>;
  updateUniversity: (uId: string, patch: Partial<University>) => Promise<University | null>;
  deleteUniversity: (uId: string) => Promise<boolean>;
  addTask: (clientId: string, t: Omit<Task, "id" | "client_id">) => Promise<Task | null>;
  updateTask: (taskId: string, patch: Partial<Task>) => Promise<Task | null>;
  deleteTask: (taskId: string) => Promise<boolean>;
  calendarEvents: CalendarEvent[];
  refreshCalendar: () => void;
  addCalendarEvent: (event: Omit<CalendarEvent, "id">) => Promise<CalendarEvent | null>;
  updateCalendarEvent: (id: string, patch: Partial<CalendarEvent>) => Promise<CalendarEvent | null>;
  deleteCalendarEvent: (id: string) => Promise<boolean>;
  notifications: Notification[];
  refreshNotifications: () => void;
  markNotificationRead: (id: string) => Promise<boolean>;
  markAllNotificationsRead: () => Promise<boolean>;
  addNotification: (n: Omit<Notification, "id" | "created_at">) => Promise<Notification | null>;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [seeded, setSeeded] = useState(false);

  useEffect(() => {
    seedDatabase().then(() => setSeeded(true));
  }, []);

  const clientsQuery = useQuery({
    queryKey: ["clients"],
    queryFn: fetchClients,
    enabled: seeded,
    staleTime: 1000 * 30,
  });

  const calendarQuery = useQuery({
    queryKey: ["calendar-events"],
    queryFn: fetchCalendarEvents,
    enabled: seeded,
    staleTime: 1000 * 30,
  });

  const notificationsQuery = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    enabled: seeded,
    staleTime: 1000 * 30,
  });

  const refreshClients = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["clients"] });
  }, [queryClient]);

  const refreshCalendar = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
  }, [queryClient]);

  const refreshNotifications = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  }, [queryClient]);

  const createClientMut = useMutation({
    mutationFn: createClient,
    onSuccess: () => {
      refreshClients();
      toast.success("Client created");
    },
    onError: () => toast.error("Failed to create client"),
  });

  const updateClientMut = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<ClientInput> }) =>
      updateClient(id, patch),
    onSuccess: () => {
      refreshClients();
      toast.success("Client updated");
    },
    onError: () => toast.error("Failed to update client"),
  });

  const deleteClientMut = useMutation({
    mutationFn: deleteClient,
    onSuccess: (success) => {
      if (success) {
        refreshClients();
        toast.success("Client deleted");
      }
    },
    onError: () => toast.error("Failed to delete client"),
  });

  const setClientStageMut = useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: Stage }) => setClientStage(id, stage),
    onSuccess: () => {
      refreshClients();
    },
    onError: () => toast.error("Failed to update stage"),
  });

  const addDocumentMut = useMutation({
    mutationFn: ({
      clientId,
      doc,
    }: {
      clientId: string;
      doc: Omit<Document, "id" | "client_id">;
    }) => addDocument(clientId, doc),
    onSuccess: () => {
      refreshClients();
      toast.success("Document added");
    },
    onError: () => toast.error("Failed to add document"),
  });

  const updateDocumentMut = useMutation({
    mutationFn: ({ docId, patch }: { docId: string; patch: Partial<Document> }) =>
      updateDocument(docId, patch),
    onSuccess: () => {
      refreshClients();
      toast.success("Document updated");
    },
    onError: () => toast.error("Failed to update document"),
  });

  const deleteDocumentMut = useMutation({
    mutationFn: deleteDocument,
    onSuccess: (success) => {
      if (success) {
        refreshClients();
        toast.success("Document deleted");
      }
    },
    onError: () => toast.error("Failed to delete document"),
  });

  const setDocumentStatusMut = useMutation({
    mutationFn: ({ docId, status }: { docId: string; status: DocStatus }) =>
      setDocumentStatus(docId, status),
    onSuccess: () => refreshClients(),
    onError: () => toast.error("Failed to update document status"),
  });

  const addUniversityMut = useMutation({
    mutationFn: ({ clientId, u }: { clientId: string; u: Omit<University, "id" | "client_id"> }) =>
      addUniversity(clientId, u),
    onSuccess: () => {
      refreshClients();
      toast.success("University added");
    },
    onError: () => toast.error("Failed to add university"),
  });

  const updateUniversityMut = useMutation({
    mutationFn: ({ uId, patch }: { uId: string; patch: Partial<University> }) =>
      updateUniversity(uId, patch),
    onSuccess: () => {
      refreshClients();
      toast.success("University updated");
    },
    onError: () => toast.error("Failed to update university"),
  });

  const deleteUniversityMut = useMutation({
    mutationFn: deleteUniversity,
    onSuccess: (success) => {
      if (success) {
        refreshClients();
        toast.success("University deleted");
      }
    },
    onError: () => toast.error("Failed to delete university"),
  });

  const addTaskMut = useMutation({
    mutationFn: ({ clientId, t }: { clientId: string; t: Omit<Task, "id" | "client_id"> }) =>
      addTask(clientId, t),
    onSuccess: () => {
      refreshClients();
      toast.success("Task created");
    },
    onError: () => toast.error("Failed to create task"),
  });

  const updateTaskMut = useMutation({
    mutationFn: ({ taskId, patch }: { taskId: string; patch: Partial<Task> }) =>
      updateTask(taskId, patch),
    onSuccess: () => {
      refreshClients();
      toast.success("Task updated");
    },
    onError: () => toast.error("Failed to update task"),
  });

  const deleteTaskMut = useMutation({
    mutationFn: deleteTask,
    onSuccess: (success) => {
      if (success) {
        refreshClients();
        toast.success("Task deleted");
      }
    },
    onError: () => toast.error("Failed to delete task"),
  });

  const addCalendarEventMut = useMutation({
    mutationFn: addCalendarEvent,
    onSuccess: () => {
      refreshCalendar();
      toast.success("Event added");
    },
    onError: () => toast.error("Failed to add event"),
  });

  const updateCalendarEventMut = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<CalendarEvent> }) =>
      updateCalendarEvent(id, patch),
    onSuccess: () => {
      refreshCalendar();
      toast.success("Event updated");
    },
    onError: () => toast.error("Failed to update event"),
  });

  const deleteCalendarEventMut = useMutation({
    mutationFn: deleteCalendarEvent,
    onSuccess: (success) => {
      if (success) {
        refreshCalendar();
        toast.success("Event deleted");
      }
    },
    onError: () => toast.error("Failed to delete event"),
  });

  const markNotificationReadMut = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => refreshNotifications(),
    onError: () => toast.error("Failed to mark notification read"),
  });

  const markAllNotificationsReadMut = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      refreshNotifications();
      toast.success("All notifications marked read");
    },
    onError: () => toast.error("Failed to mark all read"),
  });

  const addNotificationMut = useMutation({
    mutationFn: addNotification,
    onSuccess: () => refreshNotifications(),
    onError: () => toast.error("Failed to add notification"),
  });

  const value: DataContextType = {
    clients: clientsQuery.data ?? [],
    isLoading: clientsQuery.isLoading,
    isError: clientsQuery.isError,
    refreshClients,
    createClient: (input) => createClientMut.mutateAsync(input),
    updateClient: (id, patch) => updateClientMut.mutateAsync({ id, patch }),
    deleteClient: (id) => deleteClientMut.mutateAsync(id),
    setClientStage: (id, stage) => setClientStageMut.mutateAsync({ id, stage }),
    addDocument: (clientId, doc) => addDocumentMut.mutateAsync({ clientId, doc }),
    updateDocument: (docId, patch) => updateDocumentMut.mutateAsync({ docId, patch }),
    deleteDocument: (docId) => deleteDocumentMut.mutateAsync(docId),
    setDocumentStatus: (docId, status) => setDocumentStatusMut.mutateAsync({ docId, status }),
    addUniversity: (clientId, u) => addUniversityMut.mutateAsync({ clientId, u }),
    updateUniversity: (uId, patch) => updateUniversityMut.mutateAsync({ uId, patch }),
    deleteUniversity: (uId) => deleteUniversityMut.mutateAsync(uId),
    addTask: (clientId, t) => addTaskMut.mutateAsync({ clientId, t }),
    updateTask: (taskId, patch) => updateTaskMut.mutateAsync({ taskId, patch }),
    deleteTask: (taskId) => deleteTaskMut.mutateAsync(taskId),
    calendarEvents: calendarQuery.data ?? [],
    refreshCalendar,
    addCalendarEvent: (event) => addCalendarEventMut.mutateAsync(event),
    updateCalendarEvent: (id, patch) => updateCalendarEventMut.mutateAsync({ id, patch }),
    deleteCalendarEvent: (id) => deleteCalendarEventMut.mutateAsync(id),
    notifications: notificationsQuery.data ?? [],
    refreshNotifications,
    markNotificationRead: (id) => markNotificationReadMut.mutateAsync(id),
    markAllNotificationsRead: () => markAllNotificationsReadMut.mutateAsync(),
    addNotification: (n) => addNotificationMut.mutateAsync(n),
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
