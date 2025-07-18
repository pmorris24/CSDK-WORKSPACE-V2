// src/App.tsx
import React, { useState, useCallback, useEffect, FC, useRef } from 'react';
import { Responsive, WidthProvider, type Layout } from 'react-grid-layout';
import { DashboardWidget, SisenseContextProvider, ThemeProvider, type DashboardWidgetStyleOptions } from '@sisense/sdk-ui';
import Highcharts from 'highcharts';
import { getHighchartsThemeOptions } from './theme';
import { DEMO_DATA } from './data/demo-dashboards';

import LTDExpensedWidget from './components/LTDExpensedWidget';
import EnrollmentPercentageWidget from './components/EnrollmentPercentageWidget';
import BudgetVsForecastWidget from './components/BudgetVsForecastWidget';
import ThemeToggleButton from './components/ThemeToggleButton';
import Header from './components/Header';
import SidePanel, { type Folder, type Dashboard, type WidgetInstance } from './components/SidePanel';
import Modal from './components/Modal';
import WidgetLibrary from './components/WidgetLibrary';
import SaveDashboardForm from './components/SaveDashboardForm';
import ContextMenu from './components/ContextMenu';
import WidgetEditor, { type GridlineStyle } from './components/WidgetEditor';
import EmbedModal, { type EmbedModalSaveData } from './components/EmbedModal';
import CodeBlock from './components/CodeBlock';
import SaveDropdown from './components/SaveDropdown';
import { adjustVibrance } from './utils/colorUtils';
import { StyleConfig } from './components/widgetstyler';

const ResponsiveGridLayout = WidthProvider(Responsive);

// --- WIDGET CATALOG & OID MAP ---
const WIDGET_CATALOG = [
    { id: 'kpi0', title: 'LTD Expensed (Custom)', component: LTDExpensedWidget, defaultLayout: { w: 3, h: 3 } },
    { id: 'kpi5', title: 'Enrolled Patients % (Custom)', component: EnrollmentPercentageWidget, defaultLayout: { w: 3, h: 3 } },
    { id: 'kpi2', title: 'Trial budget', defaultLayout: { w: 3, h: 3 } },
    { id: 'kpi1', title: 'LTD Reconciled', defaultLayout: { w: 3, h: 3 } },
    { id: 'kpi4', title: '% Recognized', defaultLayout: { w: 3, h: 3 } },
    { id: 'chart1', title: 'LTD trial spend', defaultLayout: { w: 6, h: 8 } },
    { id: 'chart2', title: 'Actual + forecast', defaultLayout: { w: 6, h: 8 } },
    { id: 'chart7', title: 'Budget vs. Forecast (Custom)', component: BudgetVsForecastWidget, defaultLayout: { w: 6, h: 8 } },
    { id: 'chart4', title: 'Budget vs forecast by cost category', defaultLayout: { w: 6, h: 8 } },
    { id: 'chart3', title: 'Cumulative total spend', defaultLayout: { w: 6, h: 8 } },
    { id: 'chart5', title: 'Vendor progress', defaultLayout: { w: 6, h: 8 } },
    { id: 'table1', title: 'Financial Summary', defaultLayout: { w: 12, h: 8 } },
    { id: 'embed', title: 'Embedded Content', component: CodeBlock, defaultLayout: { w: 6, h: 8 } },
    { id: 'styled-embed', title: 'Styled Widget', defaultLayout: { w: 6, h: 8 } },
];

const WIDGET_OID_MAP: Record<string, { widgetOid: string, dashboardOid: string }> = {
    'kpi1': { widgetOid: '684ae8c995906e3edc558213', dashboardOid: '684ae8c995906e3edc558210' },
    'kpi2': { widgetOid: '684ae8c995906e3edc558214', dashboardOid: '684ae8c995906e3edc558210' },
    'kpi3': { widgetOid: '684ae8c995906e3edc558219', dashboardOid: '684ae8c995906e3edc558210' },
    'kpi4': { widgetOid: '684ae8c995906e3edc558216', dashboardOid: '684ae8c995906e3edc558210' },
    'chart1': { widgetOid: '684ae8c995906e3edc558211', dashboardOid: '684ae8c995906e3edc558210' },
    'chart2': { widgetOid: '684ae8c995906e3edc558212', dashboardOid: '684ae8c995906e3edc558210' },
    'chart3': { widgetOid: '684c1e2f95906e3edc558321', dashboardOid: '684ae8c995906e3edc558210' },
    'chart4': { widgetOid: '684ae8c995906e3edc558217', dashboardOid: '684ae8c995906e3edc558210' },
    'chart5': { widgetOid: '684c118b95906e3edc55830c', dashboardOid: '684ae8c995906e3edc558210' },
    'table1': { widgetOid: '684ae8c995906e3edc55821a', dashboardOid: '684ae8c995906e3edc558210' },
    'chart6': { widgetOid: '6851e57ef8d1a53383881e98', dashboardOid: '684ae8c995906e3edc558210' },
    'chart7': { widgetOid: '6865dfcbf8d1a5338388236e', dashboardOid: '684ae8c995906e3edc558210' },
};

// --- SISENSE THEME DEFINITIONS ---
const lightTheme = {
    chart: { backgroundColor: 'transparent' },
};

const darkTheme = {
    table: {
        header: {
            backgroundColor: '#3c3c3e',
            textColor: '#ffffff',
            borderColor: '#444446'
        },
        cell: {
            backgroundColor: '#2c2c2e',
            textColor: '#ffffff',
            borderColor: '#444446'
        },
        alternatingRows: {
            backgroundColor: '#3a3a3c',
            textColor: '#ffffff'
        }
    },
    pivot: {
        header: {
            backgroundColor: '#3c3c3e',
            textColor: '#ffffff',
            borderColor: '#444446'
        },
        rowHeader: {
            backgroundColor: '#2c2c2e',
            textColor: '#ffffff',
            borderColor: '#444446'
        },
        cell: {
            backgroundColor: '#2c2c2e',
            textColor: '#ffffff',
            borderColor: '#444446'
        },
        alternatingRows: {
            backgroundColor: '#3a3a3c',
            textColor: '#ffffff'
        }
    },
    chart: { backgroundColor: 'transparent', plotBorderColor: '#606063', textColor: '#E0E0E3' },
    palette: {
        variantColors: ['#f32958', '#fdd459', '#26b26f', '#4486f8']
    },
    typography: { fontFamily: 'Inter, sans-serif', primaryTextColor: '#FFFFFF', secondaryTextColor: '#8E8E93' }
};

