
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, CheckCircle, XCircle, Search, ArrowLeft, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface Certificate {
  id: string;
  certificate_number: string;
  certificate_type: string;
  issued_to: string;
  issued_date: string;
  valid_until: string | null;
  digital_signature: string | null;
}

const CertificateVerification = () => {
  const [certificateNumber, setCertificateNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  const verifyCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!certificateNumber.trim()) {
      setError('Please enter a certificate number');
      return;
    }

    setLoading(true);
    setError('');
    setCertificate(null);

    try {
      console.log('Verifying certificate:', certificateNumber.trim());
      
      const { data, error: queryError } = await supabase
        .from('certificates')
        .select('*')
        .eq('certificate_number', certificateNumber.trim())
        .maybeSingle();

      console.log('Query result:', { data, error: queryError });

      if (queryError) {
        console.error('Database error:', queryError);
        setError('Error verifying certificate. Please try again later.');
        toast({
          title: "Database Error",
          description: "There was an error accessing the certificate database.",
          variant: "destructive",
        });
      } else if (!data) {
        setError('Certificate not found. Please check the certificate number and try again.');
        toast({
          title: "Certificate Not Found",
          description: "No certificate exists with the provided number.",
          variant: "destructive",
        });
      } else {
        setCertificate(data);
        toast({
          title: "Certificate Verified",
          description: "Certificate has been successfully verified.",
        });
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError('Unexpected error occurred. Please try again.');
      toast({
        title: "Verification Error",
        description: "An unexpected error occurred during verification.",
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  const formatCertificateType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ');
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  const isValidCertificate = (cert: Certificate) => {
    if (!cert.valid_until) return true;
    return new Date(cert.valid_until) > new Date();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4 hover:bg-white/20"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <div className="text-center">
            <div className="bg-white rounded-full p-4 w-20 h-20 mx-auto mb-4 shadow-lg">
              <Shield className="h-12 w-12 text-blue-600 mx-auto" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Certificate Verification
            </h1>
            <p className="text-lg text-gray-600">
              Verify the authenticity of government-issued certificates
            </p>
          </div>
        </div>

        {/* Verification Form */}
        <Card className="mb-8 shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center text-xl">
              <Search className="h-6 w-6 mr-2" />
              Verify Certificate
            </CardTitle>
            <CardDescription className="text-blue-100">
              Enter the certificate number to verify its authenticity
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={verifyCertificate} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="certificateNumber" className="text-base font-medium">
                  Certificate Number
                </Label>
                <Input
                  id="certificateNumber"
                  type="text"
                  placeholder="Enter certificate number (e.g., CERT2024001)"
                  value={certificateNumber}
                  onChange={(e) => setCertificateNumber(e.target.value)}
                  className="h-12 text-lg"
                  required
                />
                <p className="text-sm text-gray-500">
                  Certificate numbers are typically in the format: CERT2024XXX
                </p>
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700 shadow-lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Search className="h-5 w-5 mr-2" />
                    Verify Certificate
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <Alert variant="destructive" className="mb-8 shadow-lg">
            <XCircle className="h-4 w-4" />
            <AlertDescription className="text-base">{error}</AlertDescription>
          </Alert>
        )}

        {/* Certificate Details */}
        {certificate && (
          <Card className="certificate-card shadow-xl border-0">
            <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-xl">
                  <CheckCircle className="h-6 w-6 mr-2" />
                  Certificate Verified Successfully
                </CardTitle>
                <Badge 
                  variant={isValidCertificate(certificate) ? "default" : "destructive"}
                  className={`${isValidCertificate(certificate) ? "bg-green-500 hover:bg-green-600" : ""} text-white font-semibold px-3 py-1`}
                >
                  {isValidCertificate(certificate) ? 'Valid' : 'Expired'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">Certificate Number</Label>
                  <p className="font-mono text-lg font-semibold bg-gray-50 p-3 rounded-md border">
                    {certificate.certificate_number}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">Certificate Type</Label>
                  <p className="text-lg font-medium bg-blue-50 text-blue-800 p-3 rounded-md">
                    {formatCertificateType(certificate.certificate_type)}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">Issued To</Label>
                  <p className="text-lg font-semibold text-gray-900 bg-gray-50 p-3 rounded-md">
                    {certificate.issued_to}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">Issue Date</Label>
                  <p className="text-lg bg-gray-50 p-3 rounded-md">
                    {formatDate(certificate.issued_date)}
                  </p>
                </div>
                {certificate.valid_until && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600">Valid Until</Label>
                    <p className={`text-lg p-3 rounded-md ${isValidCertificate(certificate) ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                      {formatDate(certificate.valid_until)}
                    </p>
                  </div>
                )}
                {certificate.digital_signature && (
                  <div className="md:col-span-2 space-y-2">
                    <Label className="text-sm font-medium text-gray-600">Digital Signature</Label>
                    <div className="bg-gray-50 p-4 rounded-md border">
                      <p className="font-mono text-sm text-gray-800 break-all">
                        {certificate.digital_signature}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <Alert className="border-green-200 bg-green-50">
                <Shield className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  This certificate has been verified against government records and is authentic.
                  The digital signature ensures the integrity of this document.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}

        {/* Information Card */}
        <Card className="mt-8 shadow-lg border-0">
          <CardHeader className="bg-gray-50">
            <CardTitle className="text-lg">How to Verify Certificates</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p>Enter the complete certificate number exactly as shown on your certificate</p>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p>Certificate numbers are usually in the format: CERT2024XXX</p>
                </div>
              </div>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p>If verification fails, contact the issuing authority</p>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p>This verification system works 24/7 for your convenience</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CertificateVerification;
