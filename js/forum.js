// forum.js
// 模擬討論主題與回應資料產生、渲染與新增功能

const TOPIC_COUNT = 300;
const REPLIES_PER_TOPIC = 2 + Math.floor(Math.random() * 4); // 每主題2~5則回應

// 產生隨機主題與回應
function generateMockForumData() {
    const topics = [];
    for (let i = 1; i <= TOPIC_COUNT; i++) {
        const topic = {
            id: i,
            title: `模擬主題 #${i}`,
            content: `這是模擬主題 #${i} 的內容，歡迎討論！`,
            createdAt: randomDate(),
            replies: []
        };
        const replyCount = REPLIES_PER_TOPIC + Math.floor(Math.random() * 3);
        for (let j = 1; j <= replyCount; j++) {
            topic.replies.push({
                id: j,
                content: `這是針對主題 #${i} 的回應 ${j}`,
                createdAt: randomDate()
            });
        }
        topics.push(topic);
    }
    return topics;
}

function randomDate() {
    const start = new Date(2025, 0, 1).getTime();
    const end = new Date().getTime();
    return new Date(start + Math.random() * (end - start)).toLocaleString();
}

// 儲存於 localStorage，否則每次刷新都重置
function getForumData() {
    let data = localStorage.getItem('forumTopics');
    if (!data) {
        data = generateMockForumData();
        localStorage.setItem('forumTopics', JSON.stringify(data));
    } else {
        data = JSON.parse(data);
    }
    return data;
}

function saveForumData(data) {
    localStorage.setItem('forumTopics', JSON.stringify(data));
}

// 渲染主題列表
// forum.js
// 討論區新版：常用討論區樣式（板塊/主題/回覆/分頁/發文彈窗）

const BOARDS = [
    { id: 1, name: '理財新手區', desc: '新手入門、理財觀念、常見問題' },
    { id: 2, name: '投資理財討論', desc: '投資工具、理財策略、經驗分享' },
    { id: 3, name: '保險與保障', desc: '保險規劃、保單討論、理賠經驗' },
    { id: 4, name: '生活消費', desc: '消費省錢、信用卡、日常理財' },
    { id: 5, name: '自由討論', desc: '閒聊、站務、其他話題' }
];

const TOPICS_PER_PAGE = 15;

function randomDate() {
    const start = new Date(2025, 0, 1).getTime();
    const end = new Date().getTime();
    return new Date(start + Math.random() * (end - start)).toLocaleString();
}

