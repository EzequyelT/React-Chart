export default function ActionCard({ Icon, label, onClick }) {
  console.log(Icon)
  return (
    <button
      onClick={onClick}
      className="group flex flex-col items-center border-2 border-green-600 justify-center p-3 bg-white hover:bg-green-600 rounded-2xl text-sm transition-colors delay-200 duration-1000 hover:shadow-xl"
    >
      <Icon className="text-2xl mb-1 text-green-600 group-hover:text-white transition-colors" />
      <span className="text-green-600 group-hover:text-white transition-colors">{label}</span>
    </button>
  );
}
