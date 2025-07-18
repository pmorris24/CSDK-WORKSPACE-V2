// src/components/GenericWidget.tsx
import React from 'react';
import './GenericWidget.css';

interface GenericWidgetProps {
  title: string;
  children: React.ReactNode;
}

const GenericWidget: React.FC<GenericWidgetProps> = ({ title, children }) => {
  return (
    <div className="generic-widget">
      <div className="widget-header">
        <h3 className="widget-title">{title}</h3>
      </div>
      <div className="widget-content">
        {children}
      </div>
    </div>
  );
};

export default GenericWidget;