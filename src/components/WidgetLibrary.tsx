// src/components/WidgetLibrary.tsx
import React from 'react';
import './WidgetLibrary.css';

interface WidgetLibraryProps {
    onAddWidget: (widget: any) => void;
}

const WIDGET_CATALOG = [
    { id: 'kpi0', title: 'LTD Expensed (Custom)', defaultLayout: { w: 3, h: 3 } },
    { id: 'kpi1', title: 'LTD Reconciled', defaultLayout: { w: 3, h: 3 } },
    { id: 'kpi2', title: 'Trial budget', defaultLayout: { w: 3, h: 3 } },
    { id: 'kpi3', title: 'Remaining budget', defaultLayout: { w: 3, h: 3 } },
    { id: 'kpi4', title: '% Recognized', defaultLayout: { w: 3, h: 3 } },
    { id: 'kpi5', title: 'Enrolled Patients % (Custom)', defaultLayout: { w: 3, h: 3 } },
    { id: 'chart1', title: 'LTD trial spend', defaultLayout: { w: 6, h: 8 } },
    { id: 'chart2', title: 'Actual + forecast', defaultLayout: { w: 6, h: 8 } },
    { id: 'chart3', title: 'Cumulative total spend', defaultLayout: { w: 6, h: 8 } },
    { id: 'chart4', title: 'Budget vs forecast by cost category', defaultLayout: { w: 6, h: 8 } },
    { id: 'chart5', title: 'Vendor progress', defaultLayout: { w: 6, h: 8 } },
    { id: 'table1', title: 'Financial Summary', defaultLayout: { w: 12, h: 8 } },
    { id: 'chart6', title: 'Quarterly expenses', defaultLayout: { w: 12, h: 8 } },
    { id: 'chart7', title: 'Budget vs. Forecast (Custom)', defaultLayout: { w: 6, h: 8 } },
];


const WidgetLibrary: React.FC<WidgetLibraryProps> = ({ onAddWidget }) => {
  return (
    <div className="widget-library">
      {WIDGET_CATALOG.map((widget) => (
        <div key={widget.id} className="widget-card">
          <h4>{widget.title}</h4>
          <button onClick={() => onAddWidget(widget)}>+ Add to Dashboard</button>
        </div>
      ))}
    </div>
  );
};

export default WidgetLibrary;