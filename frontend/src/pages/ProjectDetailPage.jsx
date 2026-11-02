import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function ProjectDetailPage() {
  const { id } = useParams();
  return (
    <div>
      <Link to="/projects" className="flex items-center gap-2 text-brand-green font-medium mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Projects
      </Link>
      <div className="card">
        <p className="text-gray-500">Project detail page - {id}</p>
      </div>
    </div>
  );
}
