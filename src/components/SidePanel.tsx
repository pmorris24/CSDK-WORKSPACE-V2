// src/components/SidePanel.tsx
import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { Layout } from 'react-grid-layout';
import './SidePanel.css';
import Modal from './Modal';
import PromptModal from './PromptModal';
import ColorPicker from './ColorPicker';

export interface WidgetInstance {
  instanceId: string;
  id: string; // This will now be the widget's OID for styled widgets
  layout: Layout;
  title?: string;
  embedCode?: string; // For simple URL/HTML embeds
  widgetOid?: string; // Explicitly store OIDs for styled widgets
  dashboardOid?: string;
  styleConfig?: any; // To store the style rules
}

export interface Dashboard {
  id: string;
  name: string;
  folderId: string;
  widgetInstances?: WidgetInstance[];
  theme?: 'light' | 'dark';
  iframeUrl?: string;
}

export interface Folder {
  id: string;
  name: string;
  color?: string;
}

export interface SidePanelProps {
  isCollapsed: boolean;
  togglePanel: () => void;
  folders: Folder[];
  dashboards: Dashboard[];
  activeDashboardId: string | null;
  onAddFolder: (name: string) => void;
  onLoadDashboard: (dashboardId: string) => void;
  onUpdateFolder: (id: string, newName: string, newColor?: string) => void;
  onUpdateDashboard: (id: string, newName: string) => void;
  onDeleteFolder: (id: string) => void;
  onDeleteDashboard: (dashboardId: string) => void;
  onAllDashboardsClick: () => void;
  onToggleUsageAnalytics: () => void;
  activeView: 'csdk' | 'data' | 'analytics' | 'admin' | 'usage' | null;
  showAllDashboards: boolean;
  onOpenInNewWindow: (dashboardId: string) => void;
}

type PromptState = {
    isOpen: boolean;
    mode: 'addFolder' | 'renameDashboard' | null;
    itemId: string | null;
    initialValue?: string;
};

