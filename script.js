// 获取 DOM 元素
const display = document.getElementById('display');
const historyList = document.getElementById('history-list');

// 用于存储历史记录的数组
let calculationHistory = [];

// Track if the result was calculated
let resultCalculated = false;

// 向显示屏追加内容
function appendToDisplay(value) {
    const lastChar = display.value.slice(-1);
    const operators = ['/', '*', '-', '+'];
    const isOperator = operators.includes(value);
    const lastIsOperator = operators.includes(lastChar);
    const lastIsDot = lastChar === '.';
    const isDot = value === '.';

    // 处理特殊情况以改善用户体验
    if (display.value === '错误') {
        clearDisplay(); // 如果是错误状态，先清空
    }

    // Clear display if a new calculation is to be started (after pressing "=")
    if (resultCalculated && !isOperator && !isDot) {
        display.value = ''; // Clear the display to start fresh
        resultCalculated = false; // Reset the flag
    }

    // 当按下运算符时，保持当前显示内容
    if (lastIsOperator && isOperator) {
        display.value = display.value.slice(0, -1) + value;
        return;
    }

    if (lastIsDot && isDot) {
        return;
    }

    if (display.value === '' && isOperator && value !== '-') {
        return;
    }

    if (display.value === '0' && !isDot && !isOperator) {
        display.value = value;
        return;
    }

    if (display.value === '' && isDot) {
        display.value = '0.';
        return;
    }

    if (lastIsOperator && isDot) {
        display.value += '0.';
        return;
    }

    display.value += value;
}

// 清空显示屏
function clearDisplay() {
    display.value = '';
    resultCalculated = false; // Reset the flag after clearing the display
}

// 删除最后一个字符
function deleteLast() {
    if (display.value === '错误') {
        clearDisplay();
    } else {
        display.value = display.value.slice(0, -1);
    }
}

// 计算结果
function calculateResult() {
    const expression = display.value;
    if (!expression || expression === '错误') return;

    try {
        // 修正一些可能导致错误的表达式，例如以运算符结尾
        let safeExpression = expression;
        const operators = ['/', '*', '-', '+'];
        if (operators.includes(safeExpression.slice(-1))) {
            safeExpression = safeExpression.slice(0, -1); // 移除末尾的操作符
        }

        if (!safeExpression) return; // 如果移除后为空，则不计算

        // 使用 Function 构造函数进行计算
        const calculate = new Function('return ' + safeExpression);
        let result = calculate();

        // 处理浮点数精度
        if (typeof result === 'number' && !Number.isInteger(result)) {
            result = parseFloat(result.toFixed(10));
        }

        // 检查结果是否为 NaN 或 Infinity
        if (!Number.isFinite(result)) {
            throw new Error("结果无效"); // 抛出错误以显示 "错误"
        }

        display.value = result;

        // 添加到历史记录 (只有在原始表达式和计算结果都有效时)
        const historyEntry = `${expression} = ${result}`; // 使用原始表达式记录
        addToHistory(historyEntry);

        resultCalculated = true; // Set the flag to indicate that the result was calculated

    } catch (error) {
        console.error("Calculation Error:", error); // 在控制台打印错误详情
        display.value = '错误';
    }
}

// 添加条目到历史记录数组并更新显示
function addToHistory(entry) {
    calculationHistory.unshift(entry); // 添加到数组开头

    // (可选) 限制历史记录的数量
    // if (calculationHistory.length > 20) {
    //     calculationHistory.pop();
    // }

    updateHistoryDisplay(); // 更新页面显示
}

// 更新页面上的历史记录列表
function updateHistoryDisplay() {
    historyList.innerHTML = ''; // 清空当前列表

    calculationHistory.forEach(entry => {
        const listItem = document.createElement('li');
        listItem.textContent = entry;
        historyList.appendChild(listItem);
    });
}

// 清除历史记录（由按钮调用）
function clearHistoryLog() {
    calculationHistory = []; // 清空数组
    updateHistoryDisplay(); // 更新显示（变为空）
}

// 监听键盘输入
document.addEventListener('keydown', function(event) {
    const key = event.key;

    // 允许数字 0-9 和符号 + - * / . 输入
    if ((key >= '0' && key <= '9') || key === '+' || key === '-' || key === '*' || key === '/' || key === '.') {
        appendToDisplay(key);
    }

    // 允许回车键计算结果
    if (key === 'Enter') {
        calculateResult();
    }

    // 允许删除键
    if (key === 'Backspace') {
        deleteLast();
    }

    // 允许清除键
    if (key === 'Escape') {
        clearDisplay();
    }
});
