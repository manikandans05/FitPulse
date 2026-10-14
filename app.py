from flask import Flask, jsonify, render_template, request, session
from dsa.linked_list import LinkedList
from dsa.stack import Stack
from dsa.queue import Queue
from dsa.trees_graphs import GRAPH, bfs, create_tree, inorder, postorder, preorder
from dsa.search_sort import linear_search

app = Flask(__name__)
app.secret_key = "fitpulse-dsa-lab-change-this-secret"
DEFAULT_WORKOUTS = ["Running", "Cycling", "Yoga", "Swimming", "Walking"]


def payload():
    return request.get_json(silent=True) or {}


@app.get("/")
def home():
    return render_template("dsa_lab.html", graph=GRAPH)


@app.post("/api/dsa/linked-list")
def linked_list_api():
    data = payload()
    values = session.get("linked_list", ["Running", "Cycling", "Yoga"])
    linked = LinkedList(values)
    action = data.get("action")
    value = str(data.get("value", "")).strip()
    result = None
    if action == "append" and value:
        linked.append(value)
        result = "Appended " + value
    elif action == "search":
        index = linked.search(value)
        result = {"found": index >= 0, "index": index}
    elif action == "delete":
        result = {"deleted": linked.delete(value)}
    elif action == "traverse":
        result = linked.traverse()
    else:
        return jsonify(error="Choose a valid operation and enter a value when needed."), 400
    session["linked_list"] = linked.traverse()
    return jsonify(items=linked.traverse(), result=result)


@app.post("/api/dsa/stack")
def stack_api():
    data = payload()
    stack = Stack(session.get("stack", ["Warm-up", "Cardio"]))
    action = data.get("action")
    value = str(data.get("value", "")).strip()
    if action == "push" and value:
        stack.push(value); result = "Pushed " + value
    elif action == "pop":
        result = stack.pop()
    elif action == "peek":
        result = stack.peek()
    elif action == "clear":
        stack.clear(); result = "Stack cleared"
    else:
        return jsonify(error="Choose a valid operation and enter a value for push."), 400
    session["stack"] = stack.display()
    return jsonify(items=stack.display(), result=result)


@app.post("/api/dsa/queue")
def queue_api():
    data = payload()
    queue = Queue(session.get("queue", ["Running", "Cycling", "Yoga"]))
    action = data.get("action")
    value = str(data.get("value", "")).strip()
    if action == "enqueue" and value:
        queue.enqueue(value); result = "Enqueued " + value
    elif action == "dequeue":
        result = queue.dequeue()
    elif action == "peek":
        result = queue.peek()
    elif action == "clear":
        queue.clear(); result = "Queue cleared"
    else:
        return jsonify(error="Choose a valid operation and enter a value for enqueue."), 400
    session["queue"] = queue.display()
    return jsonify(items=queue.display(), result=result)


@app.post("/api/dsa/tree")
def tree_api():
    action = payload().get("action", "inorder")
    root = create_tree()
    traversals = {"preorder": preorder, "inorder": inorder, "postorder": postorder}
    if action not in traversals:
        return jsonify(error="Invalid traversal."), 400
    return jsonify(action=action, sequence=traversals[action](root))


@app.post("/api/dsa/graph")
def graph_api():
    start = payload().get("start", "Running")
    order, edges = bfs(GRAPH, start)
    if not order:
        return jsonify(error="Invalid start node."), 400
    return jsonify(start=start, sequence=order, edges=edges, adjacency=GRAPH)


@app.post("/api/dsa/linear-search")
def linear_search_api():
    data = payload()
    items = data.get("items") or DEFAULT_WORKOUTS
    target = str(data.get("target", "")).strip()
    if not target:
        return jsonify(error="Enter a workout to search."), 400
    return jsonify(linear_search(items, target))


if __name__ == "__main__":
    app.run(debug=True)
