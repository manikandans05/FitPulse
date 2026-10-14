def linear_search(items, target):
    steps = []
    wanted = str(target).strip().lower()
    for index, item in enumerate(items):
        matched = str(item).strip().lower() == wanted
        steps.append({"index": index, "value": item, "matched": matched})
        if matched:
            return {"found": True, "index": index, "value": item, "steps": steps}
    return {"found": False, "index": -1, "value": None, "steps": steps}
