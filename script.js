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

    // --- 安全检查 ---
    if (!gridContainer || !modal || !exportBtn || !captureArea || !creditFooterForImage || !mainTitle) {
        console.error('错误：页面缺少必要的HTML元素！');
        alert('页面加载失败，请刷新重试！');
        return;
    }

    // --- 状态变量 ---
    let currentCell = null;
    let cropper = null;

    // --- 函数定义 ---
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
    
    function openModalForCell(cell) {
        currentCell = cell;
        if (cropper) {
            cropper.destroy();
            cropper = null;
        }
        imageToCrop.src = '';
        imageInput.value = '';
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

    imageInput.addEventListener('change', (e) => {
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
    });

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
        }
        closeModal();
    });

    exportBtn.addEventListener('click', () => {
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
    });

    // --- 初始加载 ---
    loadImagesFromStorage();
});