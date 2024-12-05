const mainMazeCanvas = document.getElementById('mainMazeCanvas');
const taskMazeCanvas = document.getElementById('taskMazeCanvas');
const mainContext = mainMazeCanvas.getContext('2d');
const taskContext = taskMazeCanvas.getContext('2d');

const cols = 20;
const rows = 20;
const cellSize = mainMazeCanvas.width / cols;
let mainMaze, taskMaze, currentMaze, player, main_exit;
let savedPlayerPosition = { x: 0, y: 0 };

let solutionPath = null; // 保存路径
let showPath = true;  // 控制是否显示路径

let inTaskMaze = false;  // 标记是否在任务迷宫中
let moveBanned = false;
//迷宫编号
let mazeCounter = 0;

let currentMazeIndex = 1; // 当前主迷宫的索引
const maxMainMazes = 3; // 设定最大完成数量
//第一层迷宫的最小完成数
let targetScore = 3;
const taskEntranceCount = 7;  // 指定任务迷宫入口的数量

//存放迷宫
let mazeStack = []; 
// 迷宫页面切换
const mainMazePage = document.getElementById('mainMazePage');
const taskMazePage = document.getElementById('taskMazePage');

// 进入任务迷宫
function enterTaskMaze() {
    //console.log("主迷宫任务迷宫入口列表1:", currentMaze.taskEntrances);
   // 找到玩家所在的任务入口索引
    let taskIndex = -1; // 默认值为-1，表示未找到
    for (let i = 0; i < currentMaze.taskEntrances.length; i++) {
        const entrance = currentMaze.taskEntrances[i];
        if (entrance.x === player.x && entrance.y === player.y) {
            taskIndex = i; // 找到匹配的入口
            break; // 提前退出循环，节省资源
        }
    }
    //console.log("主迷宫任务迷宫入口列表2:", currentMaze.taskEntrances);
    //console.log("找到的入口索引:",taskIndex);
    savedPlayerPosition = { x: player.x, y: player.y };  // 保存主迷宫中的位置
    
     // 保存当前迷宫状态
     mazeStack.push({
        maze: currentMaze,
        playerPosition: { x: player.x, y: player.y },
        score: player.score,
    });

    // 获取对应的任务迷宫实例
    const taskMaze = currentMaze.taskMazes[taskIndex];

    currentMaze = taskMaze;//设置当前迷宫为新的任务迷宫
    taskContext.fillStyle = 'pink';  // 任务迷宫入口的填充颜色
    taskContext.fillRect(taskMaze.entrance.x * cellSize + 5, taskMaze.entrance.y * cellSize + 5, cellSize - 10, cellSize - 10);
    // 切换页面
    mainMazePage.style.display = 'none';
    taskMazePage.style.display = 'block';
    // 更新标号显示
    document.getElementById("mazeIdDisplay").textContent = `当前任务迷宫编号: ${currentMaze.id}`;

    console.log("进入任务迷宫：", currentMaze.id, currentMaze);
    console.log("迷宫栈中的内容：", mazeStack);
    player.x = taskMaze.entrance.x;
    player.y = taskMaze.entrance.y;  // 玩家从任务迷宫入口开始
    player.clearExperience()

    drawTaskMaze();  // 绘制任务迷宫
}
// 绘制任务迷宫
function drawTaskMaze() {
    taskContext.clearRect(0, 0, taskMazeCanvas.width, taskMazeCanvas.height);
    currentMaze.draw(taskContext);
    player.draw(taskContext);
}

//进嵌套迷宫
function enterNestedTaskMaze(parentMaze) {
    // 保存当前迷宫状态
    mazeStack.push({
        maze: currentMaze,
        playerPosition: { x: player.x, y: player.y },
        experience: player.experience,
    });

    currentMaze = parentMaze.nestedTaskMaze; // 切换到嵌套任务迷宫
    player.x = currentMaze.entrance.x; // 设置玩家位置为嵌套迷宫入口
    player.y = currentMaze.entrance.y;
    player.clearExperience(); // 清空经验值
     // 更新标号显示
    document.getElementById("mazeIdDisplay").textContent = `当前任务迷宫编号: ${currentMaze.id}`;
    // 更新页面显示层级
    document.getElementById("currentLevel").textContent = `当前层级: 2`;
    console.log("迷宫栈中的内容：", mazeStack);
    // 切换页面
    mainMazePage.style.display = 'none';
    taskMazePage.style.display = 'block';

    drawTaskMaze();
}

