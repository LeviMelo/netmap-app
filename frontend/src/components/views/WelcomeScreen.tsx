import React from 'react';

export const WelcomeScreen: React.FC = () => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Dynamic Animated Background */}
      <div className="absolute inset-0 bg-bg-primary overflow-hidden">
        {/* FIXED: Added animation classes for a "living" background effect */}
        <div 
          className="absolute -inset-1/4 bg-[radial-gradient(circle_at_30%_40%,rgba(249,115,22,0.1),transparent_50%)] animate-[pulse-glow_8s_ease-in-out_infinite]"
        />
        <div 
          className="absolute -inset-1/4 bg-[radial-gradient(circle_at_70%_60%,rgba(14,165,233,0.1),transparent_50%)] animate-[gentle-drift-one_25s_ease-in-out_-5s_infinite]"
        />
         <div 
          className="absolute -inset-1/4 bg-[radial-gradient(circle_at_50%_50%,rgba(234,179,8,0.05),transparent_60%)] animate-[gentle-drift-two_30s_ease-in-out_infinite]"
        />
        <div className="absolute inset-0 opacity-20">
          <div className="h-full w-full bg-[linear-gradient(rgba(15,23,42,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.1)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
        </div>
      </div>
      
      <div className="relative z-10 text-center max-w-2xl">
        <div className="mb-8">
          <div className="w-20 h-20 mx-auto relative group">
            {/* FIXED: Multi-layer drop-shadow for a glow based on logo colors */}
            <img 
              src="/src/assets/netmap_logo.png" 
              alt="NetMap Logo" 
              className="w-full h-full object-contain transition-transform group-hover:scale-110 duration-500 
                [filter:drop-shadow(0_2px_12px_rgba(249,115,22,0.5))_drop-shadow(0_2px_12px_rgba(14,165,233,0.4))]"
            />
          </div>
        </div>
        <h1 className="text-display font-bold mb-4 bg-gradient-to-r from-accent-primary via-accent-secondary to-accent-tertiary bg-clip-text text-transparent">
          Welcome to NetMap
        </h1>
        <p className="text-body-large text-text-muted mb-8 leading-relaxed">
          Create, visualize, and analyze concept maps with intuitive drag & drop editing, 
          smart layouts, and powerful export options.
        </p>
        <div className="mb-8">
          <button 
            onClick={() => {/* TODO */}}
            className="btn-base btn-primary text-lg px-8 py-4"
          >
            <span className="relative z-10">Create New Concept Map</span>
          </button>
        </div>
        <div className="text-small text-text-muted">
          or{' '}
          <button 
            onClick={() => {/* TODO */}}
            className="text-accent-secondary hover:text-accent-secondary-hover underline"
          >
            load from file
          </button>
        </div>
      </div>
    </div>
  );
};