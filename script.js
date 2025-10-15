document.addEventListener('DOMContentLoaded', () => {
    // --- 元素获取 ---
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
    // 新增：获取“使用上次图片”的按钮
    const useLastImageBtn = document.getElementById('use-last-image-btn');

    // --- 安全检查 ---
    if (!gridContainer || !modal || !useLastImageBtn || !exportBtn || !captureArea || !creditFooterForImage || !mainTitle) {
        console.error('错误：页面缺少必要的HTML元素！');
        alert('页面加载失败，请刷新重试！');
        return;
    }

    // --- 状态变量 ---
    let currentCell = null;
    let cropper = null;
    // 新增：用于“记忆”上次裁剪好的图片数据
    let lastCroppedImageDataUrl = null;

    // --- 函数定义 ---
    function loadImagesFromStorage() { /* ...无改动... */ }
    function saveImageToStorage(imageDataUrl, cell) { /* ...无改ado... */ }
    
    function openModalForCell(cell) {
        currentCell = cell;
        if (cropper) {
            cropper.destroy();
            cropper = null;
        }
        imageToCrop.src = '';
        imageInput.value = '';

        // 新增：检查是否存在“上次的图片”，如果存在，就显示按钮
        if (lastCroppedImageDataUrl) {
            useLastImageBtn.style.display = 'block';
        } else {
            useLastImageBtn.style.display = 'none';
        }

        modal.style.display = 'flex';
    }

    function closeModal() {
        modal.style.display = 'none';
    }

    // --- 事件绑定 ---
    gridContainer.addEventListener('click', (e) => {
        const cell = e.target.closest('.grid-cell');
        if (cell) {
            openModalForCell(cell);
        }
    });

    closeBtn.addEventListener('click', closeModal);

    imageInput.addEventListener('change', (e) => { /* ...无改动... */ });

    cropBtn.addEventListener('click', () => {
        if (!cropper || !currentCell) return;

        const canvas = cropper.getCroppedCanvas({
            width: 500, height: 500, imageSmoothingQuality: 'high',
        });
        const imageDataUrl = canvas.toDataURL();
        const imageElement = currentCell.querySelector('.cell-image');
        
        if (imageElement) {
            imageElement.src = imageDataUrl;
            saveImageToStorage(imageDataUrl, currentCell);

            // 新增：成功裁剪后，将图片数据存入“记忆区”
            lastCroppedImageDataUrl = imageDataUrl;
        }
        closeModal();
    });

    // 新增：“使用上次图片”按钮的点击事件
    useLastImageBtn.addEventListener('click', () => {
        if (!lastCroppedImageDataUrl || !currentCell) return;

        const imageElement = currentCell.querySelector('.cell-image');
        if (imageElement) {
            // 直接使用“记忆”中的图片数据
            imageElement.src = lastCroppedImageDataUrl;
            saveImageToStorage(lastCroppedImageDataUrl, currentCell);
        }
        closeModal();
    });

    exportBtn.addEventListener('click', () => { /* ...无改动... */ });

    // --- 初始加载 ---
    loadImagesFromStorage();

    // 复制粘贴进来的函数，保持不变
    function loadImagesFromStorage() {
        const savedImages = JSON.parse(localStorage.getItem('wotaGridData'));
        if (savedImages && Array.isArray(savedImages)) {
            const allImageElements = document.querySelectorAll('.cell-image');
            savedImages.forEach((dataUrl, index) => {
                if (dataUrl && allImageElements[index]) {
                    allImageElements[index].src = dataUrl;
                }
            });
        }
    }
    function saveImageToStorage(imageDataUrl, cell) {
        const allCells = Array.from(document.querySelectorAll('.grid-cell'));
        const cellIndex = allCells.indexOf(cell);
        if (cellIndex === -1) return;
        let savedImages = JSON.parse(localStorage.getItem('wotaGridData')) || new Array(12).fill(null);
        savedImages[cellIndex] = imageDataUrl;
        localStorage.setItem('wotaGridData', JSON.stringify(savedImages));
    }
    function imageInputChangeListener(e) {
        if (e.target.files && e.target.files.length > 0) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (cropper) { cropper.destroy(); }
                imageToCrop.src = event.target.result;
                cropper = new Cropper(imageToCrop, {
                    aspectRatio: 1, viewMode: 1, background: false,
                });
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    }
    imageInput.addEventListener('change', imageInputChangeListener);
    function exportBtnClickListener() {
        exportBtn.style.display = 'none';
        creditFooterForImage.style.display = 'block';
        mainTitle.classList.add('for-canvas');
        const scale = window.devicePixelRatio > 2 ? window.devicePixelRatio : 3;
        html2canvas(captureArea, {
            backgroundColor: '#ffffff', useCORS: true, scale: scale,
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = 'my-wota-life-final.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        }).catch(err => {
            console.error('生成图片失败:', err);
        }).finally(() => {
            exportBtn.style.display = 'block';
            creditFooterForImage.style.display = 'none';
            mainTitle.classList.remove('for-canvas');
        });
    }
    exportBtn.addEventListener('click', exportBtnClickListener);
});