const getStyleOptions = (themeMode: 'light' | 'dark') => ({
    widget: {
        backgroundColor: 'transparent',
        border: { enabled: false },
        shadow: { enabled: false },
        padding: { top: 0, right: 0, bottom: 0, left: 0 }
    },
    header: {
        backgroundColor: themeMode === 'dark' ? '#1F2838' : '#FFFFFF',
        titleTextColor: themeMode === 'dark' ? '#FFFFFF' : '#111827',
        border: {
            bottom: {
                color: themeMode === 'dark' ? 'transparent' : '#E5E7EB',
                width: 1
            }
        },
        height: 48,
        padding: {
            top: 0,
            right: 16,
            bottom: 0,
            left: 16
        },
        titleAlignment: 'Left' as const,
        menu: {
            button: {
                color: themeMode === 'dark' ? '#FFFFFF' : '#6B7280'
            }
        }
    },
});

const getStyleOptionsFromConfig = (styleConfig: StyleConfig): DashboardWidgetStyleOptions => {
    return {
        backgroundColor: styleConfig.backgroundColor,
        border: styleConfig.border,
        borderColor: styleConfig.borderColor,
        cornerRadius: styleConfig.cornerRadius,
        shadow: styleConfig.shadow,
        spaceAround: styleConfig.spaceAround,
        header: {
            backgroundColor: styleConfig.headerBackgroundColor,
            dividerLine: styleConfig.headerDividerLine,
            dividerLineColor: styleConfig.headerDividerLineColor,
            hidden: styleConfig.headerHidden,
            titleAlignment: styleConfig.headerTitleAlignment,
            titleTextColor: styleConfig.headerTitleTextColor,
        },
    };
};

// --- TOOLTIP FORMATTERS & RENDER LOGIC ---
function detailedBudgetTooltipFormatter(this: any) {
    if (!this.points) return '';
    const formatCurrency = (value: number) => '$' + new Intl.NumberFormat('en-US').format(Math.round(value));
    const theme = document.body.dataset.theme;
    const tooltipTextColor = theme === 'dark' ? '#F0F0F0' : '#333333';

    let sHtml = `<div style="padding: 10px; min-width: 250px; font-family: 'lato', sans-serif; font-size: 13px; color: ${tooltipTextColor};">`;
    sHtml += `<div style="font-size: 14px; margin-bottom: 10px; font-weight: 700;">${this.x}</div>`;
    sHtml += `<table style="width: 100%; color: ${tooltipTextColor};">`;

    this.points.forEach((point: any) => {
        sHtml += `<tr><td style="padding: 6px 2px; font-weight: 400;"><span style="background-color: ${point.series.color}; width: 12px; height: 12px; border-radius: 2px; display: inline-block; margin-right: 8px; vertical-align: middle;"></span>${point.series.name}</td><td style="text-align: right; padding: 6px 2px; font-weight: 700;">${formatCurrency(point.y)}</td></tr>`;
    });

    sHtml += '</table></div>';
    return sHtml;
}

function unifiedDualAxisTooltipFormatter(this: any) {
    if (!this.points) return '';
    const formatCurrency = (value: number) => '$' + new Intl.NumberFormat('en-US').format(Math.round(value));
    const isForecastChart = this.points.some((p: any) => p.series.name.includes(' - A') || p.series.name.includes(' - F'));

    let headerDate = this.x;
    if (typeof headerDate === 'string' && /^\d{2}\/\d{4}$/.test(headerDate)) {
        const [month, year] = headerDate.split('/');
        const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
        headerDate = date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
    }

    const isForecastPeriod = isForecastChart && this.points.some((p: any) => p.series.name.includes('- F'));
    let header = `<div style="font-size: 14px; margin-bottom: 10px;"><b>${headerDate}${isForecastPeriod ? ' (forecast)' : ''}</b></div>`;

    let s = `<div style="padding: 5px 10px; min-width: 200px; font-family: sans-serif;">${header}<table style="width: 100%;">`;
    let total = 0;

    const sortOrder = isForecastChart
        ? ['Direct fees', 'Pass-throughs', 'Investigator', 'OCC']
        : ['Direct Fees', 'Pass-throughs', 'Investigator fees', 'OCCs'];

    this.points.filter((p: any) => p.series.type === 'column' || p.series.type === 'bar')
        .sort((a: any, b: any) => {
            const cleanNameA = a.series.name.replace(/ - [AF]$/, '');
            const cleanNameB = b.series.name.replace(/ - [AF]$/, '');
            return sortOrder.indexOf(cleanNameA) - sortOrder.indexOf(cleanNameB);
        })
        .forEach((point: any) => {
            if (point.y !== null && point.y !== 0) {
                total += point.y;
                s += `<tr>
                            <td style="padding: 4px 2px;"><span style="background-color: ${point.series.color}; width: 8px; height: 8px; display: inline-block; margin-right: 6px; vertical-align: middle;"></span>${point.series.name.replace(/ - [AF]$/, '')}</td>
                            <td style="text-align: right; padding: 4px 2px; font-weight: bold;">${formatCurrency(point.y)}</td>
                          </tr>`;
            }
        });

    if (this.points.length > 1) {
        s += `<tr>
                <td style="border-top: 1px solid #E0E0E0; padding-top: 8px; padding-bottom: 8px;"><b>Total</b></td>
                <td style="border-top: 1px solid #E0E0E0; padding-top: 8px; padding-bottom: 8px; text-align: right;"><b>${formatCurrency(total)}</b></td>
              </tr>`;
    }

    const linePoint = this.points.find((p: any) => p.series.name.toLowerCase().includes('patient count') || p.series.name.toLowerCase().includes('enrollment'));
    if (linePoint) {
        const icon = `<span style="color:${linePoint.series.color}; font-weight: bold; font-size: 18px; vertical-align: middle; line-height: 10px;">—</span>`;
        const enrollmentValue = (linePoint.y === null) ? '—' : new Intl.NumberFormat('en-US').format(Math.round(linePoint.y));
        if (isForecastChart) {
             s += `<tr><td style="padding: 4px 2px;">${icon} Actual enrollment</td><td style="text-align: right; padding: 4px 2px; font-weight: bold;">${isForecastPeriod ? '—' : enrollmentValue}</td></tr>`;
             if(isForecastPeriod) s += `<tr><td style="padding: 4px 2px; font-style: italic;">${icon} Forecasted enrollment</td><td style="text-align: right; padding: 4px 2px; font-weight: bold; font-style: italic;">${enrollmentValue}</td></tr>`;
        } else {
            s += `<tr><td style="padding: 4px 2px;">${icon} Patient count</td><td style="text-align: right; padding: 4px 2px; font-weight: bold;">${enrollmentValue}</td></tr>`;
        }
    }

    return s + '</table></div>';
}

