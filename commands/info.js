const fs = require('fs');
const path = require('path');
const { EmbedBuilder } = require('discord.js');
const emoji = require('../utils/emoji.js');

// Đường dẫn đến file lưu trữ dữ liệu sản phẩm
const dataFilePath = path.join(__dirname, '../data/productData.json');

// Hàm để đọc dữ liệu từ file
function readData() {
    if (!fs.existsSync(dataFilePath)) {
        return {};
    }
    try {
        const data = fs.readFileSync(dataFilePath);
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading data:', error);
        return {};
    }
}

// Hàm để chuyển đổi chuỗi giá tiền thành số tiền thực
function parsePrice(priceStr) {
    if (typeof priceStr === 'string') {
        priceStr = priceStr.toLowerCase(); // Chuyển đổi chuỗi thành chữ thường
        if (priceStr.endsWith('k')) {
            return parseInt(priceStr.replace('k', '')) * 1000;
        }
        return parseInt(priceStr);
    }
    return priceStr;
}

module.exports = {
    name: 'info',
    description: 'Hiển thị thông tin về sản phẩm đã mua và tổng tiền.',
    async execute(message, args) {
        try {
            let user;
            if (args.length > 0) {
                if (/^\d+$/.test(args[0])) {
                    try {
                        user = await message.client.users.fetch(args[0]);
                    } catch (error) {
                        return message.reply('Không thể tìm thấy người dùng với ID này.');
                    }
                } else {
                    user = message.mentions.users.first();
                }
            }
            user = user || message.author; // Nếu không tìm thấy người dùng từ tag hoặc ID, sử dụng chính người gọi lệnh

            // Kiểm tra nếu user không có guildMember
            const guildMember = message.guild.members.cache.get(user.id);
            if (!guildMember) {
                return message.reply('Người dùng này không có trong server hoặc bot không thể lấy thông tin thành viên.');
            }

            const productData = readData();

            if (!productData[user.id]) {
                return message.reply('Người dùng này chưa có dữ liệu sản phẩm.');
            }

            const userData = productData[user.id];
            let totalSpent = 0;
            const productList = userData.products
                .map((p) => {
                    const parsedPrice = parsePrice(p.price);
                    totalSpent += parsedPrice;
                    return `\`\`${p.product} - ${parsedPrice.toLocaleString()} VND\`\``; // Định dạng sản phẩm và giá
                });

            const highestRole = guildMember.roles.cache
                .sort((a, b) => b.position - a.position)
                .first();

            // Lấy màu của vai trò cao nhất
            const roleColor = highestRole?.color || '#2d2d31'; // Nếu vai trò không có màu, dùng màu mặc định

            // Định dạng sản phẩm đã mua
            const formattedProductList = productList.length > 0 
                ? productList.map(product => `\`${product}\``).join('') 
                : 'Chưa có sản phẩm nào'; // Nếu không có sản phẩm nào

            // Tạo embed với màu của vai trò cao nhất
            const embed = new EmbedBuilder()
                .setColor(roleColor) // Sử dụng màu của vai trò cao nhất
                .setThumbnail(message.author.displayAvatarURL())
                .setDescription(
                    `> **Người dùng :** <@${user.id}>\n> **Ngày gia nhập :** ${new Date(userData.joinDate).toLocaleDateString()}`
                )
                .addFields(
                    { name: `${emoji.chitieu} Tổng số tiền đã chi`, value: `\`${totalSpent.toLocaleString()}\``, inline: true },
                    { name: `${emoji.sanpham} Sản phẩm đã mua`, value: formattedProductList, inline: false },
                    { name: `${emoji.vaitro} Vai trò cao nhất`, value: highestRole ? `<@&${highestRole.id}>` : 'Không có vai trò', inline: true } // Tag vai trò cao nhất
                )
                .setAuthor({ name: 'Thông tin khách hàng', iconURL: 'https://cdn-icons-png.flaticon.com/512/9385/9385289.png' })
                .setFooter({ text: user.tag, iconURL: user.displayAvatarURL() });

            message.reply({ embeds: [embed] });

        } catch (error) {
            console.error(error);
            message.reply('Đã có lỗi xảy ra khi thực hiện lệnh.');
        }
    }
};
