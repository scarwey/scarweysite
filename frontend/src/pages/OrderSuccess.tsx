import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import * as Icons from 'react-icons/fi';

const FiCheckCircle = Icons.FiCheckCircle as any;
const FiPackage = Icons.FiPackage as any;
const FiMail = Icons.FiMail as any;
const FiArrowRight = Icons.FiArrowRight as any;

const OrderSuccess: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const navigate = useNavigate();

  // WhatsApp iletişim linki
  const handleContactUs = () => {
    const phoneNumber = "905419407534";
    const message = "Merhaba! Scarwey hakkında bilgi almak istiyorum.";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  useEffect(() => {
    // If no order number, redirect to home
    if (!orderNumber) {
      navigate('/');
    }
  }, [orderNumber, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-2xl w-full">
        {/* Success Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-12 text-center">
          {/* Success Icon */}
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-green-100 rounded-full flex items-center justify-center">
                <FiCheckCircle className="w-10 h-10 md:w-12 md:h-12 text-green-600" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 md:w-8 md:h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <FiPackage className="w-3 h-3 md:w-4 md:h-4 text-orange-600" />
              </div>
            </div>
          </div>

          {/* Success Message */}
          <h1 className="text-2xl md:text-4xl font-bold text-gray-800 mb-4">
            Siparişiniz Alındı!
          </h1>
          <p className="text-base md:text-lg text-gray-600 mb-6 md:mb-8">
            Siparişiniz başarıyla oluşturuldu ve işleme alındı.
          </p>

          {/* Order Number - Mobil Optimize */}
          <div className="bg-orange-50 rounded-xl p-4 md:p-6 mb-6 md:mb-8">
            <p className="text-xs md:text-sm text-gray-600 mb-2">Sipariş Numaranız</p>
            <p className="text-lg md:text-2xl font-bold text-orange-600 break-all leading-tight">
              {orderNumber}
            </p>
            <p className="text-xs md:text-sm text-gray-500 mt-2">
              Bu numarayı kullanarak siparişinizi takip edebilirsiniz.
            </p>
          </div>

          {/* Info Boxes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-6 md:mb-8">
            <div className="bg-gray-50 rounded-lg p-3 md:p-4 text-left">
              <div className="flex items-start gap-2 md:gap-3">
                <FiMail className="w-4 h-4 md:w-5 md:h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-800 text-xs md:text-sm">E-posta Gönderildi</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Sipariş detaylarınız e-posta adresinize gönderildi.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 md:p-4 text-left">
              <div className="flex items-start gap-2 md:gap-3">
                <FiPackage className="w-4 h-4 md:w-5 md:h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-800 text-xs md:text-sm">Kargoya Hazırlanıyor</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Siparişiniz 1-2 iş günü içinde kargoya verilecek.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="border-t pt-6 md:pt-8">
            <h2 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4">Sıradaki Adımlar</h2>
            <div className="space-y-2 md:space-y-3 text-left max-w-md mx-auto">
              <div className="flex items-start gap-2 md:gap-3">
                <div className="w-5 h-5 md:w-6 md:h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-orange-600">1</span>
                </div>
                <p className="text-xs md:text-sm text-gray-600">
                  Siparişiniz onaylandı ve ödeme işlemi başarıyla tamamlandı.
                </p>
              </div>
              <div className="flex items-start gap-2 md:gap-3">
                <div className="w-5 h-5 md:w-6 md:h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-orange-600">2</span>
                </div>
                <p className="text-xs md:text-sm text-gray-600">
                  Ürünleriniz depomuzda hazırlanıp paketlenecek.
                </p>
              </div>
              <div className="flex items-start gap-2 md:gap-3">
                <div className="w-5 h-5 md:w-6 md:h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-orange-600">3</span>
                </div>
                <p className="text-xs md:text-sm text-gray-600">
                  Kargo firmasına teslim edildiğinde mail ile bilgilendirilecek.
                </p>
              </div>
              <div className="flex items-start gap-2 md:gap-3">
                <div className="w-5 h-5 md:w-6 md:h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-orange-600">4</span>
                </div>
                <p className="text-xs md:text-sm text-gray-600">
                  Siparişiniz belirtilen adrese teslim edilecek.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mt-6 md:mt-8">
            <Link
              to="/orders"
              className="flex-1 bg-orange-500 text-white py-2.5 md:py-3 px-4 md:px-6 rounded-lg font-semibold hover:bg-orange-600 transform hover:scale-105 transition duration-300 flex items-center justify-center gap-2 text-sm md:text-base"
            >
              Siparişlerim
              <FiArrowRight size={16} />
            </Link>
            <Link
              to="/products"
              className="flex-1 bg-white text-orange-600 border-2 border-orange-600 py-2.5 md:py-3 px-4 md:px-6 rounded-lg font-semibold hover:bg-orange-50 transform hover:scale-105 transition duration-300 text-sm md:text-base"
            >
              Alışverişe Devam Et
            </Link>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-4 md:mt-6 text-center">
          <p className="text-xs md:text-sm text-gray-600">
            Sorularınız mı var?{' '}
            <button 
              onClick={handleContactUs}
              className="text-orange-600 hover:text-orange-700 font-medium underline"
            >
              Bize ulaşın
            </button>
           
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;