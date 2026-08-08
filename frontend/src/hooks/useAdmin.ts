import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, apiFetchPaginated, qs } from "@/lib/api";
import type {
  AdminUser,
  ActivityLog,
  AnalyticsOverview,
  AttendanceRecord,
  Blog,
  DashboardStats,
  DuplicateGroup,
  Job,
  JobApplication,
  KanbanColumn,
  Lead,
  LeadImportResult,
  LeadNote,
  LeadStats,
  MediaAsset,
  NewsletterSubscriber,
  Notification,
  PayrollSummary,
  Permission,
  ProjectEstimate,
  RoleDoc,
  SeoSetting,
  SettingDoc,
  SettingsMap,
  Task,
  TaskStats,
  TeamAttendanceRow,
  TodayAttendance,
} from "@/types";

// ---------- Auth ----------
export const authKeys = { me: ["auth", "me"] as const, users: ["auth", "users"] as const };

export function useMe() {
  return useQuery({
    queryKey: authKeys.me,
    queryFn: () => api.get<{ user: AdminUser }>("/api/v1/auth/me"),
    retry: false,
  });
}

export function useAdminUsers() {
  return useQuery({ queryKey: authKeys.users, queryFn: () => api.get<AdminUser[]>("/api/v1/auth/users") });
}

export function useLogin() {
  return useMutation({
    mutationFn: (body: { email: string; password: string }) =>
      api.post<{
        accessToken?: string;
        user?: AdminUser;
        requiresTwoFactor?: boolean;
        pendingToken?: string;
      }>("/api/v1/auth/login", body, { auth: false }),
  });
}

export function useVerify2FA() {
  return useMutation({
    mutationFn: (body: { code: string; pendingToken: string }) =>
      api.post<{ accessToken: string; user: AdminUser }>("/api/v1/auth/login/2fa", body, { auth: false }),
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { name: string; email: string; password: string; role: string; phone?: string; isActive?: boolean }) =>
      api.post<{ user: AdminUser }>("/api/v1/auth/users", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: authKeys.users }),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<{ name: string; email: string; password: string; role: string; phone: string; isActive: boolean }> }) =>
      api.put<{ user: AdminUser }>(`/api/v1/auth/users/${id}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: authKeys.users }),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<{ message: string }>(`/api/v1/auth/users/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: authKeys.users }),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (body: { currentPassword: string; newPassword: string }) =>
      api.post<{ message: string }>("/api/v1/auth/change-password", body),
  });
}

export function useSetup2FA() {
  return useMutation({
    mutationFn: () => api.post<{ secret: string; qr: string }>("/api/v1/auth/2fa/setup"),
  });
}

export function useEnable2FA() {
  return useMutation({
    mutationFn: (code: string) => api.post<{ message: string }>("/api/v1/auth/2fa/enable", { code }),
  });
}

export function useDisable2FA() {
  return useMutation({
    mutationFn: (code: string) => api.post<{ message: string }>("/api/v1/auth/2fa/disable", { code }),
  });
}

// ---------- Dashboard ----------
export const dashboardKeys = { stats: ["admin", "dashboard"] as const, analytics: (d: number) => ["admin", "analytics", d] as const, activity: (p: number) => ["admin", "activity", p] as const };

export function useDashboardStats() {
  return useQuery({ queryKey: dashboardKeys.stats, queryFn: () => api.get<DashboardStats>("/api/v1/admin/dashboard") });
}

export function useAnalytics(days = 30) {
  return useQuery({ queryKey: dashboardKeys.analytics(days), queryFn: () => api.get<AnalyticsOverview>(`/api/v1/analytics/overview${qs({ days })}`) });
}

export function useActivityLogs(params: { page?: number; q?: string; action?: string } = {}) {
  return useQuery({
    queryKey: dashboardKeys.activity(params.page || 1),
    queryFn: () => apiFetchPaginated<ActivityLog>(`/api/v1/admin/activity${qs(params)}`),
  });
}

