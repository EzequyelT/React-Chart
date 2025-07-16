import { GiHamburgerMenu } from 'react-icons/gi';
import { FaPlus, FaTrash, FaPen, FaInfoCircle, FaUndo } from 'react-icons/fa';
import logo from "../../assets/LogoRio.png";
import ActionCard from "../actionCard.jsx"


export default function Header({
  stats,
  menuOpen,
  setMenuOpen,
  setEditNode,
  setShowForm,
  setNodeToRemoveAll,
  setTitleForm,
  setAbout,
  nodes = [],
}) {
  return (
    <header className="fixed top-0 left-0 right-0 bg-gray-100 shadow z-50 flex flex-wrap items-center justify-between px-4 py-2">
      <img
        src={logo}
        alt="Logo RioPele"
        className="h-12 md:h-14"
        onClick={() => window.location.href = 'https://www.riopele.pt/'}
        style={{ cursor: 'pointer' }}
        title='RioPele'
      />
      {nodes.length > 0 && (
        <div className="flex-1 flex justify-center">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3 items-center">
            <div className="bg-white shadow rounded-xl px-3 py-2 text-center border-t-4 border-green-500">
              <div className="text-gray-700 text-xs font-semibold">Colaboradores</div>
              <div className="text-sm font-semibold animate-bounce mt-1">{stats.total}</div>
            </div>

            <div className="bg-white shadow rounded-xl px-3 py-2 text-center border-t-4 border-blue-500">
              <div className="text-gray-700 text-xs font-semibold">Online / Remoto</div>
              <div className="text-sm font-semibold animate-bounce mt-1">
                🟢 {stats.statusCount.online} / 🔵 {stats.statusCount.remoto}
              </div>
            </div>

            <div className="bg-white shadow rounded-xl px-3 py-2 text-center border-t-4 border-gray-400">
              <div className="text-gray-700 text-xs font-semibold">Offline</div>
              <div className="text-sm font-semibold animate-bounce mt-1">⚪ {stats.statusCount.offline}</div>
            </div>
          </div>
        </div>
      )}


      <div className="relative ml-2">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-black text-2xl hover:text-stone-600 focus:outline-none"
          aria-label="Abrir menu"
        >
          <GiHamburgerMenu />
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-2 bg-white shadow-xl rounded-xl p-4 z-50 w-52 grid grid-cols-2 gap-2 border-2 border-black">
            <ActionCard
              Icon={FaPlus}
              label="Adicionar Nó"
              onClick={() => {
                setEditNode(null);
                setShowForm(true);
                setMenuOpen(false);
              }}
            />
            <ActionCard
              Icon={FaTrash}
              label="Remover Tudo"
              onClick={() => {
                setNodeToRemoveAll({ name: 'do organograma' });
                setMenuOpen(false);
              }}
            />
            <ActionCard
              Icon={FaPen}
              label="Renomear"
              onClick={() => {
                setTitleForm(true);
                setMenuOpen(false);
              }}
            />
            <ActionCard
              Icon={FaInfoCircle}
              label="Info"
              onClick={() => {
                setAbout(true);
                setMenuOpen(false);
              }}
            />
            <ActionCard
              Icon={FaUndo}
              label="Voltar"
              onClick={() => window.location.reload()}
            />
          </div>
        )}
      </div>
    </header>
  );
}
