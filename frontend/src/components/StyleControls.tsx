import React from 'react';
import { useGraphStore } from '../store';
import Panel from './ui/Panel';
import { Slider } from './ui/Slider';

const StyleControls: React.FC = () => {
  const sp   = useGraphStore((s) => s.styleParams);
  const setS = useGraphStore((s) => s.setStyleParams);

  return (
    <Panel title="Graph Style">
      <Slider label="Node Font" min={8} max={36} step={1}
              value={sp.nodeFont} onChange={(v)=>setS({nodeFont:v})}/>
      <Slider label="Edge Width" min={0.5} max={10} step={0.5}
              value={sp.edgeWidth} onChange={(v)=>setS({edgeWidth:v})}/>
    </Panel>
  );
};

export default StyleControls;
