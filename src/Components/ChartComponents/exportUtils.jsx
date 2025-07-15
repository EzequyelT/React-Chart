import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function useExportUtils(setExportMode, setMiniMapImage, setLoadingMiniMap) {

  async function waitForImagesToLoad(container) {
    if (!container) return;
    const images = container.querySelectorAll('img');
    const promises = Array.from(images).map(img => {
      if (img.complete && img.naturalHeight !== 0) return Promise.resolve();
      return new Promise(resolve => {
        img.onload = img.onerror = resolve;
      });
    });
    await Promise.all(promises);
  }

  async function handleExportImage() {
    setExportMode(true);
    await new Promise(resolve => setTimeout(resolve, 200));
    const treeElement = document.getElementById('org-tree');
    if (!treeElement) {
      setExportMode(false);
      return;
    }
    await waitForImagesToLoad(treeElement);
    const canvas = await html2canvas(treeElement, { scale: 2 });
    const link = document.createElement('a');
    link.download = 'organograma.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    setExportMode(false);
  }

  async function handleExportPDF() {
    setExportMode(true);
    await new Promise(resolve => setTimeout(resolve, 200));
    const treeElement = document.getElementById('org-tree');
    if (!treeElement) {
      setExportMode(false);
      return;
    }
    await waitForImagesToLoad(treeElement);
    const canvas = await html2canvas(treeElement, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [canvas.width, canvas.height],
    });
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save('organograma.pdf');
    setExportMode(false);
  }

  async function generateMiniMap() {
    const organograma = document.getElementById('org-tree');
    if (!organograma) return;

    setLoadingMiniMap(true);

    try {
      const canvas = await html2canvas(organograma, {
        scale: 3,
        useCORS: true,
      });
      const imgData = canvas.toDataURL('image/png');
      setMiniMapImage(imgData);
    } catch (error) {
      console.error('Erro ao gerar mini mapa:', error);
    } finally {
      setLoadingMiniMap(false);
    }
  }

  return {
    handleExportImage,
    handleExportPDF,
    generateMiniMap,
  };
}
