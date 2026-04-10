import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      const isSupabaseError = this.state.error?.message.includes('Supabase configuration');

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border border-red-100">
            <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="text-red-600 w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Terjadi Kesalahan</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              {isSupabaseError 
                ? 'Konfigurasi Supabase belum lengkap. Silakan masukkan URL dan API Key di menu Settings > Secrets.'
                : 'Terjadi kesalahan sistem yang tidak terduga.'}
            </p>
            
            {this.state.error && (
              <div className="bg-gray-50 p-4 rounded-xl text-left mb-8 overflow-auto max-h-40">
                <code className="text-xs text-red-500">{this.state.error.message}</code>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <Button 
                onClick={() => window.location.reload()} 
                className="w-full h-11 gap-2"
              >
                <RefreshCcw className="w-4 h-4" /> Muat Ulang Halaman
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => this.setState({ hasError: false, error: null })}
                className="w-full h-11"
              >
                Coba Lagi
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
