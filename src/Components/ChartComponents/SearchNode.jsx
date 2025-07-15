import { useMemo } from 'react';
import { buildTree } from './treeConstruction';

export default function useTreeData(nodes, filter) {
  const normalizedFilter = filter.trim().toLowerCase();

  const filteredNodes = nodes.filter(n => {
    const name = n.name?.toLowerCase() || '';
    const title = n.title?.toLowerCase() || '';
    return name.includes(normalizedFilter) || title.includes(normalizedFilter);
  });

  const treeData = useMemo(() => buildTree(filteredNodes), [filteredNodes]);

  return { treeData }; 
}

