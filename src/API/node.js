const API_URL = 'http://localhost:4000';

export async function fetchNodes() {
  const res = await fetch(`${API_URL}/nodes`);
  if (!res.ok) throw new Error('Erro ao buscar nodes');
  return await res.json();
}

export async function createNode(data) {
  const res = await fetch(`${API_URL}/nodes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Erro ao criar nó');
  }
  return await res.json();
}

export async function deleteAllNodes() {
  const response = await fetch(`${API_URL}/nodes`, {
    method: 'DELETE'
  });

  if (!response.ok) {
    throw new Error('Erro ao remover todos os nós');
  }

  return true;
}

export async function updateNode(data) {
  const res = await fetch(`${API_URL}/nodes/${data.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Erro ao atualizar nó');
  }

  return await res.json();
}

