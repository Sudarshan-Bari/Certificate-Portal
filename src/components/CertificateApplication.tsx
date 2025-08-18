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
import { DocumentUpload } from '@/components/DocumentUpload';
import { useNotifications } from '@/hooks/useNotifications';
import { useApplicationDocuments } from '@/hooks/useApplicationDocuments';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Define types for certificate configurations
type CertificateType = 'caste' | 'income' | 'domicile' | 'residence';

type FieldConfig = {
  type: string;
  required: boolean;
  label: string;
  options?: string[];
  fields?: Record<string, FieldConfig>;
};

type CertificateConfig = {
  label: string;
  description: string;
  fields: Record<string, FieldConfig>;
};

const certificateConfigs: Record<CertificateType, CertificateConfig> = {
  caste: {
    label: 'Caste Certificate',
    description: 'Official caste verification document',
    fields: {
      name: {
        type: 'name',
        required: true,
        label: 'Full Name',
        fields: {
          first_name: { type: 'text', required: true, label: 'First Name' },
          middle_name: { type: 'text', required: false, label: 'Middle Name' },
          last_name: { type: 'text', required: true, label: 'Last Name' }
        }
      },
      father_name: {
        type: 'name',
        required: true,
        label: "Father's Name",
        fields: {
          first_name: { type: 'text', required: true, label: 'First Name' },
          middle_name: { type: 'text', required: false, label: 'Middle Name' },
          last_name: { type: 'text', required: true, label: 'Last Name' }
        }
      },
      caste: { 
        type: 'select',
        required: true, 
        label: 'Caste Category',
        options: [
          'SC (Scheduled Caste)',
          'ST (Scheduled Tribe)',
          'OBC (Other Backward Class)',
          'VJ/NT (Vimukta Jati/Nomadic Tribe)',
          'SBC (Special Backward Class)',
          'Other'
        ]
      },
      date_of_birth: { type: 'date', required: true, label: 'Date of Birth' },
      address: { 
        type: 'address', 
        required: true, 
        label: 'Permanent Address',
        fields: {
          street: { type: 'text', required: true, label: 'Street Address' },
          city: { type: 'text', required: true, label: 'City/Town' },
          district: { type: 'text', required: true, label: 'District' },
          state: { type: 'text', required: true, label: 'State' },
          pincode: { type: 'text', required: true, label: 'Pincode' }
        }
      },
      phone_number: { type: 'tel', required: true, label: 'Mobile Number' },
      email: { type: 'email', required: true, label: 'Email Address' },
      purpose: { 
        type: 'select',
        required: true, 
        label: 'Purpose of Certificate',
        options: [
          'Education',
          'Employment',
          'Government Scheme',
          'Passport',
          'Other Official Work'
        ]
      }
    }
  },
  income: {
    label: 'Income Certificate',
    description: 'Income verification for government schemes',
    fields: {
      name: {
        type: 'name',
        required: true,
        label: 'Full Name',
        fields: {
          first_name: { type: 'text', required: true, label: 'First Name' },
          middle_name: { type: 'text', required: false, label: 'Middle Name' },
          last_name: { type: 'text', required: true, label: 'Last Name' }
        }
      },
      father_or_husband_name: {
        type: 'name',
        required: true,
        label: "Father's/Husband's Name",
        fields: {
          first_name: { type: 'text', required: true, label: 'First Name' },
          middle_name: { type: 'text', required: false, label: 'Middle Name' },
          last_name: { type: 'text', required: true, label: 'Last Name' }
        }
      },
      annual_income: { type: 'number', required: true, label: 'Annual Income (INR)' },
      date_of_birth: { type: 'date', required: true, label: 'Date of Birth' },
      address: { 
        type: 'address', 
        required: true, 
        label: 'Current Address',
        fields: {
          street: { type: 'text', required: true, label: 'Street Address' },
          city: { type: 'text', required: true, label: 'City/Town' },
          district: { type: 'text', required: true, label: 'District' },
          state: { type: 'text', required: true, label: 'State' },
          pincode: { type: 'text', required: true, label: 'Pincode' }
        }
      },
      phone_number: { type: 'tel', required: true, label: 'Mobile Number' },
      email: { type: 'email', required: true, label: 'Email Address' },
      purpose: { 
        type: 'select',
        required: true, 
        label: 'Purpose of Certificate',
        options: [
          'Education Scholarship',
          'Government Scheme',
          'Tax Exemption',
          'Housing Benefit',
          'Other'
        ]
      }
    }
  },
  domicile: {
    label: 'Domicile Certificate',
    description: 'Proof of residence in the state',
    fields: {
      name: {
        type: 'name',
        required: true,
        label: 'Full Name',
        fields: {
          first_name: { type: 'text', required: true, label: 'First Name' },
          middle_name: { type: 'text', required: false, label: 'Middle Name' },
          last_name: { type: 'text', required: true, label: 'Last Name' }
        }
      },
      date_of_birth: { type: 'date', required: true, label: 'Date of Birth' },
      address: { 
        type: 'address', 
        required: true, 
        label: 'Current Address',
        fields: {
          street: { type: 'text', required: true, label: 'Street Address' },
          city: { type: 'text', required: true, label: 'City/Town' },
          district: { type: 'text', required: true, label: 'District' },
          state: { type: 'text', required: true, label: 'State' },
          pincode: { type: 'text', required: true, label: 'Pincode' }
        }
      },
      phone_number: { type: 'tel', required: true, label: 'Mobile Number' },
      email: { type: 'email', required: true, label: 'Email Address' }
    }
  },
  residence: {
    label: 'Residence Certificate',
    description: 'Local residence verification document',
    fields: {
      name: {
        type: 'name',
        required: true,
        label: 'Full Name',
        fields: {
          first_name: { type: 'text', required: true, label: 'First Name' },
          middle_name: { type: 'text', required: false, label: 'Middle Name' },
          last_name: { type: 'text', required: true, label: 'Last Name' }
        }
      },
      date_of_birth: { type: 'date', required: true, label: 'Date of Birth' },
      address: { 
        type: 'address', 
        required: true, 
        label: 'Current Address',
        fields: {
          street: { type: 'text', required: true, label: 'Street Address' },
          city: { type: 'text', required: true, label: 'City/Town' },
          district: { type: 'text', required: true, label: 'District' },
          state: { type: 'text', required: true, label: 'State' },
          pincode: { type: 'text', required: true, label: 'Pincode' }
        }
      },
      phone_number: { type: 'tel', required: true, label: 'Mobile Number' },
      email: { type: 'email', required: true, label: 'Email Address' }
    }
  }
};

