const canvas = document.getElementById('game');

        const ctx = canvas.getContext('2d');

        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 2;

        let speed = 0.01;
        let curvePoints = [];
        let gameLoop;
        let success;
        let balance = 1000;
        let crashed;
        let betAmount;
        let profitsTaken;

        const balanceDisplay = document.getElementById('balance');
        balanceDisplay.innerText = balance + '$';

        const betAmountInput = document.getElementById('betAmount');

        function updateCurve() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.beginPath();

            for (let i = 0; i < curvePoints.length; i++) {
                const { x, y } = curvePoints[i];

                ctx.lineTo(x, y);
            }

            ctx.stroke();

            if (!crashed) {
                const lastPoint = curvePoints[curvePoints.length - 1];

                if (curvePoints.length >= 2) {
                    const secondLastPoint = curvePoints[curvePoints.length - 2];
                    const deltaX = lastPoint.x - secondLastPoint.x;
                    const deltaY = lastPoint.y - secondLastPoint.y;
                    const angle = Math.atan2(deltaY, deltaX) + Math.PI / 4;

                    ctx.save();
                    ctx.translate(lastPoint.x, lastPoint.y);
                    ctx.rotate(angle);

                    ctx.font = '30px Arial';
                    ctx.fillText('🚀', 0, -10);

                    rocketPosition = { x: lastPoint.x, y: lastPoint.y };

                    ctx.restore();
                } else {
                    ctx.font = '30px Arial';
                    ctx.fillText('🚀', lastPoint.x, lastPoint.y - 10);

                    rocketPosition = { x: lastPoint.x, y: lastPoint.y };
                }
            } else {
                const crashPosition = { x: rocketPosition.x, y: rocketPosition.y - 10 };
                const crashAngle = Math.atan2(rocketPosition.y - curvePoints[curvePoints.length - 2].y, rocketPosition.x - curvePoints[curvePoints.length - 2].x) + Math.PI / 4;

                ctx.save();
                ctx.translate(crashPosition.x, crashPosition.y);
                ctx.rotate(crashAngle);

                ctx.font = '30px Arial';
                ctx.fillText('💥', 0, 0);

                ctx.restore();
            }
        }

        function updateCurvePoints() {
            const lastPoint = curvePoints[curvePoints.length - 1];
            const newX = lastPoint.x + 1;
            const newY = canvas.height - (Math.pow(newX, 1.75) / 100);

            document.getElementById('currentMultiplier').innerText = curvePoints.length / 100 + 'x';

            curvePoints.push({ x: newX, y: newY });
        }

        function startGame() {
            curvePoints = [{ x: 0, y: canvas.height }];

            updateCurve();
        }

        // function getRandomCrashTime(min, max) {
        //     const randomDecimal = Math.random();
        //     const randomNumber = randomDecimal * (max - min) + min;

        //     return randomNumber * 1000;
        // }

        function getRandomCrashTime() {
            return Math.floor(Math.random() * 6000) + 1000;
        }

        function crashCurve(betAmount) {
            clearInterval(gameLoop);
            ctx.clearRect(0, 0, canvas.width, canvas.height); // Очищаем холст
        
            const crashValue = curvePoints.length / 100;
            document.getElementById('crashedAt').innerText = `Multiplier at crash: ${crashValue}`;
            crashed = true;
        
            const crash = document.createElement('p');
            crash.innerText = crashValue;
            crash.style = 'padding: 10 ; margin: 0;';
            crash.style.color = profitsTaken ? 'lime' : 'red';
        
            document.getElementById('lastCrashes').appendChild(crash);
        
            updateCurve();
        }

        // document.getElementById('submitBet').addEventListener('click', function () {
        //     if (balance > betAmountInput.value) {
        //         balance = balance - betAmountInput.value;
        //         balanceDisplay.innerText = balance + '$';

        //         crashed = false;
        //         profitsTaken = false;
        //         startGame();

        //         gameLoop = setInterval(() => {
        //             updateCurvePoints();
        //             updateCurve();
        //         }, 16);

        //         betAmount = betAmountInput.value;

        //         setTimeout(function () {
        //             crashCurve(betAmountInput.value);
        //         }, getRandomCrashTime(1, 5.5));

        //     }
        // })


        
        function ClickStart() {
            if (balance > betAmountInput.value) {
                balance = balance - betAmountInput.value;
                balanceDisplay.innerText = balance + '$';
        
                crashed = false;
                profitsTaken = false;
                startGame();
                document.getElementById('waitingMessage').innerText = "";

        
                gameLoop = setInterval(() => {
                    updateCurvePoints();
                    updateCurve();
                }, 16);
        
                betAmount = betAmountInput.value;
        
                setTimeout(() => {
                    crashCurve(betAmountInput.value);
                    // Скрытие сообщения после краша
                    document.getElementById('waitingMessage').innerText = "Ожидание следующего раунда...";
                    // Запуск нового раунда через 10 секунд
                    setTimeout(ClickStart, 10000);
                }, getRandomCrashTime());
            }
        }
        
        // Отображение сообщения "Ожидание следующего раунда..."
        
        // Запуск первого раунда
        setTimeout(ClickStart, 10000);


        document.getElementById('takeProfits').addEventListener('click', function () {
            if (!crashed && !profitsTaken) {
                profitsTaken = true;
                console.log(`took profits, multiplier: ${curvePoints.length / 100}, profit: ${betAmount * (curvePoints.length / 100) - betAmount}`);
                balance = (betAmount * (curvePoints.length / 100) + balance).toFixed(2);
                balance = parseFloat(balance);
                balanceDisplay.innerText = balance + '$';
            } else if (profitsTaken) {
                console.log('profits already taken');
            }
        })