// ---------- Leads (CRM) ----------
export const leadKeys = {
  list: (p: Record<string, string>) => ["admin", "leads", p] as const,
  detail: (id: string) => ["admin", "leads", id] as const,
  kanban: ["admin", "leads", "kanban"] as const,
  stats: ["admin", "leads", "stats"] as const,
  duplicates: ["admin", "leads", "duplicates"] as const,
};

export function useLeads(params: Record<string, string> = {}) {
  return useQuery({ queryKey: leadKeys.list(params), queryFn: () => apiFetchPaginated<Lead>(`/api/v1/admin/leads${qs(params)}`) });
}

export function useLead(id: string) {
  return useQuery({ queryKey: leadKeys.detail(id), queryFn: () => api.get<Lead>(`/api/v1/admin/leads/${id}`), enabled: Boolean(id) });
}

export function useCreateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<Lead>) => api.post<Lead>("/api/v1/admin/leads", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "leads"] }),
  });
}

export function useUpdateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<Lead> }) =>
      api.put<Lead>(`/api/v1/admin/leads/${id}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "leads"] }),
  });
}

export function useUpdateLeadStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch<Lead>(`/api/v1/admin/leads/${id}/status`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "leads"] }),
  });
}

export function useAssignLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, assignedTo }: { id: string; assignedTo: string }) =>
      api.patch<Lead>(`/api/v1/admin/leads/${id}/assign`, { assignedTo }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "leads"] }),
  });
}

export function useDeleteLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<{ message: string }>(`/api/v1/admin/leads/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "leads"] }),
  });
}

export function useLeadNotes() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: { body: string } }) =>
      api.post<LeadNote>(`/api/v1/admin/leads/${id}/notes`, body),
    onSuccess: (_data, vars) => qc.invalidateQueries({ queryKey: leadKeys.detail(vars.id) }),
  });
}

export function useDeleteLeadNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, noteId }: { id: string; noteId: string }) =>
      api.delete<{ message: string }>(`/api/v1/admin/leads/${id}/notes/${noteId}`),
    onSuccess: (_data, vars) => qc.invalidateQueries({ queryKey: leadKeys.detail(vars.id) }),
  });
}

export function useAddLeadTimeline() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: { action: string; description: string } }) =>
      api.post<Lead>(`/api/v1/admin/leads/${id}/timeline`, body),
    onSuccess: (_data, vars) => qc.invalidateQueries({ queryKey: leadKeys.detail(vars.id) }),
  });
}

export function useLeadKanban() {
  return useQuery({ queryKey: leadKeys.kanban, queryFn: () => api.get<KanbanColumn[]>("/api/v1/admin/leads/kanban") });
}

export function useLeadStats() {
  return useQuery({ queryKey: leadKeys.stats, queryFn: () => api.get<LeadStats>("/api/v1/admin/leads/stats") });
}

export function useLeadDuplicates() {
  return useQuery({ queryKey: leadKeys.duplicates, queryFn: () => api.get<DuplicateGroup[]>("/api/v1/admin/leads/duplicates") });
}

export function useMergeLeads() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ primaryId, secondaryIds }: { primaryId: string; secondaryIds: string[] }) =>
      api.post<{ message: string; lead: Lead }>("/api/v1/admin/leads/merge", { primaryId, secondaryIds }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "leads"] }),
  });
}

export function useImportLeads() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => {
      const fd = new FormData();
      fd.append("file", file);
      return api.upload<LeadImportResult>("/api/v1/admin/leads/import", fd);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "leads"] }),
  });
}

// ---------- Estimates ----------
export const estimateKeys = { list: (p: Record<string, string>) => ["admin", "estimates", p] as const };

export function useEstimates(params: Record<string, string> = {}) {
  return useQuery({ queryKey: estimateKeys.list(params), queryFn: () => apiFetchPaginated<ProjectEstimate>(`/api/v1/admin/estimates${qs(params)}`) });
}

