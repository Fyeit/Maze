window.addEventListener('keydown', (e) => {
    const context = currentMaze === mainMaze ? mainContext : taskContext;
    let prevX = player.x;
    let prevY = player.y;

    if (!currentMaze.gameOver) {
        if(!moveBanned){
             // 清除旧位置
           
            switch (e.key) {
                case 'ArrowUp':
                case 'w':
                
                    player.move(0, -1, context);
                    break;
                case 'ArrowDown':
                case 's':
                
                    player.move(0, 1, context);
                    break;
                case 'ArrowLeft':
                case 'a':
                
                    player.move(-1, 0, context);
                    break;
                case 'ArrowRight':
                case 'd':
                
                    player.move(1, 0, context);
                    break;
            }
        }
    }
    clearPreviousPlayerPosition(prevX, prevY);
    drawPlayerAt(player.x,player.y);  // 重新绘制新位置
});


// 游戏重置按钮
document.getElementById('resetGameButton').addEventListener('click', () => {
    showPathButton.disabled = false;
    moveBanned = false;
    mazeCounter = 0;
    setup(taskEntranceCount);
});
// 退出任务迷宫按钮
document.getElementById('exitTaskButton').addEventListener('click', exitTaskMaze);
