// src/pages/admin/TrainerFormPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

function TrainerFormPage() {
    // Lấy ID từ URL
    const { id } = useParams();
    const navigate = useNavigate();
    // Xác định đang sửa hay tạo mới
    const isEditing = id !== undefined && id !== 'new';

    // State cho dữ liệu form
    const [formData, setFormData] = useState({
        chi_nhanh_id: '',
        ho_ten: '',
        mo_ta: '',
        chung_chi: '',
        kinh_nghiem: 0,
        hinh_anh: '',
        trang_thai: 'dang hoat dong',
        // THÊM: Trường cho tài khoản (chỉ dùng khi tạo mới)
        email: '',
        password: ''
    });

    // State cho danh sách chi nhánh (dropdown)
    const [branches, setBranches] = useState([]);
    // State loading khi submit
    const [loading, setLoading] = useState(false);
    // State loading ban đầu (fetch data)
    const [initialLoading, setInitialLoading] = useState(true);
    // State cho thông báo lỗi
    const [error, setError] = useState('');

    // Fetch dữ liệu cần thiết (chi nhánh và dữ liệu HLV nếu sửa)
    useEffect(() => {
        const fetchData = async () => {
            setError('');
            try {
                // Lấy danh sách chi nhánh cho dropdown
                const branchRes = await axios.get('https://neofitness-api.onrender.com/api/branches');
                setBranches(branchRes.data);

                // Nếu đang sửa, fetch dữ liệu HLV hiện tại
                if (isEditing) {
                    const trainerRes = await axios.get(`https://neofitness-api.onrender.com/api/trainers/${id}`);
                    const data = trainerRes.data;
                    
                    // Cập nhật state formData với dữ liệu HLV lấy về
                    setFormData({
                        chi_nhanh_id: data.chi_nhanh_id || '',
                        ho_ten: data.ho_ten || '',
                        mo_ta: data.mo_ta || '',
                        chung_chi: data.chung_chi || '',
                        kinh_nghiem: data.kinh_nghiem || 0,
                        hinh_anh: data.hinh_anh || '',
                        trang_thai: data.trang_thai || 'dang hoat dong',
                        // Khi sửa, không load email/pass vào form để tránh lộ hoặc gửi nhầm
                        email: data.email || '', // Có thể hiển thị read-only nếu muốn
                        password: '' 
                    });
                }
            } catch (err) {
                setError('Không thể tải dữ liệu cần thiết (Chi nhánh/HLV).');
                console.error("Fetch error:", err);
            } finally {
                setInitialLoading(false);
            }
        };
        fetchData();
    }, [id, isEditing]);

    // Xử lý thay đổi input
    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: type === 'number' ? (value === '' ? 0 : parseInt(value, 10)) : value
        }));
    };

    // Xử lý submit form
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        const token = localStorage.getItem('accessToken');

        if (!token) {
            setError('Vui lòng đăng nhập lại.');
            setLoading(false);
            return;
        }

        const url = isEditing 
            ? `https://neofitness-api.onrender.com/api/trainers/${id}` 
            : 'https://neofitness-api.onrender.com/api/trainers';
        const method = isEditing ? 'put' : 'post';

        // Chuẩn bị dữ liệu gửi đi
        const dataToSend = {
            ...formData,
            chi_nhanh_id: formData.chi_nhanh_id === '' ? null : formData.chi_nhanh_id
        };

        try {
            await axios({
                method: method,
                url: url,
                data: dataToSend,
                headers: { 'Authorization': `Bearer ${token}` }
            });
            alert(isEditing ? 'Cập nhật thành công!' : 'Tạo HLV và tài khoản thành công!');
            navigate('/admin/trainers');
        } catch (err) {
             const msg = err.response?.data?.message || err.message;
             setError(msg || `Lỗi khi ${isEditing ? 'cập nhật' : 'tạo'} HLV.`);
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) return <p>Đang tải dữ liệu...</p>;

    return (
        <div className="container-fluid">
            <h2 className="mb-4">{isEditing ? 'Chỉnh sửa Huấn Luyện Viên' : 'Tạo Huấn Luyện Viên Mới'}</h2>
            
            {error && <div className="alert alert-danger">{error}</div>}

            <div className="card shadow mb-4">
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        
                        <div className="row">
                            {/* --- CỘT TRÁI: THÔNG TIN CÁ NHÂN --- */}
                            <div className="col-md-6">
                                <h5 className="mb-3 text-primary">Thông tin cá nhân</h5>
                                <div className="form-group mb-3">
                                    <label>Họ Tên (*)</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        name="ho_ten" 
                                        value={formData.ho_ten} 
                                        onChange={handleChange} 
                                        required 
                                        placeholder="Ví dụ: Nguyễn Văn A"
                                    />
                                </div>

                                <div className="form-group mb-3">
                                    <label>Chi Nhánh làm việc</label>
                                     <select 
                                        className="form-control" 
                                        name="chi_nhanh_id" 
                                        value={formData.chi_nhanh_id || ''} 
                                        onChange={handleChange}
                                    >
                                        <option value="">-- Chọn chi nhánh --</option>
                                        {branches.map(branch => (
                                            <option key={branch.chi_nhanh_id} value={branch.chi_nhanh_id}>
                                                {branch.ten_chi_nhanh}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group mb-3">
                                    <label>Link Hình Ảnh (Avatar)</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        name="hinh_anh" 
                                        value={formData.hinh_anh || ''} 
                                        onChange={handleChange} 
                                        placeholder="https://..." 
                                    />
                                </div>

                                <div className="form-group mb-3">
                                    <label>Mô Tả / Giới thiệu</label>
                                    <textarea 
                                        className="form-control" 
                                        rows="4"
                                        name="mo_ta" 
                                        value={formData.mo_ta || ''} 
                                        onChange={handleChange} 
                                    />
                                </div>
                            </div>

                            {/* --- CỘT PHẢI: CHUYÊN MÔN & TÀI KHOẢN --- */}
                            <div className="col-md-6">
                                <h5 className="mb-3 text-primary">Chuyên môn</h5>
                                <div className="form-group mb-3">
                                    <label>Chứng Chỉ / Bằng cấp</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        name="chung_chi" 
                                        value={formData.chung_chi || ''} 
                                        onChange={handleChange} 
                                    />
                                </div>

                                <div className="form-group mb-3">
                                    <label>Kinh Nghiệm (năm)</label>
                                    <input 
                                        type="number" 
                                        className="form-control" 
                                        name="kinh_nghiem" 
                                        value={formData.kinh_nghiem} 
                                        onChange={handleChange} 
                                        min="0" 
                                    />
                                </div>

                                {/* --- CHỈ HIỆN KHI TẠO MỚI --- */}
                                {!isEditing && (
                                    <div className="bg-light p-3 rounded mt-4 border">
                                        <h5 className="mb-3 text-danger">Tạo tài khoản đăng nhập</h5>
                                        <div className="form-group mb-3">
                                            <label>Email đăng nhập (*)</label>
                                            <input 
                                                type="email" 
                                                className="form-control" 
                                                name="email" 
                                                value={formData.email} 
                                                onChange={handleChange} 
                                                required 
                                                autoComplete="off"
                                                placeholder="HLV sẽ dùng email này để login"
                                            />
                                        </div>
                                        <div className="form-group mb-3">
                                            <label>Mật khẩu khởi tạo (*)</label>
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                name="password" 
                                                value={formData.password} 
                                                onChange={handleChange} 
                                                required 
                                                autoComplete="new-password"
                                                placeholder="Nhập mật khẩu ban đầu"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* --- CHỈ HIỆN KHI EDIT --- */}
                                {isEditing && (
                                    <div className="form-group mb-3 mt-4">
                                        <label>Trạng Thái</label>
                                        <select 
                                            className="form-control" 
                                            name="trang_thai" 
                                            value={formData.trang_thai} 
                                            onChange={handleChange}
                                        >
                                            <option value="dang hoat dong">Đang hoạt động</option>
                                            <option value="tam nghi">Tạm nghỉ</option>
                                            <option value="da nghi viec">Đã nghỉ việc</option>
                                        </select>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* BUTTONS */}
                        <div className="text-center mt-4">
                            <button type="submit" className="btn btn-primary btn-lg mr-3" disabled={loading}>
                                {loading ? 'Đang xử lý...' : (isEditing ? 'Lưu Thay Đổi' : 'Tạo HLV Mới')}
                            </button>
                            <button 
                                type="button" 
                                className="btn btn-secondary btn-lg" 
                                onClick={() => navigate('/admin/trainers')} 
                                disabled={loading}
                            >
                                Quay lại
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
}

export default TrainerFormPage;