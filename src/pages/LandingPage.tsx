import { Link } from 'react-router-dom';
import { Shield, Users, Bell, ArrowRight, Heart, Lock } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 border-bottom border-gray-100">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-2 rounded-lg">
            <Shield className="text-white w-6 h-6" />
          </div>
          <span className="font-bold text-xl tracking-tight">SafeSchool</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login">
            <Button variant="ghost">Masuk</Button>
          </Link>
          <Link to="/login?register=true">
            <Button>Daftar</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-20 max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl lg:text-7xl font-extrabold leading-tight mb-6">
            Lawan <span className="text-primary">Bullying</span>, Ciptakan Sekolah Aman.
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Sistem pelaporan tindakan bullying yang aman, rahasia, dan cepat ditindaklanjuti. 
            Suaramu berharga untuk masa depan sekolah yang lebih baik.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/login">
              <Button size="lg" className="h-14 px-8 text-lg gap-2">
                Mulai Melapor <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg">
              Pelajari Lebih Lanjut
            </Button>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative"
        >
          <div className="bg-gray-100 rounded-3xl aspect-square overflow-hidden relative">
            <img 
              src="https://picsum.photos/seed/school/800/800" 
              alt="School Environment" 
              className="object-cover w-full h-full opacity-80"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
              <div className="text-white">
                <p className="text-2xl font-bold mb-2">"Tidak ada tempat untuk kekerasan di sekolah kita."</p>
                <p className="opacity-80">— Kepala Sekolah</p>
              </div>
            </div>
          </div>
          
          {/* Floating Stats */}
          <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl border border-gray-100 max-w-xs">
            <div className="flex items-center gap-4 mb-2">
              <div className="bg-green-100 p-2 rounded-full">
                <Heart className="text-green-600 w-5 h-5" />
              </div>
              <span className="font-bold text-2xl">100%</span>
            </div>
            <p className="text-sm text-gray-500 font-medium">Laporan ditangani secara profesional oleh Guru BK.</p>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-24 px-6">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">Mengapa Menggunakan SafeSchool?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Kami menyediakan platform yang dirancang khusus untuk melindungi siswa dan memastikan setiap laporan mendapatkan perhatian yang semestinya.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {[
            {
              icon: <Lock className="w-8 h-8 text-primary" />,
              title: "Kerahasiaan Terjamin",
              desc: "Kamu bisa melapor secara anonim tanpa perlu khawatir identitasmu diketahui orang lain."
            },
            {
              icon: <Bell className="w-8 h-8 text-primary" />,
              title: "Penanganan Cepat",
              desc: "Laporan langsung masuk ke dashboard Guru BK untuk segera diproses dan ditindaklanjuti."
            },
            {
              icon: <Users className="w-8 h-8 text-primary" />,
              title: "Lingkungan Positif",
              desc: "Membantu menciptakan budaya sekolah yang saling menghargai dan bebas dari intimidasi."
            }
          ].map((feature, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5 }}
              className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100"
            >
              <div className="mb-6">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Shield className="text-primary w-6 h-6" />
            <span className="font-bold text-xl">SafeSchool</span>
          </div>
          <p className="text-gray-500 text-sm">
            © 2026 SafeSchool System. Dibuat untuk masa depan sekolah yang lebih aman.
          </p>
          <div className="flex gap-6 text-sm font-medium text-gray-600">
            <a href="#" className="hover:text-primary transition-colors">Kebijakan Privasi</a>
            <a href="#" className="hover:text-primary transition-colors">Syarat & Ketentuan</a>
            <a href="#" className="hover:text-primary transition-colors">Kontak</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
