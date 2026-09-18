import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ArrowLeft } from 'lucide-react';

export default function EntityNotFound() {
  return (
    <div className="min-h-screen bg-[#F3F4F6] text-[#1E2A3A] flex flex-col">
      <Navbar />
      <div className="max-w-xl mx-auto px-6 py-24 text-center space-y-4">
        <h2 className="serif text-2xl font-semibold">Entity Not Found</h2>
        <p className="text-sm text-[#5B6472]">
          We couldn&apos;t find this organisation. It might have been renamed or moved.
        </p>
        <Link href="/" className="btn btn-forest text-sm">
          <ArrowLeft className="w-4 h-4" /> Return to Directory
        </Link>
      </div>
      <Footer />
    </div>
  );
}