type FormData = {
  [key: string]: any;
  name: {
    first_name: string;
    middle_name: string;
    last_name: string;
  };
  father_name?: {
    first_name: string;
    middle_name: string;
    last_name: string;
  };
  father_or_husband_name?: {
    first_name: string;
    middle_name: string;
    last_name: string;
  };
  address: {
    street: string;
    city: string;
    district: string;
    state: string;
    pincode: string;
  };
  email: string;
};

export const CertificateApplication = () => {
  const { user } = useAuth();
  const { submitApplication } = useCertificateData();
  const { sendNotification } = useNotifications();
  const [submittedApplicationId, setSubmittedApplicationId] = useState<string | null>(null);
  const [tempApplicationId, setTempApplicationId] = useState<string | null>(null);
  
  const [selectedCertificate, setSelectedCertificate] = useState<CertificateType | ''>('');
  const [formData, setFormData] = useState<FormData>({ 
    email: user?.email || '',
    name: { first_name: '', middle_name: '', last_name: '' },
    father_name: { first_name: '', middle_name: '', last_name: '' },
    address: { street: '', city: '', district: '', state: '', pincode: '' }
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);

  const { data: uploadedDocuments } = useApplicationDocuments(tempApplicationId || '');
  const hasRequiredDocuments = !!uploadedDocuments?.length;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    const fields = selectedCertificate ? certificateConfigs[selectedCertificate].fields : {};

    if (!selectedCertificate) {
      newErrors.certificate_type = 'Please select a certificate type';
    }

    Object.entries(fields).forEach(([fieldName, config]) => {
      if (config.required) {
        if (config.type === 'name' || config.type === 'address') {
          Object.entries(config.fields || {}).forEach(([subField, subConfig]) => {
            if (subConfig.required && !formData[fieldName]?.[subField]?.trim()) {
              newErrors[`${fieldName}.${subField}`] = `${subConfig.label} is required`;
            }
          });
        } else if (!formData[fieldName]?.toString().trim()) {
          newErrors[fieldName] = `${config.label} is required`;
        }
      }
    });

    // Phone number validation
    if (fields.phone_number && formData.phone_number && !/^\d{10}$/.test(formData.phone_number)) {
      newErrors.phone_number = 'Please enter a valid 10-digit phone number';
    }

    // Email validation
    if (fields.email && formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Pincode validation
    if (fields.address && formData.address?.pincode && !/^\d{6}$/.test(formData.address.pincode)) {
      newErrors['address.pincode'] = 'Please enter a valid 6-digit pincode';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFieldChange = (fieldName: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
    
    if (errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const handleCompositeFieldChange = (parentField: string, subField: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [parentField]: {
        ...prev[parentField],
        [subField]: value
      }
    }));
    
    const errorKey = `${parentField}.${subField}`;
    if (errors[errorKey]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  const handleProceedToDocuments = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const submissionData: Record<string, any> = {
        certificate_type: selectedCertificate,
        ...formData
      };

      // Flatten nested objects for submission
      Object.entries(formData).forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          Object.entries(value).forEach(([subKey, subValue]) => {
            submissionData[`${key}_${subKey}`] = subValue;
          });
          delete submissionData[key];
        }
      });

      const result = await submitApplication.mutateAsync(submissionData);
      if (result?.id) {
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
      if (tempApplicationId) {
        await sendNotification.mutateAsync({
          applicationId: tempApplicationId,
          status: 'pending',
          userEmail: formData.email,
          userName: `${formData.name.first_name} ${formData.name.last_name}`.trim(),
          certificateType: selectedCertificate as string
        });

        setSubmittedApplicationId(tempApplicationId);
        setTempApplicationId(null);
        setShowDocumentUpload(false);
        
        // Reset form
        setSelectedCertificate('');
        setFormData({ 
          email: user?.email || '',
          name: { first_name: '', middle_name: '', last_name: '' },
          father_name: { first_name: '', middle_name: '', last_name: '' },
          address: { street: '', city: '', district: '', state: '', pincode: '' }
        });
      }
    } catch (error) {
      console.error('Error finalizing application:', error);
    }
  };

  const renderField = (fieldName: string, config: FieldConfig) => {
    switch (config.type) {
      case 'name':
        return (
          <div className="space-y-4">
            <Label>
              {config.label}
              {config.required && <span className="text-red-600"> *</span>}
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(config.fields || {}).map(([subField, subConfig]) => (
                <div key={subField} className="space-y-2">
                  <Label htmlFor={`${fieldName}_${subField}`}>
                    {subConfig.label}
                    {subConfig.required && <span className="text-red-600"> *</span>}
                  </Label>
                  <Input
                    id={`${fieldName}_${subField}`}
                    type="text"
                    value={formData[fieldName]?.[subField] || ''}
                    onChange={(e) => handleCompositeFieldChange(fieldName, subField, e.target.value)}
                    placeholder={`Enter ${subConfig.label.toLowerCase()}`}
                  />
                  {errors[`${fieldName}.${subField}`] && (
                    <p className="text-sm text-red-600">{errors[`${fieldName}.${subField}`]}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'address':
        return (
          <div className="space-y-4">
            <Label>
              {config.label}
              {config.required && <span className="text-red-600"> *</span>}
            </Label>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={`${fieldName}_street`}>Street Address</Label>
                <Input
                  id={`${fieldName}_street`}
                  type="text"
                  value={formData[fieldName]?.street || ''}
                  onChange={(e) => handleCompositeFieldChange(fieldName, 'street', e.target.value)}
                  placeholder="House no, Building, Street, Area"
                />
                {errors[`${fieldName}.street`] && (
                  <p className="text-sm text-red-600">{errors[`${fieldName}.street`]}</p>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`${fieldName}_city`}>City/Town</Label>
                  <Input
                    id={`${fieldName}_city`}
                    type="text"
                    value={formData[fieldName]?.city || ''}
                    onChange={(e) => handleCompositeFieldChange(fieldName, 'city', e.target.value)}
                    placeholder="Enter city/town"
                  />
                  {errors[`${fieldName}.city`] && (
                    <p className="text-sm text-red-600">{errors[`${fieldName}.city`]}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`${fieldName}_district`}>District</Label>
                  <Input
                    id={`${fieldName}_district`}
                    type="text"
                    value={formData[fieldName]?.district || ''}
                    onChange={(e) => handleCompositeFieldChange(fieldName, 'district', e.target.value)}
                    placeholder="Enter district"
                  />
                  {errors[`${fieldName}.district`] && (
                    <p className="text-sm text-red-600">{errors[`${fieldName}.district`]}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`${fieldName}_state`}>State</Label>
                  <Input
                    id={`${fieldName}_state`}
                    type="text"
                    value={formData[fieldName]?.state || ''}
                    onChange={(e) => handleCompositeFieldChange(fieldName, 'state', e.target.value)}
                    placeholder="Enter state"
                  />
                  {errors[`${fieldName}.state`] && (
                    <p className="text-sm text-red-600">{errors[`${fieldName}.state`]}</p>
                  )}
                </div>
              </div>
              
              <div className="w-full md:w-1/3 space-y-2">
                <Label htmlFor={`${fieldName}_pincode`}>Pincode</Label>
                <Input
                  id={`${fieldName}_pincode`}
                  type="text"
                  value={formData[fieldName]?.pincode || ''}
                  onChange={(e) => handleCompositeFieldChange(fieldName, 'pincode', e.target.value)}
                  placeholder="6-digit pincode"
                  maxLength={6}
                />
                {errors[`${fieldName}.pincode`] && (
                  <p className="text-sm text-red-600">{errors[`${fieldName}.pincode`]}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 'select':
        return (
          <div className="space-y-2">
            <Label htmlFor={fieldName}>
              {config.label}
              {config.required && <span className="text-red-600"> *</span>}
            </Label>
            <Select
              value={formData[fieldName] || ''}
              onValueChange={(value) => handleFieldChange(fieldName, value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={`Select ${config.label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {config.options?.map(option => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors[fieldName] && <p className="text-sm text-red-600">{errors[fieldName]}</p>}
          </div>
        );

      case 'date':
        return (
          <div className="space-y-2">
            <Label htmlFor={fieldName}>
              {config.label}
              {config.required && <span className="text-red-600"> *</span>}
            </Label>
            <Input
              id={fieldName}
              type="date"
              value={formData[fieldName] || ''}
              onChange={(e) => handleFieldChange(fieldName, e.target.value)}
              max={new Date().toISOString().split('T')[0]}
            />
            {errors[fieldName] && <p className="text-sm text-red-600">{errors[fieldName]}</p>}
          </div>
        );

      case 'textarea':
        return (
          <div className="space-y-2">
            <Label htmlFor={fieldName}>
              {config.label}
              {config.required && <span className="text-red-600"> *</span>}
            </Label>
            <Textarea
              id={fieldName}
              value={formData[fieldName] || ''}
              onChange={(e) => handleFieldChange(fieldName, e.target.value)}
              placeholder={`Enter ${config.label.toLowerCase()}`}
              rows={3}
            />
            {errors[fieldName] && <p className="text-sm text-red-600">{errors[fieldName]}</p>}
          </div>
        );

      default:
        return (
          <div className="space-y-2">
            <Label htmlFor={fieldName}>
              {config.label}
              {config.required && <span className="text-red-600"> *</span>}
            </Label>
            <Input
              id={fieldName}
              type={config.type === 'number' ? 'number' : 'text'}
              value={formData[fieldName] || ''}
              onChange={(e) => handleFieldChange(fieldName, e.target.value)}
              placeholder={`Enter ${config.label.toLowerCase()}`}
              min={config.type === 'number' ? 0 : undefined}
              maxLength={fieldName === 'phone_number' ? 10 : undefined}
            />
            {errors[fieldName] && <p className="text-sm text-red-600">{errors[fieldName]}</p>}
          </div>
        );
    }
  };

  if (submittedApplicationId) {
    return (
      <Card className="max-w-2xl mx-auto">
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
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium">Application Details</h3>
              <p className="text-sm text-gray-600 mt-2">
                Application ID: <span className="font-semibold">{submittedApplicationId}</span>
              </p>
              {selectedCertificate && (
                <p className="text-sm text-gray-600">
                  Certificate Type: <span className="font-semibold">{certificateConfigs[selectedCertificate]?.label}</span>
                </p>
              )}
            </div>
            
            <Alert className="bg-blue-50 border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertTitle>Next Steps</AlertTitle>
              <AlertDescription className="text-blue-700">
                You will receive an email with further instructions. The processing time is typically 7-10 working days.
              </AlertDescription>
            </Alert>
            
            <div className="flex justify-end">
              <Button
                onClick={() => setSubmittedApplicationId(null)}
                variant="outline"
                className="mt-4"
              >
                Submit Another Application
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (showDocumentUpload && tempApplicationId) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
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
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Document Requirements</AlertTitle>
              <AlertDescription>
                {selectedCertificate === 'caste' && (
                  <>Upload any of: Caste proof from relative, School leaving certificate, Affidavit</>
                )}
                {selectedCertificate === 'income' && (
                  <>Upload any of: Salary slips, Income affidavit, Form 16, Bank statements</>
                )}
                {selectedCertificate === 'domicile' && (
                  <>Upload any of: Residence proof, Utility bills, Aadhaar card</>
                )}
                {selectedCertificate === 'residence' && (
                  <>Upload any of: Rental agreement, Property tax receipt, Utility bill</>
                )}
              </AlertDescription>
            </Alert>

            {!hasRequiredDocuments && (
              <Alert variant="destructive" className="mb-4">
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
          certificateType={selectedCertificate as CertificateType}
        />

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
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
    <Card className="max-w-4xl mx-auto">
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
        <form onSubmit={handleProceedToDocuments} className="space-y-8">
          <div className="space-y-4">
            <Label>Certificate Type *</Label>
            <RadioGroup
              value={selectedCertificate}
              onValueChange={(value) => {
                setSelectedCertificate(value as CertificateType);
                setFormData({ 
                  email: user?.email || '',
                  name: { first_name: '', middle_name: '', last_name: '' },
                  father_name: { first_name: '', middle_name: '', last_name: '' },
                  address: { street: '', city: '', district: '', state: '', pincode: '' }
                });
                setErrors({});
              }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {Object.entries(certificateConfigs).map(([value, config]) => (
                <div key={value}>
                  <RadioGroupItem value={value} id={value} className="peer hidden" />
                  <Label
                    htmlFor={value}
                    className="flex flex-col items-start justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <div className="font-medium">{config.label}</div>
                    <div className="text-sm text-muted-foreground">{config.description}</div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {errors.certificate_type && (
              <p className="text-sm text-red-600">{errors.certificate_type}</p>
            )}
          </div>

          {selectedCertificate && (
            <div className="space-y-8">
              <div className="space-y-6">
                <h3 className="text-lg font-medium border-b pb-2">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderField('name', certificateConfigs[selectedCertificate].fields.name)}
                  {certificateConfigs[selectedCertificate].fields.father_name && 
                    renderField('father_name', certificateConfigs[selectedCertificate].fields.father_name)}
                  {certificateConfigs[selectedCertificate].fields.father_or_husband_name && 
                    renderField('father_or_husband_name', certificateConfigs[selectedCertificate].fields.father_or_husband_name)}
                  {renderField('date_of_birth', certificateConfigs[selectedCertificate].fields.date_of_birth)}
                  {certificateConfigs[selectedCertificate].fields.caste && 
                    renderField('caste', certificateConfigs[selectedCertificate].fields.caste)}
                  {certificateConfigs[selectedCertificate].fields.annual_income && 
                    renderField('annual_income', certificateConfigs[selectedCertificate].fields.annual_income)}
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-lg font-medium border-b pb-2">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderField('phone_number', certificateConfigs[selectedCertificate].fields.phone_number)}
                  {renderField('email', certificateConfigs[selectedCertificate].fields.email)}
                </div>
                {renderField('address', certificateConfigs[selectedCertificate].fields.address)}
              </div>

              <div className="space-y-6">
                <h3 className="text-lg font-medium border-b pb-2">Application Details</h3>
                <div className="space-y-6">
                  {certificateConfigs[selectedCertificate].fields.purpose && 
                    renderField('purpose', certificateConfigs[selectedCertificate].fields.purpose)}
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSelectedCertificate('');
                setFormData({ 
                  email: user?.email || '',
                  name: { first_name: '', middle_name: '', last_name: '' },
                  father_name: { first_name: '', middle_name: '', last_name: '' },
                  address: { street: '', city: '', district: '', state: '', pincode: '' }
                });
                setErrors({});
              }}
              disabled={!selectedCertificate}
              className="w-full sm:w-auto"
            >
              Cancel Application
            </Button>
            <Button
              type="submit"
              disabled={!selectedCertificate || submitApplication.isPending}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
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