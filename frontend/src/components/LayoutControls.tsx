// src/components/LayoutControls.tsx

import React from 'react';
import { useGraphStore } from '../store';
import Panel from './ui/Panel';
import Button from './ui/Button';
import { Slider } from './ui/Slider';

const LayoutControls: React.FC = () => {
  const layoutName    = useGraphStore((s) => s.layoutName);
  const setLayoutName = useGraphStore((s) => s.setLayoutName);
  const params        = useGraphStore((s) => s.layoutParams);
  const setParams     = useGraphStore((s) => s.setLayoutParams);

  const update = (k: keyof typeof params) =>
    (v: number) => setParams({ [k]: v });

  return (
    <Panel title="Layout">
      <div className="grid grid-cols-3 gap-2 mb-4">
        {['grid', 'cose', 'circle', 'breadthfirst', 'dagre'].map((n) => (
          <Button
            key={n}
            size="sm"
            variant={layoutName === n ? 'primary' : 'secondary'}
            onClick={() => setLayoutName(n)}
          >
            {n.charAt(0).toUpperCase() + n.slice(1)}
          </Button>
        ))}
      </div>

      {layoutName === 'cose' && (
        <>
          <Slider
            label="Repulsion"
            min={1000}
            max={10000}
            step={100}
            value={params.repulsion}
            onChange={update('repulsion')}
          />
          <Slider
            label="Edge Length"
            min={20}
            max={300}
            step={5}
            value={params.edgeLength}
            onChange={update('edgeLength')}
          />
          <Slider
            label="Gravity"
            min={0}
            max={1}
            step={0.01}
            value={params.gravity}
            onChange={update('gravity')}
          />
        </>
      )}

      {(layoutName === 'concentric' ||
        layoutName === 'breadthfirst') && (
        <Slider
          label="Layer Spacing"
          min={10}
          max={300}
          step={5}
          value={params.layerSpacing}
          onChange={update('layerSpacing')}
        />
      )}

      <Button
        className="w-full mt-3"
        size="sm"
        variant="ghost"
        onClick={() => setLayoutName('preset')}
      >
        Freeze positions
      </Button>
    </Panel>
  );
};

export default LayoutControls;