// 进入嵌套主迷宫
function enterNestedMainMaze(parentMaze) {
    // 保存当前迷宫状态到堆栈
    mazeStack.push({
        maze: currentMaze,
        playerPosition: { x: player.x, y: player.y },
        score: player.score
    });

    // 切换到嵌套主迷宫
    currentMaze = parentMaze.nestedMainMaze; // 嵌套主迷宫实例
    currentMaze.type = 1;
    player.x = 0; // 玩家位置切换到嵌套迷宫入口
    player.y = 0;
    player.score = 0;
    player.clearExperience(); // 清空经验值
    document.getElementById("scoreDisplay").textContent = `至少完成1个任务迷宫以回到主迷宫，当前完成数：${player.score}`;
    // 更新页面显示层级
    document.getElementById("levelDisplay").textContent = `当前层级: 嵌套主迷宫`;
    console.log("迷宫栈中的内容：", mazeStack);
    drawMainMaze(); // 调用绘制嵌套主迷宫的方法
}

// 从嵌套主迷宫返回主迷宫
function exitNestedMainMaze() {
    // 恢复主迷宫状态
    const previousState = mazeStack.pop(); // 从堆栈中恢复状态
    currentMaze = previousState.maze; // 切换回主迷宫
    player.x = currentMaze.nestedMainExit.x; // 从嵌套迷宫出口进入主迷宫
    player.y = currentMaze.nestedMainExit.y;
    player.score = previousState.score;
    currentMaze.type = 0;
    // 更新页面显示层级
    document.getElementById("scoreDisplay").textContent = `完成的任务迷宫数: ${player.score} / ${targetScore}`;
    document.getElementById("levelDisplay").textContent = `当前主迷宫: ${currentMazeIndex} / 3`;
    console.log("迷宫栈中的内容：", mazeStack);

    //出来后消除嵌套入口和出口
    currentMaze.nestedMainEntrance = (-1,-1);
    //currentMaze.nestedMainExit = (-1,-1);
    drawMainMaze(); // 调用绘制主迷宫的方法
}



// 退出任务迷宫
function exitTaskMaze() {
    const previousState = mazeStack.pop(); // 恢复上一级迷宫状态
    currentMaze = previousState.maze;
    player.x = previousState.playerPosition.x;
    player.y = previousState.playerPosition.y;
    player.score = previousState.score;
    player.experience = previousState.experience;
    document.getElementById("experienceDisplay").textContent = `当前经验值: ${player.experience} / 15`;
    // 更新标号显示
    document.getElementById("mazeIdDisplay").textContent = `当前任务迷宫编号: ${currentMaze.id}`;
    console.log("迷宫栈中的内容：", mazeStack);
    // 根据迷宫类型调整页面显示
    if (currentMaze instanceof MainMaze) {
        taskMazePage.style.display = 'none';
        mainMazePage.style.display = 'block';
        drawMainMaze();
        // 清空经验值
        player.clearExperience();
        player.addScore(1);
        if(currentMaze.type == 1){
            const taskIndex = currentMaze.taskEntrances.findIndex(entrance => entrance.x === player.x && entrance.y === player.y);
            if (taskIndex !== -1) {
                currentMaze.taskEntrances[taskIndex] = (-1,-1);
            }
            document.getElementById("scoreDisplay").textContent = `至少完成1个任务迷宫以回到主迷宫，当前完成数：${player.score}`;
            // 更新页面显示层级
            document.getElementById("levelDisplay").textContent = `当前层级: 嵌套主迷宫`;
        }
        else{
            // 完成任务迷宫后，将该入口移除
            const taskIndex = mainMaze.taskEntrances.findIndex(entrance => entrance.x === player.x && entrance.y === player.y);
            if (taskIndex !== -1) {
                mainMaze.taskEntrances[taskIndex] = (-1,-1);
            }
        }
        
    } 
    else if (currentMaze instanceof TaskMaze) {
         // 完成嵌套任务迷宫后，将该嵌套入口移除
         if (currentMaze.nestedEntrance) {
            currentMaze.nestedEntrance = null; // 清空嵌套入口
            currentMaze.hasNext = false; // 标记没有嵌套任务迷宫
        }
        taskMazePage.style.display = 'block';
        mainMazePage.style.display = 'none';
        drawTaskMaze();
        // 更新页面显示层级
        document.getElementById("currentLevel").textContent = `当前层级: 1`;
    }
    
}



