
import html2canvas from 'html2canvas';

export const exportToPng = async (element: HTMLElement | null): Promise<void> => {
  if (!element) {
    throw new Error('No element provided for export');
  }
  
  try {
    const canvas = await html2canvas(element, {
      backgroundColor: null, // Transparent background
      scale: 2, // Higher quality
      logging: false
    });
    
    // Convert to PNG and download
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `word-cloud-${new Date().getTime()}.png`;
    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error('Error exporting to PNG:', error);
    throw error;
  }
};
