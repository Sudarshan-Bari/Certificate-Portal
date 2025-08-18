// src/components/DocumentUpload.tsx
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, File, X, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DocumentUploadProps {
  applicationId: string;
  onUploadComplete?: () => void;
}

export function DocumentUpload({ applicationId, onUploadComplete }: DocumentUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState('');
  const [documentName, setDocumentName] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const documentTypes = [
    { value: 'identity_proof', label: 'Identity Proof' },
    { value: 'address_proof', label: 'Address Proof' },
    { value: 'income_proof', label: 'Income Proof' },
    { value: 'caste_proof', label: 'Caste Proof' },
    { value: 'other', label: 'Other Document' }
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setUploadError('File size must be less than 10MB');
        return;
      }
      
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        setUploadError('Only PDF, JPG, PNG, and DOC files are allowed');
        return;
      }
      
      setSelectedFile(file);
      if (!documentName) {
        setDocumentName(file.name);
      }
      setUploadError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !documentType || !documentName) {
      setUploadError('Please fill in all required fields and select a file');
      return;
    }

    try {
      setUploading(true);
      setUploadError(null);
      
      // Simulate upload (replace with actual upload logic)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSelectedFile(null);
      setDocumentType('');
      setDocumentName('');
      
      const fileInput = document.getElementById('document-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      onUploadComplete?.();
    } catch (error) {
      setUploadError('Failed to upload document. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setDocumentName('');
    setUploadError(null);
    const fileInput = document.getElementById('document-file') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Upload className="h-5 w-5 mr-2" />
          Upload Documents
        </CardTitle>
        <CardDescription>
          Upload supporting documents for your certificate application
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {uploadError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{uploadError}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="document-type">Document Type *</Label>
          <Select value={documentType} onValueChange={setDocumentType}>
            <SelectTrigger>
              <SelectValue placeholder="Select document type" />
            </SelectTrigger>
            <SelectContent>
              {documentTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="document-name">Document Name *</Label>
          <Input
            id="document-name"
            value={documentName}
            onChange={(e) => setDocumentName(e.target.value)}
            placeholder="Enter document name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="document-file">Select File *</Label>
          <Input
            id="document-file"
            type="file"
            onChange={handleFileSelect}
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          />
          <p className="text-xs text-gray-500">
            Accepted formats: PDF, JPG, PNG, DOC, DOCX (Max size: 10MB)
          </p>
        </div>

        {selectedFile && (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <File className="h-4 w-4" />
              <span className="text-sm font-medium">{selectedFile.name}</span>
              <span className="text-xs text-gray-500">
                ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={removeFile}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        <Button
          onClick={handleUpload}
          disabled={!selectedFile || !documentType || !documentName || uploading}
          className="w-full"
        >
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}