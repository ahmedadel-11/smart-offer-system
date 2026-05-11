// =====================
// Enums
// =====================

export enum PanelItemType {
  Incoming = 1,
  Outgoing = 2,
  Enclosure = 3,
  BusbarAndCables = 4
}

export const PanelItemTypeLabels: Record<PanelItemType, string> = {
  [PanelItemType.Incoming]: 'Incoming',
  [PanelItemType.Outgoing]: 'Outgoing',
  [PanelItemType.Enclosure]: 'Enclosure',
  [PanelItemType.BusbarAndCables]: 'Busbar & Cables'
};

export const PanelItemTypeDescriptions: Record<PanelItemType, string> = {
  [PanelItemType.Incoming]: 'Main supply, switches, incoming components',
  [PanelItemType.Outgoing]: 'Circuit breakers, contactors, protection devices',
  [PanelItemType.Enclosure]: 'Panel enclosure, mounting plates, accessories',
  [PanelItemType.BusbarAndCables]: 'Busbars, connections, cables and wiring'
};

export const PanelItemTypeColors: Record<PanelItemType, string> = {
  [PanelItemType.Incoming]: '#4CAF50',      // Green
  [PanelItemType.Outgoing]: '#2196F3',      // Blue
  [PanelItemType.Enclosure]: '#FF9800',     // Orange
  [PanelItemType.BusbarAndCables]: '#9C27B0' // Purple
};

// =====================
// Entity Status (Enhanced)
// =====================

export enum EntityStatus {
  Draft = 1,
  InProgress = 2,
  UnderReview = 3,
  Approved = 4,
  Rejected = 5,
  Completed = 6,
  Archived = 7
}

export const EntityStatusLabels: Record<EntityStatus, string> = {
  [EntityStatus.Draft]: 'Draft',
  [EntityStatus.InProgress]: 'In Progress',
  [EntityStatus.UnderReview]: 'Under Review',
  [EntityStatus.Approved]: 'Approved',
  [EntityStatus.Rejected]: 'Rejected',
  [EntityStatus.Completed]: 'Completed',
  [EntityStatus.Archived]: 'Archived',
};

export const EntityStatusColors: Record<EntityStatus, string> = {
  [EntityStatus.Draft]: '#9E9E9E',
  [EntityStatus.InProgress]: '#2196F3',
  [EntityStatus.UnderReview]: '#FF9800',
  [EntityStatus.Approved]: '#4CAF50',
  [EntityStatus.Rejected]: '#F44336',
  [EntityStatus.Completed]: '#009688',
  [EntityStatus.Archived]: '#607D8B',
};

// =====================
// Collaboration Types
// =====================

export interface ChangeStatusDto {
  newStatus: EntityStatus;
}

export interface AddCollaboratorDto {
  userId: string;
  roleInProject?: string;
}

export interface CollaboratorDto {
  id: number;
  userId: string;
  userName: string | null;
  roleInProject: string | null;
  addedAt: string;
}

// =====================
// Material Interfaces
// =====================

export interface Material {
  materialId: number;
  itemCode: string;
  description: string;
  brand: string;
  ratedCurrent: string | null;
  isc: string | null;
  noOfPoles: number | null;
  reference: string | null;
  basePrice: number;
  defaultDiscount: number;
  category: string;
  isActive: boolean;
}

export interface CreateMaterial {
  itemCode: string;
  description: string;
  brand: string;
  ratedCurrent?: string;
  isc?: string;
  noOfPoles?: number;
  reference?: string;
  basePrice: number;
  defaultDiscount: number;
  category: string;
}

export interface UpdateMaterial {
  itemCode: string;
  description: string;
  brand: string;
  ratedCurrent?: string;
  isc?: string;
  noOfPoles?: number;
  reference?: string;
  basePrice: number;
  defaultDiscount: number;
  category: string;
  isActive: boolean;
}

export interface MaterialSearchFilters {
  searchTerm?: string;
  category?: string;
  brand?: string;
  description?: string;
  ratedCurrent?: string;
  isc?: string;
  reference?: string;
  isActive?: boolean;
}

// =====================
// Package Interfaces
// =====================

export interface PackageItemDto {
  packageItemId: number;
  packageId: number;
  materialId: number;
  quantity: number;
  materialCode?: string | null;
  materialDescription?: string | null;
  materialBasePrice?: number | null;
  material?: Material | null;
}

export interface PackageDto {
  packageId: number;
  packageName: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
  createdByUserId: string | null;
  updatedByUserId: string | null;
  items: PackageItemDto[];
}

