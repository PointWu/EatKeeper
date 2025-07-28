import React, { useState, useEffect } from "react";
import {
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Button, 
  TextField, 
  MenuItem, 
  InputAdornment, 
  IconButton,
  Box,
  Typography,
  Chip,
  Menu,
  MenuItem as MuiMenuItem
} from "@mui/material";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import CameraAlt from "@mui/icons-material/CameraAlt";
import Image from "@mui/icons-material/Image";
import { getPhoto } from "../utils/camera";

const mealTypes = [
  { value: "breakfast", label: "早餐", color: "#FF9800" },
  { value: "lunch", label: "午餐", color: "#4CAF50" },
  { value: "dinner", label: "晚餐", color: "#2196F3" },
  { value: "snack", label: "零食", color: "#9C27B0" },
  { value: "drink", label: "饮品", color: "#00BCD4" },
];

export default function FoodForm({ open, onClose, onSubmit, defaultDate, editingFood }) {
  const [form, setForm] = useState({
    mealType: "breakfast",
    name: "",
    time: new Date().toLocaleTimeString().slice(0, 5),
    note: "",
    image: "",
    date: defaultDate.toISOString().slice(0, 10),
  });
  const [imageMenuAnchor, setImageMenuAnchor] = useState(null);

  // 当编辑食物时，填充表单数据
  useEffect(() => {
    if (editingFood) {
      setForm({
        mealType: editingFood.mealType,
        name: editingFood.name,
        time: editingFood.time,
        note: editingFood.note || "",
        image: editingFood.image || "",
        date: editingFood.date,
      });
    } else {
      // 重置表单
      setForm({
        mealType: "breakfast",
        name: "",
        time: new Date().toLocaleTimeString().slice(0, 5),
        note: "",
        image: "",
        date: defaultDate.toISOString().slice(0, 10),
      });
    }
  }, [editingFood, defaultDate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePhoto = async (sourceType = 'both') => {
    try {
      const img = await getPhoto(sourceType);
      if (img) setForm({ ...form, image: img });
    } catch (error) {
      console.error('拍照失败:', error);
    }
  };

  const handleImageMenuOpen = (event) => {
    setImageMenuAnchor(event.currentTarget);
  };

  const handleImageMenuClose = () => {
    setImageMenuAnchor(null);
  };

  const handleSubmit = () => {
    if (!form.name.trim()) {
      alert('请输入食物名称');
      return;
    }
    onSubmit(form);
    setForm({
      mealType: "breakfast",
      name: "",
      time: new Date().toLocaleTimeString().slice(0, 5),
      note: "",
      image: "",
      date: defaultDate.toISOString().slice(0, 10),
    });
  };

  const selectedMealType = mealTypes.find(type => type.value === form.mealType);

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth 
      maxWidth="sm"
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {editingFood ? '编辑饮食记录' : '添加饮食记录'}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            选择餐别
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {mealTypes.map((type) => (
              <Chip
                key={type.value}
                label={type.label}
                onClick={() => setForm({ ...form, mealType: type.value })}
                sx={{
                  backgroundColor: form.mealType === type.value ? type.color : 'transparent',
                  color: form.mealType === type.value ? 'white' : 'text.primary',
                  border: `1px solid ${type.color}`,
                  '&:hover': {
                    backgroundColor: type.color,
                    color: 'white'
                  }
                }}
              />
            ))}
          </Box>
        </Box>

        <TextField
          fullWidth 
          margin="normal" 
          label="食物名称 *" 
          name="name"
          value={form.name} 
          onChange={handleChange}
          variant="outlined"
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth 
          margin="normal" 
          label="时间" 
          name="time"
          value={form.time} 
          onChange={handleChange} 
          type="time"
          InputLabelProps={{ shrink: true }}
          variant="outlined"
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth 
          margin="normal" 
          label="备注（可选）" 
          name="note"
          value={form.note} 
          onChange={handleChange}
          multiline
          rows={2}
          variant="outlined"
          sx={{ mb: 2 }}
        />

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            添加图片（可选）
          </Typography>
          <Box sx={{ 
            border: '2px dashed #ddd', 
            borderRadius: 2, 
            p: 2, 
            textAlign: 'center',
            cursor: 'pointer',
            '&:hover': {
              borderColor: 'primary.main',
              backgroundColor: 'action.hover'
            }
          }} onClick={handleImageMenuOpen}>
            {form.image ? (
              <Box>
                <img 
                  src={form.image} 
                  alt="food" 
                  style={{ 
                    width: '100%', 
                    maxHeight: 200, 
                    borderRadius: 8,
                    objectFit: 'cover'
                  }} 
                />
                <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                  点击重新选择
                </Typography>
              </Box>
            ) : (
              <Box>
                <PhotoCamera sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  点击添加图片
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button onClick={onClose} variant="outlined">
          取消
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={!form.name.trim()}
          sx={{ 
            minWidth: 80,
            backgroundColor: selectedMealType?.color,
            '&:hover': {
              backgroundColor: selectedMealType?.color,
              opacity: 0.8
            }
          }}
        >
          {editingFood ? '更新' : '保存'}
        </Button>
      </DialogActions>

      {/* 图片选择菜单 */}
      <Menu
        anchorEl={imageMenuAnchor}
        open={Boolean(imageMenuAnchor)}
        onClose={handleImageMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <MuiMenuItem onClick={() => {
          handlePhoto('both');
          handleImageMenuClose();
        }}>
          <CameraAlt sx={{ mr: 1 }} />
          拍照或选择图片
        </MuiMenuItem>
        <MuiMenuItem onClick={() => {
          handlePhoto('camera');
          handleImageMenuClose();
        }}>
          <CameraAlt sx={{ mr: 1 }} />
          拍照
        </MuiMenuItem>
        <MuiMenuItem onClick={() => {
          handlePhoto('gallery');
          handleImageMenuClose();
        }}>
          <Image sx={{ mr: 1 }} />
          从相册选择
        </MuiMenuItem>
      </Menu>
    </Dialog>
  );
} 