const SidePanel: React.FC<SidePanelProps> = ({
  isCollapsed,
  togglePanel,
  folders,
  dashboards,
  activeDashboardId,
  onAddFolder,
  onLoadDashboard,
  onUpdateFolder,
  onUpdateDashboard,
  onDeleteFolder,
  onDeleteDashboard,
  onAllDashboardsClick,
  onToggleUsageAnalytics,
  activeView,
  showAllDashboards,
  onOpenInNewWindow,
}) => {
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({ 'f1': true, 'f2': true });
  const [promptState, setPromptState] = useState<PromptState>({ isOpen: false, mode: null, itemId: null });
  const [editingFolder, setEditingFolder] = useState<{ id: string, name: string, color: string } | null>(null);
  const [colorPicker, setColorPicker] = useState<{ visible: boolean, x: number, y: number } | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    itemId: string | null;
    itemType: 'folder' | 'dashboard' | null;
  }>({
    visible: false, x: 0, y: 0, itemId: null, itemType: null,
  });
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showSearchBar, setShowSearchBar] = useState<boolean>(false);
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingFolder) {
        editInputRef.current?.focus();
    }
  }, [editingFolder]);

  useEffect(() => {
    if (!showSearchBar) {
      setSearchTerm('');
    }
  }, [showSearchBar]);

  const toggleFolder = (folderId: string) => {
    setOpenFolders(prev => ({ ...prev, [folderId]: !prev[folderId] }));
  };

  const handleContextMenu = (event: React.MouseEvent, itemId: string, itemType: 'folder' | 'dashboard') => {
    event.preventDefault();
    event.stopPropagation();
    setContextMenu({ visible: true, x: event.clientX, y: event.clientY, itemId, itemType });
  };

  const closeContextMenu = useCallback(() => {
    setContextMenu(prev => ({ ...prev, visible: false }));
  }, []);

  const closeColorPicker = useCallback(() => {
    setColorPicker(null);
  }, []);

  useEffect(() => {
    if (contextMenu.visible) {
        window.addEventListener('click', closeContextMenu);
        return () => window.removeEventListener('click', closeContextMenu);
    }
  }, [contextMenu.visible, closeContextMenu]);

  useEffect(() => {
    if (colorPicker?.visible) {
      window.addEventListener('click', closeColorPicker);
      return () => window.removeEventListener('click', closeColorPicker);
    }
  }, [colorPicker, closeColorPicker]);

  const handleEditFolder = () => {
    if (!contextMenu.itemId || contextMenu.itemType !== 'folder') return;
    const folder = folders.find(f => f.id === contextMenu.itemId);
    if (folder) {
        setEditingFolder({ id: folder.id, name: folder.name, color: folder.color || '#666' });
    }
    closeContextMenu();
  };

  const handleDelete = () => {
    if (!contextMenu.itemId || !contextMenu.itemType) return;
    
    if (contextMenu.itemType === 'dashboard') {
        onDeleteDashboard(contextMenu.itemId);
    } else if (contextMenu.itemType === 'folder') {
        onDeleteFolder(contextMenu.itemId);
    }
    
    closeContextMenu();
  };

  const handleSaveEdit = () => {
    if (editingFolder) {
        onUpdateFolder(editingFolder.id, editingFolder.name, editingFolder.color);
        setEditingFolder(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingFolder(null);
  };

  const handlePromptSave = (value: string) => {
    if (!promptState.mode) return;

    if (promptState.mode === 'addFolder') {
        onAddFolder(value);
    } else if (promptState.mode === 'renameDashboard' && promptState.itemId) {
        onUpdateDashboard(promptState.itemId, value);
    }

    setPromptState({ isOpen: false, mode: null, itemId: null });
  };

  const handleColorSelect = (color: string) => {
    if (editingFolder) {
      setEditingFolder({ ...editingFolder, color });
    }
    setColorPicker(null);
  };

  const openColorPicker = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    setColorPicker({ visible: true, x: rect.left, y: rect.bottom + 5 });
  };

  // Filtered folders and dashboards based on search term
  const filteredFolders = folders.filter(folder =>
    folder.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dashboards.some(d => d.folderId === folder.id && d.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredDashboards = dashboards.filter(dashboard =>
    dashboard.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
            <span className="dashboards-title">Dashboards</span>
            <div className="dashboards-icons">
                <i className="fas fa-search" onClick={() => setShowSearchBar(true)}></i>
                <i className="fas fa-check-square"></i>
                <i className="fas fa-plus" onClick={() => setPromptState({ isOpen: true, mode: 'addFolder', itemId: null })}></i>
            </div>
        </div>
        <div className={`search-bar-area ${showSearchBar ? 'visible' : ''}`}>
            <div className="search-input-container">
                <i className="fas fa-search"></i>
                <input
                    type="text"
                    placeholder="Search..."
                    className="dashboard-search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoFocus={showSearchBar}
                />
            </div>
            <button className="search-done-icon-button" onClick={() => setShowSearchBar(false)} aria-label="Done searching">
                <i className="fas fa-check"></i>
            </button>
        </div>
        <nav className="sidebar-nav">
            <ul>
                <li className={activeView === 'analytics' && !activeDashboardId && !showAllDashboards ? 'active' : ''}>
                    <a href="#" onClick={(e) => { e.preventDefault(); onAllDashboardsClick(); }}>
                        <i className="fas fa-chart-column"></i> All Dashboards
                    </a>
                </li>

                {showAllDashboards ? (
                    filteredDashboards.map(dashboard => (
                        <li
                            key={dashboard.id}
                            className={dashboard.id === activeDashboardId ? 'active' : ''}
                            onContextMenu={(e) => handleContextMenu(e, dashboard.id, 'dashboard')}
                        >
                            <a href="#" onClick={(e) => { e.preventDefault(); onLoadDashboard(dashboard.id); }}>
                                <i className="fas fa-link"></i>
                                {dashboard.name}
                            </a>
                        </li>
                    ))
                ) : (
                    <>
                        {(!searchTerm || 'usage analytics'.includes(searchTerm.toLowerCase())) && (
                            <li className={activeView === 'usage' ? 'active' : ''}>
                                <a href="#" onClick={(e) => { e.preventDefault(); onToggleUsageAnalytics(); }}>
                                    <i className="fas fa-sliders-h"></i> Usage Analytics
                                </a>
                            </li>
                        )}
                        {filteredFolders.map(folder => (
                            <li
                                key={folder.id}
                                className={`${openFolders[folder.id] || searchTerm ? 'open' : ''} ${editingFolder?.id === folder.id ? 'editing' : ''}`}
                                onContextMenu={(e) => handleContextMenu(e, folder.id, 'folder')}
                            >
                                {editingFolder?.id === folder.id ? (
                                    <div className="folder-edit-container">
                                        <i className="fas fa-folder folder-icon" style={{ color: editingFolder.color }} onClick={openColorPicker}></i>
                                        <input
                                            ref={editInputRef}
                                            type="text"
                                            value={editingFolder.name}
                                            onChange={(e) => setEditingFolder({ ...editingFolder, name: e.target.value })}
                                            className="folder-name-input"
                                            onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                                        />
                                        <div className="edit-actions">
                                            <i className="fas fa-check save-icon" onClick={handleSaveEdit}></i>
                                            <i className="fas fa-times cancel-icon" onClick={handleCancelEdit}></i>
                                        </div>
                                    </div>
                                ) : (
                                    <a href="#" onClick={(e) => {e.preventDefault(); toggleFolder(folder.id)}}>
                                        <i className="fas fa-folder folder-icon" style={{ color: folder.color || 'var(--sidebar-icon)' }}></i> {folder.name}
                                    </a>
                                )}
                                <ul className="submenu">
                                    {filteredDashboards.filter(d => d.folderId === folder.id).map(dashboard => (
                                        <li
                                            key={dashboard.id}
                                            className={dashboard.id === activeDashboardId && activeView === 'csdk' ? 'active' : ''}
                                            onContextMenu={(e) => handleContextMenu(e, dashboard.id, 'dashboard')}
                                        >
                                            <a href="#" onClick={(e) => { e.preventDefault(); onLoadDashboard(dashboard.id); }}>
                                                <i className="fas fa-link"></i>
                                                {dashboard.name}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </li>
                        ))}
                    </>
                )}
            </ul>
        </nav>
        {contextMenu.visible && (
            <div
                className="context-menu"
                style={{ top: contextMenu.y, left: contextMenu.x }}
            >
                {contextMenu.itemType === 'folder' && (
                    <button onClick={handleEditFolder}>Edit Folder</button>
                )}
                {contextMenu.itemType === 'dashboard' && (
                    <button
                        className="rename-button"
                        onClick={() => {
                            const dashboard = dashboards.find(d => d.id === contextMenu.itemId);
                            if (dashboard) {
                                setPromptState({ isOpen: true, mode: 'renameDashboard', itemId: dashboard.id, initialValue: dashboard.name });
                            }
                            closeContextMenu();
                        }}
                    >
                        Rename
                    </button>
                )}
                 {contextMenu.itemType === 'dashboard' && dashboards.find(d => d.id === contextMenu.itemId)?.iframeUrl && (
                    <button
                        onClick={() => {
                            if (contextMenu.itemId) {
                                onOpenInNewWindow(contextMenu.itemId);
                            }
                            closeContextMenu();
                        }}
                    >
                        Open in New Window
                    </button>
                )}
                <button
                    className="remove-button"
                    onClick={handleDelete}
                >
                    Delete {contextMenu.itemType}
                </button>
            </div>
        )}
        {promptState.isOpen && (
            <Modal
                onClose={() => setPromptState({ isOpen: false, mode: null, itemId: null })}
                title={
                    promptState.mode === 'addFolder' ? 'Create New Folder' : 'Rename Dashboard'
                }
            >
                <PromptModal
                    onSave={handlePromptSave}
                    onClose={() => setPromptState({ isOpen: false, mode: null, itemId: null })}
                    title={
                        promptState.mode === 'addFolder' ? 'Enter folder name' : 'Enter new dashboard name'
                    }
                    initialValue={promptState.initialValue}
                    placeholder={
                        promptState.mode === 'addFolder' ? 'e.g. Financial Reports' : ''
                    }
                />
            </Modal>
        )}
        {colorPicker?.visible && (
          <ColorPicker
            x={colorPicker.x}
            y={colorPicker.y}
            onSelect={handleColorSelect}
          />
        )}
        <button onClick={togglePanel} className="sidebar-toggle-button" aria-label="Toggle sidebar">
            <i className={`fas ${isCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`}></i>
        </button>
    </div>
  );
};

export default SidePanel;