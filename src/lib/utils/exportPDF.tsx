import pdfMake from "pdfmake/build/pdfmake";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { ReportStats } from "@/app/admin/reports/reports";
import { TDocumentDefinitions } from "pdfmake/interfaces";
import html2canvas from "html2canvas";

const pdfFonts = {
  Roboto: {
    normal:
      "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Regular.ttf",
    bold: "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Medium.ttf",
    italics:
      "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Italic.ttf",
    bolditalics:
      "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-MediumItalic.ttf",
  },
};

pdfMake.fonts = pdfFonts;

interface ExportPDFParams {
  stats: ReportStats;
  reportType: string;
  dateRange: DateRange;
  chartRef?: React.RefObject<HTMLDivElement>;
}

const getVietnameseDateString = (date: Date) => {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return `ngày ${day} tháng ${month} năm ${year}`;
};

export const exportToPDF = async ({
  stats,
  reportType,
  dateRange,
  chartRef,
}: ExportPDFParams) => {
  // Chuyển đổi biểu đồ thành base64 image
  let chartImage = "";
  if (chartRef?.current) {
    const canvas = await html2canvas(chartRef.current, {
      scale: 0.75, // Giảm độ phân giải
      useCORS: true,
      logging: false,
      backgroundColor: null
    });
    chartImage = canvas.toDataURL('image/jpeg', 0.8); // Dùng JPEG thay vì PNG và giảm chất lượng
  }
  // Định nghĩa nội dung PDF
  const docDefinition: TDocumentDefinitions = {
    content: [
      {
        text: "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM",
        style: "headerDoc",
        alignment: "center",
      },
      {
        text: "Độc lập - Tự do - Hạnh phúc",
        style: "headerDoc",
        alignment: "center",
      },
      {
        text: "---------------",
        alignment: "center",
        margin: [0, 0, 0, 20],
      },
      {
        text: [
          "Số: ",
          { text: `${format(new Date(), "ddMMyyyy")}/BC-CX`, bold: true },
        ],
        alignment: "center",
        margin: [0, 0, 0, 20],
      },
      { text: "BÁO CÁO THỐNG KÊ", style: "header" },
      {
        text: `Kỳ báo cáo: ${getPeriodText(reportType, dateRange)}`,
        style: "subheader",
      },
      // Thêm thông tin về đơn vị, thời gian
      {
        text: [
          "Đơn vị báo cáo: ",
          { text: "ChronoX\n", bold: true },
          "Thời gian xuất báo cáo: ",
          { text: `${format(new Date(), "HH:mm:ss dd/MM/yyyy")}`, bold: true },
        ],
        margin: [0, 10, 0, 20],
      },
      {
        text: [
          "Căn cứ theo chức năng nhiệm vụ được giao, ",
          { text: "ChronoX", bold: true },
          " xin báo cáo kết quả hoạt động ",
          reportType === "monthly"
            ? "tháng này"
            : reportType === "quarterly"
            ? "quý này"
            : "năm này",
          " như sau:",
        ],
        style: "normalText",
        margin: [0, 0, 0, 20],
      },
      { text: "I. TỔNG QUAN", style: "section" },
      {
        style: "tableExample",
        table: {
          body: [
            [
              {
                stack: [
                  { text: "Người dùng mới:", style: "subheader" },
                  { text: `Số lượng: ${stats.newUsers.current} người dùng` },
                  {
                    text: `Tăng trưởng: ${calculateGrowth(
                      stats.newUsers.current,
                      stats.newUsers.previous
                    )}% so với kỳ trước`,
                  },
                ],
              },
            ],
            [
              {
                stack: [
                  { text: "Bài viết mới:", style: "subheader" },
                  { text: `Số lượng: ${stats.newPosts.current} bài viết` },
                  {
                    text: `Tăng trưởng: ${calculateGrowth(
                      stats.newPosts.current,
                      stats.newPosts.previous
                    )}% so với kỳ trước`,
                  },
                ],
              },
            ],
            [
              {
                stack: [
                  { text: "Lượt tương tác:", style: "subheader" },
                  { text: `Tổng số: ${stats.interactions.current} lượt` },
                  {
                    text: `Tăng trưởng: ${calculateGrowth(
                      stats.interactions.current,
                      stats.interactions.previous
                    )}% so với kỳ trước`,
                  },
                ],
              },
            ],
            [
              {
                stack: [
                  { text: "Tỷ lệ tương tác:", style: "subheader" },
                  {
                    text: `Tỷ lệ hiện tại: ${stats.interactionRate.current.toFixed(
                      1
                    )}%`,
                  },
                  {
                    text: `Thay đổi: ${calculateGrowth(
                      stats.interactionRate.current,
                      stats.interactionRate.previous
                    )}% so với kỳ trước`,
                  },
                ],
              },
            ],
          ],
        },
        layout: "headerLineOnly",
      },
      // Thêm biểu đồ vào sau phần tổng quan
      chartImage && {
        text: "Biểu đồ so sánh:",
        style: "subheader",
        margin: [0, 10, 0, 5],
      },
      chartImage && {
        image: chartImage,
        width: 500,
        alignment: "center",
        margin: [0, 0, 0, 20],
      },
      { text: "II. PHÂN TÍCH CHI TIẾT", style: "section" },
      {
        style: "normalText",
        text: [
          "1. Về người dùng mới:\n",
          `• Trong ${
            reportType === "monthly"
              ? "tháng"
              : reportType === "quarterly"
              ? "quý"
              : "năm"
          } này, hệ thống ghi nhận ${
            stats.newUsers.current
          } người dùng mới đăng ký tài khoản, `,
          stats.newUsers.current > stats.newUsers.previous
            ? "cho thấy sự tăng trưởng tích cực trong việc thu hút người dùng mới. "
            : "cho thấy cần có chiến lược mới để thu hút người dùng. ",
          "\n\n2. Về hoạt động đăng bài:\n",
          `• Với ${stats.newPosts.current} bài viết mới được đăng tải, `,
          stats.newPosts.current > stats.newPosts.previous
            ? "người dùng đang có xu hướng tích cực trong việc chia sẻ nội dung. "
            : "cần có thêm các chương trình khuyến khích người dùng đăng bài. ",
          "\n\n3. Về tương tác người dùng:\n",
          `• Tổng số ${stats.interactions.current} lượt tương tác cho thấy `,
          stats.interactions.current > stats.interactions.previous
            ? "cộng đồng đang ngày càng sôi nổi và gắn kết. "
            : "cần cải thiện tính năng tương tác và khuyến khích người dùng tham gia. ",
        ],
      },

      { text: "III. ĐÁNH GIÁ VÀ ĐỀ XUẤT", style: "section" },
      {
        style: "normalText",
        ul: [
          {
            text: "Đánh giá chung:",
            bold: true,
            margin: [0, 0, 0, 5],
          },
          stats.newUsers.current > stats.newUsers.previous &&
          stats.interactions.current > stats.interactions.previous
            ? "Nền tảng đang phát triển tốt với số lượng người dùng và tương tác tăng đều"
            : "Nền tảng cần có những điều chỉnh để tăng tương tác và thu hút người dùng",
          {
            text: "\nĐề xuất cải thiện:",
            bold: true,
            margin: [0, 10, 0, 5],
          },
          "Tối ưu hóa trải nghiệm người dùng trên nền tảng",
          "Phát triển thêm tính năng mới theo nhu cầu người dùng",
          "Tăng cường các hoạt động marketing và quảng bá",
          "Thực hiện các chương trình khuyến khích tương tác",
        ],
      },
      { text: "IV. KẾT LUẬN", style: "section" },
      {
        style: "normalText",
        text: [
          "Qua số liệu phân tích trên cho thấy ",
          stats.newUsers.current > stats.newUsers.previous &&
          stats.interactions.current > stats.interactions.previous
            ? "nền tảng đang có sự phát triển tích cực. Đề nghị tiếp tục duy trì và phát huy các hoạt động hiện tại."
            : "cần có những điều chỉnh kịp thời để cải thiện hiệu quả hoạt động của nền tảng.",
          "\n\nTrên đây là báo cáo tổng hợp tình hình hoạt động của ChronoX. Kính trình Ban Quản trị xem xét và có ý kiến chỉ đạo.",
        ],
      },

      // Thêm phần chữ ký
      {
        columns: [
          { width: "*", text: "" },
          {
            width: "40%",
            stack: [
              {
                text: "Nơi nhận:",
                bold: true,
                margin: [0, 20, 0, 5],
              },
              "- Ban Quản trị",
              "- Lưu: VT",
            ],
          },
          {
            width: "auto",
            stack: [
              {
                // Sử dụng hàm helper mới
                text: getVietnameseDateString(new Date()),
                alignment: "center",
                margin: [0, 20, 0, 5],
              },
              {
                text: "NGƯỜI LẬP BÁO CÁO",
                alignment: "center",
                bold: true,
              },
              {
                text: "(Ký, ghi rõ họ tên)",
                alignment: "center",
                italics: true,
                fontSize: 11,
                margin: [0, 5, 0, 40],
              },
              {
                text: "Hoàng Phố",
                alignment: "center",
                bold: true,
              },
            ],
          },
          { width: "*", text: "" },
        ],
      },
    ],
    styles: {
      header: {
        fontSize: 20,
        bold: true,
        alignment: "center",
        margin: [0, 0, 0, 10],
      },
      subheader: {
        fontSize: 14,
        bold: true,
        margin: [0, 5, 0, 5],
      },
      section: {
        fontSize: 16,
        bold: true,
        margin: [0, 20, 0, 10],
      },
      tableExample: {
        margin: [0, 5, 0, 15],
      },
      normalText: {
        fontSize: 12,
        margin: [0, 5, 0, 10],
        lineHeight: 1.5,
      },
    },
    defaultStyle: {
      font: "Roboto",
    },
    footer: (currentPage: number, pageCount: number) => ({
      text: `Được tạo bởi ChronoX - ${format(
        new Date(),
        "HH:mm:ss dd/MM/yyyy"
      )}`,
      alignment: "center",
      fontSize: 10,
      color: "gray",
    }),
  };

  // Tạo và tải PDF
  pdfMake
    .createPdf(docDefinition)
    .download(`bao-cao-${reportType}-${format(new Date(), "dd-MM-yyyy")}.pdf`);
};

// Helper functions
const getPeriodText = (reportType: string, dateRange: DateRange) => {
  if (reportType === "monthly") return "30 ngày gần nhất";
  if (reportType === "quarterly")
    return `Quý ${
      Math.floor(new Date().getMonth() / 3) + 1
    }/${new Date().getFullYear()}`;
  if (reportType === "yearly") return `Năm ${new Date().getFullYear()}`;
  return `Từ ${format(dateRange.from!, "dd/MM/yyyy")} đến ${format(
    dateRange.to!,
    "dd/MM/yyyy"
  )}`;
};

const calculateGrowth = (current: number, previous: number) => {
  if (previous === 0) return 0;
  return (((current - previous) / previous) * 100).toFixed(1);
};
