const fs = require('fs');
const path = require('path');
const { EmbedBuilder } = require('discord.js');

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

// Hàm để ghi dữ liệu vào file
function writeData(data) {
    try {
        fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error writing data:', error);
    }
}

// Hàm chuyển đổi giá tiền từ chuỗi có chứa "k" thành số
function parsePrice(priceInput) {
    const lowerCasePrice = priceInput.toLowerCase(); // Chuyển giá tiền về chữ thường để xử lý "k" hoặc "K"
    if (lowerCasePrice.endsWith('k')) {
        // Nếu giá tiền kết thúc bằng 'k', chuyển đổi giá trị từ 'k' sang số ngàn
        return parseInt(lowerCasePrice.replace('k', '')) * 1000;
    }
    return parseInt(lowerCasePrice); // Trả về giá trị số nguyên nếu không có 'k'
}

module.exports = {
    name: 'add',
    description: 'Thêm sản phẩm cho người dùng. Cách dùng: !add @user tên_sản_phẩm giá hoặc !addproduct user_id tên_sản_phẩm giá',
    async execute(message, args) {
        try {
            if (args.length < 3) {
                return message.reply('Vui lòng cung cấp các thông tin đúng: @user hoặc user_id tên_sản_phẩm giá.');
            }

            let user = message.mentions.users.first();

            if (!user) {
                const userId = args[0];
                try {
                    user = await message.client.users.fetch(userId);
                } catch (error) {
                    return message.reply('Không thể tìm thấy người dùng với ID này.');
                }
            }

            if (!user) {
                return message.reply('Vui lòng cung cấp một người dùng hợp lệ.');
            }

            const product = args.slice(1, -1).join(' ');
            const priceInput = args[args.length - 1];
            const price = parsePrice(priceInput); // Chuyển đổi giá tiền

            if (isNaN(price)) {
                return message.reply('Vui lòng cung cấp một giá hợp lệ.');
            }

            const productData = readData();

            if (!productData[user.id]) {
                productData[user.id] = {
                    username: user.tag,
                    products: [],
                    totalSpent: 0,
                    joinDate: user.createdAt
                };
            }

            productData[user.id].products.push({ product, price });
            productData[user.id].totalSpent += price;

            writeData(productData);

            // Tạo embed thông báo thành công cho người dùng được chỉ định
            const successEmbed = new EmbedBuilder()
            .setAuthor({
                name: 'Pretty Store', // Lấy tên bot
                iconURL: message.guild.iconURL({ dynamic: true }) // Lấy avatar của server
            })
    .setColor('#CC99FF')
    .setDescription(`Đã thêm dữ liệu mua hàng thành công cho người dùng <@${user.id}>!\n**Sản phẩm:** ${product}\n**Giá:** ${price.toLocaleString()} VND`)
                .setFooter({ text: `${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

            // Gửi embed thành công đến người dùng
            await message.channel.send({ embeds: [successEmbed] });

            // Xóa tin nhắn gọi lệnh
            await message.delete();

        } catch (error) {
            console.error(error);
            message.reply('Đã có lỗi xảy ra khi thực hiện lệnh.');
        }
    }
};
