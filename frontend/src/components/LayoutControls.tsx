import React from 'react';
import { useGraphStore } from '../store';
import Panel from './ui/Panel';
import Button from './ui/Button';
import { Slider } from './ui/Slider';

const LayoutControls: React.FC = () => {
  const layoutName    = useGraphStore((s) => s.layoutName);
  const setLayoutName = useGraphStore((s) => s.setLayoutName);
  const p             = useGraphStore((s) => s.layoutParams);
  const setP          = useGraphStore((s) => s.setLayoutParams);

  const upd = (k: keyof typeof p) => (v: number | boolean) =>
    setP({ [k]: v } as any);

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
            {n}
          </Button>
        ))}
      </div>

      {layoutName === 'cose' && (
        <>
          <Slider label="Repulsion" min={1000} max={10000} step={100}
                  value={p.repulsion} onChange={upd('repulsion')} />
          <Slider label="Edge Len"  min={20} max={300} step={5}
                  value={p.edgeLength} onChange={upd('edgeLength')} />
          <Slider label="Gravity"   min={0} max={1} step={0.01}
                  value={p.gravity} onChange={upd('gravity')} />
          <label className="flex items-center gap-2 text-sm mt-2">
            <input type="checkbox" checked={p.infinite}
                   onChange={(e)=>upd('infinite')(e.target.checked)} />
            Live
          </label>
        </>
      )}

      {(layoutName === 'concentric' || layoutName === 'breadthfirst') && (
        <Slider label="Layer Spacing" min={10} max={300} step={5}
                value={p.layerSpacing} onChange={upd('layerSpacing')} />
      )}

      <Button className="w-full mt-3" size="sm" variant="ghost"
              onClick={() => setLayoutName('preset')}>
        Freeze
      </Button>
    </Panel>
  );
};

export default LayoutControls;