export function useUpdateEstimate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: { status?: string; assignedTo?: string } }) =>
      api.patch<ProjectEstimate>(`/api/v1/admin/estimates/${id}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "estimates"] }),
  });
}

export function useDeleteEstimate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<{ message: string }>(`/api/v1/admin/estimates/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "estimates"] }),
  });
}

// ---------- Newsletter ----------
export const newsletterKeys = { list: ["admin", "subscribers"] as const };

export function useSubscribers() {
  return useQuery({ queryKey: newsletterKeys.list, queryFn: () => api.get<NewsletterSubscriber[]>("/api/v1/admin/subscribers") });
}

export function useDeleteSubscriber() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<{ message: string }>(`/api/v1/admin/subscribers/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: newsletterKeys.list }),
  });
}

// ---------- Entities (generic CRUD) ----------
export type EntityName = "service" | "portfolio" | "team" | "testimonial" | "faq" | "blog" | "career";

export const entityKeys = (entity: EntityName, params: Record<string, string> = {}) => ["admin", entity, params] as const;

export function useEntities<T>(entity: EntityName) {
  return useQuery({ queryKey: entityKeys(entity), queryFn: () => api.get<T[]>(`/api/v1/admin/${entity}`) });
}

export function useCreateEntity<T>() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ entity, body }: { entity: EntityName; body: unknown }) =>
      api.post<T>(`/api/v1/admin/${entity}`, body),
    onSuccess: (_data, vars) => qc.invalidateQueries({ queryKey: ["admin", vars.entity] }),
  });
}

export function useUpdateEntity<T>() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ entity, id, body }: { entity: EntityName; id: string; body: unknown }) =>
      api.put<T>(`/api/v1/admin/${entity}/${id}`, body),
    onSuccess: (_data, vars) => qc.invalidateQueries({ queryKey: ["admin", vars.entity] }),
  });
}

export function useDeleteEntity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ entity, id }: { entity: EntityName; id: string }) =>
      api.delete<{ message: string }>(`/api/v1/admin/${entity}/${id}`),
    onSuccess: (_data, vars) => qc.invalidateQueries({ queryKey: ["admin", vars.entity] }),
  });
}

// ---------- Blogs ----------
export const blogKeys = {
  list: (p: Record<string, string>) => ["admin", "blogs", p] as const,
  detail: (id: string) => ["admin", "blogs", id] as const,
};

export function useBlogs(params: Record<string, string> = {}) {
  return useQuery({ queryKey: blogKeys.list(params), queryFn: () => apiFetchPaginated<Blog>(`/api/v1/admin/blogs${qs(params)}`) });
}

export function useBlog(id: string) {
  return useQuery({ queryKey: blogKeys.detail(id), queryFn: () => api.get<Blog>(`/api/v1/admin/blogs/${id}`), enabled: Boolean(id) });
}

export function useCreateBlog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<Blog>) => api.post<Blog>("/api/v1/admin/blogs", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "blogs"] }),
  });
}

export function useUpdateBlog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<Blog> }) => api.put<Blog>(`/api/v1/admin/blogs/${id}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "blogs"] }),
  });
}

export function useDeleteBlog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<{ message: string }>(`/api/v1/admin/blogs/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "blogs"] }),
  });
}

// ---------- Careers ----------
export const careerKeys = {
  jobs: (p: Record<string, string>) => ["admin", "careers", "jobs", p] as const,
  applications: (p: Record<string, string>) => ["admin", "careers", "applications", p] as const,
};

export function useJobs(params: Record<string, string> = {}) {
  return useQuery({ queryKey: careerKeys.jobs(params), queryFn: () => api.get<Job[]>(`/api/v1/admin/careers${qs(params)}`) });
}

export function useCreateJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<Job>) => api.post<Job>("/api/v1/admin/careers/jobs", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "careers"] }),
  });
}

export function useUpdateJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<Job> }) => api.put<Job>(`/api/v1/admin/careers/jobs/${id}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "careers"] }),
  });
}

