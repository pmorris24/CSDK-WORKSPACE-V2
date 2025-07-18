// src/components/widgetstyler.tsx
import React from 'react';
import './widgetstyler.css';
import { type GridlineStyle } from './WidgetEditor';

export type ChartType = 
  'column' | 'bar' | 'pie' | 'area' | 'line' | 'other' |
  'indicator' | 'pivot' | 'table' | 'scatter' | 'treemap' | 
  'calendar' | 'scatterMap' | 'areaMap' | 'sunburst' | 
  'box' | 'polar' | 'funnel' | 'blox' | 'tabber';

export interface StyleConfig {
  gridLineStyle: GridlineStyle;
  backgroundColor: string;
  axisColor: string;
  borderColor: string;
  border: boolean;
  cornerRadius: 'Large' | 'Medium' | 'Small';
  shadow: 'Dark' | 'Medium' | 'Light' | 'None';
  spaceAround: 'Large' | 'Medium' | 'Small';
  headerBackgroundColor: string;
  headerDividerLine: boolean;
  headerDividerLineColor: string;
  headerHidden: boolean;
  headerTitleAlignment: 'Left' | 'Center';
  headerTitleTextColor: string;
  height: number;
  width: number;
  paletteColor1: string;
  paletteColor2: string;
  paletteColor3: string;
  legendPosition: 'right' | 'left' | 'top' | 'bottom' | 'hidden';
  chartType: ChartType;
  borderRadius: number;
  barWidth: number;
  barOpacity: number;
  vibrance: number;
  lineWidth: number;
  markerRadius: number;
  isDonut: boolean;
  donutWidth: number;
  pieOpacity: number;
  applyGradient: boolean;
}

interface WidgetStylerProps {
  styleConfig: StyleConfig;
  onStyleChange: (newConfig: Partial<StyleConfig>) => void;
}

const ColorPickerCombo: React.FC<{
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ label, name, value, onChange }) => (
    <div className="styler-control">
        <label className="styler-label" htmlFor={`${name}-text`}>{label}</label>
        <div className="styler-color-input-combo">
            <input
                type="color"
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                className="swatch"
                aria-label={`${label} color picker`}
            />
            <span className="hex-input">{value.toUpperCase()}</span>
        </div>
    </div>
);

const SliderControl: React.FC<{
    label: string;
    name: string;
    value: number;
    min: number;
    max: number;
    step: number;
    unit: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ label, name, value, min, max, step, unit, onChange }) => {
    const displayValue = (unit === '%' && max > 1) ? value : (unit === '%' ? Math.round(value * 100) : Math.round(value));
    const percentage = ((value - min) / (max - min)) * 100;
    const sliderStyle = { '--slider-percentage': `${percentage}%` } as React.CSSProperties;

    return (
        <div className="styler-control">
            <div className="styler-control-row">
                <label htmlFor={name} className="styler-label">{label}</label>
                <span className="range-value">{displayValue}{unit}</span>
            </div>
            <div className="slider-container">
                <input
                    type="range"
                    id={name}
                    name={name}
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={onChange}
                    className="styler-range"
                    style={sliderStyle}
                    data-type="number"
                />
            </div>
        </div>
    );
};

const ToggleSwitchControl: React.FC<{
    label: string;
    name: string;
    checked: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ label, name, checked, onChange }) => (
    <div className="styler-control-row styler-switch-control">
        <label htmlFor={name} className="styler-label">{label}</label>
        <label className="switch">
            <input type="checkbox" id={name} name={name} checked={checked} onChange={onChange} />
            <span className="slider"></span>
        </label>
    </div>
);


