
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FileText, CheckCircle, Upload, AlertCircle } from 'lucide-react';
import { useCertificateData } from '@/hooks/useCertificateData';
import { useAuth } from '@/hooks/useAuth';
import { DocumentUpload } from './DocumentUpload';
import { useNotifications } from '@/hooks/useNotifications';
import { useApplicationDocuments } from '@/hooks/useApplicationDocuments';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const CertificateApplication = () => {
  const { user } = useAuth();
  const { submitApplication } = useCertificateData();
  const { sendNotification } = useNotifications();
  const [submittedApplicationId, setSubmittedApplicationId] = useState<string | null>(null);
  const [tempApplicationId, setTempApplicationId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    certificate_type: '' as 'caste' | 'income' | 'domicile' | 'residence' | '',
    full_name: '',
    father_name: '',
    date_of_birth: '',
    address: '',
    phone_number: '',
    email: user?.email || '',
    purpose: '',
    additional_info: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);

  // Check if documents are uploaded for temp application
  const { data: uploadedDocuments } = useApplicationDocuments(tempApplicationId || '');
  const hasRequiredDocuments = uploadedDocuments && uploadedDocuments.length > 0;

  const certificateTypes = [
    { value: 'caste', label: 'Caste Certificate', description: 'Official caste verification document' },
    { value: 'income', label: 'Income Certificate', description: 'Income verification for government schemes' },
    { value: 'domicile', label: 'Domicile Certificate', description: 'Proof of residence in the state' },
    { value: 'residence', label: 'Residence Certificate', description: 'Local residence verification document' }
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.certificate_type) newErrors.certificate_type = 'Please select a certificate type';
    if (!formData.full_name.trim()) newErrors.full_name = 'Full name is required';
    if (!formData.father_name.trim()) newErrors.father_name = 'Father\'s name is required';
    if (!formData.date_of_birth) newErrors.date_of_birth = 'Date of birth is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.phone_number.trim()) newErrors.phone_number = 'Phone number is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.purpose.trim()) newErrors.purpose = 'Purpose is required';

    // Validate phone number format
    if (formData.phone_number && !/^\d{10}$/.test(formData.phone_number.replace(/\D/g, ''))) {
      newErrors.phone_number = 'Please enter a valid 10-digit phone number';
    }

    // Validate email format
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProceedToDocuments = async () => {
    if (!validateForm()) return;

    try {
      // Create a temporary application to get an ID for document uploads
      const result = await submitApplication.mutateAsync({
        certificate_type: formData.certificate_type as 'caste' | 'income' | 'domicile' | 'residence',
        full_name: formData.full_name,
        father_name: formData.father_name,
        date_of_birth: formData.date_of_birth,
        address: formData.address,
        phone_number: formData.phone_number,
        email: formData.email,
        purpose: formData.purpose,
        additional_info: formData.additional_info
      });

      if (result) {
        setTempApplicationId(result.id);
        setShowDocumentUpload(true);
      }
    } catch (error) {
      console.error('Error creating application:', error);
    }
  };

  const handleFinalSubmit = async () => {
    if (!hasRequiredDocuments) {
      alert('Please upload at least one supporting document before submitting your application.');
      return;
    }

    try {
      // Send notification email
      if (tempApplicationId) {
        await sendNotification.mutateAsync({
          applicationId: tempApplicationId,
          status: 'pending',
          userEmail: formData.email,
          userName: formData.full_name,
          certificateType: formData.certificate_type
        });

        setSubmittedApplicationId(tempApplicationId);
        setTempApplicationId(null);
        setShowDocumentUpload(false);
        
        // Reset form
        setFormData({
          certificate_type: '',
          full_name: '',
          father_name: '',
          date_of_birth: '',
          address: '',
          phone_number: '',
          email: user?.email || '',
          purpose: '',
          additional_info: ''
        });
      }
    } catch (error) {
      console.error('Error finalizing application:', error);
    }
  };

  if (submittedApplicationId) {
    return (
      <Card className="certificate-card">
        <CardHeader>
          <CardTitle className="flex items-center text-green-600">
            <CheckCircle className="h-6 w-6 mr-2" />
            Application Submitted Successfully!
          </CardTitle>
          <CardDescription>
            Your certificate application has been submitted with all required documents and is being processed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">Your application ID: <strong>{submittedApplicationId}</strong></p>
          <Button
            onClick={() => setSubmittedApplicationId(null)}
            variant="outline"
          >
            Submit Another Application
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (showDocumentUpload && tempApplicationId) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Upload className="h-6 w-6 mr-2" />
              Upload Required Documents
            </CardTitle>
            <CardDescription>
              Please upload supporting documents before submitting your application. At least one document is required.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!hasRequiredDocuments && (
              <Alert className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  You must upload at least one supporting document to proceed with your application.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
        
        <DocumentUpload 
          applicationId={tempApplicationId}
          onUploadComplete={() => {
            // Refresh the documents query
          }}
        />

        <Card>
          <CardContent className="pt-6">
            <div className="flex space-x-4">
              <Button
                onClick={() => setShowDocumentUpload(false)}
                variant="outline"
                className="flex-1"
              >
                Back to Form
              </Button>
              <Button
                onClick={handleFinalSubmit}
                disabled={!hasRequiredDocuments}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Submit Application
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Card className="certificate-card">
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="h-6 w-6 mr-2" />
          Apply for Certificate
        </CardTitle>
        <CardDescription>
          Fill out the form below to apply for your government certificate. You'll need to upload supporting documents before submission.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => { e.preventDefault(); handleProceedToDocuments(); }} className="space-y-6">
          {/* Certificate Type Selection */}
          <div className="space-y-4">
            <Label>Certificate Type *</Label>
            <RadioGroup
              value={formData.certificate_type}
              onValueChange={(value) => setFormData({ ...formData, certificate_type: value as any })}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {certificateTypes.map((cert) => (
                  <div key={cert.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={cert.value} id={cert.value} />
                    <div className="flex-1">
                      <label
                        htmlFor={cert.value}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {cert.label}
                      </label>
                      <p className="text-xs text-gray-500 mt-1">{cert.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </RadioGroup>
            {errors.certificate_type && (
              <p className="text-sm text-red-600">{errors.certificate_type}</p>
            )}
          </div>

          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Enter your full name"
              />
              {errors.full_name && <p className="text-sm text-red-600">{errors.full_name}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="father_name">Father's Name *</Label>
              <Input
                id="father_name"
                type="text"
                value={formData.father_name}
                onChange={(e) => setFormData({ ...formData, father_name: e.target.value })}
                placeholder="Enter your father's name"
              />
              {errors.father_name && <p className="text-sm text-red-600">{errors.father_name}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date_of_birth">Date of Birth *</Label>
              <Input
                id="date_of_birth"
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
              />
              {errors.date_of_birth && <p className="text-sm text-red-600">{errors.date_of_birth}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone_number">Phone Number *</Label>
              <Input
                id="phone_number"
                type="tel"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                placeholder="Enter your phone number"
              />
              {errors.phone_number && <p className="text-sm text-red-600">{errors.phone_number}</p>}
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter your email address"
              />
              {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Complete Address *</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Enter your complete address"
                rows={3}
              />
              {errors.address && <p className="text-sm text-red-600">{errors.address}</p>}
            </div>
          </div>

          {/* Purpose and Additional Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose of Certificate *</Label>
              <Textarea
                id="purpose"
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                placeholder="Explain why you need this certificate"
                rows={2}
              />
              {errors.purpose && <p className="text-sm text-red-600">{errors.purpose}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="additional_info">Additional Information (Optional)</Label>
              <Textarea
                id="additional_info"
                value={formData.additional_info}
                onChange={(e) => setFormData({ ...formData, additional_info: e.target.value })}
                placeholder="Any additional information you'd like to provide"
                rows={2}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setFormData({
                  certificate_type: '',
                  full_name: '',
                  father_name: '',
                  date_of_birth: '',
                  address: '',
                  phone_number: '',
                  email: user?.email || '',
                  purpose: '',
                  additional_info: ''
                });
                setErrors({});
              }}
            >
              Reset Form
            </Button>
            <Button
              type="submit"
              disabled={submitApplication.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {submitApplication.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Proceed to Document Upload
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