export function useDeleteJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<{ message: string }>(`/api/v1/admin/careers/jobs/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "careers"] }),
  });
}

export function useApplications(params: Record<string, string> = {}) {
  return useQuery({ queryKey: careerKeys.applications(params), queryFn: () => apiFetchPaginated<JobApplication>(`/api/v1/admin/careers/applications${qs(params)}`) });
}

export function useUpdateApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: { status?: string; notes?: string } }) =>
      api.patch<JobApplication>(`/api/v1/admin/careers/applications/${id}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "careers"] }),
  });
}

export function useDeleteApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<{ message: string }>(`/api/v1/admin/careers/applications/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "careers"] }),
  });
}

// ---------- Notifications ----------
export const notificationKeys = {
  list: (p: Record<string, string>) => ["admin", "notifications", p] as const,
};

export function useNotifications(params: Record<string, string> = {}) {
  return useQuery({ queryKey: notificationKeys.list(params), queryFn: () => apiFetchPaginated<Notification>(`/api/v1/admin/notifications${qs(params)}`) });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, read }: { id: string; read: boolean }) => api.patch<Notification>(`/api/v1/admin/notifications/${id}`, { read }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "notifications"] }),
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<{ message: string }>("/api/v1/admin/notifications/read-all"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "notifications"] }),
  });
}

export function useDeleteNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<{ message: string }>(`/api/v1/admin/notifications/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "notifications"] }),
  });
}

// ---------- Roles & Permissions ----------
export const roleKeys = {
  list: ["admin", "roles"] as const,
  permissions: ["admin", "permissions"] as const,
};

export function useRoles() {
  return useQuery({ queryKey: roleKeys.list, queryFn: () => api.get<RoleDoc[]>("/api/v1/admin/roles") });
}

export function useCreateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<RoleDoc>) => api.post<RoleDoc>("/api/v1/admin/roles", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: roleKeys.list }),
  });
}

export function useUpdateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<RoleDoc> }) => api.put<RoleDoc>(`/api/v1/admin/roles/${id}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: roleKeys.list }),
  });
}

export function useDeleteRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<{ message: string }>(`/api/v1/admin/roles/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: roleKeys.list }),
  });
}

export function usePermissions() {
  return useQuery({ queryKey: roleKeys.permissions, queryFn: () => api.get<Permission[]>("/api/v1/admin/permissions") });
}

// ---------- Settings & SEO ----------
export const settingsKeys = { list: ["admin", "settings"] as const, seo: ["admin", "seo"] as const };

export function useSettings() {
  return useQuery({ queryKey: settingsKeys.list, queryFn: () => api.get<SettingsMap>("/api/v1/admin/settings") });
}

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (updates: { group: string; key: string; value: unknown; type?: string; label?: string }[]) =>
      api.put<SettingDoc[]>("/api/v1/admin/settings", { updates }),
    onSuccess: () => qc.invalidateQueries({ queryKey: settingsKeys.list }),
  });
}

export function useSeoSettings() {
  return useQuery({ queryKey: settingsKeys.seo, queryFn: () => api.get<SeoSetting[]>("/api/v1/admin/seo") });
}

export function useUpsertSeo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: SeoSetting) => api.put<SeoSetting>("/api/v1/admin/seo", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: settingsKeys.seo }),
  });
}

// ---------- Media ----------
export const mediaKeys = { list: ["admin", "media"] as const };

export function useMedia() {
  return useQuery({ queryKey: mediaKeys.list, queryFn: () => api.get<MediaAsset[]>("/api/v1/admin/media") });
}

export function useUploadMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => {
      const fd = new FormData();
      fd.append("file", file);
      return api.upload<MediaAsset>("/api/v1/admin/media", fd);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: mediaKeys.list }),
  });
}

