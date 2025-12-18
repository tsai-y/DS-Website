document.addEventListener('DOMContentLoaded', () => {
    // --- 新增：取得當前使用者，若未登入則導回登入頁 ---
    const currentUser = sessionStorage.getItem('ds_user');
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    // 將使用者的 Key 定義為全域變數，方便下方所有函式讀取
    window.USER_BOOKMARK_KEY = `ds_bookmarks_${currentUser}`;
    window.USER_WRONG_KEY = `ds_wrong_questions_${currentUser}`;

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

// 1. 渲染重點收藏 (修正：使用 USER_BOOKMARK_KEY)
function renderBookmarks() {
    // 修改：讀取該使用者的專屬資料
    const bookmarks = JSON.parse(localStorage.getItem(window.USER_BOOKMARK_KEY)) || [];
    const list = document.getElementById('bookmark-list');
    
    if (bookmarks.length === 0) {
        list.innerHTML = '<div class="empty-state"><i class="fa-regular fa-star" style="font-size:3rem; margin-bottom:10px;"></i><br>目前沒有收藏。<br>去課程中點擊星號來收藏重點吧！</div>';
        return;
    }

    list.innerHTML = '';
    bookmarks.forEach(item => {
        const div = document.createElement('div');
        div.className = 'review-card fav-card';
        
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

// 2. 渲染錯題本 (修正：使用 USER_WRONG_KEY)
function renderWrongQuestions() {
    // 修改：讀取該使用者的專屬資料
    const wrongs = JSON.parse(localStorage.getItem(window.USER_WRONG_KEY)) || [];
    const list = document.getElementById('wrong-list');

    if (wrongs.length === 0) {
        list.innerHTML = '<div class="empty-state"><i class="fa-solid fa-check-circle" style="font-size:3rem; margin-bottom:10px; color:#2ecc71;"></i><br>太棒了！目前沒有錯題紀錄。</div>';
        return;
    }

    list.innerHTML = '';
    wrongs.forEach((q, index) => {
        const div = document.createElement('div');
        div.className = 'review-card wrong-card';
        
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

// 移除單一收藏 (修正：使用 USER_BOOKMARK_KEY)
function removeBookmark(title) {
    if(!confirm("確定要移除此收藏嗎？")) return;

    let bookmarks = JSON.parse(localStorage.getItem(window.USER_BOOKMARK_KEY)) || [];
    bookmarks = bookmarks.filter(b => b.title !== title);
    localStorage.setItem(window.USER_BOOKMARK_KEY, JSON.stringify(bookmarks));
    
    renderReviewContent();
}

// 清空錯題 (修正：使用 USER_WRONG_KEY)
function clearWrongAnswers() {
    if(confirm("確定要清空所有錯題紀錄嗎？此動作無法復原。")) {
        localStorage.removeItem(window.USER_WRONG_KEY);
        renderReviewContent();
    }
}

// 移除單一錯題 (修正：使用 USER_WRONG_KEY)
window.removeSingleWrong = function(index) {
    if(!confirm("確定要移除這道錯題紀錄嗎？")) return;

    let wrongs = JSON.parse(localStorage.getItem(window.USER_WRONG_KEY)) || [];
    wrongs.splice(index, 1);
    localStorage.setItem(window.USER_WRONG_KEY, JSON.stringify(wrongs));
    
    renderReviewContent();
}
