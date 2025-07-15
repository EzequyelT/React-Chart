import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';

const app = express();
const PORT = 4000;
const DATA_PATH = path.resolve('data.json');

app.use(cors());
app.use(express.json({ limit: '10mb' })); 


async function readData() {
  try {
    const content = await fs.readFile(DATA_PATH, 'utf8');
    return JSON.parse(content);
  } catch {
    return []; 
  }
}

async function writeData(data) {
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2));
}

function hasCycle(nodes, nodeId, parentId) {
  if (parentId === null) return false;
  if (parentId === nodeId) return true;

  let currentParent = nodes.find(n => n.id === parentId);
  while (currentParent) {
    if (currentParent.parentId === nodeId) return true;
    currentParent = nodes.find(n => n.id === currentParent.parentId);
  }
  return false;
}

function removeNodeAndChildren(nodes, id) {
  const toRemoveIds = [id];
  let index = 0;

  while (index < toRemoveIds.length) {
    const currentId = toRemoveIds[index];
    const children = nodes.filter(n => n.parentId === currentId);
    children.forEach(child => toRemoveIds.push(child.id));
    index++;
  }

  return nodes.filter(n => !toRemoveIds.includes(n.id));
}

async function validateNode(newNode, existingNodes, isEdit = false) {
  const titleLower = newNode.title.toLowerCase();

  if (!newNode.name || typeof newNode.name !== 'string' || newNode.name.trim() === '') {
    throw new Error('Nome é obrigatório.');
  }
  if (!newNode.title || typeof newNode.title !== 'string' || newNode.title.trim() === '') {
    throw new Error('Título é obrigatório.');
  }

  if (titleLower !== 'presidente') {
    if (newNode.parentId === null || typeof newNode.parentId !== 'number' || isNaN(newNode.parentId)) {
      throw new Error('Apenas o presidente pode não ter superior.');
    }
    const parentExists = existingNodes.some(n => n.id === newNode.parentId);
    if (!parentExists) {
      throw new Error('O superior indicado não existe.');
    }
  } else {
    if (newNode.parentId !== null) {
      throw new Error('Presidente não pode ter superior.');
    }
    const existingPresident = existingNodes.find(n =>
      n.title.toLowerCase() === 'presidente' && (!isEdit || n.id !== newNode.id)
    );
    if (existingPresident) {
      throw new Error('Já existe um presidente no organograma.');
    }
  }

  if (hasCycle(existingNodes, newNode.id, newNode.parentId)) {
    throw new Error('Ciclo detectado na hierarquia.');
  }
}

app.get('/nodes', async (req, res) => {
  try {
    const nodes = await readData();
    res.json(nodes);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Erro ao ler dados.' });
  }
});

app.post('/nodes', async (req, res) => {
  try {
    const nodes = await readData();
    const newNode = {
      id: Date.now(),
      name: req.body.name,
      title: req.body.title,
      parentId: req.body.parentId === null ? null : Number(req.body.parentId),
      photoBase64: req.body.photoBase64 || null,
    };

    await validateNode(newNode, nodes);

    nodes.push(newNode);
    await writeData(nodes);
    res.status(201).json(newNode);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/nodes/:id', async (req, res) => {
  try {
    const nodes = await readData();
    const id = Number(req.params.id);
    const idx = nodes.findIndex(n => n.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Node not found' });

    const updatedNode = {
      ...nodes[idx],
      name: req.body.name ?? nodes[idx].name,
      title: req.body.title ?? nodes[idx].title,
      parentId: req.body.parentId === undefined
        ? nodes[idx].parentId
        : (req.body.parentId === null ? null : Number(req.body.parentId)),
      photoBase64: req.body.photoBase64 ?? nodes[idx].photoBase64,
      id: nodes[idx].id,
    };

    await validateNode(updatedNode, nodes, true);

    nodes[idx] = updatedNode;
    await writeData(nodes);
    res.json(updatedNode);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/nodes/:id', async (req, res) => {
  try {
    let nodes = await readData();
    const id = Number(req.params.id);
    const nodeToRemove = nodes.find(n => n.id === id);

    if (!nodeToRemove) {
      return res.status(404).json({ error: 'Nó não encontrado.' });
    }

    const isPresident = nodeToRemove.title.toLowerCase() === 'presidente';
    if (isPresident) {
      const remainingPresidents = nodes.filter(n =>
        n.title.toLowerCase() === 'presidente' && n.id !== id
      );
      if (remainingPresidents.length === 0) {
        const possibleSuccessors = nodes.filter(n => n.parentId === id);
        if (possibleSuccessors.length === 0) {
          return res.status(400).json({
            error: 'Não é possível remover o presidente sem antes definir um substituto ou alterar a hierarquia.'
          });
        }
      }
    }

    nodes = removeNodeAndChildren(nodes, id);
    await writeData(nodes);
    res.json({ message: 'Nó removido com sucesso.' });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Erro ao remover nó.' });
  }
});

app.delete('/nodes', async (req, res) => {
  try {
    console.log('Recebido DELETE em /nodes — limpando todos os nós');
    await writeData([]); 
    res.status(204).send();
  } catch (err) {
    console.error('Erro ao deletar todos os nós:', err);
    res.status(500).json({ error: 'Erro ao deletar todos os nós.' });
  }
});


app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
});
