import React, { useEffect, useState } from "react";
import { 
  CssBaseline, 
  Container, 
  Typography, 
  Box, 
  Paper,
  AppBar,
  Toolbar,
  IconButton,
  Fab,
  Chip,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Divider,
  Badge,
  Menu,
  MenuItem,
  Avatar,
  Dialog,
  DialogContent,
  DialogActions,
  Button
} from "@mui/material";
import { 
  CalendarToday, 
  Add, 
  Restaurant,
  DirectionsRun,
  AccessTime,
  Note,
  MoreVert,
  Edit,
  Delete,
  Close,
  ZoomIn
} from "@mui/icons-material";
import CalendarView from "./components/CalendarView";
import FoodForm from "./components/FoodForm";
import ExerciseForm from "./components/ExerciseForm";
import { openDB, getFoodsByDate, insertFood, updateFood, deleteFood, getDB, getExercisesByDate, insertExercise, updateExercise, deleteExercise } from "./utils/db";

const mealTypeColors = {
  breakfast: "#FF9800",
  lunch: "#4CAF50", 
  dinner: "#2196F3",
  snack: "#9C27B0",
  drink: "#00BCD4"
};

const mealTypeLabels = {
  breakfast: "早餐",
  lunch: "午餐", 
  dinner: "晚餐",
  snack: "零食",
  drink: "饮品"
};

const exerciseTypeColors = {
  running: "#FF5722",
  cycling: "#4CAF50",
  gym: "#9C27B0",
  badminton: "#795548",
  other: "#9E9E9E"
};

const exerciseTypeLabels = {
  running: "跑步",
  cycling: "骑行",
  gym: "私教课",
  badminton: "羽毛球",
  other: "其他"
};

