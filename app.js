// 設定
const GEMINI_API_KEY = 'AIzaSyBPkTw9WC082fJYfG9L0nqE2BDdAIlRvnw'; // 請替換成您的 Gemini API 金鑰
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// DOM 元素
const startButton = document.getElementById('startButton');
const statusDiv = document.getElementById('status');
const resultDiv = document.getElementById('result');

// 語音辨識設定
const recognition = new webkitSpeechRecognition();
recognition.continuous = false;
recognition.interimResults = false;
recognition.lang = 'zh-TW';

// 按鈕事件處理
let isRecording = false;

startButton.addEventListener('click', () => {
    if (!isRecording) {
        startRecording();
    } else {
        stopRecording();
    }
});

// 開始錄音
function startRecording() {
    isRecording = true;
    startButton.textContent = '停止錄音';
    statusDiv.textContent = '正在聆聽...';
    recognition.start();
}

// 停止錄音
function stopRecording() {
    isRecording = false;
    startButton.textContent = '開始錄音';
    recognition.stop();
}

// 語音辨識結果處理
recognition.onresult = async (event) => {
    const speechResult = event.results[0][0].transcript;
    statusDiv.textContent = `您說：${speechResult}`;
    
    try {
        const aiResponse = await getAIResponse(speechResult);
        resultDiv.innerHTML += `
            <p><strong>您：</strong> ${speechResult}</p>
            <p><strong>AI：</strong> ${aiResponse}</p>
            <hr>
        `;
        
        // 使用語音合成回應
        speak(aiResponse);
    } catch (error) {
        statusDiv.textContent = '發生錯誤：' + error.message;
    }
};

// 錯誤處理
recognition.onerror = (event) => {
    console.error('語音辨識錯誤：', event.error);
    statusDiv.textContent = '發生錯誤：' + event.error;
    stopRecording();
};

// 取得 AI 回應
async function getAIResponse(input) {
    const response = await fetch(API_URL + '?key=' + GEMINI_API_KEY, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            contents: [{
                parts: [{
                    text: input
                }]
            }]
        })
    });

    if (!response.ok) {
        throw new Error('AI 回應出錯');
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
}

// 語音合成
function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-TW';
    speechSynthesis.speak(utterance);
}

// 初始化錯誤處理
if (!('webkitSpeechRecognition' in window)) {
    statusDiv.textContent = '您的瀏覽器不支援語音辨識功能，請使用 Chrome 瀏覽器。';
    startButton.disabled = true;
}
