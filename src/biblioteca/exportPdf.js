import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function exportElementToPdf(element, filename) {
  const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#ffffff', useCORS: true });
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  const imgWidth = 210;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  let heightLeft = imgHeight;
  let position = 0;
  pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
  heightLeft -= 297;
  while (heightLeft > 0) {
    position -= 297;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= 297;
  }
  pdf.save(filename);
}