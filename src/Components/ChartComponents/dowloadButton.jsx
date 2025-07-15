import { FaDownload, FaFilePdf } from 'react-icons/fa';

export default function DownloadButtons({ nodes = [], onExportImage, onExportPDF }) {
  if (nodes.length < 1) return null;

  return (
    <div className="fixed bottom-4 right-4 flex gap-4 z-50">
      <button
        onClick={onExportImage}
        className="flex items-center gap-2 px-4 py-2 bg-gray-300 rounded-xl hover:bg-gray-400 transition text-black shadow"
      >
        <FaDownload />
        Baixar Imagem
      </button>

      <button
        onClick={onExportPDF}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition shadow"
      >
        <FaFilePdf />
        Baixar PDF
      </button>
    </div>
  );
}
