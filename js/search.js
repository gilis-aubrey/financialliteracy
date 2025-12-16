// search.js
// 全文檢索功能：搜尋所有 HTML 檔案內容，顯示結果於 search.html


// 取得所有 HTML 檔案（可手動維護或自動掃描）
const searchablePages = [
    { title: '首頁', url: 'index.html' },
    { title: '情境區', url: 'scenario.html' },
    { title: '理財觀念啟蒙區', url: 'why_finance.html' },
    { title: '通貨膨脹與複利效應', url: 'inflation_compound.html' },
    { title: '風險與退休保障', url: 'risk_retirement.html' },
    { title: '理財核心流程區', url: 'core_process.html' },
    { title: '儲蓄', url: 'saving.html' },
    { title: '為什麼要儲蓄？', url: 'why_save.html' },
    { title: '預算規劃與債務', url: 'budget_debt.html' },
    { title: '緊急預備金', url: 'emergency_fund.html' },
    { title: '信用卡', url: 'credit_card.html' },
    { title: '第三方支付', url: 'third_party_payment.html' },
    { title: '保險', url: 'insurance.html' },
    { title: '為什麼要保險？', url: 'why_insurance.html' },
    { title: '保險商品', url: 'insurance_products.html' },
    { title: '壽險', url: 'life_insurance.html' },
    { title: '意外險', url: 'accident_insurance.html' },
    { title: '醫療險', url: 'health_insurance.html' },
    { title: '投資型保險', url: 'investment_insurance.html' },
    { title: '投資', url: 'investment.html' },
    { title: '投資流派', url: 'investment_styles.html' },
    { title: '彼得林區', url: 'peter_lynch.html' },
    { title: '巴菲特', url: 'buffett.html' },
    { title: '投資前準備', url: 'account_opening.html' },
    { title: '投資商品', url: 'investment_products.html' },
    { title: '股票與ETF', url: 'stock_etf.html' },
    { title: '債券', url: 'bond.html' },
    { title: '基金', url: 'fund.html' },
    { title: '期貨與選擇權', url: 'futures_options.html' },
    { title: '外匯', url: 'forex.html' },
    { title: '貴金屬', url: 'precious_metal.html' },
    { title: '虛擬貨幣', url: 'crypto.html' },
    { title: '理財工具區', url: 'tools.html' },
    { title: '房貸月還款試算', url: 'tool_mortgage.html' },
    { title: '股票年化報酬率計算', url: 'tool_stock_return.html' },
    { title: '活儲/定存/股票/ETF 試算比較', url: 'tool_compare_interest.html' },
    { title: '會計工具', url: 'accounting_tool.html' },
    { title: '資產配置工具', url: 'asset_allocation_tool.html' },
    { title: '新聞', url: 'news.html' },
    { title: '社群討論區', url: 'forum.html' },
    { title: '知識架構與網站地圖', url: 'knowledge_structure.html' }
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
                html += `<div class="search-result-item"><a href="${page.url}" class="search-btn-link">${page.title}</a><div class="search-snippet">...${snippet}...</div></div>`;
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
// 搜尋結果連結按鈕樣式
const style = document.createElement('style');
style.innerHTML = `
.search-btn-link {
    display: inline-block;
    padding: 0.25em 0.9em;
    border: 1px solid #0d6efd;
    border-radius: 0.25rem;
    color: #0d6efd;
    background: #fff;
    text-decoration: none;
    font-size: 1em;
    margin-bottom: 2px;
    transition: background 0.15s, color 0.15s;
}
.search-btn-link:hover, .search-btn-link:focus {
    background: #0d6efd;
    color: #fff !important;
    text-decoration: none;
}
.search-btn-link:active {
    background: #0a58ca;
    color: #fff;
}`;
document.head.appendChild(style);

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
