document.addEventListener('DOMContentLoaded', () => {
    // --- 取得當前使用者 ---
    const currentUser = sessionStorage.getItem('ds_user');
    if (!currentUser) {
        window.location.href = 'login.html'; 
        return;
    }

    // ★ 新增：將名字顯示在側邊欄 (假設你的 HTML id 是 display-user)
    const displayUserEl = document.getElementById('display-user');
    if (displayUserEl) {
        displayUserEl.innerText = currentUser;
    }

    const USER_BOOKMARK_KEY = `ds_bookmarks_${currentUser}`;
    
    // ... 後面接你原本的章節切換邏輯 ...
    // --- 1. 章節切換邏輯 ---
    const navItems = document.querySelectorAll('.nav-item');
    const chapters = document.querySelectorAll('.chapter');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');

    // 章節 ID 陣列 (只包含內部切換的 ID，不包含外部連結)
    const chapterIds = ['ch1', 'ch2', 'ch3', 'ch4', 'ch5'];
    let currentChapterIndex = 0;

    function switchChapter(targetId) {
        // 1. 更新側邊欄 Active 狀態
        navItems.forEach(item => {
            // 只移除有 data-target 屬性的項目的 active class，避免影響外部連結樣式
            if (item.hasAttribute('data-target')) {
                item.classList.remove('active');
                if(item.getAttribute('data-target') === targetId) {
                    item.classList.add('active');
                }
            }
        });

        // 2. 顯示對應的章節內容，隱藏其他
        chapters.forEach(ch => {
            ch.classList.remove('active');
            ch.classList.add('hidden');
            if(ch.id === targetId) {
                ch.classList.remove('hidden');
                ch.classList.add('active');
            }
        });

        // 3. 更新目前索引
        if (chapterIds.includes(targetId)) {
            currentChapterIndex = chapterIds.indexOf(targetId);
            updateButtons();
            updateProgress();
        }
        
        // 4. 回到頂部
        window.scrollTo(0, 0);
    }

    // 點擊側邊欄監聽器
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            // 取得該按鈕的 data-target 屬性
            const targetId = item.getAttribute('data-target');

            // 邏輯判斷：
            // 如果有 data-target，代表是內部章節 (CH1~CH5)，要攔截並切換
            if (targetId) {
                e.preventDefault(); // 阻止預設跳轉
                switchChapter(targetId); // 執行內部切換
                
                // 手機版點擊後自動關閉側邊欄
                if(window.innerWidth <= 768) {
                    document.querySelector('.sidebar').classList.remove('show');
                }
            }
            // 如果沒有 data-target (例如 href="quiz.html")，什麼都不做，讓瀏覽器自己跳轉
        });
    });

    // --- 2. 上一頁/下一頁 按鈕邏輯 ---
    function updateButtons() {
        // 更新上一頁按鈕
        if (currentChapterIndex === 0) {
            prevBtn.disabled = true;
            prevBtn.textContent = "無上一章";
        } else {
            prevBtn.disabled = false;
            prevBtn.textContent = "上一章";
        }

        // 更新下一頁按鈕
        if (currentChapterIndex === chapterIds.length - 1) {
            nextBtn.textContent = "完成課程";
            // 這裡可以改成跳轉到總測驗或其他頁面
        } else {
            nextBtn.textContent = "下一章";
        }
    }

    prevBtn.addEventListener('click', () => {
        if (currentChapterIndex > 0) {
            switchChapter(chapterIds[currentChapterIndex - 1]);
        }
    });

    nextBtn.addEventListener('click', () => {
        if (currentChapterIndex < chapterIds.length - 1) {
            switchChapter(chapterIds[currentChapterIndex + 1]);
        } else {
            alert("恭喜你完成所有章節的學習！現在去挑戰測驗吧！");
            window.location.href = "quiz.html"; // 跳轉到測驗頁面
        }
    });



    // --- 4. 星號收藏功能 (修正版) ---
    const starBtns = document.querySelectorAll('.star-btn');
    
    // 初始化：檢查是否已收藏
    starBtns.forEach(btn => {
        const sectionTitle = btn.parentElement.querySelector('h2').innerText;
        const savedBookmarks = JSON.parse(localStorage.getItem(USER_BOOKMARK_KEY)) || [];
        
        if (savedBookmarks.some(b => b.title === sectionTitle)) {
            btn.classList.add('starred');
            btn.innerHTML = '<i class="fa-solid fa-star"></i>';
        }

        btn.addEventListener('click', function() {
            const section = this.closest('.learning-section');
            const title = section.querySelector('h2').innerText;
            const contentHTML = section.innerHTML; 

            // 1. 讀取該使用者的舊資料
            let bookmarks = JSON.parse(localStorage.getItem(USER_BOOKMARK_KEY)) || [];

            if (this.classList.contains('starred')) {
                // --- 取消收藏邏輯 ---
                this.classList.remove('starred');
                this.innerHTML = '<i class="fa-regular fa-star"></i>';
                bookmarks = bookmarks.filter(b => b.title !== title);
            } else {
                // --- 加入收藏邏輯 ---
                this.classList.add('starred');
                this.innerHTML = '<i class="fa-solid fa-star"></i>';
                
                // ★ 修正點 1：必須把新內容 push 進去陣列
                bookmarks.push({ title: title, content: contentHTML });
            }

            // 2. ★ 修正點 2：統一存回該使用者的專屬 Key
            localStorage.setItem(USER_BOOKMARK_KEY, JSON.stringify(bookmarks));
            
            // 可選：console 檢查是否成功
            console.log(`儲存成功！目前 ${currentUser} 的收藏數：`, bookmarks.length);
        });
    });

    // --- 5. 手機版選單邏輯 ---
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const sidebar = document.querySelector('.sidebar');
    const contentArea = document.querySelector('.content-area');

    if(mobileBtn) {
        mobileBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // 防止點擊按鈕時觸發 document 的點擊事件
            sidebar.classList.toggle('show');
        });

        // 點擊內容區時，自動關閉側邊欄 (優化體驗)
        contentArea.addEventListener('click', () => {
            if(window.innerWidth <= 768 && sidebar.classList.contains('show')) {
                sidebar.classList.remove('show');
            }
        });
        
    }

    // 初始化介面狀態
    updateButtons();
    updateProgress();
});
// ... 原本代碼的最後一個 }); 之後 ...

// --- 全域登出函式 ---
function handleLogout() {
    if (confirm("確定要登出系統嗎？\n您的學習紀錄將會安全儲存。")) {
        // 清除 Session (登入狀態)
        sessionStorage.removeItem('ds_user');
        // 跳轉回登入頁
        window.location.href = 'login.html';
    }
}

