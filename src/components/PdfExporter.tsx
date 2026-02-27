
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Button } from './ui/button';

const PdfExporter = () => {
  const handleExport = () => {
    const toolProjectionElement = document.getElementById('tool-projection');
    if (toolProjectionElement) {
      toolProjectionElement.style.display = 'none';
    }

    html2canvas(document.body).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`exportacao-tela-${new Date().toISOString()}.pdf`);

      if (toolProjectionElement) {
        toolProjectionElement.style.display = 'block';
      }
    });
  };

  return (
    <div className="p-4">
      <Button onClick={handleExport}>Exportar Tela para PDF</Button>
    </div>
  );
};

export default PdfExporter;
