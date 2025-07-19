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

  // Fonts & Header
  pdf.setFont('helvetica');
  pdf.setFontSize(20);
  pdf.setTextColor(0, 0, 128);
  pdf.text('GOVERNMENT OF INDIA', 105, 30, { align: 'center' });

  pdf.setFontSize(16);
  pdf.text('REVENUE DEPARTMENT', 105, 40, { align: 'center' });

  pdf.setFontSize(14);
  pdf.setTextColor(0, 0, 0);
  pdf.text('DIGITAL CERTIFICATE ISSUANCE SYSTEM', 105, 50, { align: 'center' });

  // Line
  pdf.setLineWidth(0.5);
  pdf.line(20, 55, 190, 55);

  // Title
  pdf.setFontSize(18);
  pdf.setTextColor(128, 0, 0);
  pdf.text(getCertificateTitle(data.certificateType), 105, 70, { align: 'center' });

  // Meta info
  pdf.setFontSize(12);
  pdf.setTextColor(0, 0, 0);
  pdf.text(`Certificate No: ${data.certificateNumber}`, 20, 85);
  pdf.text(`Issue Date: ${data.issuedDate}`, 150, 85);

  // Introduction
  pdf.setFontSize(12);
  pdf.text('This is to certify that:', 20, 105);

  // Personal details
  const details = [
    `Name: ${data.fullName}`,
    `Father's Name: ${data.fatherName}`,
    `Date of Birth: ${data.dateOfBirth}`,
    `Address: ${data.address}`
  ];

  let yPos = 120;
  details.forEach(line => {
    pdf.text(line, 25, yPos);
    yPos += 10;
  });

  // Certificate body text
  const certificateBody = getCertificateContent(data.certificateType, data.fullName);
  const wrappedText = pdf.splitTextToSize(certificateBody, 150);
  pdf.text(wrappedText, 20, yPos + 10);

  // Digital Signature section
  pdf.setFontSize(10);
  pdf.text('Digitally Signed', 20, 220);
  pdf.text(`Digital Signature: ${data.digitalSignature}`, 20, 230);

  // Official Seal Box
  pdf.rect(130, 200, 50, 30);
  pdf.setFontSize(8);
  pdf.text('OFFICIAL SEAL', 135, 215);
  pdf.text('REVENUE DEPARTMENT', 135, 220);

  // Authority Info
  pdf.setFontSize(10);
  pdf.text('Authorized Officer', 130, 245);
  pdf.text('Revenue Department', 130, 255);

  // Footer
  pdf.setFontSize(8);
  pdf.setTextColor(100, 100, 100);
  pdf.text('This is a computer generated certificate and does not require physical signature.', 105, 270, { align: 'center' });
  pdf.text('Verify at: https://your-domain.com/verify', 105, 280, { align: 'center' });

  return pdf;
};

// Adapter function: Convert Supabase object to CertificateData
export const generatePDFFromCertificate = (certificate: any) => {
  const certificateData: CertificateData = {
    certificateNumber: certificate.certificate_number,
    fullName: certificate.issued_to,
    fatherName: certificate.certificate_data?.father_name || '',
    dateOfBirth: certificate.certificate_data?.date_of_birth || '',
    address: certificate.certificate_data?.address || '',
    certificateType: certificate.certificate_type,
    issuedDate: new Date(certificate.issued_date).toLocaleDateString('en-IN'),
    digitalSignature: certificate.digital_signature || ''
  };

  const pdf = generateCertificatePDF(certificateData);
  pdf.save(`${certificateData.certificateType}-certificate-${certificateData.certificateNumber}.pdf`);
};

// Helper: Certificate titles
const getCertificateTitle = (type: string): string => {
  switch (type) {
    case 'caste':
      return 'CASTE CERTIFICATE';
    case 'income':
      return 'INCOME CERTIFICATE';
    case 'domicile':
      return 'DOMICILE CERTIFICATE';
    case 'residence':
      return 'RESIDENCE CERTIFICATE';
    default:
      return 'CERTIFICATE';
  }
};

// Helper: Certificate description
const getCertificateContent = (type: string, name: string): string => {
  switch (type) {
    case 'caste':
      return `This is to certify that ${name} belongs to the caste/community as mentioned in the application and is eligible for benefits under the reservation policy of the Government.`;
    case 'income':
      return `This is to certify that the annual income of ${name} or his/her family does not exceed the prescribed limit as per government norms.`;
    case 'domicile':
      return `This is to certify that ${name} is a permanent resident of this state and is entitled to domicile benefits as per state government rules.`;
    case 'residence':
      return `This is to certify that ${name} is a bona fide resident of the address mentioned above and has been residing at the said address.`;
    default:
      return `This certificate is issued to ${name} as per the application submitted.`;
  }
};
