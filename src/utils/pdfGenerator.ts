// src/utils/pdfGenerator.ts
import jsPDF from 'jspdf';

interface CertificateData {
  certificateNumber: string;
  fullName: string;
  fatherName: string;
  dateOfBirth: string;
  address: string;
  certificateType: 'caste' | 'income' | 'domicile' | 'residence';
  issuedDate: string;
  digitalSignature: string;
}

export const generateCertificatePDF = (data: CertificateData): jsPDF => {
  const pdf = new jsPDF('portrait', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const centerX = pageWidth / 2;

  // ====== IMAGE WATERMARK (Optional, if wanted) ======
  // Place your watermark logic here if needed (as in previous examples)

  // ====== HEADER ======
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(22);
  pdf.setTextColor(0, 51, 102); // Dark blue
  pdf.text('GOVERNMENT OF INDIA', centerX, 30, { align: 'center' });

  pdf.setFontSize(18);
  pdf.setTextColor(34, 85, 136); // Medium blue
  pdf.text('REVENUE DEPARTMENT', centerX, 40, { align: 'center' });

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(14);
  pdf.setTextColor(60, 60, 60); // Dark gray
  pdf.text('DIGITAL CERTIFICATE ISSUANCE SYSTEM', centerX, 50, { align: 'center' });

  // ====== BORDER ======
  pdf.setDrawColor(0, 102, 204); // Blue border
  pdf.setLineWidth(0.8);
  pdf.rect(15, 15, 180, 260); // Outer border with margin

  // ====== CERTIFICATE TITLE ======
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(20);
  pdf.setTextColor(153, 0, 0); // Maroon
  pdf.text(getCertificateTitle(data.certificateType), centerX, 70, { align: 'center' });

  // Title underline
  pdf.setDrawColor(153, 0, 0);
  pdf.setLineWidth(0.5);
  pdf.line(centerX - 50, 72, centerX + 50, 72);

  // ====== CERTIFICATE METADATA ======
  pdf.setFontSize(12);
  pdf.setTextColor(0, 0, 0);
  pdf.text(`Certificate No: ${data.certificateNumber}`, 20, 85);
  pdf.text(`Issue Date: ${data.issuedDate}`, 140, 85);

  // ====== INTRODUCTION ======
  pdf.setFontSize(12);
  pdf.text('This is to certify that:', 20, 105);

  // ====== PERSONAL DETAILS ======
  const details = [
    { label: "Name", value: data.fullName },
    { label: "Father's Name", value: data.fatherName },
    { label: "Date of Birth", value: data.dateOfBirth },
    { label: "Address", value: data.address }
  ];

  let yPos = 120;
  details.forEach(item => {
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${item.label}:`, 25, yPos);
    pdf.setFont('helvetica', 'normal');
    pdf.text(item.value, 25 + pdf.getStringUnitWidth(`${item.label}: `) * 5 + 5, yPos);
    yPos += 8;
  });

  // ====== CERTIFICATE BODY ======
  const certificateBody = getCertificateContent(data.certificateType, data.fullName);
  const wrappedText = pdf.splitTextToSize(certificateBody, 150);
  pdf.text(wrappedText, 20, yPos + 15);

  // ====== GREEN TICK (Instead of Seal) ======
  // Draw a simple green check mark at the same rectangle location where the seal was
  const tickX = 170;   // Center X of the tick (approximation)
  const tickY = 215;   // Center Y of the tick (approximation)
  const tickSize = 16; // Size of the tick length

  pdf.setLineWidth(3);
  pdf.setDrawColor(0, 160, 0); // Green color

  // Draw green tick (check mark)
  // Downstroke
  pdf.line(tickX - tickSize / 2, tickY, tickX - 2, tickY + tickSize / 3);
  // Upstroke
  pdf.line(tickX - 2, tickY + tickSize / 3, tickX + tickSize / 2, tickY - tickSize / 3);

  pdf.setLineWidth(0.8); // Reset for the rest

  // Optional: Add "VERIFIED" below the check mark
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 160, 0);
  pdf.text('VERIFIED', tickX, tickY + 15, { align: 'center' });

  // ====== DIGITAL SIGNATURE ======
  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0); // Reset to black
  pdf.setFont('helvetica', 'normal');
  pdf.text('Digitally Signed', 20, 220);
  pdf.text(`Signature ID: ${data.digitalSignature}`, 20, 225);

  // ====== AUTHORITY INFO ======
  pdf.setFontSize(10);

  pdf.text('Revenue Department', 150, 240);
  pdf.text('Government of India', 150, 235);

  // ====== FOOTER ======
  pdf.setFontSize(8);
  pdf.setTextColor(100, 100, 100);
  pdf.text('This is a digitally signed document and is legally valid without physical signature.', 
    centerX, 260, { align: 'center' });
  pdf.text(`Verify authenticity at: https://verify.gov.in/cert/${data.certificateNumber}`, 
    centerX, 265, { align: 'center' });
  pdf.text(`Certificate ID: ${data.certificateNumber} | Issued on: ${data.issuedDate}`, 
    centerX, 270, { align: 'center' });

  return pdf;
};

// Helper: Certificate titles
const getCertificateTitle = (type: string): string => {
  const titles: Record<string, string> = {
    'caste': 'CASTE CERTIFICATE',
    'income': 'INCOME CERTIFICATE',
    'domicile': 'DOMICILE CERTIFICATE',
    'residence': 'RESIDENCE CERTIFICATE'
  };
  return titles[type] || 'OFFICIAL CERTIFICATE';
};

// Helper: Certificate description
const getCertificateContent = (type: string, name: string): string => {
  const contents: Record<string, string> = {
    'caste': `This is to officially certify that ${name} belongs to the caste/community as verified by our records and is entitled to all benefits and privileges accorded to this category under the Constitution of India and subsequent government orders.`,
    'income': `This document certifies that the verified annual income of ${name} and family, from all sources, is as declared and falls within the prescribed limits for eligibility under government schemes.`,
    'domicile': `This certifies that ${name} is a bona fide resident of this state, having fulfilled all requirements for domicile status under the State Government regulations.`,
    'residence': `This serves as official confirmation that ${name} has been verified as a resident at the declared address, with all supporting documentation examined and approved.`
  };
  return contents[type] || `This is to certify that the particulars of ${name} have been duly verified and recorded in the official register.`;
};

// Adapter function
export const generatePDFFromCertificate = (certificate: any) => {
  const certificateData: CertificateData = {
    certificateNumber: certificate.certificate_number || `GOV-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
    fullName: certificate.issued_to || '',
    fatherName: certificate.certificate_data?.father_name || 'Not specified',
    dateOfBirth: certificate.certificate_data?.date_of_birth || 'Not specified',
    address: formatAddress(certificate.certificate_data?.address) || 'Not specified',
    certificateType: certificate.certificate_type || 'general',
    issuedDate: certificate.issued_date ? 
      new Date(certificate.issued_date).toLocaleDateString('en-IN', { 
        day: '2-digit', 
        month: 'long', 
        year: 'numeric' 
      }) : new Date().toLocaleDateString('en-IN'),
    digitalSignature: certificate.digital_signature || 'GOV-' + Math.random().toString(36).substring(2, 12).toUpperCase()
  };

  const pdf = generateCertificatePDF(certificateData);
  pdf.save(`${certificateData.certificateType}-certificate-${certificateData.certificateNumber}.pdf`);
};

// Helper: Format address
const formatAddress = (address: any): string => {
  if (!address) return '';
  if (typeof address === 'string') return address;
  
  return [
    address.street,
    address.city,
    address.district,
    address.state,
    address.pincode ? `PIN: ${address.pincode}` : ''
  ].filter(Boolean).join(', ');
};
