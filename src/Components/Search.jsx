import { FaSearch } from 'react-icons/fa';

export default function Search({ value, onChange, placeholder = 'Buscar...' }) {
  return (
    <div className="relative max-w-sm mx-auto mb-4">
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-80 mt-4 pl-10 pr-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-green-500"
      />
      <FaSearch className=" mt-2 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
    </div>
  );
}
