def linear_search(items, target):
    steps = []
    wanted = str(target).strip().lower()
    for index, item in enumerate(items):
        matched = str(item).strip().lower() == wanted
        steps.append({"index": index, "value": item, "matched": matched})
        if matched:
            return {"found": True, "index": index, "value": item, "steps": steps}
    return {"found": False, "index": -1, "value": None, "steps": steps}


def _order_key(value):
    return value.casefold() if isinstance(value, str) else value


def merge_sort(items):
    values = list(items)
    steps = []

    def merge(start, end):
        if end - start < 2:
            return
        middle = (start + end) // 2
        steps.append({"items": values[:], "active": list(range(start, end)),
                      "message": f"Split [{start}:{end}] at index {middle}",
                      "left": values[start:middle], "right": values[middle:end]})
        merge(start, middle)
        merge(middle, end)
        left, right = values[start:middle], values[middle:end]
        left_index = right_index = 0
        for position in range(start, end):
            if right_index == len(right) or (left_index < len(left) and _order_key(left[left_index]) <= _order_key(right[right_index])):
                value = left[left_index]
                left_index += 1
            else:
                value = right[right_index]
                right_index += 1
            values[position] = value
            steps.append({"items": values[:], "active": [position],
                          "message": f"Merge: write {value} at index {position}",
                          "left": left[left_index:], "right": right[right_index:]})

    merge(0, len(values))
    steps.append({"items": values[:], "active": [], "message": "Merge sort complete"})
    return {"items": values, "steps": steps}


def insertion_sort(items):
    values = list(items)
    steps = []
    for index in range(1, len(values)):
        key = values[index]
        position = index - 1
        steps.append({"items": values[:], "active": [index], "key": key,
                      "message": f"Pick {key} at index {index}"})
        while position >= 0:
            steps.append({"items": values[:], "active": [position], "key": key,
                          "message": f"Compare {values[position]} with held value {key}"})
            if _order_key(values[position]) <= _order_key(key):
                break
            values[position + 1] = values[position]
            steps.append({"items": values[:], "active": [position, position + 1], "key": key,
                          "message": f"Shift {values[position]} from index {position} to {position + 1}"})
            position -= 1
        values[position + 1] = key
        steps.append({"items": values[:], "active": [position + 1],
                      "message": f"Insert {key} at index {position + 1}"})
    steps.append({"items": values[:], "active": [], "message": "Insertion sort complete"})
    return {"items": values, "steps": steps}


def binary_search(items, target):
    values = sorted(items, key=_order_key)
    low, high = 0, len(values) - 1
    steps = []
    while low <= high:
        middle = (low + high) // 2
        matched = _order_key(values[middle]) == _order_key(target)
        steps.append({"items": values[:], "active": [middle], "low": low, "high": high,
                      "middle": middle, "matched": matched,
                      "message": f"Low {low}, mid {middle}, high {high}: compare {values[middle]} with {target}"})
        if matched:
            return {"items": values, "found": True, "index": middle, "steps": steps}
        if _order_key(values[middle]) < _order_key(target):
            low = middle + 1
        else:
            high = middle - 1
    return {"items": values, "found": False, "index": -1, "steps": steps}
