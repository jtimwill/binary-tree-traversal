class Node {
  constructor(value, type, id) {
    this.value = value;
    this.left = null;
    this.right = null;
    this.type = type;
    this.id = id;
  }
}

export const createTree = () => {
    const root = new Node("1", "node", "1");
    root.left = new Node("2", "node", "2");
    root.left.left = new Node("null", "null", "1");
    root.left.right = new Node("null", "null", "2");
    root.right = new Node("3", "node", "3");
    root.right.left = new Node("4", "node", "4");
    root.right.left.left = new Node("null", "null", "3");
    root.right.left.right = new Node("null", "null", "4");
    root.right.right = new Node("null", "null", "5");
    return root;
};


