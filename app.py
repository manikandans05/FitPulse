import heapq

from flask import Flask, jsonify, render_template, request, session
from dsa.linked_list import LinkedList
from dsa.stack import Stack
from dsa.queue import Queue
from dsa.trees_graphs import GRAPH, bfs, create_tree, inorder, postorder, preorder
from dsa.search_sort import binary_search, insertion_sort, linear_search, merge_sort

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
    items = data.get("items", DEFAULT_WORKOUTS)
    if not isinstance(items, list) or len(items) > 40 or any(not isinstance(item, str) or len(item) > 80 for item in items):
        return jsonify(error="Use up to 40 workouts, each at most 80 characters."), 400
    target = str(data.get("target", "")).strip()
    if not target:
        return jsonify(error="Enter a workout to search."), 400
    return jsonify(linear_search(items, target))


@app.post("/api/dsa/<algorithm>")
def numeric_algorithm_api(algorithm):
    algorithms = {"merge-sort": merge_sort, "insertion-sort": insertion_sort, "binary-search": binary_search}
    if algorithm not in algorithms:
        return jsonify(error="Unknown algorithm."), 404
    data = payload()
    if not isinstance(data, dict):
        return jsonify(error="Send a JSON object."), 400
    items = data.get("items")
    if not isinstance(items, list) or len(items) > 20 or any(type(item) is not int or abs(item) > 999 for item in items):
        return jsonify(error="Use up to 20 integers between -999 and 999."), 400
    if algorithm == "binary-search":
        target = data.get("target")
        if type(target) is not int or abs(target) > 999:
            return jsonify(error="Enter an integer target between -999 and 999."), 400
        return jsonify(binary_search(items, target))
    return jsonify(algorithms[algorithm](items))


@app.post("/api/dsa/heap")
def heap_api():
    data = payload()
    if not isinstance(data, dict):
        return jsonify(error="Send a JSON object."), 400
    heap = session.get("heap", [])
    heapq.heapify(heap)
    action = data.get("action", "view")
    steps = []
    processed = []
    if action == "insert":
        name = str(data.get("value", "")).strip()
        priority = data.get("priority")
        if not name or len(name) > 40 or type(priority) is not int or not 1 <= priority <= 99:
            return jsonify(error="Enter an activity (1-40 characters) and a priority from 1 to 99."), 400
        if len(heap) >= 15:
            return jsonify(error="Heap is full (15 activities). Process an activity first."), 400
        sequence = session.get("heap_sequence", 0)
        heapq.heappush(heap, [priority, sequence, name])
        session["heap_sequence"] = sequence + 1
        steps.append({"items": heap[:], "active": sequence, "message": f"Inserted {name} with priority {priority}"})
    elif action in ("process", "process-all"):
        if not heap:
            return jsonify(error="Heap is empty."), 400
        count = len(heap) if action == "process-all" else 1
        for _ in range(count):
            next_item = heap[0]
            steps.append({"items": heap[:], "active": next_item[1], "message": f"Next: {next_item[2]} (priority {next_item[0]})", "processed": processed[:]})
            processed.append(heapq.heappop(heap))
            steps.append({"items": heap[:], "message": f"Processed {next_item[2]}; heap restored", "processed": processed[:]})
    elif action == "clear":
        heap = []
    elif action not in ("view", "peek"):
        return jsonify(error="Invalid heap operation."), 400
    session["heap"] = heap
    message = f"Next: {heap[0][2]} (priority {heap[0][0]})" if heap else "Heap is empty"
    return jsonify(items=heap, steps=steps, processed=processed, message=message)


if __name__ == "__main__":
    app.run(debug=True)