export default function App() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [foods, setFoods] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [openExerciseForm, setOpenExerciseForm] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const [editingExercise, setEditingExercise] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedFood, setSelectedFood] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [viewingImage, setViewingImage] = useState(null);
  const [activeTab, setActiveTab] = useState('food'); // 'food' or 'exercise'
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await openDB();
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setIsInitialized(true); // 即使失败也设置为已初始化，避免无限加载
      }
    };
    
    initializeApp();
  }, []);

  useEffect(() => {
    if (isInitialized && getDB()) {
      loadFoods(selectedDate);
      loadExercises(selectedDate);
    }
  }, [selectedDate, isInitialized]);

  const loadFoods = async (date) => {
    try {
      const list = await getFoodsByDate(date);
      setFoods(list);
    } catch (error) {
      console.error('Failed to load foods:', error);
      setFoods([]);
    }
  };

  const loadExercises = async (date) => {
    try {
      const list = await getExercisesByDate(date);
      setExercises(list);
    } catch (error) {
      console.error('Failed to load exercises:', error);
      setExercises([]);
    }
  };

  const handleAddFood = async (food) => {
    try {
      if (editingFood) {
        await updateFood({ ...food, id: editingFood.id });
        setEditingFood(null);
      } else {
        await insertFood(food);
      }
      setOpenForm(false);
      await loadFoods(selectedDate);
    } catch (error) {
      console.error('Failed to add/update food:', error);
    }
  };

  const handleAddExercise = async (exercise) => {
    try {
      if (editingExercise) {
        await updateExercise({ ...exercise, id: editingExercise.id });
        setEditingExercise(null);
      } else {
        await insertExercise(exercise);
      }
      setOpenExerciseForm(false);
      await loadExercises(selectedDate);
    } catch (error) {
      console.error('Failed to add/update exercise:', error);
    }
  };

  const handleEditFood = (food) => {
    setEditingFood(food);
    setOpenForm(true);
    setMenuAnchor(null);
  };

  const handleEditExercise = (exercise) => {
    setEditingExercise(exercise);
    setOpenExerciseForm(true);
    setMenuAnchor(null);
  };

  const handleDeleteFood = async (food) => {
    try {
      await deleteFood(food.id);
      await loadFoods(selectedDate);
      setMenuAnchor(null);
    } catch (error) {
      console.error('Failed to delete food:', error);
    }
  };

  const handleDeleteExercise = async (exercise) => {
    try {
      await deleteExercise(exercise.id);
      await loadExercises(selectedDate);
      setMenuAnchor(null);
    } catch (error) {
      console.error('Failed to delete exercise:', error);
    }
  };

  const handleMenuOpen = (event, food) => {
    setMenuAnchor(event.currentTarget);
    setSelectedFood(food);
    setSelectedExercise(null);
  };

  const handleExerciseMenuOpen = (event, exercise) => {
    setMenuAnchor(event.currentTarget);
    setSelectedExercise(exercise);
    setSelectedFood(null);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedFood(null);
    setSelectedExercise(null);
  };

  const handleImageClick = (image) => {
    setViewingImage(image);
    setImageViewerOpen(true);
  };

  const formatDate = (date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return "今天";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "昨天";
    } else {
      return date.toLocaleDateString('zh-CN', { 
        month: 'long', 
        day: 'numeric',
        weekday: 'long'
      });
    }
  };

  const groupedFoods = foods.reduce((groups, food) => {
    const mealType = food.mealType;
    if (!groups[mealType]) {
      groups[mealType] = [];
    }
    groups[mealType].push(food);
    return groups;
  }, {});

  const groupedExercises = exercises.reduce((groups, exercise) => {
    const exerciseType = exercise.exerciseType;
    if (!groups[exerciseType]) {
      groups[exerciseType] = [];
    }
    groups[exerciseType].push(exercise);
    return groups;
  }, {});

  // 如果还没有初始化完成，显示加载状态
  if (!isInitialized) {
    return (
      <>
        <CssBaseline />
        <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            正在初始化...
          </Typography>
        </Container>
      </>
    );
  }

  return (
    <>
      <CssBaseline />
      <AppBar position="static" elevation={0} sx={{ backgroundColor: '#fff', color: '#333' }}>
        <Toolbar>
          <Avatar 
            src="img/logo.png" 
            sx={{ 
              width: 32, 
              height: 32, 
              mr: 1,
              backgroundColor: 'transparent'
            }} 
          />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            pointWu的健康记录
          </Typography>
          <IconButton 
            onClick={() => setShowCalendar(!showCalendar)}
            sx={{ 
              backgroundColor: showCalendar ? 'primary.main' : 'transparent',
              color: showCalendar ? 'white' : 'primary.main',
              '&:hover': {
                backgroundColor: showCalendar ? 'primary.dark' : 'primary.light',
                color: 'white'
              }
            }}
          >
            <CalendarToday />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" sx={{ pb: 10, pt: 2 }}>
        {/* 日期显示 */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
            {formatDate(selectedDate)}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Chip 
              label={`${foods.length} 条饮食记录`}
              size="small"
              color="primary"
              variant="outlined"
            />
            <Chip 
              label={`${exercises.length} 条运动记录`}
              size="small"
              color="secondary"
              variant="outlined"
            />
          </Box>
          
          {/* 标签页切换 */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex' }}>
              <Box
                sx={{
                  flex: 1,
                  textAlign: 'center',
                  py: 1,
                  cursor: 'pointer',
                  borderBottom: activeTab === 'food' ? 2 : 0,
                  borderColor: 'primary.main',
                  color: activeTab === 'food' ? 'primary.main' : 'text.secondary',
                  fontWeight: activeTab === 'food' ? 600 : 400,
                }}
                onClick={() => setActiveTab('food')}
              >
                饮食记录
              </Box>
              <Box
                sx={{
                  flex: 1,
                  textAlign: 'center',
                  py: 1,
                  cursor: 'pointer',
                  borderBottom: activeTab === 'exercise' ? 2 : 0,
                  borderColor: 'secondary.main',
                  color: activeTab === 'exercise' ? 'secondary.main' : 'text.secondary',
                  fontWeight: activeTab === 'exercise' ? 600 : 400,
                }}
                onClick={() => setActiveTab('exercise')}
              >
                运动记录
              </Box>
            </Box>
          </Box>
        </Box>

        {/* 日历视图 */}
        {showCalendar && (
          <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
            <CalendarView 
              value={selectedDate} 
              onChange={(date) => {
                setSelectedDate(date);
                setShowCalendar(false);
              }} 
            />
          </Paper>
        )}

        {/* 内容区域 */}
        {activeTab === 'food' ? (
          /* 饮食列表 */
          foods.length === 0 ? (
            <Box sx={{ 
              textAlign: 'center', 
              py: 8,
              color: 'text.secondary'
            }}>
              <Restaurant sx={{ fontSize: 64, mb: 2, opacity: 0.3 }} />
              <Typography variant="h6" gutterBottom>
                今天还没有饮食记录
              </Typography>
              <Typography variant="body2">
                点击下方按钮添加你的第一餐
              </Typography>
            </Box>
          ) : (
            <Box>
              {Object.entries(groupedFoods).map(([mealType, mealFoods]) => (
                <Box key={mealType} sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ 
                      width: 4, 
                      height: 20, 
                      backgroundColor: mealTypeColors[mealType],
                      borderRadius: 2,
                      mr: 1
                    }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {mealTypeLabels[mealType]}
                    </Typography>
                    <Chip 
                      label={mealFoods.length}
                      size="small"
                      sx={{ ml: 'auto', backgroundColor: mealTypeColors[mealType], color: 'white' }}
                    />
                  </Box>
                  
                  <Grid container spacing={2}>
                    {mealFoods.map((food) => (
                      <Grid item xs={12} key={food.id}>
                        <Card sx={{ 
                          borderRadius: 2,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          '&:hover': {
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                          }
                        }}>
                          <CardContent sx={{ p: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                              {food.image && (
                                <Box sx={{ position: 'relative', mr: 2 }}>
                                  <CardMedia
                                    component="img"
                                    image={food.image}
                                    sx={{ 
                                      width: 60, 
                                      height: 60, 
                                      borderRadius: 1,
                                      objectFit: 'cover',
                                      cursor: 'pointer',
                                      '&:hover': {
                                        opacity: 0.8
                                      }
                                    }}
                                    onClick={() => handleImageClick(food.image)}
                                  />
                                  <IconButton
                                    size="small"
                                    sx={{
                                      position: 'absolute',
                                      top: -4,
                                      right: -4,
                                      backgroundColor: 'rgba(0,0,0,0.5)',
                                      color: 'white',
                                      width: 20,
                                      height: 20,
                                      '&:hover': {
                                        backgroundColor: 'rgba(0,0,0,0.7)'
                                      }
                                    }}
                                    onClick={() => handleImageClick(food.image)}
                                  >
                                    <ZoomIn sx={{ fontSize: 12 }} />
                                  </IconButton>
                                </Box>
                              )}
                              <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                                  {food.name}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                  <AccessTime sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                                  <Typography variant="body2" color="text.secondary">
                                    {food.time}
                                  </Typography>
                                </Box>
                                {food.note && (
                                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                                    <Note sx={{ fontSize: 16, mr: 0.5, mt: 0.2, color: 'text.secondary' }} />
                                    <Typography variant="body2" color="text.secondary">
                                      {food.note}
                                    </Typography>
                                  </Box>
                                )}
                              </Box>
                              <IconButton
                                size="small"
                                onClick={(e) => handleMenuOpen(e, food)}
                                sx={{ ml: 1 }}
                              >
                                <MoreVert />
                              </IconButton>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              ))}
            </Box>
          )
        ) : (
          /* 运动列表 */
          exercises.length === 0 ? (
            <Box sx={{ 
              textAlign: 'center', 
              py: 8,
              color: 'text.secondary'
            }}>
              <DirectionsRun sx={{ fontSize: 64, mb: 2, opacity: 0.3 }} />
              <Typography variant="h6" gutterBottom>
                今天还没有运动记录
              </Typography>
              <Typography variant="body2">
                点击下方按钮添加你的第一次运动
              </Typography>
            </Box>
          ) : (
            <Box>
              {Object.entries(groupedExercises).map(([exerciseType, exerciseList]) => (
                <Box key={exerciseType} sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ 
                      width: 4, 
                      height: 20, 
                      backgroundColor: exerciseTypeColors[exerciseType],
                      borderRadius: 2,
                      mr: 1
                    }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {exerciseTypeLabels[exerciseType]}
                    </Typography>
                    <Chip 
                      label={exerciseList.length}
                      size="small"
                      sx={{ ml: 'auto', backgroundColor: exerciseTypeColors[exerciseType], color: 'white' }}
                    />
                  </Box>
                  
                  <Grid container spacing={2}>
                    {exerciseList.map((exercise) => (
                      <Grid item xs={12} key={exercise.id}>
                        <Card sx={{ 
                          borderRadius: 2,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          '&:hover': {
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                          }
                        }}>
                          <CardContent sx={{ p: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                              {exercise.image && (
                                <Box sx={{ position: 'relative', mr: 2 }}>
                                  <CardMedia
                                    component="img"
                                    image={exercise.image}
                                    sx={{ 
                                      width: 60, 
                                      height: 60, 
                                      borderRadius: 1,
                                      objectFit: 'cover',
                                      cursor: 'pointer',
                                      '&:hover': {
                                        opacity: 0.8
                                      }
                                    }}
                                    onClick={() => handleImageClick(exercise.image)}
                                  />
                                  <IconButton
                                    size="small"
                                    sx={{
                                      position: 'absolute',
                                      top: -4,
                                      right: -4,
                                      backgroundColor: 'rgba(0,0,0,0.5)',
                                      color: 'white',
                                      width: 20,
                                      height: 20,
                                      '&:hover': {
                                        backgroundColor: 'rgba(0,0,0,0.7)'
                                      }
                                    }}
                                    onClick={() => handleImageClick(exercise.image)}
                                  >
                                    <ZoomIn sx={{ fontSize: 12 }} />
                                  </IconButton>
                                </Box>
                              )}
                              <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                                  {exercise.name}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 2 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <AccessTime sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                                    <Typography variant="body2" color="text.secondary">
                                      {exercise.time}
                                    </Typography>
                                  </Box>
                                  {exercise.duration && (
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                      <Typography variant="body2" color="text.secondary">
                                        时长: {exercise.duration}
                                      </Typography>
                                    </Box>
                                  )}
                                  {exercise.calories && (
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                      <Typography variant="body2" color="text.secondary">
                                        消耗: {exercise.calories} kcal
                                      </Typography>
                                    </Box>
                                  )}
                                </Box>
                                {exercise.note && (
                                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                                    <Note sx={{ fontSize: 16, mr: 0.5, mt: 0.2, color: 'text.secondary' }} />
                                    <Typography variant="body2" color="text.secondary">
                                      {exercise.note}
                                    </Typography>
                                  </Box>
                                )}
                              </Box>
                              <IconButton
                                size="small"
                                onClick={(e) => handleExerciseMenuOpen(e, exercise)}
                                sx={{ ml: 1 }}
                              >
                                <MoreVert />
                              </IconButton>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              ))}
            </Box>
          )
        )}

        {/* 添加按钮 */}
        <Fab
          color={activeTab === 'food' ? 'primary' : 'secondary'}
          aria-label="add"
          onClick={() => {
            if (activeTab === 'food') {
              setEditingFood(null);
              setOpenForm(true);
            } else {
              setEditingExercise(null);
              setOpenExerciseForm(true);
            }
          }}
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 1000,
            width: 56,
            height: 56,
            boxShadow: activeTab === 'food' 
              ? '0 4px 12px rgba(25, 118, 210, 0.4)' 
              : '0 4px 12px rgba(156, 39, 176, 0.4)',
            '&:hover': {
              boxShadow: activeTab === 'food' 
                ? '0 6px 16px rgba(25, 118, 210, 0.6)' 
                : '0 6px 16px rgba(156, 39, 176, 0.6)'
            }
          }}
        >
          <Add />
        </Fab>

        {/* 表单对话框 */}
        <FoodForm
          open={openForm}
          onClose={() => {
            setOpenForm(false);
            setEditingFood(null);
          }}
          onSubmit={handleAddFood}
          defaultDate={selectedDate}
          editingFood={editingFood}
        />

        <ExerciseForm
          open={openExerciseForm}
          onClose={() => {
            setOpenExerciseForm(false);
            setEditingExercise(null);
          }}
          onSubmit={handleAddExercise}
          defaultDate={selectedDate}
          editingExercise={editingExercise}
        />

        {/* 操作菜单 */}
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          {selectedFood && (
            <>
              <MenuItem onClick={() => handleEditFood(selectedFood)}>
                <Edit sx={{ mr: 1, fontSize: 20 }} />
                编辑
              </MenuItem>
              <MenuItem onClick={() => handleDeleteFood(selectedFood)} sx={{ color: 'error.main' }}>
                <Delete sx={{ mr: 1, fontSize: 20 }} />
                删除
              </MenuItem>
            </>
          )}
          {selectedExercise && (
            <>
              <MenuItem onClick={() => handleEditExercise(selectedExercise)}>
                <Edit sx={{ mr: 1, fontSize: 20 }} />
                编辑
              </MenuItem>
              <MenuItem onClick={() => handleDeleteExercise(selectedExercise)} sx={{ color: 'error.main' }}>
                <Delete sx={{ mr: 1, fontSize: 20 }} />
                删除
              </MenuItem>
            </>
          )}
        </Menu>

        {/* 图片查看器 */}
        <Dialog
          open={imageViewerOpen}
          onClose={() => setImageViewerOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: { 
              borderRadius: 2,
              backgroundColor: 'rgba(0,0,0,0.9)'
            }
          }}
        >
          <DialogContent sx={{ p: 0, textAlign: 'center' }}>
            {viewingImage && (
              <img
                src={viewingImage}
                alt="food"
                style={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: '80vh',
                  objectFit: 'contain'
                }}
              />
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2, justifyContent: 'center' }}>
            <Button
              onClick={() => setImageViewerOpen(false)}
              variant="outlined"
              sx={{ color: 'white', borderColor: 'white' }}
            >
              <Close sx={{ mr: 1 }} />
              关闭
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
} 