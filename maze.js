// 单元格类（图的顶点类）
class Cell {
    constructor(x, y) {
        this.x = x; // 单元格的x坐标
        this.y = y; // 单元格的y坐标
        this.visited = false; // 标记单元格是否被访问过
        this.walls = { // 表示单元格四周的墙，初始时设置四周都有墙
            top: true, 
            right: true, 
            bottom: true, 
            left: true 
        };
    }
    
    draw(context) {
        const x = this.x * cellSize; // 计算单元格在画布上的x位置
        const y = this.y * cellSize; // 计算单元格在画布上的y位置
        context.beginPath();
        context.strokeStyle = 'black';// 设置线条颜色为黑色

        // 根据单元格的墙状态绘制墙
        if (this.walls.top) {
            context.moveTo(x, y);
            context.lineTo(x + cellSize, y);
        }
        if (this.walls.right) {
            context.moveTo(x + cellSize, y);
            context.lineTo(x + cellSize, y + cellSize);
        }
        if (this.walls.bottom) {
            context.moveTo(x, y + cellSize);
            context.lineTo(x + cellSize, y + cellSize);
        }
        if (this.walls.left) {
            context.moveTo(x, y);
            context.lineTo(x, y + cellSize);
        }

        context.stroke();// 绘制路径形成墙
        context.closePath();
    }

}
class Maze{
    constructor(cols, rows) {
        this.cols = cols; // 迷宫的列数
        this.rows = rows; // 迷宫的行数
        this.grid = []; // 存储迷宫结构的二维数组

        for (let x = 0; x < cols; x++) {
            this.grid[x] = [];
            for (let y = 0; y < rows; y++) {
                this.grid[x][y] = new Cell(x, y);
            }
        }
    }
    //生成迷宫
    generate() {
        const stack = [];
        let current = this.grid[0][0];
        current.visited = true;
        stack.push(current);

        while (stack.length > 0) {
            const next = this.getUnvisitedNeighbor(current);
            if (next) {
                this.removeWalls(current, next);
                next.visited = true;
                stack.push(next);
                current = next;
            } else {
                current = stack.pop();
            }
        }
    }

    getUnvisitedNeighbor(cell) {
        const neighbors = [];
        const { x, y } = cell;

        // 检查四个方向的邻居节点，如果未访问，则加入neighbors数组
        if (x > 0 && !this.grid[x - 1][y].visited) 
            neighbors.push(this.grid[x - 1][y]);
        if (x < this.cols - 1 && !this.grid[x + 1][y].visited) 
            neighbors.push(this.grid[x + 1][y]);
        if (y > 0 && !this.grid[x][y - 1].visited) 
            neighbors.push(this.grid[x][y - 1]);
        if (y < this.rows - 1 && !this.grid[x][y + 1].visited) 
            neighbors.push(this.grid[x][y + 1]);

        return neighbors.length > 0 ? neighbors[Math.floor(Math.random() * neighbors.length)] : undefined;
    }

    removeWalls(cell1, cell2) {
        const xDiff = cell1.x - cell2.x;
        const yDiff = cell1.y - cell2.y;

        if (xDiff === 1) {
            cell1.walls.left = false;
            cell2.walls.right = false;
        } else if (xDiff === -1) {
            cell1.walls.right = false;
            cell2.walls.left = false;
        } else if (yDiff === 1) {
            cell1.walls.top = false;
            cell2.walls.bottom = false;
        } else if (yDiff === -1) {
            cell1.walls.bottom = false;
            cell2.walls.top = false;
        }
    }

    draw(context) {
        for (let x = 0; x < this.cols; x++) {
            for (let y = 0; y < this.rows; y++) {
                this.grid[x][y].draw(context);
            }
        }
    }
}

// 迷宫类
class MainMaze extends Maze{
    constructor(cols, rows, flag = 1,hasMain = false) {
        super(cols,rows);

        this.taskEntrances = [];  // 存储多个任务迷宫入口
        this.taskMazes = [];      // 存储对应的任务迷宫实例
        this.exit = { x: cols - 1, y: rows - 1 }; // 主迷宫的出口位置在右下角
        this.completed = false;   // 用于标记是否完成任务
        // 任务迷宫入口
        this.generateTaskEntrances(flag);

        this.hasMain = hasMain;
        this.nestedMainMaze = null; // 嵌套主迷宫实例
        this.nestedMainEntrance = null; // 嵌套迷宫入口
        this.nestedMainExit = null; // 嵌套迷宫出口

        //0表示主迷宫，1表示嵌套
        this.type = 0;

        // 如果有下一层任务迷宫，则生成嵌套迷宫
        if (this.hasMain) {
            this.nestedMainMaze = new MainMaze(cols, rows,3); // 生成嵌套迷宫
            this.nestedMainMaze.generate();
            // 在当前任务迷宫中随机生成嵌套迷宫入口
            const nestedEntranceX = Math.floor(Math.random() * cols);
            const nestedEntranceY = Math.floor(Math.random() * rows);
            this.nestedMainEntrance = { x: nestedEntranceX, y: nestedEntranceY};
            const nestedExitX = Math.floor(Math.random() * cols);
            const nestedExitY = Math.floor(Math.random() * rows);
            this.nestedMainExit = {x: nestedExitX, y: nestedExitY};

        }
    }

