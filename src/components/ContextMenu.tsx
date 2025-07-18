// src/components/ContextMenu.tsx
import React from 'react';
import './ContextMenu.css';

interface ContextMenuProps {
  x: number;
  y: number;
  widgetId: string | null;
  onEdit: () => void;
  onRemove: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, onEdit, onRemove }) => {
  return (
    <div className="context-menu" style={{ top: y, left: x }}>
      <button onClick={onEdit}>Edit Widget</button>
      <button className="remove-button" onClick={onRemove}>
        Remove Widget
      </button>
    </div>
  );
};

export default ContextMenu;