import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/src/context/AuthContext';
import { supabase, Report } from '@/src/lib/supabase';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Eye, 
  FileText,
  Calendar,
  User,
  MapPin
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { motion } from 'motion/react';

export default function ReportList() {
  const { profile } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchReports();
  }, [profile]);

  async function fetchReports() {
    if (!profile) return;
    setLoading(true);
    try {
      let query = supabase.from('reports').select('*');
      
      if (profile.role === 'siswa') {
        query = query.eq('reporter_id', profile.id);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredReports = reports.filter(report => 
    report.victim_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.perpetrator_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'laporan diterima':
        return <Badge variant="destructive" className="bg-red-100 text-red-600 hover:bg-red-100 border-none">Diterima</Badge>;
      case 'sedang diproses':
        return <Badge variant="outline" className="bg-amber-100 text-amber-600 hover:bg-amber-100 border-none">Diproses</Badge>;
      case 'selesai':
        return <Badge variant="secondary" className="bg-green-100 text-green-600 hover:bg-green-100 border-none">Selesai</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Laporan Bullying</h1>
          <p className="text-gray-500">Kelola dan pantau status laporan bullying di sekolah.</p>
        </div>
        {profile?.role === 'siswa' && (
          <Link to="/app/report/new">
            <Button className="gap-2">
              <FileText className="w-4 h-4" /> Buat Laporan Baru
            </Button>
          </Link>
        )}
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="pb-0">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input 
                placeholder="Cari berdasarkan nama korban, pelaku, atau lokasi..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" /> Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="rounded-xl border border-gray-100 overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="font-bold">Korban</TableHead>
                  <TableHead className="font-bold">Pelaku</TableHead>
                  <TableHead className="font-bold">Lokasi</TableHead>
                  <TableHead className="font-bold">Tanggal</TableHead>
                  <TableHead className="font-bold">Status</TableHead>
                  <TableHead className="text-right font-bold">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                      Memuat data...
                    </TableCell>
                  </TableRow>
                ) : filteredReports.length > 0 ? filteredReports.map((report) => (
                  <TableRow key={report.id} className="hover:bg-gray-50/50 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="bg-gray-100 p-1.5 rounded-lg">
                          <User className="w-4 h-4 text-gray-600" />
                        </div>
                        <span className="font-medium">{report.victim_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{report.perpetrator_name || <span className="text-gray-400 italic">Tidak diketahui</span>}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <MapPin className="w-3.5 h-3.5" />
                        {report.location}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(report.incident_date).toLocaleDateString('id-ID')}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(report.status)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Link to={`/app/reports/${report.id}`} className="flex items-center">
                              <Eye className="w-4 h-4 mr-2" /> Lihat Detail
                            </Link>
                          </DropdownMenuItem>
                          {profile?.role !== 'siswa' && (
                            <DropdownMenuItem className="text-primary">
                              <FileText className="w-4 h-4 mr-2" /> Beri Tindak Lanjut
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                      Tidak ada laporan ditemukan.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
