// app.js
let selectedDate = new Date().toISOString().slice(0, 10);
let currentImage = "";

function requestCameraPermissions(callback) {
  if (window.cordova && cordova.plugins && cordova.plugins.permissions) {
    var permissions = cordova.plugins.permissions;
    permissions.checkPermission(permissions.CAMERA, function(status) {
      if (!status.hasPermission) {
        permissions.requestPermissions(
          [
            permissions.CAMERA,
            permissions.READ_EXTERNAL_STORAGE,
            permissions.WRITE_EXTERNAL_STORAGE
          ],
          function(status) {
            if (status.hasPermission) {
              callback && callback(true);
            } else {
              alert('请在系统设置中授权相机和存储权限，否则无法使用拍照和相册功能。');
              callback && callback(false);
            }
          },
          function() {
            alert('权限请求失败，请在系统设置中授权相机和存储权限。');
            callback && callback(false);
          }
        );
      } else {
        callback && callback(true);
      }
    }, function() {
      alert('权限检测失败');
      callback && callback(false);
    });
  } else {
    callback && callback(true); // 浏览器环境直接通过
  }
}

function appInit() {
  requestCameraPermissions(function(granted) {
    if (!granted) return;
    initDB().then(() => {
      renderCalendar();
      loadRecords(selectedDate);

      document.getElementById('add-btn').onclick = () => openRecordModal();
      document.getElementById('recordForm').onsubmit = saveRecord;
      document.getElementById('takePhotoBtn').onclick = () => {
        if (window.cordova && navigator.camera) {
          getPicture(Camera.PictureSourceType.CAMERA, setImage);
        } else {
          alert('摄像头功能不可用，请检查App权限和插件安装。');
        }
      };
      document.getElementById('choosePhotoBtn').onclick = () => {
        if (window.cordova && navigator.camera) {
          getPicture(Camera.PictureSourceType.PHOTOLIBRARY, setImage);
        } else {
          alert('相册功能不可用，请检查App权限和插件安装。');
        }
      };
    });
  });
}

// 兼容 Cordova 和 浏览器
if (window.cordova) {
  document.addEventListener('deviceready', appInit, false);
} else {
  document.addEventListener('DOMContentLoaded', appInit, false);
}

function renderCalendar() {
  // 简单日历（可用第三方库如 flatpickr）
  let html = `<input type="date" class="form-control" value="${selectedDate}" id="calendarInput">`;
  document.getElementById('calendar-view').innerHTML = html;
  document.getElementById('calendarInput').onchange = e => {
    selectedDate = e.target.value;
    loadRecords(selectedDate);
  };
}

function loadRecords(date) {
  getRecordsByDate(date).then(records => {
    let html = '';
    if (records.length === 0) {
      html = '<div class="alert alert-info">今天暂无记录</div>';
    } else {
      html = records.map(r => `
        <div class="card mb-2">
          <div class="card-body">
            <div class="d-flex align-items-center">
              ${r.image ? `<img src="${r.image}" class="rounded me-2" style="width:60px;height:60px;object-fit:cover;">` : ''}
              <div class="flex-grow-1">
                <h5 class="card-title mb-1">${r.foodName} <span class="badge bg-secondary">${r.mealType}</span></h5>
                <div class="text-muted small">${r.mealTime ? r.mealTime.slice(11,16) : ''}</div>
                <div class="text-muted">${r.note || ''}</div>
              </div>
              <button class="btn btn-sm btn-outline-primary me-1" onclick="editRecord(${r.id})">编辑</button>
              <button class="btn btn-sm btn-outline-danger" onclick="deleteRecordConfirm(${r.id})">删除</button>
            </div>
          </div>
        </div>
      `).join('');
    }
    document.getElementById('records-list').innerHTML = html;
  });
}

let editingRecordId = null;

function editRecord(id) {
  getRecordsByDate(selectedDate).then(records => {
    const record = records.find(r => r.id === id);
    if (!record) return;
    editingRecordId = id;
    document.getElementById('mealType').value = record.mealType;
    document.getElementById('foodName').value = record.foodName;
    document.getElementById('mealTime').value = record.mealTime ? record.mealTime.slice(0, 16) : '';
    document.getElementById('note').value = record.note || '';
    currentImage = record.image || '';
    let img = document.getElementById('previewImg');
    if (currentImage) {
      img.src = currentImage;
      img.classList.remove('d-none');
    } else {
      img.classList.add('d-none');
    }
    new bootstrap.Modal(document.getElementById('recordModal')).show();
  });
}

function deleteRecordConfirm(id) {
  if (confirm('确定要删除这条记录吗？')) {
    deleteRecord(id).then(() => {
      loadRecords(selectedDate);
    });
  }
}

function openRecordModal() {
  editingRecordId = null;
  currentImage = "";
  document.getElementById('recordForm').reset();
  document.getElementById('previewImg').classList.add('d-none');
  new bootstrap.Modal(document.getElementById('recordModal')).show();
}

function setImage(imgData) {
  currentImage = imgData;
  let img = document.getElementById('previewImg');
  img.src = imgData;
  img.classList.remove('d-none');
}

async function saveRecord(e) {
  e.preventDefault();
  let mealType = document.getElementById('mealType').value;
  let foodName = document.getElementById('foodName').value;
  let mealTime = document.getElementById('mealTime').value || new Date().toISOString();
  let note = document.getElementById('note').value;
  let date = (mealTime || new Date().toISOString()).slice(0, 10);

  if (editingRecordId) {
    await updateRecord({ id: editingRecordId, date, mealType, foodName, mealTime, note, image: currentImage });
    editingRecordId = null;
  } else {
    await addRecord({ date, mealType, foodName, mealTime, note, image: currentImage });
  }
  bootstrap.Modal.getInstance(document.getElementById('recordModal')).hide();
  loadRecords(selectedDate);
}
