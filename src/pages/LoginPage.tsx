import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/src/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const isRegisterParam = searchParams.get('register') === 'true';
  
  const [isRegister, setIsRegister] = useState(isRegisterParam);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsRegister(isRegisterParam);
  }, [isRegisterParam]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isRegister) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });
        if (error) throw error;
        toast.success('Pendaftaran berhasil! Silakan cek email untuk verifikasi (jika diaktifkan) atau langsung masuk.');
        setIsRegister(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success('Berhasil masuk!');
        navigate('/app');
      }
    } catch (error: any) {
      toast.error(error.message || 'Terjadi kesalahan saat otentikasi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="bg-primary p-2 rounded-lg">
            <Shield className="text-white w-8 h-8" />
          </div>
          <span className="font-bold text-3xl tracking-tight">SafeSchool</span>
        </div>

        <Card className="border-none shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              {isRegister ? 'Buat Akun Baru' : 'Selamat Datang Kembali'}
            </CardTitle>
            <CardDescription className="text-center">
              {isRegister 
                ? 'Daftar untuk mulai berkontribusi menciptakan sekolah aman' 
                : 'Masuk ke akunmu untuk mengelola laporan'}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleAuth}>
            <CardContent className="space-y-4">
              {isRegister && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nama Lengkap</Label>
                  <Input 
                    id="fullName" 
                    placeholder="Contoh: Budi Santoso" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="name@school.id" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  {!isRegister && (
                    <a href="#" className="text-sm text-primary hover:underline">Lupa password?</a>
                  )}
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button className="w-full h-11" type="submit" disabled={loading}>
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isRegister ? 'Daftar Sekarang' : 'Masuk')}
              </Button>
              <div className="text-center text-sm text-gray-500">
                {isRegister ? 'Sudah punya akun?' : 'Belum punya akun?'} {' '}
                <button 
                  type="button"
                  onClick={() => setIsRegister(!isRegister)}
                  className="text-primary font-semibold hover:underline"
                >
                  {isRegister ? 'Masuk di sini' : 'Daftar di sini'}
                </button>
              </div>
            </CardFooter>
          </form>
        </Card>
        
        <p className="mt-8 text-center text-xs text-gray-400">
          Dengan masuk, kamu menyetujui Ketentuan Layanan dan Kebijakan Privasi kami.
        </p>
      </div>
    </div>
  );
}
