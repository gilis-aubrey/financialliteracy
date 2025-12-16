// search.js
// 全文檢索功能：搜尋所有 HTML 檔案內容，顯示結果於 search.html


// 取得所有 HTML 檔案（可手動維護或自動掃描）
const searchablePages = [
    { title: '首頁', url: 'index.html' },
    { title: '為何要理財？', url: 'why_finance.html' },
    { title: '社群討論區', url: 'forum.html' }
];

// 讀取單一頁面內容
async function fetchPageText(url) {
    try {
        const res = await fetch(url);
        if (!res.ok) return '';
        const html = await res.text();
        // 移除 script/style 標籤內容
        return html.replace(/<script[\s\S]*?<\/script>/gi, '')
                   .replace(/<style[\s\S]*?<\/style>/gi, '')
                   .replace(/<[^>]+>/g, ' ')
                   .replace(/\s+/g, ' ');
    } catch {
        return '';
    }
}

// 快取所有頁面內容
let pageCache = {};
async function preloadPages() {
    for (const page of searchablePages) {
        pageCache[page.url] = await fetchPageText(page.url);
    }
}

// 即時搜尋顯示於 header 下方
function setupLiveSearch() {
            // 3. 討論區首頁板塊名稱與描述搜尋
            try {
                if (window.BOARDS && Array.isArray(window.BOARDS)) {
                    for (const board of window.BOARDS) {
                        if (
                            board.name.toLowerCase().includes(query.toLowerCase()) ||
                            (board.desc && board.desc.toLowerCase().includes(query.toLowerCase()))
                        ) {
                            found = true;
                            let snippet = '';
                            if (board.desc && board.desc.toLowerCase().includes(query.toLowerCase())) {
                                const idx = board.desc.toLowerCase().indexOf(query.toLowerCase());
                                const start = Math.max(0, idx - 20);
                                const end = Math.min(board.desc.length, idx + query.length + 20);
                                snippet = `<div class=\"search-snippet\">...${board.desc.substring(start, end).replace(new RegExp(query, 'gi'), m => `<mark>${m}</mark>`)}...</div>`;
                            }
                            html += `<div class=\"search-result-item\"><a href=\"forum.html\">[討論區板塊] ${board.name}</a>${snippet}</div>`;
                        }
                    }
                }
            } catch(e) {}
    const form = document.querySelector('.search-form-inside');
    const input = form ? form.querySelector('input[type="search"], input[type="text"]') : null;
    const resultsDiv = document.getElementById('search-live-results');
    if (!form || !input || !resultsDiv) return;

    input.addEventListener('input', function() {
        const query = input.value.trim();
        if (!query) {
            resultsDiv.innerHTML = '';
            resultsDiv.classList.remove('active');
            return;
        }
        let found = false;
        let html = '';
        // 1. 靜態頁面搜尋
        for (const page of searchablePages) {
            const text = pageCache[page.url] || '';
            if (text.toLowerCase().includes(query.toLowerCase())) {
                found = true;
                const idx = text.toLowerCase().indexOf(query.toLowerCase());
                const start = Math.max(0, idx - 30);
                const end = Math.min(text.length, idx + query.length + 30);
                const snippet = text.substring(start, end).replace(new RegExp(query, 'gi'), m => `<mark>${m}</mark>`);
                html += `<div class="search-result-item"><a href="${page.url}">${page.title}</a><div class="search-snippet">...${snippet}...</div></div>`;
            }
        }
        // 2. 討論區 localStorage 搜尋
        try {
            const boards = JSON.parse(localStorage.getItem('forumBoards'));
            if (boards && Array.isArray(boards)) {
                for (const board of boards) {
                    for (const topic of board.topics) {
                        // 主題標題/作者/內容
                        if (
                            topic.title.toLowerCase().includes(query.toLowerCase()) ||
                            (topic.author && topic.author.toLowerCase().includes(query.toLowerCase())) ||
                            (topic.content && topic.content.toLowerCase().includes(query.toLowerCase()))
                        ) {
                            found = true;
                            let snippet = '';
                            if (topic.content && topic.content.toLowerCase().includes(query.toLowerCase())) {
                                const idx = topic.content.toLowerCase().indexOf(query.toLowerCase());
                                const start = Math.max(0, idx - 20);
                                const end = Math.min(topic.content.length, idx + query.length + 20);
                                snippet = `<div class="search-snippet">...${topic.content.substring(start, end).replace(new RegExp(query, 'gi'), m => `<mark>${m}</mark>`)}...</div>`;
                            }
                            html += `<div class="search-result-item"><a href="forum.html" onclick="localStorage.setItem('forumSearchJump','${board.id},${topic.id}');">[${board.name}] ${topic.title}</a><div class="search-snippet">作者：${topic.author}｜${topic.createdAt}</div>${snippet}</div>`;
                        }
                        // 回應內容/作者
                        for (const reply of topic.replies) {
                            if (
                                reply.content.toLowerCase().includes(query.toLowerCase()) ||
                                (reply.author && reply.author.toLowerCase().includes(query.toLowerCase()))
                            ) {
                                found = true;
                                html += `<div class="search-result-item"><a href="forum.html" onclick="localStorage.setItem('forumSearchJump','${board.id},${topic.id}');">[${board.name}] ${topic.title}</a><div class="search-snippet">回應：${reply.author}｜${reply.createdAt}<br>${reply.content.replace(new RegExp(query, 'gi'), m => `<mark>${m}</mark>`)}</div></div>`;
                            }
                        }
                    }
                }
            }
        } catch(e) {}
        if (!found) {
            html = '<div class="search-result-item">查無相關內容。</div>';
        }
        resultsDiv.innerHTML = html;
        resultsDiv.classList.add('active');
    });
// 若由搜尋點擊跳轉，進入 forum.html 自動展開對應主題
if (window.location.pathname.endsWith('forum.html')) {
    window.addEventListener('DOMContentLoaded', function() {
        const jump = localStorage.getItem('forumSearchJump');
        if (jump) {
            const [boardId, topicId] = jump.split(',').map(Number);
            if (boardId && topicId && window.enterBoard && window.viewTopic) {
                setTimeout(() => {
                    window.enterBoard(boardId);
                    setTimeout(() => window.viewTopic(boardId, topicId), 400);
                }, 400);
            }
            localStorage.removeItem('forumSearchJump');
        }
    });
}

    // 點擊外部時隱藏
    document.addEventListener('click', function(e) {
        if (!resultsDiv.contains(e.target) && !form.contains(e.target)) {
            resultsDiv.classList.remove('active');
        }
    });
    // 聚焦時顯示
    input.addEventListener('focus', function() {
        if (resultsDiv.innerHTML) resultsDiv.classList.add('active');
    });
}

window.addEventListener('DOMContentLoaded', async () => {
    await preloadPages();
    setupLiveSearch();
});
