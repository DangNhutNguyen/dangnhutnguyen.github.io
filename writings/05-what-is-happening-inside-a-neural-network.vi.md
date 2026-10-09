# Bên trong một mạng neural đang diễn ra chuyện gì?

*Logbook 05 · Năm 2024*

Mạng neural từng là một cái hộp khá lịch sự với mình. Mình đưa dữ liệu vào, gọi vài hàm từ framework, chọn optimizer, rồi chờ một con số accuracy đi lên. Nếu nó tăng, mình vui. Nếu nó đứng yên, mình đổi learning rate hoặc tìm một notebook khác. Cách làm ấy đủ để bắt đầu, nhưng để lại một câu hỏi hơi khó chịu: **Bên trong cái hộp đang thật sự diễn ra chuyện gì?**

Năm 2024, mình làm một neural network from scratch và thử huấn luyện nó với MNIST. Mục tiêu không phải tạo một mô hình nhận dạng chữ số tốt hơn những thứ đã có từ rất lâu. Mục tiêu là tự tay viết ra đủ các bước để mình không còn có thể trốn sau một lệnh gọi thư viện.

![Kiến trúc mạng neural nhiều tầng và dòng lan truyền gradient ngược (Backpropagation)](assets/writings/neural-network-from-scratch.jpg)

## 1. Bản chất toán học sau chiếc hộp đen

Nếu bỏ hết phần trang trí, một layer cơ bản nhận đầu vào $X$, nhân với ma trận trọng số $W$, cộng bias $b$ rồi đi qua activation function $\sigma$:

$$Z = X \cdot W + b$$
$$A = \sigma(Z)$$

Vấn đề không nằm ở việc đọc công thức trên bảng. Vấn đề là biến công thức đó thành code mà mọi ma trận có kích thước đúng, dữ liệu đi đúng chiều và các giá trị số không bị tràn (overflow) hay triệt tiêu (vanishing) sau vài vòng lặp huấn luyện.

Mình bắt đầu phải quan tâm đến những thứ framework thường xử lý âm thầm:
- Mỗi tensor đang có **shape** chính xác là bao nhiêu?
- Trục nào đại diện cho batch size $(N, D_{in})$?
- Vector bias được broadcast như thế nào khi cộng vào ma trận tích chập/tuyến tính?
- Lớp activation cần lưu lại (cache) những giá trị nào của forward pass để phục vụ cho backward pass?
- Hàm loss được tính trên từng mẫu đơn lẻ hay lấy trung bình theo batch?

> [!NOTE]
> Rất nhiều lỗi machine learning thực chất không phải là lỗi thuật toán cao siêu, mà là **lỗi kế toán** (accounting errors). Ta làm mất dấu một đại lượng đang ở đâu, bị cộng lặp bao nhiêu lần, hoặc chia trung bình sai trục tensor.

## 2. Xây dựng Dense Layer từ số 0 (NumPy)

Dưới đây là cách mình cài đặt một tầng kết nối đầy đủ (Dense / Linear layer) bằng Python thuần với đầy đủ cả hai pha: lan truyền xuôi (Forward Propagation) và lan truyền ngược (Backpropagation):

```python
import numpy as np

class DenseLayer:
    """
    Tầng kết hợp tuyến tính Z = X.W + b và tính đạo hàm gradient ngược.
    """
    def __init__(self, in_features: int, out_features: int):
        # Khởi tạo trọng số theo phân phối He/Kaiming để ổn định phương sai
        limit = np.sqrt(2.0 / in_features)
        self.weights = np.random.randn(in_features, out_features) * limit
        self.biases = np.zeros((1, out_features))
        
        # Bộ đệm lưu trữ trạng thái cho bước backward
        self.inputs_cache = None
        self.grad_weights = None
        self.grad_biases = None

    def forward(self, x: np.ndarray) -> np.ndarray:
        """
        x shape: (batch_size, in_features)
        output shape: (batch_size, out_features)
        """
        self.inputs_cache = x
        return np.dot(x, self.weights) + self.biases

    def backward(self, grad_output: np.ndarray) -> np.ndarray:
        """
        grad_output: dL/dZ từ tầng kế tiếp truyền ngược về
        Trả về: dL/dX để truyền tiếp cho tầng phía trước
        """
        batch_size = self.inputs_cache.shape[0]
        
        # Đạo hàm đối với weights: dL/dW = X.T @ (dL/dZ)
        self.grad_weights = np.dot(self.inputs_cache.T, grad_output)
        
        # Đạo hàm đối với biases: dL/db = sum(dL/dZ) dọc theo trục batch
        self.grad_biases = np.sum(grad_output, axis=0, keepdims=True)
        
        # Đạo hàm truyền về tầng trước: dL/dX = (dL/dZ) @ W.T
        grad_input = np.dot(grad_output, self.weights.T)
        return grad_input
```

