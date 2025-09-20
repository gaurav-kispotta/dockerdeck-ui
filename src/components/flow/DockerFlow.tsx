import { useCallback, useEffect, useMemo, useState } from 'react';
import ReactFlow, { useNodesState, useEdgesState, Node, Edge } from 'reactflow';
import { useAppSelector } from '../../store/hooks';
import { EdgeBuilder } from '../../modules/node-builder/EdgeBuilder';
import dagre from 'dagre';

const DockerFlow = ({ ast }) => {
  const { showDependencies } = useAppSelector(state => state.settings);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [originalNodePositions, setOriginalNodePositions] = useState({});

  // Generate nodes and edges from AST
  useEffect(() => {
    if (!ast) return;

    // ...existing code to generate nodes...
    
    // Store original positions for when we toggle back from dependency view
    const positionMap = {};
    nodes.forEach(node => {
      positionMap[node.id] = { x: node.position.x, y: node.position.y };
    });
    setOriginalNodePositions(positionMap);
    
    // Build edges based on the AST
    const edgeBuilder = new EdgeBuilder(ast);
    const allEdges = edgeBuilder.getAllEdges({
      showDependencyEdges: showDependencies
    });
    
    setEdges(allEdges);
  }, [ast]);

  // Effect to handle dependency view toggle
  useEffect(() => {
    if (!ast || nodes.length === 0) return;
    
    // Get edges with updated dependency visibility setting
    const edgeBuilder = new EdgeBuilder(ast);
    const allEdges = edgeBuilder.getAllEdges({
      showDependencyEdges: showDependencies
    });
    
    if (showDependencies) {
      // Find all nodes involved in dependency relationships
      const dependencyEdges = allEdges.filter(edge => 
        edge.data?.connectionType === 'depends_on'
      );
      
      const involvedNodeIds = new Set<string>();
      dependencyEdges.forEach(edge => {
        involvedNodeIds.add(edge.source);
        involvedNodeIds.add(edge.target);
      });
      
      // Apply hierarchical layout for dependencies
      const hierarchicalLayout = getDependencyLayout(
        nodes.map(node => ({
          ...node,
          // Highlight nodes involved in dependency relationships
          style: {
            ...node.style,
            opacity: involvedNodeIds.has(node.id) ? 1 : 0.3,
            border: involvedNodeIds.has(node.id) ? '2px solid #ef4444' : node.style?.border
          }
        })),
        dependencyEdges
      );
      
      setNodes(hierarchicalLayout);
    } else {
      // Restore original layout and styling
      setNodes(nodes.map(node => ({
        ...node,
        position: originalNodePositions[node.id] || node.position,
        style: {
          ...node.style,
          opacity: 1,
          border: node.style?.border?.replace('#ef4444', '#333') // Remove highlight border
        }
      })));
    }
    
    setEdges(allEdges);
  }, [showDependencies, ast]);

  // Function to calculate dependency tree layout
  const getDependencyLayout = useCallback((nodes, edges) => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({ rankdir: 'TB', ranksep: 100, nodesep: 100 });
    
    // Add nodes
    nodes.forEach(node => {
      dagreGraph.setNode(node.id, { width: 180, height: 80 });
    });
    
    // Add edges - only dependency edges
    edges.forEach(edge => {
      dagreGraph.setEdge(edge.source, edge.target);
    });
    
    // Calculate layout
    dagre.layout(dagreGraph);
    
    // Apply layout to nodes
    return nodes.map(node => {
      const nodeWithPosition = dagreGraph.node(node.id);
      
      // Only update positions for nodes involved in dependencies
      if (nodeWithPosition) {
        return {
          ...node,
          position: {
            x: nodeWithPosition.x - 90,
            y: nodeWithPosition.y - 40
          }
        };
      }
      return node;
    });
  }, []);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      // ...existing code...
    />
  );
};

export default DockerFlow;