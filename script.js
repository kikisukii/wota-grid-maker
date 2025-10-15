document.addEventListener('DOMContentLoaded', () => {
    // --- 元素获取部分 (无改动) ---
    const gridContainer = document.getElementById('grid-container');
    const modal = document.getElementById('modal');
    const closeBtn = document.querySelector('.close-btn');
    const imageInput = document.getElementById('image-input');
    const imageToCrop = document.getElementById('image-to-crop');
    const cropBtn = document.getElementById('crop-btn');
    const exportBtn = document.getElementById('export-btn');
    const captureArea = document.getElementById('capture-area');
    const creditFooterForImage = document.getElementById('credit-footer-for-image');
    const mainTitle = document.querySelector('#capture-area h1');

    if (!gridContainer || !modal || !exportBtn || !captureArea || !creditFooterForImage || !mainTitle) {
        console.error('错误：页面缺少必要的HTML元素！');
        return;
    }

    let currentCell = null;
    let cropper = null;

    // --- START: 新增功能 ---
    // 函数：从 localStorage 加载并显示已保存的图片
    function loadImagesFromStorage() {
        // 1. 从“记事本”中读取名为 'wotaGridData' 的记录
        const savedImages = JSON.parse(localStorage.getItem('wotaGridData'));

        // 2. 如果记录存在
        if (savedImages && Array.isArray(savedImages)) {
            const allImageElements = document.querySelectorAll('.cell-image');
            // 3. 遍历记录，并将图片数据显示到对应的格子里
            savedImages.forEach((dataUrl, index) => {
                if (dataUrl && allImageElements[index]) {
                    allImageElements[index].src = dataUrl;
                }
            });
        }
    }
    // --- END: 新增功能 ---


    // --- 事件监听器部分 ---
    gridContainer.addEventListener('click', (e) => {
        const cell = e.target.closest('.grid-cell');
        if (cell) {
            currentCell = cell;
            modal.style.display = 'flex';
            imageInput.value = '';
            if (cropper) {
                cropper.destroy();
                cropper = null;
                imageToCrop.src = '';
            }
        }
    });

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        if (cropper) { cropper.destroy(); cropper = null; }
    });

    imageInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const reader = new FileReader();
            reader.onload = (event) => {
                imageToCrop.src = event.target.result;
                if (cropper) { cropper.destroy(); }
                cropper = new Cropper(imageToCrop, {
                    aspectRatio: 1, viewMode: 1, background: false,
                });
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    });

    cropBtn.addEventListener('click', () => {
        if (cropper && currentCell) {
            const canvas = cropper.getCroppedCanvas({
                width: 500,
                height: 500,
                imageSmoothingQuality: 'high',
            });
            const imageDataUrl = canvas.toDataURL(); // 获取图片数据
            const imageElement = currentCell.querySelector('.cell-image');
            
            if (imageElement) {
                imageElement.src = imageDataUrl; // 显示图片

                // --- START: 新增功能 ---
                // 函数：将新图片保存到 localStorage
                function saveImageToStorage() {
                    // 1. 获取所有格子，并找到当前修改的是第几个
                    const allCells = Array.from(document.querySelectorAll('.grid-cell'));
                    const cellIndex = allCells.indexOf(currentCell);

                    // 2. 从“记事本”中读取旧的记录，如果不存在则创建一个新记录
                    let savedImages = JSON.parse(localStorage.getItem('wotaGridData')) || new Array(12).fill(null);
                    
                    // 3. 更新对应位置的图片数据
                    savedImages[cellIndex] = imageDataUrl;

                    // 4. 将更新后的完整记录写回“记事本”
                    localStorage.setItem('wotaGridData', JSON.stringify(savedImages));
                }
                saveImageToStorage(); // 执行保存
                // --- END: 新增功能 ---
            }

            modal.style.display = 'none';
            if (cropper) { cropper.destroy(); cropper = null; }
        }
    });

    exportBtn.addEventListener('click', () => {
        mainTitle.classList.add('for-canvas');
        creditFooterForImage.style.display = 'block';
        exportBtn.style.display = 'none';
        
        const scale = window.devicePixelRatio > 2 ? window.devicePixelRatio : 3;

        html2canvas(captureArea, {
            backgroundColor: '#ffffff',
            useCORS: true,
            scale: scale,
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = 'my-wota-life-final.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        }).catch(err => {
            console.error('生成图片失败:', err);
        }).finally(() => {
            mainTitle.classList.remove('for-canvas');
            creditFooterForImage.style.display = 'none';
            exportBtn.style.display = 'block';
        });
    });

    // --- 在网页加载完成后，立即执行一次“读取”功能 ---
    loadImagesFromStorage();
});