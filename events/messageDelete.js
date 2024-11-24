let lastDeletedMessage = null;

module.exports = {
    name: 'messageDelete',
    async execute(message) {
        if (message.author.bot) return;

        // Lưu lại tin nhắn bị xóa
        lastDeletedMessage = {
            content: message.content,
            author: message.author,
            createdAt: message.createdAt,
            channel: message.channel
        };

        console.log(`Đã lưu tin nhắn bị xóa: "${message.content}" từ ${message.author.tag}`);
    },
    getLastDeletedMessage() {
        return lastDeletedMessage;
    }
};
