# Dòng code đầu tiên biết ngước nhìn mặt trời

*Logbook 02 · Năm 2023*

Mình không đến với AI từ ChatGPT, một chiếc GPU hay một khóa học deep learning. Mình đến với nó từ một vùng sáng.

Năm 2023, mình tiếp tục một đề tài nghiên cứu về thu nhận điện năng từ nhiệt mặt trời. Bài toán nghe khá thẳng: nếu nguồn nhiệt đến từ ánh sáng, hệ thống quang học cần luôn luôn hướng trực diện về phía mặt trời để hội tụ năng lượng cực đại. Nhưng mặt trời di chuyển liên tục trên bầu trời, và cơ cấu cơ khí không tự biết nó đang lệch bao nhiêu độ.

Ở đâu đó giữa phần quang học, cơ cấu truyền động và những búi dây nối chằng chịt, mình cần viết một chương trình có thể nhận ra tọa độ nguồn sáng rồi ra lệnh cho động cơ bám theo.

![Sơ đồ nguyên lý hệ thống điều khiển bám nhật hai trục (Dual-Axis Solar Tracking System)](assets/writings/solar-tracker-system.jpg)

## 1. Khi dòng lệnh bước ra thế giới vật lý

Trong những bài tập lập trình đầu tiên ở trường, kết quả thường rất lịch sự. Nhập đúng dữ liệu, chương trình in ra đúng đáp án trên terminal. Sai thì xem lại một vài dòng logic. 

Thế giới vật lý ngoài đời không lịch sự như vậy:
- Ánh sáng môi trường thay đổi liên tục: mây bay qua, ánh sáng phản xạ từ mặt đất làm sai lệch tín hiệu cảm biến.
- Cơ cấu cơ khí có độ trễ quán tính và khe hở bánh răng (backlash).
- Một chuyển động micro trên phần mềm có thể gây rung lắc giật cục trên cánh tay đón nắng.
- Một hệ thống lai giữa phần mềm, mạch điện tử và cơ khí có thể hỏng hóc theo hàng chục cách khác nhau mà không hề để lại bất kỳ thông báo lỗi nào trên màn hình.

Đó là lần đầu tiên mình hiểu: **lập trình cho phần cứng đòi hỏi phải chấp nhận sự bất toàn của thế giới thực.**

## 2. Vòng lặp phản hồi và ngưỡng dung sai (Deadband)

Trái tim của hệ thống bám nhật hai trục (Azimuth - Elevation) là một vòng lặp kín (Closed-Loop Control) liên tục đọc 4 cảm biến quang trở (LDR) bố trí bốn góc của một vách ngăn chữ thập, sau đó tính toán sai số vị trí:

```cpp
#include <Servo.h>

// Định nghĩa chân cảm biến quang trở (LDR)
const int PIN_LDR_TOP_LEFT     = A0;
const int PIN_LDR_TOP_RIGHT    = A1;
const int PIN_LDR_BOTTOM_LEFT  = A2;
const int PIN_LDR_BOTTOM_RIGHT = A3;

// Tham số điều khiển cơ cấu
const int DEADBAND_THRESHOLD   = 15;   // Ngưỡng dung sai chống rung lắc (jitter)
const int STEP_DELAY_MS        = 25;   // Chu kỳ lấy mẫu và phản hồi

Servo servoAzimuth;    // Trục góc phương vị (Đông - Tây)
Servo servoElevation;  // Trục góc nâng (Cao độ)

int currentAzimuth = 90;
int currentElevation = 45;

void updateSolarTracker() {
    // 1. Thu thập dữ liệu cường độ sáng từ 4 góc
    int tl = analogRead(PIN_LDR_TOP_LEFT);
    int tr = analogRead(PIN_LDR_TOP_RIGHT);
    int bl = analogRead(PIN_LDR_BOTTOM_LEFT);
    int br = analogRead(PIN_LDR_BOTTOM_RIGHT);

    // 2. Tính trung bình các cụm bán phần
    int avgTop    = (tl + tr) / 2;
    int avgBottom = (bl + br) / 2;
    int avgLeft   = (tl + bl) / 2;
    int avgRight  = (tr + br) / 2;

    // 3. Tính toán sai lệch tọa độ
    int deltaElevation = avgTop - avgBottom;
    int deltaAzimuth   = avgLeft - avgRight;

    // 4. Kiểm soát trục nâng (Elevation) kèm ngưỡng Deadband
    if (abs(deltaElevation) > DEADBAND_THRESHOLD) {
        if (deltaElevation > 0 && currentElevation < 140) currentElevation++;
        else if (deltaElevation < 0 && currentElevation > 15) currentElevation--;
        servoElevation.write(currentElevation);
    }

    // 5. Kiểm soát trục phương vị (Azimuth) kèm ngưỡng Deadband
    if (abs(deltaAzimuth) > DEADBAND_THRESHOLD) {
        if (deltaAzimuth > 0 && currentAzimuth < 175) currentAzimuth++;
        else if (deltaAzimuth < 0 && currentAzimuth > 5) currentAzimuth--;
        servoAzimuth.write(currentAzimuth);
    }
}
```

