// A*算法求解最短路径
function solveMaze(targetX,targetY) {
    const priorityQueue = new MinHeap();  // 使用最小堆来存储节点，按照f(n)排序
    const start = [player.x, player.y, [], 0];  // 初始节点格式：[x, y, path, g(n)]
    priorityQueue.insert([player.x, player.y, [], 0]);  // g(n) = 0
    const visited = new Set();  // 用于存储已访问的节点
    visited.add(`${player.x},${player.y}`);

    while (!priorityQueue.isEmpty()) {
        // 从优先队列中取出f(n)值最小的节点
        const [x, y, path, g] = priorityQueue.extractMin();
        const currentCell = currentMaze.grid[x][y];

        // 如果到达终点，返回路径
        if (x === targetX && y === targetY) {
            return path.concat([[x, y]]);  // 返回最终路径
        }

        const neighbors = getNeighbors(x, y);  // 获取邻居节点
        for (const [nx, ny] of neighbors) {  // 遍历邻居节点
            if (!visited.has(`${nx},${ny}`)) {  // 如果该邻居尚未访问
                visited.add(`${nx},${ny}`);  // 标记为已访问
                const newPath = path.concat([[x, y]]);  // 记录新的路径
                const gCost = g + 1;  // g(n)：当前路径长度（每移动一步+1）
                const hCost = heuristic(nx, ny, targetX, targetY);  // h(n)：使用启发式函数
                const fCost = gCost + hCost;  // f(n) = g(n) + h(n)
                
                // 将邻居节点插入优先队列，优先队列会根据f(n)值进行排序
                priorityQueue.insert([nx, ny, newPath, gCost]);
            }
        }
    }
    return null;  // 如果没有找到路径，返回null
}

// 启发式函数：曼哈顿距离
function heuristic(x1, y1, x2, y2) {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);  // 曼哈顿距离
}

// 获取邻居节点函数保持不变
function getNeighbors(x, y) {
    const neighbors = [];
    const cell = currentMaze.grid[x][y];

    if (!cell.walls.top) neighbors.push([x, y - 1]);
    if (!cell.walls.right) neighbors.push([x + 1, y]);
    if (!cell.walls.bottom) neighbors.push([x, y + 1]);
    if (!cell.walls.left) neighbors.push([x - 1, y]);

    return neighbors;
}

function visualizeSolution(path) {
    const context = (currentMaze === mainMaze || currentMaze === mainMaze.nestedMainMaze)? mainContext : taskContext;
    // 用不同颜色显示路径
    path.forEach(([x, y]) => {
        context.fillStyle = 'rgba(0, 255, 0, 0.5)';  // 用绿色表示路径
        context.fillRect(x * cellSize + 1, y * cellSize + 1, cellSize , cellSize );
    });
}


let autoMoveInterval = null; // 保存自动移动的定时器
let isAutoMoving = false; // 标记是否正在自动移动
let interruptCallback = null; // 保存中断后的回调

// 玩家自动沿着路径移动
function autoMovePlayer(path) {
    if (isAutoMoving) {
        alert("玩家正在自动移动中！");
        return;
    }

    if (!path || path.length === 0) {
        alert("没有可移动的路径！");
        return;
    }

    isAutoMoving = true; // 标记为自动移动中
    let currentIndex = 0; // 路径索引

    autoMoveInterval = setInterval(() => {
        if (currentIndex >= path.length) {
            autoMoveButton.disabled = false;
            showPathButton.disabled = false; 
            hidePathButton.disabled = false;
            taskAutoSolveButton.disabled = false;
            taskShowPathButton.disabled = false; 
            taskHidePathButton.disabled = false;

            moveBanned = false; 
            // 到达终点，清除定时器
            clearInterval(autoMoveInterval);
            autoMoveInterval = null;
            isAutoMoving = false;
            alert("玩家已到达终点！");
            return;
        }

        const [nextX, nextY] = path[currentIndex];
        const prevX = player.x;
        const prevY = player.y;

        if (currentMaze instanceof MainMaze) {
            if(currentMaze.nestedMainMaze && currentMaze.nestedMainEntrance.x === player.x && currentMaze.nestedMainEntrance.y === player.y){
                enterNestedMainMaze(currentMaze);
                clearInterval(autoMoveInterval);
                autoMoveInterval = null;
                isAutoMoving = false;
                autoMoveButton.disabled = false;
                showPathButton.disabled = false; 
                hidePathButton.disabled = false; 
                moveBanned = false; 
                alert("玩家进入嵌套主迷宫！终止寻路");
                return;
            }

            //检查是否进入任务迷宫
            if(currentMaze.taskEntrances.some(entrance => entrance.x === player.x && entrance.y === player.y)) {
                enterTaskMaze();
                clearInterval(autoMoveInterval);
                autoMoveInterval = null;
                isAutoMoving = false;
                autoMoveButton.disabled = false;
                showPathButton.disabled = false; 
                hidePathButton.disabled = false; 
                taskAutoSolveButton.disabled = false;
                taskShowPathButton.disabled = false; 
                taskHidePathButton.disabled = false;
                moveBanned = false; 
                alert("玩家进入任务迷宫！终止寻路");
                return;
            }
        }
        // 移动玩家
        clearPreviousPlayerPosition(prevX, prevY);
        player.x = nextX;
        player.y = nextY;
        drawPlayerAt(nextX, nextY);
        currentIndex++; // 更新索引
    }, 500); // 每步移动间隔500ms
}

