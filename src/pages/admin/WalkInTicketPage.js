// src/pages/admin/WalkInTicketPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
// Không cần import css riêng nếu đã có css chung của admin

function WalkInTicketPage() {
    // State quản lý form
    const [formData, setFormData] = useState({
        ho_ten: '',
        so_dien_thoai: '',
        chi_nhanh_id: '',
        dich_vu_id: '',
        so_tien: 50000,
        phuong_thuc_tt: 'tien_mat'
    });

    // State dữ liệu dropdown
    const [branches, setBranches] = useState([]);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(false);

    // Load dữ liệu khi vào trang
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [branchRes, serviceRes] = await Promise.all([
                    axios.get('https://neofitness-api.onrender.com/api/branches'),
                    axios.get('https://neofitness-api.onrender.com/api/services')
                ]);
                setBranches(branchRes.data);
                setServices(serviceRes.data);
                
                // Chọn mặc định cái đầu tiên
                if (branchRes.data.length > 0) {
                    setFormData(prev => ({ ...prev, chi_nhanh_id: branchRes.data[0].chi_nhanh_id }));
                }
                if (serviceRes.data.length > 0) {
                    setFormData(prev => ({ ...prev, dich_vu_id: serviceRes.data[0].dich_vu_id }));
                }
            } catch (err) {
                console.error("Lỗi tải dữ liệu:", err);
            }
        };
        fetchData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('accessToken');
            await axios.post(
                'https://neofitness-api.onrender.com/api/check-in/walk-in', 
                formData,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            alert("Đã tạo vé và Check-in thành công!");
            // Reset form
            setFormData(prev => ({ ...prev, ho_ten: '', so_dien_thoai: '' }));
        } catch (err) {
            alert(err.response?.data?.message || 'Có lỗi xảy ra.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-fluid"> {/* Class chuẩn Bootstrap/Admin */}
            <h2 className="mb-4">Bán Vé Lẻ (Khách Vãng Lai)</h2>
            
            <div className="card shadow mb-4">
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        
                        <div className="row">
                            {/* Cột Trái: Thông tin khách */}
                            <div className="col-md-6">
                                <h5 className="mb-3">Thông tin khách hàng</h5>
                                <div className="form-group mb-3">
                                    <label>Họ tên khách *</label>
                                    <input 
                                        type="text" 
                                        className="form-control"
                                        name="ho_ten"
                                        value={formData.ho_ten}
                                        onChange={handleChange}
                                        required
                                        placeholder="Nhập tên khách..."
                                    />
                                </div>
                                <div className="form-group mb-3">
                                    <label>Số điện thoại</label>
                                    <input 
                                        type="text" 
                                        className="form-control"
                                        name="so_dien_thoai"
                                        value={formData.so_dien_thoai}
                                        onChange={handleChange}
                                        placeholder="09..."
                                    />
                                </div>
                            </div>

                            {/* Cột Phải: Dịch vụ & Thanh toán */}
                            <div className="col-md-6">
                                <h5 className="mb-3">Dịch vụ & Thanh toán</h5>
                                <div className="form-group mb-3">
                                    <label>Chọn Chi nhánh</label>
                                    <select 
                                        className="form-control"
                                        name="chi_nhanh_id"
                                        value={formData.chi_nhanh_id}
                                        onChange={handleChange}
                                    >
                                        {branches.map(b => (
                                            <option key={b.chi_nhanh_id} value={b.chi_nhanh_id}>
                                                {b.ten_chi_nhanh}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group mb-3">
                                    <label>Chọn Dịch vụ (Vé ngày/Vé lượt)</label>
                                    <select 
                                        className="form-control"
                                        name="dich_vu_id"
                                        value={formData.dich_vu_id}
                                        onChange={handleChange}
                                    >
                                        {services.map(s => (
                                            <option key={s.dich_vu_id} value={s.dich_vu_id}>
                                                {s.ten}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group mb-3">
                                    <label>Giá tiền thu</label>
                                    <input 
                                        type="number" 
                                        className="form-control"
                                        name="so_tien"
                                        value={formData.so_tien}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="text-center mt-4">
                            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                                {loading ? 'Đang xử lý...' : 'Xác nhận & Check-in'}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
}

export default WalkInTicketPage;