class Stack:
    def __init__(self, values=None):
        self.items = list(values or [])

    def push(self, item):
        self.items.append(item)

    def pop(self):
        return None if self.is_empty() else self.items.pop()

    def peek(self):
        return None if self.is_empty() else self.items[-1]

    def clear(self):
        self.items.clear()

    def is_empty(self):
        return len(self.items) == 0

    def display(self):
        return list(self.items)
