import { TreeNode } from 'react-organizational-chart';
import defaultImage from '../../assets/default-profiler.png';
import { GiHamburgerMenu } from 'react-icons/gi';


export function buildTree(nodes) {
  const map = new Map();
  const roots = [];


  nodes.forEach(node => {
    map.set(node.id, { ...node, children: [] });
  });

  nodes.forEach(node => {
    if (!node.parentId || node.parentId === 0) {
      roots.push(map.get(node.id));
    } else {
      const parent = map.get(node.parentId);
      if (parent) {
        parent.children.push(map.get(node.id));
      } else {
        roots.push(map.get(node.id));
      }
    }
  });

  roots.sort((a, b) => {
    if (a.title.toLowerCase() === 'presidente') return -1;
    if (b.title.toLowerCase() === 'presidente') return 1;
    return 0;
  });

  return roots;
}

export function renderTree(
  nodes,
  onEdit,
  onRemove,
  exportMode,
  collapsedNodes,
  toggleCollapse,
  selectedNode,
  setSelectedNode,
  nodeMenuOpen,
  setNodeMenuOpen,
  statusMap
) {
  return nodes.map(node => {
    const isCollapsed = collapsedNodes.has(node.id);
    const hasChildren = node.children.length > 0;
    const supervisedCount = node.children.length;
    const isMenuOpen = nodeMenuOpen === node.id;
    const status = statusMap[node.id] || 'offline';
    const statusColors = {
      online: 'green',
      offline: 'gray',
      remoto: 'blue',
    };


    return (
      <TreeNode
        key={node.id}
        label={
          <div
            className="inline-block text-center relative cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              toggleCollapse(node.id);
            }}
          >
            <div className="image center">

              <div className={`relative w-full duration-[2000ms] delay-300 max-w-[170px] min-h-[260px] 
                ${exportMode ? '' : 'animate-fadeIn'} 
                ${exportMode ? '' : 'hover:bg-stone-200'} 
              bg-stone-100 border-2 border-green-400 rounded-2xl shadow-md hover:shadow-lg 
                transition-shadow duration-400 p-4 flex flex-col items-center text-center mx-10 my-10`}
              >


                <div className=' animate-pulse font-semibold'>
                  <span style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    backgroundColor: statusColors[status],
                    display: 'inline-block',
                    marginRight: 6,
                  }} />
                  <span>{status}</span>
                </div>

                <button
                  className="absolute top-2 right-2 text-gray-700 hover:text-black z-10 "
                  style={{ lineHeight: 0 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setNodeMenuOpen(isMenuOpen ? null : node.id);
                  }}
                >
                  <GiHamburgerMenu size={21} />
                </button>

                {isMenuOpen && (
                  <div
                    className="absolute top-10 right-2 bg-white shadow-lg rounded-xl p-4 flex flex-col gap-2 z-50 border border-green-500"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => {
                        onEdit(node);
                        setNodeMenuOpen(null);
                      }}
                      className="text-sm px-3 text-white py-1 rounded-xl bg-blue-500 hover:bg-blue-600 text-left"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => {
                        onRemove(node);
                        setNodeMenuOpen(null);
                      }}
                      className="text-sm px-3 py-1 text-white rounded-xl bg-red-500 hover:bg-red-600 text-left"
                    >
                      Remover
                    </button>
                  </div>
                )}

                <img
                  src={node.photoBase64 || defaultImage}
                  alt={node.name}
                  onError={(e) => (e.target.src = defaultImage)}
                  className="w-24 h-24 rounded-full object-cover border-4 border-green-400 mb-4 mt-6 bg-slate-400 "
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedNode(node);
                  }}
                  title="Mais informações"
                />

                <div className="font-semibold text-gray-800 text-base">
                  {node.name}
                </div>
                <div className="text-sm text-gray-500 mb-3">{node.title}</div>

                <div className="h-6 mt-2 ">
                  {!exportMode && hasChildren ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCollapse(node.id);
                      }}
                      className="text-xs text-gray-600 underline hover:text-blue-600"
                    >
                      {isCollapsed ? 'Mostrar empregados' : 'Ocultar empregados'}
                    </button>
                  ) : (
                    <span className="text-xs text-transparent">.</span> 
                  )}
                </div>

                {hasChildren && isCollapsed && (
                  <p className="mt-2 text-xs text-gray-600">
                    Ele supervisiona {supervisedCount}{' '}
                    {supervisedCount === 1 ? 'empregado' : 'empregados'}
                  </p>
                )}
              </div>
            </div>
          </div>
        }
      >
        {!isCollapsed &&
          hasChildren &&
          renderTree(
            node.children,
            onEdit,
            onRemove,
            exportMode,
            collapsedNodes,
            toggleCollapse,
            selectedNode,
            setSelectedNode,
            nodeMenuOpen,
            setNodeMenuOpen,
            statusMap
          )}
      </TreeNode>
    );
  });
}