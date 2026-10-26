from collections import deque
import heapq


class TreeNode:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None


def create_tree():
    root = TreeNode("Running")
    root.left = TreeNode("Cycling")
    root.right = TreeNode("Walking")
    root.left.left = TreeNode("Aerobics")
    root.left.right = TreeNode("Rowing")
    root.right.left = TreeNode("Swimming")
    root.right.right = TreeNode("Yoga")
    return root


def preorder(node):
    return [] if node is None else [node.value] + preorder(node.left) + preorder(node.right)


def inorder(node):
    return [] if node is None else inorder(node.left) + [node.value] + inorder(node.right)


def postorder(node):
    return [] if node is None else postorder(node.left) + postorder(node.right) + [node.value]


GRAPH = {
    "Running": ["Cycling", "Walking"],
    "Cycling": ["Running", "Swimming"],
    "Walking": ["Running", "Yoga"],
    "Swimming": ["Cycling", "Strength"],
    "Yoga": ["Walking", "Strength"],
    "Strength": ["Swimming", "Yoga"],
}


GRAPH_POSITIONS = {
    "Running": [320, 44], "Cycling": [500, 112],
    "Swimming": [500, 248], "Strength": [320, 316],
    "Yoga": [140, 248], "Walking": [140, 112],
}


def greedy_search(graph, start, goal, heuristics):
    if start not in graph or goal not in graph:
        raise ValueError("Choose valid starting and goal activities.")
    frontier = [(heuristics[start], 0, start)]
    parents = {start: None}
    visited = []
    edges = []
    steps = []

    def snapshot(current, message, path=None, done=False):
        steps.append({"current": current, "visited": visited[:],
                      "frontier": [entry[2] for entry in sorted(frontier)],
                      "edges": [edge[:] for edge in edges], "path": path or [],
                      "done": done, "message": message})

    snapshot(None, f"Start at {start}; goal: {goal}")
    while frontier:
        score, _, current = heapq.heappop(frontier)
        visited.append(current)
        snapshot(current, f"Choose {current}: lowest frontier heuristic h = {score}")
        if current == goal:
            path = []
            node = current
            while node is not None:
                path.append(node)
                node = parents[node]
            path.reverse()
            snapshot(current, "Goal reached: " + " -> ".join(path), path, True)
            return {"found": True, "path": path, "visited": visited, "steps": steps}
        additions = []
        for neighbor in graph[current]:
            if neighbor not in parents:
                parents[neighbor] = current
                heapq.heappush(frontier, (heuristics[neighbor], len(parents), neighbor))
                edges.append([current, neighbor])
                additions.append(neighbor)
        snapshot(current, f"Expand {current}; " + ("add " + ", ".join(additions) if additions else "no new activities"))
    snapshot(None, f"No path from {start} to {goal}", done=True)
    return {"found": False, "path": [], "visited": visited, "steps": steps}


def bfs(graph, start):
    if start not in graph:
        return [], []
    queue = deque([start])
    seen = {start}
    order = []
    edges = []
    while queue:
        node = queue.popleft()
        order.append(node)
        for neighbor in graph[node]:
            if neighbor not in seen:
                seen.add(neighbor)
                queue.append(neighbor)
                edges.append([node, neighbor])
    return order, edges
