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

    // --- START: 这里是唯一的修改点 ---
    gridContainer.addEventListener('click', (e) => {
        const cell = e.target.closest('.grid-cell');
        if (cell) {
            currentCell = cell;

            // 每次打开弹窗前，都执行一次彻底的“清理”
            // 1. 销毁任何可能存在的旧裁剪器实例
            if (cropper) {
                cropper.destroy();
                cropper = null;
            }
            // 2. 清空上次的图片预览SRC，让图片框变回空白
            imageToCrop.src = '';
            // 3. 重置文件选择框，这样可以重复上传同一张图片
            imageInput.value = '';

            // 清理完毕后，再显示弹窗
            modal.style.display = 'flex';
        }
    });
    // --- END: 修改结束 ---


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
            const imageDataUrl = canvas.toDataURL();
            const imageElement = currentCell.querySelector('.cell-image');
            
            if (imageElement) {
                imageElement.src = imageDataUrl;

                function saveImageToStorage() {
                    const allCells = Array.from(document.querySelectorAll('.grid-cell'));
                    const cellIndex = allCells.indexOf(currentCell);
                    let savedImages = JSON.parse(localStorage.getItem('wotaGridData')) || new Array(12).fill(null);
                    savedImages[cellIndex] = imageDataUrl;
                    localStorage.setItem('wotaGridData', JSON.stringify(savedImages));
                }
                saveImageToStorage();
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

    loadImagesFromStorage();
});