/**
 * Centralized Color Constants
 * Single source of truth for all color definitions across the application
 */

import { PanelItemType, EntityStatus } from '../types';

// Panel Item Type Colors (Hex)
export const PANEL_ITEM_TYPE_COLORS: Record<PanelItemType, string> = {
  [PanelItemType.Incoming]: '#4CAF50',
  [PanelItemType.Outgoing]: '#2196F3',
  [PanelItemType.Enclosure]: '#FF9800',
  [PanelItemType.BusbarAndCables]: '#9C27B0',
} as const;

// Entity Status Colors
export const ENTITY_STATUS_COLORS: Record<EntityStatus, string> = {
  [EntityStatus.Draft]: '#9E9E9E',
  [EntityStatus.InProgress]: '#2196F3',
  [EntityStatus.UnderReview]: '#FF9800',
  [EntityStatus.Approved]: '#4CAF50',
  [EntityStatus.Rejected]: '#F44336',
  [EntityStatus.Completed]: '#009688',
  [EntityStatus.Archived]: '#607D8B',
} as const;

// Material Category Colors
export const MATERIAL_CATEGORY_COLORS: Record<string, string> = {
  electrical: '#2196F3',
  mechanical: '#F44336',
  structural: '#FF9800',
  finishing: '#9C27B0',
  lighting: '#FFC107',
  plumbing: '#00BCD4',
  hvac: '#4CAF50',
  security: '#E91E63',
  other: '#757575',
} as const;

// Status Badge Colors (used in UI components)
export const STATUS_BADGE_COLORS = {
  success: {
    main: '#4CAF50',
    light: '#E8F5E9',
    border: '#A5D6A7',
  },
  error: {
    main: '#F44336',
    light: '#FFEBEE',
    border: '#EF9A9A',
  },
  warning: {
    main: '#FFC107',
    light: '#FFF3E0',
    border: '#FFE0B2',
  },
  info: {
    main: '#2196F3',
    light: '#E3F2FD',
    border: '#90CAF9',
  },
  neutral: {
    main: '#9E9E9E',
    light: '#F5F5F5',
    border: '#BDBDBD',
  },
} as const;

// Priority Level Colors
export const PRIORITY_COLORS: Record<'high' | 'medium' | 'low', string> = {
  high: '#F44336',
  medium: '#FFC107',
  low: '#4CAF50',
} as const;

// User Role Colors
export const ROLE_COLORS: Record<string, string> = {
  admin: '#D32F2F',
  manager: '#1976D2',
  user: '#388E3C',
  viewer: '#7B1FA2',
} as const;

/**
 * Get color for panel item type
 * @param type PanelItemType
 * @returns Hex color string
 */
export const getPanelItemTypeColor = (type: PanelItemType): string => {
  return PANEL_ITEM_TYPE_COLORS[type] || '#757575';
};

/**
 * Get color for entity status
 * @param status EntityStatus
 * @returns Hex color string
 */
export const getEntityStatusColor = (status: EntityStatus): string => {
  return ENTITY_STATUS_COLORS[status] || '#757575';
};

/**
 * Get color for material category
 * @param category Category name
 * @returns Hex color string
 */
export const getMaterialCategoryColor = (category: string): string => {
  return MATERIAL_CATEGORY_COLORS[category.toLowerCase()] || '#757575';
};
