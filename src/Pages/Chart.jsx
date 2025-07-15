import { useState, useEffect, useRef, useMemo } from 'react';
import { Tree } from 'react-organizational-chart';
import { fetchNodes} from '../API/node.js';
import { FaSpinner } from "react-icons/fa";
import { MdCenterFocusStrong, MdFullscreen, MdFullscreenExit, MdAssignment, MdBuild } from 'react-icons/md';

import { renderTree } from '../Components/ChartComponents/treeConstruction.jsx';
import usePanZoom from '../Components/ChartComponents/ScreenRendering.jsx';
import useExportUtils from '../Components/ChartComponents/exportUtils.jsx'
import DownloadButtons from '../Components/ChartComponents/dowloadButton.jsx'
import useTreeData from '../Components/ChartComponents/SearchNode.jsx';
import useNodeActions from '../hooks/useNodeActions.jsx';
import StatusBadge from '../Components/ChartComponents/StatusBadge.jsx';
import Header from '../Components/ChartComponents/headerChart.jsx';

import defaultImage from '../assets/default-profiler.png';
import NodeForm from '../Components/NodeForm.jsx';
import Modal from "../Components/Modal.jsx";
import Search from '../Components/Search.jsx';
import AllTasks from '../Components/AllTask.jsx';
import { calculateStats } from '../Utils/calculateStatus.js';


