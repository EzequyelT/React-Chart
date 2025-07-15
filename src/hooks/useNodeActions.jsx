import { useState } from 'react';
import { createNode, updateNode, fetchNodes, deleteAllNodes } from '../API/node';

export default function useNodeActions({ nodes, setNodes, setShowForm, setShowRemoveModal }) {
  const [editNode, setEditNode] = useState(null);
  const [nodeToRemove, setNodeToRemove] = useState(null);
  const [nodeToRemoveAll, setNodeToRemoveAll] = useState(null);
  const [presidentDeleteBlocked, setPresidentDeleteBlocked] = useState(null);

  async function handleAddOrUpdateNode(newNode, editPresidentSpecial = false, setEditPresidentSpecial = () => {}) {
    try {
      if (editNode) {
        const updated = await updateNode(newNode);
        setNodes(prev => prev.map(n => (n.id === updated.id ? updated : n)));
        setEditNode(null);
        setShowForm(false);

        if (editPresidentSpecial) {
          alert('Edição do presidente concluída com sucesso!');
          setEditPresidentSpecial(false);
        }
      } else {
        const savedNode = await createNode(newNode);
        setNodes(prev => [...prev, savedNode]);
        setShowForm(false);
      }
    } catch (error) {
      alert(error.message || 'Erro ao salvar nó');
    }
  }

  function handleEdit(node) {
    setEditNode(node);
    setShowForm(true);
  }

  function handleRemove(node) {
    const isPresidente = node.title.toLowerCase() === 'presidente';

    if (isPresidente) {
      const otherPresident = nodes.find(n =>
        n.id !== node.id && n.title.toLowerCase() === 'presidente'
      );
      if (!otherPresident) {
        setPresidentDeleteBlocked(node);
        return;
      }
    }

    const hasSubordinates = nodes.some(n => n.parentId === node.id);

    if (hasSubordinates) {
      setNodeToRemove(node);
      if (setShowRemoveModal) setShowRemoveModal(true); // abre modal de confirmação
    } else {
      setNodeToRemove(node);
    }
  }

  async function confirmRemove() {
    try {
      if (!nodeToRemove) return;

      const isPresidente = nodeToRemove.title.toLowerCase() === 'presidente';
      if (isPresidente) {
        const otherPresident = nodes.find(n =>
          n.id !== nodeToRemove.id &&
          n.title.toLowerCase() === 'presidente'
        );

        if (!otherPresident) {
          alert('Você não pode remover o presidente sem ter um substituto com o título "presidente" já cadastrado.');
          setNodeToRemove(null);
          if (setShowRemoveModal) setShowRemoveModal(false);
          return;
        }
      }

      const response = await fetch(`http://localhost:4000/nodes/${nodeToRemove.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Erro ao remover funcionário do servidor');

      const updatedNodes = await fetchNodes();
      setNodes(updatedNodes);
      setNodeToRemove(null);
      if (setShowRemoveModal) setShowRemoveModal(false);
    } catch (error) {
      alert(error.message || 'Erro ao remover');
    }
  }

  function cancelRemove() {
    setNodeToRemove(null);
    if (setShowRemoveModal) setShowRemoveModal(false);
  }

  async function handleRemoveAll() {
    if (nodes.length === 0) {
      alert("Erro: não há nós para remover.");
      setNodeToRemoveAll(null);
      return;
    }

    try {
      await deleteAllNodes();
      setNodes([]);
      setNodeToRemoveAll(null);
      alert('Todos os nós foram removidos com sucesso.');
    } catch (error) {
      alert(error.message || 'Erro ao remover todos os nós.');
    }
  }

  function cancelRemoveAll() {
    setNodeToRemoveAll(null);
  }

  return {
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
  };
}
