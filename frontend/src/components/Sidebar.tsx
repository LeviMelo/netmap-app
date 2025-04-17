// frontend/src/components/Sidebar.tsx

// Basic functional component for the sidebar
const Sidebar: React.FC = () => {
  return (
    <div>
      {/* Use component class from index.css */}
      <h2 className="heading-2">Controls</h2>
      {/* Use text color variable via Tailwind */}
      <p className="text-sm text-text-secondary-dark">
          Input and editing controls will appear here.
      </p>
    </div>
  );
};

export default Sidebar;