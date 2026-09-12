/**
 * The dashboard's own data contract (Admin Step 4 brief §15, expanded
 * Prompt 10 §"Global Dashboard") — the UI never reads a domain repository
 * directly, only this shape, so wiring in a real module later means
 * changing `features/dashboard/data.ts`, never any component here.
 *
 * `value: null` means "this module doesn't exist/isn't tracked yet" —
 * deliberately distinct from `value: 0`, which means "the module exists
 * and currently has zero real records." Conflating the two would either
 * hide a genuinely real zero or imply a feature exists before it does.
 */
export interface DashboardMetric {
  value: number | null;
}

export interface DashboardData {
  // Company Overview
  totalProjects: DashboardMetric;
  activeProjects: DashboardMetric;
  completedProjects: DashboardMetric;
  totalUnits: DashboardMetric;
  assignedUnits: DashboardMetric;
  availableUnits: DashboardMetric;
  totalOwners: DashboardMetric;
  totalParking: DashboardMetric;
  assignedParking: DashboardMetric;

  // Financial Overview
  expectedCollections: DashboardMetric;
  collected: DashboardMetric;
  outstanding: DashboardMetric;
  overdueAmount: DashboardMetric;
  projectExpenses: DashboardMetric;
  materialCost: DashboardMetric;
  contractorCost: DashboardMetric;
  totalBudget: DashboardMetric;
  actualCost: DashboardMetric;

  // Construction
  constructionActiveProjects: DashboardMetric;
  averageConstructionProgress: DashboardMetric;
  delayedPhases: DashboardMetric;
  upcomingMilestones: DashboardMetric;
  overdueTasks: DashboardMetric;

  // Sales
  leads: DashboardMetric;
  activeBookings: DashboardMetric;
  completedSales: DashboardMetric;
  pendingSales: DashboardMetric;
  salesValue: DashboardMetric;

  // Inventory
  lowStockMaterials: DashboardMetric;
  outOfStockMaterials: DashboardMetric;
  recentPurchases: DashboardMetric;
  recentUsage: DashboardMetric;

  // Documents
  totalDocuments: DashboardMetric;
  documentsExpiringSoon: DashboardMetric;
  documentsExpired: DashboardMetric;

  // Alerts
  criticalAlerts: DashboardMetric;
  highAlerts: DashboardMetric;
  mediumAlerts: DashboardMetric;
  lowAlerts: DashboardMetric;
}
