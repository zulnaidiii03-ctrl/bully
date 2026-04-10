import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/src/context/AuthContext';
import { supabase, Report, FollowUp, Profile } from '@/src/lib/supabase';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  User, 
  AlertCircle, 
  CheckCircle2, 
  Clock,
  MessageSquare,
  Shield,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';

export default function ReportDetail() {
  const { id } = useParams();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [report, setReport] = useState<Report | null>(null);
  const [followUps, setFollowUps] = useState<(FollowUp & { counselor: Profile })[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [status, setStatus] = useState<string>('');

  useEffect(() => {
    fetchReportDetails();
  }, [id]);

  async function fetchReportDetails() {
    if (!id) return;
    setLoading(true);
    try {
      // Fetch report
      const { data: reportData, error: reportError } = await supabase
        .from('reports')
        .select('*')
        .eq('id', id)
        .single();

      if (reportError) throw reportError;
      setReport(reportData);
      setStatus(reportData.status);

      // Fetch follow ups
      const { data: followData, error: followError } = await supabase
        .from('follow_ups')
        .select(`
          *,
          counselor:profiles(*)
        `)
        .eq('report_id', id)
        .order('created_at', { ascending: true });

      if (followError) throw followError;
      setFollowUps(followData as any);
    } catch (error) {
      console.error('Error fetching report details:', error);
      toast.error('Gagal memuat detail laporan');
    } finally {
      setLoading(false);
    }
  }

  const handleUpdateStatus = async (newStatus: string) => {
    if (!id || profile?.role === 'siswa') return;
    try {
      const { error } = await supabase
        .from('reports')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      setStatus(newStatus);
      toast.success('Status laporan diperbarui');
    } catch (error) {
      toast.error('Gagal memperbarui status');
    }
  };

  const handleAddFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newNote.trim() || !profile) return;
    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('follow_ups')
        .insert({
          report_id: id,
          counselor_id: profile.id,
          notes: newNote
        })
        .select(`
          *,
          counselor:profiles(*)
        `)
        .single();

      if (error) throw error;
      setFollowUps([...followUps, data as any]);
      setNewNote('');
      toast.success('Tindak lanjut ditambahkan');
    } catch (error) {
      toast.error('Gagal menambahkan tindak lanjut');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!report) return <div className="text-center py-12">Laporan tidak ditemukan.</div>;

  return (
    <div className="space-y-6 pb-12">
      <Button variant="ghost" onClick={() => navigate('/app/reports')} className="gap-2">
        <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar
      </Button>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Report Info */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-none shadow-sm overflow-hidden">
              <div className={`h-2 ${
                status === 'laporan diterima' ? 'bg-red-500' :
                status === 'sedang diproses' ? 'bg-amber-500' :
                'bg-green-500'
              }`} />
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="text-xs font-bold uppercase tracking-wider">
                    ID: {report.id.slice(0, 8)}
                  </Badge>
                  <div className="flex items-center gap-2">
                    {report.is_anonymous && (
                      <Badge variant="secondary" className="gap-1">
                        <Shield className="w-3 h-3" /> Anonim
                      </Badge>
                    )}
                    <span className={`text-xs font-bold uppercase px-3 py-1 rounded-full ${
                      status === 'laporan diterima' ? 'bg-red-100 text-red-600' :
                      status === 'sedang diproses' ? 'bg-amber-100 text-amber-600' :
                      'bg-green-100 text-green-600'
                    }`}>
                      {status}
                    </span>
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold">
                  Laporan: {report.victim_name}
                </CardTitle>
                <CardDescription>
                  Dilaporkan pada {new Date(report.created_at).toLocaleString('id-ID')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Korban</p>
                    <div className="flex items-center gap-2 font-medium">
                      <User className="w-4 h-4 text-gray-400" /> {report.victim_name}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pelaku</p>
                    <div className="flex items-center gap-2 font-medium">
                      <User className="w-4 h-4 text-gray-400" /> {report.perpetrator_name || 'Tidak diketahui'}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Lokasi</p>
                    <div className="flex items-center gap-2 font-medium">
                      <MapPin className="w-4 h-4 text-gray-400" /> {report.location}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Deskripsi Kejadian</p>
                  <div className="bg-gray-50 p-6 rounded-2xl text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {report.description}
                  </div>
                </div>

                {report.evidence_url && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Bukti Kejadian</p>
                    <div className="rounded-2xl overflow-hidden border border-gray-100">
                      <img 
                        src={report.evidence_url} 
                        alt="Evidence" 
                        className="w-full h-auto max-h-[400px] object-contain bg-gray-100"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Follow Ups Timeline */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" /> Tindak Lanjut & Catatan
            </h3>
            
            <div className="space-y-4">
              {followUps.length > 0 ? followUps.map((follow, i) => (
                <motion.div
                  key={follow.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-bold">{follow.counselor.full_name}</p>
                        <p className="text-xs text-gray-500 capitalize">{follow.counselor.role.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400">
                      {new Date(follow.created_at).toLocaleString('id-ID')}
                    </p>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">{follow.notes}</p>
                </motion.div>
              )) : (
                <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center text-gray-500">
                  Belum ada tindak lanjut untuk laporan ini.
                </div>
              )}
            </div>

            {/* Add Follow Up Form (Staff Only) */}
            {profile?.role !== 'siswa' && (
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">Tambah Tindak Lanjut</CardTitle>
                </CardHeader>
                <form onSubmit={handleAddFollowUp}>
                  <CardContent>
                    <Textarea 
                      placeholder="Tuliskan catatan tindak lanjut atau perkembangan kasus..." 
                      className="min-h-[120px] resize-none"
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      required
                    />
                  </CardContent>
                  <CardFooter className="justify-end">
                    <Button type="submit" disabled={submitting}>
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Simpan Catatan"}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            )}
          </div>
        </div>

        {/* Right Column: Actions & Status */}
        <div className="space-y-6">
          {profile?.role !== 'siswa' && (
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Kelola Status</CardTitle>
                <CardDescription>Perbarui status penanganan laporan ini.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Status Laporan</Label>
                  <Select value={status} onValueChange={handleUpdateStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="laporan diterima">Laporan Diterima</SelectItem>
                      <SelectItem value="sedang diproses">Sedang Diproses</SelectItem>
                      <SelectItem value="selesai">Selesai / Ditutup</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase">
                    <AlertCircle className="w-3 h-3" /> Panduan Status
                  </div>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500 mt-1" />
                      <p className="text-xs text-gray-600"><b>Diterima:</b> Laporan baru masuk dan belum diperiksa.</p>
                    </div>
                    <div className="flex gap-2">
                      <div className="w-2 h-2 rounded-full bg-amber-500 mt-1" />
                      <p className="text-xs text-gray-600"><b>Diproses:</b> Guru BK sedang melakukan investigasi atau mediasi.</p>
                    </div>
                    <div className="flex gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 mt-1" />
                      <p className="text-xs text-gray-600"><b>Selesai:</b> Kasus telah ditangani dan dinyatakan ditutup.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Informasi Pelapor</CardTitle>
            </CardHeader>
            <CardContent>
              {report.is_anonymous ? (
                <div className="flex flex-col items-center py-6 text-center">
                  <div className="bg-gray-100 p-4 rounded-full mb-4">
                    <Shield className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="font-bold text-gray-900">Pelapor Anonim</p>
                  <p className="text-sm text-gray-500">Identitas pelapor dirahasiakan sesuai permintaan.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">Siswa Terdaftar</p>
                      <p className="text-xs text-gray-500">ID: {report.reporter_id?.slice(0, 8)}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                    Hanya Admin dan Guru BK yang dapat melihat identitas pelapor jika tidak anonim.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
