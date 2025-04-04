# backend/analysis.py
import networkx as nx
import numpy as np
from scipy.cluster.hierarchy import linkage, leaves_list
from scipy.spatial.distance import squareform
from sentence_transformers import SentenceTransformer
from node2vec import Node2Vec
import umap
import gensim.models # For Node2Vec Word2Vec model
from .utils import format_list, get_close_matches_for_node

# --- Helper Functions from original script ---

def similarity_from_distance(dist):
    return 1 / (1 + dist) if dist is not None and dist >= 0 else 0

def detect_chains(G):
    """Detects linear chains and cycles in a directed graph."""
    visited = set()
    linear_chains = []
    # Find chains starting from nodes not part of a simple in/out=1 chain path
    for node in list(G.nodes()): # Iterate over a copy of nodes
        if node in visited:
            continue
            # Start chain if node has in_degree != 1 or out_degree != 1,
            # or if it's an isolated node (in=0, out=0)
        if G.in_degree(node) != 1 or G.out_degree(node) != 1:
            chain = [node]
            visited.add(node)
            current = node
            # Follow the chain as long as out=1, in=1 for the successor
            while G.out_degree(current) == 1:
                # Use list comprehension to handle potential multiple successors (shouldn't happen if out_degree==1)
                successors = list(G.successors(current))
                if not successors: break # Should not happen based on out_degree check
                next_node = successors[0]

                if next_node == current: break # Self-loop detected, end chain here

                # Check if the next node continues the simple chain pattern
                if G.in_degree(next_node) == 1 and G.out_degree(next_node) == 1 and next_node not in visited:
                    chain.append(next_node)
                    visited.add(next_node)
                    current = next_node
                else:
                    # End of the simple chain path. Add the last node if not visited.
                    if next_node not in visited:
                            chain.append(next_node)
                            visited.add(next_node) # Mark the end node as visited too
                    break # Exit the inner while loop

            # Only add chains of length > 1
            if len(chain) > 1:
                    linear_chains.append(chain)
            # If the chain has only one node and it's isolated, it wasn't added, which is fine.

    # Simple cycle detection (adapted from original logic, might miss complex overlapping cycles)
    # This part might need more robust cycle finding algorithms like nx.simple_cycles
    cycles = []
    remaining_nodes = set(G.nodes()) - visited
    while remaining_nodes:
            node = remaining_nodes.pop()
            if node in visited: continue # Should already be handled but safety check

            # Attempt to find a cycle starting from 'node' using DFS or similar
            # Using networkx's simple_cycles is more robust
            try:
                # Find cycles involving the current node
                node_cycles = [c for c in nx.simple_cycles(G) if node in c]
                for cycle in node_cycles:
                    is_new_cycle = True
                    for existing_cycle in cycles:
                        if set(cycle) == set(existing_cycle):
                            is_new_cycle = False
                            break
                    if is_new_cycle:
                        cycles.append(cycle)
                        # Mark all nodes in this cycle as visited
                        for n_in_cycle in cycle:
                            visited.add(n_in_cycle)
                            remaining_nodes.discard(n_in_cycle) # Remove from remaining check

            except Exception as e:
                print(f"Error during cycle detection for node {node}: {e}")
                visited.add(node) # Mark node visited to prevent infinite loops on error


    # Return chains (length > 1) and cycles
    return linear_chains, cycles


# --- Embedding Computations ---

def compute_sentence_embeddings(nodes_dict):
    """Computes embeddings based on node labels using SentenceTransformer."""
    model = SentenceTransformer('all-MiniLM-L6-v2')
    embeddings = {}
    node_labels = {}
    valid_node_ids = []
    for node_id, node_data in nodes_dict.items():
        if isinstance(node_data, dict):
            label_text = node_data.get("label", str(node_id)) # Use ID if label missing
            embeddings[node_id] = model.encode(label_text)
            node_labels[node_id] = label_text # Store label for later use
            valid_node_ids.append(node_id)
        else:
                print(f"Warning: Skipping node with invalid data format: {node_id}")

    return embeddings, node_labels, valid_node_ids

