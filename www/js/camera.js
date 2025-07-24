// camera.js
function getPicture(sourceType, callback) {
  if (window.cordova && navigator.camera) {
    navigator.camera.getPicture(
      imageData => callback("data:image/jpeg;base64," + imageData),
      err => {
        alert("获取图片失败: " + err + "\n请检查App权限设置，确保已允许访问相机和存储。");
      },
      {
        quality: 70,
        destinationType: Camera.DestinationType.DATA_URL,
        sourceType: sourceType,
        encodingType: Camera.EncodingType.JPEG,
        mediaType: Camera.MediaType.PICTURE,
        targetWidth: 600,
        targetHeight: 600,
        correctOrientation: true
      }
    );
  } else {
    // 网页端 fallback
    let input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = e => {
      let file = e.target.files[0];
      if (!file) return;
      let reader = new FileReader();
      reader.onload = ev => {
        // 压缩图片（可选）
        let img = new window.Image();
        img.onload = function() {
          let canvas = document.createElement('canvas');
          let max = 600;
          let w = img.width;
          let h = img.height;
          if (w > h && w > max) { h = h * max / w; w = max; }
          else if (h > w && h > max) { w = w * max / h; h = max; }
          else if (w > max) { w = h = max; }
          canvas.width = w;
          canvas.height = h;
          let ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          callback(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    };
    input.click();
  }
}
