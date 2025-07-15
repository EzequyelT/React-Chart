import defaultImage from '../assets/default-profiler.png';

export default function SidebarTasks({ comments, nodes = [], filter = '', onClose, cardSelect }) {
  const filteredNodes = nodes.filter(node =>
    node.name.toLowerCase().includes(filter.toLowerCase()) ||
    (node.title || '').toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="fixed top-16 bottom-42 h-full w-96  bg-gray-100 shadow-lg z-50 flex flex-col duration-1000 delay-500 animate-fadeOut">
      <div className="flex justify-between items-center p-6">
        <h2 className="text-2xl text-center font-bold ml-2">Tarefas dos Funcionários</h2>
        <button
          onClick={onClose}
          className="text-gray-600 hover:text-gray-900 font-bold text-xl"
          title="Fechar"
        >
          x
        </button>
      </div>

      <div className="p-4 overflow-y-auto flex-grow space-y-4">
        {filteredNodes.map((node) => {
          const tarefas = comments[node.id] || [];
          const pendentes = tarefas.filter(t => !t.feita);
          const feitas = tarefas.filter(t => t.feita);

          return (
            <div key={node.id} className="bg-gray-100 hover:bg-gray-200 rounded-xl shadow p-4 border-2 border-green-500 animate-fadeIn">
              <div className="flex items-center gap-2 mb-3 p-1">
                <img
                  src={node.photoBase64 || defaultImage}
                  alt={node.name}
                  className="w-16 h-16 rounded-full border-2 border-green-400 object-cover bg-slate-600 animate-pulse cursor-pointer"
                  onClick={() => {
                    cardSelect(node);
                    onClose();
                  }}
                />
                <div>
                  <h3 className="text-md font-semibold">{node.name}</h3>
                  <p className="text-sm text-gray-600">{node.title || 'Cargo não informado'}</p>
                </div>
              </div>

              <div className="flex gap-2 mb-3 text-sm text-gray-700">
                <p>🔴 Pendentes: <span className="font-semibold">{pendentes.length}</span></p>
                <p>✅ Concluídas: <span className="font-semibold">{feitas.length}</span></p>
              </div>

              <ul className="space-y-2 max-h-48  overflow-y-auto text-sm border border-b-black">
                {tarefas.length === 0 && <li className="text-gray-400 italic">Nenhuma tarefa cadastrada</li>}
                {tarefas.map((tarefa, idx) => (
                  <li key={idx} className="flex justify-between items-center bg-gray-100 rounded p-2 shadow-sm">
                    <span className={tarefa.feita ? "line-through text-gray-400" : "text-gray-800"}>
                      {tarefa.texto}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
