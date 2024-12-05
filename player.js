
// 玩家类
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.score = 0;          // 分数属性
        this.experience = 0;     // 玩家在本迷宫中的经验值
    }

    // 增加分数
    addScore(points) {
        this.score += points;
        document.getElementById("scoreDisplay").textContent = `完成的任务迷宫数: ${this.score} / ${targetScore}`;
    }
    // 增加经验值
    addExperience(points) {
        this.experience += points;
        this.updateStatusDisplay();
    }
    clearExperience(){
        this.experience = 0;
        this.updateStatusDisplay();
    }
    // 更新页面上显示的分数
    updateStatusDisplay() {
        
        document.getElementById("experienceDisplay").textContent = `当前经验值: ${this.experience} / 15`;
    }
    

    draw(context) {
        context.fillStyle = 'blue'; // 设置玩家的颜色为蓝色
        context.fillRect(this.x * cellSize + 5, this.y * cellSize + 5, cellSize - 10, cellSize - 10); // 绘制玩家
    }

    move(dx, dy, context) {
        const newX = this.x + dx;// 计算新的位置x坐标
        const newY = this.y + dy;


        // 检查新位置是否在迷宫范围内
        if (newX >= 0 && newX < cols && newY >= 0 && newY < rows) {
            const currentCell = currentMaze.grid[this.x][this.y];// 获取当前单元格
            const nextCell = currentMaze.grid[newX][newY];// 获取目标单元格

            if ((dx === -1 && !currentCell.walls.left) ||
                (dx === 1 && !currentCell.walls.right) ||
                (dy === -1 && !currentCell.walls.top) ||
                (dy === 1 && !currentCell.walls.bottom)) {
                this.x = newX;
                this.y = newY;

                    //判断主迷宫中的位置
                    if (currentMaze instanceof MainMaze){
                        //检查是否进入任务迷宫
                        if(currentMaze.taskEntrances.some(entrance => entrance.x === newX && entrance.y === newY)) {
                            enterTaskMaze();
                        }
                        if(currentMaze.hasMain && currentMaze.nestedMainEntrance && currentMaze.nestedMainEntrance.x === newX && currentMaze.nestedMainEntrance.y === newY){
                            enterNestedMainMaze(currentMaze);
                        }
                        // 检查是否到达终点
                        if (newX === main_exit.x && newY === main_exit.y){
                            //第一层主迷宫
                            if(currentMaze.type == 0){
                                if (player.score >= targetScore) {
                                    completeMainMaze(); // 进入下一主迷宫
                                }else alert('请完成所有任务迷宫！');
                            }else{
                                if(player.score >= 1) {
                                    alert('达成目标！即将回到主迷宫紫色出口处！');
                                    exitNestedMainMaze();
                                }else alert('请至少完成一个此嵌套迷宫中的任务迷宫才可出去！');
                            }
                        }
                    }

                    //判断任务迷宫中的位置
                    if (currentMaze instanceof TaskMaze){
                        //检查是否到任务点
                        if (currentMaze.taskPoints.some(p => p.x === newX && p.y === newY)) {
                            this.triggerTask();
                        }
                        // 检查是否到达终点
                        if (newX === currentMaze.exit.x && newY === currentMaze.exit.y) {
                            if(player.experience >= 15){
                                alert('经验值已满，可以返回上一级迷宫！');
                                exitTaskMaze();
                            }else alert('请继续完成任务点!');   
                            
                        }

                         // 检查是否到达嵌套任务迷宫入口
                        if (currentMaze.hasNext && currentMaze.nestedTaskMaze &&currentMaze.nestedEntrance.x === newX && currentMaze.nestedEntrance.y === newY) {
                            const enterNested = confirm("是否进入下一层任务迷宫？");
                            if (enterNested) {
                                enterNestedTaskMaze(currentMaze);
                            }
                        }
                       
                    }
              
            }
        }
        this.draw(context);  // 更新玩家位置
    }

    triggerTask() {
        const num1 = Math.floor(Math.random() * 10) + 1;
        const num2 = Math.floor(Math.random() * 10) + 1;
        const correctAnswer = num1 + num2;
        
        let userAnswer = null;
    
        // 使用 while 循环直到玩家输入正确的答案
        while (userAnswer !== correctAnswer) {
            userAnswer = parseInt(prompt(`任务：计算 ${num1} + ${num2} 的值`));
    
            // 如果输入无效或者用户按了取消（返回 NaN），提示重新输入
            if (isNaN(userAnswer)) {
                alert("请输入一个有效的数字！");
                continue;  // 继续循环，直到输入正确的数字
            }
    
            // 如果用户输入正确的答案
            if (userAnswer === correctAnswer) {
                alert("回答正确！获得经验值。");
                
    
                // 玩家回答正确后，删除当前任务点
                if (currentMaze instanceof TaskMaze) {
                    const taskMaze = currentMaze;
                    player.addExperience(5); 
                    const taskPointIndex = taskMaze.taskPoints.findIndex(p => p.x === this.x && p.y === this.y);
                    if (taskPointIndex !== -1) {
                        taskMaze.removeTaskPoint(taskPointIndex);  // 删除任务点
                    }
                }
            } else {
                alert("回答错误！请再试一次。");
            }
        }
    }
    

}