// 初始化主迷宫
function setup(taskEntranceCount) {
    mainMaze = new MainMaze(cols, rows, taskEntranceCount,true);  // 主迷宫，有多个任务入口............................................
    mainMaze.generate();
    currentMaze = mainMaze;

    player = new Player(0, 0); // 玩家从 (0,0) 开始
    document.getElementById("scoreDisplay").textContent = `完成的任务迷宫个数: ${player.score} / ${targetScore}`;
    document.getElementById("levelDisplay").textContent = `当前主迷宫: ${currentMazeIndex} / ${maxMainMazes}`;
    main_exit = { x: cols - 1, y: rows - 1 }; // 迷宫出口 

    drawMainMaze(); // 绘制主迷宫
    console.log("主迷宫任务迷宫入口列表:", mainMaze.taskEntrances);
    console.log("任务迷宫列表:", mainMaze.taskMazes);
}
function completeMainMaze() {
    if (currentMazeIndex >= maxMainMazes) {
        alert("恭喜完成所有迷宫，游戏结束！");
        currentMaze.completed = false;  
        return; // 游戏结束
    }
    
    alert(`恭喜完成主迷宫 ${currentMazeIndex}！准备进入下一主迷宫。`);
    currentMazeIndex++; // 更新当前主迷宫索引
    targetScore++;
    setup(taskEntranceCount); // 生成新的主迷宫
}

// 绘制主迷宫
function drawMainMaze() {
    mainContext.clearRect(0, 0, mainMazeCanvas.width, mainMazeCanvas.height);
    currentMaze.draw(mainContext); // 先绘制迷宫
    player.draw(mainContext); // 然后绘制玩家
}


function clearPreviousPlayerPosition(prevX, prevY) {
    const context = (currentMaze === mainMaze || currentMaze === mainMaze.nestedMainMaze) ? mainContext : taskContext;
    context.clearRect(prevX * cellSize + 5, prevY * cellSize + 5, cellSize - 10, cellSize - 10);

    //检查是否是主迷宫起点
    const isStart = prevX == 0 && prevY == 0;
    if(isStart){
        context.fillStyle = 'yellow';
        context.fillRect( 5, 5, cellSize - 10, cellSize - 10);
    }
    // 检查是否是主迷宫的出口
    const isExitMain = (currentMaze === mainMaze || currentMaze === mainMaze.nestedMainMaze) && prevX === mainMaze.exit.x && prevY === mainMaze.exit.y;
    if (isExitMain) {
        context.fillStyle = 'green';  // 出口填充颜色
        context.fillRect(mainMaze.exit.x * cellSize + 5, mainMaze.exit.y * cellSize + 5, cellSize - 10, cellSize - 10);
    }

    // 找到玩家所在的任务入口索引
    const taskIndex = mainMaze.taskEntrances.findIndex(
        entrance => entrance.x === player.x && entrance.y === player.y
    );
    // 获取对应的任务迷宫实例
    const taskMaze = mainMaze.taskMazes[taskIndex];

    // 检查是否是任务迷宫的入口
    const isEntranceTask = currentMaze === taskMaze && prevX === taskMaze.entrance.x && prevY === taskMaze.entrance.y;
    if (isEntranceTask) {
        context.fillStyle = 'pink';  // 任务迷宫入口的填充颜色
        context.fillRect(taskMaze.entrance.x * cellSize + 5, taskMaze.entrance.y * cellSize + 5, cellSize - 10, cellSize - 10);
    }

}

function drawPlayerAt(x, y) {
    const context = (currentMaze === mainMaze || currentMaze === mainMaze.nestedMainMaze) ? mainContext : taskContext;
    context.fillStyle = 'blue';
    context.fillRect(x * cellSize + 5, y * cellSize + 5, cellSize - 10, cellSize - 10);
}