def compute_node2vec_embeddings(G, dimensions=64, walk_length=30, num_walks=200):
    """Computes embeddings using Node2Vec."""
    if G.number_of_nodes() == 0:
        return {}, {} # Return empty dicts if graph is empty

    # Ensure nodes are strings for Node2Vec/Word2Vec if they aren't already
    G_str_nodes = nx.relabel_nodes(G, {n: str(n) for n in G.nodes()})

    try:
        node2vec_instance = Node2Vec(G_str_nodes, dimensions=dimensions, walk_length=walk_length,
                                        num_walks=num_walks, workers=4, quiet=True, temp_folder='./temp_n2v') # Use more workers, specify temp folder
        # More robust Word2Vec parameters
        skip_gram_params = {
            'window': 10,
            'min_count': 1,
            'vector_size': dimensions,
            'epochs': 5, # Train for more epochs
            'workers': 4,
            'sg': 1 # Use Skip-Gram
        }
        # Ensure walks is a list of lists of strings
        walks_str = [[str(node) for node in walk] for walk in node2vec_instance.walks]

        model = gensim.models.Word2Vec(walks_str, **skip_gram_params)

        embeddings = {node: model.wv[str(node)] for node in G_str_nodes.nodes()}
        # Map back to original node IDs if they weren't strings
        original_embeddings = { G.nodes()[list(G_str_nodes.nodes()).index(n_str)]: emb for n_str, emb in embeddings.items()}

        # Cleanup temp folder if needed (optional)
        # import shutil
        # if os.path.exists('./temp_n2v'):
        #     shutil.rmtree('./temp_n2v')

        return original_embeddings, model.wv

    except Exception as e:
        print(f"Error computing Node2Vec embeddings: {e}")
        # Return empty embeddings if Node2Vec fails
        return {node: np.zeros(dimensions) for node in G.nodes()}, None


# --- Graph Construction & Analysis ---

def construct_embedding_graph(embeddings, threshold):
    """Builds a graph connecting nodes with similarity above threshold."""
    G_emb = nx.Graph()
    nodes = list(embeddings.keys())
    if not nodes:
        return G_emb, {}

    # Add all nodes that have embeddings
    G_emb.add_nodes_from(nodes)

    edge_sims = {}
    for i in range(len(nodes)):
        for j in range(i + 1, len(nodes)):
            n_i = nodes[i]
            n_j = nodes[j]
            emb_i = embeddings.get(n_i)
            emb_j = embeddings.get(n_j)

            # Ensure embeddings are valid numpy arrays
            if isinstance(emb_i, np.ndarray) and isinstance(emb_j, np.ndarray):
                # Check for zero vectors before calculating norm
                if np.any(emb_i) and np.any(emb_j):
                    dist = np.linalg.norm(emb_i - emb_j)
                    sim = similarity_from_distance(dist)
                    if sim >= threshold:
                        G_emb.add_edge(n_i, n_j, similarity=sim)
                        edge_sims[(n_i, n_j)] = sim
                else:
                        # Handle zero vectors - similarity is 0 unless they are the same node (which i!=j handles)
                        pass
            else:
                    print(f"Warning: Invalid or missing embeddings for nodes {n_i} or {n_j}. Skipping similarity calculation.")


    return G_emb, edge_sims

