export function calculateStats(treeData, statusMap) {
  const statusCount = { online: 0, remoto: 0, offline: 0 };
  const titles = {};
  let total = 0;

  function traverse(nodes) {
    for (const node of nodes) {
      total++;
      const status = statusMap[node.id] || 'offline';
      statusCount[status] = (statusCount[status] || 0) + 1;
      if (node.title) {
        titles[node.title] = (titles[node.title] || 0) + 1;
      }
      if (node.children?.length) traverse(node.children);
    }
  }

  traverse(treeData);

  return { total, statusCount, titles };
}
