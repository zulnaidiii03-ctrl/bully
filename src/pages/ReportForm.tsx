import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/src/context/AuthContext';
import { supabase } from '@/src/lib/supabase';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Shield, 
  Upload, 
  Calendar, 
  MapPin, 
  User, 
  AlertTriangle,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';

export default function ReportForm() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  
  const [formData, setFormData] = useState({
    victim_name: '',
    perpetrator_name: '',
    location: '',
    incident_date: new Date().toISOString().split('T')[0],
    description: '',
    category_id: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('reports').insert({
        reporter_id: isAnonymous ? null : profile?.id,
        is_anonymous: isAnonymous,
        victim_name: formData.victim_name,
        perpetrator_name: formData.perpetrator_name || null,
        location: formData.location,
        incident_date: formData.incident_date,
        description: formData.description,
        status: 'laporan diterima',
      });

      if (error) throw error;

      toast.success('Laporan berhasil dikirim! Guru BK akan segera menindaklanjuti.');
      navigate('/app/reports');
    } catch (error: any) {
      toast.error(error.message || 'Gagal mengirim laporan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-primary/10 p-3 rounded-2xl">
            <AlertTriangle className="text-primary w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Buat Laporan Bullying</h1>
            <p className="text-gray-500">Berikan informasi sedetail mungkin untuk membantu proses penanganan.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Anonymous Toggle */}
            <Card className="border-none shadow-sm bg-primary/5 border-l-4 border-l-primary">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-white p-2 rounded-full shadow-sm">
                    <Shield className="text-primary w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Lapor Secara Anonim?</p>
                    <p className="text-sm text-gray-500">Identitasmu tidak akan ditampilkan pada laporan ini.</p>
                  </div>
                </div>
                <Button 
                  type="button"
                  variant={isAnonymous ? "default" : "outline"}
                  onClick={() => setIsAnonymous(!isAnonymous)}
                  className="rounded-full"
                >
                  {isAnonymous ? "Aktif" : "Nonaktif"}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Informasi Kejadian</CardTitle>
                <CardDescription>Detail mengenai siapa dan di mana kejadian berlangsung.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="victim_name">Nama Korban <span className="text-red-500">*</span></Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input 
                        id="victim_name" 
                        className="pl-10" 
                        placeholder="Nama siswa yang menjadi korban" 
                        value={formData.victim_name}
                        onChange={(e) => setFormData({...formData, victim_name: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="perpetrator_name">Nama Pelaku (Jika diketahui)</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input 
                        id="perpetrator_name" 
                        className="pl-10" 
                        placeholder="Nama siswa yang melakukan bullying" 
                        value={formData.perpetrator_name}
                        onChange={(e) => setFormData({...formData, perpetrator_name: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="incident_date">Tanggal Kejadian <span className="text-red-500">*</span></Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input 
                        id="incident_date" 
                        type="date" 
                        className="pl-10" 
                        value={formData.incident_date}
                        onChange={(e) => setFormData({...formData, incident_date: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Lokasi Kejadian <span className="text-red-500">*</span></Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input 
                        id="location" 
                        className="pl-10" 
                        placeholder="Contoh: Kantin, Belakang Kelas" 
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Deskripsi Kejadian <span className="text-red-500">*</span></Label>
                  <Textarea 
                    id="description" 
                    placeholder="Ceritakan apa yang terjadi secara detail..." 
                    className="min-h-[150px] resize-none"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Bukti Kejadian (Opsional)</CardTitle>
                <CardDescription>Unggah foto atau tangkapan layar jika ada.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-12 flex flex-col items-center justify-center text-center hover:border-primary/50 transition-colors cursor-pointer bg-gray-50">
                  <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                    <Upload className="text-primary w-8 h-8" />
                  </div>
                  <p className="font-bold text-gray-900">Klik untuk unggah atau seret file</p>
                  <p className="text-sm text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-end gap-4">
              <Button type="button" variant="ghost" onClick={() => navigate('/app')}>Batal</Button>
              <Button type="submit" size="lg" className="px-12" disabled={loading}>
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Kirim Laporan"}
              </Button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