    // 根据flag生成指定数量的任务迷宫入口
    generateTaskEntrances(flag) {
        while (this.taskEntrances.length < flag) {
            const taskX = Math.floor(Math.random() * this.cols);
            const taskY = Math.floor(Math.random() * this.rows);
            // 确保任务入口不重复，且不与出口重叠
            if (!this.taskEntrances.some(e => e.x === taskX && e.y === taskY) &&
                (taskX !== this.exit.x || taskY !== this.exit.y)) {
                const entrance = { x: taskX, y: taskY };
                this.taskEntrances.push(entrance);

                // 创建对应的任务迷宫实例并添加到taskMazes数组
                const taskMaze = new TaskMaze(this.cols, this.rows);

                taskMaze.hasNext = true; // 标记为有嵌套任务迷宫
                taskMaze.nestedTaskMaze = new TaskMaze(this.cols, this.rows); // 生成嵌套任务迷宫
                taskMaze.nestedTaskMaze.generate();

                // 随机设置嵌套任务迷宫的入口
                const nestedX = Math.floor(Math.random() * this.cols);
                const nestedY = Math.floor(Math.random() * this.rows);
                taskMaze.nestedEntrance = { x: nestedX, y: nestedY };
                

                taskMaze.generate();  // 生成任务迷宫结构
                this.taskMazes.push(taskMaze);
            }
        }
    }

   // 绘制迷宫并标记任务点
    draw(context){
        super.draw(context);
        
        // 绘制任务迷宫入口
        context.fillStyle = 'darkblue';
        this.taskEntrances.forEach(({ x, y }) => {
           context.fillRect(x * cellSize + 5, y * cellSize + 5, cellSize - 10, cellSize - 10);
        });
  
        //主迷宫
        //绘制出口
        context.fillStyle = 'green';
        context.fillRect(this.exit.x * cellSize + 5, this.exit.y * cellSize + 5, cellSize - 10, cellSize - 10);
        //绘制入口
        context.fillStyle = 'yellow';
        context.fillRect( 5, 5, cellSize - 10, cellSize - 10);

        // 绘制嵌套主迷宫入口、出口
        if (this.nestedMainEntrance && this.nestedMainExit) {
            context.fillStyle = 'red';
            context.fillRect(this.nestedMainEntrance.x * cellSize + 5, this.nestedMainEntrance.y * cellSize + 5, cellSize - 10, cellSize - 10);
            context.fillStyle = 'purple';
            context.fillRect(this.nestedMainExit.x * cellSize + 5, this.nestedMainExit.y * cellSize + 5, cellSize - 10, cellSize - 10)
        }

    }
}


//任务迷宫类
class TaskMaze extends Maze{
    constructor(cols, rows, hasNext = false) {
        super(cols,rows);
        this.id = ++mazeCounter; // 自动生成唯一标号

        const entranceX = Math.floor(Math.random() * cols);
        const entranceY = Math.floor(Math.random() * rows);
        this.entrance = { x: entranceX, y: entranceY };
        this.exit = this.entrance;  // 出口与入口位置相同

        this.taskPoints = [];  // 存储任务点坐标

        this.hasNext = hasNext; // 是否有下一层任务迷宫
        this.nestedTaskMaze = null; // 嵌套任务迷宫实例
        this.nestedEntrance = null; // 嵌套任务迷宫入口
        this.generateTaskPoints(6);  // 生成任务点


         // 加载出口图片
         this.exitImage = new Image();
         this.exitImage.src = "Entrance.jpg"; 

        // 如果有下一层任务迷宫，则生成嵌套迷宫
        if (this.hasNext) {
            this.nestedTaskMaze = new TaskMaze(cols, rows); // 生成嵌套迷宫
            this.nestedTaskMaze.generate();
            // 在当前任务迷宫中随机生成嵌套迷宫入口
            const taskX = Math.floor(Math.random() * cols);
            const taskY = Math.floor(Math.random() * rows);
            this.nestedEntrance = { x: taskX, y: taskY };
        }
    }

    // 随机生成任务点
    generateTaskPoints(count) {
        while (this.taskPoints.length < count) {
            const taskX = Math.floor(Math.random() * this.cols);
            const taskY = Math.floor(Math.random() * this.rows);
            // 确保任务点不重复，且不在入口或出口位置
            if (!this.taskPoints.some(p => p.x === taskX && p.y === taskY) &&
                (taskX !== this.entrance.x || taskY !== this.entrance.y) &&
                (taskX !== this.exit.x || taskY !== this.exit.y)) {
                this.taskPoints.push({ x: taskX, y: taskY });
            }
        }
    }

    // 删除指定索引的任务点
    removeTaskPoint(index) {
        this.taskPoints.splice(index, 1);
    }
    
    // 绘制任务迷宫，包括入口、出口和任务点
    draw(context) {
        super.draw(context);
        // 绘制任务点
        context.fillStyle = 'red';
        this.taskPoints.forEach(({ x, y }) => {
            context.fillRect(x * cellSize + 5, y * cellSize + 5, cellSize - 10, cellSize - 10);
        });

        //出口
        if (currentMaze.exitImage.complete) {
            taskContext.drawImage(
                currentMaze.exitImage,
                currentMaze.entrance.x * cellSize + 3,
                currentMaze.entrance.y * cellSize + 4 ,
                cellSize - 8,
                cellSize - 8
            );
        } 
        // 绘制嵌套迷宫入口
        if (this.nestedEntrance) {
            context.fillStyle = 'darkblue';
            context.fillRect(this.nestedEntrance.x * cellSize + 5, this.nestedEntrance.y * cellSize + 5, cellSize - 10, cellSize - 10);
        }
    }
}