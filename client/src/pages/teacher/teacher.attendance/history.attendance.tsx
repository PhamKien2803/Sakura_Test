import {
  Box,
  Paper,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Avatar,
  Stack,
} from "@mui/material";
import { useEffect, useState } from "react";
import {
  DatePicker,
  LocalizationProvider,
} from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  getAttendanceByDate,
  getTeacherClass,
} from "../../../services/teacher.service";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import LoadingOverlay from "../../../components/LoadingOverlay";

interface Attendance {
  _id: string;
  studentCode: string;
  teacherName: string;
  studentName: string;
  stt: number;
  studentId: {
    _id: string;
    fullName: string;
    studentCode: string;
  };
  teacherId: {
    _id: string;
    fullName: string;
  };
  status: "present" | "absent" | "sick" | "leave";
  checkInTime: string;
  checkOutTime: string;
  note: string;
  date: string;
}

const AttendanceHistoryPage = () => {
  const [attendanceList, setAttendanceList] = useState<Attendance[]>([]);
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [classId, setClassId] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let currentClassId = classId;

        if (!currentClassId) {
          setLoading(true);
          const classRes = await getTeacherClass();
          setLoading(false);
          const classes = Array.isArray(classRes)
            ? classRes
            : classRes?.data?.classes || classRes?.classes || [];

          if (classes.length > 0) {
            currentClassId = classes[0]._id;
            setClassId(currentClassId);
          } else {
            return;
          }
        }

        if (!selectedDate) return;

        const formattedDate = dayjs(selectedDate).format("YYYY-MM-DD");
        setLoading(true);
        const attendanceRes = await getAttendanceByDate(formattedDate, currentClassId);
        setLoading(false);
        const records = Array.isArray(attendanceRes)
          ? attendanceRes
          : attendanceRes?.data || [];

        setAttendanceList(records);
      } catch (err: any) {
        setLoading(false);
        if (err?.response?.status === 400) {
          setAttendanceList([]);
        } else {
          console.error("Lỗi khi lấy dữ liệu điểm danh:", err);
          toast.error("Không tìm thấy dữ liệu điểm danh");
        }
      }
    };

    fetchData();
  }, [selectedDate]);


  const formatTime = (time: string) => {
    return time?.length === 5 ? time : time?.slice(0, 5) || "--";
  };

  const formatStatus = (status: Attendance["status"]) => {
    switch (status) {
      case "present":
        return "✅ Có mặt";
      case "absent":
        return "❌ Vắng";
      case "sick":
        return "🤒 Ốm";
      case "leave":
        return "📝 Nghỉ phép";
      default:
        return status;
    }
  };


  return (
    <Box
      sx={{ p: 4, minHeight: "100vh", bgcolor: "#f5f7fb", marginBottom: 10 }}
    >
      {loading && <LoadingOverlay />}
      <Typography variant="h6" fontWeight={700} mb={2} sx={{ color: "#4194cb" }}>
        Xem lịch sử điểm danh
      </Typography>

      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Box mb={3} width={250}>
          <DatePicker
            label="Chọn ngày"
            value={selectedDate}
            onChange={(newValue) => {
              if (newValue) setSelectedDate(newValue as Dayjs);
            }}
            format="DD/MM/YYYY"
            slotProps={{
              textField: { fullWidth: true },
            }}
          />
        </Box>
      </LocalizationProvider>

      <Paper elevation={2} sx={{ borderRadius: 3, p: 2, bgcolor: "#fff" }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#4194cb" }}>
                {[
                  "STT",
                  "Học sinh",
                  "Mã HS",
                  "Trạng thái",
                  "Giờ vào",
                  "Giờ ra",
                  "Người điểm danh",
                  "Ghi chú",
                ].map((header) => (
                  <TableCell key={header} sx={{ color: "#fff", fontWeight: 600 }}>
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {attendanceList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    Không có dữ liệu điểm danh
                  </TableCell>
                </TableRow>
              ) : (
                attendanceList.map((record, index) => (
                  <TableRow key={record._id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <Stack direction="row" alignItems="center" gap={1}>
                        <Avatar sx={{ width: 36, height: 36, bgcolor: "#e3f2fd", color: "#1976d2", fontWeight: 700 }}>
                          {record.studentName.charAt(0)}
                        </Avatar>
                        <Typography fontWeight={500}>{record.studentName}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>{record.studentCode}</TableCell>
                    <TableCell>{formatStatus(record.status)}</TableCell>
                    <TableCell>{formatTime(record.checkInTime)}</TableCell>
                    <TableCell>{formatTime(record.checkOutTime)}</TableCell>
                    <TableCell>{record.teacherName}</TableCell>
                    <TableCell>{record.note}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <ToastContainer position="top-right" autoClose={3000} />
    </Box>
  );
};

export default AttendanceHistoryPage;