def run_full_analysis(nodes_dict, edges_list):
    """Performs the complete graph analysis pipeline."""
    results = {
        "validation": {"errors": [], "warnings": [], "duplicate_directed": [], "unreferenced_nodes": []},
        "original_graph_metrics": {},
        "structure": {"chains": [], "cycles": []},
        "embedding_analysis": {
            "sentence_transformer": {"metrics_vs_threshold": None, "proposed_edges": [], "heatmap_data": None},
            "node2vec": {"comparison_correlation": None}, # Add more N2V results if needed
            "umap_layout": None # Store UMAP coordinates
        }
    }
    defined_node_ids = list(nodes_dict.keys()) # Use list for matching

    # --- 1. Validation ---
    valid_edges = []
    referenced_nodes = set()
    for edge in edges_list:
        source = edge.get("source")
        target = edge.get("target")
        edge_errors = []
        source_defined = source in nodes_dict
        target_defined = target in nodes_dict

        if not source_defined:
            matches = get_close_matches_for_node(source, defined_node_ids)
            suggestion = f" Did you mean: {', '.join(matches)}?" if matches else ""
            edge_errors.append(f"Edge source '{source}' not defined.{suggestion}")
        if not target_defined:
            matches = get_close_matches_for_node(target, defined_node_ids)
            suggestion = f" Did you mean: {', '.join(matches)}?" if matches else ""
            edge_errors.append(f"Edge target '{target}' not defined.{suggestion}")

        if edge_errors:
            results["validation"]["errors"].append({"edge": edge, "issues": edge_errors})
        else:
            valid_edges.append(edge)
            referenced_nodes.add(source)
            referenced_nodes.add(target)

    # Check for duplicates (using valid edges only)
    seen_directed = {}
    for edge in valid_edges:
        key = (edge["source"], edge["target"])
        count = seen_directed.get(key, 0) + 1
        if count > 1:
                results["validation"]["duplicate_directed"].append({
                    "source": key[0],
                    "target": key[1],
                    "count": count,
                    "label": edge.get("label", "") # Include label of the duplicate instance found
                })
        seen_directed[key] = count
    # Filter duplicates to report each pair only once
    reported_dupes = set()
    unique_dupes = []
    for dupe in results["validation"]["duplicate_directed"]:
            key = (dupe["source"], dupe["target"])
            if key not in reported_dupes:
                # Find total count for this pair
                total_count = seen_directed[key]
                unique_dupes.append({"source": key[0], "target": key[1], "count": total_count})
                reported_dupes.add(key)
    results["validation"]["duplicate_directed"] = unique_dupes


    # Check for unreferenced nodes
    unreferenced = set(defined_node_ids) - referenced_nodes
    results["validation"]["unreferenced_nodes"] = sorted(list(unreferenced))

    # --- 2. Build Original Graph & Basic Metrics ---
    G = nx.DiGraph()
    # Add only nodes that are defined
    for node_id, node_data in nodes_dict.items():
            # Ensure node_data is a dictionary before attempting to unpack
            if isinstance(node_data, dict):
                G.add_node(node_id, **node_data)
            else:
                # Handle cases where node_data might not be a dict (e.g., loaded from malformed JSON)
                G.add_node(node_id, label=str(node_id)) # Add with ID as label as fallback
                results["validation"]["warnings"].append(f"Node '{node_id}' has invalid data format, using default attributes.")


    # Add only valid edges
    for edge in valid_edges:
        # Add edge label if present
        label = edge.get("label", "")
        G.add_edge(edge["source"], edge["target"], label=label)

    n_nodes = G.number_of_nodes()
    n_edges = G.number_of_edges()
    results["original_graph_metrics"]["num_nodes"] = n_nodes
    results["original_graph_metrics"]["num_edges"] = n_edges

    if n_nodes > 0:
        results["original_graph_metrics"]["avg_in_degree"] = n_edges / n_nodes
        results["original_graph_metrics"]["avg_out_degree"] = n_edges / n_nodes
        results["original_graph_metrics"]["density"] = nx.density(G)
        # Clustering requires undirected graph
        G_undirected = G.to_undirected(as_view=True) if n_edges > 0 else nx.Graph(G) # Avoid view if no edges
        results["original_graph_metrics"]["avg_clustering"] = nx.average_clustering(G_undirected) if n_nodes > 1 else 0
    else:
            results["original_graph_metrics"]["avg_in_degree"] = 0
            results["original_graph_metrics"]["avg_out_degree"] = 0
            results["original_graph_metrics"]["density"] = 0
            results["original_graph_metrics"]["avg_clustering"] = 0


    results["original_graph_metrics"]["num_self_loops"] = nx.number_of_selfloops(G)

    # Centrality measures (handle potential errors for small/disconnected graphs)
    try:
        results["original_graph_metrics"]["degree_centrality"] = nx.degree_centrality(G) if n_nodes > 0 else {}
    except Exception as e: results["original_graph_metrics"]["degree_centrality"] = {"error": str(e)}
    try:
            # Betweenness can be slow, consider sampling for large graphs (k=...)
        results["original_graph_metrics"]["betweenness_centrality"] = nx.betweenness_centrality(G, normalized=True, endpoints=False) if n_nodes > 1 else {}
    except Exception as e: results["original_graph_metrics"]["betweenness_centrality"] = {"error": str(e)}
    try:
        results["original_graph_metrics"]["closeness_centrality"] = nx.closeness_centrality(G) if n_nodes > 1 else {}
    except Exception as e: results["original_graph_metrics"]["closeness_centrality"] = {"error": str(e)}
    try:
        # Eigenvector centrality might not converge for all graphs
        results["original_graph_metrics"]["eigenvector_centrality"] = nx.eigenvector_centrality_numpy(G) if n_nodes > 1 else {}
    except Exception as e: results["original_graph_metrics"]["eigenvector_centrality"] = {"error": str(e)}


    # Connectivity and Path lengths
    G_undirected_conn = G.to_undirected()
    if n_nodes > 0 and nx.is_connected(G_undirected_conn):
            results["original_graph_metrics"]["is_connected"] = True
            if n_nodes > 1:
                results["original_graph_metrics"]["avg_shortest_path"] = nx.average_shortest_path_length(G_undirected_conn)
                results["original_graph_metrics"]["diameter"] = nx.diameter(G_undirected_conn)
            else:
                results["original_graph_metrics"]["avg_shortest_path"] = 0
                results["original_graph_metrics"]["diameter"] = 0

    elif n_nodes > 0:
            results["original_graph_metrics"]["is_connected"] = False
            components = list(nx.connected_components(G_undirected_conn))
            results["original_graph_metrics"]["num_components"] = len(components)
            if components:
                largest_cc_nodes = max(components, key=len)
                largest_cc = G.subgraph(largest_cc_nodes).to_undirected()
                results["original_graph_metrics"]["largest_component_size"] = largest_cc.number_of_nodes()
                if largest_cc.number_of_nodes() > 1:
                    try:
                        results["original_graph_metrics"]["largest_component_avg_shortest_path"] = nx.average_shortest_path_length(largest_cc)
                        results["original_graph_metrics"]["largest_component_diameter"] = nx.diameter(largest_cc)
                    except nx.NetworkXError: # Handle disconnected subgraphs within component analysis (shouldn't happen)
                        results["original_graph_metrics"]["largest_component_avg_shortest_path"] = "N/A"
                        results["original_graph_metrics"]["largest_component_diameter"] = "N/A"

                else:
                    results["original_graph_metrics"]["largest_component_avg_shortest_path"] = 0
                    results["original_graph_metrics"]["largest_component_diameter"] = 0

    else: # No nodes
            results["original_graph_metrics"]["is_connected"] = True # Technically empty graph is connected
            results["original_graph_metrics"]["num_components"] = 0
            results["original_graph_metrics"]["avg_shortest_path"] = 0
            results["original_graph_metrics"]["diameter"] = 0


    # --- 3. Structure Detection ---
    if n_nodes > 0:
        try:
            chains, cycles = detect_chains(G)
            results["structure"]["chains"] = chains
            results["structure"]["cycles"] = cycles
            results["structure"]["longest_chain_length"] = max(len(c) for c in chains) if chains else 0
            results["structure"]["longest_cycle_length"] = max(len(c) for c in cycles) if cycles else 0
        except Exception as e:
            print(f"Error during chain/cycle detection: {e}")
            results["structure"]["error"] = str(e)
    else:
            results["structure"]["longest_chain_length"] = 0
            results["structure"]["longest_cycle_length"] = 0


    # --- 4. Embedding Analysis ---
    if n_nodes > 0:
        try:
            # Sentence Transformer
            sent_embs, node_labels, valid_emb_node_ids = compute_sentence_embeddings(nodes_dict)
            results["embedding_analysis"]["sentence_transformer"]["num_nodes_embedded"] = len(sent_embs)

            # Calculate Threshold Metrics (Density, Clustering, etc.)
            thresholds = np.linspace(0, 1, 21) # 21 steps
            metrics_data = {"thresholds": thresholds.tolist(), "density": [], "clustering": [], "avg_degree": [], "num_components": []}
            all_emb_nodes = list(sent_embs.keys())

            if len(all_emb_nodes) > 0: # Check if there are embeddings to process
                for t in thresholds:
                    G_t = nx.Graph()
                    G_t.add_nodes_from(all_emb_nodes)
                    for i in range(len(all_emb_nodes)):
                            for j in range(i + 1, len(all_emb_nodes)):
                                emb_i = sent_embs.get(all_emb_nodes[i])
                                emb_j = sent_embs.get(all_emb_nodes[j])
                                if isinstance(emb_i, np.ndarray) and isinstance(emb_j, np.ndarray):
                                    if np.any(emb_i) and np.any(emb_j):
                                        dist = np.linalg.norm(emb_i - emb_j)
                                        sim = similarity_from_distance(dist)
                                    if sim >= t:
                                        G_t.add_edge(all_emb_nodes[i], all_emb_nodes[j])
                                else:
                                    # Missing or invalid embedding already warned about
                                    pass


                    n_t = G_t.number_of_nodes()
                    e_t = G_t.number_of_edges()
                    if n_t > 1:
                        metrics_data["density"].append(nx.density(G_t))
                        metrics_data["clustering"].append(nx.average_clustering(G_t))
                        degrees = [d for n, d in G_t.degree()]
                        metrics_data["avg_degree"].append(np.mean(degrees) if degrees else 0)
                        metrics_data["num_components"].append(nx.number_connected_components(G_t))
                    elif n_t == 1:
                        metrics_data["density"].append(0)
                        metrics_data["clustering"].append(0)
                        metrics_data["avg_degree"].append(0)
                        metrics_data["num_components"].append(1)
                    else: # n_t == 0
                        metrics_data["density"].append(0)
                        metrics_data["clustering"].append(0)
                        metrics_data["avg_degree"].append(0)
                        metrics_data["num_components"].append(0)

                results["embedding_analysis"]["sentence_transformer"]["metrics_vs_threshold"] = metrics_data


            # Proposed Edges (Fixed Threshold) - Compare against original undirected graph
            fixed_threshold = 0.65 # Example threshold
            emb_graph_fixed, _ = construct_embedding_graph(sent_embs, fixed_threshold)
            orig_undirected = G.to_undirected()
            proposed = []
            if emb_graph_fixed.number_of_nodes() > 0: # Check if graph exists
                for u, v, data in emb_graph_fixed.edges(data=True):
                    # Check if edge (in either direction) exists in the original directed graph
                    # Or if the undirected edge exists
                    if not orig_undirected.has_edge(u, v):
                            proposed.append({"source": u, "target": v, "similarity": data.get("similarity", 0)})
            results["embedding_analysis"]["sentence_transformer"]["proposed_edges"] = proposed


            # Heatmap Data
            if len(all_emb_nodes) > 1:
                dist_matrix = np.zeros((len(all_emb_nodes), len(all_emb_nodes)))
                for i in range(len(all_emb_nodes)):
                    for j in range(len(all_emb_nodes)):
                        emb_i = sent_embs.get(all_emb_nodes[i])
                        emb_j = sent_embs.get(all_emb_nodes[j])
                        if isinstance(emb_i, np.ndarray) and isinstance(emb_j, np.ndarray):
                            if np.any(emb_i) and np.any(emb_j):
                                dist_matrix[i, j] = np.linalg.norm(emb_i - emb_j)
                            else:
                                    dist_matrix[i, j] = np.inf # Infinite distance for zero vectors
                        else:
                            dist_matrix[i, j] = np.inf # Treat missing embedding as infinite distance


                # Handle inf values before clustering if any occurred
                if np.any(np.isinf(dist_matrix)):
                        print("Warning: Infinite distances found in matrix, replacing with large number for clustering.")
                        max_finite_dist = np.max(dist_matrix[np.isfinite(dist_matrix)]) if np.any(np.isfinite(dist_matrix)) else 1.0
                        dist_matrix[np.isinf(dist_matrix)] = max_finite_dist * 10 # Replace inf with a large number

                sim_matrix = similarity_from_distance(dist_matrix)
                np.fill_diagonal(sim_matrix, 1.0) # Similarity to self is 1

                try:
                    dist_condensed = squareform(dist_matrix, checks=False)
                    Z = linkage(dist_condensed, method='average')
                    ordered_indices = leaves_list(Z)
                    ordered_labels = [node_labels.get(all_emb_nodes[i], str(all_emb_nodes[i])) for i in ordered_indices] # Use actual labels
                    # Use node IDs for data keys, labels for display
                    ordered_ids = [all_emb_nodes[i] for i in ordered_indices]
                    sim_matrix_reordered = sim_matrix[ordered_indices][:, ordered_indices]

                    results["embedding_analysis"]["sentence_transformer"]["heatmap_data"] = {
                        "matrix": sim_matrix_reordered.tolist(),
                        "ids": ordered_ids, # Send IDs
                        "labels": ordered_labels # Send labels for display
                    }
                except ValueError as e:
                        print(f"Error during hierarchical clustering for heatmap: {e}")
                        results["embedding_analysis"]["sentence_transformer"]["heatmap_data"] = {"error": str(e)}
                except Exception as e: # Catch other potential errors
                        print(f"Unexpected error during heatmap generation: {e}")
                        results["embedding_analysis"]["sentence_transformer"]["heatmap_data"] = {"error": str(e)}

            # Node2Vec (only if sentence embeddings worked)
            if sent_embs:
                    n2v_embs, n2v_model = compute_node2vec_embeddings(G) # Pass the original graph G
                    results["embedding_analysis"]["node2vec"]["num_nodes_embedded"] = len(n2v_embs)

                    # Comparison (only if both embeddings have comparable node sets)
                    common_nodes = list(set(sent_embs.keys()) & set(n2v_embs.keys()))
                    if len(common_nodes) > 1:
                        sent_dists, n2v_dists = [], []
                        for i in range(len(common_nodes)):
                            for j in range(i + 1, len(common_nodes)):
                                n_i = common_nodes[i]
                                n_j = common_nodes[j]
                                # Check if embeddings exist and are valid for both
                                s_emb_i, s_emb_j = sent_embs.get(n_i), sent_embs.get(n_j)
                                n_emb_i, n_emb_j = n2v_embs.get(n_i), n2v_embs.get(n_j)

                                if (isinstance(s_emb_i, np.ndarray) and isinstance(s_emb_j, np.ndarray) and
                                    isinstance(n_emb_i, np.ndarray) and isinstance(n_emb_j, np.ndarray)):

                                    if np.any(s_emb_i) and np.any(s_emb_j):
                                        sent_dists.append(np.linalg.norm(s_emb_i - s_emb_j))
                                    else: sent_dists.append(np.inf) # Or some large number / skip pair

                                    if np.any(n_emb_i) and np.any(n_emb_j):
                                        n2v_dists.append(np.linalg.norm(n_emb_i - n_emb_j))
                                    else: n2v_dists.append(np.inf)


                        # Filter out inf values before correlation
                        valid_indices = [k for k, (d1, d2) in enumerate(zip(sent_dists, n2v_dists)) if np.isfinite(d1) and np.isfinite(d2)]
                        if len(valid_indices) > 1:
                            sent_dists_f = np.array(sent_dists)[valid_indices]
                            n2v_dists_f = np.array(n2v_dists)[valid_indices]
                            # Check for zero variance
                            if np.std(sent_dists_f) > 1e-6 and np.std(n2v_dists_f) > 1e-6:
                                correlation = np.corrcoef(sent_dists_f, n2v_dists_f)[0, 1]
                                results["embedding_analysis"]["node2vec"]["comparison_correlation"] = correlation if not np.isnan(correlation) else "N/A (NaN)"
                            else:
                                results["embedding_analysis"]["node2vec"]["comparison_correlation"] = "N/A (Zero Variance)"

                        else:
                            results["embedding_analysis"]["node2vec"]["comparison_correlation"] = "N/A (Not Enough Data)"

                    else: # Not enough common nodes
                        results["embedding_analysis"]["node2vec"]["comparison_correlation"] = "N/A (Insufficient Overlap)"

            # UMAP Layout (based on sentence embeddings)
            if len(all_emb_nodes) >= 3: # UMAP needs at least 3 points generally
                    try:
                        raw_embs_list = [sent_embs.get(n) for n in all_emb_nodes if isinstance(sent_embs.get(n), np.ndarray) and np.any(sent_embs.get(n))]
                        nodes_for_umap = [n for n in all_emb_nodes if isinstance(sent_embs.get(n), np.ndarray) and np.any(sent_embs.get(n))]

                        if len(raw_embs_list) >=3:
                            raw_embs_array = np.array(raw_embs_list)
                            reducer = umap.UMAP(random_state=42, n_neighbors=min(15, len(raw_embs_list)-1), min_dist=0.1, n_components=2)
                            umap_coords = reducer.fit_transform(raw_embs_array)
                            # Create map from node ID -> {x, y}
                            umap_layout_dict = {nodes_for_umap[i]: {"x": float(umap_coords[i, 0]), "y": float(umap_coords[i, 1])} for i in range(len(nodes_for_umap))}
                            results["embedding_analysis"]["umap_layout"] = umap_layout_dict
                        else:
                            results["embedding_analysis"]["umap_layout"] = {"error": "Not enough valid embeddings for UMAP (<3)."}


                    except ValueError as e:
                        print(f"UMAP ValueError: {e}")
                        results["embedding_analysis"]["umap_layout"] = {"error": f"UMAP ValueError: {e}"}
                    except Exception as e:
                        print(f"UMAP failed: {e}")
                        results["embedding_analysis"]["umap_layout"] = {"error": f"UMAP failed: {e}"}
            elif n_nodes > 0:
                    results["embedding_analysis"]["umap_layout"] = {"error": "Not enough nodes for UMAP (<3)."}


        except ImportError as e:
                error_msg = f"Missing dependency for embedding analysis: {e}. Please install required packages."
                print(error_msg)
                results["embedding_analysis"]["error"] = error_msg
        except Exception as e:
                error_msg = f"An unexpected error occurred during embedding analysis: {e}"
                import traceback
                traceback.print_exc() # Print stack trace to backend console
                print(error_msg)
                results["embedding_analysis"]["error"] = error_msg

    return results