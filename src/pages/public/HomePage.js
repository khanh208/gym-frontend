// src/pages/public/HomePage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './HomePage.css';
import heroImage from '../../assets/Gym_layout.jpg'; 

// --- Component FAQ Item (Cho Accordion) ---
const FaqItem = ({ faq }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="faq-item">
            <button className="faq-question" onClick={() => setIsOpen(!isOpen)}>
                <span>{faq.cau_hoi}</span>
                <span>{isOpen ? '−' : '+'}</span>
            </button>
            {isOpen && (
                <div className="faq-answer">
                    <p>{faq.cau_tra_loi}</p>
                </div>
            )}
        </div>
    );
};

function HomePage() {
    // States lưu dữ liệu
    const [trainers, setTrainers] = useState([]);
    const [services, setServices] = useState([]); // Thêm state dịch vụ
    const [pricings, setPricings] = useState([]);
    const [faqs, setFaqs] = useState([]);
    
    // State quản lý loading/error
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // API URL
    const API_URL = 'https://neofitness-api.onrender.com';

    // State Modal
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    // Fetch tất cả dữ liệu khi vào trang
    useEffect(() => {
        const fetchHomeData = async () => {
            try {
                setLoading(true);
                // Gọi song song 4 API
                const [trainerRes, serviceRes, pricingRes, faqRes] = await Promise.all([
                    axios.get(`${API_URL}/api/trainers`),
                    axios.get(`${API_URL}/api/services`),
                    axios.get(`${API_URL}/api/pricings`),
                    axios.get(`${API_URL}/api/faqs`)
                ]);

                setTrainers(trainerRes.data.slice(0, 3)); // Lấy 3 HLV
                setServices(serviceRes.data.slice(0, 3)); // Lấy 3 Dịch vụ
                setPricings(pricingRes.data.slice(0, 3)); // Lấy 3 Gói tập
                setFaqs(faqRes.data.slice(0, 5));         // Lấy 5 FAQ
                
                setLoading(false);
            } catch (err) {
                console.error("Lỗi tải dữ liệu:", err);
                setError('Không thể tải dữ liệu server.');
                setLoading(false);
            }
        };

        fetchHomeData();
    }, []);

    // Xử lý Modal
    const handleTryNowClick = (e) => {
        e.preventDefault();
        setShowModal(true);
    };
    const closeModal = () => setShowModal(false);

    // --- HÀM XỬ LÝ URL ẢNH ---
    const getImageUrl = (imagePath) => {
        if (!imagePath) return 'https://via.placeholder.com/300x400?text=No+Image';
        if (imagePath.startsWith('http')) return imagePath;
        return `${API_URL}${imagePath}`;
    };

    if (loading) return <div className="text-center py-5"><h3>Đang tải dữ liệu...</h3></div>;

    return (
        <div className="home-page">
            
            {/* 1. HERO SECTION */}
            <section className="hero-section" style={{ backgroundImage: `url(${heroImage})` }}>
                <div className="hero-overlay">
                    <div className="hero-content">
                        <h1 className="hero-title">NEOFITNESS</h1>
                        <p className="hero-subtitle">KHỞI ĐẦU HÀNH TRÌNH THAY ĐỔI BẢN THÂN</p>
                        <p className="hero-description">
                            Hệ thống phòng tập đẳng cấp 5 sao với trang thiết bị hiện đại và đội ngũ HLV chuyên nghiệp.
                        </p>
                        <div className="hero-buttons">
                            <button className="hero-button" onClick={handleTryNowClick}>Đăng ký tập thử</button>
                            <Link to="/goi-tap" className="hero-button outline">Xem bảng giá</Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* MODAL */}
            {showModal && (
                <div className="modal-backdrop" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="close-modal-btn" onClick={closeModal}>×</button>
                        <h3>Đăng ký tập thử miễn phí</h3>
                        <p>Bạn chưa có tài khoản? Đăng ký ngay để nhận ưu đãi!</p>
                        <div className="modal-buttons">
                            <Link to="/register" className="btn btn-primary" onClick={closeModal}>Tạo tài khoản mới</Link>
                            <Link to="/login" className="btn btn-outline-primary" onClick={closeModal}>Đã có tài khoản</Link>
                        </div>
                    </div>
                </div>
            )}

            {/* 2. DỊCH VỤ NỔI BẬT (Đã thêm lại phần này) */}
            <section className="section-container">
                <h2 className="section-title">Dịch Vụ Của Chúng Tôi</h2>
                <p className="section-desc">Trải nghiệm đa dạng các bộ môn tập luyện</p>
                <div className="row mt-4">
                    {services.map(service => (
                        <div className="col-md-4 mb-4" key={service.dich_vu_id}>
                            <div className="card h-100 shadow-sm border-0 service-card">
                                {/* Nếu dịch vụ có hình ảnh thì hiển thị, nếu không dùng placeholder */}
                                <img 
                                    src={getImageUrl(service.hinh_anh)} 
                                    className="card-img-top" 
                                    alt={service.ten}
                                    style={{ height: '200px', objectFit: 'cover' }}
                                    onError={(e) => {e.target.src = 'https://via.placeholder.com/350x200?text=Service'}}
                                />
                                <div className="card-body text-center">
                                    <h5 className="card-title font-weight-bold">{service.ten}</h5>
                                    <p className="card-text text-muted">
                                        {service.mo_ta ? service.mo_ta.substring(0, 80) + '...' : 'Mô tả đang cập nhật'}
                                    </p>
                                    <Link to="/dich-vu" className="btn btn-outline-primary btn-sm">Xem chi tiết</Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 3. GÓI TẬP PHỔ BIẾN */}
            <section className="section-container bg-light">
                <h2 className="section-title">Gói Tập Phổ Biến</h2>
                <div className="pricing-grid">
                    {pricings.map(pkg => (
                        <div className="pricing-card" key={pkg.gia_id}>
                            <div className="pricing-header">
                                <h3>{pkg.ten_goi_tap}</h3>
                                <p className="price">
                                    {Number(pkg.gia).toLocaleString('vi-VN')} đ
                                    <span className="duration"> / {pkg.thoi_han}</span>
                                </p>
                            </div>
                            <div className="pricing-body">
                                <ul>
                                    <li>Thời gian: {pkg.ca_buoi || 'Tự do'}</li>
                                    <li>Được sử dụng tủ đồ cá nhân</li>
                                    <li>Miễn phí vé gửi xe</li>
                                    <li>Sử dụng phòng xông hơi</li>
                                </ul>
                                <Link to={`/goi-tap/${pkg.goi_tap_id}`} className="btn-select-plan">Chọn gói này</Link>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 4. ĐỘI NGŨ HLV */}
            <section className="section-container">
                <h2 className="section-title">Đội Ngũ Huấn Luyện Viên</h2>
                <div className="trainers-grid">
                    {trainers.map(trainer => (
                        <div className="trainer-card" key={trainer.hlv_id}>
                            <div className="trainer-image-wrapper">
                                <img 
                                    src={getImageUrl(trainer.hinh_anh)} 
                                    alt={trainer.ho_ten} 
                                    className="trainer-img"
                                />
                            </div>
                            <div className="trainer-info">
                                <h3>{trainer.ho_ten}</h3>
                                <p className="trainer-role">Chi nhánh: {trainer.ten_chi_nhanh || 'Toàn hệ thống'}</p>
                                <p className="trainer-exp">{trainer.kinh_nghiem} năm kinh nghiệm</p>
                                <Link to="/hlv-ca-nhan" className="btn-view-profile">Xem hồ sơ</Link>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="text-center mt-4">
                     <Link to="/hlv-ca-nhan" className="btn-view-all">Xem tất cả HLV</Link>
                </div>
            </section>

            {/* 5. FAQ */}
            <section className="section-container bg-light">
                <h2 className="section-title">Câu Hỏi Thường Gặp</h2>
                <div className="faq-container">
                    <div className="faq-list">
                        {error && <p className="text-danger">{error}</p>}
                        {faqs.map(faq => (
                            <FaqItem key={faq.cau_hoi_id} faq={faq} />
                        ))}
                    </div>
                </div>
            </section>

            {/* 6. CALL TO ACTION */}
            <section className="cta-section">
                <div className="section-container cta-container">
                    <div className="cta-content">
                        <h2 className="section-title text-white">Ưu Đãi Đặc Biệt</h2>
                        <p className="cta-title">Đăng ký ngay hôm nay để nhận 1 buổi PT miễn phí</p>
                        <p className="cta-description">
                            Chương trình áp dụng cho 50 khách hàng đầu tiên trong tháng tại NeoFitness.
                        </p>
                    </div>
                    <div className="cta-action">
                        <Link to="/goi-tap" className="hero-button">Đăng ký ngay</Link>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default HomePage;