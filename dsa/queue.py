from collections import deque


class Queue:
    def __init__(self, values=None):
        self.items = deque(values or [])

    def enqueue(self, item):
        self.items.append(item)

    def dequeue(self):
        return None if self.is_empty() else self.items.popleft()

    def peek(self):
        return None if self.is_empty() else self.items[0]

    def clear(self):
        self.items.clear()

    def is_empty(self):
        return len(self.items) == 0

    def display(self):
        return list(self.items)
