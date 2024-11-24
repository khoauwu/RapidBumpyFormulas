const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'addrole',
    description: 'Thêm vai trò cho người dùng',
    async execute(message, args) {
        // Kiểm tra quyền của người dùng
        if (!message.member.permissions.has('MANAGE_ROLES')) {
            return message.channel.send('Bạn không có quyền thêm vai trò.').then(msg => setTimeout(() => msg.delete(), 5000));
        }

        // Kiểm tra nếu người dùng được đề cập (mention) hoặc sử dụng user ID
        let targetUser = message.mentions.members.first();
        if (!targetUser && args[0]) {
            try {
                targetUser = await message.guild.members.fetch(args[0]);
            } catch (err) {
                return message.channel.send('Không tìm thấy người dùng với ID đã cung cấp.').then(msg => setTimeout(() => msg.delete(), 5000));
            }
        }

        if (!targetUser) {
            return message.channel.send('Vui lòng đề cập người dùng hoặc cung cấp ID của họ để thêm vai trò.').then(msg => setTimeout(() => msg.delete(), 5000));
        }

        // Kiểm tra nếu vai trò được đề cập hoặc nhập tên
        let role = message.mentions.roles.first();
        if (!role && args[1]) {
            const roleName = args.slice(1).join(' ');
            role = message.guild.roles.cache.find(r => r.name.toLowerCase() === roleName.toLowerCase()); // So sánh không phân biệt chữ hoa
        }

        if (!role) {
            // In ra danh sách vai trò để kiểm tra
            const roles = message.guild.roles.cache.map(r => r.name).join(', ');
            return message.channel.send(`Không tìm thấy vai trò. Vui lòng kiểm tra lại tên vai trò.\nDanh sách vai trò hiện tại: ${roles}`).then(msg => setTimeout(() => msg.delete(), 10000));
        }

        if (targetUser.roles.cache.has(role.id)) {
            return message.channel.send(`Người dùng đã có vai trò \`${role.name}\`.`).then(msg => setTimeout(() => msg.delete(), 5000));
        }

        // Thêm vai trò
        await targetUser.roles.add(role);

        // Tạo embed để thông báo thêm vai trò
        const embed = new EmbedBuilder()
            .setColor('#CC99FF')
            .setTitle('Vai trò đã được thêm')
            .setAuthor({ name: targetUser.user.tag, iconURL: targetUser.user.displayAvatarURL() })
            .setDescription(`**Người dùng:** ${targetUser}\n**Vai trò thêm vào:** ${role}`)
            .setTimestamp();

        return message.reply({ embeds: [embed] });
    },
};
