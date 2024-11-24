const { EmbedBuilder } = require('discord.js');


module.exports = {
    name: 'messageCreate',
    async execute(client, message) {
        if (!message.content.startsWith(client.config.prefix) || message.author.bot) return;

        const args = message.content.slice(client.config.prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        const command = client.commands.get(commandName);

        if (!command) return;

        try {
            await command.execute(message, args, client);
        } catch (error) {
            console.error('Có lỗi xảy ra khi thực hiện lệnh:', error);
            await message.reply('Có lỗi xảy ra khi thực hiện lệnh này.');
        }

        if (message.channel.id === client.config.stickyChannelId && !message.author.bot) {
            // Xóa tin nhắn cũ và gửi tin nhắn sticky mới
            if (client.stickyMessageId) {
                try {
                    const lastMessage = await message.channel.messages.fetch(client.stickyMessageId);
                    await lastMessage.delete();
                } catch (err) {
                    console.error('Lỗi khi xóa tin nhắn sticky cũ:', err);
                }
            }

            if (client.stickyMessage) {
                const embed = new EmbedBuilder()
                .setColor('#e4e0d7')
                .setTitle('THANK YOU FOR BUYING!')
                .setDescription('> <:ps_dot:1278233714857611347> Bạn vui lòng để lại **đánh giá** sau khi mua hàng\n> <:ps_dot:1278233714857611347> Nhân viên sẽ ghi chú đơn hàng sau khi bạn **đánh giá** để **bảo hành** khi bạn **gặp lỗi**\n> <:ps_dot:1278233714857611347> **Đánh giá** theo mẫu sau :\n```yaml\n\n+1 legit [tên sản phẩm] ```\n**Cảm ơn bạn đã tin tưởng và ủng hộ Pretty Store!** <a:ps_heart:1280439420763508736>')
                .setFooter({ text: 'aos’ze - Sự hài lòng của bạn là niềm vui của tôi!', iconURL: client.config.IMG })
                .setThumbnail(client.config.LEGITIMG);

                try {
                    const botMessage = await message.channel.send({ embeds: [embed] });
                    client.stickyMessageId = botMessage.id; // Cập nhật ID của tin nhắn sticky
                } catch (err) {
                    console.error('Lỗi khi gửi tin nhắn sticky mới:', err);
                }
            }
        }
    },
};

module.exports = {
    name: 'messageCreate',
    async execute(message, client) {
      if (message.content === '.giadichvu') {
        const giadichvu = client.commands.get('giadichvu');
        if (giadichvu) {
          giadichvu.execute(message);
        }
      }
    }
  };
  
// index.js
client.on('messageCreate', async message => {
    if (message.author.bot) return;

    const prefix = client.config.prefix;
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (client.commands.has(command)) {
        try {
            await client.commands.get(command).execute(message, args, client);
        } catch (error) {
            console.error('Lỗi khi thực hiện lệnh:', error);
            await message.reply('Có lỗi xảy ra khi thực hiện lệnh này.');
        }
    }
});
