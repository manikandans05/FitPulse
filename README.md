# FitPulse DSA Lab

A complete Flask project created from scratch with interactive visualizations for:

- Linked List: append, search, delete, traverse
- Stack: push, pop, peek, clear
- Queue: enqueue, dequeue, peek, clear
- Binary Tree: preorder, inorder, postorder
- Graph: adjacency list and BFS
- Linear Search: insert at any index or append, then animate each search check
- Merge Sort: split ranges, merge buffers, and write-by-write animation
- Insertion Sort: held value, comparisons, shifts, and insertion animation
- Binary Search: sorted input with low, midpoint, and high markers
- Min-Heap & Priority Processing: tree and array views, insert, peek, process next/all, clear

## Visualization Controls

Sorting and binary search accept up to 20 comma-separated integers from -999 to 999.
Use Sort or Search to start, then Play/Pause, Back, Step, Reset, and the step-delay
slider to inspect the trace. Binary search sorts the input first; its result index
refers to that sorted array. Duplicate targets may match any equal element.

Linear search supports up to 40 workout names. Enter a new workout and a zero-based
insertion index, or leave the index blank to append. Editing the list updates the
visual immediately. Names can contain up to 80 characters, without commas.

The heap holds up to 15 activities with priorities from 1 to 99. Lower numbers
are processed first; equal priorities retain insertion order. Each processing
step highlights the root, removes it, and displays the restored heap. The processed
list records the current operation. Heap contents persist in the browser session.
Wide arrays and heap trees scroll horizontally on small screens.

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
