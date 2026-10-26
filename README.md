# FitPulse DSA Lab

A complete Flask project created from scratch with interactive visualizations for:

- Linked List: append, search, delete, traverse
- Stack: push, pop, peek, clear
- Queue: enqueue, dequeue, peek, clear
- Binary Tree: preorder, inorder, postorder
- Graph: adjacency list and BFS
- Greedy Best-First Search: activity map, heuristic-ranked frontier, visited order, and highlighted path
- Linear Search: insert at any index or append, then animate each search check
- Merge Sort: split ranges, merge buffers, and write-by-write animation
- Insertion Sort: held value, comparisons, shifts, and insertion animation
- Binary Search: sorted input with low, midpoint, and high markers
- Min-Heap & Priority Processing: tree and array views, insert, peek, process next/all, clear

## Visualization Controls

Every topic uses activity names as its sample data, including binary tree nodes.
Sorting and binary search accept up to 20 comma-separated activities, each at most
80 characters, ordered alphabetically without regard to case.
Use Sort or Search to start, then Play/Pause, Back, Step, Reset, and the step-delay
slider to inspect the trace. Binary search sorts the input first; its result index
refers to that sorted array. Searches ignore case. Duplicate targets may match any
equal element. Indices, step counts, and heap priorities remain numeric metadata.
The sorting/search API also continues to accept integer lists for existing callers.

Linear search supports up to 40 workout names. Enter a new workout and a zero-based
insertion index, or leave the index blank to append. Editing the list updates the
visual immediately. Names can contain up to 80 characters, without commas.

The heap holds up to 15 activities with priorities from 1 to 99. Lower numbers
are processed first; equal priorities retain insertion order. Each processing
step highlights the root, removes it, and displays the restored heap. The processed
list records the current operation. Heap contents persist in the browser session.
Wide arrays and heap trees scroll horizontally on small screens.

## Greedy Search

Greedy Search uses the same workout graph as BFS. Choose a start and a goal, then
Search. Play/Pause, Back, Step, Reset, and the delay slider control the trace.
The heuristic is straight-line map distance to the goal (map coordinates divided
by 10, rounded to one decimal), not workout difficulty or actual travel distance.
The smallest heuristic wins; ties use discovery order. Visited activities are not
revisited. Greedy search ignores distance travelled and does not guarantee a
shortest path. Changing either activity clears the previous trace.

## Run in VS Code / PowerShell

From the folder containing `app.py`:

```powershell
py -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Open the local address shown in the terminal, normally `http://127.0.0.1:5000`.

If PowerShell blocks activation, run:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.venv\Scripts\activate
```

## Tests

```powershell
python -B -m unittest discover -s tests -v
```

The tests cover algorithm results and snapshots, binary-search bounds, input
validation, empty linear searches, heap invariants, capacity, and priority ties.
Greedy tests cover heuristic-only selection, ties, cycles, unreachable goals,
same-activity goals, immutable snapshots, and every start/goal pair in the map.
