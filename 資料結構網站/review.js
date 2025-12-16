document.addEventListener('DOMContentLoaded', () => {
    renderReviewContent();
});

// 切換標籤
function switchTab(tabName) {
    // 移除所有 active
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.review-content').forEach(content => content.classList.remove('active'));
    
    // 加入 active
    const activeBtn = document.querySelector(`button[onclick="switchTab('${tabName}')"]`);
    if(activeBtn) activeBtn.classList.add('active');
    
    document.getElementById(`tab-${tabName}`).classList.add('active');
    
    // 重新渲染以確保資料最新
    renderReviewContent();
}

// 核心渲染函式
function renderReviewContent() {
    renderBookmarks();
    renderWrongQuestions();
    
    // 重新觸發 MathJax 渲染 (如果收藏的內容有公式)
    if (window.MathJax) {
        MathJax.typesetPromise();
    }
}

// 1. 渲染重點收藏
function renderBookmarks() {
    const bookmarks = JSON.parse(localStorage.getItem('ds_bookmarks')) || [];
    const list = document.getElementById('bookmark-list');
    
    if (bookmarks.length === 0) {
        list.innerHTML = '<div class="empty-state"><i class="fa-regular fa-star" style="font-size:3rem; margin-bottom:10px;"></i><br>目前沒有收藏。<br>去課程中點擊星號來收藏重點吧！</div>';
        return;
    }

    list.innerHTML = '';
    bookmarks.forEach(item => {
        const div = document.createElement('div');
        div.className = 'review-card fav-card';
        
        // 移除原本內容中的星號按鈕 HTML (如果有存進去的話)
        let cleanContent = item.content.replace(/<button class="star-btn".*?<\/button>/, '');

        div.innerHTML = `
            <button class="delete-btn" onclick="removeBookmark('${item.title}')" title="移除收藏">
                <i class="fa-solid fa-trash-can"></i>
            </button>
            <div class="fav-content">
                ${cleanContent} 
            </div>
        `;
        list.appendChild(div);
    });
}

// 2. 渲染錯題本 (修正版：加入刪除按鈕)
function renderWrongQuestions() {
    const wrongs = JSON.parse(localStorage.getItem('ds_wrong_questions')) || [];
    const list = document.getElementById('wrong-list');

    if (wrongs.length === 0) {
        list.innerHTML = '<div class="empty-state"><i class="fa-solid fa-check-circle" style="font-size:3rem; margin-bottom:10px; color:#2ecc71;"></i><br>太棒了！目前沒有錯題紀錄。</div>';
        return;
    }

    list.innerHTML = '';
    // 加入 index 參數，以防題目文字完全相同時刪錯
    wrongs.forEach((q, index) => {
        const div = document.createElement('div');
        div.className = 'review-card wrong-card';
        
        // ★★★ 新增：這裡加入了刪除按鈕，並傳入 index ★★★
        // 注意：這裡我們改用 index 來刪除，這樣比較安全（不怕題目文字有引號造成錯誤）
        div.innerHTML = `
            <button class="delete-btn" onclick="removeSingleWrong(${index})" title="移除此題">
                <i class="fa-solid fa-trash-can"></i>
            </button>
            
            <h3><i class="fa-solid fa-circle-exclamation" style="color:#e74c3c;"></i> ${q.question}</h3>
            <div class="ans-block" style="color:#e74c3c">
                <i class="fa-solid fa-xmark"></i> 你的答案：<span>${q.userAns}</span>
            </div>
            <div class="ans-block" style="color:#2ecc71">
                <i class="fa-solid fa-check"></i> 正確答案：<span>${q.correctAns}</span>
            </div>
            <div class="hint-box">
                <strong><i class="fa-solid fa-lightbulb"></i> 解析：</strong> ${q.hint}
            </div>
        `;
        list.appendChild(div);
    });
}

// 移除單一收藏
function removeBookmark(title) {
    if(!confirm("確定要移除此收藏嗎？")) return;

    let bookmarks = JSON.parse(localStorage.getItem('ds_bookmarks')) || [];
    bookmarks = bookmarks.filter(b => b.title !== title);
    localStorage.setItem('ds_bookmarks', JSON.stringify(bookmarks));
    
    renderReviewContent();
}

// 清空錯題
function clearWrongAnswers() {
    if(confirm("確定要清空所有錯題紀錄嗎？此動作無法復原。")) {
        localStorage.removeItem('ds_wrong_questions');
        renderReviewContent();
    }
}
// ★★★ 新增：移除單一錯題 ★★★
window.removeSingleWrong = function(index) {
    if(!confirm("確定要移除這道錯題紀錄嗎？")) return;

    // 1. 讀取目前所有錯題
    let wrongs = JSON.parse(localStorage.getItem('ds_wrong_questions')) || [];
    
    // 2. 刪除指定索引的那一題 (splice: 從 index 位置刪除 1 個元素)
    wrongs.splice(index, 1);
    
    // 3. 存回 LocalStorage
    localStorage.setItem('ds_wrong_questions', JSON.stringify(wrongs));
    
    // 4. 重新渲染畫面
    renderReviewContent();
}
