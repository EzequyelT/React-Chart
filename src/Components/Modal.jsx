export default function Modal({ onClose, children }) {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 rounded-xl animate-fadeIn duration-1000 delay-500 animate-fadeOut"
      style={{ backdropFilter: 'blur(6px)' }}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      ></div>

      <div className="bg-white rounded-xl p-6 z-10 max-w-lg w-full shadow-lg relative">
        <button
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 text-2xl font-bold"
          onClick={onClose}
          aria-label="Fechar modal"
        >
          ×
        </button>

        {children}
      </div>
    </div>
  );
}