function generateMockForumDataV2() {
    // 產生 333 筆主題，分散於 5 個板塊，日期為過去二個月內
    const boards = BOARDS.map(board => ({ ...board, topics: [] }));
    const now = new Date();
    const msInDay = 24*60*60*1000;
    const totalTopics = 333;
    let topicId = 1;
    for (let i = 0; i < totalTopics; i++) {
        // 隨機分配到板塊
        const boardIdx = Math.floor(Math.random() * boards.length);
        // 隨機日期（過去 60 天內）
        const daysAgo = Math.floor(Math.random() * 60);
        const topicDate = new Date(now.getTime() - daysAgo * msInDay);
        // 隨機主題標題與內容
        const title = `【${boards[boardIdx].name}】主題討論 #${topicId}`;
        const content = `${boards[boardIdx].name}主題內容範例 #${topicId}`;
        // 隨機作者
        const author = `用戶${100 + Math.floor(Math.random()*900)}`;
        // 隨機回應數 1~6
        const replyCount = 1 + Math.floor(Math.random()*6);
        const replies = [];
        for (let r = 1; r <= replyCount; r++) {
            const replyDaysAgo = daysAgo - Math.floor(Math.random()*3);
            const replyDate = new Date(now.getTime() - Math.max(0,replyDaysAgo) * msInDay);
            replies.push({
                id: r,
                author: `用戶${100 + Math.floor(Math.random()*900)}`,
                content: `${boards[boardIdx].name}回應內容 #${topicId}-${r}`,
                createdAt: replyDate.toLocaleString()
            });
        }
        boards[boardIdx].topics.push({
            id: topicId++,
            title,
            author,
            createdAt: topicDate.toLocaleString(),
            replies,
            boardId: boards[boardIdx].id,
            content
        });
    }
    // 各板塊主題依日期降冪排序
    for (const board of boards) {
        board.topics.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return boards;
}

function getForumDataV2() {
    // 每次都產生 333 筆資料，分散於各板塊，日期為過去二個月
    let data = generateMockForumDataV2();
    for (const board of data) {
        board.topics.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    localStorage.setItem('forumBoards', JSON.stringify(data));
    return data;
}

function saveForumDataV2(data) {
    localStorage.setItem('forumBoards', JSON.stringify(data));
}

function renderBoards() {
    const boards = getForumDataV2();
    const container = document.getElementById('forum-main');
    container.innerHTML = `<div class="row g-4">
        ${boards.map(board => `
        <div class="col-md-6 col-lg-4">
            <div class="card h-100 shadow-sm">
                <div class="card-body">
                    <h5 class="card-title mb-2">${board.name}</h5>
                    <div class="card-text mb-2 text-muted" style="font-size:0.98em;">${board.desc}</div>
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="badge bg-primary">${board.topics.length} 主題</span>
                        <button class="btn btn-sm btn-outline-primary" onclick="enterBoard(${board.id})">進入</button>
                    </div>
                </div>
            </div>
        </div>
        `).join('')}
    </div>`;
}

window.enterBoard = function(boardId, page=1) {
    const boards = getForumDataV2();
    const board = boards.find(b => b.id === boardId);
    const container = document.getElementById('forum-main');
    const start = (page-1)*TOPICS_PER_PAGE;
    const end = start+TOPICS_PER_PAGE;
    const topics = board.topics.slice().reverse().slice(start, end);
    container.innerHTML = `
        <div class="mb-3">
            <button class="btn btn-link" onclick="renderBoards()">← 返回討論區列表</button>
            <h3 class="d-inline ms-2">${board.name}</h3>
            <span class="text-muted ms-2" style="font-size:0.98em;">${board.desc}</span>
            <button class="btn btn-sm btn-success float-end" onclick="showNewTopicModal(${board.id})">發表新主題</button>
        </div>
        <div class="table-responsive">
            <table class="table table-hover align-middle">
                <thead class="table-light">
                    <tr><th style="width:45%">主題</th><th style="width:15%">作者</th><th style="width:20%">發表時間</th><th style="width:10%">回應</th><th style="width:10%">操作</th></tr>
                </thead>
                <tbody>
                    ${topics.map(topic => `
                        <tr>
                            <td><a href="#" onclick="viewTopic(${board.id},${topic.id});return false;">${topic.title}</a></td>
                            <td>${topic.author}</td>
                            <td><span class="text-muted" style="font-size:0.97em;">${topic.createdAt}</span></td>
                            <td>${topic.replies.length}</td>
                            <td><button class="btn btn-sm btn-outline-primary" onclick="viewTopic(${board.id},${topic.id})">查看</button></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        <nav>
            <ul class="pagination justify-content-center">
                ${Array.from({length: Math.ceil(board.topics.length/TOPICS_PER_PAGE)}, (_,i) =>
                    `<li class="page-item${i+1===page?' active':''}"><a class="page-link" href="#" onclick="enterBoard(${board.id},${i+1});return false;">${i+1}</a></li>`
                ).join('')}
            </ul>
        </nav>
    `;
}

window.viewTopic = function(boardId, topicId) {
    const boards = getForumDataV2();
    const board = boards.find(b => b.id === boardId);
    const topic = board.topics.find(t => t.id === topicId);
    const container = document.getElementById('forum-main');
    container.innerHTML = `
        <div class="mb-3">
            <button class="btn btn-link" onclick="enterBoard(${boardId})">← 返回${board.name}</button>
            <h4 class="d-inline ms-2">${topic.title}</h4>
            <span class="text-muted ms-2" style="font-size:0.97em;">by ${topic.author}｜${topic.createdAt}</span>
        </div>
        <div class="card mb-3"><div class="card-body">${topic.replies.length?topic.replies[0].content:'（無內容）'}</div></div>
        <div class="mb-2"><strong>全部回應（${topic.replies.length}）</strong></div>
        <div class="mb-3" id="replies-list">
            ${topic.replies.map(r=>
                `<div class='border-bottom py-2'><span class='text-muted' style='font-size:0.92em;'>${r.author}｜${r.createdAt}</span><br>${r.content}</div>`
            ).join('')}
        </div>
        <form class="reply-form" onsubmit="return addReplyV2(event,${boardId},${topicId})">
            <div class="input-group">
                <input type="text" class="form-control" placeholder="新增回應..." required>
                <button class="btn btn-outline-secondary" type="submit">送出</button>
            </div>
        </form>
    `;
}

window.addReplyV2 = function(e, boardId, topicId) {
    e.preventDefault();
    const input = e.target.querySelector('input');
    const content = input.value.trim();
    if (!content) return false;
    const boards = getForumDataV2();
    const board = boards.find(b => b.id === boardId);
    const topic = board.topics.find(t => t.id === topicId);
    topic.replies.push({
        id: topic.replies.length ? topic.replies[topic.replies.length-1].id + 1 : 1,
        author: '你',
        content,
        createdAt: new Date().toLocaleString()
    });
    saveForumDataV2(boards);
    window.viewTopic(boardId, topicId);
    return false;
}

window.showNewTopicModal = function(boardId) {
    const modal = document.createElement('div');
    modal.className = 'modal fade show';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">發表新主題</h5>
                    <button type="button" class="btn-close" onclick="closeModal(this)"></button>
                </div>
                <form onsubmit="return submitNewTopic(event,${boardId})">
                    <div class="modal-body">
                        <input type="text" class="form-control mb-2" placeholder="主題標題" required>
                        <textarea class="form-control" rows="4" placeholder="內容" required></textarea>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" onclick="closeModal(this)">取消</button>
                        <button type="submit" class="btn btn-primary">發表</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.querySelector('input').focus();
    modal.addEventListener('click', e => {
        if (e.target === modal) closeModal(modal);
    });
}
window.closeModal = function(btn) {
    const modal = btn.closest('.modal');
    if (modal) modal.remove();
}
window.submitNewTopic = function(e, boardId) {
    e.preventDefault();
    const [titleInput, contentInput] = e.target.querySelectorAll('input,textarea');
    const title = titleInput.value.trim();
    const content = contentInput.value.trim();
    if (!title || !content) return false;
    const boards = getForumDataV2();
    const board = boards.find(b => b.id === boardId);
    board.topics.push({
        id: board.topics.length ? board.topics[board.topics.length-1].id + 1 : 1,
        title,
        author: '你',
        createdAt: new Date().toLocaleString(),
        replies: [],
        boardId
    });
    saveForumDataV2(boards);
    closeModal(e.target);
    window.enterBoard(boardId, 1);
    return false;
}

window.addEventListener('DOMContentLoaded', renderBoards);
