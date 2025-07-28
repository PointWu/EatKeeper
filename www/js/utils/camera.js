export async function getPhoto(sourceType = 'both') {
  return new Promise((resolve, reject) => {
    if (window.cordova && navigator.camera) {
      // 如果指定了来源类型，直接使用
      if (sourceType === 'camera') {
        takePhoto(resolve, reject);
      } else if (sourceType === 'gallery') {
        selectFromGallery(resolve, reject);
      } else {
        // 默认显示选择对话框
        showSourceDialog(resolve, reject);
      }
    } else {
      // 浏览器端 fallback
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return resolve("");
        const reader = new FileReader();
        reader.onload = (ev) => resolve(ev.target.result);
        reader.readAsDataURL(file);
      };
      input.click();
    }
  });
}

function takePhoto(resolve, reject) {
  navigator.camera.getPicture(
    (imageData) => {
      resolve("data:image/jpeg;base64," + imageData);
    },
    (err) => {
      reject(err);
    },
    {
      quality: 70,
      destinationType: window.Camera.DestinationType.DATA_URL,
      sourceType: window.Camera.PictureSourceType.CAMERA,
      encodingType: window.Camera.EncodingType.JPEG,
      mediaType: window.Camera.MediaType.PICTURE,
      allowEdit: false,
      targetWidth: 800,
      targetHeight: 800,
    }
  );
}

function selectFromGallery(resolve, reject) {
  navigator.camera.getPicture(
    (imageData) => {
      resolve("data:image/jpeg;base64," + imageData);
    },
    (err) => {
      reject(err);
    },
    {
      quality: 70,
      destinationType: window.Camera.DestinationType.DATA_URL,
      sourceType: window.Camera.PictureSourceType.PHOTOLIBRARY,
      encodingType: window.Camera.EncodingType.JPEG,
      mediaType: window.Camera.MediaType.PICTURE,
      allowEdit: false,
      targetWidth: 800,
      targetHeight: 800,
    }
  );
}

function showSourceDialog(resolve, reject) {
  // 创建选择对话框
  const dialog = document.createElement('div');
  dialog.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
  `;
  
  const content = document.createElement('div');
  content.style.cssText = `
    background: white;
    border-radius: 12px;
    padding: 20px;
    margin: 20px;
    text-align: center;
    max-width: 300px;
    width: 100%;
  `;
  
  content.innerHTML = `
    <h3 style="margin: 0 0 20px 0; color: #333;">选择图片来源</h3>
    <button id="camera-btn" style="
      display: block;
      width: 100%;
      padding: 12px;
      margin: 8px 0;
      background: #1976d2;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 16px;
      cursor: pointer;
    ">📷 拍照</button>
    <button id="gallery-btn" style="
      display: block;
      width: 100%;
      padding: 12px;
      margin: 8px 0;
      background: #4caf50;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 16px;
      cursor: pointer;
    ">🖼️ 从相册选择</button>
    <button id="cancel-btn" style="
      display: block;
      width: 100%;
      padding: 12px;
      margin: 8px 0;
      background: #f5f5f5;
      color: #666;
      border: none;
      border-radius: 6px;
      font-size: 16px;
      cursor: pointer;
    ">取消</button>
  `;
  
  dialog.appendChild(content);
  document.body.appendChild(dialog);
  
  // 绑定事件
  document.getElementById('camera-btn').onclick = () => {
    document.body.removeChild(dialog);
    takePhoto(resolve, reject);
  };
  
  document.getElementById('gallery-btn').onclick = () => {
    document.body.removeChild(dialog);
    selectFromGallery(resolve, reject);
  };
  
  document.getElementById('cancel-btn').onclick = () => {
    document.body.removeChild(dialog);
    resolve("");
  };
  
  // 点击背景关闭
  dialog.onclick = (e) => {
    if (e.target === dialog) {
      document.body.removeChild(dialog);
      resolve("");
    }
  };
} 