import {
  Box,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  TextField,
  MenuItem,
  Select,
  FormControl,
  Typography,
  Button,
  Stack,
} from "@mui/material";
import { useEffect, useState } from "react";
import {
  getAttendanceToday,
  getTeacherClass,
  bulkUpdateAttendance,
  getTeacherInClass,
} from "../../../services/teacher.service";
import { useSelector } from "react-redux";
import type { RootState } from "../../../redux/store";
import { toast, ToastContainer } from "react-toastify";
import SchoolIcon from "@mui/icons-material/School";
import PersonIcon from "@mui/icons-material/Person";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import SaveIcon from "@mui/icons-material/Save";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import LoadingOverlay from "../../../components/LoadingOverlay";

interface Student {
  _id: string;
  fullName: string;
  studentCode: string;
}

interface Teacher {
  _id: string;
  fullName: string;
}

interface Attendance {
  _id: string;
  studentId: Student;
  teacherId: Teacher;
  status: "present" | "absent" | "sick" | "leave";
  checkInTime: string;
  checkOutTime: string;
  note: string;
  date: string;
}

const AttendancePage = () => {
  const [attendanceList, setAttendanceList] = useState<Attendance[]>([]);
  const [classId, setClassId] = useState<string>("");
  const [teacherName, setTeacherName] = useState<string>("");
  const [classInfo, setClassInfo] = useState<any>(null);
  const [teacherInClass, setTeacherInClass] = useState<any>(null);

  const [loading, setLoading] = useState(false);
  const user = useSelector((state: RootState) => state.auth.user);


  useEffect(() => {
    const fetchClassInfo = async () => {
      try {
        setLoading(true);
        const res = await getTeacherClass();
        setLoading(false);
        const classes = Array.isArray(res)
          ? res
          : res?.data?.classes || res?.classes || [];

        if (classes.length > 0) {
          setClassId(classes[0]._id);
          setClassInfo(classes[0]);
        } else {
          console.warn("Không tìm thấy lớp học");
        }
      } catch (err) {
        setLoading(false);
        console.error("Lỗi khi lấy lớp học:", err);
      }
    };

    fetchClassInfo();
  }, []);

  useEffect(() => {
    if (!classId) return;

    const fetchTeacherInClass = async () => {
      try {
        setLoading(true);
        const res = await getTeacherInClass(classId);
        setLoading(false);
        const teacherList = Array.isArray(res)
          ? res
          : res?.data || [];

        setTeacherInClass(teacherList);
      } catch (err) {
        setLoading(false);
        console.error("Lỗi khi lấy giáo viên:", err);
        setTeacherInClass([]);
      }
    };

    fetchTeacherInClass();
  }, [classId]);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        const res = await getAttendanceToday(classId);
        setLoading(false);
        const records = Array.isArray(res)
          ? res
          : res?.data || [];

        setAttendanceList(records);

        if (records.length > 0) {
          setTeacherName(
            records[0]?.teacherId?.fullName || user?.fullName || ""
          );
        }
      } catch (err) {
        setLoading(false);
        console.error("Lỗi khi lấy điểm danh:", err);
      }
    };

    if (classId) fetchAttendance();
  }, [classId]);




  // Cập nhật trường trong từng bản ghi điểm danh
  const handleChange = (index: number, field: keyof Attendance, value: any) => {
    const updated = [...attendanceList];
    (updated[index] as any)[field] = value;
    setAttendanceList(updated);
  };

  // Lưu toàn bộ danh sách điểm danh
  const handleSave = async () => {
    try {
      const payload = attendanceList.map((record) => ({
        _id: record._id,
        status: record.status,
        checkInTime: record.checkInTime,
        checkOutTime: record.checkOutTime,
        note: record.note,
        date: record.date,
      }));
      setLoading(true);
      await bulkUpdateAttendance(payload);
      setLoading(false);
      toast.success("Lưu điểm danh thành công!");
    } catch (err) {
      setLoading(false);
      console.error("Lỗi khi lưu:", err);
      toast.error("Có lỗi khi lưu điểm danh!");
    }
  };


  return (
    <Box
      sx={{ p: 4, minHeight: "100vh", bgcolor: "#f5f7fb", marginBottom: 20 }}
    >
      {loading && <LoadingOverlay />}
      {/* Header Info */}
      {classInfo && (
        <Paper
          elevation={2}
          sx={{
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
            bgcolor: "#f9fbfc",
            borderRadius: 3,
            py: 2,
            px: 3,
            mb: 3,
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box display="flex" alignItems="center" gap={1.5}>
            <SchoolIcon sx={{ color: "#46a2da" }} />
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              <Typography fontSize={13} color="text.secondary">
                Lớp học
              </Typography>
              <Typography fontWeight={600} fontSize={16}>
                {classInfo.className}
              </Typography>
            </Box>
          </Box>
          <Divider
            orientation="vertical"
            flexItem
            sx={{ mx: 1, display: { xs: "none", md: "block" } }}
          />
          <Box display="flex" alignItems="center" gap={1.5} sx={{ pr: 2 }}>
            <PersonIcon sx={{ color: "#46a2da" }} />
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              <Typography fontSize={13} color="text.secondary">Giáo viên</Typography>
              <Typography fontWeight={600} fontSize={16}>
                {teacherInClass?.map((t: any) => t.fullName).join(", ") || "--"}
              </Typography>
            </Box>
          </Box>

          <Divider
            orientation="vertical"
            flexItem
            sx={{ mx: 1, display: { xs: "none", md: "block" } }}
          />
          <Box display="flex" alignItems="center" gap={1.5}>
            <CalendarMonthIcon sx={{ color: "#46a2da" }} />
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              <Typography fontSize={13} color="text.secondary">
                Năm học
              </Typography>
              <Typography fontWeight={600} fontSize={16}>
                {classInfo.schoolYear || "--"}
              </Typography>
            </Box>
          </Box>
        </Paper>
      )}
      <Paper
        elevation={2}
        sx={{ borderRadius: 3, p: 3, mb: 3, bgcolor: "#f9fbfc" }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h6" fontWeight={700} sx={{ color: "#4194cb" }}>
            Điểm danh hôm nay
          </Typography>
          <Typography variant="body1">
            Người điểm danh: <strong>{teacherName}</strong>
          </Typography>
        </Stack>
        <TableContainer
          component={Paper}
          sx={{ borderRadius: 2, mb: 2, boxShadow: 1, bgcolor: "#fff" }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#4194cb" }}>
                <TableCell sx={{ color: "#fff", fontWeight: 600 }}>
                  STT
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: 600 }}>
                  Học sinh
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: 600 }}>
                  Mã HS
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: 600 }}>
                  Trạng thái
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: 600 }}>
                  Giờ vào
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: 600 }}>
                  Giờ ra
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: 600 }}>
                  Ghi chú
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {attendanceList.map((record, index) => (
                <TableRow key={record._id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <Stack direction="row" alignItems="center" gap={1.5}>
                      <Avatar
                        sx={{
                          width: 36,
                          height: 36,
                          bgcolor: "#e3f2fd",
                          color: "#1976d2",
                          fontWeight: 700,
                        }}
                      >
                        {record.studentId.fullName?.charAt(0) || "?"}
                      </Avatar>
                      <Typography fontWeight={500}>
                        {record.studentId.fullName}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography fontSize={14} color="text.secondary">
                      {record.studentId.studentCode || "--"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <FormControl
                      fullWidth
                      size="small"
                      sx={{ bgcolor: "white", borderRadius: 2 }}
                    >
                      <Select
                        value={record.status}
                        onChange={(e) =>
                          handleChange(index, "status", e.target.value)
                        }
                        displayEmpty
                        sx={{ bgcolor: "white", borderRadius: 2 }}
                      >
                        <MenuItem value="present">✅ Có mặt</MenuItem>
                        <MenuItem value="absent">❌ Vắng</MenuItem>
                        <MenuItem value="sick">🤒 Ốm</MenuItem>
                        <MenuItem value="leave">📝 Nghỉ phép</MenuItem>
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      type="time"
                      value={record.checkInTime}
                      onChange={(e) =>
                        handleChange(index, "checkInTime", e.target.value)
                      }
                      fullWidth
                      sx={{ bgcolor: "white", borderRadius: 2 }}
                      inputProps={{ style: { padding: 8 } }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      type="time"
                      value={record.checkOutTime}
                      onChange={(e) =>
                        handleChange(index, "checkOutTime", e.target.value)
                      }
                      fullWidth
                      sx={{ bgcolor: "white", borderRadius: 2 }}
                      inputProps={{ style: { padding: 8 } }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      value={record.note}
                      onChange={(e) =>
                        handleChange(index, "note", e.target.value)
                      }
                      fullWidth
                      sx={{ bgcolor: "white", borderRadius: 2 }}
                      inputProps={{ style: { padding: 8 } }}
                      placeholder="Ghi chú..."
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Box display="flex" justifyContent="flex-end">
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            sx={{ fontWeight: 700, px: 4, py: 1, borderRadius: 2, gap: 1.5 }}
            startIcon={<SaveIcon />}
          >
            Lưu điểm danh
          </Button>
        </Box>
      </Paper>
      <ToastContainer position="top-right" autoClose={3000} />
    </Box>
  );
};

export default AttendancePage;
