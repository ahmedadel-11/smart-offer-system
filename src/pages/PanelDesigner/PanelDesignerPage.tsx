import React, { useState, useMemo, useRef, useCallback, useEffect, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Tabs,
  Tab,
  IconButton,
  Badge,
  Tooltip,
  Divider,
  TextField,
  Alert,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import AddIcon from '@mui/icons-material/Add';
import DescriptionIcon from '@mui/icons-material/Description';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import GroupIcon from '@mui/icons-material/Group';
import DeleteIcon from '@mui/icons-material/Delete';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import {
  PageHeader,
  Button,
  Loading,
  ItemTypeZone,
  getZoneConfig,
  MaterialSelectionModal,
  EntityStatusBadge,
  StatusChangeDropdown,
  ConfirmDialog,
  CollaboratorModal,
} from '../../components';
import { useAuth } from '../../contexts';
import {
  useProject,
  usePanel,
  useGroupedPanelItems,
  useMaterials,
  useCategories,
  useBrands,
  useAddMaterialToPanel,
  useUpdatePanelItem,
  useDeletePanelItem,
  useCreatePanel,
  useUpdatePanel,
  useDeletePanel,
  useDuplicatePanel,
  useChangePanelStatus,
  useAddPanelCollaborator,
  useRemovePanelCollaborator,
  useUsers,
  BUSBAR_CABLES_QUERY_KEY,
  useBusbarCablesWorksheet,
  usePackages,
  useProjectLockGuard,
} from '../../hooks';
import {
  PanelItem,
  PanelItemType,
  Material,
  PackageDto,
  ZoneType,
} from '../../types';
import { panelItemService, panelService } from '../../services';
import toast from 'react-hot-toast';

const BusbarCablesWorksheetModal = React.lazy(() =>
  import('../../components/panels/BusbarCablesWorksheetModal').then((module) => ({
    default: module.BusbarCablesWorksheetModal,
  }))
);

const BusbarCablesWorksheetCard = React.lazy(() =>
  import('../../components/panels/BusbarCablesWorksheetCard').then((module) => ({
    default: module.BusbarCablesWorksheetCard,
  }))
);

let busbarModalPreloadPromise: Promise<unknown> | null = null;
const preloadBusbarWorksheetModal = () => {
  if (!busbarModalPreloadPromise) {
    busbarModalPreloadPromise = import('../../components/panels/BusbarCablesWorksheetModal');
  }

  return busbarModalPreloadPromise;
};

const PACKAGE_NOTE_PREFIX = 'SMART_PACKAGE::';

interface PackageItemMetadata {
  packageInstanceId: string;
  packageId: number;
  packageName: string;
  packageItemId: number;
  packageItemQuantity: number;
  packageQuantity: number;
}

interface PackageGroupView {
  packageInstanceId: string;
  packageId: number;
  packageName: string;
  quantity: number;
  items: PanelItem[];
}

const createPackageInstanceId = (packageId: number) =>
  `${packageId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const createPackageNotes = (metadata: PackageItemMetadata) =>
  `${PACKAGE_NOTE_PREFIX}${JSON.stringify(metadata)}`;

const parsePackageNotes = (notes?: string | null): PackageItemMetadata | null => {
  if (!notes || !notes.startsWith(PACKAGE_NOTE_PREFIX)) {
    return null;
  }

  try {
    return JSON.parse(notes.slice(PACKAGE_NOTE_PREFIX.length)) as PackageItemMetadata;
  } catch {
    return null;
  }
};

export const PanelDesignerPage: React.FC = () => {
  const { id: projectId, panelId: panelIdStr } = useParams<{ id: string; panelId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const parsedProjectId = parseInt(projectId || '0');
  const parsedPanelId = parseInt(panelIdStr || '0');

  const [selectedPanelId, setSelectedPanelId] = useState(parsedPanelId);
  
  // Material selection modal state
  const [selectionModalOpen, setSelectionModalOpen] = useState(false);
  const [activeZone, setActiveZone] = useState<ZoneType | null>(null);
  const [duplicateConfirmOpen, setDuplicateConfirmOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isCollaboratorModalOpen, setIsCollaboratorModalOpen] = useState(false);
  const [busbarWorksheetOpen, setBusbarWorksheetOpen] = useState(false);

  // Data fetching
  const { data: project, isLoading: projectLoading } = useProject(parsedProjectId);
  const { data: panelDetail, isLoading: panelLoading } = usePanel(selectedPanelId);
  const { data: groupedItems, refetch: refetchItems } = useGroupedPanelItems(selectedPanelId);
  const { data: materials } = useMaterials();
  const { data: categories } = useCategories();
  const { data: brands } = useBrands();
  const { data: packages } = usePackages();
  const { data: busbarWorksheet } = useBusbarCablesWorksheet(selectedPanelId, busbarWorksheetOpen);
  const busbarSystemMaterial = useMemo(
    () => materials?.find((material) => material.itemCode === 'SYS-BUSBAR-CABLES'),
    [materials]
  );

  useEffect(() => {
    if (selectedPanelId <= 0) {
      return;
    }

    const prefetchBusbarResources = () => {
      preloadBusbarWorksheetModal();
      queryClient.prefetchQuery({
        queryKey: [BUSBAR_CABLES_QUERY_KEY, selectedPanelId],
        queryFn: () => panelItemService.getBusbarCablesWorksheet(selectedPanelId),
        staleTime: 5 * 60 * 1000,
      });
    };

    const idleCallback = (window as Window & { requestIdleCallback?: (callback: () => void) => number }).requestIdleCallback;

    if (typeof idleCallback === 'function') {
      const id = idleCallback(prefetchBusbarResources);
      return () => {
        if (typeof window.cancelIdleCallback === 'function') {
          window.cancelIdleCallback(id);
        }
      };
    }

    const timeoutId = window.setTimeout(prefetchBusbarResources, 200);
    return () => window.clearTimeout(timeoutId);
  }, [queryClient, selectedPanelId]);

  // Mutations
  const addMaterialMutation = useAddMaterialToPanel();
  const updateItemMutation = useUpdatePanelItem();
  const deleteItemMutation = useDeletePanelItem();
  const createPanelMutation = useCreatePanel();
  const updatePanelMutation = useUpdatePanel();
  const deletePanelMutation = useDeletePanel();
  const duplicatePanelMutation = useDuplicatePanel();
  const changePanelStatusMutation = useChangePanelStatus();
  const addPanelCollaboratorMutation = useAddPanelCollaborator();
  const removePanelCollaboratorMutation = useRemovePanelCollaborator();
  const { data: allUsers } = useUsers();
  const { user, hasRole, hasPermission } = useAuth();

  // Panel name editing state
  const [editingPanelId, setEditingPanelId] = useState<number | null>(null);
  const [editingPanelName, setEditingPanelName] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);

  // Mouse drag scrolling for panel tabs
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const container = tabsContainerRef.current?.querySelector('.MuiTabs-scroller') as HTMLElement | null;
    if (!container) return;
    isDragging.current = true;
    startX.current = e.pageX - container.offsetLeft;
    scrollLeft.current = container.scrollLeft;
    container.style.cursor = 'grabbing';
    container.style.userSelect = 'none';
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const container = tabsContainerRef.current?.querySelector('.MuiTabs-scroller') as HTMLElement | null;
    if (!container) return;
    e.preventDefault();
    const x = e.pageX - container.offsetLeft;
    const walk = (x - startX.current) * 1.5; // scroll speed multiplier
    container.scrollLeft = scrollLeft.current - walk;
  }, []);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
    const container = tabsContainerRef.current?.querySelector('.MuiTabs-scroller') as HTMLElement | null;
    if (container) {
      container.style.cursor = 'grab';
      container.style.userSelect = '';
    }
  }, []);

  useEffect(() => {
    // Set initial grab cursor on mount
    const container = tabsContainerRef.current?.querySelector('.MuiTabs-scroller') as HTMLElement | null;
    if (container) {
      container.style.cursor = 'grab';
    }
    // Cleanup: handle mouseup outside the container
    const handleGlobalMouseUp = () => {
      if (isDragging.current) handleMouseUp();
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [handleMouseUp]);

  const handleStartEditPanelName = (panelId: number, panelName: string) => {
    setEditingPanelId(panelId);
    setEditingPanelName(panelName);
    setTimeout(() => editInputRef.current?.focus(), 50);
  };

  const handleSavePanelName = async () => {
    if (!ensurePanelUnlocked()) {
      setEditingPanelId(null);
      return;
    }

    if (!editingPanelId || !editingPanelName.trim()) {
      setEditingPanelId(null);
      return;
    }
    try {
      await updatePanelMutation.mutateAsync({
        id: editingPanelId,
        data: {
          panelName: editingPanelName.trim(),
          margin: panelDetail?.margin ?? 20,
        },
      });
      toast.success('Panel name updated');
    } catch {
      toast.error('Failed to update panel name');
    }
    setEditingPanelId(null);
  };

  const canChangeStatus =
    hasPermission('Panels.ChangeStatus') ||
    hasRole('SuperAdmin') ||
    hasRole('TenderingManager') ||
    panelDetail?.createdByUserId === user?.id;

  const canManageCollaborators =
    hasPermission('Panels.ManageCollaborators') ||
    hasRole('SuperAdmin') || hasRole('TenderingManager');

  const canDuplicate = hasPermission('Panels.Duplicate') || hasRole('SuperAdmin') || hasRole('TenderingManager');
  const canDelete = hasPermission('Panels.Delete') || hasRole('SuperAdmin') || hasRole('TenderingManager') || panelDetail?.createdByUserId === user?.id;
  const canCreatePanel = hasPermission('Panels.Create') || hasRole('SuperAdmin') || hasRole('TenderingManager');
  const canEditPanel = hasPermission('Panels.Edit') || hasRole('SuperAdmin') || hasRole('TenderingManager') || panelDetail?.createdByUserId === user?.id;
  const canExport = hasPermission('Offers.Export') || hasRole('SuperAdmin') || hasRole('TenderingManager');
  const canGenerateOffer = hasPermission('Offers.Generate') || hasRole('SuperAdmin') || hasRole('TenderingManager');
  const canModifyPricing = hasPermission('Pricing.Modify') || hasRole('SuperAdmin') || hasRole('TenderingManager');
  const { isProjectLocked, ensurePanelUnlocked } = useProjectLockGuard(project?.isLocked);

  // Add new panel handler
  const handleAddPanel = async () => {
    if (!project) return;
    if (!ensurePanelUnlocked()) {
      return;
    }

    try {
      const panelNumber = (project.panels?.length || 0) + 1;
      const newPanel = await createPanelMutation.mutateAsync({
        projectId: parsedProjectId,
        panelName: `Panel ${panelNumber}`,
        margin: 20,
      });
      toast.success('Panel added successfully');
      if (newPanel?.panelId) {
        setSelectedPanelId(newPanel.panelId);
      }
    } catch (error) {
      toast.error('Failed to add panel');
    }
  };

  // Currency formatter
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-EG', { style: 'currency', currency: project?.currency || 'EGP' }).format(value);

  // Zone configuration map
  type ActiveZoneType = 'incoming' | 'outgoing' | 'enclosure' | 'busbarAndCables';
  const zoneToItemType: Record<ActiveZoneType, PanelItemType> = {
    incoming: PanelItemType.Incoming,
    outgoing: PanelItemType.Outgoing,
    enclosure: PanelItemType.Enclosure,
    busbarAndCables: PanelItemType.BusbarAndCables,
  };

  // Get items grouped by zone
  const zones = useMemo(() => {
    if (groupedItems) {
      return groupedItems as Record<string, PanelItem[]>;
    }
    return {
      incoming: [] as PanelItem[],
      outgoing: [] as PanelItem[],
      enclosure: [] as PanelItem[],
      busbarAndCables: [] as PanelItem[],
    };
  }, [groupedItems]);

  const groupedZones = useMemo(() => {
    const buildGroupedZone = (items: PanelItem[]) => {
      const directItems: PanelItem[] = [];
      const packageGroups = new Map<string, PackageGroupView>();

      for (const item of items) {
        const packageMetadata = parsePackageNotes(item.notes);

        if (!packageMetadata) {
          directItems.push(item);
          continue;
        }

        const existingGroup = packageGroups.get(packageMetadata.packageInstanceId);
        if (existingGroup) {
          existingGroup.items.push(item);
        } else {
          packageGroups.set(packageMetadata.packageInstanceId, {
            packageInstanceId: packageMetadata.packageInstanceId,
            packageId: packageMetadata.packageId,
            packageName: packageMetadata.packageName,
            quantity: packageMetadata.packageQuantity,
            items: [item],
          });
        }
      }

      return {
        directItems,
        packageGroups: Array.from(packageGroups.values()),
      };
    };

    return {
      incoming: buildGroupedZone(zones.incoming),
      outgoing: buildGroupedZone(zones.outgoing),
      enclosure: buildGroupedZone(zones.enclosure),
      busbarAndCables: buildGroupedZone(zones.busbarAndCables),
    };
  }, [zones]);

  // Open material selection modal for a specific zone
  const handleOpenAddItems = (zone: ZoneType) => {
    if (!ensurePanelUnlocked()) {
      return;
    }

    setActiveZone(zone);
    setSelectionModalOpen(true);
  };

  const handleOpenBusbarWorksheet = () => {
    if (!ensurePanelUnlocked()) {
      return;
    }

    setBusbarWorksheetOpen(true);
  };

  // Add selected materials to the active zone
  const handleAddMaterials = async (
    selections: { material: Material; quantity: number }[]
  ) => {
    if (!activeZone) return;
    if (!ensurePanelUnlocked()) {
      return;
    }

    const itemType = activeZone !== 'unassigned' ? zoneToItemType[activeZone as ActiveZoneType] : undefined;

    try {
      for (const { material, quantity } of selections) {
        await addMaterialMutation.mutateAsync({
          panelId: selectedPanelId,
          materialId: material.materialId,
          quantity,
          itemType: itemType ?? undefined,
        });
      }
      toast.success(
        `Added ${selections.length} material${selections.length !== 1 ? 's' : ''} to ${getZoneConfig(activeZone).label}`
      );
      refetchItems();
    } catch (error) {
      toast.error('Failed to add materials');
    }
  };

  const handleAddPackages = async (
    selections: { packageItem: PackageDto; quantity: number }[]
  ) => {
    if (!activeZone) return;
    if (!ensurePanelUnlocked()) {
      return;
    }

    const itemType = activeZone !== 'unassigned' ? zoneToItemType[activeZone as ActiveZoneType] : undefined;

    try {
      for (const { packageItem, quantity } of selections) {
        const packageInstanceId = createPackageInstanceId(packageItem.packageId);

        for (const packageMaterial of packageItem.items) {
          await addMaterialMutation.mutateAsync({
            panelId: selectedPanelId,
            materialId: packageMaterial.materialId,
            quantity: packageMaterial.quantity * quantity,
            itemType: itemType ?? undefined,
            notes: createPackageNotes({
              packageInstanceId,
              packageId: packageItem.packageId,
              packageName: packageItem.packageName,
              packageItemId: packageMaterial.packageItemId,
              packageItemQuantity: packageMaterial.quantity,
              packageQuantity: quantity,
            }),
          });
        }
      }

      toast.success(
        `Added ${selections.length} package${selections.length !== 1 ? 's' : ''} to ${getZoneConfig(activeZone).label}`
      );
      refetchItems();
    } catch (error) {
      toast.error('Failed to add packages');
    }
  };

  // Remove item from panel
  const handleRemoveItem = async (itemId: number) => {
    if (!ensurePanelUnlocked()) {
      return;
    }

    try {
      await deleteItemMutation.mutateAsync(itemId);
      toast.success('Item removed');
      refetchItems();
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const handleRemovePackage = async (packageInstanceId: string) => {
    if (!ensurePanelUnlocked()) {
      return;
    }

    const allItems = Object.values(zones).flat();
    const packageItems = allItems.filter(
      (item) => parsePackageNotes(item.notes)?.packageInstanceId === packageInstanceId
    );

    if (packageItems.length === 0) {
      return;
    }

    try {
      for (const item of packageItems) {
        await deleteItemMutation.mutateAsync(item.panelItemId);
      }
      toast.success('Package removed');
      refetchItems();
    } catch (error) {
      toast.error('Failed to remove package');
    }
  };

  // Update quantity
  const handleQuantityChange = async (itemId: number, quantity: number) => {
    if (!ensurePanelUnlocked()) {
      return;
    }

    try {
      const allItems = Object.values(zones).flat();
      const currentItem = allItems.find((i) => i.panelItemId === itemId);
      await updateItemMutation.mutateAsync({
        id: itemId,
        data: {
          quantity,
          itemType: currentItem?.itemType ?? undefined,
        },
      });
      refetchItems();
    } catch (error) {
      toast.error('Failed to update quantity');
    }
  };

  const handlePackageQuantityChange = async (packageInstanceId: string, quantity: number) => {
    if (!ensurePanelUnlocked()) {
      return;
    }

    const allItems = Object.values(zones).flat();
    const packageItems = allItems.filter(
      (item) => parsePackageNotes(item.notes)?.packageInstanceId === packageInstanceId
    );

    if (packageItems.length === 0) {
      return;
    }

    try {
      for (const item of packageItems) {
        const metadata = parsePackageNotes(item.notes);
        if (!metadata) {
          continue;
        }

        await updateItemMutation.mutateAsync({
          id: item.panelItemId,
          data: {
            quantity: metadata.packageItemQuantity * quantity,
            itemType: item.itemType ?? undefined,
            notes: createPackageNotes({
              ...metadata,
              packageQuantity: quantity,
            }),
          },
        });
      }

      toast.success('Package quantity updated');
      refetchItems();
    } catch (error) {
      toast.error('Failed to update package quantity');
    }
  };

  const handlePackageItemQuantityChange = async (itemId: number, quantity: number) => {
    if (!ensurePanelUnlocked()) {
      return;
    }

    const allItems = Object.values(zones).flat();
    const currentItem = allItems.find((item) => item.panelItemId === itemId);

    if (!currentItem) {
      return;
    }

    const metadata = parsePackageNotes(currentItem.notes);
    if (!metadata) {
      return;
    }

    const packageQuantity = metadata.packageQuantity || 1;

    try {
      await updateItemMutation.mutateAsync({
        id: itemId,
        data: {
          quantity,
          itemType: currentItem.itemType ?? undefined,
          notes: createPackageNotes({
            ...metadata,
            packageItemQuantity: quantity / packageQuantity,
          }),
        },
      });

      toast.success('Package item quantity updated');
      refetchItems();
    } catch {
      toast.error('Failed to update package item quantity');
    }
  };

  // Update pricing overrides
  const handleOverrideChange = async (
    itemId: number,
    updates: { overrideDiscount?: number; overrideMargin?: number; extraDiscount?: number }
  ) => {
    if (!ensurePanelUnlocked()) {
      return;
    }

    try {
      // Find the current item to preserve its quantity and itemType
      const allItems = Object.values(zones).flat();
      const currentItem = allItems.find((i) => i.panelItemId === itemId);
      await updateItemMutation.mutateAsync({
        id: itemId,
        data: {
          quantity: currentItem?.quantity ?? 1,
          itemType: currentItem?.itemType ?? undefined,
          ...updates,
        },
      });
      refetchItems();
      toast.success('Pricing updated');
    } catch {
      toast.error('Failed to update pricing');
    }
  };

  if (projectLoading || panelLoading) {
    return <Loading fullScreen message="Loading panel designer..." />;
  }

  if (!project) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="error">
          Project not found
        </Typography>
        <Button variant="ghost" onClick={() => navigate('/projects')} sx={{ mt: 2 }}>
          Back to Projects
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Panel Designer"
        subtitle={`${project.projectName} - ${panelDetail?.panelName || 'Select a panel'}`}
        breadcrumbs={[
          { label: 'Projects', path: '/projects' },
          { label: project.projectName, path: `/projects/${project.projectId}` },
          { label: 'Panel Designer' },
        ]}
        backButton={{ label: 'Back' }}
        actions={
          <Box sx={{ display: 'flex', gap: 1 }}>
            {canExport && (
              <Button
                variant="outline"
                icon={<FileDownloadIcon />}
                onClick={async () => {
                  try {
                    const blob = await panelService.exportToExcel(selectedPanelId);
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${panelDetail?.panelName || 'panel'}.xlsx`;
                    a.click();
                    URL.revokeObjectURL(url);
                    toast.success('Panel exported');
                  } catch {
                    toast.error('Export failed');
                  }
                }}
                disabled={!selectedPanelId}
              >
                Export Panel
              </Button>
            )}
            {canGenerateOffer && (
              <Button
                variant="primary"
                icon={<DescriptionIcon />}
                onClick={() => navigate(`/projects/${project.projectId}/offer`)}
              >
                Generate Offer
              </Button>
            )}
          </Box>
        }
      />

      {isProjectLocked && (
        <Alert
          severity="warning"
          icon={<LockIcon fontSize="inherit" />}
          sx={{ mb: 2 }}
        >
          This project is locked. Panel and panel item editing actions are disabled.
        </Alert>
      )}

      {/* Panel Selection Tabs */}
      <Paper
        sx={{ mb: { xs: 2, sm: 3 }, display: 'flex', alignItems: 'center' }}
        ref={tabsContainerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <Tabs
          value={selectedPanelId}
          onChange={(_, value) => setSelectedPanelId(value)}
          variant="scrollable"
          scrollButtons={false}
          sx={{
            flex: 1,
            '& .MuiTabs-scroller': {
              cursor: 'grab',
              scrollBehavior: 'smooth',
            },
            '& .MuiTab-root': {
              minWidth: { xs: 80, sm: 'auto' },
              px: { xs: 1.5, sm: 2 },
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
            },
          }}
        >
          {project.panels?.map((panel) => (
            <Tab
              key={panel.panelId}
              value={panel.panelId}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {editingPanelId === panel.panelId ? (
                    <TextField
                      inputRef={editInputRef}
                      size="small"
                      value={editingPanelName}
                      onChange={(e) => setEditingPanelName(e.target.value)}
                      onBlur={handleSavePanelName}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSavePanelName();
                        if (e.key === 'Escape') setEditingPanelId(null);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      sx={{ width: 120, '& .MuiInputBase-input': { py: 0.25, px: 0.5, fontSize: '0.875rem' } }}
                      autoFocus
                    />
                  ) : (
                    <Box
                      sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                      onDoubleClick={(e) => {
                        if (isProjectLocked) return;
                        e.stopPropagation();
                        handleStartEditPanelName(panel.panelId, panel.panelName);
                      }}
                    >
                      {panel.panelName}
                    </Box>
                  )}
                  {panel.status != null && (
                    <EntityStatusBadge status={panel.status} size="small" />
                  )}
                </Box>
              }
            />
          ))}
        </Tabs>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1 }}>
          {canDelete && selectedPanelId > 0 && (
            <Tooltip title="Delete Panel">
              <IconButton
                size="small"
                color="error"
                onClick={() => setDeleteConfirmOpen(true)}
                disabled={deletePanelMutation.isPending || isProjectLocked}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {canDuplicate && selectedPanelId > 0 && (
            <Tooltip title="Duplicate Panel">
              <IconButton
                size="small"
                color="secondary"
                onClick={() => setDuplicateConfirmOpen(true)}
                disabled={duplicatePanelMutation.isPending || isProjectLocked}
              >
                <FileCopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {canManageCollaborators && selectedPanelId > 0 && (
            <Tooltip title="Manage Collaborators">
              <IconButton
                size="small"
                color="default"
                onClick={() => setIsCollaboratorModalOpen(true)}
                disabled={isProjectLocked}
              >
                <Badge badgeContent={panelDetail?.collaborators?.length || 0} color="primary" max={9}>
                  <GroupIcon fontSize="small" />
                </Badge>
              </IconButton>
            </Tooltip>
          )}
          <IconButton
            size="small"
            color="primary"
            onClick={handleAddPanel}
            disabled={createPanelMutation.isPending || !canCreatePanel || isProjectLocked}
            sx={{
              border: '1px dashed',
              borderColor: 'primary.main',
              borderRadius: 1,
              my: 0.5,
              display: canCreatePanel ? 'inline-flex' : 'none',
              '&:hover': { backgroundColor: 'primary.light' },
            }}
          >
            <AddIcon fontSize="small" />
          </IconButton>
        </Box>
      </Paper>

      {/* Panel Status Change (if panel selected) */}
      {selectedPanelId > 0 && panelDetail && canChangeStatus && (
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Panel Status:
          </Typography>
          <StatusChangeDropdown
            currentStatus={panelDetail.status}
            onStatusChange={async (newStatus) => {
              if (!ensurePanelUnlocked()) {
                return;
              }

              try {
                await changePanelStatusMutation.mutateAsync({
                  id: selectedPanelId,
                  dto: { newStatus },
                });
                toast.success('Panel status updated');
              } catch {
                toast.error('Failed to update panel status');
              }
            }}
            disabled={isProjectLocked}
            loading={changePanelStatusMutation.isPending}
          />
        </Box>
      )}

      {/* Panel Pricing Summary */}
      {selectedPanelId > 0 && panelDetail && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Panel Summary
          </Typography>
          <Divider sx={{ mb: 1.5 }} />
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" color="text.secondary">Items</Typography>
              <Typography variant="h6" fontWeight={600}>
                {panelDetail.summary?.totalItems ?? panelDetail.items?.length ?? 0}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" color="text.secondary">Total Cost</Typography>
              <Typography variant="h6" fontWeight={600}>
                {formatCurrency(panelDetail.summary?.totalCost ?? 0)}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" color="text.secondary">Margin ({panelDetail.margin ?? 0}%)</Typography>
              <Typography variant="h6" fontWeight={600} color="success.main">
                {formatCurrency(panelDetail.summary?.marginAmount ?? 0)}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" color="text.secondary">Total Price</Typography>
              <Typography variant="h6" fontWeight={600} color="primary.main">
                {formatCurrency(panelDetail.summary?.totalPrice ?? 0)}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      )}

{/* Item Type Zones */}
      {selectedPanelId > 0 && (
        <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
          {/* Category Zones */}
          <Grid item xs={12} md={6}>
            <ItemTypeZone
              id="incoming"
              label={getZoneConfig('incoming').label}
              items={groupedZones.incoming.directItems}
              packageGroups={groupedZones.incoming.packageGroups}
              color={getZoneConfig('incoming').color}
              description={getZoneConfig('incoming').description}
              onRemove={canEditPanel ? handleRemoveItem : undefined}
              onQuantityChange={canEditPanel ? handleQuantityChange : undefined}
              onPackageItemQuantityChange={canEditPanel ? handlePackageItemQuantityChange : undefined}
              onPackageQuantityChange={canEditPanel ? handlePackageQuantityChange : undefined}
              onPackageRemove={canEditPanel ? handleRemovePackage : undefined}
              onAddItems={canEditPanel && !isProjectLocked ? () => handleOpenAddItems('incoming') : undefined}
              onOverrideChange={canModifyPricing && !isProjectLocked ? handleOverrideChange : undefined}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <ItemTypeZone
              id="outgoing"
              label={getZoneConfig('outgoing').label}
              items={groupedZones.outgoing.directItems}
              packageGroups={groupedZones.outgoing.packageGroups}
              color={getZoneConfig('outgoing').color}
              description={getZoneConfig('outgoing').description}
              onRemove={canEditPanel ? handleRemoveItem : undefined}
              onQuantityChange={canEditPanel ? handleQuantityChange : undefined}
              onPackageItemQuantityChange={canEditPanel ? handlePackageItemQuantityChange : undefined}
              onPackageQuantityChange={canEditPanel ? handlePackageQuantityChange : undefined}
              onPackageRemove={canEditPanel ? handleRemovePackage : undefined}
              onAddItems={canEditPanel && !isProjectLocked ? () => handleOpenAddItems('outgoing') : undefined}
              onOverrideChange={canModifyPricing && !isProjectLocked ? handleOverrideChange : undefined}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <ItemTypeZone
              id="enclosure"
              label={getZoneConfig('enclosure').label}
              items={groupedZones.enclosure.directItems}
              packageGroups={groupedZones.enclosure.packageGroups}
              color={getZoneConfig('enclosure').color}
              description={getZoneConfig('enclosure').description}
              onRemove={canEditPanel ? handleRemoveItem : undefined}
              onQuantityChange={canEditPanel ? handleQuantityChange : undefined}
              onPackageItemQuantityChange={canEditPanel ? handlePackageItemQuantityChange : undefined}
              onPackageQuantityChange={canEditPanel ? handlePackageQuantityChange : undefined}
              onPackageRemove={canEditPanel ? handleRemovePackage : undefined}
              onAddItems={canEditPanel && !isProjectLocked ? () => handleOpenAddItems('enclosure') : undefined}
              onOverrideChange={canModifyPricing && !isProjectLocked ? handleOverrideChange : undefined}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <ItemTypeZone
              id="busbarAndCables"
              label={getZoneConfig('busbarAndCables').label}
              items={groupedZones.busbarAndCables.directItems}
              packageGroups={groupedZones.busbarAndCables.packageGroups}
              color={getZoneConfig('busbarAndCables').color}
              description={getZoneConfig('busbarAndCables').description}
              onRemove={canEditPanel ? handleRemoveItem : undefined}
              onPackageItemQuantityChange={canEditPanel ? handlePackageItemQuantityChange : undefined}
              onPackageQuantityChange={canEditPanel ? handlePackageQuantityChange : undefined}
              onPackageRemove={canEditPanel ? handleRemovePackage : undefined}
              onAddItems={canEditPanel && !isProjectLocked ? handleOpenBusbarWorksheet : undefined}
              addButtonLabel={zones.busbarAndCables.length > 0 ? 'Edit Worksheet' : 'Open Worksheet'}
              emptyStateLabel={zones.busbarAndCables.length > 0 ? 'Open the worksheet to edit it' : 'Click to open worksheet'}
              renderItem={(item) => (
                <Suspense fallback={<Box sx={{ py: 2 }}>Loading worksheet...</Box>}>
                  <BusbarCablesWorksheetCard
                    item={item}
                    worksheet={busbarWorksheet ?? null}
                    currency={project?.currency || 'EGP'}
                    onEdit={handleOpenBusbarWorksheet}
                    onDelete={() => handleRemoveItem(item.panelItemId)}
                  />
                </Suspense>
              )}
            />
          </Grid>
        </Grid>
      )}

      {/* Material Selection Modal */}
      {activeZone && (
        <MaterialSelectionModal
          open={selectionModalOpen}
          onClose={() => {
            setSelectionModalOpen(false);
            setActiveZone(null);
          }}
          title={`Add Items to ${getZoneConfig(activeZone).label}`}
          zoneColor={getZoneConfig(activeZone).color}
          materials={materials || []}
          categories={categories || []}
          brands={brands || []}
          packages={packages || []}
          onAddMaterials={handleAddMaterials}
          onAddPackages={handleAddPackages}
          loading={addMaterialMutation.isPending}
        />
      )}

      {busbarWorksheetOpen && (
        <Suspense fallback={<Loading fullScreen message="Loading worksheet editor..." />}>
          <BusbarCablesWorksheetModal
            open={busbarWorksheetOpen}
            panelId={selectedPanelId}
            worksheet={busbarWorksheet ?? null}
            defaultPricePerKg={busbarSystemMaterial?.basePrice}
            currency={project?.currency || 'EGP'}
            onClose={() => setBusbarWorksheetOpen(false)}
          />
        </Suspense>
      )}

      {/* Delete Panel Confirmation */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Delete Panel"
        message={`Are you sure you want to delete "${panelDetail?.panelName || ''}"? This will remove all items in this panel.`}
        confirmText="Delete"
        confirmColor="error"
        onConfirm={async () => {
          if (!ensurePanelUnlocked()) {
            return;
          }

          try {
            await deletePanelMutation.mutateAsync(selectedPanelId);
            toast.success('Panel deleted successfully');
            setDeleteConfirmOpen(false);
            // Select the first remaining panel, or 0 if none left
            const remainingPanels = project.panels?.filter(
              (p) => p.panelId !== selectedPanelId
            );
            if (remainingPanels && remainingPanels.length > 0) {
              setSelectedPanelId(remainingPanels[0].panelId);
            } else {
              setSelectedPanelId(0);
            }
          } catch {
            toast.error('Failed to delete panel');
          }
        }}
        onCancel={() => setDeleteConfirmOpen(false)}
        loading={deletePanelMutation.isPending}
      />

      {/* Duplicate Panel Confirmation */}
      <ConfirmDialog
        open={duplicateConfirmOpen}
        title="Duplicate Panel"
        message={`Duplicate "${panelDetail?.panelName || ''}"? This will copy all materials and quantities.`}
        confirmText="Duplicate"
        confirmColor="primary"
        onConfirm={async () => {
          if (!ensurePanelUnlocked()) {
            return;
          }

          try {
            const newPanel = await duplicatePanelMutation.mutateAsync(selectedPanelId);
            toast.success('Panel duplicated successfully');
            setDuplicateConfirmOpen(false);
            if (newPanel?.panelId) {
              setSelectedPanelId(newPanel.panelId);
            }
          } catch {
            toast.error('Failed to duplicate panel');
          }
        }}
        onCancel={() => setDuplicateConfirmOpen(false)}
        loading={duplicatePanelMutation.isPending}
      />

      {/* Panel Collaborator Modal */}
      {panelDetail && (
        <CollaboratorModal
          open={isCollaboratorModalOpen}
          onClose={() => setIsCollaboratorModalOpen(false)}
          title={`Collaborators for "${panelDetail.panelName}"`}
          collaborators={panelDetail.collaborators || []}
          users={allUsers || []}
          onAdd={async (dto) => {
            if (!ensurePanelUnlocked()) {
              return;
            }
            await addPanelCollaboratorMutation.mutateAsync({ panelId: selectedPanelId, dto });
            toast.success('Collaborator added');
          }}
          onRemove={async (userId) => {
            if (!ensurePanelUnlocked()) {
              return;
            }
            await removePanelCollaboratorMutation.mutateAsync({ panelId: selectedPanelId, userId });
            toast.success('Collaborator removed');
          }}
          loading={addPanelCollaboratorMutation.isPending || removePanelCollaboratorMutation.isPending}
        />
      )}
    </Box>
  );
};

export default PanelDesignerPage;