// 中断处理逻辑
function setInterruptHandler(callback) {
    interruptCallback = callback; // 设置中断回调
}

// 结束自动移动
function stopAutoMove() {
    if (autoMoveInterval) {
        clearInterval(autoMoveInterval);
        autoMoveInterval = null;
    }
    isAutoMoving = false;
    alert("自动寻路已终止！");
}


//显示路径
document.getElementById('showPathButton').addEventListener('click', () => {
    if(currentMaze.type == 0){
        solutionPath = solveMaze(main_exit.x,main_exit.y);  // 自动寻路
    }else solutionPath = solveMaze(rows - 1,cols - 1);
 
   showPath = true;  // 启用路径显示
    if (solutionPath) {
        visualizeSolution(solutionPath);  // 可视化路径
    }
    showPathButton.disabled = true; 
    autoMoveButton.disabled = true;
    stopAutoMoveButton.disabled = true;
    moveBanned = true; 
});


// 取消显示路径按钮
document.getElementById('hidePathButton').addEventListener('click', () => {
    showPath = false;  // 禁用路径显示
    showPathButton.disabled = false;
    autoMoveButton.disabled = false;
    stopAutoMoveButton.disabled = false;
    moveBanned = false;
    drawMainMaze();  // 重新绘制迷宫，取消显示路径
});

document.getElementById('autoMoveButton').addEventListener('click', () => {
    solutionPath = solveMaze(main_exit.x,main_exit.y); // 使用A*算法求解路径
    if (solutionPath) {
        autoMoveButton.disabled = true;
        showPathButton.disabled = true; 
        hidePathButton.disabled = true;
        moveBanned = true; 
        autoMovePlayer(solutionPath); // 玩家沿路径自动移动
        
    } else {
        alert("无法找到路径！");
    }
});

document.getElementById('stopAutoMoveButton').addEventListener('click', () => {
    stopAutoMove(); // 终止自动移动
    autoMoveButton.disabled = false;
    showPathButton.disabled = false;
    hidePathButton.disabled = false;
    moveBanned = false;
});

// 任务迷宫：自动寻路
document.getElementById('taskAutoSolveButton').addEventListener('click', () => {
    const path = solveMaze(currentMaze.exit.x, currentMaze.exit.y); // 使用出口坐标
    if (path) {
        autoMovePlayer(path); // 自动沿路径移动
    } taskAutoSolveButton.disabled = true; 
    taskShowPathButton.disabled = true;
    taskHidePathButton.disabled = true;
    moveBanned = true; 
});


// 任务迷宫：显示路径
document.getElementById('taskShowPathButton').addEventListener('click', () => {
    const path = solveMaze(currentMaze.exit.x, currentMaze.exit.y); // 使用出口坐标
    showPath = true;  // 启用路径显示
    if (path) {
        visualizeSolution(path); // 显示路径
    } 
    taskShowPathButton.disabled = true; 
    taskAutoSolveButton.disabled = true;
    taskStopAutoMoveButton.disabled = true;

    moveBanned = true; 
    
});

// 任务迷宫：取消显示路径
document.getElementById('taskHidePathButton').addEventListener('click', () => {
    showPath = false;  // 禁用路径显示
    taskShowPathButton.disabled = false;
    taskAutoSolveButton.disabled = false;
    taskStopAutoMoveButton.disabled = false;
    moveBanned = false;
    
    drawTaskMaze();
});

// 任务迷宫：终止自动移动
document.getElementById('taskStopAutoMoveButton').addEventListener('click', () => {
    stopAutoMove(); // 停止自动移动
    taskAutoSolveButton.disabled = false;
    taskShowPathButton.disabled = false;
    taskHidePathButton.disabled = false;
    moveBanned = false; 
});