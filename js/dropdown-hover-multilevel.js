// 支援多層下拉選單 hover 自動展開，含四層
// 需搭配 Bootstrap 5

document.addEventListener('DOMContentLoaded', function () {
        // 多層下拉選單防止超出螢幕（自動向左展開）
        function adjustSubmenuPosition(menu) {
            if (!menu) return;
            // 重置
            menu.classList.remove('dropdown-menu-end');
            menu.style.left = '';
            menu.style.right = '';
            // 取得子選單的邊界
            const rect = menu.getBoundingClientRect();
            const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
            // 若超出右側螢幕，則靠右展開
            if (rect.right > viewportWidth) {
                menu.classList.add('dropdown-menu-end');
            }
        }
    // 強制移除 Bootstrap 點擊展開的預設行為（桌面）
    document.querySelectorAll('.navbar .dropdown > [data-bs-toggle="dropdown"]').forEach(function(toggle) {
        toggle.onclick = function(e) {
            if (window.innerWidth > 991) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        };
    });
    // 手機：點擊展開/收合所有巢狀子選單（不限層級）
    if (window.innerWidth <= 991) {
        document.querySelectorAll('.has-submenu > a').forEach(function(link) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                var parent = link.parentElement;
                // 只展開/收合當前點擊的子選單
                parent.classList.toggle('open');
            });
        });
    }

    // 針對 hover 事件，確保展開
    document.querySelectorAll('.navbar .dropdown').forEach(function (dropdown) {
        dropdown.addEventListener('mouseenter', function () {
            const toggle = dropdown.querySelector(':scope > [data-bs-toggle="dropdown"]');
            const menu = dropdown.querySelector(':scope > .dropdown-menu');
            if (toggle && menu) {
                menu.classList.add('show');
                toggle.setAttribute('aria-expanded', 'true');
                // 展開所有父層 dropdown-menu
                let parent = dropdown.parentElement;
                while (parent && parent.classList) {
                    if (parent.classList.contains('dropdown-menu')) {
                        parent.classList.add('show');
                    }
                    parent = parent.parentElement;
                }
                // 調整子選單位置，避免超出螢幕
                adjustSubmenuPosition(menu);
            }
        });
        dropdown.addEventListener('mouseleave', function () {
            const toggle = dropdown.querySelector(':scope > [data-bs-toggle="dropdown"]');
            const menu = dropdown.querySelector(':scope > .dropdown-menu');
            if (toggle && menu) {
                menu.classList.remove('show');
                toggle.setAttribute('aria-expanded', 'false');
                // 關閉所有父層 dropdown-menu（只保留最上層）
                let parent = dropdown.parentElement;
                while (parent && parent.classList) {
                    if (parent.classList.contains('dropdown-menu')) {
                        parent.classList.remove('show');
                    }
                    parent = parent.parentElement;
                }
            }
        });
    });
    // 移除 Bootstrap 預設點擊展開事件，讓 hover 完全主導
    document.querySelectorAll('.navbar .dropdown > [data-bs-toggle="dropdown"]').forEach(function(toggle) {
        toggle.addEventListener('click', function(e) {
            if (window.innerWidth > 991) {
                e.preventDefault();
                e.stopPropagation();
            }
        });
    });
    // 遍歷所有 dropdown（含巢狀）
    document.querySelectorAll('.navbar .dropdown').forEach(function (dropdown) {
        dropdown.addEventListener('mouseenter', function () {
            const toggle = dropdown.querySelector(':scope > [data-bs-toggle="dropdown"]');
            const menu = dropdown.querySelector(':scope > .dropdown-menu');
            if (toggle && menu) {
                const bsDropdown = bootstrap.Dropdown.getOrCreateInstance(toggle);
                bsDropdown.show();
                menu.classList.add('show');
                // 展開所有父層 dropdown-menu
                let parent = dropdown.parentElement;
                while (parent && parent.classList) {
                    if (parent.classList.contains('dropdown-menu')) {
                        parent.classList.add('show');
                    }
                    parent = parent.parentElement;
                }
                // 調整子選單位置，避免超出螢幕
                adjustSubmenuPosition(menu);
            }
        });
        dropdown.addEventListener('mouseleave', function () {
            const toggle = dropdown.querySelector(':scope > [data-bs-toggle="dropdown"]');
            const menu = dropdown.querySelector(':scope > .dropdown-menu');
            if (toggle && menu) {
                const bsDropdown = bootstrap.Dropdown.getOrCreateInstance(toggle);
                bsDropdown.hide();
                menu.classList.remove('show');
                // 關閉所有父層 dropdown-menu（只保留最上層）
                let parent = dropdown.parentElement;
                while (parent && parent.classList) {
                    if (parent.classList.contains('dropdown-menu')) {
                        parent.classList.remove('show');
                    }
                    parent = parent.parentElement;
                }
            }
        });
    });
    // 防止點擊時自動關閉多層
    document.querySelectorAll('.dropdown-menu .dropdown-toggle').forEach(function (element) {
        element.addEventListener('click', function (e) {
            if (window.innerWidth > 991) {
                e.preventDefault();
                e.stopPropagation();
                const submenu = element.nextElementSibling;
                if (submenu && submenu.classList.contains('dropdown-menu')) {
                    submenu.classList.toggle('show');
                }
            }
        });
    });
});
