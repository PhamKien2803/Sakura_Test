import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
    TextField,
    Button,
    Typography,
    MenuItem,
    Paper,
    Box,
} from "@mui/material";
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import LoadingOverlay from '../../components/LoadingOverlay';
import { toast, ToastContainer } from "react-toastify";
import {
    getStudentById,
    createStudent,
    updateStudent,
} from "../../services/PrincipalApi";

const defaultForm = {
    studentCode: "",
    fullName: "",
    dob: "",
    gender: "",
    address: "",
    age: 0,
    status: true,
    image: "",
    note: "",
};

export default function StudentForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState(defaultForm);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (id) {
            getStudentById(id).then((res: any) => {
                const student = res.data;
                if (student.dob) {
                    student.dob = student.dob.substring(0, 10);
                }
                setForm(student);
            });
        }
    }, [id]);

    const handleSave = async () => {
        if (!form.studentCode || !form.fullName || !form.dob || !form.gender || !form.address || !form.age) {
            toast.warning("Vui lòng nhập đầy đủ thông tin bắt buộc");
            return;
        }
        if (isNaN(form.age) || form.age < 1 || form.age > 5) {
            toast.info("Tuổi học sinh không hợp lệ (1-5)");
            return;
        }
        if (!/^\d{4}-\d{2}-\d{2}$/.test(form.dob)) {
            toast.info("Ngày sinh không hợp lệ. Định dạng yyyy-mm-dd");
            return;
        }
        try {
            setLoading(true);
            if (id) {
                await updateStudent(id, form);
                toast.success("Cập nhật học sinh thành công");
            } else {
                await createStudent(form);
                toast.success("Tạo mới học sinh thành công");
            }
            setTimeout(() => navigate("/principal-home/students-management"), 1200);
        } catch {
            toast.error("Có lỗi khi lưu học sinh");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box p={4} position="relative">
            {loading && <LoadingOverlay />}
            <Typography variant="h5" mb={2}>
                {id ? "Cập nhật học sinh" : "Thêm học sinh mới"}
            </Typography>
            <Paper sx={{ p: 3 }}>
                <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={4}>
                    {/* Cột trái */}
                    <Box flex={1}>
                        <TextField
                            id="student-code"
                            label="Mã học sinh"
                            variant="standard"
                            fullWidth
                            value={form.studentCode}
                            onChange={(e) => setForm({ ...form, studentCode: e.target.value })}
                            disabled={!!id}
                            sx={!!id ? { backgroundColor: 'grey.300', borderRadius: 1 } : {}}
                        />
                        <TextField id="student-name" label="Họ tên" variant="standard" fullWidth value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} sx={{ mt: 2 }} />
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                label="Ngày sinh"
                                format="DD/MM/YYYY"
                                value={form.dob ? dayjs(form.dob, ["DD/MM/YYYY", "YYYY-MM-DD"]) : null}
                                onChange={(date) => {
                                    let value = (date && typeof (date as any).format === 'function') ? (date as any).format('DD/MM/YYYY') : '';
                                    setForm({ ...form, dob: value });
                                }}
                                slotProps={{
                                    textField: {
                                        variant: 'standard',
                                        fullWidth: true,
                                        InputLabelProps: { shrink: true },
                                        sx: { mt: 2 }
                                    }
                                }}
                            />
                        </LocalizationProvider>
                        <TextField id="student-age" label="Tuổi" type="number" variant="standard" fullWidth value={form.age} onChange={(e) => setForm({ ...form, age: parseInt(e.target.value) })} sx={{ mt: 2 }} />
                    </Box>
                    {/* Cột phải */}
                    <Box flex={1}>
                        <TextField id="student-gender" label="Giới tính" select variant="standard" fullWidth value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                            <MenuItem value="male">Nam</MenuItem>
                            <MenuItem value="female">Nữ</MenuItem>
                            <MenuItem value="other">Khác</MenuItem>
                        </TextField>
                        <TextField id="student-address" label="Địa chỉ" variant="standard" fullWidth value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} sx={{ mt: 2 }} />
                        <TextField id="student-note" label="Ghi chú" variant="standard" fullWidth value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} sx={{ mt: 2 }} />
                    </Box>
                </Box>
                <Box mt={3} display="flex" justifyContent="flex-end">
                    <Button variant="outlined" sx={{ mr: 2 }} onClick={() => navigate("/principal-home/students-management")}>Quay lại</Button>
                    <Button variant="contained" onClick={handleSave}>{id ? "Cập nhật" : "Lưu"}</Button>
                </Box>
            </Paper>
            <ToastContainer position="top-right" autoClose={3000} />
        </Box>
    );
}