export interface CreatePackageItemRequest {
  materialId: number;
  quantity: number;
}

export interface CreatePackageRequest {
  packageName: string;
  description?: string;
  items: CreatePackageItemRequest[];
}

export interface UpdatePackageRequest {
  packageName: string;
  description?: string;
  items: CreatePackageItemRequest[];
}

// =====================
// Project Interfaces
// =====================

export interface Project {
  projectId: number;
  projectName: string;
  customer: string;
  currency: string;
  defaultMargin: number;
  createdAt: string;
  updatedAt: string | null;
  status: EntityStatus;
  notes: string | null;
  panelCount: number;
  createdByUserId: string | null;
  isLocked: boolean;
  lockedAt: string | null;
  lockedByUserId: string | null;
}

export interface ProjectDetail extends Project {
  panels: PanelDetail[];
  collaborators: CollaboratorDto[];
  summary: ProjectSummaryDetail;
  totalItems: number;
  totalCost: number;
  totalPrice: number;
}

export interface ProjectSummaryDetail {
  totalPanels: number;
  totalItems: number;
  totalCost: number;
  totalPrice: number;
  totalMarginAmount: number;
}

export interface ProjectSummary {
  projectId: number;
  projectName: string;
  customer: string;
  panelCount: number;
  totalItems: number;
  totalCost: number;
  totalPrice: number;
  currency: string;
}

export interface CreateProject {
  projectName: string;
  customer: string;
  currency: string;
  defaultMargin?: number;
  numberOfPanels: number;
  notes?: string;
}

export interface UpdateProject {
  projectName: string;
  customer: string;
  currency: string;
  defaultMargin?: number;
  createdByUserId?: string;
  notes?: string;
}

export interface CurrencyRateDto {
  currencyCode: string;
  rateToEgp: number;
  updatedAt: string;
  updatedByUserId?: string | null;
}

export interface UpdateCurrencyRateDto {
  rateToEgp: number;
}

// =====================
// Panel Interfaces
// =====================

