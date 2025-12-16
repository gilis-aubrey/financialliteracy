// 讓 Bootstrap 下拉選單在滑鼠移入時自動開啟
// 需搭配 Bootstrap 5

document.addEventListener('DOMContentLoaded', function () {
    var dropdowns = document.querySelectorAll('.navbar .dropdown');
    dropdowns.forEach(function (dropdown) {
        dropdown.addEventListener('mouseenter', function () {
            var menu = dropdown.querySelector('.dropdown-menu');
            var toggle = dropdown.querySelector('[data-bs-toggle="dropdown"]');
            if (menu && toggle) {
                var bsDropdown = bootstrap.Dropdown.getOrCreateInstance(toggle);
                bsDropdown.show();
            }
        });
        dropdown.addEventListener('mouseleave', function () {
            var menu = dropdown.querySelector('.dropdown-menu');
            var toggle = dropdown.querySelector('[data-bs-toggle="dropdown"]');
            if (menu && toggle) {
                var bsDropdown = bootstrap.Dropdown.getOrCreateInstance(toggle);
                bsDropdown.hide();
            }
        });
    });
});
