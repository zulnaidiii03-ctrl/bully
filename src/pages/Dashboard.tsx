import { useEffect, useState } from 'react';
import { useAuth } from '@/src/context/AuthContext';
import { supabase, Report } from '@/src/lib/supabase';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  TrendingUp,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'motion/react';

export default function Dashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    completed: 0,
  });
  const [recentReports, setRecentReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [profile]);

  async function fetchStats() {
    if (!profile) return;
    setLoading(true);
    try {
      let query = supabase.from('reports').select('*');
      
      if (profile.role === 'siswa') {
        query = query.eq('reporter_id', profile.id);
      }

      const { data, error } = await query;
      if (error) throw error;

      if (data) {
        setStats({
          total: data.length,
          pending: data.filter(r => r.status === 'laporan diterima').length,
          processing: data.filter(r => r.status === 'sedang diproses').length,
          completed: data.filter(r => r.status === 'selesai').length,
        });
        setRecentReports(data.slice(0, 5).sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ));
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  }

  const chartData = [
    { name: 'Diterima', value: stats.pending, color: '#ef4444' },
    { name: 'Diproses', value: stats.processing, color: '#f59e0b' },
    { name: 'Selesai', value: stats.completed, color: '#10b981' },
  ];

  const StatCard = ({ title, value, icon, color, delay }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className="border-none shadow-sm overflow-hidden relative group">
        <div className={`absolute top-0 right-0 p-8 opacity-10 transition-transform group-hover:scale-110`}>
          {icon}
        </div>
        <CardHeader className="pb-2">
          <CardDescription className="font-medium">{title}</CardDescription>
          <CardTitle className="text-3xl font-bold">{value}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-xs font-bold flex items-center gap-1 ${color}`}>
            <TrendingUp className="w-3 h-3" /> +0% bulan ini
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Selamat Datang, {profile?.full_name}!</h1>
        <p className="text-gray-500">Berikut adalah ringkasan laporan bullying di sekolah.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Laporan" 
          value={stats.total} 
          icon={<FileText className="w-12 h-12" />} 
          color="text-blue-600"
          delay={0.1}
        />
        <StatCard 
          title="Laporan Baru" 
          value={stats.pending} 
          icon={<AlertCircle className="w-12 h-12" />} 
          color="text-red-600"
          delay={0.2}
        />
        <StatCard 
          title="Sedang Diproses" 
          value={stats.processing} 
          icon={<Clock className="w-12 h-12" />} 
          color="text-amber-600"
          delay={0.3}
        />
        <StatCard 
          title="Selesai" 
          value={stats.completed} 
          icon={<CheckCircle2 className="w-12 h-12" />} 
          color="text-green-600"
          delay={0.4}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Chart Section */}
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader>
            <CardTitle>Statistik Status Laporan</CardTitle>
            <CardDescription>Perbandingan jumlah laporan berdasarkan status saat ini.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribution Section */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>Distribusi Laporan</CardTitle>
            <CardDescription>Persentase status laporan.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border-none shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Aktivitas Terbaru</CardTitle>
            <CardDescription>Laporan-laporan terbaru yang masuk ke sistem.</CardDescription>
          </div>
          <Button variant="outline" size="sm">Lihat Semua</Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {recentReports.length > 0 ? recentReports.map((report, i) => (
              <div key={report.id} className="flex items-start gap-4">
                <div className={`p-2 rounded-full mt-1 ${
                  report.status === 'laporan diterima' ? 'bg-red-100 text-red-600' :
                  report.status === 'sedang diproses' ? 'bg-amber-100 text-amber-600' :
                  'bg-green-100 text-green-600'
                }`}>
                  <FileText className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">
                    Laporan: {report.victim_name} vs {report.perpetrator_name || 'Anonim'}
                  </p>
                  <p className="text-xs text-gray-500 line-clamp-1">{report.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-gray-400">
                    {new Date(report.created_at).toLocaleDateString('id-ID')}
                  </p>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    report.status === 'laporan diterima' ? 'bg-red-100 text-red-600' :
                    report.status === 'sedang diproses' ? 'bg-amber-100 text-amber-600' :
                    'bg-green-100 text-green-600'
                  }`}>
                    {report.status}
                  </span>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-500">
                Belum ada laporan terbaru.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
