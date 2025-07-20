import React, { useEffect } from 'react';

// Declare Swal for TypeScript since it's loaded from a script tag in index.html
declare const Swal: any;

export const LoadingComponent: React.FC = () => {
  useEffect(() => {
    // This effect runs once on mount to show the loading modal.
    Swal.fire({
      title: '<div style="text-align: center;"><span style="color: #ff1a8c; font-size: 27px;">⏳ Loading Dashboard</span></div>',
      html: "Fetching data",
      footer: '<div style="text-align: center;"><span style="font-weight: bold; color: #000099;">Please wait..........</span></div>',
      timer: 60000, // Set a long timer to enable the progress bar. It will be closed programmatically when data loads.
      timerProgressBar: true,
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    // The cleanup function will be called when this component unmounts (i.e., when loading is done).
    return () => {
      if (Swal.isVisible()) {
        Swal.close();
      }
    };
  }, []); // Empty dependency array ensures this runs only once on mount.

  // Render a placeholder background while the Swal modal is active.
  return <div className="min-h-screen bg-gray-100" />;
};
