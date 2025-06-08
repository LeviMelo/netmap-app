import React from 'react';

export const WelcomeScreen: React.FC = () => {
  return (
    // FIXED: Changed layout to a flex column to properly center content within the full viewport height.
    <div className="w-full h-full flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-bg-primary">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-secondary/5 via-accent-tertiary/3 to-accent-primary/5"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(249,115,22,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(14,165,233,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 opacity-20">
          <div className="h-full w-full bg-[linear-gradient(rgba(15,23,42,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.1)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
        </div>
      </div>
      
      {/* Welcome Content */}
      <div className="relative z-10 text-center max-w-2xl">
        <div className="mb-8">
          {/* FIXED: The glow effect is now a `drop-shadow` on the image itself,
              which is not clipped by parent boundaries, creating a diffuse glow.
              The extra divs for the glow have been removed.
          */}
          <div className="w-20 h-20 mx-auto relative group">
            <img 
              src="/src/assets/netmap_logo.png" 
              alt="NetMap Logo" 
              className="w-full h-full object-contain transition-transform group-hover:scale-110 duration-500 [filter:drop-shadow(0_0_1rem_rgba(249,115,22,0.3))]"
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