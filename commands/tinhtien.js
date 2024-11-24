module.exports = {
    name: 'tinh',
    description: 'Tự động thực hiện phép tính với các số theo cú pháp <số1> + <số2> ... hoặc <số1> - <số2> ... hoặc <số1> * <số2> ... trong tin nhắn',
    execute(message) {
        // Kiểm tra xem tin nhắn có phép tính hợp lệ với +, -, *
        const operationPattern = /\b(\d+)(\s*[\+\-\*]\s*\d+)+\b/;
        const match = message.content.match(operationPattern);

        if (!match) {
            return; // Không có phép tính hợp lệ, không làm gì
        }

        // Xóa khoảng trắng và giữ lại biểu thức
        const expression = message.content.replace(/\s+/g, '');

        // Phát hiện loại phép toán
        let operator = '';
        if (expression.includes('+')) {
            operator = '+';
        } else if (expression.includes('-')) {
            operator = '-';
        } else if (expression.includes('*')) {
            operator = '*';
        }

        // Tách các số theo phép toán được phát hiện
        const amounts = expression.split(operator);

        let result = 0;

        // Duyệt qua các giá trị và tính toán
        for (let i = 0; i < amounts.length; i++) {
            let amount = parseInt(amounts[i]);

            // Nếu giá trị không phải là số, gửi thông báo lỗi
            if (isNaN(amount)) {
                return message.reply('Vui lòng nhập số hợp lệ. Ví dụ: `10 + 20` hoặc `10 * 2`');
            }

            // Xử lý phép toán theo vị trí
            if (i === 0) {
                result = amount; // Giá trị đầu tiên
            } else {
                if (operator === '+') {
                    result += amount;
                } else if (operator === '-') {
                    result -= amount;
                } else if (operator === '*') {
                    result *= amount;
                }
            }
        }

        // Trả về kết quả dưới dạng số thông thường
        return message.reply(`**Kết quả là:** \`${result}\``);
    }
};
