/**
 * React Query Hooks - Exports centralisés
 *
 * Tous les custom hooks React Query de l'application
 */

// Jobs
export {
  useJobs,
  useMyJobs,
  useJob,
  useCreateJob,
  useUpdateJob,
  useDeleteJob,
} from './useJobs';

// Applications
export {
  useMyApplications,
  useApplication,
  useApplicationsCount,
  useApplyToJob,
  useWithdrawApplication,
  useUpdateApplicationStatus,
  useUpdateApplicationNotes,
} from './useApplications';

// Candidates
export {
  useCandidateProfile,
  useCandidateCVs,
  useUpdateCandidateProfile,
  useDeleteCV,
  useAddExperience,
  useUpdateExperience,
  useDeleteExperience,
  useAddEducation,
  useUpdateEducation,
  useDeleteEducation,
  useAddSkill,
  useUpdateSkill,
  useDeleteSkill,
} from './useCandidates';

// Dashboard
export {
  useDashboardStats,
  useDashboardActivities,
  useCompanyStats,
} from './useDashboard';

// Notifications
export {
  useNotifications,
  useUnreadNotificationsCount,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useDeleteNotification,
} from './useNotifications';

// Admin
export {
  useAdminStats,
  useAdminUsers,
  useAdminEmployers,
  useAdminJobs,
  useToggleUserActivation,
  useDeleteUser,
} from './useAdmin';

// Auth (NextAuth)
export { useAuth, useUser } from './useNextAuth';