Forward pass kể câu chuyện từ dữ liệu thô đến dự đoán xác suất. Backpropagation bắt mình kể lại câu chuyện ấy theo chiều ngược lại: một sai lệch ở hàm mất mát (loss) liên quan đến từng trọng số trước đó như thế nào?

Trên giấy nháp, quy tắc dây chuyền (chain rule) trông rất gọn. Nhưng trong code máy tính, nó là một **chuỗi phân công trách nhiệm**. Mỗi layer phải biết gradient nhận từ phía sau là gì, tính đạo hàm cục bộ của chính mình, rồi đẩy gradient tiếp tục về phía trước.

Chỉ cần nhầm một phép chuyển vị ma trận (`.T`) hoặc sai một chiều cộng `axis`, chương trình có thể sụp đổ ngay lập tức. Tệ hơn nữa là trường hợp nó không báo lỗi: mô hình vẫn chạy đều, loss vẫn nhảy nhót, nhưng trọng số không bao giờ hội tụ.

> [!TIP]
> **Kỹ thuật Gradient Checking:** Khi code backward pass từ đầu, luôn kiểm tra gradient giải tích (analytical gradient) so với gradient số học hữu hạn (finite difference) trên một mạng mini với ma trận nhỏ:
> 
> $$\frac{\partial L}{\partial \theta} \approx \frac{L(\theta + \epsilon) - L(\theta - \epsilon)}{2\epsilon}$$
> 
> Nếu sai số tương đối vượt quá $10^{-6}$, chắc chắn phép tính backward của bạn đang bị sai đạo hàm ở đâu đó.

## 3. Cảm giác khi cỗ máy tự học

Có những đêm accuracy đứng im ở mức 10%. Có lúc loss biến thiên bất thường, vọt lên vô cực (`NaN`). Có lúc sửa được một tensor shape thì một module khác phản đối. Những lỗi này không dễ chịu khi gặp phải, nhưng chúng làm cho các ký hiệu trong sách giáo khoa thôi còn là lý thuyết suông. Gradient không còn là một mũi tên trang trí trên sơ đồ bài giảng. Nó là dòng chảy số liệu đang di chuyển tuần hoàn qua hệ thống do chính tay mình viết.

MNIST là bộ dữ liệu quen thuộc đến mức gần như thành “Hello, World!” của computer vision. Nhưng điều đó lại hoàn hảo cho mục tiêu này: mình không cần một bài toán mới lạ; mình cần một bài toán chuẩn mực để mọi lỗi lầm phát sinh chắc chắn đến từ sự hiểu sai của chính mình.

Khi mô hình đạt 97% accuracy sau 15 epoch, cảm giác không phải là niềm vui đạt benchmark. Đó là cảm giác một cỗ máy nhỏ bằng toán học cuối cùng đã chịu tuân theo chuỗi suy luận logic mình đặt ra.

## 4. Bài học rút ra

Project from scratch rất dễ tạo ảo tưởng “mình hiểu hết rồi” chỉ vì ta đã viết hàng trăm dòng code. Nhưng code dài không phải bằng chứng của năng lực. Nếu làm lại từ đầu, mình sẽ tuân thủ nghiêm ngặt:
1. **Kiểm tra đơn vị từng layer độc lập:** Đưa dữ liệu đầu vào nhỏ có thể nhẩm bằng tay để xác nhận output.
2. **Ép mạng overfit trên 5 mẫu dữ liệu:** Nếu mô hình không thể ép loss về 0 trên một tập dữ liệu tí hon, việc cố nạp toàn bộ dataset vào chỉ lãng phí thời gian tính toán.
3. **Theo dõi phân phối trọng số:** Không chỉ nhìn vào scalar loss; cần xem tensor gradient có bị suy biến hoặc phát nổ không.

Giờ đây, mình không còn nghĩ dùng thành thạo một API nghĩa là đã thấu hiểu mô hình. Mình cũng không nghĩ phải tự viết mọi thứ từ đầu mới là học nghiêm túc. Điều cốt lõi là ta biết **lớp trừu tượng (abstraction) đang ẩn giấu điều gì, và khi nào cần mở chiếc hộp ra để tối ưu hóa**.
