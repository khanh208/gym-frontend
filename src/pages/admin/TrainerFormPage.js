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

    // Đường dẫn API (Backend)
    const API_URL = 'https://neofitness-api.onrender.com';

    // State cho dữ liệu form
    const [formData, setFormData] = useState({
        chi_nhanh_id: '',
        ho_ten: '',
        mo_ta: '',
        chung_chi: '',
        kinh_nghiem: 0,
        hinh_anh: '', // Sẽ lưu đường dẫn file sau khi upload (VD: /uploads/img-123.jpg)
        trang_thai: 'dang hoat dong',
        email: '',
        password: ''
    });

    // State cho danh sách chi nhánh (dropdown)
    const [branches, setBranches] = useState([]);
    
    // Các state loading
    const [loading, setLoading] = useState(false); // Loading khi submit form
    const [uploading, setUploading] = useState(false); // Loading khi đang upload ảnh
    const [initialLoading, setInitialLoading] = useState(true); // Loading khi tải dữ liệu ban đầu
    const [error, setError] = useState('');

    // Fetch dữ liệu cần thiết (chi nhánh và dữ liệu HLV nếu sửa)
    useEffect(() => {
        const fetchData = async () => {
            setError('');
            try {
                // Lấy danh sách chi nhánh
                const branchRes = await axios.get(`${API_URL}/api/branches`);
                setBranches(branchRes.data);

                // Nếu đang sửa, fetch dữ liệu HLV hiện tại
                if (isEditing) {
                    const trainerRes = await axios.get(`${API_URL}/api/trainers/${id}`);
                    const data = trainerRes.data;
                    
                    setFormData({
                        chi_nhanh_id: data.chi_nhanh_id || '',
                        ho_ten: data.ho_ten || '',
                        mo_ta: data.mo_ta || '',
                        chung_chi: data.chung_chi || '',
                        kinh_nghiem: data.kinh_nghiem || 0,
                        hinh_anh: data.hinh_anh || '',
                        trang_thai: data.trang_thai || 'dang hoat dong',
                        email: data.email || '',
                        password: '' 
                    });
                }
            } catch (err) {
                setError('Không thể tải dữ liệu cần thiết.');
                console.error("Fetch error:", err);
            } finally {
                setInitialLoading(false);
            }
        };
        fetchData();
    }, [id, isEditing]);

    // Xử lý thay đổi input text/number
    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: type === 'number' ? (value === '' ? 0 : parseInt(value, 10)) : value
        }));
    };

    // --- HÀM XỬ LÝ UPLOAD ẢNH ---
    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('image', file);

        setUploading(true);
        try {
            const token = localStorage.getItem('accessToken');
            // Gọi API Upload đã tạo ở Backend
            const res = await axios.post(`${API_URL}/api/upload`, uploadData, {
                headers: { 
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });
            
            // Server trả về đường dẫn tương đối: /uploads/image-xxx.jpg
            // Ta lưu đường dẫn này vào state formData
            setFormData(prev => ({ ...prev, hinh_anh: res.data.filePath }));
            alert("Upload ảnh thành công!");
        } catch (err) {
            console.error("Lỗi upload:", err);
            alert("Upload ảnh thất bại. Vui lòng thử lại.");
        } finally {
            setUploading(false);
        }
    };

    // Hàm lấy URL ảnh đầy đủ để hiển thị Preview
    const getPreviewUrl = (path) => {
        if (!path) return '';
        if (path.startsWith('http')) return path; // Ảnh cũ (link online)
        return `${API_URL}${path}`; // Ảnh mới (link từ server mình)
    };

    // Xử lý submit form (Lưu thông tin HLV)
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
            ? `${API_URL}/api/trainers/${id}` 
            : `${API_URL}/api/trainers`;
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
                            {/* --- CỘT TRÁI: THÔNG TIN CÁ NHÂN & ẢNH --- */}
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

                                {/* --- UPLOAD ẢNH --- */}
                                <div className="form-group mb-3">
                                    <label>Hình Ảnh (Upload từ máy)</label>
                                    <input 
                                        type="file" 
                                        className="form-control" 
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        disabled={uploading}
                                    />
                                    {uploading && <small className="text-info">Đang tải ảnh lên...</small>}
                                    
                                    {/* Preview Ảnh */}
                                    {formData.hinh_anh && (
                                        <div className="mt-3 text-center p-2 border rounded bg-light">
                                            <p className="small text-muted mb-1">Ảnh xem trước:</p>
                                            <img 
                                                src={getPreviewUrl(formData.hinh_anh)} 
                                                alt="Preview" 
                                                style={{ height: '150px', objectFit: 'cover', borderRadius: '5px' }} 
                                            />
                                        </div>
                                    )}
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

                                {/* --- TẠO TÀI KHOẢN (Chỉ hiện khi tạo mới) --- */}
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

                                {/* --- TRẠNG THÁI (Chỉ hiện khi Edit) --- */}
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
                            <button type="submit" className="btn btn-primary btn-lg mr-3" disabled={loading || uploading}>
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