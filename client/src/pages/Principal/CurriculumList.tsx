import { useState, useEffect } from "react";
import LoadingOverlay from "../../components/LoadingOverlay";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Button,
  FormGroup,
  Paper,
} from "@mui/material";
import {
  DataGrid,
  GridFooterContainer,
  GridPagination,
} from "@mui/x-data-grid";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import FilterAltIcon from "@mui/icons-material/FilterAlt";

import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import CurriculumForm from "./CurriculumForm";
import CurriculumTimeForm from "./CurriculumTimeForm"
import Swal from "sweetalert2";
import {
  getAllCurriculums,
  createCurriculums,
  deleteCurriculum,
  updateCurriculum,
  createTimeCurriculum
} from "../../services/PrincipalApi";

const PRIMARY_COLOR = "#4194cb";
const BACKGROUND_COLOR = "#fefefe";

function CustomFooter({ count }: { count: number }) {
  return (
    <GridFooterContainer
      sx={{
        px: 2,
        py: 1,
        backgroundColor: "#f9f9f9",
        borderTop: "1px solid #ccc",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Typography fontSize={14} color="#666">
        Đã tìm thấy <strong>{count}</strong> chương trình học
      </Typography>
      <GridPagination />
    </GridFooterContainer>
  );
}

export default function CurriculumManager() {
  const [searchText, setSearchText] = useState("");
  const [filterFixed, setFilterFixed] = useState<string[]>(["fixed", "normal"]);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const [curriculums, setCurriculums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false); // loading cho các thao tác CRUD
  const [visibleColumns, setVisibleColumns] = useState([
    "curriculumCode",
    "activityName",
    "activityFixed",
    "age",
    "activityNumber",
    "createdAt",
    "actions",
  ]);
  const [columnAnchorEl, setColumnAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const [openSetTimeDialog, setOpenSetTimeDialog] = useState(false);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [editingActivityId, setEditingActivityId] = useState<string | null>(
    null
  );
  const [newActivity, setNewActivity] = useState({
    activityName: "",
    activityFixed: false,
    activityNumber: 0,
    age: "",
  });
  const [ageFilter, setAgeFilter] = useState("all");
  const [updatedActivities, setUpdatedActivities] = useState<any[]>([]);
  console.log("🚀 ~ CurriculumManager ~ updatedActivities:", updatedActivities);

  const filteredActivities = curriculums.filter((activity: any) => {
    if (!activity.activityFixed) return false;

    return activity.age === ageFilter;
  });

  const columnOpen = Boolean(columnAnchorEl);

  const fetchCurriculums = async () => {
    setLoading(true);
    try {
      const res = await getAllCurriculums();
      const data = res.data
        .sort(
          (a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .map((c: any, index: number) => ({
          ...c,
          id: index + 1,
        }));

      setCurriculums(data);
    } catch (err) {
      toast.error("Không thể tải danh sách chương trình học. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurriculums();
  }, []);

  const handleFilterToggle = (type: string) => {
    setFilterFixed((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleColumnToggle = (field: string) => {
    setVisibleColumns((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]
    );
  };

  const handleAdd = () => {
    setEditingActivityId(null);
    setOpenAddDialog(true);
  };

  const handleSetTime = () => {
    setOpenSetTimeDialog(true);
  };

  const handleCloseSetTimeDialog = () => {
    setOpenSetTimeDialog(false);
    setUpdatedActivities([]);
  };


  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
    setNewActivity({
      activityName: "",
      activityFixed: false,
      activityNumber: 0,
      age: "",
    });
  };

  // Tạo mới
  const handleCreateActivity = async () => {
    setActionLoading(true);
    try {
      const response = await createCurriculums(newActivity);
      if (response.error) {
        const { errorList } = response.error;
        if (errorList && errorList.length > 0) {
          for (const error of errorList) {
            const { message } = error;
            toast.error(message);
          }
        } else {
          toast.error("Lỗi tại máy chủ. Vui lòng thử lại.");
        }
        return;
      }
      toast.success("Đã tạo hoạt động mới thành công.");
      handleCloseAddDialog();
      fetchCurriculums();
    } finally {
      setActionLoading(false);
    }
  };

  //Cập nhật
  const handleEdit = (row: any) => {
    setNewActivity({
      activityName: row.activityName,
      activityFixed: row.activityFixed,
      activityNumber: row.activityNumber,
      age: row.age,
    });
    setEditingActivityId(row._id);
    setOpenAddDialog(true);
  };

  const handleUpdateActivity = async () => {
    if (!editingActivityId) return;
    setActionLoading(true);
    try {
      const response = await updateCurriculum(editingActivityId, newActivity);
      if (response.error) {
        const { errorList } = response.error;
        if (errorList && errorList.length > 0) {
          for (const error of errorList) {
            const { message } = error;
            toast.error(message);
          }
        } else {
          toast.error("Lỗi tại máy chủ. Vui lòng thử lại.");
        }
        return;
      }
      toast.success("Đã cập nhật hoạt động thành công.");
      handleCloseAddDialog();
      fetchCurriculums();
    } finally {
      setActionLoading(false);
    }
  };

  //Xóa
  const handleDelete = async (row: any) => {
    const result = await Swal.fire({
      title: "Bạn có chắc chắn muốn xoá chương trình học này?",
      text: `Hoạt động: ${row.activityName}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Xoá",
      cancelButtonText: "Huỷ"
    });
    if (result.isConfirmed) {
      setActionLoading(true);
      try {
        await deleteCurriculum(row._id);
        toast.success("Đã xoá chương trình học thành công.");
        fetchCurriculums();
      } catch {
        toast.error("Xoá chương trình học thất bại. Vui lòng thử lại.");
      } finally {
        setActionLoading(false);
      }
    }
  };

  //Xử lý thời gian
  const handleTimeChange = (
    activityId: string,
    field: "startTime" | "endTime",
    value: Date | null
  ) => {
    setUpdatedActivities((prev: any[]) => {
      const index = prev.findIndex((item) => item.activityId === activityId);

      if (index !== -1) {
        const updated = { ...prev[index], [field]: value };
        const newList = [...prev];
        newList[index] = updated;
        return newList;
      } else {
        return [...prev, { activityId, [field]: value }];
      }
    });
  };

  const handleUpdate = async () => {
    setActionLoading(true);
    try {
      const payload = updatedActivities.map((item: any) => ({
        activityId: item.activityId,
        startTime: item.startTime ? item.startTime.toISOString() : null,
        endTime: item.endTime ? item.endTime.toISOString() : null,
      }));
      const res = await createTimeCurriculum(payload);
      if (res.error) {
        const { errorList } = res.error;
        if (errorList && errorList.length > 0) {
          for (const error of errorList) {
            const { message } = error;
            toast.error(message);
          }
        } else {
          toast.error("Lỗi tại máy chủ. Vui lòng thử lại.");
        }
        return;
      } else {
        toast.success("Đã cập nhật giờ thành công.");
        setOpenSetTimeDialog(false);
        setUpdatedActivities([]);
        fetchCurriculums();
      }
    } finally {
      setActionLoading(false);
    }
  };

  const filteredData = curriculums
    .filter(
      (item) =>
        item.curriculumCode.toLowerCase().includes(searchText.toLowerCase()) ||
        item.activityName.toLowerCase().includes(searchText.toLowerCase())
    )
    .filter((item) => {
      if (filterFixed.length === 0) return true;
      if (filterFixed.includes("fixed") && item.activityFixed === true)
        return true;
      if (filterFixed.includes("normal") && item.activityFixed === false)
        return true;
      return false;
    });

  const allColumns = [
    { field: "curriculumCode", headerName: "Mã chương trình", flex: 1.2 },
    { field: "activityName", headerName: "Tên hoạt động", flex: 1.5 },
    {
      field: "activityFixed",
      headerName: "Loại hoạt động",
      flex: 1.2,
      renderCell: (params: any) => (
        <Box display="flex" alignItems="center" gap={1} width="100%" mt={2}>
          {params.value ? (
            <>
              <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#22c55e' }}>Cố định</Typography>
            </>
          ) : (
            <>
              <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#64748b' }} />
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#64748b' }}>Thông thường
              </Typography>
            </>
          )}
        </Box>
      ),
    },
    { field: "age", headerName: "Độ tuổi", flex: 1 },
    { field: "activityNumber", headerName: "Số tiết học", flex: 1 },
    {
      field: "createdAt",
      headerName: "Ngày tạo",
      flex: 1.3,
      renderCell: (params: any) =>
        new Date(params.value).toLocaleDateString("vi-VN"),
    },
    {
      field: "actions",
      headerName: "Thao tác",
      flex: 1.2,
      sortable: false,
      renderCell: (params: any) => (
        <Box display="flex" gap={1}>
          <Tooltip title="Sửa">
            <IconButton onClick={() => handleEdit(params.row)}>
              <EditIcon fontSize="small" color="primary" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Xoá">
            <IconButton onClick={() => handleDelete(params.row)}>
              <DeleteIcon fontSize="small" color="error" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const columns = allColumns.filter((col) =>
    visibleColumns.includes(col.field)
  );

  return (
    <Box sx={{ p: 3, bgcolor: BACKGROUND_COLOR, height: "90vh", position: "relative" }}>
      <Typography variant="h5" fontWeight="bold" color={PRIMARY_COLOR} mb={3}>
        Quản lý chương trình học
      </Typography>
      {actionLoading && <LoadingOverlay />}

      <Box
        sx={{
          mb: 2,
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <TextField
          label="Tìm kiếm chương trình..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          size="small"
          variant="outlined"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 280 }}
        />

        <Box display="flex" gap={1}>
          <Tooltip title="Làm mới">
            <IconButton onClick={fetchCurriculums}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Lọc loại hoạt động">
            <IconButton onClick={(e) => setFilterAnchorEl(e.currentTarget)}>
              <FilterAltIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Thêm mới">
            <IconButton color="primary" onClick={handleAdd}>
              <AddIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Cài giờ hoạt động cố định">
            <IconButton color="warning" onClick={handleSetTime}>
              <AccessTimeIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Chọn cột hiển thị">
            <IconButton onClick={(e) => setColumnAnchorEl(e.currentTarget)}>
              <ViewColumnIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Paper
        elevation={2}
        sx={{ height: "70vh", borderRadius: 2, overflow: "hidden" }}
      >
        <DataGrid
          rows={filteredData}
          columns={columns}
          loading={loading}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          pageSizeOptions={[10, 25, 50]}
          disableRowSelectionOnClick
          hideFooterSelectedRowCount
          slots={{ footer: () => <CustomFooter count={filteredData.length} /> }}
          sx={{
            backgroundColor: "#fff",
            border: "none",
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#d5f0ff",
              fontWeight: "bold",
            },
            "& .MuiDataGrid-row:hover": {
              backgroundColor: "#f0f9ff",
            },
          }}
        />
      </Paper>

      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={() => setFilterAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <MenuItem disableRipple>
          <Typography fontWeight="bold">Chọn trạng thái</Typography>
        </MenuItem>
        <MenuItem disableRipple>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={filterFixed.includes("fixed")}
                  onChange={() => handleFilterToggle("fixed")}
                />
              }
              label="Hoạt động cố định"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={filterFixed.includes("normal")}
                  onChange={() => handleFilterToggle("normal")}
                />
              }
              label="Hoạt động thông thường"
            />
          </FormGroup>
        </MenuItem>
        <MenuItem disableRipple>
          <Button
            onClick={() => setFilterAnchorEl(null)}
            variant="contained"
            fullWidth
            size="small"
          >
            Áp dụng lọc
          </Button>
        </MenuItem>
      </Menu>

      <Menu
        anchorEl={columnAnchorEl}
        open={columnOpen}
        onClose={() => setColumnAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <MenuItem disableRipple>
          <Typography fontWeight="bold">Chọn cột hiển thị</Typography>
        </MenuItem>
        <MenuItem disableRipple>
          <FormGroup>
            {allColumns.map((col) => (
              <FormControlLabel
                key={col.field}
                control={
                  <Checkbox
                    checked={visibleColumns.includes(col.field)}
                    onChange={() => handleColumnToggle(col.field)}
                  />
                }
                label={col.headerName}
              />
            ))}
          </FormGroup>
        </MenuItem>
        <MenuItem disableRipple>
          <Button
            variant="contained"
            fullWidth
            size="small"
            onClick={() => setColumnAnchorEl(null)}
          >
            Áp dụng
          </Button>
        </MenuItem>
      </Menu>

      {/* Dialog Create and Update */}
      <CurriculumForm
        open={openAddDialog}
        onClose={handleCloseAddDialog}
        onSubmit={
          editingActivityId ? handleUpdateActivity : handleCreateActivity
        }
        editing={!!editingActivityId}
        newActivity={newActivity}
        setNewActivity={setNewActivity}
      />



      {/* Dialog time */}
      <CurriculumTimeForm
        open={openSetTimeDialog}
        onClose={handleCloseSetTimeDialog}
        ageFilter={ageFilter}
        setAgeFilter={setAgeFilter}
        activities={filteredActivities}
        timeData={updatedActivities}
        handleTimeChange={handleTimeChange}
        handleUpdate={handleUpdate}
      />
      <ToastContainer position="top-right" autoClose={3000} />
    </Box>
  );
}
