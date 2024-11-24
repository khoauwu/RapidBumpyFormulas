module.exports = {
    name: 'say',
    description: 'Bot sẽ lặp lại tin nhắn của bạn.',
    async execute(message, args) {
        try {
            // Kết hợp tất cả các đối số thành một chuỗi
            const sayMessage = args.join(' ');

            // Kiểm tra nếu không có tin nhắn để gửi
            if (!sayMessage) {
                return message.reply('Bạn cần cung cấp một tin nhắn để tôi có thể nói.');
            }

            // Cố gắng xóa tin nhắn chứa lệnh để giữ cho kênh gọn gàng
            try {
                await message.delete();
            } catch (error) {
                console.error('Đã xảy ra lỗi khi xóa tin nhắn:', error);
                // Tiếp tục lệnh ngay cả khi không thể xóa tin nhắn
            }

            // Gửi tin nhắn
            await message.channel.send(sayMessage);
        } catch (error) {
            console.error('Đã xảy ra lỗi khi thực hiện lệnh say:', error);
            message.reply('Đã xảy ra lỗi khi tôi cố gắng gửi tin nhắn. Vui lòng thử lại.');
        }
    },
};
