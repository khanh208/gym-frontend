// src/pages/admin/WalkInHistoryPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const WalkInHistoryPage = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const res = await axios.get('https://neofitness-api.onrender.com/api/check-in/history', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setHistory(res.data);
        } catch (error) {
            console.error("Lỗi tải lịch sử:", error);
            alert("Không thể tải danh sách check-in.");
        } finally {
            setLoading(false);
        }
    };

    // Hàm format ngày giờ
    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleString('vi-VN');
    };

    return (
        <div className="container-fluid">
            <h2 className="mb-4">Lịch Sử Ra Vào (Check-in)</h2>

            <div className="card shadow mb-4">
                <div className="card-header py-3">
                    <h6 className="m-0 font-weight-bold text-primary">Danh sách khách hàng đã check-in</h6>
                </div>
                <div className="card-body">
                    <div className="table-responsive">
                        {loading ? (
                            <p className="text-center">Đang tải dữ liệu...</p>
                        ) : (
                            <table className="table table-bordered table-hover" width="100%" cellSpacing="0">
                                <thead className="thead-light">
                                    <tr>
                                        <th>Thời gian vào</th>
                                        <th>Khách hàng</th>
                                        <th>SĐT</th>
                                        <th>Dịch vụ / Gói</th>
                                        <th>Chi nhánh</th>
                                        <th>Loại hình</th>
                                        <th>Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.length > 0 ? (
                                        history.map((item) => (
                                            <tr key={item.check_in_id}>
                                                <td>{formatDate(item.thoi_gian_vao)}</td>
                                                <td className="font-weight-bold">{item.ho_ten}</td>
                                                <td>{item.so_dien_thoai}</td>
                                                <td>
                                                    <span className="badge badge-info">{item.ten_dich_vu}</span>
                                                </td>
                                                <td>{item.ten_chi_nhanh}</td>
                                                <td>
                                                    {item.loai_hinh === 've_le' ? (
                                                        <span className="badge badge-warning">Khách vãng lai</span>
                                                    ) : (
                                                        <span className="badge badge-success">Hội viên</span>
                                                    )}
                                                </td>
                                                <td>{item.trang_thai}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="text-center">Chưa có lượt check-in nào.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WalkInHistoryPage;