
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Eye } from 'lucide-react';
import { useApplicationDocuments, useDocumentUrl } from '@/hooks/useApplicationDocuments';
import { format } from 'date-fns';

interface DocumentsViewerProps {
  applicationId: string;
}

export const DocumentsViewer = ({ applicationId }: DocumentsViewerProps) => {
  const { data: documents, isLoading } = useApplicationDocuments(applicationId);

  const DocumentItem = ({ document }: { document: any }) => {
    const { data: documentUrl } = useDocumentUrl(document.file_path);

    const handleView = () => {
      if (documentUrl) {
        window.open(documentUrl, '_blank');
      }
    };

    const handleDownload = () => {
      if (documentUrl) {
        const link = document.createElement('a');
        link.href = documentUrl;
        link.download = document.document_name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    };

    return (
      <div className="flex items-center justify-between p-3 border rounded-lg">
        <div className="flex items-center space-x-3">
          <FileText className="h-5 w-5 text-blue-600" />
          <div>
            <p className="font-medium text-sm">{document.document_name}</p>
            <p className="text-xs text-gray-500">
              {document.document_type.replace('_', ' ').toUpperCase()} • 
              {document.file_size ? ` ${(document.file_size / 1024 / 1024).toFixed(2)} MB • ` : ' '}
              {format(new Date(document.uploaded_at), 'MMM dd, yyyy')}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleView}
            disabled={!documentUrl}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            disabled={!documentUrl}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Supporting Documents</CardTitle>
        <CardDescription>
          {documents?.length || 0} document(s) uploaded
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {documents && documents.length > 0 ? (
          documents.map((document) => (
            <DocumentItem key={document.id} document={document} />
          ))
        ) : (
          <p className="text-sm text-gray-500 text-center py-4">
            No documents uploaded yet
          </p>
        )}
      </CardContent>
    </Card>
  );
};