export interface Panel {
  panelId: number;
  projectId: number;
  panelName: string;
  description: string | null;
  margin: number;
  overrideMargin: number | null;
  status: EntityStatus;
  itemCount: number;
  createdByUserId: string | null;
  ownerId: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface PanelDetail extends Panel {
  items: PanelItem[];
  incomingItems: PanelItem[];
  outgoingItems: PanelItem[];
  enclosureItems: PanelItem[];
  busbarAndCablesItems: PanelItem[];
  collaborators: CollaboratorDto[];
  summary: PanelSummary;
}

export interface PanelSummary {
  totalItems: number;
  totalCost: number;
  totalPrice: number;
  marginAmount: number;
}

export interface CreatePanel {
  panelName: string;
  projectId: number;
  margin?: number;
  overrideMargin?: number;
}

export interface UpdatePanel {
  panelName: string;
  margin: number;
  overrideMargin?: number;
}

// =====================
// Panel Item Interfaces
// =====================

export interface PanelItem {
  panelItemId: number;
  panelId: number;
  materialId: number;
  itemCode: string;
  description: string;
  brand: string;
  ratedCurrent: string | null;
  isc: string | null;
  noOfPoles: number | null;
  reference: string | null;
  quantity: number;
  itemType: PanelItemType | null;
  basePrice: number;
  discount: number;
  extraDiscount: number;
  unitCost: number;
  totalCost: number;
  margin: number;
  totalPrice: number;
  notes: string | null;
  // Legacy compatibility
  unitPrice?: number;
  sortOrder?: number;
  poles?: number | null;
}

export interface CreatePanelItem {
  panelId: number;
  materialId: number;
  quantity: number;
  itemType?: PanelItemType;
  overrideDiscount?: number;
  overrideMargin?: number;
  extraDiscount?: number;
  notes?: string;
}

export interface UpdatePanelItem {
  quantity: number;
  itemType?: PanelItemType;
  overrideDiscount?: number;
  overrideMargin?: number;
  extraDiscount?: number;
  notes?: string;
}

// =====================
// Enclosure Interfaces
// =====================

export interface EnclosureComponent {
  enclosureComponentId: number;
  reference?: string | null;
  description: string;
  brand?: string | null;
  quantity: number;
  unitPriceList: number;
  totalPriceList: number;
  qty: number;
  notesName?: string | null;
}

export interface CreateEnclosureComponent {
  reference?: string | null;
  description: string;
  brand?: string | null;
  quantity: number;
  unitPriceList: number;
  totalPriceList: number;
  qty: number;
  notesName?: string | null;
}

export interface EnclosureComponentSnapshot {
  panelEnclosureComponentId: number;
  enclosureComponentId?: number | null;
  reference?: string | null;
  description: string;
  brand?: string | null;
  quantity: number;
  unitPriceList: number;
  totalPriceList: number;
  qty: number;
  notesName?: string | null;
}

export interface PanelEnclosure {
  panelEnclosureId: number;
  panelItemId: number;
  isCustom: boolean;
  totalPrice: number;
  components: EnclosureComponentSnapshot[];
}

export interface CreateCustomEnclosureRequest {
  panelId: number;
  panelItemId?: number | null;
  components: EnclosureComponentSnapshot[];
}

export interface UpdateCustomEnclosureRequest {
  isCustom: boolean;
  components: EnclosureComponentSnapshot[];
}

export interface CustomEnclosureState {
  panelId: number;
  panelItemId?: number | null;
  components: EnclosureComponentSnapshot[];
  totalPrice: number;
  isDirty: boolean;
}

export type EnclosureMode = 'ready' | 'custom' | null;

// =====================
// Busbar & Cables Worksheet
// =====================

export interface BusbarCablesMainBusbarRowInput {
  size: string;
  bars: number;
  poles: number;
  vrMeters: number;
  horizontalMeters: number;
}

export interface BusbarCablesNeutralEarthRowInput {
  size: string;
  bars: number;
  neutralMeters: number;
  earthMeters: number;
}

export interface BusbarCablesConnectionRowInput {
  size: string;
  bars: number;
  poles: number;
  customMeters: number;
  bbMeters: number;
}

export interface BusbarCablesMainBusbarRowResult extends BusbarCablesMainBusbarRowInput {
  totalMeters: number;
  totalKg: number;
}

export interface BusbarCablesNeutralEarthRowResult extends BusbarCablesNeutralEarthRowInput {
  totalMeters: number;
  totalKg: number;
}

export interface BusbarCablesConnectionRowResult extends BusbarCablesConnectionRowInput {
  totalMeters: number;
  totalKg: number;
}

export interface BusbarCablesWorksheetInput {
  mainBusbar: BusbarCablesMainBusbarRowInput[];
  neutralEarthBar: BusbarCablesNeutralEarthRowInput[];
  connection: BusbarCablesConnectionRowInput[];
}

export interface BusbarCablesWorksheetResult {
  mainBusbar: BusbarCablesMainBusbarRowResult[];
  neutralEarthBar: BusbarCablesNeutralEarthRowResult[];
  connection: BusbarCablesConnectionRowResult[];
  mainBusbarTotalKg: number;
  neutralEarthTotalKg: number;
  connectionTotalKg: number;
  grandTotalKg: number;
}

export interface BusbarCablesPricingSnapshot {
  defaultPricePerKg: number;
  appliedPricePerKg: number;
  priceSource: 'Default' | 'Manual' | string;
  totalKg: number;
  totalCost: number;
}

export interface SaveBusbarCablesWithPriceRequest {
  input: BusbarCablesWorksheetInput;
  useDefaultPrice: boolean;
  manualPricePerKg?: number;
}

export interface BusbarCablesWorksheetPayload {
  panelItemId: number;
  panelId: number;
  input: BusbarCablesWorksheetInput;
  result: BusbarCablesWorksheetResult;
  pricing?: BusbarCablesPricingSnapshot;
}

// =====================
// Import Interfaces
// =====================

export interface ImportResult {
  totalRows: number;
  successfulImports: number;
  failedImports: number;
  errors: string[];
  message: string;
}

// =====================
// Customer & Team Interfaces
// =====================

export interface Customer {
  customerId: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
}

export interface TeamMember {
  userId: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

// =====================
// Offer Interfaces
// =====================

export interface CommercialOffer {
  projectId: number;
  projectName: string;
  customer: string;
  currency: string;
  createdAt: string;
  validUntil: string;
  panels: CommercialOfferPanel[];
  subtotal: number;
  discount: number;
  discountPercentage: number;
  total: number;
  notes: string;
}

export interface CommercialOfferPanel {
  panelName: string;
  itemCount: number;
  margin: number;
  totalPrice: number;
}

export interface TechnicalOffer {
  projectId: number;
  projectName: string;
  customer: string;
  createdAt: string;
  panels: TechnicalOfferPanel[];
  specifications: ProjectSpecifications;
}

export interface TechnicalOfferPanel {
  panelName: string;
  incoming: TechnicalOfferItem[];
  outgoing: TechnicalOfferItem[];
  enclosure: TechnicalOfferItem[];
  busbarAndCables: TechnicalOfferItem[];
}

export interface TechnicalOfferItem {
  itemCode: string;
  description: string;
  brand: string;
  ratedCurrent: number | null;
  isc: number | null;
  poles: number | null;
  quantity: number;
}

export interface ProjectSpecifications {
  voltage: string;
  frequency: string;
  shortCircuitRating: string;
  protectionRating: string;
  standards: string[];
}

// =====================
// Material List & Pricing Interfaces
// =====================

export interface PanelMaterialListItem {
  materialId: number;
  itemCode: string;
  description: string;
  brand: string;
  category: string;
  quantity: number;
  basePrice: number;
  discount: number;
  unitCost: number;
  totalCost: number;
  totalPrice: number;
}

export interface PanelMaterialList {
  panelId: number;
  panelName: string;
  materials: PanelMaterialListItem[];
  totalQuantity: number;
  totalCost: number;
  totalPrice: number;
}

export interface ProjectMaterialListPanel {
  panelId: number;
  panelName: string;
  materials: PanelMaterialListItem[];
  totalQuantity: number;
  totalCost: number;
  totalPrice: number;
}

export interface ProjectMaterialList {
  projectId: number;
  projectName: string;
  customer: string;
  currency: string;
  panels: ProjectMaterialListPanel[];
  consolidatedMaterials: PanelMaterialListItem[];
  totalQuantity: number;
  totalCost: number;
  totalPrice: number;
}

export interface ProjectTotalPrice {
  projectId: number;
  projectName: string;
  currency: string;
  totalPanels: number;
  totalItems: number;
  totalCost: number;
  totalMarginAmount: number;
  totalPrice: number;
}

// =====================
// Dashboard Interfaces
// =====================

export interface DashboardStats {
  totalProjects: number;
  draftProjects: number;
  inProgressProjects: number;
  completedProjects: number;
  archivedProjects: number;
  totalActiveOffersValue: number;
  totalPanels: number;
  totalMaterials: number;
}

export interface RecentActivityItem {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entityType: string;
  entityId: string;
  timestamp: string;
}

// =====================
// Drag & Drop Interfaces
// =====================

export interface DragItem {
  id: string;
  panelItemId: number;
  itemCode: string;
  description: string;
  quantity: number;
  unitPrice: number;
  currentType: PanelItemType | null;
}

export interface DropZone {
  id: string;
  type: PanelItemType | null;
  label: string;
  description: string;
  items: DragItem[];
}

export interface DragDropState {
  unassigned: DragItem[];
  incoming: DragItem[];
  outgoing: DragItem[];
  enclosure: DragItem[];
  busbarAndCables: DragItem[];
  activeId: string | null;
}

export type ZoneType = 'unassigned' | 'incoming' | 'outgoing' | 'enclosure' | 'busbarAndCables';

// =====================
// UI State Interfaces
// =====================

export interface LoadingState {
  isLoading: boolean;
  loadingMessage?: string;
}

export interface ErrorState {
  hasError: boolean;
  errorMessage?: string;
  errorCode?: string;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface TableState<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  pagination: PaginationState;
  selectedIds: (string | number)[];
  sortColumn: keyof T | null;
  sortDirection: 'asc' | 'desc';
  filters: Partial<T>;
}

// =====================
// Utility Types
// =====================

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
}

export interface SelectOption<T = string> {
  value: T;
  label: string;
  disabled?: boolean;
  description?: string;
}

export interface TabConfig {
  id: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
  disabled?: boolean;
}

// =====================
// Offer Data Interfaces
// =====================

export interface OfferData {
  projectId: number;
  projectName: string;
  customer: string;
  currency: string;
  createdAt: string;
  validUntil: string;
  panels: PanelOfferData[];
  subtotal: number;
  margin: number;
  total: number;
  notes: string;
}

export interface PanelOfferData {
  panelId: number;
  panelName: string;
  items: OfferItemData[];
  subtotal: number;
  margin: number;
  total: number;
}

export interface OfferItemData {
  itemCode: string;
  description: string;
  brand: string;
  ratedCurrent: number | null;
  isc: number | null;
  poles: number | null;
  reference: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

// =====================
// Technical & Commercial Offer DTOs (API Response Models)
// =====================

/**
 * Represents the core container for the technical offer.
 * Returned by GET /api/Projects/{id}/technical-offer
 */
export interface TechnicalOfferDto {
  projectName: string;
  customer: string;
  panels: TechnicalOfferPanelDto[];
}

/**
 * Represents technical data grouped by panel.
 */
export interface TechnicalOfferPanelDto {
  panelName: string;
  items: TechnicalOfferItemDto[];
}

/**
 * Represents individual material items with their technical specifications.
 */
export interface TechnicalOfferItemDto {
  itemCode: string;
  description: string;
  brand?: string | null;
  ratedCurrent?: string | null;
  isc?: string | null;
  poles?: number | null;
  reference?: string | null;
  quantity: number;
}

/**
 * Represents the core financial and commercial summary.
 * Returned by GET /api/Projects/{id}/commercial-offer
 */
export interface CommercialOfferDto {
  projectName: string;
  customer: string;
  currency: string;
  date: string;
  status: string;
  panels: CommercialOfferPanelDto[];
  grandTotalItems: number;
  grandTotalCost: number;
  grandTotalMargin: number;
  grandTotalPrice: number;
}

/**
 * Represents the commercial costings associated with an individual panel.
 */
export interface CommercialOfferPanelDto {
  name: string;
  items: number;
  totalCost: number;
  marginAmount: number;
  totalPrice: number;
}

// =====================
// Authentication & RBAC Types
// =====================

export interface LoginRequest {
  emailOrUsername: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  expiresAt: string;
  user: UserDto;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ResetPasswordRequest {
  userId: string;
  newPassword: string;
}

// =====================
// User Types
// =====================

export interface UserDto {
  id: string;
  fullName: string;
  email: string;
  username: string;
  mobileNumber?: string | null;
  logoOrWatermark?: string | null;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  roles: string[];
  permissions: string[];
}

export interface CreateUserDto {
  fullName: string;
  email: string;
  username: string;
  password: string;
  mobileNumber?: string;
  logoOrWatermark?: string;
  isActive: boolean;
  roleIds: string[];
}

export interface UpdateUserDto {
  fullName: string;
  email: string;
  username: string;
  mobileNumber?: string;
  logoOrWatermark?: string;
  isActive: boolean;
}

export interface AssignRolesDto {
  roleIds: string[];
}

export interface SetUserPermissionOverrideDto {
  permissionId: string;
  isGranted: boolean;
}

export interface UserPermissionOverrideDto {
  permissionId: string;
  permissionName: string;
  permissionCategory: string;
  isGranted: boolean;
  assignedAt: string;
  assignedBy?: string | null;
}

// =====================
// Role Types
// =====================

export interface RoleDto {
  id: string;
  name: string;
  description: string | null;
  isSystemRole: boolean;
  createdAt: string;
  permissions: string[];
}

export interface CreateRoleDto {
  name: string;
  description?: string;
  permissionIds: string[];
}

export interface UpdateRoleDto {
  name: string;
  description?: string;
}

export interface UpdateSystemRoleDto {
  description?: string;
  permissionIds: string[];
}

export interface AssignPermissionsDto {
  permissionIds: string[];
}

// =====================
// Permission Types
// =====================

export interface PermissionDto {
  id: string;
  name: string;
  description: string | null;
  category: string;
  createdAt: string;
}

export interface CreatePermissionDto {
  name: string;
  description?: string;
  category: string;
}

export interface UpdatePermissionDto {
  name: string;
  description?: string;
  category: string;
}

// =====================
// Audit Log Types
// =====================

export interface AuditLogDto {
  id: string;
  userId: string | null;
  userName: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  oldValues: string | null;
  newValues: string | null;
  ipAddress: string | null;
  timestamp: string;
}

export interface AuditLogFilter {
  userId?: string;
  action?: string;
  entityType?: string;
  startDate?: string;
  endDate?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

// =====================
// Auth Context Type
// =====================

export interface AuthContextType {
  user: UserDto | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (request: LoginRequest) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  setCurrentUser: (user: UserDto | null) => void;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  isSuperAdmin: boolean;
  isManagerOrAbove: boolean;
}

// =====================
// RBAC Color Maps
// =====================

export const RoleColors: Record<string, string> = {
  SuperAdmin: '#9C27B0',
  TenderingManager: '#2196F3',
  TenderingEngineer: '#009688',
};

export const PermissionCategoryColors: Record<string, string> = {
  UserManagement: '#E91E63',
  RoleManagement: '#9C27B0',
  PermissionManagement: '#673AB7',
  Projects: '#3F51B5',
  Panels: '#2196F3',
  Pricing: '#FF9800',
  Materials: '#4CAF50',
  Offers: '#00BCD4',
  Package: '#795548',
  System: '#607D8B',
};