export default function Chart() {
  const [exportMode, setExportMode] = useState(false);
  const [editPresidentSpecial, setEditPresidentSpecial] = useState(false);
  const [collapsedNodes, setCollapsedNodes] = useState(new Set());
  const [nodes, setNodes] = useState([]);
  const [showConfirmRemoveModal, setShowConfirmRemoveModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [nodeMenuOpen, setNodeMenuOpen] = useState(null)
  const [selectedNode, setSelectedNode] = useState(null);
  const [orgTitle, setOrgTitle] = useState("Organograma");
  const [titleForm, setTitleForm] = useState(false)
  const [about, setAbout] = useState(null)
  const [showRemoveModal, setShowRemoveModal] = useState(null)
  const [miniMapImage, setMiniMapImage] = useState(null)
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [comments, setComments] = useState({})
  const [showTaskPanel, setShowTaskPanel] = useState(false)
  const [showWorks, setShowWorks] = useState(false);
  const [showMiniMap, setShowMiniMap] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false)
  const [loadingMiniMap, setLoadingMiniMap] = useState(false);
  const [statusMap, setStatusMap] = useState({});

  const dragging = useRef(false);

  useEffect(() => {
    fetchNodes()
      .then(data => {
        setNodes(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
    zoomIn,
    zoomOut,
  } = usePanZoom({ scale, setScale, translate, setTranslate });

  const { treeData } = useTreeData(nodes, filter);

  function toggleCollapse(nodeId) {
    setCollapsedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  }

  const {
    editNode,
    setEditNode,
    nodeToRemove,
    nodeToRemoveAll,
    presidentDeleteBlocked,
    setPresidentDeleteBlocked,
    handleAddOrUpdateNode,
    handleEdit,
    handleRemove,
    confirmRemove,
    cancelRemove,
    handleRemoveAll,
    cancelRemoveAll,
    setNodeToRemove,
    setNodeToRemoveAll,
  } = useNodeActions({ nodes, setNodes, setShowForm, setShowRemoveModal });

  const { handleExportImage, handleExportPDF, generateMiniMap } = useExportUtils(
    setExportMode,
    setMiniMapImage,
    setLoadingMiniMap
  );

  useEffect(() => {
    if (!nodes.length) return;

    const statuses = ['online', 'offline', 'remoto'];
    const newStatusMap = {};
    nodes.forEach(node => {
      newStatusMap[node.id] = statuses[Math.floor(Math.random() * statuses.length)];
    });
    setStatusMap(newStatusMap);
  }, [nodes]);

  const toggleFullScreen = () => {
    const elem = document.documentElement;
    if (!document.fullscreenElement) {
      elem.requestFullscreen().catch((err) => {
        console.error(`Erro ao entrar em fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
    };
  }, []);

  const superiorNode = (selectedNode && Array.isArray(nodes))
    ? nodes.find(n => n.id === selectedNode.parentId)
    : null;

  const superiorName = superiorNode ? superiorNode.name : "Não informado";

  const stats = useMemo(() => calculateStats(treeData, statusMap), [treeData, statusMap]);

  const toggleFeita = (index) => {
    if (!selectedNode || !selectedNode.id) return;

    setComments(prev => {
      const tarefas = [...(prev[selectedNode.id] || [])];
      tarefas[index] = {
        ...tarefas[index],
        feita: !tarefas[index].feita,
      };
      return {
        ...prev,
        [selectedNode.id]: tarefas,
      };
    });
  };

  const removerTarefa = (index) => {
    setComments(prev => {
      const tarefas = [...(prev[selectedNode.id] || [])];
      tarefas.splice(index, 1);
      return {
        ...prev,
        [selectedNode.id]: tarefas,
      };
    });
  };

  function removerTodasTarefas() {
    setComments("")
  }

  function toggleWorks() {
    setShowWorks(prev => !prev);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center mt-12">
        <FaSpinner className="animate-spin text-4xl text-black" />
        <span className="ml-2 text-black">Carregando...</span>
      </div>
    );
  }


  return (
    <>
       <Header
        stats={stats}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        setEditNode={setEditNode}
        setShowForm={setShowForm}
        setNodeToRemoveAll={setNodeToRemoveAll}
        setTitleForm={setTitleForm}
        setAbout={setAbout}
      />

      {nodeToRemoveAll && (
        <Modal onClose={cancelRemoveAll}>
          <div className="text-center space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Tem certeza que deseja remover tudo <span className="text-red-600">{nodeToRemoveAll.name}</span>?
            </h2>
            <div className="flex justify-center space-x-4">
              <button onClick={cancelRemoveAll} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancelar</button>
              <button onClick={handleRemoveAll} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Remover Tudo</button>
            </div>
          </div>
        </Modal>
      )}

      <div
        className={`fixed top-24 right-4 z-50 bg-white rounded-xl shadow ~
          px-4 py-2 mt-4 w-90 transition-opacity duration-200
           ${menuOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
      >
        <Search value={filter} onChange={setFilter} placeholder="Buscar por nome ou cargo" />
      </div>


      <div className="fixed left-4 top-1/2 transform -translate-y-1/2 z-50 flex flex-col items-center space-y-4 delay-300 duration-1000">
        <button
          onClick={toggleWorks}
          title="Gestão de Tarefas"
          className="w-12 h-12 bg-white border border-green-600 text-green-600 rounded-full shadow hover:bg-green-600 hover:text-white flex items-center justify-center transition-colors duration-300"
        >
          <MdAssignment className="w-5 h-5" />
        </button>

        {!showSidebar && (
          <button
            onClick={() => setShowSidebar(true)}
            className="w-12 h-12 bg-white border border-green-600 text-green-600 rounded-full shadow hover:bg-green-600 hover:text-white flex items-center justify-center transition-colors animate-fadeIn duration-300"
            title="Ferramentas"
          >
            <MdBuild className="w-6 h-6" />
          </button>
        )}
      </div>

      {showSidebar && (
        <div className="fixed left-0 top-1/2 transform -translate-y-1/2 flex flex-col space-y-2 z-50 bg-white border border-green-500 rounded-r-xl p-3 shadow-lg animate-fadeIn duration-300 ">

          <button
            onClick={() => setShowSidebar(false)}
            className="self-start text-red-500 hover:text-red-700 text-xl font-bold mb-2"
            title="Fechar"
          >
            ✖
          </button>

          <button onClick={zoomIn} title='Aumentar Tela' className="w-10 h-10 bg-green-600 text-white rounded-full shadow hover:bg-green-700 text-xl font-bold">+</button>
          <button onClick={zoomOut} title='Diminuir Tela' className="w-10 h-10 bg-green-600 text-white rounded-full shadow hover:bg-green-700 text-xl font-bold">–</button>
          <button
            onClick={() => {
              setTranslate({ x: 0, y: 0 });
              setScale(1);
            }}
            title='Centralizar'
            className="w-10 h-10 bg-green-600 text-white rounded-full shadow"
          >
            <MdCenterFocusStrong className="w-8 h-8 ml-1" />
          </button>
          <button
            onClick={toggleFullScreen}
            text='Tela Cheia'
            className="w-10 h-10 bg-green-600 text-white rounded-full shadow hover:bg-green-700 flex items-center justify-center"
          >
            {isFullscreen ? (
              <MdFullscreenExit className="w-8 h-8" />
            ) : (
              <MdFullscreen className="w-8 h-8" />
            )}
          </button>
        </div>
      )}

      < div className="fixed inset-0 flex justify-center items-start pt-[200px] overflow-hidden" >
        <div
          id="org-tree"
          className="m- p-10 bg-white rounded-lg cursor-move"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          style={{
            transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
            transformOrigin: 'center center',
            userSelect: 'none',
            width: 'max-content',
            height: 'max-content',
            cursor: dragging.current ? 'grabbing' : 'grab'
          }}
        >
          {treeData.length === 0 ? (
            <p className="text-center text-gray-500">Nenhum nó cadastrado ainda.</p>
          ) : (
            <Tree
              lineWidth={'9px'}
              lineColor={'#4ade80'}
              lineBorderRadius={'25px'}
              label={(
                <div
                  className="font-bold text-3xl mb-4 cursor-pointer"
                  onClick={() => setTitleForm(true)}
                >
                  {orgTitle}
                </div>
              )}
            >
              {renderTree(
                treeData, handleEdit, handleRemove,
                exportMode, collapsedNodes, toggleCollapse,
                selectedNode, setSelectedNode, nodeMenuOpen, setNodeMenuOpen, statusMap)}
            </Tree>
          )}
        </div>
      </div >

      {
        showForm && (
          <Modal onClose={() => { setShowForm(false); setEditNode(null); }}>
            <NodeForm
              nodes={nodes}
              onSubmit={handleAddOrUpdateNode}
              nodeToEdit={editNode}
              isEditMode={!!editNode}
              editPresidentSpecial={editPresidentSpecial}
            />
          </Modal>
        )
      }

      {
        nodeToRemove && (
          <Modal onClose={cancelRemove}>
            <div className="text-center space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Tem certeza que deseja remover <span className="text-red-600">{nodeToRemove.name}</span>?
              </h2>
              <div className="flex justify-center space-x-4">
                <button onClick={cancelRemove} className="px-4 py-2 bg-gray-300 rounded-xl hover:bg-gray-400">Cancelar</button>
                <button onClick={confirmRemove} className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700">Remover</button>
              </div>
            </div>
          </Modal>
        )
      }

      {
        presidentDeleteBlocked && (
          <Modal onClose={() => setPresidentDeleteBlocked(null)}>
            <div className="text-center space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">
                O presidente <span className="text-red-600">{presidentDeleteBlocked.name}</span> não pode ser removido.
              </h2>
              <p className="text-gray-600">Você precisa cadastrar um novo Presidente para removê-lo.</p>

              <div className="flex justify-center flex-wrap gap-4">
                <button
                  onClick={() => setPresidentDeleteBlocked(null)}
                  className="px-4 py-2 bg-gray-300 rounded-xl hover:bg-gray-400"
                >
                  Cancelar
                </button>

                <button
                  onClick={() => {
                    setEditNode(presidentDeleteBlocked);
                    setEditPresidentSpecial(true);
                    setShowForm(true);
                    setPresidentDeleteBlocked(null);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                >
                  Cadastrar Novo Presidente
                </button>

                <button
                  onClick={() => setShowConfirmRemoveModal(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700"
                >
                  Remover Mesmo Assim
                </button>

              </div>
            </div>
          </Modal>
        )
      }

      {
        showConfirmRemoveModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
              <h3 className="text-xl font-bold mb-4 text-red-600">
                Remoção do Presidente
              </h3>
              <p className="mb-4 text-gray-700">
                Remover o presidente também removerá <strong>todos os subordinados</strong>. Deseja continuar?
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    handleRemoveAll();
                    alert("Removido com Sucesso");
                    setPresidentDeleteBlocked(null);
                    setShowConfirmRemoveModal(false);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700"
                >
                  Confirmar Remoção
                </button>
                <button
                  onClick={() => {
                    setEditNode(presidentDeleteBlocked);
                    setShowForm(true);
                    setShowConfirmRemoveModal(false);
                    setPresidentDeleteBlocked(null);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                >
                  Mudar Presidente
                </button>

                <button
                  onClick={() => {
                    setPresidentDeleteBlocked(null)
                    setShowConfirmRemoveModal(false);
                  }}
                  className="px-4 py-2 bg-gray-300 rounded-xl hover:bg-gray-400"
                >
                  Cancelar
                </button>

              </div>
            </div>
          </div>
        )
      }

      {
        titleForm && (
          <Modal onClose={() => setTitleForm(false)}>
            <div className="text-center space-y-4">
              <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md mx-auto">
                <h2 className="text-xl font-bold mb-4">Renomear Organograma</h2>

                <label className='mr-4'>Novo nome:</label>

                <input className="mb-6 mt-4 border border-green-500 rounded-xl p-2" type="text border" placeholder={orgTitle} onChange={(e) => setOrgTitle(e.target.value)} />

                <button
                  className="text-left px-4 py-2 mb-2 mt-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                  onClick={() => {
                    setOrgTitle(orgTitle)
                    setTitleForm(false);
                  }}
                >
                  Renomear Organograma
                </button>

                <button
                  className='text-left px-4 py-2 mb-2 mt-2 font-semibold bg-stone-300 text-black rounded-lg hover:bg-stone-400 ml-4'

                  onClick={() => {
                    setTitleForm(false)
                    setOrgTitle("Organograma")
                  }}
                >
                  Sair
                </button>
              </div>
            </div>
          </Modal>
        )
      }

      {
        selectedNode && (() => {
          const status = statusMap[selectedNode.id] || 'offline';

          return (
            <Modal
              className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-auto my-8 border border-green-200 "
              onClose={() => setSelectedNode(null)}
            >
              <h2 className='font-bold mb-6 text-center text-2xl  border-b-2 pb-3 border-green-500 '>
                Informações de {selectedNode.name}
              </h2>

              <div className="space-y-5 text-gray-800 px-4 ">

                <div className="flex justify-center">
                  <img
                    src={selectedNode.photoBase64 || defaultImage}
                    alt={selectedNode.name}
                    onError={(e) => (e.target.src = defaultImage)}
                    className="w-32 h-32 rounded-full object-cover border-4 border-green-400 shadow-md bg-slate-400 animate-pulse"
                  />
                </div>

               
                <div>
                  <p className="text-lg text-green-600">Nome</p>
                  <p className="text-base font-semibold ml-4">{selectedNode.name}</p>
                </div>

                
                <div>
                  <p className="text-lg text-green-600">Superior</p>
                  <p className="text-base font-semibold ml-4">{superiorName}</p>
                </div>

                <div>
                  <p className="text-lg text-green-600">Cargo</p>
                  <p className="text-base font-semibold ml-4">{selectedNode.title || 'Não informado'}</p>
                </div>

                <div className=" mt-4">
                  <p className="text-lg text-green-600 mb-1">Status</p>
                  <div className='flex row-auto space-x-48'>
                    <div className="flex items-center gap-2 bg-stone-300 border border-gray-200 px-3 py-2 rounded-lg shadow-sm w-fit ml-2">
                       <StatusBadge status={status} />
                    </div>
                    <button onClick={() => {
                      console.log('Selecionado:', nodes.id);
                      setShowTaskPanel(true);

                    }} className='p-1 h-15 bg-green-600 text-white rounded-xl hover:bg-green-700 '>Adicionar Tarefa</button>
                  </div>
                </div>
              </div>

            </Modal>
          );
        })()
      }

      {
        about && (
          <Modal className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-auto my-8 border border-green-200" onClose={() => setAbout(null)}>
            <h1 className='text-center mb-4 font-bold text-2xl'>O que é um organograma?</h1>

            <div className='grid gap-4 mt-9 border border-green-600 border-opacity-100 p-4 text-base font-medium text-gray-800 leading-relaxed'>

              <p>
                Um organograma é um gráfico que mostra a estrutura hierárquica de uma organização.
                Apresenta quem são os responsáveis, quem responde a quem e quais os cargos existentes.
              </p>

              <div>
                <p className='font-semibold text-green-600'>📌 Para que serve?</p>
                <ul className='list-disc list-inside ml-4'>
                  <li>Visualizar a estrutura da equipa</li>
                  <li>Melhorar a comunicação interna</li>
                  <li>Clarificar funções e responsabilidades</li>
                </ul>
              </div>

              <div>
                <p className='font-semibold text-green-600'>📌 Como se usa?</p>
                <ul className='list-disc list-inside ml-4'>
                  <li>Coloca-se o cargo mais alto no topo (por exemplo, Presidente), que será sempre o primeiro</li>
                  <li>Ligam-se os subordinados por níveis</li>
                  <li>Cada caixa representa uma pessoa ou função</li>
                  <li>As linhas mostram as relações de chefia</li>
                  <li>As linhas mostram as relações hierárquicas (quem supervisiona quem)</li>
                  <li>É útil em empresas, escolas e qualquer organização com hierarquia</li>
                </ul>
              </div>

            </div>
          </Modal>
        )
      }
      {
        showRemoveModal && nodeToRemove && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
              <h2 className="text-lg font-semibold mb-4">Confirmar Remoção</h2>
              <p className="mb-4">
                O funcionário <strong>{nodeToRemove.name}</strong> possui subordinados.
                Se você continuar, ele e todos os subordinados serão removidos permanentemente.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  className="px-4 py-2 rounded-xl bg-gray-300 hover:bg-gray-400"
                  onClick={() => {
                    setNodeToRemove(null);
                    setShowRemoveModal(false);
                  }}
                >
                  Cancelar
                </button>
                <button
                  className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white"
                  onClick={confirmRemove}
                >
                  Remover tudo
                </button>
              </div>
            </div>
          </div>
        )
      }

      <div className="fixed bottom-4 left-7 z-50">
        {!showMiniMap && (
          <button
            onClick={() => {
              generateMiniMap(); 
              setShowMiniMap(true);
            }}
            className="bg-green-600 text-white text-sm py-2 px-4 rounded-xl shadow hover:bg-green-700 transition"
          >
            Gerar Mini Mapa
          </button>
        )}

        {showMiniMap && (
          <div className="border border-green-500 bg-white shadow-lg p-3 rounded-lg transition-all duration-300">

            {miniMapImage && (
              <img
                src={miniMapImage}
                alt="Mini mapa do organograma"
                className="w-44 h-auto object-contain cursor-pointer transition-transform duration-300 hover:scale-105"
                onClick={() => {
                  setTranslate({ x: 0, y: 0 });
                  setScale(1);
                }}
              />
            )}

            <div className="mt-2 flex justify-between gap-2">
              <button
                onClick={generateMiniMap}
                className="flex-1 bg-green-600 text-white text-xs py-1 px-2 rounded-lg hover:bg-green-700 flex items-center justify-center gap-1"
                disabled={loadingMiniMap}
              >
                {loadingMiniMap ? (
                  <FaSpinner className="animate-spin text-white" />
                ) : (
                  'Atualizar'
                )}
              </button>

              <button
                onClick={() => setShowMiniMap(false)}
                className="flex-1 bg-red-500 text-white text-xs py-1 px-2 rounded-lg hover:bg-red-600"
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </div>
      {
        showTaskPanel && selectedNode && (
          <div className="fixed top-28 bottom-28 right-0 w-96 max-w-full bg-white shadow-2xl border-l border-gray-200 p-6 z-50 overflow-y-auto rounded-lg animate-fadeIn animate-fadeOut">
            <h2 className="text-2xl font-bold text-green-700 text-center border-b pb-2 mb-6">
              📋 Tarefas de <span className="text-black">{selectedNode.name}</span>
            </h2>

            <button
              onClick={() => setShowTaskPanel(false)}
              className="text-red-500 hover:text-red-700 text-2xl font-bold absolute top-4 right-4"
              title="Fechar painel"
            >
              ✖
            </button>

            {comments[selectedNode.id] && (
              <div className="flex items-center justify-between text-sm mb-6 text-gray-700">
                <div className="flex gap-4">
                  <span>🔴 Pendentes: <b>{comments[selectedNode.id].filter(t => !t.feita).length}</b></span>
                  <span>✅ Concluídas: <b>{comments[selectedNode.id].filter(t => t.feita).length}</b></span>
                </div>
                <button
                  onClick={removerTodasTarefas}
                  className="text-red-600 hover:text-red-800 text-xs underline"
                >
                  🗑️ Excluir Todas
                </button>
              </div>
            )}

            <ul className="space-y-3">
              {(comments[selectedNode.id] || []).map((tarefa, idx) => (
                <li key={idx} className="flex justify-between items-center bg-gray-50 rounded p-2 shadow-sm">
                  <span className={`text-sm ${tarefa.feita ? "line-through text-gray-400" : "text-gray-800"}`}>
                    {tarefa.texto}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleFeita(idx)}
                      className={`text-white px-2 py-1 rounded text-xs font-medium ${tarefa.feita ? "bg-yellow-500 hover:bg-yellow-600" : "bg-green-600 hover:bg-green-700"
                        }`}
                    >
                      {tarefa.feita ? "Desfazer" : "Feito"}
                    </button>

                    <button
                      onClick={() => removerTarefa(idx)}
                      className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs font-medium"
                    >
                      Excluir
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-6">
              <input
                type="text"
                placeholder="Adicionar nova tarefa..."
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.target.value.trim()) {
                    const nova = { texto: e.target.value.trim(), feita: false };
                    setComments(prev => ({
                      ...prev,
                      [selectedNode.id]: [...(prev[selectedNode.id] || []), nova],
                    }));
                    e.target.value = "";
                  }
                }}
              />
            </div>
          </div>
        )
      }

      {showWorks && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-40"
          ></div>

          <AllTasks
            comments={comments}
            nodes={nodes || []}
            onClose={() => setShowWorks(false)}
            filter={filter}
            getStatusBadge={StatusBadge}
            className="z-50"
            cardSelect={(node) => setSelectedNode(node)}
          />
        </>
      )}

      <DownloadButtons
        nodes={nodes}
        onExportImage={handleExportImage}
        onExportPDF={handleExportPDF}
      />
    </>
  );
}