const applyTheming = (options: any, formatter: (this: any) => string, gridLineStyle: GridlineStyle) => {
    const theme = document.body.dataset.theme as 'light' | 'dark';
    const themeOptions = getHighchartsThemeOptions(theme);
    options.tooltip = { ...options.tooltip, shared: true, useHTML: true, formatter };
    const mergedOptions = Highcharts.merge(options, themeOptions);

    const gridColor = theme === 'dark' ? '#444446' : '#EAEBEF';

    if (mergedOptions.chart) {
        mergedOptions.chart.plotBackgroundImage = undefined;
        mergedOptions.chart.plotBackgroundColor = undefined;
    }

    const setAxisGridLines = (axis: any, width: number, dashStyle: 'Solid' | 'Dot' = 'Solid') => {
        if (!axis) return;
        const style = {
            gridLineWidth: width,
            gridLineColor: gridColor,
            gridLineDashStyle: dashStyle,
        };
        if (Array.isArray(axis)) {
            axis.forEach(a => Object.assign(a, style));
        } else {
            Object.assign(axis, style);
        }
    };

    switch (gridLineStyle) {
        case 'both':
            setAxisGridLines(mergedOptions.xAxis, 1);
            setAxisGridLines(mergedOptions.yAxis, 1);
            break;
        case 'y-only':
            setAxisGridLines(mergedOptions.xAxis, 0);
            setAxisGridLines(mergedOptions.yAxis, 1);
            break;
        case 'x-only':
            setAxisGridLines(mergedOptions.xAxis, 1);
            setAxisGridLines(mergedOptions.yAxis, 0);
            break;
        case 'dots':
            setAxisGridLines(mergedOptions.xAxis, 2, 'Dot');
            setAxisGridLines(mergedOptions.yAxis, 2, 'Dot');
            break;
        case 'none':
            setAxisGridLines(mergedOptions.xAxis, 0);
            setAxisGridLines(mergedOptions.yAxis, 0);
            break;
    }
    
    if (mergedOptions.chart) {
        mergedOptions.chart.backgroundColor = 'transparent';
    } else {
        mergedOptions.chart = { backgroundColor: 'transparent' };
    }

    return mergedOptions;
};

const ltdSpendOnBeforeRender = (options: any, gridLineStyle: GridlineStyle) => {
    options.chart = { ...options.chart, alignTicks: true };
    options.plotOptions = { ...options.plotOptions, column: { ...options.plotOptions?.column, borderRadius: 1, crisp: false, groupPadding: 0.4 } };
    const desiredOrder = ['Patient count', 'Direct Fees', 'Pass-throughs', 'Investigator fees', 'OCCs'];
    if (options.series) {
        options.series.forEach((s: any) => {
            s.legendIndex = desiredOrder.indexOf(s.name) !== -1 ? desiredOrder.indexOf(s.name) : desiredOrder.length;
            if (s.name === 'Patient count') s.zIndex = 5;
        });
        
        const secondarySeries = options.series.find((s: any) => s.name === 'Patient count');
        let secondaryAxisMax = 0;
        if (secondarySeries?.data?.length) {
            const dataPoints = secondarySeries.data.map((p: any) => (typeof p === 'object' && p !== null ? p.y : p));
            secondaryAxisMax = Math.max(0, ...dataPoints.filter((v: any): v is number => typeof v === 'number'));
        }

        const primaryAxisSeries = options.series.filter((s: any) => s.name !== 'Patient count');
        const stacks: { [key: string]: (number | null)[] } = {};
        primaryAxisSeries.forEach((s: any) => {
            if (!s.data) return;
            s.data.forEach((p: any, index: number) => {
                const key = String(index);
                if (!stacks[key]) stacks[key] = [];
                const value = (typeof p === 'object' && p !== null) ? p.y : p;
                stacks[key].push(value);
            });
        });
        let primaryAxisMin = 0;
        let primaryAxisMax = 0;
        Object.values(stacks).forEach(categoryValues => {
            const validValues = categoryValues.filter((v): v is number => typeof v === 'number');
            const positiveSum = validValues.filter(v => v > 0).reduce((sum, v) => sum + v, 0);
            const negativeSum = validValues.filter(v => v < 0).reduce((sum, v) => sum + v, 0);
            if (positiveSum > primaryAxisMax) primaryAxisMax = positiveSum;
            if (negativeSum < primaryAxisMin) primaryAxisMin = negativeSum;
        });
        if (Array.isArray(options.yAxis)) {
            options.yAxis[0] = options.yAxis[0] || {};
            options.yAxis[1] = options.yAxis[1] || {};
        
            if (primaryAxisMin < 0 && primaryAxisMax > 0 && secondaryAxisMax > 0) {
                const newSecondaryMin = primaryAxisMin * (secondaryAxisMax / primaryAxisMax);
                (options.yAxis[0] as Highcharts.YAxisOptions).min = primaryAxisMin;
                (options.yAxis[0] as Highcharts.YAxisOptions).max = primaryAxisMax;
                (options.yAxis[1] as Highcharts.YAxisOptions).min = newSecondaryMin;
                (options.yAxis[1] as Highcharts.YAxisOptions).max = secondaryAxisMax;
                (options.yAxis[0] as Highcharts.YAxisOptions).startOnTick = false;
                (options.yAxis[0] as Highcharts.YAxisOptions).endOnTick = false;
                (options.yAxis[1] as Highcharts.YAxisOptions).startOnTick = false;
                (options.yAxis[1] as Highcharts.YAxisOptions).endOnTick = false;
            }
        }
    }
    return applyTheming(options, unifiedDualAxisTooltipFormatter, gridLineStyle);
};