> [!NOTE]
> **Tầm quan trọng của Deadband:** Nếu không có ngưỡng sai lệch tối thiểu (`DEADBAND_THRESHOLD`), động cơ servo sẽ liên tục rung lắc vi mô (hunting/jitter) theo tiếng ồn tín hiệu ADC, làm mòn bánh răng cơ khí và tiêu tốn năng lượng nhiều hơn lượng điện thu hồi được từ pin mặt trời.

## 3. Khái niệm AI thực sự trong một hệ thống

Mình từng ngây thơ nghĩ phần khó nhất là phải làm sao để "nhét AI" hay mạng nơ-ron vào dự án. Nhưng rồi mình nhận ra chữ AI không có ý nghĩa gì khi câu hỏi nền tảng chưa được định nghĩa sắc nét.

Hệ thống thật có thể tóm gọn thành 5 bước tuần tự:
1. **Quan sát (Perception):** Thu thập tín hiệu quang từ cảm biến / camera.
2. **Định vị (Localization):** Tìm tâm điểm có mật độ thông lượng bức xạ cao nhất.
3. **So sánh (Error Detection):** Đối chiếu tọa độ quang học với góc pháp tuyến của gương.
4. **Hành động (Actuation):** Phát xung PWM điều chỉnh góc quay động cơ.
5. **Quan sát lại (Feedback):** Đánh giá xem quyết định vừa rồi có thực sự làm tăng hiệu suất hội tụ nhiệt hay không.

Bước thứ 5 chính là phần mang tính quyết định nhất. Không có phản hồi, thuật toán chỉ là một cỗ máy đoán mò mù quáng. Có phản hồi, nó mới bắt đầu biết tự thích nghi và sửa sai.

## 4. Dấu mốc và bài học nghiên cứu

Đề tài sau đó đạt **Giải Nhất ViSEF** và **Giải Nhì VIFOTEC** cấp tỉnh Bà Rịa - Vũng Tàu năm 2023. Những giải thưởng đó là động lực to lớn cho một học sinh phổ thông đam mê khoa học. Nhưng điều ở lại sâu sắc nhất trong tâm trí mình không phải là tấm bằng khen, mà là khoảnh khắc chứng kiến những dòng code do mình viết có thể:
- Quan sát biến thiên của vũ trụ thực,
- Đưa ra quyết định logic độc lập,
- Tạo nên một hành động vật lý chuẩn xác đón ánh bình minh.

Trước dự án này, lập trình với mình là những thuật toán đóng khung trong màn hình máy tính. Sau dự án, ranh giới đó vĩnh viễn biến mất. AI và code trở thành công cụ để kiến tạo những hệ thống hữu ích cho cuộc sống.