export function useDeleteMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<{ message: string }>(`/api/v1/admin/media/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: mediaKeys.list }),
  });
}

// ---------- Admin users (for assignment dropdowns) ----------
export const adminUserKeys = { list: ["admin", "contacts", "admin-users"] as const };

export function useAdminUserOptions() {
  return useQuery({
    queryKey: adminUserKeys.list,
    queryFn: () => api.get<AdminUser[]>("/api/v1/admin/contacts/admin-users"),
  });
}

// ---------- Clear cache ----------
export function useClearCache() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<{ message: string }>("/api/v1/admin/clear-cache"),
    onSuccess: () => {
      void qc.invalidateQueries();
    },
  });
}

// ---------- Exports ----------
export function exportUrl(type: string, format: "csv" | "excel" | "pdf", params: Record<string, string> = {}) {
  const token = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("c2d-admin-auth") || "{}")?.state?.token || "" : "";
  return `/api/v1/admin/export/${type}/${format}${qs({ ...params, token })}`;
}

// ---------- Tasks ----------
export const taskKeys = {
  my: (p: Record<string, string>) => ["admin", "tasks", "my", p] as const,
  myStats: ["admin", "tasks", "my", "stats"] as const,
  list: (p: Record<string, string>) => ["admin", "tasks", p] as const,
};

export function useMyTasks(params: Record<string, string> = {}) {
  return useQuery({ queryKey: taskKeys.my(params), queryFn: () => api.get<Task[]>(`/api/v1/admin/tasks/my${qs(params)}`) });
}

export function useMyTaskStats() {
  return useQuery({ queryKey: taskKeys.myStats, queryFn: () => api.get<TaskStats>("/api/v1/admin/tasks/my/stats") });
}

export function useAllTasks(params: Record<string, string> = {}) {
  return useQuery({ queryKey: taskKeys.list(params), queryFn: () => api.get<Task[]>(`/api/v1/admin/tasks${qs(params)}`) });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<Task> & { assignedTo: string }) => api.post<Task>("/api/v1/admin/tasks", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "tasks"] }),
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<Task> }) => api.put<Task>(`/api/v1/admin/tasks/${id}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "tasks"] }),
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<{ message: string }>(`/api/v1/admin/tasks/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "tasks"] }),
  });
}

export function useSubmitTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: { submissionNote?: string; submissionUrl?: string } }) =>
      api.post<Task>(`/api/v1/admin/tasks/${id}/submit`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "tasks"] }),
  });
}

export function useVerifyTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action, rejectionReason }: { id: string; action: "approve" | "reject"; rejectionReason?: string }) =>
      api.post<Task>(`/api/v1/admin/tasks/${id}/verify`, { action, rejectionReason }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "tasks"] }),
  });
}

// ---------- Attendance ----------
export const attendanceKeys = {
  my: (y: number, m: number) => ["admin", "attendance", "my", y, m] as const,
  myToday: ["admin", "attendance", "my", "today"] as const,
  list: (y: number, m: number) => ["admin", "attendance", y, m] as const,
  today: ["admin", "attendance", "today"] as const,
};

export function useMyAttendance(year: number, month: number) {
  return useQuery({
    queryKey: attendanceKeys.my(year, month),
    queryFn: () => api.get<AttendanceRecord[]>(`/api/v1/admin/attendance/my${qs({ year, month })}`),
  });
}

export function useMyToday() {
  return useQuery({ queryKey: attendanceKeys.myToday, queryFn: () => api.get<AttendanceRecord | null>("/api/v1/admin/attendance/my/today") });
}

export function useTeamAttendance(year: number, month: number) {
  return useQuery({
    queryKey: attendanceKeys.list(year, month),
    queryFn: () => api.get<TeamAttendanceRow[]>(`/api/v1/admin/attendance${qs({ year, month })}`),
  });
}

export function useTeamToday() {
  return useQuery({ queryKey: attendanceKeys.today, queryFn: () => api.get<TodayAttendance[]>("/api/v1/admin/attendance/today") });
}

// ---------- Payroll ----------
export const payrollKeys = {
  summary: (y: number, m: number) => ["admin", "payroll", y, m] as const,
};

export function usePayrollSummary(year: number, month: number) {
  return useQuery({
    queryKey: payrollKeys.summary(year, month),
    queryFn: () => api.get<PayrollSummary>(`/api/v1/admin/payroll/summary${qs({ year, month })}`),
  });
}
