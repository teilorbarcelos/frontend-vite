import { AlertCircle, Home, RotateCcw } from 'lucide-react';
import { isRouteErrorResponse, useNavigate, useRouteError } from 'react-router-dom';
import { Button } from './Button';

export function ErrorPage() {
  const error = useRouteError();
  const navigate = useNavigate();

  let errorMessage: string;
  let errorStatus: number | string = "Error";

  if (isRouteErrorResponse(error)) {
    errorMessage = error.data?.message || error.statusText;
    errorStatus = error.status;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else {
    console.error(error);
    errorMessage = "An unexpected error occurred.";
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600 mb-6">
            <AlertCircle className="w-8 h-8" />
          </div>
          
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{errorStatus}</h1>
          <p className="text-lg font-medium text-gray-600 mb-6">Oops! Something went wrong.</p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-8 text-left border border-gray-200">
            <p className="text-sm font-mono text-gray-700 wrap-break-word leading-relaxed">
              {errorMessage}
            </p>
          </div>
          
          <div className="flex flex-col gap-3">
            <Button 
              onClick={() => window.location.reload()} 
              className="w-full flex items-center justify-center gap-2 h-11"
            >
              <RotateCcw className="w-4 h-4" />
              Try Again
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => navigate('/')} 
              className="w-full flex items-center justify-center gap-2 h-11"
            >
              <Home className="w-4 h-4" />
              Back to Home
            </Button>
          </div>
        </div>
        
        <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-500 italic">
            If this problem persists, please contact support.
          </p>
        </div>
      </div>
    </div>
  );
}
