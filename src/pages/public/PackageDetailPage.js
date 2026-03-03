// src/pages/public/PackageDetailPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './PackageDetailPage.css';

function PackageDetailPage() {
    const { id } = useParams(); // gia_id
    const navigate = useNavigate();

    const [pricePackage, setPricePackage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // --- State dùng chung ---
    const [activationDate, setActivationDate] = useState(''); // State cho ngày kích hoạt

    // State cho form đăng ký tư vấn
    const [formData, setFormData] = useState({ ho_ten: '', so_dien_thoai: '', email: '' });
    
    // State cho Lỗi/Thành công (dùng chung cho cả 3 luồng)
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');

    // State cho luồng Mua Ngay / Gói Thử
    const [isCustomerLoggedIn, setIsCustomerLoggedIn] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [isFreePackage, setIsFreePackage] = useState(false);

    // Hàm lấy ngày hôm nay (YYYY-MM-DD)
    const getTodayString = () => {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };

    // Fetch dữ liệu chi tiết của gói giá và kiểm tra đăng nhập
    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        const role = localStorage.getItem('userRole');
        if (token && role === 'customer') {
            setIsCustomerLoggedIn(true);
        }

        const fetchPackageDetail = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`https://neofitness-api.onrender.com/api/pricings/${id}`);
                setPricePackage(response.data);
                
                if (parseFloat(response.data.gia_goc) === 0) {
                    setIsFreePackage(true);
                }
            } catch (err) {
                setError('Không thể tải chi tiết gói tập.');
                console.error("Fetch package detail error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPackageDetail();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    
    // --- HÀM XỬ LÝ NÚT CHÍNH (Mua ngay HOẶC Nhận miễn phí) ---
    const handleMainAction = async () => {
        if (!isCustomerLoggedIn) {
            alert("Vui lòng đăng nhập để thực hiện thao tác này.");
            navigate('/login', { state: { from: `/goi-tap/${id}` } }); 
            return;
        }

        // --- THÊM: Validate dữ liệu nhập vào ---
        if (!activationDate) {
            setFormError('Vui lòng chọn ngày bạn muốn kích hoạt gói tập.');
            return;
        }
        if (!isFreePackage) {
            // Nếu là gói có phí thì bắt buộc nhập tên và sđt
            if (!formData.ho_ten || !formData.so_dien_thoai) {
                setFormError('Vui lòng nhập đầy đủ Họ tên và Số điện thoại để ghi danh.');
                return;
            }
        }

        setActionLoading(true);
        setFormError('');
        setFormSuccess('');
        const token = localStorage.getItem('accessToken');

        if (isFreePackage) {
            // --- LUỒNG ĐĂNG KÝ GÓI THỬ ---
            try {
                const response = await axios.post(
                    'https://neofitness-api.onrender.com/api/customer/register-free-trial',
                    { gia_id: id, ngay_kich_hoat: activationDate }, // Gửi kèm ngày
                    { headers: { 'Authorization': `Bearer ${token}` } }
                );
                setFormSuccess(response.data.message + " Bạn có thể xem trong 'Hồ sơ của tôi'.");
                setActivationDate(''); // Reset ngày
            } catch (err) {
                setFormError(err.response?.data?.message || 'Đăng ký gói thử thất bại.');
                console.error("Free trial registration error:", err.response?.data || err.message);
            } finally {
                setActionLoading(false);
            }

        } else {
           // --- SỬA LUỒNG MUA NGAY (MOMO) ---
        if (!isFreePackage) {
            try {
                const response = await axios.post(
                    'https://neofitness-api.onrender.com/api/payments',
                    { 
                        gia_id: id, 
                        ngay_kich_hoat: activationDate,
                        // Gửi thêm thông tin khách hàng
                        ho_ten: formData.ho_ten, 
                        so_dien_thoai: formData.so_dien_thoai
                    }, 
                    { headers: { 'Authorization': `Bearer ${token}` } }
                );
                if (response.data.payUrl) {
                    window.location.href = response.data.payUrl;
                }
            } catch (err) {
                setFormError(err.response?.data?.message || 'Không thể tạo thanh toán.');
            } finally {
                setActionLoading(false);
            }
        }
        }
    }
    const formatCurrency = (amount) => {
        if (amount === null || amount === undefined) return '';
        const numericAmount = Number(amount);
        if (isNaN(numericAmount)) return '';
        return new Intl.NumberFormat('vi-VN').format(numericAmount);
    };

    if (loading) return <div className="page-container" style={{ color: 'white', textAlign: 'center', paddingTop: '50px' }}><p>Đang tải...</p></div>;
    if (error) return <div className="page-container" style={{ color: 'red', textAlign: 'center', paddingTop: '50px' }}><p>{error}</p></div>;
    if (!pricePackage) return <div className="page-container" style={{ color: 'white', textAlign: 'center', paddingTop: '50px' }}><p>Không tìm thấy gói tập.</p></div>;

    return (
        <div className="package-detail-container">
            <div className="package-detail-grid">
                
                {/* --- CỘT THÔNG TIN GÓI TẬP --- */}
                <div className="package-info">
                    <span className="package-info-type">{pricePackage.thoi_han}</span>
                    <h1 className="package-info-title">{pricePackage.ten_goi_tap_full || pricePackage.ten_goi_tap}</h1>
                    {pricePackage.khuyen_mai_id && (
                        <span className="package-info-badge">Đang giảm {pricePackage.giam_gia_phantram}%</span>
                    )}
                    <p className="package-info-description">
                        {pricePackage.mo_ta_chi_tiet || "Hiện chưa có mô tả chi tiết cho gói tập này."}
                    </p>
                    <div className="package-info-price">
                        <span className="final-price">{isFreePackage ? "Miễn Phí" : `${formatCurrency(pricePackage.gia_cuoi_cung)} VND`}</span>
                        {pricePackage.gia_khuyen_mai !== null && !isFreePackage && (
                            <span className="original-price">{formatCurrency(pricePackage.gia_goc)}</span>
                        )}
                    </div>
                    <ul className="package-info-features">
                        {pricePackage.ca_buoi > 0 && (
                            <li>{pricePackage.ca_buoi} buổi tập 1:1</li>
                        )}
                        <li>Tặng 1 buổi InBody</li>
                        <li>Sử dụng khu vực xông hơi</li>
                    </ul>
                </div>

                {/* --- CỘT FORM ĐĂNG KÝ --- */}
                <div className="package-register-form">
                    
                    {/* Hiển thị lỗi chung (nếu có) */}
                    {formSuccess && <p className="contact-success-message">{formSuccess}</p>}
                    {formError && <p className="contact-error-message">{formError}</p>}

                    {/* --- Ô CHỌN NGÀY (DÙNG CHUNG) --- */}
                    <div className="form-group-contact">
                        <label htmlFor="activationDate">Chọn ngày kích hoạt *</label>
                        <input 
                            type="date" 
                            id="activationDate" 
                            name="activationDate"
                            value={activationDate}
                            onChange={(e) => setActivationDate(e.target.value)}
                            min={getTodayString()} // Không cho chọn ngày quá khứ
                            required
                        />
                    </div>
                    {/* --- KẾT THÚC Ô CHỌN NGÀY --- */}

                    {isFreePackage ? (
                        
                        // --- LUỒNG 1: GÓI MIỄN PHÍ ---
                        <>
                            <h3 style={{marginTop: '20px'}}>Đăng ký gói tập thử</h3>
                            <p>Gói tập này miễn phí. Nhấn nút bên dưới để kích hoạt gói vào hồ sơ của bạn.</p>
                            <button 
                                className="hero-button" 
                                onClick={handleMainAction} 
                                disabled={actionLoading}
                                style={{ backgroundColor: '#4CAF50', width: '100%', marginBottom: '10px' }}
                            >
                                {actionLoading ? 'Đang xử lý...' : (isCustomerLoggedIn ? 'Nhận gói thử miễn phí' : 'Đăng nhập để nhận gói')}
                            </button>
                            {!isCustomerLoggedIn && (
                                <p style={{fontSize: '0.9em', color: '#ccc', textAlign: 'center'}}>Bạn cần có tài khoản để nhận gói thử.</p>
                            )}
                        </>

                    ) : (

                        // --- LUỒNG 2: GÓI CÓ PHÍ ---
                        <>
                            <h3 style={{marginTop: '20px'}}>Thông tin đăng ký</h3>
                            
                            {/* Thêm ô nhập Họ tên */}
                            <div className="form-group-contact">
                                <label>Họ và Tên *</label>
                                <input 
                                    type="text" 
                                    name="ho_ten" 
                                    value={formData.ho_ten} 
                                    onChange={handleChange} 
                                    placeholder="Nhập họ tên của bạn"
                                />
                            </div>

                            {/* Thêm ô nhập SĐT */}
                            <div className="form-group-contact">
                                <label>Số điện thoại *</label>
                                <input 
                                    type="text" 
                                    name="so_dien_thoai" 
                                    value={formData.so_dien_thoai} 
                                    onChange={handleChange} 
                                    placeholder="Để nhân viên liên hệ khi cần"
                                />
                            </div>

                            <div className="payment-action" style={{marginTop: '20px'}}>
                                <h3>Thanh toán</h3>
                                <p>Thanh toán qua ví MoMo để kích hoạt ngay.</p>
                                <button 
                                    className="hero-button" 
                                    onClick={handleMainAction} 
                                    disabled={actionLoading}
                                    style={{ backgroundColor: '#A50064', width: '100%' }} // Màu Momo
                                >
                                    {actionLoading ? 'Đang xử lý...' : 'Thanh toán MoMo'}
                                </button>
                            </div>
                        </>
                    )}
                    
                </div>
            </div>
        </div>
    );
}

export default PackageDetailPage;