const actualForecastOnBeforeRender = (options: any, gridLineStyle: GridlineStyle) => {
    options.chart = { ...options.chart, alignTicks: true };
    options.plotOptions = { ...options.plotOptions, column: { ...options.plotOptions?.column, borderRadius: 1, crisp: false, groupPadding: 0.4 } };
    const desiredOrder = ['Enrollment', 'Direct fees - A', 'Pass-throughs - A', 'Investigator - A', 'OCC - A', 'Direct fees - F', 'Pass-throughs - F', 'Investigator - F', 'OCC - F'];
    if (options.series) {
        options.series.forEach((s: any) => {
            s.legendIndex = desiredOrder.indexOf(s.name) !== -1 ? desiredOrder.indexOf(s.name) : desiredOrder.length;
            if (s.name === 'Enrollment') { s.type = 'line'; s.zIndex = 5; }
        });
    }
    return applyTheming(options, unifiedDualAxisTooltipFormatter, gridLineStyle);
};

// --- MAIN APP COMPONENT ---
const App: FC = () => {
    const [themeMode, setThemeMode] = useState<'light' | 'dark'>(() => {
        return (localStorage.getItem('themeMode') as 'light' | 'dark') || 'dark';
    });
    const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
    const [showAllDashboards, setShowAllDashboards] = useState(false);
    
    const [folders, setFolders] = useState<Folder[]>([]);
    const [dashboards, setDashboards] = useState<Dashboard[]>([]);
    
    const [activeDashboardId, setActiveDashboardId] = useState<string | null>(null);
    const [isEditable, setIsEditable] = useState(false);
    const [iframeUrl, setIframeUrl] = useState<string | null>(null);
    const [activeView, setActiveView] = useState<'csdk' | 'data' | 'analytics' | 'admin' | 'usage' | null>('csdk');
    const [isEmbedModalOpen, setIsEmbedModalOpen] = useState<{ open: boolean, instanceId?: string }>({ open: false });
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editingTitleValue, setEditingTitleValue] = useState('');
    const [isSaveDropdownOpen, setIsSaveDropdownOpen] = useState(false);
    const saveDropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const savedFolders = JSON.parse(localStorage.getItem('folders') || '[]') as Folder[];
        const savedDashboards = JSON.parse(localStorage.getItem('dashboards') || '[]') as Dashboard[];
    
        const finalFolders = [...savedFolders];
        const finalDashboards = [...savedDashboards];
    
        DEMO_DATA.folders.forEach(demoFolder => {
            if (!finalFolders.some(f => f.id === demoFolder.id)) {
                finalFolders.push(demoFolder);
            }
        });
    
        DEMO_DATA.dashboards.forEach(demoDashboard => {
            if (!finalDashboards.some(d => d.id === demoDashboard.id)) {
                finalDashboards.push(demoDashboard);
            }
        });
    
        setFolders(finalFolders);
        setDashboards(finalDashboards);

        if (!activeDashboardId && finalDashboards.length > 0) {
            setActiveDashboardId('d-demo-dark');
        }
    }, []);

    useEffect(() => {
        const userFolders = folders.filter(f => !DEMO_DATA.folders.some(df => df.id === f.id));
        const userDashboards = dashboards.filter(d => !DEMO_DATA.dashboards.some(dd => dd.id === d.id));

        localStorage.setItem('folders', JSON.stringify(userFolders));
        localStorage.setItem('dashboards', JSON.stringify(userDashboards));
    }, [folders, dashboards]);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (saveDropdownRef.current && !saveDropdownRef.current.contains(event.target as Node)) {
                setIsSaveDropdownOpen(false);
            }
        };
        if (isSaveDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isSaveDropdownOpen]);

    const toggleTheme = () => {
        const newTheme = themeMode === 'light' ? 'dark' : 'light';
        setThemeMode(newTheme);
        document.body.setAttribute('data-theme', newTheme);
    };

    const togglePanel = () => {
        setIsPanelCollapsed(!isPanelCollapsed);
    };
    
    const handleAllDashboardsClick = () => {
        setShowAllDashboards(prev => !prev);
        setIframeUrl(null);
        setActiveView('analytics');
    };

    const toggleEditMode = () => {
      setIsEditable((prev: boolean) => !prev);
    };
    
    const showIframeView = (url: string, view: 'data' | 'analytics' | 'admin' | 'usage' | null) => {
        setIframeUrl(url);
        setShowAllDashboards(false);
        setActiveView(view);
    };

    const showDashboardView = () => {
        setIframeUrl(null);
        setActiveView('csdk');
    };

    const onToggleUsageAnalytics = () => {
        showIframeView("https://aesandbox.sisensepoc.com/app/main/home?filters=usage", 'usage');
    };

    useEffect(() => {
        localStorage.setItem('themeMode', themeMode);
        document.body.setAttribute('data-theme', themeMode);
    }, [themeMode]);

    const [widgetInstances, setWidgetInstances] = useState<WidgetInstance[]>([]);
    
    useEffect(() => {
        const currentDashboard = dashboards.find(d => d.id === activeDashboardId);
        if (currentDashboard) {
            setWidgetInstances(currentDashboard.widgetInstances || []);
            setThemeMode(currentDashboard.theme || 'dark');
        } else {
            setWidgetInstances([]);
        }
    }, [activeDashboardId, dashboards]);

    const widgets = widgetInstances.map(inst => {
        const catalogEntry = WIDGET_CATALOG.find(w => w.id === inst.id);
        return { ...catalogEntry, ...inst };
    });

    const layouts = { lg: widgetInstances.map(inst => inst.layout) };
    
    const [isLibraryOpen, setLibraryOpen] = useState(false);
    const [isEditorOpen, setEditorOpen] = useState(false);
    const [isSaveModalOpen, setSaveModalOpen] = useState(false);
    const [editingWidgetId, setEditingWidgetId] = useState<string | null>(null);

    const onLayoutChange = useCallback((newLayout: Layout[]) => {
        setWidgetInstances(prevInstances => {
            const instanceMap = new Map(prevInstances.map(inst => [inst.instanceId, inst]));
            return newLayout.map(layoutItem => {
                const instance = instanceMap.get(layoutItem.i);
                if (instance) {
                    return { ...instance, layout: layoutItem };
                }
                return null;
            }).filter((instance): instance is WidgetInstance => instance !== null);
        });
    }, []);

    const onResizeStop = useCallback((_: Layout[], __: Layout, newItem: Layout) => {
        setWidgetInstances(prev => prev.map(inst => inst.instanceId === newItem.i ? { ...inst, layout: newItem } : inst));
        setTimeout(() => window.dispatchEvent(new Event('resize')), 150);
    }, []);

    const addWidget = (widgetConfig: any) => {
        const instanceId = `${widgetConfig.id}-${Date.now()}`;
        const newWidgetInstance: WidgetInstance = {
            instanceId,
            id: widgetConfig.id,
            layout: { i: instanceId, x: (widgets.length * 3) % 12, y: Infinity, ...widgetConfig.defaultLayout }
        };
        setWidgetInstances(prev => [...prev, newWidgetInstance]);
        setLibraryOpen(false);
    };
    
    const removeWidget = (widgetInstanceId: string) => {
        setWidgetInstances(prev => prev.filter(inst => inst.instanceId !== widgetInstanceId));
    };

    const handleUpdateWidgetStyle = (style: GridlineStyle) => {
        if (!editingWidgetId) return;
        setWidgetInstances(prev =>
            prev.map(inst => {
                if (inst.instanceId === editingWidgetId) {
                  return { ...inst, styleConfig: { ...inst.styleConfig, gridLineStyle: style } };
                }
                return inst;
            })
        );
    };
    
    const openEditorForWidget = (widgetId: string) => {
        const widget = widgets.find(w => w.instanceId === widgetId);
        if (widget) {
          if (widget.id === 'styled-embed' || widget.id === 'embed') {
            setIsEmbedModalOpen({ open: true, instanceId: widget.instanceId });
          } else {
            setEditingWidgetId(widgetId);
            setEditorOpen(true);
          }
        }
    };
    
    const handleAddFolder = (name: string) => {
        const newFolder: Folder = { id: `f-${Date.now()}`, name };
        setFolders(prev => [...prev, newFolder]);
    };

    const handleUpdateFolder = (id: string, newName: string, newColor?: string) => {
        setFolders(prev => prev.map(f => f.id === id ? { ...f, name: newName, color: newColor } : f));
    };

    const handleUpdateDashboard = (id: string, newName: string) => {
        setDashboards(prev => prev.map(d => d.id === id ? { ...d, name: newName } : d));
    };

    const handleDeleteFolder = (id: string) => {
        setFolders(prev => prev.filter(f => f.id !== id));
        setDashboards(prev => prev.filter(d => d.folderId !== id));
    };

    const handleSaveDashboard = (folderId: string, name: string) => {
        const newDashboard: Dashboard = {
            id: `d-${Date.now()}`,
            name,
            folderId,
            widgetInstances: widgetInstances,
            theme: themeMode,
        };
        setDashboards(prev => [...prev, newDashboard]);
        setActiveDashboardId(newDashboard.id);
        setSaveModalOpen(false);
    };
    
    const handleSaveDashboardUpdate = () => {
        if (!activeDashboardId) return;

        setDashboards(prevDashboards =>
            prevDashboards.map(d =>
                d.id === activeDashboardId
                    ? {
                        ...d,
                        widgetInstances: widgetInstances,
                        theme: themeMode,
                      }
                    : d
            )
        );
        setIsSaveDropdownOpen(false);
    };

    const handleLoadDashboard = (dashboardId: string) => {
        setActiveDashboardId(dashboardId);
        const dashboard = dashboards.find(d => d.id === dashboardId);
        if (dashboard && dashboard.iframeUrl) {
            showIframeView(dashboard.iframeUrl, 'analytics');
        } else if (dashboard) {
            showDashboardView();
            setThemeMode(dashboard.theme || 'dark');
        }
    };

    const handleNewDashboard = () => {
        showDashboardView();
        setActiveDashboardId(null);
    };
    
    const handleSaveEmbed = (data: EmbedModalSaveData, instanceId?: string) => {
      const GRID_ROW_HEIGHT = 100;
      const GRID_COLUMNS = 12;
      const APPROX_GRID_WIDTH = 1200;
      const APPROX_COL_WIDTH = APPROX_GRID_WIDTH / GRID_COLUMNS;
      const GRID_ITEM_MARGIN = 10;
      
      const updateOrAdd = (newInstanceData: Partial<WidgetInstance>) => {
        if (instanceId) {
          setWidgetInstances(prev => prev.map(inst => inst.instanceId === instanceId ? { ...inst, ...newInstanceData } : inst));
        } else {
          const newId = newInstanceData.id || 'embed';
          const newInstanceId = `${newId}-${Date.now()}`;
          const newWidgetInstance: WidgetInstance = {
            instanceId: newInstanceId,
            id: newId,
            layout: { i: newInstanceId, x: (widgets.length * 6) % 12, y: Infinity, w: 6, h: 8 },
            ...newInstanceData,
          };
          setWidgetInstances(prev => [...prev, newWidgetInstance]);
        }
      };

      if (data.type === 'styled') {
          const { styleConfig } = data.config;
          const w = Math.ceil(styleConfig.width / (APPROX_COL_WIDTH + GRID_ITEM_MARGIN));
          const h = Math.ceil(styleConfig.height / (GRID_ROW_HEIGHT + GRID_ITEM_MARGIN));
          
          if (instanceId) {
            setWidgetInstances(prev => prev.map(inst => {
              if (inst.instanceId === instanceId) {
                return {
                  ...inst,
                  widgetOid: data.config.widgetOid,
                  dashboardOid: data.config.dashboardOid,
                  styleConfig: data.config.styleConfig,
                  layout: { ...inst.layout, w, h }
                };
              }
              return inst;
            }));
          } else {
            const newId = 'styled-embed';
            const newInstanceId = `${newId}-${Date.now()}`;
            const newWidgetInstance: WidgetInstance = {
              instanceId: newInstanceId,
              id: newId,
              layout: { i: newInstanceId, x: (widgets.length * 6) % 12, y: Infinity, w, h },
              widgetOid: data.config.widgetOid,
              dashboardOid: data.config.dashboardOid,
              styleConfig: data.config.styleConfig,
            };
            setWidgetInstances(prev => [...prev, newWidgetInstance]);
          }
      } else {
          updateOrAdd({
            id: 'embed',
            embedCode: data.type === 'sdk' || data.type === 'html' ? data.embedCode : undefined,
            styleConfig: undefined,
            widgetOid: undefined,
            dashboardOid: undefined,
          });
      }
      setIsEmbedModalOpen({ open: false });
    };

    const handleTitleDoubleClick = () => {
        const currentDashboard = dashboards.find(d => d.id === activeDashboardId);
        if (isEditable && (currentDashboard || !activeDashboardId)) {
            setIsEditingTitle(true);
            setEditingTitleValue(currentDashboard ? currentDashboard.name : 'FP&A Demo');
        }
    };

    const handleSaveTitle = () => {
        if (activeDashboardId && editingTitleValue.trim()) {
            handleUpdateDashboard(activeDashboardId, editingTitleValue.trim());
        }
        setIsEditingTitle(false);
    };

    const handleCancelTitleEdit = () => {
        setIsEditingTitle(false);
    };

    const handleDeleteDashboard = (dashboardId: string) => {
        setDashboards(prev => prev.filter(d => d.id !== dashboardId));
        if (activeDashboardId === dashboardId) {
            setActiveDashboardId(null);
        }
    };

    const [contextMenu, setContextMenu] = useState<{ visible: boolean; x: number; y: number; widgetId: string | null; }>({
        visible: false, x: 0, y: 0, widgetId: null,
    });

    const handleContextMenu = (event: React.MouseEvent, widgetId: string) => {
        event.preventDefault();
        if (!isEditable) return;
        setContextMenu({ visible: true, x: event.clientX, y: event.clientY, widgetId });
    };

    const closeContextMenu = useCallback(() => {
        setContextMenu(prev => ({ ...prev, visible: false }));
    }, []);

    useEffect(() => {
        if (contextMenu.visible) {
            window.addEventListener('click', closeContextMenu);
            return () => window.removeEventListener('click', closeContextMenu);
        }
    }, [contextMenu.visible, closeContextMenu]);

    const handleOpenInNewWindow = (dashboardId: string) => {
        const dashboard = dashboards.find(d => d.id === dashboardId);
        if (dashboard && dashboard.iframeUrl) {
            window.open(dashboard.iframeUrl, '_blank', 'noopener,noreferrer');
        }
    };

    const sisenseUrl = import.meta.env.VITE_SISENSE_URL;
    const sisenseToken = import.meta.env.VITE_SISENSE_TOKEN;

    if (!sisenseUrl || !sisenseToken) {
      return (
        <div className="config-error">
          <h1>Configuration Error</h1>
          <p>Please set <code>VITE_SISENSE_URL</code> and <code>VITE_SISENSE_TOKEN</code> in your <code>.env.local</code> file.</p>
        </div>
      );
    }

    const currentlyEditingWidget = widgets.find(w => w.instanceId === editingWidgetId);
    const currentlyEditingEmbed = isEmbedModalOpen.instanceId ? widgets.find(w => w.instanceId === isEmbedModalOpen.instanceId) : null;
    const currentDashboardName = dashboards.find(d => d.id === activeDashboardId)?.name || 'FP&A Demo';

    const onBeforeRenderStyledWidget = (options: any, styleConfig: StyleConfig) => {
        // This function is for chart-specific styles
        if (!options.chart) options.chart = {};
        options.chart.backgroundColor = 'transparent';

        const baseColors = [styleConfig.paletteColor1, styleConfig.paletteColor2, styleConfig.paletteColor3];
        const palette = baseColors.map((color: string) => adjustVibrance(color, styleConfig.vibrance));
        options.colors = palette;
    
        if (options.series) {
            options.series.forEach((s: any, index: number) => {
                s.color = palette[index % palette.length];
            });
        }
        
        const axisOptions = {
            gridLineColor: styleConfig.axisColor,
            lineColor: styleConfig.axisColor,
            tickColor: styleConfig.axisColor
        };
    
        const applyGridStyle = (axisCollection: any, style: { width: number; dashStyle?: 'Solid' | 'Dot' }) => {
            if (!axisCollection) return;
            (Array.isArray(axisCollection) ? axisCollection : [axisCollection]).forEach((axis: any) => {
                axis.gridLineWidth = style.width;
                if (style.dashStyle) {
                    axis.gridLineDashStyle = style.dashStyle;
                }
            });
        };
        
        if (options.xAxis) (Array.isArray(options.xAxis) ? options.xAxis : [options.xAxis]).forEach((axis: any) => Highcharts.merge(true, axis, axisOptions));
        if (options.yAxis) (Array.isArray(options.yAxis) ? options.yAxis : [options.yAxis]).forEach((axis: any) => Highcharts.merge(true, axis, axisOptions));
    
        switch (styleConfig.gridLineStyle) {
            case 'both':
                applyGridStyle(options.xAxis, { width: 1, dashStyle: 'Solid' });
                applyGridStyle(options.yAxis, { width: 1, dashStyle: 'Solid' });
                break;
            case 'y-only':
                applyGridStyle(options.xAxis, { width: 0 });
                applyGridStyle(options.yAxis, { width: 1, dashStyle: 'Solid' });
                break;
            case 'x-only':
                applyGridStyle(options.xAxis, { width: 1, dashStyle: 'Solid' });
                applyGridStyle(options.yAxis, { width: 0 });
                break;
            case 'dots':
                applyGridStyle(options.xAxis, { width: 1, dashStyle: 'Dot' });
                applyGridStyle(options.yAxis, { width: 1, dashStyle: 'Dot' });
                break;
            case 'none':
                applyGridStyle(options.xAxis, { width: 0 });
                applyGridStyle(options.yAxis, { width: 0 });
                break;
        }
          
          if (!options.legend) options.legend = {};
          if (styleConfig.legendPosition === 'hidden') {
            options.legend.enabled = false;
          } else {
            options.legend.enabled = true;
            options.legend.align = (styleConfig.legendPosition === 'left' || styleConfig.legendPosition === 'right') ? styleConfig.legendPosition : 'center';
            options.legend.verticalAlign = (styleConfig.legendPosition === 'top' || styleConfig.legendPosition === 'bottom') ? styleConfig.legendPosition : 'middle';
            options.legend.layout = (styleConfig.legendPosition === 'left' || styleConfig.legendPosition === 'right') ? 'vertical' : 'horizontal';
          }
          
          if (!options.plotOptions) options.plotOptions = {};
          options.plotOptions.series = { ...options.plotOptions.series, borderRadius: styleConfig.borderRadius, pointWidth: styleConfig.barWidth, opacity: styleConfig.barOpacity, borderColor: styleConfig.borderColor, borderWidth: 1 };
          options.plotOptions.pie = { ...options.plotOptions.pie, innerSize: styleConfig.isDonut ? `${styleConfig.donutWidth}%` : '0%', opacity: styleConfig.pieOpacity, borderColor: styleConfig.borderColor, borderWidth: 2 };
          options.plotOptions.line = { ...options.plotOptions.line, lineWidth: styleConfig.lineWidth, marker: { ...options.plotOptions.line?.marker, radius: styleConfig.markerRadius } };
          options.plotOptions.area = { ...options.plotOptions.area, lineWidth: styleConfig.lineWidth, marker: { ...options.plotOptions.area?.marker, radius: styleConfig.markerRadius } };
    
          if (styleConfig.applyGradient && options.series) {
            options.series.forEach((s: any) => {
              if (s.type === 'area') {
                s.fillColor = {
                  linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
                  stops: [[0, s.color + '90'], [1, '#FFFFFF00']],
                };
              }
            });
          }
        return options;
    };

    return (
        <SisenseContextProvider url={sisenseUrl} token={sisenseToken}>
            <ThemeProvider theme={themeMode === 'dark' ? darkTheme : lightTheme}>
                <div className="app-root">
                    <Header 
                        isEditable={isEditable} 
                        toggleEditMode={toggleEditMode}
                        onNewDashboard={handleNewDashboard}
                        onAddEmbed={() => setIsEmbedModalOpen({ open: true })}
                        themeMode={themeMode}
                        onToggleAnalytics={() => showIframeView("https://aesandbox.sisensepoc.com/app/main/home?embed=true", 'analytics')}
                        onToggleAdmin={() => showIframeView("https://aesandbox.sisensepoc.com/app/settings?embed=true", 'admin')}
                        onToggleData={() => showIframeView("https://aesandbox.sisensepoc.com/app/data?embed=true", 'data')}
                        onProfileClick={() => showIframeView("https://aesandbox.sisensepoc.com/app/profile/personalinfo?embed=true", null)}
                        onToggleCSDK={showDashboardView}
                        activeView={activeView}
                    />
                    <div className="app-body">
                        <SidePanel 
                            isCollapsed={isPanelCollapsed}
                            togglePanel={togglePanel}
                            folders={folders}
                            dashboards={dashboards}
                            activeDashboardId={activeDashboardId}
                            onAddFolder={handleAddFolder}
                            onUpdateFolder={handleUpdateFolder}
                            onUpdateDashboard={handleUpdateDashboard}
                            onDeleteFolder={handleDeleteFolder}
                            onLoadDashboard={handleLoadDashboard}
                            onDeleteDashboard={handleDeleteDashboard}
                            onAllDashboardsClick={handleAllDashboardsClick}
                            onToggleUsageAnalytics={onToggleUsageAnalytics}
                            activeView={activeView}
                            showAllDashboards={showAllDashboards}
                            onOpenInNewWindow={handleOpenInNewWindow}
                        />
                        <div className="content-wrapper">
                            {iframeUrl ? (
                                <iframe 
                                    className="content-iframe"
                                    src={iframeUrl}
                                    frameBorder="0"
                                ></iframe>
                            ) : (
                                <>
                                    <div className="dashboard-toolbar">
                                        <div className="toolbar-left">
                                            {isEditingTitle ? (
                                                <div className="title-edit-container">
                                                    <input
                                                        type="text"
                                                        value={editingTitleValue}
                                                        onChange={(e) => setEditingTitleValue(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') handleSaveTitle();
                                                            if (e.key === 'Escape') handleCancelTitleEdit();
                                                        }}
                                                        onBlur={handleCancelTitleEdit}
                                                        autoFocus
                                                        className="dashboard-title-input"
                                                    />
                                                    <div className="edit-actions">
                                                        <i className="fas fa-check save-icon" onClick={handleSaveTitle}></i>
                                                        <i className="fas fa-times cancel-icon" onClick={handleCancelTitleEdit}></i>
                                                    </div>
                                                </div>
                                            ) : (
                                                <h1 className="dashboard-title" onDoubleClick={handleTitleDoubleClick}>
                                                    {currentDashboardName}
                                                </h1>
                                            )}
                                        </div>
                                        <div className="toolbar-right">
                                            <div className="save-button-container" ref={saveDropdownRef}>
                                                <button className="action-button" onClick={() => setIsSaveDropdownOpen(prev => !prev)}>
                                                    Save View
                                                </button>
                                                {isSaveDropdownOpen && (
                                                    <SaveDropdown
                                                        onSave={handleSaveDashboardUpdate}
                                                        onSaveAs={() => {
                                                            setSaveModalOpen(true);
                                                            setIsSaveDropdownOpen(false);
                                                        }}
                                                        isSaveDisabled={!activeDashboardId}
                                                    />
                                                )}
                                            </div>
                                            <button className="action-button primary" onClick={() => setLibraryOpen(true)}>+ Add Widget</button>
                                            <ThemeToggleButton theme={themeMode} toggleTheme={toggleTheme} />
                                        </div>
                                    </div>

                                    <ResponsiveGridLayout
                                        className={`layout ${isEditable ? 'is-editable' : ''}`}
                                        layouts={layouts}
                                        onLayoutChange={onLayoutChange}
                                        isDraggable={isEditable}
                                        isResizable={isEditable}
                                        onResizeStop={onResizeStop}
                                        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 2 }}
                                        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                                        rowHeight={100}
                                        compactType="vertical"
                                    >
                                        {widgets.map((w) => {
                                            const WidgetComponent = (w as any).component;
                                            const oids = WIDGET_OID_MAP[w.id];
                                            const gridLineStyle = (w as any).styleConfig?.gridLineStyle || 'both';

                                            return (
                                                <div
                                                    key={w.instanceId}
                                                    className={`widget-container ${isEditable ? 'is-editable' : ''}`}
                                                    onContextMenu={(e) => handleContextMenu(e, w.instanceId)}
                                                >
                                                    {w.id === 'styled-embed' && w.widgetOid && w.dashboardOid && w.styleConfig ? (
                                                        <DashboardWidget
                                                            widgetOid={w.widgetOid}
                                                            dashboardOid={w.dashboardOid}
                                                            styleOptions={getStyleOptionsFromConfig(w.styleConfig)}
                                                            onBeforeRender={(options: any) => onBeforeRenderStyledWidget(options, w.styleConfig)}
                                                        />
                                                    ) : w.id === 'embed' && w.embedCode ? (
                                                      <CodeBlock code={w.embedCode} />
                                                    ) : WidgetComponent ? (
                                                        <WidgetComponent
                                                            {...oids}
                                                            themeMode={themeMode}
                                                        />
                                                    ) : (
                                                        <DashboardWidget
                                                            widgetOid={oids?.widgetOid}
                                                            dashboardOid={oids?.dashboardOid}
                                                            title={w.id.startsWith('kpi') ? undefined : w.title}
                                                            styleOptions={getStyleOptions(themeMode)}
                                                            onBeforeRender={
                                                                w.id === 'chart1' ? (opts: any) => ltdSpendOnBeforeRender(opts, gridLineStyle) :
                                                                w.id === 'chart2' ? (opts: any) => actualForecastOnBeforeRender(opts, gridLineStyle) :
                                                                (w.id === 'table1' || w.id === 'chart6') ? undefined :
                                                                (options: any) => applyTheming(options, detailedBudgetTooltipFormatter, gridLineStyle)
                                                            }
                                                        />
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </ResponsiveGridLayout>
                                </>
                            )}
                        </div>
                    </div>

                    {isLibraryOpen && ( <Modal onClose={() => setLibraryOpen(false)} title="Widget Library"><WidgetLibrary onAddWidget={addWidget} /></Modal> )}
                    
                    {isSaveModalOpen && (
                        <Modal onClose={() => setSaveModalOpen(false)} title="Save Dashboard View">
                            <SaveDashboardForm folders={folders} onSave={handleSaveDashboard} />
                        </Modal>
                    )}

                    {isEditorOpen && currentlyEditingWidget && (
                        <Modal onClose={() => setEditorOpen(false)} title={`Editing: ${currentlyEditingWidget.title}`}>
                            <WidgetEditor
                                currentStyle={(currentlyEditingWidget as any).styleConfig?.gridLineStyle || 'both'}
                                onStyleChange={handleUpdateWidgetStyle}
                            />
                        </Modal>
                    )}

                    {isEmbedModalOpen.open && (
                        <EmbedModal
                            instanceId={isEmbedModalOpen.instanceId}
                            initialConfig={
                                currentlyEditingEmbed?.id === 'styled-embed'
                                ? {
                                    widgetOid: currentlyEditingEmbed.widgetOid || '',
                                    dashboardOid: currentlyEditingEmbed.dashboardOid || '',
                                    styleConfig: currentlyEditingEmbed.styleConfig,
                                  }
                                : undefined
                            }
                            initialEmbedCode={currentlyEditingEmbed?.id === 'embed' ? currentlyEditingEmbed.embedCode : undefined}
                            onClose={() => setIsEmbedModalOpen({ open: false })}
                            onSave={(data, instanceId) => {
                                handleSaveEmbed(data, instanceId);
                            }}
                        />
                    )}

                    {contextMenu.visible && (
                        <ContextMenu
                            x={contextMenu.x}
                            y={contextMenu.y}
                            widgetId={contextMenu.widgetId}
                            onEdit={() => {
                                if (contextMenu.widgetId) {
                                    openEditorForWidget(contextMenu.widgetId);
                                    closeContextMenu();
                                }
                            }}
                            onRemove={() => {
                                if (contextMenu.widgetId) {
                                    removeWidget(contextMenu.widgetId);
                                    closeContextMenu();
                                }
                            }}
                        />
                    )}
                </div>
            </ThemeProvider>
        </SisenseContextProvider>
    );
};

export default App;