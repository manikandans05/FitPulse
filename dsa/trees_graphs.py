from collections import deque


class TreeNode:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None


def create_tree():
    root = TreeNode(40)
    root.left = TreeNode(20)
    root.right = TreeNode(60)
    root.left.left = TreeNode(10)
    root.left.right = TreeNode(30)
    root.right.left = TreeNode(50)
    root.right.right = TreeNode(70)
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
