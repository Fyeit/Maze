
// 最小堆实现，用于管理优先队列
class MinHeap {
    constructor() {
        this.heap = [];
    }

    // 插入节点到堆
    insert(node) {
        this.heap.push(node);
        this.bubbleUp(this.heap.length - 1);
    }

    // 取出堆顶（最小值）
    extractMin() {
        const min = this.heap[0];
        const end = this.heap.pop();
        if (this.heap.length > 0) {
            this.heap[0] = end;
            this.bubbleDown(0);
        }
        return min;
    }

    // 堆的上浮操作
    bubbleUp(index) {
        const element = this.heap[index];
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            const parent = this.heap[parentIndex];
            // 如果当前元素大于父节点，则停止上浮
            if (element[3] >= parent[3]) break;
            this.heap[index] = parent;
            this.heap[parentIndex] = element;
            index = parentIndex;
        }
    }

    // 堆的下沉操作
    bubbleDown(index) {
        const length = this.heap.length;
        const element = this.heap[index];
        while (true) {
            let leftChildIndex = 2 * index + 1;
            let rightChildIndex = 2 * index + 2;
            let swapIndex = null;

            if (leftChildIndex < length) {
                const leftChild = this.heap[leftChildIndex];
                if (leftChild[3] < element[3]) {
                    swapIndex = leftChildIndex;
                }
            }

            if (rightChildIndex < length) {
                const rightChild = this.heap[rightChildIndex];
                if (
                    (swapIndex === null && rightChild[3] < element[3]) ||
                    (swapIndex !== null && rightChild[3] < this.heap[swapIndex][3])
                ) {
                    swapIndex = rightChildIndex;
                }
            }

            if (swapIndex === null) break;
            this.heap[index] = this.heap[swapIndex];
            this.heap[swapIndex] = element;
            index = swapIndex;
        }
    }

    // 判断堆是否为空
    isEmpty() {
        return this.heap.length === 0;
    }
}