const WidgetStyler: React.FC<WidgetStylerProps> = ({ styleConfig, onStyleChange }) => {
  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let finalValue: string | number | boolean;
    if (type === 'checkbox') {
      finalValue = (e.target as HTMLInputElement).checked;
    } else if (type === 'range' || e.target.dataset.type === 'number' || type === 'number') {
      finalValue = Number(value);
    } else {
      finalValue = value;
    }
    onStyleChange({ [name]: finalValue });
  };

  const gridlineOptions: { value: GridlineStyle; label: string }[] = [
    { value: 'both', label: 'Standard' }, { value: 'y-only', label: 'Horizontal Only' },
    { value: 'x-only', label: 'Vertical Only' }, { value: 'dots', label: 'Dotted' },
    { value: 'none', label: 'None' },
  ];
  
  return (
    <div className="panel-content styler-panel-content">
      <div className='styler-content styler-grid-6col'>
        <div className="styler-column">
            <div className="styler-section">
              <h4 className="styler-section-title"><i className="fas fa-cog"></i> Chart Configuration</h4>
              <div className="styler-control">
                <label className="styler-label" htmlFor="chartType">Chart Type</label>
                <select id="chartType" name="chartType" className="styler-select" value={styleConfig.chartType} onChange={handleValueChange}>
                  <option value="indicator">Indicator</option>
                  <option value="pie">Pie Chart</option>
                  <option value="column">Column Chart</option>
                  <option value="bar">Bar Chart</option>
                  <option value="line">Line Chart</option>
                  <option value="area">Area Chart</option>
                  <option value="pivot">Pivot</option>
                  <option value="table">Table</option>
                  <option value="scatter">Scatter Chart</option>
                  <option value="treemap">Treemap</option>
                  <option value="calendar">Calendar Heatmap</option>
                  <option value="scatterMap">Scatter Map</option>
                  <option value="areaMap">Area Map</option>
                  <option value="sunburst">Sunburst</option>
                  <option value="box">Box & Whisker Plot</option>
                  <option value="polar">Polar Chart</option>
                  <option value="funnel">Funnel Chart</option>
                  <option value="blox">BloX</option>
                  <option value="tabber">Tabber</option>
                </select>
              </div>
              <div className="styler-control">
                <label className="styler-label" htmlFor="legendPosition">Legend Position</label>
                <select id="legendPosition" name="legendPosition" className="styler-select" value={styleConfig.legendPosition} onChange={handleValueChange}>
                  <option value="right">Right</option> <option value="left">Left</option>
                  <option value="top">Top</option> <option value="bottom">Bottom</option>
                  <option value="hidden">Hidden</option>
                </select>
              </div>
            </div>
        </div>

        <div className="styler-column">
            <div className="styler-section">
              <h4 className="styler-section-title"><i className="fas fa-paint-brush"></i> General Appearance</h4>
              <ColorPickerCombo label="Background Color" name="backgroundColor" value={styleConfig.backgroundColor} onChange={handleValueChange} />
              <ColorPickerCombo label="Border Color" name="borderColor" value={styleConfig.borderColor} onChange={handleValueChange} />
                <ToggleSwitchControl label="Border" name="border" checked={styleConfig.border} onChange={handleValueChange} />
                <div className="styler-control">
                    <label className="styler-label" htmlFor="cornerRadius">Corner Radius</label>
                    <select id="cornerRadius" name="cornerRadius" className="styler-select" value={styleConfig.cornerRadius} onChange={handleValueChange}>
                        <option value="Small">Small</option>
                        <option value="Medium">Medium</option>
                        <option value="Large">Large</option>
                    </select>
                </div>
            </div>
        </div>
        
        <div className="styler-column">
            <div className="styler-section">
              <h4 className="styler-section-title"><i className="fas fa-window-maximize"></i> Header</h4>
              <ColorPickerCombo label="Background Color" name="headerBackgroundColor" value={styleConfig.headerBackgroundColor} onChange={handleValueChange} />
              <ColorPickerCombo label="Title Text Color" name="headerTitleTextColor" value={styleConfig.headerTitleTextColor} onChange={handleValueChange} />
                <ToggleSwitchControl label="Hidden" name="headerHidden" checked={styleConfig.headerHidden} onChange={handleValueChange} />
                <div className="styler-control">
                    <label className="styler-label" htmlFor="headerTitleAlignment">Title Alignment</label>
                    <select id="headerTitleAlignment" name="headerTitleAlignment" className="styler-select" value={styleConfig.headerTitleAlignment} onChange={handleValueChange}>
                        <option value="Left">Left</option>
                        <option value="Center">Center</option>
                    </select>
                </div>
              <ToggleSwitchControl label="Divider Line" name="headerDividerLine" checked={styleConfig.headerDividerLine} onChange={handleValueChange} />
              <ColorPickerCombo label="Divider Line Color" name="headerDividerLineColor" value={styleConfig.headerDividerLineColor} onChange={handleValueChange} />
            </div>
        </div>
        
        <div className="styler-column">
            <div className="styler-section">
              <h4 className="styler-section-title"><i className="fas fa-arrows-alt"></i> Dimensions</h4>
              <SliderControl label="Width" name="width" value={styleConfig.width} min={200} max={1000} step={10} unit="px" onChange={handleValueChange} />
              <SliderControl label="Height" name="height" value={styleConfig.height} min={200} max={800} step={10} unit="px" onChange={handleValueChange} />
            </div>
            <div className="styler-section">
              <h4 className="styler-section-title"><i className="fas fa-border-all"></i> Axis & Gridlines</h4>
              <ColorPickerCombo label="Axis Color" name="axisColor" value={styleConfig.axisColor} onChange={handleValueChange} />
              <div className="styler-control">
                <label className="styler-label" htmlFor="gridLineStyle">Gridline Style</label>
                <select id="gridLineStyle" name="gridLineStyle" className="styler-select" value={styleConfig.gridLineStyle} onChange={handleValueChange}>
                  {gridlineOptions.map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                </select>
              </div>
            </div>
        </div>
        
        <div className="styler-column">
            <div className="styler-section">
                <h4 className="styler-section-title">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18.36,5.64A9,9,0,0,0,5.64,18.36a9,9,0,0,0,12.72,0A9,9,0,0,0,18.36,5.64Zm-1.41,1.41A7,7,0,0,1,12,20a7,7,0,0,1-4.95-12.95A7,7,0,0,1,16.95,7.05ZM12,8a1,1,0,1,0,1,1A1,1,0,0,0,12,8Zm-4,3a1,1,0,1,0,1,1A1,1,0,0,0,8,11Zm8,0a1,1,0,1,0,1,1A1,1,0,0,0,16,11Zm-4,4a1,1,0,1,0,1,1A1,1,0,0,0,12,15Z"/>
                  </svg>
                   Color Palette
                </h4>
                 <div className="styler-palette-grid">
                    <div className="palette-color-control">
                        <label className="styler-label" htmlFor="paletteColor1">Color 1</label>
                        <input type="color" id="paletteColor1" name="paletteColor1" value={styleConfig.paletteColor1} onChange={handleValueChange} className="styler-color-input-full" />
                    </div>
                    <div className="palette-color-control">
                        <label className="styler-label" htmlFor="paletteColor2">Color 2</label>
                        <input type="color" id="paletteColor2" name="paletteColor2" value={styleConfig.paletteColor2} onChange={handleValueChange} className="styler-color-input-full" />
                    </div>
                    <div className="palette-color-control">
                        <label className="styler-label" htmlFor="paletteColor3">Color 3</label>
                        <input type="color" id="paletteColor3" name="paletteColor3" value={styleConfig.paletteColor3} onChange={handleValueChange} className="styler-color-input-full" />
                    </div>
                </div>
                <SliderControl label="Color Vibrance" name="vibrance" value={styleConfig.vibrance} min={0} max={1} step={0.05} unit="%" onChange={handleValueChange} />
            </div>
        </div>
        <div className="styler-column">
            {(styleConfig.chartType === 'bar' || styleConfig.chartType === 'column') && (
              <div className="styler-section">
                <h4 className="styler-section-title"><i className="fas fa-chart-bar"></i> Bar/Column Styles</h4>
                <SliderControl label="Corner Radius" name="borderRadius" value={styleConfig.borderRadius} min={0} max={20} step={1} unit="px" onChange={handleValueChange} />
                <SliderControl label="Bar Width" name="barWidth" value={styleConfig.barWidth} min={10} max={80} step={1} unit="px" onChange={handleValueChange} />
                <SliderControl label="Bar Opacity" name="barOpacity" value={styleConfig.barOpacity} min={0.1} max={1} step={0.05} unit="%" onChange={handleValueChange} />
              </div>
            )}

            {styleConfig.chartType === 'pie' && (
              <div className="styler-section">
                <h4 className="styler-section-title"><i className="fas fa-chart-pie"></i> Pie/Donut Styles</h4>
                <ToggleSwitchControl label="Donut Chart" name="isDonut" checked={styleConfig.isDonut} onChange={handleValueChange} />
                {styleConfig.isDonut && (
                  <SliderControl label="Donut Width" name="donutWidth" value={styleConfig.donutWidth} min={10} max={90} step={5} unit="%" onChange={handleValueChange} />
                )}
                <SliderControl label="Pie Opacity" name="pieOpacity" value={styleConfig.pieOpacity} min={0.1} max={1} step={0.1} unit="%" onChange={handleValueChange} />
              </div>
            )}

            {(styleConfig.chartType === 'line' || styleConfig.chartType === 'area') && (
              <div className="styler-section">
                <h4 className="styler-section-title"><i className="fas fa-chart-line"></i> Line/Area Styles</h4>
                <SliderControl label="Line Width" name="lineWidth" value={styleConfig.lineWidth} min={1} max={10} step={1} unit="px" onChange={handleValueChange} />
                <SliderControl label="Marker Radius" name="markerRadius" value={styleConfig.markerRadius} min={0} max={10} step={1} unit="px" onChange={handleValueChange} />
                {styleConfig.chartType === 'area' && (
                  <ToggleSwitchControl label="Apply Gradient Fill" name="applyGradient" checked={styleConfig.applyGradient} onChange={handleValueChange} />
                )}
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default WidgetStyler;