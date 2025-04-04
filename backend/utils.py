#backend/utils.py
import json
import difflib

def get_close_matches_for_node(undefined_node, defined_nodes, cutoff=0.7):
    """Finds close string matches for undefined node references."""
    return difflib.get_close_matches(str(undefined_node), defined_nodes, n=3, cutoff=cutoff)

def format_list(lst, max_items=10):
    """Formats a list for concise printing."""
    if not lst:
        return "[]"
    if len(lst) > max_items:
        return ", ".join(str(x) for x in lst[:max_items]) + f", ... (total: {len(lst)} items)"
    else:
        return ", ".join(str(x) for x in lst)

def custom_json_dumps(data):
    """Custom JSON dump for consistent formatting (like original script)."""
    if not isinstance(data, dict) or "nodes" not in data or "edges" not in data:
        # Basic fallback for unexpected data
        return json.dumps(data, indent=4)

    out_lines = []
    out_lines.append("{")

    # --- Nodes ---
    out_lines.append('    "nodes": {')
    # Ensure nodes is a dict before sorting
    nodes_dict = data.get("nodes", {})
    if isinstance(nodes_dict, dict):
        node_items = sorted(nodes_dict.items(), key=lambda item: str(item[0]))
        for i, (key, value) in enumerate(node_items):
            # Ensure node values are dicts for consistent formatting
            node_value_str = json.dumps(value, separators=(',', ': ')) if isinstance(value, dict) else json.dumps(value)
            node_str = json.dumps(key) + ": " + node_value_str
            if i < len(node_items) - 1:
                node_str += ","
            out_lines.append("        " + node_str)
    out_lines.append("    },")

    # --- Edges ---
    out_lines.append('    "edges": [')
    # Ensure edges is a list before sorting
    edges_list = data.get("edges", [])
    if isinstance(edges_list, list):
        # Sort edges based on 'from' then 'to', handling potential missing keys
        sorted_edges = sorted(
            edges_list,
            key=lambda e: (str(e.get("from", "")), str(e.get("to", ""))) if isinstance(e, dict) else ('', '')
        )
        for i, edge in enumerate(sorted_edges):
            # Ensure edges are dicts for consistent formatting
            edge_str = json.dumps(edge, separators=(',', ': ')) if isinstance(edge, dict) else json.dumps(edge)
            if i < len(sorted_edges) - 1:
                edge_str += ","
            out_lines.append("        " + edge_str)

    out_lines.append("    ]")
    out_lines.append("}")
    return "\n".join(out_lines)

def parse_graph_data(graph_data):
    """Parses incoming graph JSON, converting list nodes to dict if needed."""
    if not isinstance(graph_data, dict):
        raise ValueError("Invalid graph data format: Expected a dictionary.")

    nodes_raw = graph_data.get("nodes", {})
    edges_raw = graph_data.get("edges", [])

    nodes = {}
    if isinstance(nodes_raw, list):
        # Convert list format to dict format
        for node_item in nodes_raw:
            if isinstance(node_item, dict) and "id" in node_item:
                node_id = node_item["id"]
                nodes[node_id] = node_item
            else:
                    # Handle potential malformed node entry in list
                    print(f"Warning: Skipping malformed node entry in list: {node_item}")

    elif isinstance(nodes_raw, dict):
        nodes = nodes_raw
    else:
            raise ValueError("Invalid 'nodes' format: Expected a dictionary or list.")


    if not isinstance(edges_raw, list):
            raise ValueError("Invalid 'edges' format: Expected a list.")

    # Basic validation for edges
    edges = []
    for edge_item in edges_raw:
        if isinstance(edge_item, dict) and ("source" in edge_item or "from" in edge_item) and ("target" in edge_item or "to" in edge_item):
                # Normalize 'from'/'to' to 'source'/'target' if needed for consistency internally
            edge = edge_item.copy()
            if "from" in edge and "source" not in edge:
                edge["source"] = edge.pop("from")
            if "to" in edge and "target" not in edge:
                edge["target"] = edge.pop("to")
            edges.append(edge)
        else:
            print(f"Warning: Skipping malformed edge entry: {edge_item}")


    return nodes, edges