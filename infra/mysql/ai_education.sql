/*
 Navicat Premium Dump SQL

 Source Server         : aliyun
 Source Server Type    : MySQL
 Source Server Version : 80043 (8.0.43-0ubuntu0.22.04.1)
 Source Host           : 47.96.105.206:3306
 Source Schema         : ai_education

 Target Server Type    : MySQL
 Target Server Version : 80043 (8.0.43-0ubuntu0.22.04.1)
 File Encoding         : 65001

 Date: 26/12/2025 14:48:41
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for ah_knowledge
-- ----------------------------
DROP TABLE IF EXISTS `ah_knowledge`;
CREATE TABLE `ah_knowledge` (
  `id` int NOT NULL AUTO_INCREMENT,
  `textbook_id` int NOT NULL,
  `unit_id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `order` int DEFAULT '0' COMMENT '同级排序',
  `difficulty` varchar(50) DEFAULT NULL COMMENT '知识点难度',
  `importance` int DEFAULT '5' COMMENT '重要性（1-10）',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=680 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Records of ah_knowledge
-- ----------------------------
BEGIN;
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (5, 12, 6, '学校相关词汇', '学习与学校相关的词汇，如book、schoolbag等', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (6, 12, 6, '句型\'I have a...\'', '学习表达\'I have a book.\'等句型', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (7, 12, 6, '互动游戏', '通过游戏巩固词汇和句型', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (8, 12, 7, '面部部位词汇', '学习face、eye、ear、nose、mouth等面部部位词汇', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (9, 12, 7, '指令性句型', '学习\'Touch your nose.\'等指令性句型', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (10, 12, 7, '描述性句型', '学习\'This is my nose.\'等描述性句型', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (11, 12, 8, '动物词汇', '学习常见动物的英文名称', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (12, 12, 8, '互动活动', '通过活动学习动物词汇', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (13, 12, 9, '数字1-10', '学习1到10的英文数字', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (14, 12, 9, '数字游戏', '通过游戏巩固数字学习', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (15, 12, 10, '颜色词汇', '学习red、blue、green等颜色词汇', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (16, 12, 10, '颜色识别', '通过活动识别和使用颜色词汇', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (17, 12, 11, '水果词汇', '学习apple、banana、orange等水果词汇', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (18, 12, 11, '水果识别', '通过活动识别和使用水果词汇', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (23, 11, 17, '数一数', '学习基本的计数方法，认识数字。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (24, 11, 17, '比多少', '通过比较物品数量，理解‘多’和‘少’的概念。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (25, 11, 18, '上、下、前、后', '通过具体情境理解物体在空间中的上下前后关系。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (26, 11, 18, '左、右', '学习左右方向的概念及其在生活中的应用。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (27, 11, 19, '数的认识', '认识并书写1到5的数字，理解其表示的意义。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (28, 11, 19, '数的比较', '通过比较数字大小，掌握‘大于’、‘小于’和‘等于’的概念。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (29, 11, 19, '加法与减法', '学习5以内数的简单加减运算，理解其实际意义。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (30, 11, 20, '图形识别', '认识并命名常见的平面图形，如圆形、正方形、长方形等。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (31, 11, 21, '数的认识', '认识并书写6到10的数字，理解其表示的意义。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (32, 11, 21, '加法与减法', '学习6到10的简单加减运算，掌握基本计算方法。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (33, 11, 22, '数的认识', '认识并书写11到20的数字，理解其组成和意义。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (34, 11, 23, '时间认识', '学习钟表上整点和半点的时间表示方法。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (35, 11, 24, '进位加法', '通过分与合的方法，掌握20以内数的进位加法运算。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (37, 16, 26, '常见平面图形', '学习长方形、正方形、平行四边形、三角形、圆等平面图形。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (38, 16, 26, '图形拼接', '通过两个同样的三角形或长方形拼接成新的图形，如平行四边形或正方形。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (39, 16, 26, '图形应用', '用图形拼出自己喜欢的图案，培养空间想象力。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (40, 16, 27, '退位减法', '通过具体例子学习如何进行20以内的退位减法计算。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (41, 16, 28, '物品分类', '根据物品的特征进行分类，如形状、颜色等。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (42, 16, 29, '数的读写', '学习如何正确读写100以内的数，并理解数的意义。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (43, 16, 29, '数位知识', '了解从右到左的数位顺序，第一位是个位，第二位是十位，第三位是百位。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (44, 16, 29, '数的组成', '理解一个数中不同数位上的数字代表的实际意义。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (45, 16, 30, '人民币单位', '认识元、角、分三种人民币单位及其关系。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (46, 16, 30, '人民币换算', '学习元、角、分之间的换算方法。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (47, 16, 30, '简单计算', '进行涉及人民币的简单加减法计算，如买物品的总价和找零。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (48, 16, 31, '加法口算', '掌握100以内加法的基本口算技巧。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (49, 16, 31, '减法口算', '掌握100以内减法的基本口算技巧。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (50, 16, 32, '数字规律', '发现数字排列中的简单规律并进行推理。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (51, 16, 32, '图形规律', '观察图形排列的规律，并能继续画出后续图形。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (53, 20, 36, '物品名称', '学习与教室相关的常见物品词汇，如ruler（尺子）、pencil box（铅笔盒）、desk（课桌）等。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (54, 20, 36, '位置表达', '掌握基本的空间位置介词，如on（在……上）、in（在……里）、under（在……下），用于描述物体的位置。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (55, 20, 36, '句型：Where is...?', '学习询问某物在哪里的句型“Where is the...?”及其回答“It\'s on/in/under...”。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (56, 20, 37, '家具词汇', '学习bed（床）、chair（椅子）、door（门）、light（灯）等房间内常见家具和设施的英文名称。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (57, 20, 37, '位置问答扩展', '继续深化对“Where is...?”句型的理解与应用，并加入“What\'s behind/under...?”来提问特定位置的物体。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (58, 20, 37, '听做结合活动', '通过Listen and do、Look and say等活动形式，提升听力理解与口语表达的协调能力。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (59, 20, 38, '玩具词汇', '掌握常见玩具的英文单词，如car（小汽车）、bear（泰迪熊）、ball（球）、plane（飞机）、train（火车）、doll（娃娃）。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (60, 20, 38, '请求表达：Can I have...?', '学习礼貌地提出请求的句型“Can I have a...?”以及相应的肯定回答“Sure.”和否定回答“Sorry, no.”。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (61, 20, 38, '听说训练', '通过Listen and act、Look, listen and chant等环节，强化语音输入与动作反应的联系，提高语言感知力。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (64, 20, 40, '食物词汇', '学习noodles（面条）、rice（米饭）、vegetables（蔬菜）、eggs（鸡蛋）、fish（鱼）、chicken（鸡肉）等常见食物词汇。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (65, 20, 40, '表达需求：I\'m hungry. I want...', '学会表达饥饿状态“I\'m hungry.”并能说出自己想吃的食物“I want...”。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (66, 20, 40, '喜好问答：Do you like...?', '掌握询问他人是否喜欢某种食物的句型“Do you like...?”及其回答“Yes, I do.” / “No, I don\'t.”。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (67, 20, 41, '饮品词汇', '认识water（水）、milk（牛奶）、juice（果汁）、tea（茶）、coffee（咖啡）等常见饮品词汇。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (68, 20, 41, '服务场景对话', '模拟提供与接受饮品的情境，使用“Here you are.”和“Thank you.”进行互动。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (69, 20, 41, '完整句子表达', '结合前几单元内容，形成“I\'m hungry/thirsty. I want...”的完整表达结构。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (70, 20, 42, '衣物词汇', '掌握shirt（衬衫）、dress（连衣裙）、skirt（裙子）、pants（裤子）、hat（帽子）、shoes（鞋子）等基本衣物词汇。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (71, 20, 42, '指认与命名', '通过Look and say等活动练习用“This is a...”或直接说出衣物名称来进行指认。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (72, 20, 42, '生活化语言运用', '将衣物词汇融入日常生活场景，如穿衣、整理衣柜等，增强语言实用性。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (229, 21, 85, '问候与自我介绍', '学习使用 Hello! Hi! I\'m... / My name is... / Nice to meet you. 等句型进行问候和自我介绍。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (230, 21, 85, '身体部位词汇', '掌握 eye, ear, mouth, hand, arm 等身体部位的英文名称，并能听指令做动作（如 Wave your hand.）。', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (231, 21, 85, '成为好朋友的行为', '理解并表达成为好朋友的方式，如 I smile. I listen. I help. I share. 强调分享、倾听、帮助等品质。', 2, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (232, 21, 85, '字母与发音', '学习字母 Aa, Bb, Cc, Dd 及其发音，能听辨首音并拼读简单单词如 apple, bag, cat, dog。', 3, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (233, 21, 86, '家庭成员称呼', '掌握 father/dad, mother/mum, grandfather/grandpa, grandmother/grandma, sister, brother, me 等核心家庭成员词汇。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (234, 21, 86, '介绍家人', '能使用 This is my... 句型介绍家人，并能问答 Is this your...? Yes, it is. / No, it\'s my cousin. 等。', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (235, 21, 86, '扩展家庭成员', '了解 uncle, aunt, cousin, baby 等扩展家庭成员，并能描述家庭大小（big/small family）。', 2, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (236, 21, 86, '字母与发音', '学习字母 Ee, Ff, Gg, Hh 及其发音，能听辨首音并拼读如 egg, fish, girl, hat 等单词。', 3, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (237, 21, 87, '宠物词汇', '学习 dog, cat, fish, bird, rabbit 等宠物名称，并能表达喜好（I like...）及询问 Do you have a pet? Yes, I do. / No, I don\'t.', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (238, 21, 87, '野生动物词汇', '掌握 panda, monkey, tiger, elephant, lion, fox, giraffe 等野生动物名称，并能问答 What\'s this? It\'s a/an...', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (239, 21, 87, '动物特征描述', '能根据图片或文本将动物按 big, small, tall, fast 等特征分类。', 2, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (240, 21, 87, '字母与发音', '学习字母 Ii, Jj, Kk, Ll 及其发音，能听辨首音并拼读如 ill, jet, kite, leg 等单词。', 3, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (241, 21, 88, '水果与喜好', '掌握 apples, bananas, oranges, grapes 等水果词汇，并能问答 Do you like...? Yes, I do. / No, I don\'t. I like...', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (242, 21, 88, '植物与人类的关系', '理解 Plants give us air, food. 和 We can help plants (water, plant trees). 的概念。', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (243, 21, 88, '植物生长所需', '知道植物需要 air, water, sun 才能生长。', 2, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (244, 21, 88, '字母与发音', '学习字母 Mm, Nn, Oo, Pp 及其发音，能听辨首音并拼读如 mum, new, orange, pen 等单词。', 3, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (245, 21, 89, '基本颜色词汇', '掌握 red, yellow, blue, green, orange, purple, brown, pink, black, white 等颜色词。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (246, 21, 89, '询问与描述颜色', '能问答 What colour is it? It\'s... 并描述物品颜色（a yellow duck, a brown bear）。', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (247, 21, 89, '颜色的功能与意义', '理解颜色在生活中的指示作用，如 Red means \'No!\', Green means \'Go!\'。', 2, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (248, 21, 89, '字母与发音', '学习字母 Qq, Rr, Ss, Tt, Uu 及其发音，能听辨首音并拼读如 queen, red, see, up 等单词。', 3, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (249, 21, 90, '数字1-10', '掌握 one 到 ten 的数字词汇及其对应阿拉伯数字。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (250, 21, 90, '询问年龄与数量', '能问答 How old are you? I\'m... years old. 和 How many...? ... (数量)。', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (251, 21, 90, '数字的实际应用', '能在生日、购物（ten yuan）、时间（seven o\'clock）等场景中使用数字。', 2, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (252, 21, 90, '字母与发音', '学习字母 Vv, Ww, Xx, Yy, Zz 及其发音，能听辨首音/尾音并拼读如 van, we, box, yellow, zip 等单词。', 3, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (275, 25, 101, 'Greetings and introductions', '学习基本问候语（Hi!, Hello!）和自我介绍句型（My name\'s... / I\'m...），以及询问对方姓名（What\'s your name?）和表达初次见面（Nice to meet you.）。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (276, 25, 101, 'Countries and nationalities', '认识并能说出主要英语国家名称：China, UK, Canada, USA，并能用“I\'m from...”介绍自己的来源地。', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (277, 25, 101, 'Polite expressions', '掌握常用礼貌用语，如“Let me help.”、“After you!”、“You\'re welcome.”、“Thank you.”等，培养礼貌交往习惯。', 2, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (278, 25, 101, 'Phonics: a-e pattern', '学习含有a-e结构的单词（如cake, Jake, Dave），掌握其发音规律（长音/eɪ/），并通过chant和拼读练习巩固。', 3, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (279, 25, 102, 'Describing appearance', '使用形容词（long, short, fat, thin, slow, cute）和句型“It has...”描述动物或物品的身体部位和特征。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (280, 25, 102, 'Ways to show love and feelings', '学习表达爱意的不同方式，如口头表达（I love you!）、行动表达（make a card, draw a picture, sing and dance），并能用英语进行简单交流。', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (281, 25, 102, 'Phonics: -e pattern (he, she, we)', '学习以-e结尾的代词（he, she, we, me）及其发音，并通过chant和拼读活动强化记忆。', 2, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (282, 25, 103, 'School supplies', '掌握常见学习用品词汇（pen, pencil, ruler, eraser, book, paper, bag），并能用英语请求借用（Can I use your...? Sure. Here you are.）。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (283, 25, 103, 'Five senses in learning', '认识五种感官（see, hear, smell, taste, touch）及其对应器官（eyes, ears, nose, tongue, hands），理解它们如何帮助我们学习和感知世界。', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (284, 25, 103, 'Phonics: i-e pattern', '学习i-e结构单词（如kite, bike, like, fine），掌握其长音/aɪ/的发音规则，并通过chant和拼读练习巩固。', 2, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (285, 25, 104, 'Food and drinks vocabulary', '掌握常见食物和饮料词汇，区分健康食品（vegetables, fruit, rice, milk）与非健康食品（candy, cake），理解“healthy”和“yummy”的含义。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (286, 25, 104, 'Ordering and offering food', '学习点餐句型（I\'d like some...）和提供食物句型（Would you like some...? Yes, please. / No, thank you.），能在模拟情境中进行简单对话。', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (287, 25, 104, 'Phonics: o-e pattern', '学习o-e结构单词（如home, note, bone, Joe），掌握其长音/əʊ/的发音规律，并通过chant和拼读活动练习。', 2, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (288, 25, 105, 'Toys and old belongings', '掌握玩具类词汇（doll, ball, car, boat）和学校用品词汇，能用“Do you have...?”询问并回答是否拥有某物。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (289, 25, 105, 'Prepositions of place', '学习表示位置的介词（in, on, under）及句型“Where is...? It\'s in/on/under...”，能描述物品所在位置。', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (290, 25, 105, 'Phonics: u-e pattern', '学习u-e结构单词（如cute, use, tube, excuse），掌握其长音/juː/的发音规则，并通过chant和拼读练习巩固。', 2, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (291, 25, 106, 'Numbers 11-20', '掌握11至20的英文数字（eleven, twelve, ..., twenty）及其拼写，能用于计数（We have fifteen books.）和简单加法（Five and six makes eleven.）。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (292, 25, 106, 'Shopping and prices', '学习购物相关句型（How much is this...? It\'s... yuan. / I\'ll take...），理解价格标签和简单交易（pay, save, spend），能在模拟市场中进行买卖对话。', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (293, 25, 106, 'Phonics: c, g, l, y patterns', '复习和巩固字母c, g, l, y在单词中的发音规则（如face, girl, my, leg），通过听音辨词和拼写练习提升语音意识。', 2, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (294, 24, 107, '核心句型', 'Can you...? Yes, I can. / No, I can’t.', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (295, 24, 107, '动词短语', 'play football, ride a bike, swim, fly a kite, make a model plane, make a snowman', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (296, 24, 107, '语言功能', '询问和表达某人是否会做某事', 2, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (297, 24, 107, '书写练习', '字母Bb的书写', 3, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (298, 24, 108, '天气词汇', 'sunny, rainy, cloudy, snowy, windy, umbrella', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (299, 24, 108, '核心句型', 'What’s the weather like today? It’s...', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (300, 24, 108, '语言功能', '询问和描述天气状况', 2, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (301, 24, 108, '互动活动', 'Draw and say, Act and guess', 3, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (302, 24, 109, '季节与天气', 'spring (warm), summer (hot), autumn (cool), winter (cold)', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (303, 24, 109, '核心句型', 'What’s your favourite season? Spring. It’s warm and windy.', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (304, 24, 109, '季节活动', 'fly a kite, swim, pick peanuts, make a snowman', 2, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (305, 24, 109, '价值观引导', '通过故事传递“No pain, no gain”的道理', 3, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (306, 24, 110, '时间表达', 'What time is it? It’s 7:40. / It’s eleven o’clock.', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (307, 24, 110, '数字词汇', 'eleven, twelve, thirteen, fourteen, fifteen, twenty, thirty, forty, fifty', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (308, 24, 110, '日常活动关联', 'It’s playtime. Let’s play football.', 2, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (309, 24, 110, '游戏活动', 'Wolf, Wolf, what time is it?', 3, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (310, 24, 111, '日常活动短语', 'get up, eat breakfast, go to school, eat lunch, go home, eat dinner, go to bed', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (311, 24, 111, '核心句型', 'When do you eat breakfast every day? At 7:10.', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (312, 24, 111, '时间介词', 'at + 具体时间点', 2, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (313, 24, 111, '频率表达', 'every day', 3, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (314, 24, 112, '星期词汇', 'Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (315, 24, 112, '核心句型', 'What day is it today? It’s Monday.', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (316, 24, 112, '周计划表达', '结合时间表达描述每日活动（如go to school at 7:30 on Monday）', 2, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (317, 24, 112, '情感与社交', '通过Mike从孤独到融入集体的故事，传递友谊与归属感', 3, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (318, 23, 113, '家庭成员词汇', 'father, mother, brother, sister, grandfather, grandmother', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (319, 23, 113, '人物指代与问答', 'Who\'s he/she? He/She is my...；This is my...', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (320, 23, 113, '家庭主题歌谣与故事', '通过chant、role-play和Story Time活动巩固家庭成员表达', 2, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (321, 23, 114, '性别与身份词汇', 'boy, girl, man, woman, classmate, friend', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (322, 23, 114, '姓名询问与回答', 'What\'s his/her name? His/Her name is...', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (323, 23, 114, '人物辨识游戏与故事', '通过Let’s play和Story Time练习辨别身份与名字', 2, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (324, 23, 115, '外貌描述形容词', 'tall, short, big, thin, pretty, handsome', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (325, 23, 115, '朋友介绍句型', 'What does he/she look like? He/She is...；I have a friend.', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (326, 23, 115, '绘画与猜测活动', '通过Draw and say、Guess and say等活动应用外貌描述', 2, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (327, 23, 116, '社区场所词汇', 'zoo, park, school, bookshop, supermarket, hospital', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (328, 23, 116, '去向表达', 'Where are you going? I’m going to the...；Me too.', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (329, 23, 116, '地点位置识别', 'Where is Lily? She is at the zoo.', 2, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (330, 23, 117, '公园景物词汇', 'tree, lake, boat, hill, grass, flower', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (331, 23, 117, '存在句型', 'There is a boat on the lake. There are trees in the park.', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (332, 23, 117, '观察与描述活动', '通过Look and say、Act and say等活动练习描述公园场景', 2, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (333, 23, 118, '节日词汇与祝福语', 'Merry Christmas! Happy New Year! Father Christmas, Christmas tree', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (334, 23, 118, '礼物赠送表达', 'Here is a present/card for you. Thank you. You too!', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (335, 23, 118, '节日歌曲与角色扮演', '通过chant、Act and say及经典歌曲《We wish you a merry Christmas》强化节日交际', 2, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (336, 27, 119, '调查方法', '学习如何设计简单的调查问题，确保每位同学参与且每人只选一项。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (337, 27, 119, '数据记录', '掌握用“正”字等符号记录数据的方法。', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (338, 27, 119, '统计表', '学习将收集到的数据填入统计表，并能根据表格回答问题，如总数、最多、最少等。', 2, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (339, 27, 120, '平均分', '理解“每份分得同样多”叫平均分，能进行等分和包含分两种分法。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (340, 27, 120, '除法的初步认识', '理解除法是平均分的数学表达，认识被除数、除数、商，会读写除法算式。', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (341, 27, 120, '用乘法口诀求商', '掌握利用乘法口诀（2-6的口诀）来计算表内除法。', 2, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (342, 27, 121, '轴对称图形', '认识轴对称现象和轴对称图形，能辨认简单的轴对称图形并找出对称轴。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (343, 27, 121, '平移', '认识平移现象，能判断图形平移的方向和距离，并找出能通过平移重合的图形。', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (344, 27, 121, '旋转', '认识旋转现象，了解物体绕一个点或轴转动。', 2, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (345, 27, 122, '用7、8、9的乘法口诀求商', '熟练运用7、8、9的乘法口诀计算相应的除法算式。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (346, 27, 122, '除法应用', '能用除法解决“求一个数里包含几个另一个数”和“把一个数平均分成几份，求每份是多少”等实际问题。', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (347, 27, 123, '同级混合运算', '掌握在没有括号的算式里，只有加、减法或只有乘、除法时，从左往右按顺序计算。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (348, 27, 123, '两级混合运算', '掌握在没有括号的算式里，既有乘、除法又有加、减法时，要先算乘、除法，后算加、减法。', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (349, 27, 123, '带小括号的混合运算', '理解小括号的作用，掌握算式里有括号时，要先算括号里面的。', 2, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (350, 27, 124, '余数的意义', '理解平均分后有剩余的情况，认识余数，并知道余数必须比除数小。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (351, 27, 124, '有余数除法的竖式计算', '学习用竖式计算有余数的除法，理解竖式中各部分的含义。', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (352, 27, 124, '有余数除法的应用', '能运用有余数的除法解决租船、购物、周期规律等实际问题。', 2, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (353, 27, 125, '1000以内数的认识', '认识计数单位“千”，掌握1000以内数的组成、读写，并能在计数器和算盘上表示。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (354, 27, 125, '万以内数的认识', '认识计数单位“万”，掌握万以内数的数位顺序、读写、组成及大小比较方法。', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (355, 27, 125, '近似数与整百整千加减法', '理解近似数的含义，能用整百、整千数的加减法解决简单的估算问题。', 2, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (356, 27, 126, '克的认识', '认识质量单位“克”（g），感知1克有多重，知道计量较轻物品用克作单位。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (357, 27, 126, '千克的认识', '认识质量单位“千克”（kg），感知1千克有多重，知道计量较重物品用千克作单位。', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (358, 27, 126, '单位换算', '掌握1千克=1000克，并能进行简单的单位换算和比较。', 2, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (359, 27, 127, '简单推理', '能根据给出的两个条件，通过排除法进行简单的逻辑推理，得出结论。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (360, 27, 127, '方格填数', '能在4×4的方格中，根据每行、每列数字不重复的规则，运用推理填出缺失的数字。', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (361, 28, 128, '按单一标准分类', '能根据形状、颜色、种类等单一标准对气球、蔬菜、衣服、动物等物品进行分类，并用画图或表格记录结果。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (362, 28, 128, '分类结果的表示与比较', '学会用数字、符号或表格表示分类结果，能比较哪类最多、最少，并提出相关数学问题。', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (363, 28, 128, '多标准与逐层分类', '理解可以按多个标准（如先按形状再按颜色）进行逐层分类，最终分成更细致的类别，便于使用。', 2, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (364, 28, 128, '分类的应用与意义', '认识到生活中分类整理的好处，如便于查找、管理；能结合书包整理、交通标志识别等实际情境进行分类。', 3, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (365, 28, 129, '乘法的初步认识', '理解几个相同加数相加可以用乘法表示，认识乘号、乘数、积，会读写乘法算式并说明各部分含义。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (366, 28, 129, '2～6的乘法口诀', '熟记1～6的乘法口诀，能根据口诀写出对应的乘法算式，并用于快速计算。', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (367, 28, 129, '乘加、乘减运算', '掌握含有乘法和加减法的混合运算顺序（先算乘法），能正确计算如3×3+2、3×4−1等算式。', 2, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (368, 28, 129, '乘法的实际应用', '能用乘法解决“每份数×份数=总数”类问题，如购物总价、地砖数量、腿的数量等，并能区分加法与乘法问题的不同。', 3, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (369, 28, 130, '平均分的概念', '理解“每份分得同样多”叫平均分，能按每几个一份进行分组，或把总数平均分成几份。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (370, 28, 130, '除法的初步认识', '认识除号，会读写除法算式，理解被除数、除数、商的含义，知道除法是平均分的数学表示。', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (371, 28, 130, '用乘法口诀求商', '掌握用2～6的乘法口诀求商的方法，如12÷3想“三（四）十二”，商是4。', 2, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (372, 28, 130, '除法的实际应用', '能解决“总数÷每份数=份数”和“总数÷份数=每份数”两类问题，如分水果、买水杯、插花等，并理解乘除法之间的关系。', 3, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (373, 28, 131, '方向的辨认', '能根据太阳升起方向或指南针辨认东、南、西、北，知道东与西相对、南与北相对。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (374, 28, 131, '方向的表示与应用', '会制作方向牌，理解方向排列顺序与时针一致；能在校园中确定建筑物的方向位置。', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (375, 28, 131, '路线设计与安全疏散', '能根据方向描述设计参观路线，并认识安全疏散示意图，了解紧急情况下的逃生方向。', 2, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (376, 28, 132, '长度单位的认识', '了解古代用拃、庹等身体部位作单位的局限性，认识厘米（cm）和米（m）作为统一长度单位。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (377, 28, 132, '长度的测量', '会用直尺测量较短物体的长度（以厘米为单位），用米尺测量较长物体（以米为单位），掌握正确的测量方法（对准0刻度）。', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (378, 28, 132, '线段的认识', '认识线段是直的、可测量长度的图形，能识别生活中的线段，并会画指定长度的线段。', 2, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (379, 28, 132, '单位的选择与估算', '能根据物体实际长度选择合适的单位（如旗杆高13米而非13厘米），并能进行长度的估测与验证。', 3, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (380, 28, 133, '身体尺的认识', '认识1拃、1步、1庹等身体尺的定义，并测量自身身体尺的实际长度（用厘米或米表示）。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (381, 28, 133, '身体尺的应用', '能在不方便使用工具时选择合适的身体尺测量物体长度，如用步测路长、用拃测桌面宽。', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (382, 28, 133, '测量数据的比较与分析', '发现身体尺因人而异，不同人测量同一物体结果可能不同，进一步体会统一单位的重要性。', 2, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (383, 28, 134, '7～9的乘法口诀', '能编制并熟记7～9的乘法口诀，发现口诀规律（如9的口诀积的个位递减、十位递增），并用手势辅助记忆。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (384, 28, 134, '用7～9的口诀求商', '能熟练运用7～9的乘法口诀求商，理解一句口诀可对应两个乘法和两个除法算式。', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (385, 28, 134, '乘除法的综合应用', '能解决需两步计算的问题（如先乘后除），如分铅笔、游乐园人数计算等，并能提出相关数学问题。', 2, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (386, 28, 134, '乘法口诀的整理与拓展', '了解“小九九”与“大九九”的区别，能整理完整的乘法口诀表和对应的除法算式表，发现其中规律。', 3, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (387, 28, 135, '数与运算的关联', '理解加法与乘法、减法与除法的联系，知道乘法是相同加数相加的简便形式，除法是平均分的表示。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (388, 28, 135, '数量关系模型', '掌握“每份数×份数=总数”及其逆运算模型，能用乘除法解决购物、分物等实际问题。', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (389, 28, 135, '图形与测量的整合', '综合运用方向、长度单位、线段等知识，能辨认方向、测量长度、解读安全疏散图。', 2, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (390, 28, 135, '数据分类的深化', '能自定标准对数据进行分类，并对分类结果继续细分，体会分类标准的多样性与层次性。', 3, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (391, 22, 136, '从不同方向观察物体', '认识到从不同方向（前、后、左、右、上）观察同一物体，看到的形状可能不同。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (392, 22, 136, '立体图形的展开图', '通过剪开长方体纸盒并平铺，理解立体图形与平面展开图之间的关系，掌握展开图的基本特征。', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (393, 22, 137, '混合运算顺序', '掌握无括号时先乘除后加减、有括号先算括号内的运算规则。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (394, 22, 137, '解决多步实际问题', '能将实际问题分解为多个小问题，通过画线段图、列综合算式等方式解决问题。', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (395, 22, 138, '长度单位及其换算', '掌握1厘米=10毫米、1分米=10厘米、1米=10分米、1千米=1000米等单位换算关系。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (396, 22, 138, '长度估测与实际应用', '能结合生活经验对常见物体长度进行估测，并解决与长度相关的实际问题。', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (397, 22, 139, '质量单位的认识', '认识克（g）、千克（kg）、吨（t），知道1千克=1000克，1吨=1000千克。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (398, 22, 139, '质量的测量与估算', '能使用常见秤具测量物体质量，并能利用已知质量物品进行简单估算。', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (399, 22, 140, '多位数乘一位数的计算', '掌握口算（如整十、整百数乘一位数）和笔算（含进位）的计算方法。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (400, 22, 140, '乘法在实际问题中的应用', '能解决涉及多位数乘一位数的实际问题，包括估算策略的选择。', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (401, 22, 141, '常见数字编码的结构', '了解身份证号码、邮政编码等编码中各部分数字的含义。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (402, 22, 141, '编码的设计与应用', '能根据需求设计包含年级、班级、性别等信息的学号编码方案。', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (403, 22, 142, '线的基本概念', '理解线段、射线、直线的定义、表示方法及区别。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (404, 22, 142, '角的认识与分类', '认识角的顶点和边，能识别并绘制直角、锐角、钝角，理解角的大小与张口有关。', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (405, 22, 143, '分数的意义', '理解把一个整体平均分成若干份，其中一份或几份可以用分数表示。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (406, 22, 143, '分数的简单计算', '掌握同分母分数的加减法及1减去几分之几的计算方法。', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (407, 22, 144, '知识结构化整理', '能对多位数乘法、混合运算、分数、长度与质量单位、线与角等内容进行结构化整理。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (408, 22, 144, '综合应用能力提升', '能综合运用所学知识解决跨领域的实际问题，如行程、购物、图形计数等。', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (419, 26, 148, '基本方向的认识', '学习东、南、西、北四个基本方向及其相对性，如东与西相对、北与南相对。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (420, 26, 148, '地图方向规则', '掌握地图通常按‘上北下南、左西右东’绘制的规则，并能根据地图描述建筑物或地点的相对位置。', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (421, 26, 148, '生活中的方向应用', '结合生活场景（如校园、城市）描述物体所在方向，学会使用指南针辨别方向。', 2, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (422, 26, 148, '东北、东南、西北、西南方向', '认识并描述八个基本方位，能够指出校园或生活环境中某物在某一复合方向上的位置。', 3, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (423, 26, 149, '口算除法', '掌握整十、整百、整千数除以一位数的口算方法，如60÷3=20，600÷3=200。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (424, 26, 149, '估算除法', '学会用近似数估算商的大小，如267÷3≈90，用于快速判断结果范围。', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (425, 26, 149, '笔算除法', '学习竖式计算方法，理解每一步的意义，包括首位试商、余数处理、不够商1时写0占位等规则。', 2, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (426, 26, 149, '有余数除法的验算', '掌握验算方法：商×除数+余数=被除数，确保计算正确性。', 3, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (427, 26, 149, '商中间或末尾有0的除法', '理解当某一位不够商1时需商0，如208÷2=104，245÷8=30…5。', 4, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (428, 26, 150, '单式统计表的整理', '学会记录班级同学喜欢的运动项目或图书类型等数据，形成单式统计表。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (429, 26, 150, '复式统计表的构建', '将两个相关单式表（如男女生数据）合并成一个复式统计表，便于横向对比。', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (430, 26, 150, '数据分析与建议', '根据复式统计表回答问题，如哪类图书最受男生欢迎，并提出合理化建议。', 2, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (431, 26, 151, '口算乘法', '掌握整十数乘一位数或两位数的口算方法，如16×3=48，12×20=240。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (432, 26, 151, '笔算乘法', '学习竖式计算，理解先乘个位、再乘十位、最后相加的步骤，如37×48=1776。', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (433, 26, 151, '乘法估算', '会用四舍五入法估算结果，如37≈40，48≈50，估算得约2000。', 2, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (434, 26, 151, '连乘与连除问题', '解决如‘5箱保温壶，每箱12个，每个45元，共多少钱？’这类多步计算问题。', 3, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (435, 26, 152, '面积与面积单位', '理解面积是物体表面的大小，认识1平方厘米、1平方分米、1平方米的实际大小。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (436, 26, 152, '长方形与正方形面积公式', '掌握长方形面积=长×宽，正方形面积=边长×边长，并能实际测量计算。', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (437, 26, 152, '面积单位进率', '掌握1平方分米=100平方厘米，1平方米=100平方分米，并能进行单位换算。', 2, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (438, 26, 152, '铺地砖问题', '应用面积知识解决实际问题，如计算铺满客厅需要多少块地砖。', 3, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (439, 26, 153, '年月日基本知识', '知道一年有12个月，大月31天，小月30天，2月特殊（平年28天，闰年29天）。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (440, 26, 153, '平年与闰年', '掌握闰年判断方法：公历年份是4的倍数一般是闰年，但整百年必须是400的倍数。', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (441, 26, 153, '24时计时法', '学会将普通计时法转换为24时计时法，如下午5时=17时，并计算时间段长度。', 2, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (442, 26, 153, '制作活动日历', '动手制作可显示月、日、星期的日历模型，巩固对日期系统的理解。', 3, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (443, 26, 154, '小数的意义与读写', '理解小数是十进分数的另一种表示，如0.3表示3/10，会读写3.45等小数。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (444, 26, 154, '小数大小比较', '通过数轴或单位换算比较小数大小，如1.2>0.9>0.8。', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (445, 26, 154, '简单小数加减法', '掌握小数点对齐的加减法竖式计算，如0.8+0.6=1.4，1.2-0.6=0.6。', 2, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (446, 26, 154, '小数在购物中的应用', '解决如‘10元买文具是否够’等实际问题，培养估算与精确计算能力。', 3, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (447, 26, 155, '数字排列组合', '用给定数字组成无重复数字的两位数，如用0、1、3、5可组成9个两位数。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (448, 26, 155, '物品搭配问题', '计算上装与下装的搭配种类，如2件上装配3件下装共有6种搭配。', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (449, 26, 155, '比赛场次计算', '计算每两队比赛一场的总场次，如4个班共踢6场，使用连线或列表法避免遗漏。', 2, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (450, 30, 156, '我是中国人', '引导学生认识自己是中国人，中华民族是一家，增强民族认同感。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (451, 30, 156, '我爱我们的祖国', '通过五星红旗、天安门、长江、黄河等国家象征，培养学生对祖国的热爱之情。', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (452, 30, 156, '我是小学生', '通过《上学歌》等儿歌，帮助学生适应小学生活，养成良好习惯。', 2, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (453, 30, 156, '我爱学语文', '激发学生对语文学习的兴趣，初步了解语文学习的内容包括读书、写字、讲故事、听故事等。', 3, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (454, 30, 157, '天地人', '认识“天、地、人、你、我、他”等基本人称和自然概念字。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (455, 30, 157, '金木水火土', '学习五行基本元素及数字一至五，理解传统宇宙观。', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (456, 30, 157, '口耳目手足', '认识身体部位名称，了解其功能，结合“站如松，坐如钟”等行为规范。', 2, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (457, 30, 157, '日月山川', '认识自然景物相关汉字，如日、月、山、川、水、火、田、禾等。', 3, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (458, 30, 157, '语文园地一', '包含识字加油站、词句运用、书写提示、日积月累（《咏鹅》）、口语交际（我说你做）和亲子阅读（《剪窗花》）。', 4, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (459, 30, 157, '快乐读书吧：读书真快乐', '鼓励学生多读书，与家长共读，体验阅读的乐趣。', 5, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (460, 30, 158, '单韵母 a o e', '学习单韵母a、o、e的发音和书写。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (461, 30, 158, 'i u ü', '学习单韵母i、u、ü的发音和四声调。', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (462, 30, 158, '声母 b p m f', '学习声母b、p、m、f及其与单韵母的拼读。', 2, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (463, 30, 158, '声母 d t n l', '学习声母d、t、n、l及其拼读，结合儿歌《小白兔》进行语境练习。', 3, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (464, 30, 158, '语文园地二', '包括拼音本使用、声调练习、形近字母辨析（b-d, f-t）、字词句运用、古诗《画》及亲子阅读《小白兔和小灰兔》。', 4, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (465, 30, 159, '声母 g k h', '学习g、k、h及其拼读，结合拟声儿歌《小溪流说话》。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (466, 30, 159, '声母 j q x', '学习j、q、x及与ü相拼的规则，配合儿歌《小黄鸡，小黑鸡》。', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (467, 30, 159, '声母 z c s', '学习平舌音z、c、s及其整体认读音节zi、ci、si。', 2, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (468, 30, 159, '声母 zh ch sh r', '学习翘舌音zh、ch、sh、r及整体认读音节zhi、chi、shi、ri，结合绕口令练习。', 3, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (469, 30, 159, '声母 y w', '学习y、w作为声母的用法，认识整体认读音节yi、wu、yu。', 4, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (470, 30, 159, '语文园地三', '包括课程表识字、拼音对比（z/zh, c/ch, s/sh）、看图找物、成语积累（一模一样、三头六臂等）及亲子阅读《谁会飞》。', 5, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (471, 30, 160, '复韵母 ai ei ui', '学习ai、ei、ui的发音与拼读，结合生活词汇如萝卜、白菜。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (472, 30, 160, '复韵母 ao ou iu', '学习ao、ou、iu，配合儿歌《欢迎台湾小朋友》。', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (473, 30, 160, '复韵母 ie üe er', '学习ie、üe、er及整体认读音节ye、yue，结合《月儿弯弯》儿歌。', 2, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (474, 30, 160, '前鼻韵母 an en in un ün', '学习前鼻韵母及整体认读音节yuan、yin、yun，结合《家》的儿歌理解归属感。', 3, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (475, 30, 160, '后鼻韵母 ang eng ing ong', '学习后鼻韵母及整体认读音节ying，配合《两只羊》寓言故事。', 4, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (476, 30, 160, '语文园地四', '包括时间类词语识字（昨天、今天、明天）、音节辨析、姓名中的拼音、字词句运用、古诗《悯农》及亲子阅读《老师教大家念书》。', 5, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (477, 30, 161, '秋天', '描写秋天景色，认识大雁南飞等自然现象，学习“一”的变调。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (478, 30, 161, '江南', '通过汉乐府民歌《江南》，感受采莲的欢乐场景，理解方位词。', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (479, 30, 161, '雪地里的小画家', '以动物脚印为画作，认识不同动物足迹特征，了解冬眠常识。', 2, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (480, 30, 161, '四季', '通过拟人化描写春夏秋冬的代表事物，表达对季节的喜爱。', 3, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (481, 30, 161, '语文园地五', '包括反义词识字（男女、开关等）、季节话题表达、同学名字交流、名言积累（一年之计在于春等）及口语交际（自我介绍）。', 4, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (482, 30, 161, '和大人一起读：拔萝卜', '通过经典故事《拔萝卜》，体会合作的重要性。', 5, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (483, 30, 162, '对韵歌', '通过传统对韵形式，学习自然与人文对应关系（云对雨，花对树等）。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (484, 30, 162, '日月明', '学习会意字构造（如明=日+月，尖=小+大），理解汉字构形规律。', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (485, 30, 162, '小书包', '认识常见文具名称，培养整理书包的习惯。', 2, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (486, 30, 162, '升国旗', '学习升国旗礼仪，培养爱国情感和庄重态度。', 3, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (487, 30, 162, '语文园地六', '包括职业类词语识字、偏旁归类（木字旁）、笔顺规则（从上到下、从左到右）、古诗《古朗月行》及亲子阅读《小松鼠找花生》。', 4, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (488, 30, 163, '小小的船', '以月亮为船展开想象，培养想象力和语言美感。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (489, 30, 163, '影子', '通过拟人化描写影子，理解光与影的关系及空间方位。', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (490, 30, 163, '两件宝', '强调手和脑的重要性，倡导“用手又用脑”的学习理念。', 2, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (491, 30, 163, '语文园地七', '包括家庭成员称呼、汉字比较书写、时间类汉字（明、晚、昨）、方向儿歌、名言积累（种瓜得瓜、千里之行始于足下）及口语交际（大声与小声说话）。', 3, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (492, 30, 163, '和大人一起读：猴子捞月', '通过寓言故事理解现象与本质的区别，培养批判性思维。', 4, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (493, 30, 164, '比尾巴', '通过问答形式比较动物尾巴特点，学习描述性语言。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (494, 30, 164, '乌鸦喝水', '讲述乌鸦用石子升高水位的故事，培养解决问题的思维能力。', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (495, 30, 164, '雨点儿', '通过大雨点和小雨点的对话，理解雨水对不同环境的作用。', 2, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (496, 30, 164, '语文园地八', '包括上下结构汉字拆分、词语辨析（果皮/树皮）、写祝福语、笔顺规则（先外后内、先中间后两边）、古诗《风》及口语交际（帮小兔运南瓜）。', 3, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (497, 30, 164, '和大人一起读：春节童谣', '通过传统童谣了解春节习俗，传承文化。', 4, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (498, 31, 165, '四季与自然现象', '学习春、夏、秋、冬四个季节及其对应的自然现象，如春风、夏雨、秋霜、冬雪，并掌握相关词语的读音和书写。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (499, 31, 165, '常见姓氏与问答', '认识中国常见姓氏（如李、张、胡、吴等），学习用‘你姓什么？’‘我姓…’‘什么…？’进行问答，并了解姓氏的构成方式（如‘木子李’‘弓长张’）。', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (500, 31, 165, '同音/形近字辨析', '通过《小青蛙》学习‘青、清、晴、睛、请、情’等同音或形近字，理解偏旁与字义的关系（如‘氵’与水、‘目’与眼睛）。', 2, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (501, 31, 165, '字谜与汉字结构', '通过猜字谜活动，了解汉字的构形方式，如左右结构（‘秋’）、加偏旁成新字（‘又+文=纹’），培养对汉字结构的敏感度。', 3, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (502, 31, 165, '语文园地与拼音复习', '复习汉语拼音字母表，练习音序查字法，积累词语（如‘算式’‘图形’），并进行礼貌用语训练（如‘请’‘谢谢’）。', 4, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (503, 31, 166, '爱党爱国情感启蒙', '通过比喻（花儿爱阳光、鸟儿爱蓝天）表达对党的热爱，理解‘在党的怀抱里幸福成长’的含义。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (504, 31, 166, '革命传统与感恩教育', '了解毛主席带领群众挖井的故事，理解‘吃水不忘挖井人’的寓意，懂得感恩和铭记历史。', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (505, 31, 166, '祖国地域与愿望表达', '认识北京天安门、新疆天山等地标，学习用‘我多想去看看’表达愿望，并积累‘弯弯的小路’‘洁白的雪莲’等短语。', 2, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (506, 31, 166, '语文园地与生活识字', '练习拼音拼写、连一连等题型，认识生活中常见物品名称（如‘直尺’‘牙膏’‘运动鞋’），拓展识字渠道。', 3, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (507, 31, 167, '朋友互助与安全意识', '通过小公鸡和小鸭子互相帮助的故事，理解友谊的重要性，并知道小鸭会游泳而小公鸡不会，增强安全意识。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (508, 31, 167, '从孤单到快乐', '理解‘孤单’与‘快乐’的对比，明白有了邻居和伙伴后，树和喜鹊不再孤单，变得快乐。', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (509, 31, 167, '游戏与人数关系', '了解不同人数（1人、2人、多人）可玩的游戏（如折纸、讲故事、拔河），体会‘怎么都快乐’的道理。', 2, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (510, 31, 167, '音序查字法与古诗积累', '学习用音序查字法查字典，积累古诗《赠汪伦》，理解‘桃花潭水深千尺，不及汪伦送我情’的友情表达。', 3, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (511, 31, 168, '古诗中的思乡之情', '背诵李白《静夜思》，理解‘举头望明月，低头思故乡’所表达的思乡情感。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (512, 31, 168, '克服胆怯心理', '通过《夜色》学习主人公从怕黑到勇敢的过程，积累‘胆子’‘勇敢’‘微笑’等词语。', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (513, 31, 168, '端午节与粽子文化', '了解端午节吃粽子的习俗，认识箬竹叶、糯米、红枣等食材，知道吃粽子是为了纪念屈原。', 2, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (514, 31, 168, '量词与轻声朗读', '学习常用量词（如‘一册书’‘一支铅笔’），练习读好轻声词（如‘胆子’‘样子’‘爸爸’）。', 3, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (515, 31, 169, '动物与行为动词', '认识蜻蜓、蝴蝶、蚯蚓等动物，掌握其活动特点（如‘展翅飞’‘造宫殿’‘结网忙’），学习虫字旁汉字。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (516, 31, 169, '反义词与对子歌', '学习《古对今》中的对子，如‘古对今’‘圆对方’‘严寒对酷暑’‘朝霞对夕阳’，积累反义词和自然词汇。', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (517, 31, 169, '体育活动与动词', '认识‘打球’‘拔河’‘跳高’‘踢足球’等体育活动，学习足字旁、提手旁等与动作相关的偏旁。', 2, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (518, 31, 169, '《三字经》启蒙', '诵读《人之初》，理解‘性本善’‘性相近，习相远’‘玉不琢，不成器’等经典语句的初步含义。', 3, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (519, 31, 169, '偏旁与字义关系', '通过‘饭—饱’‘茶—泡’‘跑—抱’等例子，理解偏旁（食字旁、三点水、足字旁、提手旁）与字义的联系。', 4, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (520, 31, 170, '夏日儿童生活与自然', '通过《池上》《小池》感受夏日池塘的生机，理解‘偷采白莲’‘小荷露角’的童趣与自然之美。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (521, 31, 170, '拟人化自然描写', '学习《浪花》中将浪花比作‘淘气的小娃娃’，《荷叶圆圆》中赋予水珠、蜻蜓、青蛙、小鱼以角色，体会拟人手法。', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (522, 31, 170, '天气变化前兆', '通过《要下雨了》了解燕子低飞、鱼出水面、蚂蚁搬家等下雨前的自然现象，初步建立科学观察意识。', 2, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (523, 31, 170, '句子扩展与标点使用', '练习将简单句扩展为具体句（如‘小白兔割草’→‘弯着腰在山坡上割草’），并正确使用感叹号、问号等标点。', 3, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (524, 31, 171, '整理文具与责任感', '通过贝贝学会给文具找‘家’的故事，培养整理物品、爱护文具的好习惯。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (525, 31, 171, '珍惜时间', '理解《一分钟》中因晚起一分钟导致迟到的连锁反应，懂得‘一分钟’的重要性，树立守时意识。', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (526, 31, 171, '通知要素完整性', '通过狗熊多次通知失败的经历，明白发布通知需包含时间、地点、事件等完整信息。', 2, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (527, 31, 171, '做事专注与目标明确', '分析小猴子因见异思迁而空手回家的原因，理解做事应有始有终、不三心二意。', 3, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (528, 31, 171, '生活用品与偏旁归类', '认识卫生间用品（毛巾、牙刷等），复习虫字旁、反犬旁等与动物相关的偏旁。', 4, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (529, 31, 172, '益虫与害虫认知', '了解燕子、啄木鸟、青蛙分别捉空中、树干、水田害虫，七星瓢虫专治蚜虫，建立生物防治初步概念。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (530, 31, 172, '不盲从与求证精神', '通过《咕咚》故事，明白遇事不能盲目跟风，应像野牛一样查明真相。', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (531, 31, 172, '动物尾巴的功能', '知道鱼尾拨水、牛尾赶蝇、燕尾掌握方向，而壁虎尾巴能再生，了解不同动物尾巴的独特作用。', 2, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (532, 31, 172, '汉字构形规律', '学习合体字（如‘口+少=吵’）、减偏旁（如‘飘-风=票’）等构字方法，提升识字策略。', 3, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (533, 32, 173, '小蝌蚪的成长过程', '小蝌蚪从卵孵化后，先长出后腿，再长出前腿，尾巴逐渐变短，最终变成青蛙。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (534, 32, 173, '水的形态变化', '水可以变成汽、云、雨、冰雹、雪等不同形态，具有温和与暴躁的双重特性。', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (535, 32, 173, '植物传播种子的方法', '蒲公英靠风力传播，苍耳靠动物皮毛携带，豌豆靠豆荚炸裂弹射，石榴靠鸟类吞食后排泄传播。', 2, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (536, 32, 173, '动词的运用', '课文中使用‘披着’‘鼓着’‘甩着’‘露着’等动词描写动物特征，增强画面感。', 3, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (537, 32, 174, '量词的搭配', '学习‘一只海鸥’‘一条帆船’‘一座花园’等量词与名词的固定搭配。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (538, 32, 174, '树木特征与分布', '杨树高，榕树壮；梧桐叶像手掌；枫叶秋天变红；松柏四季常青；木棉喜暖在南方，桦树耐寒守北疆。', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (539, 32, 174, '动物名称与习性', '孔雀、锦鸡是伙伴；雄鹰飞翔；雁群会写字；猛虎在丛林；黄鹂、百灵爱歌唱；熊猫嬉戏竹林。', 2, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (540, 32, 174, '农事活动与四季变化', '春季花开草长，夏季采桑插秧，秋季稻谷丰收，冬季农闲制衣，体现农耕文化。', 3, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (541, 32, 175, '想象与关爱', '孩子看到彩虹，想象用它为家人浇水、照镜子、荡秋千，表达对家人的关心。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (542, 32, 175, '乡村生活的乐趣', '外婆家有山雀、杜鹃花、野花，舅舅带回山楂柿子，体现童年与自然的亲密关系。', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (543, 32, 175, '天文知识与科学态度', '张衡通过观察发现北斗七星绕北极星转动，体现认真观察、刻苦钻研的科学精神。', 2, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (544, 32, 175, '近义词辨析', '‘迎上去’与‘追上去’动作方向不同；‘穿衣裳’与‘披红袍’穿戴方式不同。', 3, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (545, 32, 176, '古诗意境理解', '《登鹳雀楼》表达登高望远的哲理；《望庐山瀑布》用夸张手法描绘瀑布壮观。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (546, 32, 176, '黄山奇石的命名与想象', '‘仙桃石’‘猴子观海’‘仙人指路’‘金鸡叫天都’等奇石因形似而得名。', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (547, 32, 176, '日月潭的地理与美景', '日潭像太阳，月潭像月亮；清晨雾中朦胧，中午清晰，雨天如披轻纱。', 2, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (548, 32, 176, '葡萄沟的物产与人文', '葡萄品种多、颜色美；维吾尔族老乡热情好客；葡萄干通过晾房热风制成。', 3, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (549, 32, 177, '视野与认知局限', '青蛙因坐井观天认为天只有井口大，小鸟则知天无边无际，说明实践拓展认知。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (550, 32, 177, '勤劳与懒惰的后果', '喜鹊勤筑窝过冬，寒号鸟懒惰拖延，最终冻死，强调未雨绸缪的重要性。', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (551, 32, 177, '事物间的联系', '种葫芦者只重果实忽视叶子生虫，导致葫芦全落，说明局部与整体相互关联。', 2, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (552, 32, 177, '反问句的语气', '‘有几个虫子怕什么！’‘叶子上的虫还用治？’用反问加强否定语气。', 3, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (553, 32, 178, '毛主席艰苦工作', '寒冬深夜在八角楼写文章，拨灯芯凝思，体现革命领袖的奉献精神。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (554, 32, 178, '朱德与战士同甘共苦', '朱德亲自挑粮，战士藏其扁担，他重写名字，展现官兵平等、以身作则。', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (555, 32, 178, '周总理与傣族人民共庆', '1961年泼水节，周总理穿民族服装敲象脚鼓、泼水祝福，体现民族团结。', 2, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (556, 32, 178, '刘胡兰英勇不屈', '面对敌人威逼利诱，宁死不透露党员身份，牺牲时不满15岁，彰显革命气节。', 3, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (557, 32, 179, '古诗中的孤寂与壮阔', '《江雪》描绘万籁俱寂中老翁独钓；《敕勒歌》展现草原辽阔、牛羊成群的景象。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (558, 32, 179, '雾的拟人化描写', '雾自称‘淘气的孩子’，依次藏大海、天空、城市，最后藏自己，体现调皮性格。', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (559, 32, 179, '雪孩子的牺牲与升华', '雪孩子救火融化成水，蒸发为水汽，最终变成白云，象征无私与永恒。', 2, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (560, 32, 179, 'ABB式词语运用', '‘水淋淋’‘很轻很轻’‘一朵美丽的白云’等叠词增强语言表现力。', 3, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (561, 32, 180, '称赞的力量', '小刺猬称赞小獾板凳‘一个比一个好’，激发其自信，最终学会做椅子。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (562, 32, 180, '友谊的修复', '松鼠与小熊吵架后，通过纸船写‘愿意和好’，风筝回应，重建友谊。', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (563, 32, 180, '挫折中的成长', '小河撞山抱怨，经大山开导明白‘不平静的水才有力量’，与泉水、瀑布携手前行。', 2, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (564, 32, 180, '拟声词的运用', '‘哗啦哗啦’‘叽叽喳喳’‘嘟嘟嘟’等拟声词生动模拟自然与生活声音。', 3, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (565, 33, 181, '古诗二首（《村居》《咏柳》）', '学习清代高鼎的《村居》和唐代贺知章的《咏柳》，理解诗句中描绘的春天景象，如草长莺飞、杨柳拂堤、纸鸢高飞、碧玉妆树、春风裁叶等，体会诗人对春天的喜爱之情。要求朗读、背诵，并能想象画面描述春景。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (566, 33, 181, '找春天', '课文以儿童视角描写孩子们在田野中寻找春天的过程，将小草比作眉毛、野花比作眼睛、嫩芽比作音符、溪流比作琴声，运用拟人和比喻手法展现春天的生机。要求朗读并仿说春天的样子。', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (567, 33, 181, '开满鲜花的小路', '讲述鼹鼠先生收到长颈鹿寄来的花籽包裹，因包裹破损种子洒落，第二年春天沿途开出鲜花，成为“美好的礼物”。故事强调善意传递与分享的快乐。要求分角色朗读，并理解“美好的礼物”的含义。', 2, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (568, 33, 181, '邓小平爷爷植树', '记叙1987年邓小平在北京天坛公园植树的情景，突出其认真细致、一丝不苟的态度。文中包含“碧空如洗”“兴致勃勃”等成语，引导学生学习人物品质并参与植树活动。', 3, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (569, 33, 181, '口语交际：注意说话的语气', '训练学生使用恰当、礼貌的语气进行沟通，避免生硬或命令式语言。通过具体情境（如表达不同兴趣、道歉、提醒）练习委婉表达。', 4, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (570, 33, 181, '语文园地一', '包括识字加油站（公园导览图相关词语）、字词句运用（补充形容春天的词语）、书写提示（左上/左下包围结构字的写法）、日积月累（白居易《赋得古原草送别》节选）及快乐读书吧（推荐阅读儿童故事）。', 5, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (571, 33, 182, '雷锋叔叔，你在哪里', '以诗歌形式追寻雷锋足迹，通过小溪、小路的拟人化叙述，展现雷锋冒雨抱孩子、背大娘的善举，强调“哪里需要献出爱心，雷锋就出现在哪里”的精神。要求理解“泥泞”“年迈”“晶莹”等词义。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (572, 33, 182, '千人糕', '通过父子对话揭示一块普通米糕背后涉及农民种稻、工人制糖、运输销售等众多劳动者，说明任何物品都凝聚着无数人的劳动，应珍惜成果。要求借助插图梳理制作流程。', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (573, 33, 182, '一匹出色的马', '讲述妹妹走累时，爸爸用柳枝当作“马”激发其兴趣，使其高兴回家的故事，体现父亲的智慧与童趣。要求体会妹妹情绪变化并抄写优美景物描写句。', 2, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (574, 33, 182, '语文园地二', '包括识字加油站（职业名称如教师、理发师等）、字词句运用（景物描写仿写、“特别”“经过”等多义词辨析）、展示台（写字姿势）、日积月累（助人谚语）及我爱阅读（《一株紫丁香》表达对老师的感恩）。', 3, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (575, 33, 183, '神州谣', '以歌谣形式介绍中国地理（黄河、长江、长城、珠峰）和两岸关系（台湾与大陆是一家），以及民族团结、共同繁荣的主题。要求朗读并积累“华夏儿女”“炎黄子孙”等词语。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (576, 33, 183, '传统节日', '按时间顺序介绍春节、元宵、清明、端午、七夕、中秋、重阳等节日习俗，如贴窗花、赛龙舟、乞巧、登高等。要求背诵并按时间排序节日。', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (577, 33, 183, '“贝”的故事', '讲解“贝”字甲骨文形态及其作为古代货币的历史，引申出“赚、赔、购、贫”等与钱财相关的形声字，揭示汉字构形规律。', 2, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (578, 33, 183, '中国美食', '列举凉拌菠菜、香煎豆腐、红烧茄子等烹饪方法及对应菜肴，认识“煎、煮、蒸、炸、烤、爆、炖”等动词，并联系家乡美食拓展表达。', 3, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (579, 33, 183, '口语交际：长大以后做什么', '鼓励学生表达未来职业愿望并说明理由，同时倾听他人想法，培养清晰表达与交流能力。', 4, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (580, 33, 183, '语文园地三', '包括味觉形容词（甜津津、酸溜溜等）、形近字辨析（霄/宵、赔/陪等）、部首查字法（鹿、金、高、鱼等字的部首）、十二生肖及我爱阅读（《小柳树和小枣树》寓言，强调各有所长）。', 5, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (581, 33, 184, '彩色的梦', '以儿童视角描绘彩色铅笔画出的梦境：草坪变绿、野花变红、天空变蓝，森林中雪松拉手、烟囱结太阳等奇幻画面，鼓励学生仿写自己的彩色梦。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (582, 33, 184, '枫树上的喜鹊', '叙述“我”将喜鹊一家视为童话角色，想象喜鹊阿姨教弟弟拼音、指认太阳的情景，体现童心与自然和谐。要求默读并理解反复出现的“我喜欢”的情感。', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (583, 33, 184, '沙滩上的童话', '孩子们在沙滩垒城堡，编造救公主打魔王的故事，最终将妈妈当作被救的公主，展现游戏中的创造力与亲子温情。要求根据开头续编故事。', 2, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (584, 33, 184, '我是一只小虫子', '以第一人称幽默描述当小虫子的烦恼（被苍耳刺、淹进尿坑）与乐趣（露珠洗脸、搭狗便车旅行），结尾以夜晚歌声收束，体现乐观态度。要求找出“不错”的表现。', 3, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (585, 33, 184, '语文园地四', '包括玩具名称、情绪词语分类（生气/高兴/难过）、“一会儿……一会儿……”句式仿写、全包围/三面包围字书写规则、诚信名言及手影戏故事（从冲突到和解）。', 4, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (586, 33, 185, '寓言二则（《亡羊补牢》《揠苗助长》）', '《亡羊补牢》说明及时补救可避免更大损失；《揠苗助长》讽刺违反规律急于求成反致失败。要求理解成语含义并联系生活实例。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (587, 33, 185, '画杨桃', '因座位角度不同，“我”将杨桃画成五角星，老师引导同学换位观察，阐明“看的角度不同，样子也不同”的道理，强调尊重他人视角。', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (588, 33, 185, '小马过河', '小马遇河，老牛说水浅，松鼠说水深，妈妈教导亲自尝试。故事说明亲身实践的重要性，反对盲从或全盘否定他人经验。', 2, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (589, 33, 185, '口语交际：图书借阅公约', '小组讨论制定班级图书管理规则，如借阅流程、爱护书籍、公平借阅等，培养集体协商与规则意识。', 3, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (590, 33, 185, '语文园地五', '包括场所名称（厕所、大厦等）、笑的词语表演、对话语气朗读（连蹦带跳、难为情、和颜悦色）、近义词发现（教诲-教导）、《弟子规》节选及寓言故事《好天气和坏天气》（转换视角看问题）。', 4, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (591, 33, 186, '古诗二首（《晓出净慈寺送林子方》《绝句》）', '学习杨万里“接天莲叶无穷碧，映日荷花别样红”与杜甫“两个黄鹂鸣翠柳，一行白鹭上青天”，感受夏日西湖与春日成都的鲜明色彩与动静结合之美。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (592, 33, 186, '雷雨', '按雷雨前（乌云压顶、蝉静）、雷雨中（风雨交加、雨幕遮物）、雷雨后（彩虹、蛙鸣）三阶段描写，训练按顺序观察与背诵。', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (593, 33, 186, '要是你在野外迷了路', '介绍太阳（正午指南）、北极星（夜间指北）、大树（枝叶稠南稀北）、积雪（化得快为南）等天然指南针，强调细心观察与思考。', 2, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (594, 33, 186, '太空生活趣事多', '说明太空中睡觉需睡袋、喝水用吸管袋、洗澡用湿巾等特殊方式，因失重环境导致日常行为改变，激发对航天科技的兴趣。', 3, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (595, 33, 186, '语文园地六', '包括公共设施名称（博物馆、研究所等）、字形辨析（含/迎/留）、词语理解方法（暗示、泄露、喧闹）、大自然问号写话及《悯农》古诗。', 4, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (596, 33, 187, '大象的耳朵', '大象因他人质疑竖起耳朵，却招致虫扰，最终明白“人家是人家，我是我”，强调接纳自我独特性。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (597, 33, 187, '蜘蛛开店', '蜘蛛因嫌织口罩（河马）、围巾（长颈鹿）、袜子（蜈蚣）费力而屡换商品，讽刺缺乏市场调研与坚持的经营方式，具幽默与警示意义。', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (598, 33, 187, '青蛙卖泥塘', '青蛙听从动物建议不断改造泥塘（种草、引水、栽树、修路、盖房），最终因环境变美而放弃出售，体现共建美好家园的理念。', 2, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (599, 33, 187, '小毛虫', '小毛虫虽笨拙但不羡慕他人，专注织茧，终化飞蛾。故事传达“每个人都有该做的事”“万物有规律”的哲理，鼓励耐心与自我成长。', 3, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (600, 33, 187, '语文园地七', '包括家务动词（扫、擦、倒）、字义猜测（柔软、挑、揭）、比喻句识别（枫树像伞、耳朵像扇子）、养宠物理由写话及二十四节气歌。', 4, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (601, 33, 188, '祖先的摇篮', '将原始森林喻为祖先摇篮，想象祖先摘果、掏蛋、赛跑、采薇等活动，表达对先民生活的追忆与自然的敬畏。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (602, 33, 188, '羿射九日', '神话讲述十日并出致灾，羿射九日留一，恢复生态平衡。突显英雄拯救苍生的壮举与自然秩序的重要性。', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (603, 33, 188, '黄帝的传说', '记述黄帝受草帽滚动启发发明车，见蚁浮叶启发造船，体现观察自然、造福人类的创造精神。', 2, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (604, 33, 188, '口语交际：推荐一部动画片', '训练学生清晰介绍动画片印象、人物或情节，并认真倾听他人推荐。', 3, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (605, 33, 188, '语文园地八', '包括偏旁归类识字（钅、木、氵、火、土）、时间副词运用（忽然/立刻/渐渐）、夸张句仿写（害怕极了→慌慌张张）、冫/氵偏旁区分及古诗《舟夜书所见》。', 4, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (606, 34, 189, '有新鲜感的词句', '学习识别并欣赏课文中具有新奇表达或生动描写的词句，如《大青树下的小学》中‘窗外十分安静，树枝不摇了，鸟儿不叫了……’等句子，并尝试在写作中运用。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (607, 34, 189, '校园生活描写', '通过《大青树下的小学》《花的学校》等课文，了解不同校园环境与学习生活，练习用具体场景（如教室、操场）描述自己的学校生活。', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (608, 34, 189, '习作：猜猜他是谁', '学习通过外貌、性格、行为等细节描写一个同学，但不出现其姓名，让读者能猜出是谁，培养观察力与描写能力。', 2, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (609, 34, 189, '口语交际：我的暑假生活', '练习清晰讲述暑假中的新鲜事，可借助图片或实物辅助表达，并选择他人可能感兴趣的内容进行分享。', 3, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (610, 34, 190, '古诗鉴赏', '学习《望洞庭》《山行》《夜书所见》三首描写秋天景色的古诗，结合注释理解诗意，体会诗人对秋景的情感，并背诵默写。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (611, 34, 190, '理解词语的方法', '掌握通过上下文、查字典、联系生活经验等方式理解难懂词语，如‘明朗’‘凌乱’‘五彩缤纷’等。', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (612, 34, 190, '写日记', '了解日记的格式（日期、星期、天气）、内容（所见所闻所感）及作用，练习坚持写日记记录日常生活。', 2, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (613, 34, 190, '秋天的景物描写', '通过《铺满金色巴掌的水泥道》《秋天的雨》等课文，学习用比喻、拟人等手法描写秋日景色，如落叶、秋雨、果实等。', 3, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (614, 34, 191, '阅读预测策略', '学习根据题目、插图、故事情节、人物特点等线索对后续内容进行合理预测，如在《总也倒不了的老屋》中预测老屋是否会继续帮助小动物。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (615, 34, 191, '童话故事理解', '阅读《犟龟》《小狗学叫》等童话，分析人物性格（如陶陶的坚持），预测故事结局，并讨论不同结局的可能性。', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (616, 34, 191, '续写故事', '根据图画或开头（如李晓明生日），发挥想象续写完整故事，注意情节连贯与人物行为合理性。', 2, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (617, 34, 191, '口语交际：名字里的故事', '了解自己或他人名字的含义与来历，练习清晰讲述，并在交流中表现出倾听兴趣。', 3, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (618, 34, 192, '童话的想象与神奇', '通过《宝葫芦的秘密》《在牛肚子里旅行》《一块奶酪》等课文，体会童话中不合常理却充满趣味的情节（如宝葫芦实现愿望、蟋蟀在牛肚子里旅行）。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (619, 34, 192, '角色与情节构思', '学习从给定词语（如‘菜园、西红柿、茄子’）出发，设定角色、时间、地点和事件，创编完整童话故事。', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (620, 34, 192, '友谊与品格', '从童话中感悟友情（如青头与红头）、纪律（蚂蚁队长）等美好品质，理解童话蕴含的道理。', 2, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (621, 34, 192, '快乐读书吧：经典童话推荐', '了解《安徒生童话》《格林童话》《稻草人》等经典作品，激发课外阅读兴趣。', 3, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (622, 34, 193, '细致观察方法', '学习调动多种感官（看、听、摸、闻、尝）观察事物，如《搭船的鸟》中对翠鸟外形与捕鱼动作的观察，《金色的草地》中对蒲公英颜色变化的发现。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (623, 34, 193, '观察记录与描写', '练习将观察到的事物变化（如杨梅的颜色、味道；草地的色彩）用准确、生动的语言记录下来。', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (624, 34, 193, '习作：我们眼中的缤纷世界', '选择印象最深的观察对象（动物、植物、自然现象等），围绕其特点写出所见所感，注意语句通顺与细节描写。', 2, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (625, 34, 194, '关键语句的作用', '识别段落中的中心句（通常在开头），理解全段如何围绕该句展开，如《富饶的西沙群岛》中‘风景优美，物产丰富’统领全文。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (626, 34, 194, '景物描写方法', '学习从不同角度（海水、海底、海岛）描写西沙群岛，从不同地点（海滨、庭院、公园、街道）描写小城，从四季变化描写小兴安岭。', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (627, 34, 194, '围绕一个意思写段落', '练习以‘操场后面的小花园真美’等句子开头，围绕中心意思组织材料，写出具体景象。', 2, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (628, 34, 194, '祖国山河赞美', '通过课文感受西沙群岛、海滨小城、小兴安岭、香港等地的美丽与富饶，激发热爱祖国的情感。', 3, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (629, 34, 195, '大自然的声音', '学习将风、水、动物等自然现象拟人化为‘音乐家’‘歌手’，用生动语言描写其声音特点，如‘呢喃细语’‘雄伟乐曲’。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (630, 34, 195, '古诗中的自然', '理解《鹿柴》《望天门山》《饮湖上初晴后雨》三首诗描绘的自然景象，体会动静结合、比喻等手法。', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (631, 34, 195, '摘抄与积累', '养成摘抄好词佳句的习惯，可分类整理（如描写声音、景物），并注明出处，用于习作参考。', 2, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (632, 34, 195, '习作：我有一个想法', '针对生活中问题（如沉迷手机、班级缺乏植物角），提出明确看法与改进建议，做到问题清晰、建议具体。', 3, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (633, 34, 196, '带着问题默读', '掌握默读技巧（不出声、不指读），边读边思考问题，如‘白求恩为什么说手术台是阵地？’‘赵一曼为何‘丢’碗？’', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (634, 34, 196, '人物品质感悟', '从司马光（机智勇敢）、童第周（勤奋争气）、白求恩（坚守岗位）、赵一曼（关爱战士）等人物故事中体会美好品质。', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (635, 34, 196, '文言文初步', '学习《司马光》这篇简短文言文，借助注释理解大意，感受古代汉语特点，并练习复述故事。', 2, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (636, 34, 196, '习作：那次经历真难忘', '回忆印象深刻的一次经历，按事情发展顺序写清楚经过，并表达出‘难忘’的情感。', 3, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (637, 35, 197, '古诗三首', '学习唐代杜甫《绝句》、宋代苏轼《惠崇春江晚景》和曾几《三衢道中》，理解诗意，想象画面，体会春天的生机与自然之美。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (638, 35, 197, '燕子', '通过描写燕子的外形、飞行姿态和春日景象，体会作者对燕子的喜爱之情，学习生动的语言表达。', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (639, 35, 197, '荷花', '理解课文如何通过“挨挨挤挤”“冒”等词语表现荷花的动态美，感受“一大幅活的画”的意境。', 2, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (640, 35, 197, '昆虫备忘录', '了解蜻蜓、瓢虫、蚂蚱等昆虫的特点，如复眼、翅的结构、进食习性等，激发对自然生物的兴趣。', 3, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (641, 35, 197, '口语交际：春游去哪儿玩', '学会清晰表达自己的观点，倾听他人意见，进行小组讨论并投票选出最佳春游地点。', 4, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (642, 35, 197, '习作：我的植物朋友', '选择一种植物进行细致观察，制作记录卡，围绕其名称、样子、颜色、气味、生长特点等写出具体内容。', 5, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (643, 35, 197, '语文园地', '总结阅读中遇到优美语句的体会方法，积累“援、掷、捞、缚、缭、络、资、贡、贷”等形近字词，练习用“荡漾”“飘荡”等词语辨析。', 6, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (644, 35, 198, '守株待兔', '理解农夫因侥幸心理而放弃劳动，最终被嘲笑的原因，明白做事要靠努力，不能有不劳而获的想法。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (645, 35, 198, '陶罐和铁罐', '分析陶罐谦虚、铁罐骄傲的性格特征，理解“谦虚使人进步，骄傲使人落后”的道理，体会不同结局的寓意。', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (646, 35, 198, '鹿角和鹿腿', '理解鹿在赞美自己美丽角的同时忽视了实用的腿，最终依靠腿逃生的故事，体会外在与内在价值的关系。', 2, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (647, 35, 198, '池子与河流', '通过对比池子安逸懒惰与河流奔流不息的命运，理解“才能一旦让懒惰支配，就一无所为”的道理。', 3, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (648, 35, 198, '口语交际：该不该实行班干部轮流制', '表达对班干部轮流制度的看法，说明理由，尊重他人观点，学会倾听与思考。', 4, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (649, 35, 198, '习作：看图画，写一写', '观察图画内容，描述人物动作、表情、可能说的话，把看到的、想到的写清楚。', 5, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (650, 35, 198, '语文园地', '总结寓言故事的共同特点，如短小精悍、蕴含道理；学习“源源不断”“津津有味”等叠词，仿写句子；掌握通知的格式。', 6, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (651, 35, 199, '古诗三首', '学习王安石《元日》、杜牧《清明》、王维《九月九日忆山东兄弟》，理解各诗所写的传统节日及其情景。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (652, 35, 199, '纸的发明', '了解造纸术的发展历程，从龟甲竹简到蔡伦改进造纸术的过程，理解其对世界文明的影响。', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (653, 35, 199, '赵州桥', '学习赵州桥的设计特点（单拱、小桥洞），体会其“创举”意义，理解“坚固”与“美观”的结合。', 2, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (654, 35, 199, '一幅名扬中外的画', '理解《清明上河图》为何名扬中外，学习通过细节描写展现市井生活的艺术手法。', 3, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (655, 35, 199, '综合性学习：中华传统节日', '分组调查一个传统节日，收集资料，整理风俗习惯，准备展示成果。', 4, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (656, 35, 199, '语文园地', '总结段落围绕一个意思展开的写作方法，如《赵州桥》第3自然段写“美观”，《清明上河图》写“热闹”。学习“文房四宝”“雅人四好”“中医四诊”等文化常识。', 5, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (657, 35, 200, '花钟', '理解不同植物开花时间与温度、湿度、光照、昆虫活动的关系，学习用拟人化语言描写花开过程。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (658, 35, 200, '蜜蜂', '学习法布尔做实验的方法，理解“蜜蜂靠本能而非记忆力辨认方向”，体会科学家严谨的态度。', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (659, 35, 200, '小虾', '观察小虾的生活习性，学习细致描写其动作、反应，如“蹦”“舞动”“打起来”等。', 2, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (660, 35, 200, '习作：我做了一项小实验', '选择一项小实验，按“实验名称、准备、过程、结果”顺序写清步骤，使用“先……接着……然后……最后……”等连接词。', 3, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (661, 35, 200, '语文园地', '掌握利用关键语句概括段落大意的方法，学习提出问题的习惯；修改病句，注意标点与逻辑。', 4, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (662, 35, 201, '宇宙的另一边', '理解“宇宙另一边”的奇妙设定，如雪在夏天下、太阳从西边升起、石头会行走等，体会想象的无限可能。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (663, 35, 201, '我变成了一棵树', '理解主人公变树后发生的神奇事件，如鸟窝住动物、妈妈住进三角形鸟窝，体会想象带来的乐趣。', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (664, 35, 201, '习作：奇妙的想象', '选择题目如“贪玩的小水滴”“躲在草丛里的星星”等，大胆想象，写出属于自己的奇妙故事。', 2, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (665, 35, 201, '交流平台', '认识到想象可以创造出现实中不存在的事物，如“尾巴有一只猫”“喜欢睡觉的风”，体会反向思维的乐趣。', 3, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (666, 35, 202, '童年的水墨画', '通过《溪边》《江上》《林中》三节诗，感受童年在自然中的快乐，理解“人影给溪水染绿了”等诗句的意境。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (667, 35, 202, '剃头大师', '分析“我”与老师傅的不同剃头方式，理解“剃头大师”实为“害人精”的反讽意味，体会幽默风格。', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (668, 35, 202, '肥皂泡', '理解吹肥皂泡的过程，体会“轻清脆丽的小球”像“美丽的梦”般的想象，感受童年的纯真与希望。', 2, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (669, 35, 202, '我不能失信', '理解宋庆龄坚持守信，即使一个人在家也不后悔，体会诚信的重要性。', 3, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (670, 35, 202, '习作：身边那些有特点的人', '选取一位有特点的同学或家人，用“昆虫迷”“智多星”等词语形容，通过具体事例写出其个性特征。', 4, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (671, 35, 203, '我们奇妙的世界', '理解“一切看上去都是有生命的”这句话，从清晨日出、云彩变幻、雨后水洼、星空群星等角度体会世界的奇妙。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (672, 35, 203, '海底世界', '从宁静、声音、动物活动方式、植物多样性、资源丰富等方面，全面介绍海底世界的奇异与富饶。', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (673, 35, 203, '火烧云', '观察火烧云的颜色变化（红彤彤、金灿灿、半紫半黄）和形状演变（马、狗、狮子），体会自然之美。', 2, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (674, 35, 203, '习作：国宝大熊猫', '围绕“大熊猫是猫吗？”“生活在哪儿？”“为什么是国宝？”等问题，搜集资料，写一篇条理清晰的介绍文。', 3, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (675, 35, 204, '慢性子裁缝和急性子顾客', '通过顾客不断改变要求、裁缝始终慢条斯理的情节，体会人物性格反差与幽默效果。', 0, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (676, 35, 204, '方帽子店', '理解旧式方帽子的不合理与新式圆帽的舒适性，体会变革的必然性，认识创新的价值。', 1, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (677, 35, 204, '漏', '分析老虎与贼因害怕“漏”而互相误以为对方是“漏”，最终滚下山坡吓昏的荒诞情节，体会民间故事的趣味性。', 2, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (678, 35, 204, '枣核', '理解小个子枣核如何机智帮助村民夺回牲口，面对县官也能巧妙逃脱，体现智慧与勇气。', 3, NULL, 5);
INSERT INTO `ah_knowledge` (`id`, `textbook_id`, `unit_id`, `name`, `content`, `order`, `difficulty`, `importance`) VALUES (679, 35, 204, '习作：这样想象真有趣', '选择一种动物（如母鸡飞天、蚂蚁比树大），大胆想象其失去原有特征后的奇特经历，编写童话故事。', 4, NULL, 5);
COMMIT;

-- ----------------------------
-- Table structure for ah_manager
-- ----------------------------
DROP TABLE IF EXISTS `ah_manager`;
CREATE TABLE `ah_manager` (
  `id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `username` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `type` int NOT NULL,
  `status` int DEFAULT NULL,
  `create_time` int DEFAULT NULL,
  `update_time` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_ah_manager_id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Records of ah_manager
-- ----------------------------
BEGIN;
INSERT INTO `ah_manager` (`id`, `username`, `password`, `token`, `type`, `status`, `create_time`, `update_time`) VALUES ('2e43712b-fe47-4870-9b45-5f7fe86ebc16', 'xiaxianlin', '$2b$12$yegUH8nSrh..RjweKYBlr.O8NRNHrwas0G2DDFt9QoYJ3ucM.oFH.', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjJlNDM3MTJiLWZlNDctNDg3MC05YjQ1LTVmN2ZlODZlYmMxNiIsInVwZGF0ZV90aW1lIjoxNzY2NzE4MjIyLCJleHAiOjE3NjczMjMwMjJ9.DlnsjLEaSlpFm3eNpy69FO4_ddRqFDEIBsiO5OBsVXE', 0, 1, 1763881750, 1766718222);
INSERT INTO `ah_manager` (`id`, `username`, `password`, `token`, `type`, `status`, `create_time`, `update_time`) VALUES ('6b2d7431-210f-4f34-8924-058f41cdf1b5', 'admin', '$2b$12$Icj2Me4kuNjxvXSPkAccMOAIJ6.L9eqcPXi60DlR.5kZoa4XQe5Te', NULL, 1, 1, 1766039913, 1766039913);
COMMIT;

-- ----------------------------
-- Table structure for ah_practice
-- ----------------------------
DROP TABLE IF EXISTS `ah_practice`;
CREATE TABLE `ah_practice` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL COMMENT '练习名称',
  `slug` varchar(100) NOT NULL COMMENT '练习标识',
  `icon` varchar(255) DEFAULT NULL COMMENT '图标URL',
  `description` text COMMENT '描述',
  `type` varchar(20) NOT NULL COMMENT '类型：system/custom',
  `practice_type` varchar(50) DEFAULT NULL COMMENT '系统练习标识（兼容旧逻辑）',
  `parameters` json NOT NULL COMMENT '配置参数',
  `create_time` int NOT NULL COMMENT '创建时间',
  `update_time` int NOT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `ix_ah_practice_slug` (`slug`),
  KEY `ix_ah_practice_type` (`type`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Records of ah_practice
-- ----------------------------
BEGIN;
INSERT INTO `ah_practice` (`id`, `name`, `slug`, `icon`, `description`, `type`, `practice_type`, `parameters`, `create_time`, `update_time`) VALUES (7, '日常练习', 'daily_practice', '📆', '快来开始今天的练习吧！✨', 'system', NULL, '[{\"key\": \"generate_count\", \"type\": \"system\", \"value\": {\"1\": 15, \"2\": 15, \"3\": 15, \"4\": 15, \"5\": 15, \"6\": 15, \"7\": 15, \"8\": 15, \"9\": 15}, \"required\": true, \"value_type\": \"object\", \"description\": \"生成题目数量，key为年级，value为生成题目数量\"}, {\"key\": \"recall_count\", \"type\": \"system\", \"value\": {\"1\": 0, \"2\": 0, \"3\": 0, \"4\": 0, \"5\": 0, \"6\": 0, \"7\": 0, \"8\": 0, \"9\": 0}, \"required\": true, \"value_type\": \"object\", \"description\": \"召回题目数量，key为年级，value为召回题目数量\"}, {\"key\": \"textbook_id\", \"type\": \"input\", \"required\": true, \"value_type\": \"number\", \"description\": \"教材ID\"}]', 1766415197, 1766415197);
INSERT INTO `ah_practice` (`id`, `name`, `slug`, `icon`, `description`, `type`, `practice_type`, `parameters`, `create_time`, `update_time`) VALUES (8, '单元练习', 'unit_practice', '📚', '选择单元开始练习，巩固知识点！✨', 'system', NULL, '[{\"key\": \"generate_count\", \"type\": \"system\", \"value\": {\"1\": 15, \"2\": 15, \"3\": 15, \"4\": 15, \"5\": 15, \"6\": 15, \"7\": 15, \"8\": 15, \"9\": 15}, \"required\": true, \"value_type\": \"object\", \"description\": \"生成题目数量，key为年级，value为生成题目数量\"}, {\"key\": \"recall_count\", \"type\": \"system\", \"value\": {\"1\": 0, \"2\": 0, \"3\": 0, \"4\": 0, \"5\": 0, \"6\": 0, \"7\": 0, \"8\": 0, \"9\": 0}, \"required\": true, \"value_type\": \"object\", \"description\": \"召回题目数量，key为年级，value为召回题目数量\"}, {\"key\": \"unit_id\", \"type\": \"input\", \"required\": true, \"value_type\": \"number\", \"description\": \"单元ID\"}, {\"key\": \"textbook_id\", \"type\": \"input\", \"required\": true, \"value_type\": \"number\", \"description\": \"教材ID\"}]', 1766415197, 1766415197);
INSERT INTO `ah_practice` (`id`, `name`, `slug`, `icon`, `description`, `type`, `practice_type`, `parameters`, `create_time`, `update_time`) VALUES (9, '综合评估', 'assess_practice', '🎯', '让AI帮你找到学习的方向！✨', 'system', NULL, '[{\"key\": \"generate_count\", \"type\": \"system\", \"value\": {\"1\": 15, \"2\": 15, \"3\": 15, \"4\": 15, \"5\": 15, \"6\": 15, \"7\": 15, \"8\": 15, \"9\": 15}, \"required\": true, \"value_type\": \"object\", \"description\": \"生成题目数量，key为年级，value为生成题目数量\"}, {\"key\": \"recall_count\", \"type\": \"system\", \"value\": {\"1\": 0, \"2\": 0, \"3\": 0, \"4\": 0, \"5\": 0, \"6\": 0, \"7\": 0, \"8\": 0, \"9\": 0}, \"required\": true, \"value_type\": \"object\", \"description\": \"召回题目数量，key为年级，value为召回题目数量\"}, {\"key\": \"textbook_id\", \"type\": \"input\", \"required\": true, \"value_type\": \"number\", \"description\": \"教材ID\"}]', 1766415197, 1766415197);
COMMIT;

-- ----------------------------
-- Table structure for ah_practice_prompt
-- ----------------------------
DROP TABLE IF EXISTS `ah_practice_prompt`;
CREATE TABLE `ah_practice_prompt` (
  `id` int NOT NULL AUTO_INCREMENT,
  `subject` varchar(50) NOT NULL COMMENT '科目',
  `grade` int NOT NULL COMMENT '年级',
  `practice_slug` varchar(50) NOT NULL COMMENT '练习标识',
  `prompt_slug` varchar(50) NOT NULL COMMENT '提示词标识',
  `create_time` int NOT NULL COMMENT '创建时间',
  `update_time` int NOT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Records of ah_practice_prompt
-- ----------------------------
BEGIN;
INSERT INTO `ah_practice_prompt` (`id`, `subject`, `grade`, `practice_slug`, `prompt_slug`, `create_time`, `update_time`) VALUES (1, '英语', 1, 'assessment', 'assessment_english', 1766499032, 1766499032);
INSERT INTO `ah_practice_prompt` (`id`, `subject`, `grade`, `practice_slug`, `prompt_slug`, `create_time`, `update_time`) VALUES (2, '数学', 1, 'assessment', 'assessment_math', 1766543404, 1766543404);
INSERT INTO `ah_practice_prompt` (`id`, `subject`, `grade`, `practice_slug`, `prompt_slug`, `create_time`, `update_time`) VALUES (3, '英语', 1, 'unit_practice', 'unit_practice_english', 1766543418, 1766543418);
INSERT INTO `ah_practice_prompt` (`id`, `subject`, `grade`, `practice_slug`, `prompt_slug`, `create_time`, `update_time`) VALUES (4, '数学', 1, 'unit_practice', 'unit_practice_math', 1766543432, 1766543432);
INSERT INTO `ah_practice_prompt` (`id`, `subject`, `grade`, `practice_slug`, `prompt_slug`, `create_time`, `update_time`) VALUES (5, '英语', 1, 'daily_practice', 'daily_practice_english', 1766543448, 1766543448);
INSERT INTO `ah_practice_prompt` (`id`, `subject`, `grade`, `practice_slug`, `prompt_slug`, `create_time`, `update_time`) VALUES (6, '数学', 1, 'daily_practice', 'daily_practice_math', 1766543465, 1766543465);
COMMIT;

-- ----------------------------
-- Table structure for ah_practice_session
-- ----------------------------
DROP TABLE IF EXISTS `ah_practice_session`;
CREATE TABLE `ah_practice_session` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '会话ID',
  `student_id` varchar(255) NOT NULL COMMENT '学生ID',
  `practice_id` int NOT NULL COMMENT '练习ID',
  `practice_slug` varchar(50) NOT NULL COMMENT '练习标识',
  `parameters` json NOT NULL COMMENT '练习参数',
  `question_count` int NOT NULL COMMENT '题目数量',
  `answer_count` int NOT NULL COMMENT '回答数量',
  `correct_count` int NOT NULL COMMENT '正确数量',
  `status` int NOT NULL COMMENT '未开始: 0, 进行中: 1, 已完成: 2, 已废弃: 3',
  `generate_status` int NOT NULL COMMENT '未生成: 0, 生成中: 1, 已生成: 2',
  `generate_time` int DEFAULT NULL COMMENT '生成时间',
  `start_time` int NOT NULL COMMENT '开始时间',
  `end_time` int DEFAULT NULL COMMENT '结束时间',
  `create_time` int NOT NULL COMMENT '创建时间',
  `update_time` int NOT NULL COMMENT '更新时间',
  `textbook_id` int DEFAULT NULL,
  `unit_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_ah_practice_session_status` (`status`),
  KEY `ix_ah_practice_session_student_id` (`student_id`),
  KEY `ix_ah_practice_session_generate_status` (`generate_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Records of ah_practice_session
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for ah_practice_session_answer
-- ----------------------------
DROP TABLE IF EXISTS `ah_practice_session_answer`;
CREATE TABLE `ah_practice_session_answer` (
  `id` int NOT NULL AUTO_INCREMENT,
  `session_id` int NOT NULL COMMENT '会话ID',
  `question_id` varchar(255) NOT NULL COMMENT '题目ID',
  `student_id` varchar(255) NOT NULL COMMENT '学生ID',
  `question_order` int NOT NULL COMMENT '题目顺序',
  `unit_id` int DEFAULT NULL COMMENT '单元ID',
  `knowledge` varchar(255) DEFAULT NULL COMMENT '知识点',
  `textbook_id` int DEFAULT NULL COMMENT '教材ID',
  `text_answer` text COMMENT '文本答案/用户答案',
  `status` int NOT NULL COMMENT '答题状态: 0-未答 1-正确 2-错误',
  `time_spent` int NOT NULL COMMENT '耗时(秒)',
  `submit_time` int DEFAULT NULL COMMENT '提交时间',
  `correct_answer` text COMMENT '正确答案',
  `analysis` text COMMENT '错题分析',
  `is_corrected` int NOT NULL COMMENT '是否已订正 0-未订正 1-已订正',
  `corrected_time` int DEFAULT NULL COMMENT '订正时间',
  `create_time` int NOT NULL COMMENT '创建时间',
  `update_time` int NOT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `ix_ah_practice_session_answer_session_id` (`session_id`),
  KEY `ix_ah_practice_session_answer_student_id` (`student_id`),
  KEY `ix_ah_practice_session_answer_unit_id` (`unit_id`),
  KEY `ix_ah_practice_session_answer_textbook_id` (`textbook_id`),
  KEY `ix_ah_practice_session_answer_question_id` (`question_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Records of ah_practice_session_answer
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for ah_practice_session_report
-- ----------------------------
DROP TABLE IF EXISTS `ah_practice_session_report`;
CREATE TABLE `ah_practice_session_report` (
  `id` int NOT NULL AUTO_INCREMENT,
  `session_id` int NOT NULL,
  `student_id` varchar(255) NOT NULL COMMENT '学生ID',
  `total_questions` int NOT NULL COMMENT '题目数量',
  `correct_questions` int NOT NULL COMMENT '正确数量',
  `total_time` int NOT NULL COMMENT '总耗时(秒)',
  `overall_score` float NOT NULL COMMENT '总得分',
  `current_ability` float NOT NULL COMMENT '当前能力值（-3到+3）',
  `confidence` float NOT NULL COMMENT '置信度',
  `ability_level` varchar(50) NOT NULL COMMENT '能力等级',
  `percentile` int NOT NULL COMMENT '百分位排名',
  `knowledge_scores` text NOT NULL COMMENT '知识点掌握情况',
  `question_distribution` text NOT NULL COMMENT '题目来源分布',
  `ability_breakdown` text NOT NULL COMMENT '能力分解（按难度）',
  `learning_speed` float NOT NULL COMMENT '学习速度',
  `consistency` float NOT NULL COMMENT '稳定性',
  `strengths` text NOT NULL COMMENT '优势',
  `weaknesses` text NOT NULL COMMENT '薄弱点',
  `recommendations` text NOT NULL COMMENT '学习建议',
  `create_time` int NOT NULL COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `ix_ah_practice_session_report_session_id` (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Records of ah_practice_session_report
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for ah_prompt
-- ----------------------------
DROP TABLE IF EXISTS `ah_prompt`;
CREATE TABLE `ah_prompt` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(128) NOT NULL COMMENT 'Prompt 名称',
  `slug` varchar(128) NOT NULL COMMENT '唯一短名',
  `type` varchar(64) NOT NULL COMMENT '类型：system/user',
  `description` text COMMENT '描述',
  `template_content` text NOT NULL COMMENT '模版内容',
  `negative_content` text COMMENT '用于图像生成类',
  `model_params` json NOT NULL COMMENT '模型参数',
  `create_time` int NOT NULL COMMENT '创建时间',
  `update_time` int NOT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `ix_ah_prompt_slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Records of ah_prompt
-- ----------------------------
BEGIN;
INSERT INTO `ah_prompt` (`id`, `name`, `slug`, `type`, `description`, `template_content`, `negative_content`, `model_params`, `create_time`, `update_time`) VALUES (4, '图片生成提示词优化', 'image_prompt_optimize', 'system', '用在题目的图片生成', '你是一名专业的图片生成提示词工程师，专门为小学一到三年级的学生设计教育图片。请根据以下教育题目内容，生成一个简单、清晰、适合低年级学生认知水平的图片生成提示词。\n\n题目内容：{question_content}\n\n要求：\n1. **简单明了**：图片内容要简单，避免复杂的背景和过多的细节\n2. **清晰突出**：主要对象要清晰可见，背景简洁，避免干扰元素\n3. **符合认知**：适合小学一到三年级学生的认知水平，使用他们熟悉的事物和场景\n4. **色彩鲜明**：使用明亮、鲜艳的颜色，吸引学生注意力\n5. **风格统一**：采用卡通、插画风格，避免写实风格\n6. **重点突出**：如果是选择题或辨识题，重点突出需要识别的对象，使其成为画面焦点\n7. **场景简单**：如果是场景题，只描述主要场景和1-3个关键元素，避免复杂构图\n8. **物品识别**：如果是物品识别题，直接描述物品，使用纯色或简单背景\n\n图片生成提示词格式要求：\n- 使用简洁的中文或英文描述\n- 明确指定风格：如\"卡通风格\"、\"插画风格\"、\"简单线条\"\n- 明确指定背景：如\"纯色背景\"、\"简单背景\"、\"白色背景\"\n- 明确指定颜色：如\"鲜艳的颜色\"、\"明亮的颜色\"\n- 避免使用专业术语或复杂概念\n\n请直接返回优化后的图片生成提示词，不要添加任何解释或说明。', NULL, '{}', 1766123559, 1766123559);
INSERT INTO `ah_prompt` (`id`, `name`, `slug`, `type`, `description`, `template_content`, `negative_content`, `model_params`, `create_time`, `update_time`) VALUES (5, '分析问题答案', 'analyze_question_answer', 'system', NULL, '请根据题目内容分析学生的答案\n\n{question_content}\n\n请按照以下步骤进行分析：\n\n第一步：判断答案正确性\n请仔细判断学生的答案是否正确。判断标准：\n- 如果答案在语义、逻辑、数值上与参考答案一致，即使表达方式不同，也应判定为正确\n- 考虑答案的格式差异（如：小数、分数、百分数的不同表示方式）\n- 对于选择题，如果学生选择了与参考答案等价的选项，应判定为正确\n- 对于填空题或计算题，如果数值正确但单位或格式略有不同，需要根据题目要求判断\n\n第二步：给出分析结果\n根据判断结果，提供相应的分析：\n\n【如果答案正确】\n1. 肯定学生的答案，给予鼓励\n2. 简要说明答案的正确性\n3. 可以适当补充相关知识点或解题思路的进一步说明\n4. 字数控制在100-150字\n\n【如果答案错误】\n1. 明确指出答案错误\n2. 分析学生为什么会答错（可能的原因，如：概念理解错误、计算失误、审题不清等）\n3. 解释相关知识点，帮助学生理解正确思路\n4. 提供如何避免类似错误的建议\n5. 字数控制在200字以内\n\n要求：\n- 语言简洁明了，适合学生阅读\n- 语气温和鼓励，避免打击学生积极性\n- 重点突出知识点和解题思路\n- 如果答案正确，要给予肯定和鼓励\n- 如果答案错误，要明确指出问题并提供改进建议\n\n请严格按照以下JSON格式返回结果：\n{format_instructions}', NULL, '{}', 1766112753, 1766673036);
INSERT INTO `ah_prompt` (`id`, `name`, `slug`, `type`, `description`, `template_content`, `negative_content`, `model_params`, `create_time`, `update_time`) VALUES (6, '综合评估-英语', 'assessment_english', 'system', '给低年级的英语综合评估提示词', '# 英语IRT能力评估生成\n\n## 一、评测概述\n**学科**：英语 | **年级**：{grade} | **题目数量**：{count}道\n\n**评测目标**：基于IRT理论快速定位学生英语能力\n- 能力值范围：-3 到 +3\n- 定位精度：±0.5\n- 10-20题完成评估\n\n---\n\n## 二、能力维度覆盖\n\n| 能力维度 | 占比 | 考察内容 |\n|:--------|:----:|:---------|\n| **词汇** | 30-40% | 单词识别、拼写、词义、搭配 |\n| **语法** | 20-30% | 句型、时态、语法规则 |\n| **听力** | 15-25% | 听音辨识、听力理解 |\n| **阅读** | 15-25% | 句子理解、短文阅读 |\n| **口语** | 5-15% | 发音模仿、简单对话 |\n\n**年级标准**：\n- 低年级（1-2）：50-200词、简单句型、单词识别\n- 中年级（3-4）：200-600词、基础时态、对话理解\n- 高年级（5-6）：600-1000词、复杂句型、语篇理解\n\n**出题要求**：\n✓ 能力维度均衡分布\n✓ 可跨单元、跨主题\n✓ 符合年级能力标准\n\n---\n\n## 三、IRT难度定义\n\n| 难度 | IRT范围 | 通过率 | 能力特征 |\n|:----:|:-------:|:------:|:---------|\n| 简单 | -1.5~-0.5 | 85-95% | 基础词汇、简单句型 |\n| 普通 | -0.5~+0.5 | 50-75% | 词义理解、语法应用 |\n| 困难 | +0.5~+1.5 | 20-40% | 词汇扩展、复杂理解 |\n\n**难度分配**：简单{simple_count}题 | 普通{medium_count}题 | 困难{hard_count}题\n\n---\n\n## 四、能力分布建议\n\n根据题目总数均衡分配（使用选择题、拼写题、口语题）：\n- **10题**：选择题5（词汇语法3 + 听力2） + 拼写题3 + 口语题2\n- **15题**：选择题8（词汇语法5 + 听力3） + 拼写题4 + 口语题3\n- **20题**：选择题11（词汇语法7 + 听力4） + 拼写题6 + 口语题3\n\n---\n\n## 五、题型配置\n{question_types}\n\n**注意**：生成的题目类型必须严格限制在上述给定的题型范围内。\n\n**题型限制**：\n- 单一题型 ≤ 40%\n- 优先客观题（便于自动判分）\n- 避免开放性题目\n\n---\n\n## 六、题目设计要求\n\n### 6.1 区分度（核心）\n- **简单**：85%+通过率，建立信心\n- **普通**：50-75%通过率，区分能力\n- **困难**：20-40%通过率，拔尖筛选\n\n### 6.2 独立性\n- 每题考察1个核心能力\n- 题目间无依赖关系\n- 避免提示效应\n\n### 6.3 标准化\n- 答案唯一明确\n- 英语表达地道\n- 符合{grade}水平\n- 无超纲内容\n\n---\n\n## 七、质量标准\n\n✅ **必须满足**：\n- [ ] 难度分布：简30% | 普50% | 难20%（±1题）\n- [ ] 能力均衡：词汇、语法、听力、阅读、口语\n- [ ] 区分度明确：各难度层次一致\n- [ ] 判分友好：答案唯一\n- [ ] 题目独立：无依赖关系\n- [ ] 年级适配：符合{grade}标准\n- [ ] 题型多样：≥3种，单一≤40%\n- [ ] 语言准确：地道英语\n\n---\n\n## 八、输出格式\n{format_instructions}\n\n**字段说明**：\n- `knowledge`: 能力维度（如\"词汇能力\"）\n- `difficulty`: [\"简单\", \"普通\", \"困难\"]\n- `question_type`: 必须严格匹配可用题型（选择题、拼写题、口语题）\n- `question_subtype`: 必须严格匹配对应题型的子类型\n- `resource_content`: 听音选词/听音选句/听音写单词/口语题使用\n- `resource_type`: 听音类题目为 \"audio\"，看图类题目为 \"image\"，其他为空', NULL, '{}', 1766499323, 1766499323);
INSERT INTO `ah_prompt` (`id`, `name`, `slug`, `type`, `description`, `template_content`, `negative_content`, `model_params`, `create_time`, `update_time`) VALUES (7, '综合评估-数学', 'assessment_math', 'system', NULL, '# 数学IRT能力评估生成\n\n## 一、评测概述\n**学科**：数学 | **年级**：{grade} | **题目数量**：{count}道\n\n**评测目标**：基于IRT理论快速定位学生数学能力\n- 能力值范围：-3 到 +3\n- 定位精度：±0.5\n- 10-20题完成评估\n\n---\n\n## 二、知识点范围\n{knowledge_text}\n\n**知识点分类**：\n- **概念理解**：定义、性质、定理\n- **运算求解**：算法、算理、精确计算\n- **逻辑推理**：归纳、演绎、证明\n- **问题解决**：建模、应用、综合分析\n\n---\n\n## 三、IRT难度定义\n\n| 难度 | 目标群体 | 通过率 | 题目特征 |\n|:----:|:--------|:------:|:---------|\n| 基础 | 学困/中等 | 85-95% | 基本概念、直接运算、一步求解 |\n| 中等 | 中等/优秀 | 50-75% | 变式应用、两步运算、转换思维 |\n| 困难 | 优秀/尖子 | 20-40% | 综合应用、多步骤、逆向思维 |\n\n**难度分配**：基础{simple_count}题 | 中等{medium_count}题 | 困难{hard_count}题\n\n**能力覆盖**：基础知识30% | 基本技能40% | 综合应用30%\n\n---\n\n## 四、题目设计细则\n\n### 4.1 基础题（{simple_count}题）\n- **题型**：直接计算、概念判断、简单填空\n- **特征**：一步求解，无陷阱\n- **示例**：20以内加减、图形识别\n- **年级例**：\n  - 低（1-2）：10以内加减、认识图形\n  - 中（3-4）：表内乘除、简单应用\n  - 高（5-6）：小数计算、周长面积\n\n### 4.2 中等题（{medium_count}题）\n- **题型**：混合运算、应用题、图形计算\n- **特征**：两步以上，需转换\n- **陷阱**：常见错误、概念混淆\n- **示例**：带余除法、面积计算\n- **年级例**：\n  - 低（1-2）：连加连减、简单应用\n  - 中（3-4）：两步应用、组合图形\n  - 高（5-6）：分数运算、比例应用\n\n### 4.3 困难题（{hard_count}题）\n- **题型**：复杂应用、逻辑推理、探究题\n- **特征**：多步骤、隐蔽条件、逆向思维\n- **陷阱**：思维定势、多解情况\n- **示例**：行程问题、复杂规律\n- **年级例**：\n  - 低（1-2）：找规律、简单推理\n  - 中（3-4）：鸡兔同笼、植树问题\n  - 高（5-6）：工程问题、综合应用\n\n---\n\n## 五、题型配置\n{question_types}\n\n**注意**：生成的题目类型必须严格限制在上述给定的题型范围内。\n\n**题型要求**：\n- 单一题型 ≤ 40%\n- 建议4-5种题型\n- 计算、概念、应用均衡\n\n---\n\n## 六、质量标准\n\n### 6.1 区分度（核心）\n- **基础题**：让绝大多数学生得分\n- **中等题**：区分及格与优秀\n- **困难题**：筛选数学思维强的学生\n\n### 6.2 严谨性\n- ✓ 题干精炼，无废话\n- ✓ 条件充分不冗余\n- ✓ 答案唯一准确\n\n### 6.3 诊断性\n- ✓ 干扰项对应具体思维缺陷\n- ✓ 能分析出学生薄弱点\n\n---\n\n## 七、评估专用检查\n\n✅ **必须满足**：\n- [ ] 难度分布合理（基30% | 中50% | 难20%）\n- [ ] 能力维度均衡（知识、技能、应用）\n- [ ] 区分度明确（各层次一致）\n- [ ] 答案唯一准确\n- [ ] 题目独立无依赖\n- [ ] 符合{grade}水平\n- [ ] 题型多样（≥4种）\n- [ ] 数据真实合理\n\n---\n\n## 八、输出格式\n{format_instructions}\n\n**字段说明**：\n- `knowledge`: 字符串，精准对应考查点\n- `difficulty`: [\"简单\", \"普通\", \"困难\"]\n- `answer`: 格式规范\n- `question`: 题干严谨', NULL, '{}', 1766499315, 1766499315);
INSERT INTO `ah_prompt` (`id`, `name`, `slug`, `type`, `description`, `template_content`, `negative_content`, `model_params`, `create_time`, `update_time`) VALUES (8, '日常练习-英语', 'daily_practice_english', 'system', NULL, '# 英语每日智能练习\n\n## 一、任务概述\n**学科**：英语 | **年级**：{grade} | **题目数量**：{count}道\n\n**练习目标**：巩固听说读写，重点攻克薄弱环节\n\n---\n\n## 二、学生学习画像\n\n### 薄弱知识点（需重点复习）\n{weak_knowledge_points}\n\n### 已掌握知识点（需巩固）\n{mastered_knowledge_points}\n\n### 需复习单元\n{review_units}\n\n---\n\n## 三、题目分布策略\n\n| 类型 | 数量 | 难度 | 来源 | 目标 |\n|:-----|:----:|:----:|:-----|:-----|\n| **错题复习** | **{wrong_count}** | 简单/普通 | 薄弱知识点 | 攻克薄弱词汇、语法 |\n| **巩固练习** | **{mastered_count}** | 普通 | 已掌握知识点 | 保持熟练度 |\n| **挑战提升** | **{challenge_count}** | 普通/困难 | 扩展知识点 | 提升理解表达 |\n| **新知预习** | **{new_count}** | 简单 | 新知识点 | 预习新单词句型 |\n\n**总计**：{count} 题\n\n---\n\n## 四、题目生成细则\n\n### 4.1 错题复习（{wrong_count}题）\n- **来源**：`{weak_knowledge_points}`\n- **难度**：优先\"简单\"，重建信心\n- **题型**：\n  - 词汇薄弱 → 选择题（听音选词、看图选词）\n  - 语法薄弱 → 选择题（句型填空、词序重组）\n  - 听力薄弱 → 选择题（听音选词、听音选句）\n- **风格**：鼓励性（\"Let\'s practice again!\"）\n- **注意**：相似但不完全相同\n\n### 4.2 巩固练习（{mastered_count}题）\n- **来源**：`{mastered_knowledge_points}`\n- **难度**：普通70% + 简单30%\n- **题型**：选择题、拼写题、口语题多样化\n- **搭配**：选择题3 + 拼写题1 + 口语题1\n- **节奏**：平滑过渡\n\n### 4.3 挑战提升（{challenge_count}题）\n- **来源**：`{challenge_knowledge_points}`（可组合）\n- **难度**：普通60% + 困难40%\n- **题型**：选择题（句型填空、词序重组）、拼写题（单词翻译）、口语题（角色扮演对话）\n- **要点**：词汇拓展、复杂句型、综合应用\n\n### 4.4 新知预习（{new_count}题）\n- **来源**：`{new_knowledge_points}`\n- **难度**：必须\"简单\"\n- **题型**：选择题（听音选词、看图选词）、口语题（单词拼读、看图回答）\n- **辅助**：题干给出示例、提供语境\n- **目的**：激发兴趣\n\n---\n\n## 五、能力均衡要求\n\n| 能力 | 占比 | 题型建议 |\n|:-----|:----:|:---------|\n| 听力 | 20-30% | 选择题（听音选词、听音选句） |\n| 口语 | 10-20% | 口语题（单词拼读、句子拼读、角色扮演对话） |\n| 词汇语法 | 40-50% | 选择题（看图选词、句型填空、词序重组）、拼写题 |\n| 阅读 | 10-20% | 选择题（看图选句）、拼写题（单词翻译） |\n\n**语境要求**：\n- 真实交际场景（问候、购物、学校）\n- 地道英语表达\n- 适当融入文化元素\n\n---\n\n## 六、题型配置\n{question_types}\n\n**注意**：生成的题目类型必须严格限制在上述给定的题型范围内。\n\n**题型要求**：\n- 单一题型 ≤ 50%\n- 使用 3-4 种题型\n- 避免连续4题同一题型\n\n---\n\n## 七、学习体验优化\n\n### 7.1 鼓励原则\n✅ 积极语言：\"Well done!\" \"Try your best!\" \"You can do it!\"\n✅ 适当使用简单英语\n❌ 避免压力式表达\n\n### 7.2 适龄表述\n- 使用{grade}能理解的词汇\n- 说明可中文，内容用简单英语\n- 题干≤60字\n\n### 7.3 难度曲线\n- 前2-3题：简单热身（warm-up）\n- 中间：平稳过渡\n- 最后1-2题：适度挑战\n\n---\n\n## 八、质量标准\n\n✅ **必须满足**：\n- [ ] knowledge 匹配学生画像\n- [ ] 分布符合比例（±1题）\n- [ ] 听说读写均衡\n- [ ] 难度曲线平滑\n- [ ] 题干友好，符合{grade}水平\n- [ ] 无重复题目\n- [ ] 英语表达地道\n\n---\n\n## 九、输出格式\n{format_instructions}\n\n**字段说明**：\n- `knowledge`: 从学生画像选择\n- `question_type`: 必须严格匹配可用题型（选择题、拼写题、口语题）\n- `question_subtype`: 必须严格匹配对应题型的子类型\n- `resource_content`: 听音选词/听音选句/听音写单词/口语题使用\n- `resource_type`: 听音类题目为 \"audio\"，看图类题目为 \"image\"，其他为空\n- `question`: 可含简单英语', NULL, '{}', 1766499303, 1766499303);
INSERT INTO `ah_prompt` (`id`, `name`, `slug`, `type`, `description`, `template_content`, `negative_content`, `model_params`, `create_time`, `update_time`) VALUES (9, '日常练习-数学', 'daily_practice_math', 'system', NULL, '# 数学每日智能练习\n\n## 一、任务概述\n**学科**：数学 | **年级**：{grade} | **题目数量**：{count}道\n\n**练习目标**：巩固运算能力，重点攻克薄弱知识点\n\n---\n\n## 二、学生学习画像\n\n### 薄弱知识点（需重点复习）\n{weak_knowledge_points}\n\n### 已掌握知识点（需巩固）\n{mastered_knowledge_points}\n\n### 需复习单元\n{review_units}\n\n---\n\n## 三、题目分布策略\n\n| 类型 | 数量 | 难度 | 来源 | 目标 |\n|:-----|:----:|:----:|:-----|:-----|\n| **错题复习** | **{wrong_count}** | 简单/普通 | 薄弱知识点 | 攻克计算失误、概念混淆 |\n| **巩固练习** | **{mastered_count}** | 普通 | 已掌握知识点 | 保持熟练度和准确性 |\n| **挑战提升** | **{challenge_count}** | 普通/困难 | 扩展知识点 | 提升思维和解题能力 |\n| **新知预习** | **{new_count}** | 简单 | 新知识点 | 预习新知识或题型 |\n\n**总计**：{count} 题\n\n---\n\n## 四、题目生成细则\n\n### 4.1 错题复习（{wrong_count}题）\n- **来源**：`{weak_knowledge_points}`\n- **难度**：优先\"简单\"，重建自信\n- **题型**：\n  - 运算薄弱 → 口算、列式计算\n  - 概念薄弱 → 选择题、判断题\n  - 应用薄弱 → 简单一步应用\n- **数字**：稍简单或同等难度，避免完全相同\n- **风格**：鼓励性（\"我们再来练习...\"\"相信你能做对！\"）\n\n### 4.2 巩固练习（{mastered_count}题）\n- **来源**：`{mastered_knowledge_points}`\n- **难度**：普通70% + 简单30%\n- **题型**：计算、应用、选择、填空\n- **搭配**：计算2 + 应用1 + 选择1\n- **数据**：\n  - 适中数字，便于计算\n  - 结果为整数或简单小数/分数\n  - 应用题数据真实\n\n### 4.3 挑战提升（{challenge_count}题）\n- **来源**：`{challenge_knowledge_points}`（可组合）\n- **难度**：普通60% + 困难40%\n- **题型**：多步应用、综合运算、找规律\n- **要点**：\n  - 多步骤思考\n  - 可能需转换思维\n  - 提供适度提示\n\n### 4.4 新知预习（{new_count}题）\n- **来源**：`{new_knowledge_points}`\n- **难度**：必须\"简单\"\n- **题型**：概念理解、简单计算\n- **辅助**：题干给出概念/公式/示例\n- **目的**：初步接触\n\n---\n\n## 五、能力均衡要求\n\n| 能力 | 占比 | 题型建议 |\n|:-----|:----:|:---------|\n| 计算 | 40-50% | 口算、列式计算 |\n| 应用 | 25-35% | 应用题、实际情境 |\n| 概念 | 15-25% | 选择题、判断题 |\n| 思维 | 5-15% | 找规律、推理题 |\n\n**数据要求**：\n- 应用题情境真实（购物、分配、测量）\n- 数字符合实际\n- 答案有实际意义\n- 单位使用规范\n- 分数约到最简\n\n---\n\n## 六、题型配置\n{question_types}\n\n**注意**：生成的题目类型必须严格限制在上述给定的题型范围内。\n\n**题型要求**：\n- 单一题型 ≤ 50%\n- 使用 3-4 种题型\n- 避免连续4题同一题型\n- 计算与应用交替\n\n---\n\n## 七、学习体验优化\n\n### 7.1 鼓励原则\n✅ 积极语言：\"试一试\" \"你能行\" \"再接再厉\"\n✅ 趣味性描述（游戏、故事情境）\n❌ 避免压力式：\"必须\" \"不能错\"\n\n### 7.2 适龄表述\n- 使用{grade}能理解的语言\n- 避免复杂条件描述\n- 场景贴近生活经验\n\n### 7.3 难度曲线\n- 前2-3题：简单热身\n- 中间：平稳过渡\n- 最后1-2题：适度挑战（给提示）\n\n### 7.4 错误预防\n- 避免易混数字（689 vs 698）\n- 条件清晰无歧义\n- 干扰项基于常见错误\n\n---\n\n## 八、质量标准\n\n✅ **必须满足**：\n- [ ] knowledge 匹配学生画像\n- [ ] 分布符合比例（±1题）\n- [ ] 计算答案准确\n- [ ] 应用数据真实\n- [ ] 难度曲线平滑\n- [ ] 题干清晰，符合{grade}水平\n- [ ] 无重复或完全相同数字\n\n---\n\n## 九、输出格式\n{format_instructions}\n\n**字段说明**：\n- `knowledge`: 从学生画像选择\n- `answer`: 格式规范（整数、小数、分数）\n- `question`: 应用题注意单位完整性', NULL, '{}', 1766499294, 1766499294);
INSERT INTO `ah_prompt` (`id`, `name`, `slug`, `type`, `description`, `template_content`, `negative_content`, `model_params`, `create_time`, `update_time`) VALUES (10, '单元练习-英语', 'unit_practice_english', 'system', NULL, '# 英语单元练习生成\n\n## 一、任务概述\n**学科**：英语 | **年级**：{grade} | **单元**：{unit_name} | **题目数量**：{count}道\n\n**单元内容**：\n{unit_summary}\n\n---\n\n## 二、知识点体系\n{knowledge_text}\n\n**知识点分类**：\n- **词汇**：单词认读、拼写、词义、词组搭配\n- **语法**：句型结构、时态、语法规则\n- **听说**：听力理解、口语表达、发音\n- **阅读**：句子理解、短文阅读、语篇分析\n\n---\n\n## 三、可用题型\n{question_types}\n\n**注意**：生成的题目类型必须严格限制在上述给定的题型范围内。\n\n**题型设计原则**：\n- 单一题型 ≤ 50%（防止单调）\n- 听说读写均衡\n- 建议搭配：\n  - 10题 → 选择题5（含听音选词/听音选句2） + 拼写题3 + 口语题2\n  - 15题 → 选择题7（含听音选词/听音选句3） + 拼写题5 + 口语题3\n\n---\n\n## 四、生成规则\n\n### 4.1 知识点对齐\n- 每题关联至少1个知识点\n- `knowledge` 字段：字符串格式，多个知识点用顿号分隔\n- 示例：`\"词汇认读、句型理解\"`\n\n### 4.2 难度分布\n**{grade}水平要求**：\n- 低年级（1-2）：字母、简单单词、基础句型\n- 中年级（3-4）：常用词汇、简单语法、日常对话\n- 高年级（5-6）：词汇扩展、复杂句型、短文阅读\n\n**难度比例**：简单 40% | 普通 40% | 困难 20%\n\n**难度标准**：\n- **简单**：单词认读、简单句型、常见对话\n- **普通**：词义理解、句型应用、听力理解\n- **困难**：词汇扩展、语法综合、语篇理解\n\n---\n\n## 五、特殊题型规范\n\n### 5.1 选择题\n- 4个选项（A/B/C/D）\n- 干扰项：混淆词、形近词、音近词\n- 示例：考\"apple\"时，干扰项用\"orange\"（同类）、\"apply\"（形近）\n\n**听力类选择题（听音选词、听音选句）**：\n```json\n{{\n  \"question\": \"Listen and choose the correct word\",\n  \"question_type\": \"选择题\",\n  \"question_subtype\": \"听音选词\",\n  \"resource_content\": \"I like apples\",\n  \"resource_type\": \"audio\"\n}}\n```\n\n**设计要点**：\n- 发音清晰，语速适合{grade}\n- 句子长度：低年级≤5词，中年级≤8词，高年级≤12词\n\n**看图类选择题（看图选词、看图选句）**：\n- 需要图片资源，resource_type 为 \"image\"\n- 图片清晰，符合{grade}认知水平\n\n**句型类选择题（句型填空、词序重组）**：\n- 考查语法和句型结构\n- 选项设计合理，避免歧义\n\n### 5.2 拼写题\n- **听音写单词**：需要音频资源，resource_type 为 \"audio\"\n- **看图写单词**：需要图片资源，resource_type 为 \"image\"\n- **单词重组**：给出打乱的字母，要求学生重组\n- **单词翻译**：中英文互译\n\n### 5.3 口语题\n| 子类型 | 题干 | resource_content |\n|:-----|:-----|:-----------------|\n| 单词拼读 | 说明拼读要求 | \"apple\" |\n| 句子拼读 | 说明跟读要求 | \"Good morning, teacher!\" |\n| 听题回答 | 描述场景 | \"How are you?\" |\n| 看图回答 | 描述图片 | 留空（需要图片） |\n| 角色扮演对话 | 描述对话场景 | \"Hello, I\'m Tom.\" |\n\n---\n\n## 六、质量标准\n\n✅ **必须满足**：\n- [ ] knowledge字段准确匹配知识点\n- [ ] 难度比例合理（简40%、普40%、难20%）\n- [ ] 题型多样，听说读写均衡\n- [ ] 英语表达地道准确\n- [ ] 词汇难度匹配年级\n- [ ] 话题贴近学生生活\n- [ ] 题目无重复\n\n---\n\n## 七、输出格式\n{format_instructions}\n\n**字段说明**：\n- `knowledge`: 字符串类型，如 \"词汇认读、句型理解\"\n- `question_type`: 必须严格匹配可用题型（选择题、拼写题、口语题）\n- `question_subtype`: 必须严格匹配对应题型的子类型\n- `resource_content`: 听音选词/听音选句/听音写单词/口语题使用\n- `resource_type`: 听音类题目为 \"audio\"，看图类题目为 \"image\"，其他为空\n- `question`/`answer`: 可包含英文内容', NULL, '{}', 1766499285, 1766499285);
INSERT INTO `ah_prompt` (`id`, `name`, `slug`, `type`, `description`, `template_content`, `negative_content`, `model_params`, `create_time`, `update_time`) VALUES (11, '单元练习-数学', 'unit_practice_math', 'system', NULL, '# 数学单元练习生成\n\n## 一、任务概述\n**学科**：数学 | **年级**：{grade} | **单元**：{unit_name} | **题目数量**：{count}道\n\n**单元内容**：\n{unit_summary}\n\n---\n\n## 二、知识点体系\n{knowledge_text}\n\n**知识点分类**：\n- **数与运算**：数的认识、四则运算、估算\n- **图形几何**：图形识别、周长面积、空间想象\n- **量的测量**：长度、重量、时间、货币换算\n- **统计概率**：数据收集、图表分析、概率（高年级）\n- **问题解决**：建模、多步骤应用\n\n---\n\n## 三、可用题型\n{question_types}\n\n**注意**：生成的题目类型必须严格限制在上述给定的题型范围内。\n\n**题型设计原则**：\n- 单一题型 ≤ 50%（防止单调）\n- 知识、技能、应用均衡\n- 建议搭配：\n  - 10题 → 计算3 + 应用2 + 选择2 + 填空2 + 判断1\n  - 15题 → 计算4 + 应用3 + 选择3 + 填空3 + 判断2\n\n---\n\n## 四、生成规则\n\n### 4.1 知识点对齐\n- 每题关联至少1个知识点\n- `knowledge` 字段：字符串格式，多个知识点用顿号分隔\n- 示例：`\"两位数加法、进位运算\"`\n\n### 4.2 难度分布\n**{grade}水平要求**：\n- 低年级（1-2）：20/100以内加减、简单图形、基础应用\n- 中年级（3-4）：万以内运算、乘除法、分数初步、组合图形\n- 高年级（5-6）：多位数运算、分数小数、比例、复杂应用\n\n**难度比例**：简单 40% | 普通 40% | 困难 20%\n\n**难度标准**：\n- **简单**：单步运算、直接应用、基础图形\n- **普通**：两步运算、一般应用、图形计算\n- **困难**：多步综合、复杂应用、逻辑推理\n\n---\n\n## 五、特殊题型规范\n\n### 5.1 计算题\n- **口算**：结果在合理范围（低≤100，中≤1000，高≤10000）\n- **列式计算**：提供情境，学生列式求解\n- **竖式计算**：涉及进位、退位技巧\n- **简便运算**：高年级适用，运用运算律\n\n**数字选择**：\n- 避免过简（1+1）或过复杂\n- 结果尽量为整数\n- 分数注意约分通分\n\n### 5.2 应用题（重点）\n- ✓ **情境真实**：购物、出行、游戏等\n- ✓ **问题明确**：表述清楚，所求明确\n- ✓ **数据合理**：符合实际（苹果不会100元）\n- ✓ **层次分明**：\n  - 简单：一步应用\n  - 普通：两步应用\n  - 困难：三步及以上\n\n### 5.3 选择题\n- 4个选项（A/B/C/D）\n- 干扰项设计：\n  - 计算错误（进位错、顺序错）\n  - 概念混淆（周长vs面积）\n  - 单位换算错误\n- 避免明显错误（低年级题出负数）\n\n### 5.4 图形题\n- 描述图形关键特征\n- 提供必要数据（长、宽、半径等）\n- 图形符合数学定义\n\n---\n\n## 六、质量标准\n\n✅ **必须满足**：\n- [ ] knowledge字段准确匹配知识点\n- [ ] 难度比例合理（简40%、普40%、难20%）\n- [ ] 题型多样，能力均衡\n- [ ] 计算结果准确无误\n- [ ] 单位使用规范\n- [ ] 概念表述严谨\n- [ ] 应用题数据真实合理\n- [ ] 答案有实际意义\n- [ ] 题目无重复\n\n---\n\n## 七、输出格式\n{format_instructions}\n\n**字段说明**：\n- `knowledge`: 字符串类型，如 \"两位数加法、进位运算\"\n- `answer`: 注意格式（整数、小数、分数）\n- `question`: 应用题注意单位完整性', NULL, '{}', 1766499254, 1766499254);
COMMIT;

-- ----------------------------
-- Table structure for ah_question
-- ----------------------------
DROP TABLE IF EXISTS `ah_question`;
CREATE TABLE `ah_question` (
  `id` varchar(255) NOT NULL,
  `subject` text NOT NULL COMMENT '科目',
  `grade` int NOT NULL COMMENT '年级',
  `type` varchar(255) NOT NULL COMMENT '题目类型（主类型）',
  `subtype` varchar(255) DEFAULT NULL COMMENT '题目子类型',
  `content` text NOT NULL COMMENT '题目内容',
  `options` text NOT NULL COMMENT '选项',
  `answer` text NOT NULL COMMENT '问题答案',
  `difficulty` varchar(255) NOT NULL COMMENT '问题难度',
  `resource` varchar(255) DEFAULT NULL COMMENT '资源路径',
  `resource_type` varchar(50) DEFAULT NULL COMMENT '资源类型：image/audio',
  `resource_content` text COMMENT '资源内容（录音文本等）',
  `textbook_id` int NOT NULL COMMENT '教材ID',
  `unit_id` int DEFAULT NULL COMMENT '单元ID',
  `prompt_id` int DEFAULT NULL COMMENT '提示词ID',
  `knowledge` varchar(255) NOT NULL COMMENT '知识点',
  PRIMARY KEY (`id`),
  KEY `ix_ah_question_id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Records of ah_question
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for ah_question_type
-- ----------------------------
DROP TABLE IF EXISTS `ah_question_type`;
CREATE TABLE `ah_question_type` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL COMMENT '题型标题（如：看图选词、根据首字母填空）',
  `scene` varchar(50) NOT NULL COMMENT '题型展现形式',
  `subject` varchar(50) NOT NULL COMMENT '科目',
  `grade` int NOT NULL COMMENT '年级（1-6）',
  `description` text COMMENT '题型描述',
  `resource_type` varchar(50) DEFAULT NULL COMMENT '资源类型：image-图片，audio-语音，空-无资源',
  `prompt` text COMMENT '生成该题型的 AI 指令（Prompt）',
  `create_time` int NOT NULL,
  `update_time` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=152 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Records of ah_question_type
-- ----------------------------
BEGIN;
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (17, '看图选拼音', '选择题', '语文', 1, '展示一幅图片(如苹果),给出3-4个拼音选项,学生选择正确的拼音。培养学生的拼音识别能力和图文对应能力。', 'image', '生成一道看图选拼音题目。要求:1)选择一个适合一年级学生的常见物品(如水果、动物、日用品);2)提供该物品的彩色卡通图片;3)给出4个拼音选项,其中1个正确,3个为形近或音近的干扰项;4)拼音标注声调;5)图片清晰,色彩鲜艳。', 1766719293, 1766719293);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (18, '声母韵母识别', '选择题', '语文', 1, '给出一个拼音,让学生判断声母或韵母,或者给出声母/韵母让学生选择对应的音节。帮助学生掌握拼音的组成结构。', NULL, '生成一道声母韵母识别题。要求:1)随机给出一个单音节拼音(如\"ba、mo、li\");2)提问\"这个拼音的声母是什么?\"或\"这个拼音的韵母是什么?\";3)提供4个选项;4)难度适合一年级上学期;5)可加入图片辅助(如字母卡片形式)。', 1766719317, 1766719317);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (19, '看图识字-基础汉字', '选择题', '语文', 1, '展示图片,给出3-4个汉字选项,学生选择与图片对应的汉字。主要考查象形字和常用字。', NULL, '生成一道看图识字题。要求:1)选择一年级上册课本中的基础汉字(如\"日、月、水、火、山、石、田、土\"等);2)提供与汉字对应的彩色图片;3)给出4个汉字选项,包含形近字干扰;4)图片简洁明了,易于识别;5)字体使用楷体,字号较大。', 1766719338, 1766719338);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (20, '笔画数数', '选择题', '语文', 1, '给出一个简单汉字,让学生数出正确的笔画数。培养学生对汉字结构的认识。', NULL, '生成一道笔画数数题。要求:1)选择笔画数在3-8画之间的常用字;2)将汉字以大字号展示,可用不同颜色标注每一笔画;3)给出4个数字选项;4)可提供笔顺动画辅助;5)确保笔画数准确无误。', 1766719357, 1766719357);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (21, '拼音拼读', '选择题', '语文', 1, '显示一个拼音或拼音词组,学生跟读并由系统进行发音评测。训练学生的拼音拼读能力和标准发音。', 'audio', '生成一道拼音拼读题。要求:1)随机生成1-2个音节的拼音词(如\"妈妈、爸爸、书包\");2)提供标准读音音频;3)显示拼音及声调;4)学生跟读后系统进行发音评测,评估音准和声调;5)给予即时反馈和鼓励。', 1766719379, 1766719379);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (22, '字形辨析-区分形近字', '判断题', '语文', 1, '给出两个形近字(如\"日\"和\"目\"),判断它们是否相同,或选出正确的字。帮助学生区分易混淆的汉字。', NULL, '生成一道字形辨析题。要求:1)选择一对形近字(如\"大-天\"、\"人-入\"、\"日-目\");2)题目可以是判断题\"下面两个字一样吗?\"或选择题\"哪个字是\'太阳\'的\'日\'?\";3)字体清晰放大;4)可用颜色标注不同部分;5)难度适合一年级。', 1766719402, 1766719402);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (23, '看图选词-名词', '选择题', '语文', 1, '展示一幅图片,给出3-4个名词选项,学生选择正确的词语。扩展学生的词汇量。', 'image', '生成一道看图选词题。要求:1)图片展示常见事物(动物、植物、物品、人物等);2)提供4个双字词语选项;3)词语均为一年级学生认识的常用词;4)图片色彩鲜艳,特征明显;5)干扰项具有一定关联性(如\"苹果、香蕉、葡萄、西瓜\")。', 1766719426, 1766719426);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (24, '词语连线-反义词入门', '匹配题', '语文', 1, '左右两列给出简单的反义词,学生连线匹配。初步建立反义词概念。', NULL, '生成一道反义词连线题。要求:1)选择5对简单的反义词(如\"大-小\"、\"多-少\"、\"高-矮\"、\"长-短\"、\"黑-白\");2)左右两列随机排列;3)可配图辅助理解(如\"大象\"对应\"小老鼠\");4)连线操作简单流畅;5)完成后给予鼓励反馈。', 1766719453, 1766719453);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (25, '词语搭配-量词', '选择题', '语文', 1, '给出名词,选择正确的量词搭配(如一( )苹果:个/只/条)。培养学生的语言表达规范性。', 'image', '生成一道量词搭配题。要求:1)给出一个常见名词及其图片;2)提供3-4个量词选项(一个正确,其他为常见但不搭配的量词);3)量词限于\"个、只、条、张、本、支、棵、朵\"等常用量词;4)题干简洁\"一(  )苹果\";5)配图帮助理解。', 1766719481, 1766719481);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (26, '看图说话-单句表达', '简答题', '语文', 1, '展示一幅简单的图片,学生用一句话描述图片内容。训练学生的观察能力和语言表达能力。', 'image', '生成一道看图说话题。要求:1)提供一幅情景简单、主题明确的图片(如\"小朋友在浇花\"、\"小猫在喝水\");2)提示语\"看图说一句话\";3)提供语音输入或文字输入方式;4)AI评估答案的完整性(主语+谓语)和相关性;5)给予鼓励性评价。', 1766719506, 1766719506);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (27, '句子排序-简单叙事', '匹配题', '语文', 1, '给出3-4个打乱顺序的简单句子,学生按照事情发展顺序排列。培养逻辑思维和叙事能力。', NULL, '生成一道句子排序题。要求:1)设计一个简单的小故事,包含3-4个句子;2)句子描述事件的开始、经过、结果;3)打乱顺序呈现;4)每个句子配一幅小图辅助理解;5)采用拖拽排序的交互方式;6)完成后展示完整故事并朗读。', 1766719577, 1766719577);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (28, ' 补充句子-\"谁在做什么\"', '选择题', '语文', 1, '给出不完整的句子,选择合适的词语补充完整(如\"小明在___。A.跑步 B.苹果 C.蓝色\")。训练句子结构理解。', NULL, '生成一道补充句子题。要求:1)给出一个缺少谓语或宾语的简单句子;2)提供3-4个词语选项,其中1个正确,其他在语法或语义上不通顺;3)可配图辅助;4)句式为\"主语+在+动词\"或\"主语+动词+宾语\";5)评估选项的语法正确性和语义合理性。', 1766719600, 1766719600);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (29, '儿歌朗读', '口语题', '语文', 1, '展示一首短小的儿歌,学生跟读或背诵。培养语感和朗读能力。', 'audio', '生成一道儿歌朗读题。要求:1)选择或创作一首4-8句的简单儿歌,朗朗上口,内容积极向上;2)提供标准朗读音频;3)支持逐句跟读或整首朗读;4)评估流利度、音准和节奏感;5)儿歌可配插图和动画增强趣味性;6)给予鼓励性评价。', 1766719644, 1766719644);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (30, '短文阅读-图文结合', '选择题', '语文', 1, '提供一篇50-100字的短文(配图),然后回答2-3个简单问题(如\"故事里有谁?\"\"小兔在做什么?\")。培养阅读理解能力。', 'image', '生成一道短文阅读题。要求:1)编写一篇50-100字的短文,包含简单情节;2)配3-5幅插图辅助理解;3)生成2-3个问题,考查基本信息(人物、地点、事件);4)问题采用选择题形式,每题3-4个选项;5)文字使用拼音标注或汉字与拼音混排;6)语言简单,贴近儿童生活。', 1766719666, 1766719666);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (31, '看图写字-独体字', '拼写题', '语文', 1, '展示图片,学生写出(或通过虚拟键盘输入)对应的汉字。巩固汉字书写。', 'image', '生成一道看图写字题。要求:1)提供一个常见事物的图片;2)要求学生写出对应的汉字(独体字,笔画5-8画);3)支持手写输入识别或虚拟键盘输入;4)给出田字格供书写参考;5)可提供笔顺动画辅助;6)评估书写正确性和笔顺规范性。', 1766719687, 1766719687);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (32, '形声字识别', '选择题', '语文', 2, '给出一个形声字,让学生选出形旁或声旁,或根据形旁/声旁选择正确的字。帮助学生理解汉字的造字规律。', NULL, '生成一道形声字识别题。要求:1)选择一个常见形声字(如\"清、晴、情、请\");2)提问\"\'清\'字的形旁是什么?\"或\"带有\'氵\'的字通常与什么有关?\";3)提供4个选项;4)可用颜色标注形旁和声旁;5)难度适合二年级学生。', 1766719764, 1766719764);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (33, '多音字辨析', '选择题', '语文', 2, '给出含有多音字的句子,选择正确的读音或用法。培养学生根据语境判断多音字读音的能力。', NULL, '生成一道多音字辨析题。要求:1)选择一个常见多音字(如\"重、长、还、看、乐\");2)提供一个具体语境的句子;3)让学生选择正确的读音或填入合适的多音字;4)给出3-4个选项;5)句子简单易懂,贴近二年级学生生活。', 1766719782, 1766719782);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (34, '词语搭配-形容词+名词', '匹配题', '语文', 2, '将形容词与名词进行合理搭配(如\"美丽的-花朵/鲜花/夜空\"),或选择合适的形容词修饰名词。丰富词汇表达。', 'image', '生成一道词语搭配题。要求:1)提供5-6个形容词和5-6个名词;2)让学生连线或选择合理的搭配;3)形容词如\"高大、美丽、弯弯、清清、火红\";4)名词如\"树木、花朵、月亮、小河、太阳\";5)可配图辅助;6)允许一个形容词搭配多个名词。', 1766719823, 1766719823);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (35, '近义词选择', '选择题', '语文', 2, '给出一个词语,从选项中选择其近义词;或在句子中选择合适的近义词替换。扩展词汇量,理解词语含义。', NULL, '生成一道近义词选择题。要求:1)给出一个二年级学生熟悉的词语(如\"高兴、美丽、立刻、常常\");2)提供4个选项,其中1个为近义词,其他为无关词或反义词;3)或给出一个句子,用括号标注目标词,让学生选择可以替换的近义词;4)确保近义词在该语境下可以互换;5)题干清晰简洁。', 1766719844, 1766719844);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (36, '反义词填空', '拼写题', '语文', 2, '给出一个词语,填写其反义词(如\"白天\"的反义词是_____)。巩固反义词概念。', NULL, '生成一道反义词填空题。要求:1)给出一个常用词语(单字或双字词);2)要求学生填写反义词;3)提供虚拟键盘或手写输入;4)可提供首字提示或字数提示;5)反义词应为二年级学生学过的常用词;6)支持多个正确答案(如\"冷\"的反义词可以是\"热\"或\"暖\")。', 1766719863, 1766719863);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (37, '成语启蒙-看图猜成语', '选择题', '语文', 2, '通过图片或简单故事猜测简单成语(如\"守株待兔、拔苗助长\")。初步接触成语文化。', 'image', '生成一道看图猜成语题。要求:1)选择一个适合二年级的简单成语(如\"亡羊补牢、刻舟求剑、井底之蛙\");2)提供该成语故事的插图或连环画;3)给出4个成语选项;4)或给出成语解释让学生选择对应成语;5)图片生动有趣,易于理解;6)可附带成语故事简介。', 1766719882, 1766719882);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (38, '句子仿写-简单句式', '简答题', '语文', 2, '给出一个例句,学生仿照句式写一个新句子(如例句\"天空很蓝。\",仿写\"草地很____。\")。训练句式运用能力。', NULL, '生成一道句子仿写题。要求:1)给出一个简单句式作为例句(如\"主语+很+形容词\"、\"主语+在+地点+动词\");2)可以填空式仿写或完全仿写;3)提供文字输入或语音输入;4)AI评估句子的语法正确性和语义合理性;5)例句贴近学生生活,易于理解和模仿;6)给予鼓励和改进建议。', 1766719910, 1766719910);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (39, '标点符号使用', '选择题', '语文', 2, '给出一个句子,选择正确的标点符号(句号、问号、感叹号、逗号),或给句子补充标点。学习标点符号的基本用法。', NULL, '生成一道标点符号题。要求:1)给出一个缺少标点或标点错误的句子;2)让学生选择正确的标点符号或补充标点;3)重点考查句号、问号、感叹号的区分使用;4)提供3-4个选项;5)句子表达清晰,语境明确;6)二年级阶段标点使用较简单。', 1766719929, 1766719929);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (40, '看图写话-多句表达', '简答题', '语文', 2, '展示一幅或多幅图片,学生用2-3句话描述图片内容或编写小故事。提升写话能力和想象力。', 'image', '生成一道看图写话题。要求:1)提供1-3幅连续的情景图片,主题明确,情节简单;2)提示语\"看图写几句话,把图画的内容说清楚\";3)要求写2-3句话,每句话完整通顺;4)提供文字输入,支持拼音输入;5)AI评估内容相关性、句子完整性、逻辑性;6)给予具体的鼓励和改进建议;7)可提供句式提示。', 1766719954, 1766719954);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (41, '短文阅读-基本信息提取', '选择题', '语文', 2, '阅读100-150字的短文,回答3-4个问题,考查时间、地点、人物、事件等基本信息。培养信息提取能力。', 'image', '生成一道短文阅读题。要求:1)编写100-150字的短文,包含明确的时间、地点、人物、事件;2)配相关插图;3)生成3-4个选择题,考查基本信息;4)问题类型包括\"故事发生在什么时候?\"、\"主人公去了哪里?\"、\"他们做了什么?\"等;5)每题4个选项;6)文字可配拼音或纯汉字;7)语言生动有趣。', 1766720003, 1766720003);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (42, '诗歌朗读-古诗启蒙', '口语题', '语文', 2, '朗读或背诵简单的古诗(如《静夜思》、《春晓》)。培养诗歌语感和文化素养。', 'audio', '生成一道古诗朗读题。要求:1)选择二年级课本中的简单古诗(五言或七言绝句);2)提供标准朗读音频和配乐朗诵;3)显示古诗全文,生字注音;4)可提供古诗配画和简单译文;5)学生跟读或背诵;6)评估流利度、音准、节奏、情感;7)可逐句跟读或整首背诵。', 1766720030, 1766720030);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (43, '日记启蒙-记录一天', '简答题', '语文', 2, '根据提示(如\"今天你做了什么有趣的事?\"),写一段简单的日记(3-5句话)。培养写作习惯。', NULL, '生成一道日记写作题。要求:1)提供日记题目或提示(如\"快乐的一天\"、\"我帮妈妈做家务\");2)要求写3-5句话,包含时间、地点、事件、感受;3)提供日记格式模板(日期、星期、天气);4)支持文字输入,可配图片或表情;5)AI评估内容完整性、语句通顺性、是否表达了个人感受;6)给予鼓励和具体建议。', 1766720053, 1766720053);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (44, '故事续编-想象力训练', '简答题', '语文', 2, '给出故事的开头,学生续写故事结尾(2-3句话)。激发想象力和创造力。', NULL, '生成一道故事续编题。要求:1)提供一个有趣的故事开头(50-80字),留下悬念;2)要求学生续写2-3句话,把故事讲完整;3)可提供多幅图片供选择故事结局;4)不限定唯一答案,鼓励创造性;5)AI评估逻辑合理性和想象力;6)给予鼓励性评价,展示优秀续编示例。', 1766720074, 1766720074);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (45, '词语分类-初步归纳', '匹配题', '语文', 2, '给出8-10个词语,按照类别(动物、植物、文具、食物等)进行分类。培养分类归纳能力。', NULL, '生成一道词语分类题。要求:1)提供8-10个词语,涉及2-3个类别;2)类别包括动物、植物、水果、文具、玩具、交通工具等;3)采用拖拽分类的交互方式;4)每个类别用图标或标签标识;5)可配图片辅助;6)完成后给予正确分类结果和解释。', 1766720094, 1766720094);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (46, '句子改错-常见语病', '选择题', '语文', 2, '给出一个有明显语病的句子,选择正确的修改方式或直接改正。培养语言规范意识。', NULL, '生成一道句子改错题。要求:1)给出一个包含常见语病的句子(如成分残缺、词序颠倒、重复啰嗦);2)提供3-4个修改选项或要求直接改正;3)语病明显且适合二年级学生理解;4)如\"我和小明一起去公园玩耍玩。\"(重复);5)给予详细解释和正确句子示例。', 1766720120, 1766720120);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (47, '部首查字法', '选择题', '语文', 3, '给出一个汉字,选择正确的部首,或根据部首和剩余笔画数找出对应的字。学习使用字典。', NULL, '生成一道部首查字题。要求:1)给出一个常用汉字;2)提问\"这个字的部首是什么?\"或\"除去部首还有几画?\";3)提供4个选项;4)可模拟字典页面展示;5)适合三年级学生,涉及常见部首如\"氵、艹、亻、扌、口\"等。', 1766720398, 1766720398);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (48, '关联词语填空', '选择题', '语文', 3, '在句子中选择合适的关联词(如\"因为...所以...\",\"虽然...但是...\")。学习复句结构。', NULL, '生成一道关联词填空题。要求:1)给出一个包含两个分句的句子,关联词用括号标注;2)提供3-4个关联词选项(如\"因为-所以\"、\"如果-就\"、\"虽然-但是\");3)确保关联词搭配正确,符合句意;4)句子贴近三年级学生生活;5)可提供关联词用法提示。', 1766720420, 1766720420);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (49, '修改病句-多种语病', '简答题', '语文', 3, '给出包含语病的句子(成分残缺、搭配不当、语序混乱等),学生修改并说明错误类型。提高语言规范性。', NULL, '生成一道修改病句题。要求:1)给出一个包含明显语病的句子;2)语病类型包括成分残缺、词语搭配不当、词序颠倒、重复啰嗦等;3)要求学生修改句子并选择错误类型;4)提供文字输入和选择题结合;5)给予详细的错误分析和正确示例;6)难度适合三年级。', 1766720509, 1766720509);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (50, '扩写句子-添加修饰语', '简答题', '语文', 3, '给出一个简单句子,要求学生添加形容词、副词等修饰语,使句子更生动具体。训练句子丰富表达。', NULL, '生成一道扩写句子题。要求:1)给出一个主谓宾结构完整的简单句(如\"小鸟飞。\"、\"妈妈做饭。\");2)要求学生添加\"什么样的\"、\"怎么样\"等修饰语;3)可提供提示词或词语库;4)AI评估扩写后的句子是否更具体生动,修饰语是否恰当;5)展示优秀扩写示例;6)鼓励多样化表达。', 1766720525, 1766720525);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (51, '缩写句子-提取主干', '简答题', '语文', 3, '给出一个较复杂的句子,要求学生提取主干(主语+谓语+宾语)。理解句子结构。', NULL, '生成一道缩写句子题。要求:1)给出一个包含多个修饰成分的句子(如\"活泼可爱的小猫在院子里快乐地玩耍。\");2)要求学生缩写成最简句子(如\"小猫玩耍。\");3)提供文字输入;4)AI评估是否保留了主要成分,是否遗漏或增添不当;5)给予详细解释和示例;6)难度适合三年级下学期。', 1766720544, 1766720544);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (52, '词语辨析-细微差别', '选择题', '语文', 3, '给出几个意思相近的词语(如\"连续、陆续、继续\"),在具体语境中选择最恰当的一个。精确理解词义。', NULL, '生成一道词语辨析题。要求:1)选择2-3个近义词,如\"居然-竟然\"、\"希望-盼望-期望\";2)给出一个具体语境的句子,用括号标注目标位置;3)让学生选择最恰当的词语;4)提供3-4个选项,其中1个最佳,其他在语境中略有不妥;5)给予详细的词义辨析和用法说明;6)适合三年级学生理解。', 1766720561, 1766720561);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (53, '段落排序-逻辑顺序', '匹配题', '语文', 3, '给出4-5个打乱顺序的段落,按照逻辑顺序(时间顺序、空间顺序、事理顺序)排列。培养篇章理解能力。', NULL, '生成一道段落排序题。要求:1)编写一篇包含4-5个自然段的短文(200-300字);2)打乱段落顺序呈现;3)每段30-60字,内容独立但有内在逻辑关系;4)采用拖拽排序交互;5)可提供首段和末段提示;6)完成后展示正确顺序的全文并解释排序依据。', 1766720587, 1766720587);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (54, '课文内容理解', '选择题', '语文', 3, '基于课文内容,回答关于主题思想、人物特点、重点词句理解等问题。深化课文学习。', NULL, '生成一道课文理解题。要求:1)选择三年级课本中的一篇课文;2)提供课文片段或全文(200-300字);3)设计3-4个问题,包括主题理解、人物分析、重点句段理解、情感体会等;4)每题提供4个选项;5)问题由浅入深,从信息提取到分析理解;6)可配课文插图辅助。', 1766720604, 1766720604);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (55, '作文-写人叙事', '简答题', '语文', 3, '根据题目(如\"我的好朋友\"、\"难忘的一件事\")写一篇200-300字的作文。训练完整叙事能力。', NULL, '生成一道作文题。要求:1)给出写人或叙事类作文题目(如\"我最敬佩的人\"、\"一次有趣的活动\");2)提供写作提示(外貌、性格、事例等);3)要求字数200-300字;4)提供文本编辑器,支持保存草稿;5)AI从内容、结构、语言、书写等维度评分;6)给予详细反馈和改进建议;7)提供优秀范文参考。', 1766720724, 1766720724);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (56, '古诗理解-意境感悟', '选择题', '语文', 3, '阅读古诗,回答关于诗意理解、情感体会、意象分析的问题。提升诗歌鉴赏能力。', NULL, ' 生成一道古诗理解题。要求:1)选择三年级学习的古诗(如《望庐山瀑布》、《绝句》);2)提供古诗全文、注释、译文;3)配意境配图或诗意画;4)设计2-3个问题,如\"诗人看到了什么景象?\"、\"这首诗表达了诗人怎样的心情?\";5)每题4个选项;6)注重意境和情感的理解,而非死记硬背。', 1766720746, 1766720746);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (57, '说明方法识别', '选择题', '语文', 3, '给出一段说明文片段,判断使用了什么说明方法(举例子、列数字、打比方等)。学习说明文特点。', NULL, '生成一道说明方法识别题。要求:1)提供一段说明文片段(60-100字);2)片段中明确使用了某种说明方法;3)提问\"这段话主要用了什么说明方法?\";4)选项包括\"举例子、列数字、作比较、打比方\"等;5)给予说明方法的定义和作用解释;6)适合三年级学生理解。', 1766720766, 1766720766);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (58, '想象作文-童话创编', '简答题', '语文', 3, '根据给定的角色或情境,编写一个童话故事(200-300字)。发挥想象力和创造力。', NULL, '生成一道童话创编题。要求:1)给出2-3个童话角色(如\"小兔、小熊、魔法师\")或一个情境(如\"森林里的奇遇\");2)要求编写200-300字的童话故事;3)提示要有起因、经过、结果;4)鼓励想象力和创造性;5)AI评估故事完整性、想象力、语言表达;6)不限定情节,允许多样化创作;7)展示优秀童话范例。', 1766720783, 1766720783);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (59, '阅读理解-深层理解', '简答题', '语文', 3, '阅读300-400字的文章,回答\"为什么\"、\"你认为\"等需要推理和判断的问题。培养深度思考能力。', NULL, '生成一道深层阅读理解题。要求:1)提供一篇300-400字的记叙文或童话;2)文章有一定深意或启示;3)设计2-3个深层理解问题,如\"为什么主人公这样做?\"、\"你从这个故事中学到了什么?\"、\"如果是你,你会怎么做?\";4)采用简答题形式,要求完整句子回答;5)AI评估答案的合理性和思考深度;6)给予鼓励和引导性评价。', 1766720806, 1766720806);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (60, '语言得体性判断', '选择题', '语文', 3, '给出具体情境,判断某句话是否得体,或选择最得体的表达方式。培养语言交际能力。', NULL, '生成一道语言得体性题。要求:1)设置一个具体的交际情境(如\"向老师请假\"、\"安慰生病的同学\");2)给出2-3种不同的表达方式;3)让学生选择最得体的一种或判断某种表达是否恰当;4)考虑礼貌用语、称呼、语气等因素;5)给予详细的得体性分析和交际礼仪指导;6)贴近学生生活实际。', 1766720830, 1766720830);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (61, '综合实践-信息整理', '简答题', '语文', 3, '给出一份通知、广告或说明书等实用文本,提取关键信息并回答问题。培养实用语文能力。', 'image', '生成一道信息整理题。要求:1)提供一份实用文本(如活动通知、商品说明、图书馆规则);2)文本包含时间、地点、参与对象、注意事项等信息;3)设计3-4个问题,要求提取关键信息;4)如\"活动什么时候举行?\"、\"谁可以参加?\"、\"需要带什么物品?\";5)题型为选择题或简答题;6)文本格式规范,便于阅读;7)培养生活中的语文应用能力。', 1766720853, 1766720863);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (62, '图数数-10以内', '选择题', '数学', 1, '展示一幅图片(如苹果、小动物),学生数出数量并选择正确的数字。培养数感和一一对应能力。', 'image', '生成一道看图数数题。要求:1)图片展示1-10个相同物品(如水果、动物、玩具);2)物品排列可以是规则或不规则;3)提供4个数字选项;4)图片色彩鲜艳,物品清晰可辨;5)难度适合一年级上学期。', 1766722260, 1766722261);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (63, '数的组成与分解', '选择题', '数学', 1, '给出一个数(如5),选择正确的组成方式(如1和4、2和3),或反向给出两个数求和。理解数的组成结构。', NULL, '生成一道数的组成题。要求:1)给出一个10以内的数;2)提问\"5可以分成几和几?\"或\"2和3合起来是几?\";3)提供4个选项;4)可用实物图(如圆点、方块)辅助;5)体现数的多种分解方式。', 1766722277, 1766722277);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (64, '比较大小-直观比较', '选择题', '数学', 1, '比较两个数或两组物品的多少,选择\">\"、\"<\"或\"=\"。建立大小概念。', 'image', '生成一道比较大小题。要求:1)提供两组物品图片或两个数字(10以内);2)要求选择正确的符号填空(如\"3○5\");3)选项为\">、<、=\";4)可配实物图直观比较;5)图片或数字清晰易读;6)一年级上学期难度。', 1766722300, 1766722300);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (65, '认识位置-上下左右', '选择题', '数学', 1, '根据图片判断物品的位置关系(如\"小猫在桌子的_____\"上/下/左/右)。建立空间方位概念。', 'image', '生成一道认识位置题。要求:1)提供一幅包含多个物品的情景图;2)提问某物品在另一物品的什么位置;3)选项为\"上面、下面、左边、右边、前面、后面\";4)图片清晰,位置关系明确;5)避免模糊或争议的位置;6)适合一年级学生理解。', 1766722318, 1766722318);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (66, '10以内加法-图画辅助', '应用题', '数学', 1, '通过图片情境列出加法算式并计算(如\"3个苹果加2个苹果=?\")。培养加法概念和列式能力。', 'image', '生成一道看图列加法算式题。要求:1)提供情境图,明确展示两组物品;2)要求学生列出加法算式并计算;3)和不超过10;4)图片情境生活化,如购物、分享等;5)支持拖拽数字和符号组成算式或直接输入;6)给予步骤提示和鼓励。', 1766722345, 1766722345);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (67, '10以内减法-图画辅助', '应用题', '数学', 1, '通过图片情境列出减法算式并计算(如\"5个气球飞走2个=?\")。理解减法意义。', 'image', ' 生成一道看图列减法算式题。要求:1)提供情境图,展示\"去掉\"或\"比较\"的情境;2)要求列出减法算式并计算;3)被减数不超过10,结果非负;4)情境如吃掉、送出、飞走等;5)支持算式输入;6)强调\"剩下\"或\"还有\"的概念。', 1766722369, 1766722369);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (68, '认识图形-平面图形', '选择题', '数学', 1, '识别或选择圆形、正方形、长方形、三角形等基本平面图形。建立图形概念。', 'image', '生成一道认识图形题。要求:1)提供一个或多个图形;2)提问\"这是什么图形?\"或\"找出所有的三角形\";3)图形标准且清晰;4)选项为\"圆形、正方形、长方形、三角形\";5)可在生活物品中识别图形(如钟面是圆形);6)适合一年级学生。', 1766722391, 1766722391);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (69, '图形拼组-简单拼图', '操作题', '数学', 1, '用基本图形拼成指定形状,或判断某个图形是由哪些基本图形组成。培养空间想象力。', 'image', '生成一道图形拼组题。要求:1)提供几个基本图形(三角形、正方形、圆形);2)要求拼成指定形状或判断组成;3)采用拖拽拼图交互或选择题形式;4)图形颜色区分,易于辨认;5)拼图难度适中,如2-4个图形组合;6)给予动画演示和鼓励。', 1766722470, 1766722470);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (70, '数的顺序-数数接龙', '拼写题', '数学', 1, '按顺序填写缺失的数字(如\"1,2,__,4,5\"),或倒数。掌握数的顺序。', NULL, '生成一道数的顺序题。要求:1)提供一组连续数字序列,其中1-2个数字缺失;2)数字范围1-20;3)可以是顺数或倒数;4)要求填写缺失的数字;5)支持数字输入;6)可配数轴或计数器辅助;7)难度适合一年级。', 1766722488, 1766722488);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (71, '简单实际问题-加减应用', '应用题', '数学', 1, '阅读简单的文字题,列式计算(如\"小明有3支铅笔,妈妈又给了2支,现在有几支?\")。培养解决实际问题的能力。', NULL, '生成一道简单应用题。要求:1)设计生活情境问题,涉及加法或减法;2)文字简洁,配图辅助理解;3)数据在10以内;4)问题明确,如\"一共有几个?\"、\"还剩几个?\";5)要求列式并计算;6)给予分步提示(读题→找数字→列式→计算);7)语言贴近一年级学生。', 1766722508, 1766722508);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (72, '认识钟表-整点', '选择题', '数学', 1, '识别钟面上的整点时间(如\"现在是几点?\"),或根据时间拨钟。建立时间概念。', 'image', '生成一道认识钟表题。要求:1)提供钟面图,显示整点时间(如3点、7点);2)提问\"现在是几点?\"或\"哪个钟面显示的是5点?\";3)选项为几个时间或几个钟面图;4)钟面清晰,时针分针明确;5)只涉及整点,不涉及几点半;6)适合一年级上学期。', 1766722530, 1766722530);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (73, '分类与整理-简单分类', '匹配题', '数学', 1, '按照某一标准(颜色、形状、大小)对物品进行分类。培养分类思维。', 'image', '生成一道分类整理题。要求:1)提供8-12个物品图片,涉及2-3个类别;2)分类标准明确(如按形状分、按颜色分);3)采用拖拽分类交互;4)每个类别用标签标识;5)完成后统计各类数量;6)适合一年级学生操作。', 1766722550, 1766722550);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (74, '数数-20以内', '选择题', '数学', 1, '数出20以内物品的数量。扩展数的认识范围。', 'image', '生成一道数数题(20以内)。要求:1)图片展示11-20个物品;2)物品可以分组呈现,如两排或分成几堆;3)提供4个数字选项;4)图片清晰,物品易数;5)适合一年级下学期;6)可提供计数策略提示(如5个一数)。', 1766722569, 1766722569);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (75, '100以内数的认识-读数写数', '拼写题', '数学', 1, '根据图示(如计数器)或文字读出或写出100以内的数。认识较大的数。', 'image', '生成一道读数写数题。要求:1)提供计数器图或数字表示(如\"35\"或\"三十五\");2)要求读出或写出对应的数;3)数的范围20-100;4)支持数字输入或语音输入;5)可提供数位提示(几十和几);6)适合一年级下学期末。', 1766722592, 1766722592);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (76, '人民币认识-元角分', '选择题', '数学', 1, '识别不同面值的人民币,或进行简单的换算(如\"1元=10角\")。学习货币知识。', 'image', '生成一道人民币认识题。要求:1)提供人民币图片(1元、5元、1角、5角等);2)提问\"这是多少钱?\"或\"1元等于几角?\";3)选项为不同金额或换算结果;4)人民币图片清晰真实;5)涉及简单购物情境;6)适合一年级下学期。', 1766722615, 1766722615);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (77, '表内乘法-基础记忆', '选择题', '数学', 2, '完成乘法口诀表内的计算(如\"3×4=?\"),巩固乘法口诀记忆。', NULL, '生成一道表内乘法题。要求:1)随机生成一道2-9的乘法算式;2)提供4个选项;3)可配图辅助(如3组4个苹果);4)支持口诀提示功能;5)适合二年级上学期;6)快速反应训练。', 1766722637, 1766722637);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (78, '表内除法-理解意义', '应用题', '数学', 2, '通过具体情境理解除法意义(如\"12个苹果平均分给3人,每人几个?\"),并计算。', 'image', '生成一道除法应用题。要求:1)设计\"平均分\"情境问题;2)配图展示分配过程;3)被除数在乘法口诀表内;4)要求列式并计算;5)强调\"平均分\"和\"每份是几\"的概念;6)适合二年级学生理解。', 1766722656, 1766722656);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (79, '有余数的除法', '应用题', '数学', 2, '计算有余数的除法,理解余数的意义(如\"13÷3=4余1\")。', NULL, '生成一道有余数除法题。要求:1)被除数除以除数后有余数;2)配实际情境(如分东西有剩余);3)要求写出商和余数;4)强调\"余数要比除数小\";5)提供算式格式\"13÷3=□...□\";6)适合二年级下学期。', 1766722676, 1766722676);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (80, '混合运算-两步计算', '应用题', '数学', 2, '进行含有加减乘除的两步混合运算(如\"5+3×2=?\"),理解运算顺序。', NULL, '生成一道混合运算题。要求:1)设计包含两种运算的算式;2)考查运算顺序(先乘除后加减,同级从左到右);3)可给出实际问题或直接算式;4)数据适中,便于口算;5)提供运算顺序提示;6)适合二年级下学期。', 1766722694, 1766722694);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (81, '长度单位-米和厘米', '选择题', '数学', 2, '认识米和厘米,进行长度测量和单位换算(如\"1米=100厘米\")。建立长度概念。', 'image', '生成一道长度单位题。要求:1)提供测量情境(如桌子长度、身高);2)选择合适的单位(米或厘米);3)或进行单位换算;4)配尺子、米尺图片辅助;5)数据真实合理;6)适合二年级学生理解。', 1766722715, 1766722715);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (82, '时间单位-时分秒', '选择题', '数学', 2, '认识时、分、秒,进行时间单位换算(如\"1时=60分\"),或读取几时几分。', 'image', '生成一道时间单位题。要求:1)认识钟面上的几时几分;2)或进行时分换算;3)或计算时间经过(如从8:00到8:30过了多久);4)配钟面图或时间轴;5)难度适合二年级;6)贴近生活作息。', 1766722734, 1766722734);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (83, '数据收集整理-统计表', '应用题', '数学', 2, '根据图表或情境收集数据,填写统计表,并回答简单问题。培养数据意识。', 'image', '生成一道数据整理题。要求:1)提供一组数据(如全班同学喜欢的水果);2)要求整理成统计表;3)回答简单问题(如\"喜欢苹果的有几人?\"、\"哪种水果最受欢迎?\");4)数据量10-20个;5)表格格式清晰;6)适合二年级学生操作。', 1766722757, 1766722757);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (84, '简单统计图-条形图', '选择题', '数学', 2, '阅读简单的条形统计图,提取信息并回答问题。学习图表阅读。', 'image', '生成一道条形统计图题。要求:1)提供一个简单的条形统计图(3-5个类别);2)提问数据比较、总数等问题;3)如\"哪个最多?\"、\"一共有多少?\";4)统计图清晰,数据明确;5)适合二年级学生阅读;6)可为彩色条形图增强趣味性。', 1766722774, 1766722774);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (85, '万以内数的认识-读写数', '拼写题', '数学', 2, '读出或写出万以内的数,理解数位和数的组成。扩展数的认识范围。', NULL, '生成一道万以内数的读写题。要求:1)给出数字或文字形式;2)要求转换(如\"2345\"读作\"二千三百四十五\");3)或根据数位写数(如\"3个千、5个百、2个十\");4)范围1000-10000;5)提供数位表辅助;6)适合二年级下学期末。', 1766722793, 1766722793);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (86, '克和千克-质量单位', '选择题', '数学', 2, '认识克和千克,进行质量单位换算,或选择合适的单位。建立质量概念。', 'image', '生成一道质量单位题。要求:1)提供物品图片或情境;2)选择合适的质量单位(克或千克);3)或进行单位换算(1千克=1000克);4)如\"一个苹果大约重多少?\";5)数据真实合理;6)配天平或秤的图片辅助。', 1766722810, 1766722810);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (87, '图形运动-平移旋转', '选择题', '数学', 2, '识别图形的平移、旋转现象,或判断平移后的位置。初步理解图形运动。', 'image', '生成一道图形运动题。要求:1)展示图形平移或旋转的过程;2)判断是平移还是旋转,或选择平移后的图形;3)配动画演示更直观;4)图形简单(如正方形、三角形);5)适合二年级学生理解;6)生活中的例子(如推拉门是平移,风车是旋转)。', 1766722830, 1766722830);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (88, '对称图形-轴对称', '判断题', '数学', 2, '判断图形是否对称,或找出对称轴。认识对称现象。', 'image', '生成一道对称图形题。要求:1)提供一个图形;2)判断是否轴对称,或有几条对称轴;3)图形可以是基本几何图形或生活物品(如蝴蝶、枫叶);4)可提供折纸验证功能;5)配图清晰,对称性明显;6)适合二年级学生。', 1766722851, 1766722851);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (89, '解决问题-连续应用', '应用题', '数学', 2, '解决需要多步计算的实际问题(如\"买2支铅笔5元,买3个本子9元,一共多少钱?\")。培养综合解题能力。', NULL, '生成一道连续应用题。要求:1)设计生活化情境(购物、出行等);2)需要两步或两步以上计算;3)配图辅助理解题意;4)数据适中,涉及加减乘除;5)分步提示:读题→分析→列式→计算→检验;6)适合二年级下学期;7)给予详细解题思路。', 1766722872, 1766722872);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (90, '推理问题-简单逻辑', '选择题', '数学', 2, '根据条件进行简单推理(如\"小明比小红高,小红比小华高,谁最高?\")。培养逻辑思维。', NULL, '生成一道推理题。要求:1)给出2-3个条件;2)要求推理出结果;3)问题涉及比较、排序、归类等;4)可配图或表格辅助;5)逻辑链条简单,不超过3步;6)适合二年级学生思维水平;7)给予推理过程提示。', 1766722892, 1766722892);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (91, '数学广角-找规律', '选择题', '数学', 2, '发现数列、图形序列的规律,并继续或填补(如\"2、4、6、8、__\")。培养观察和归纳能力。', 'image', '生成一道找规律题。要求:1)设计一个有规律的数列或图形序列;2)规律明显且适合二年级学生发现;3)如数字等差、图形循环等;4)要求填写下一个或缺失的部分;5)提供4个选项;6)可配图形或颜色辅助;7)给予规律发现的提示。', 1766722916, 1766722916);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (92, '两位数乘两位数', '应用题', '数学', 3, '进行两位数乘两位数的笔算,或解决相关实际问题。掌握多位数乘法。', 'image', '生成一道两位数乘两位数题。要求:1)生成两个两位数的乘法算式;2)可以是纯计算或应用题情境;3)提供竖式格式或直接计算;4)支持手写输入或步骤拍照上传;5)检查每一步计算是否正确;6)适合三年级上学期;7)给予详细的竖式演示。', 1766722941, 1766722980);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (93, '除数是一位数的除法', '应用题', '数学', 3, '进行三位数除以一位数的笔算,或解决相关问题。掌握多位数除法。', 'image', '生成一道除数是一位数的除法题。要求:1)被除数为两位数或三位数,除数为一位数;2)可以是纯计算或应用题;3)提供竖式格式;4)检查试商、相乘、相减、落下各步骤;5)支持步骤批改;6)适合三年级上学期;7)给予竖式演示。', 1766722974, 1766722974);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (94, '面积概念-认识平方单位', '选择题', '数学', 3, '理解面积的意义,认识平方厘米、平方米等单位,进行简单换算。建立面积概念。', 'image', '生成一道面积单位题。要求:1)介绍面积概念和单位;2)选择合适的面积单位(如\"一本书的面积约多少?\");3)或进行单位换算;4)配图辅助理解(如1平方厘米的正方形);5)数据真实合理;6)适合三年级学生。', 1766723001, 1766723001);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (95, '长方形和正方形面积计算', '应用题', '数学', 3, '运用公式计算长方形、正方形的面积(如\"长6米宽4米的长方形面积是多少?\")。掌握面积公式。', 'image', '生成一道面积计算题。要求:1)给出长方形或正方形的边长;2)要求计算面积;3)配图标注尺寸;4)可设置实际情境(如计算房间面积);5)要求写出公式和计算过程;6)适合三年级下学期;7)单位换算可能涉及。', 1766723022, 1766723022);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (96, '分数初步认识', '选择题', '数学', 3, '理解简单分数的意义(如1/2、1/4),读写分数,比较分数大小。初步认识分数。', 'image', '生成一道分数认识题。要求:1)用图形(圆、长方形)表示分数;2)涂色部分对应的分数;3)或比较两个分数大小;4)分数为简单的单位分数或几分之几;5)配直观图形辅助;6)适合三年级下学期;7)强调分数的意义(几分之几)。', 1766723040, 1766723040);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (97, '小数的初步认识', '选择题', '数学', 3, '认识一位小数,理解小数的意义(如0.3表示3个0.1),读写小数。初步接触小数。', NULL, '生成一道小数认识题。要求:1)认识一位小数(如0.5、1.2);2)理解小数与分数的关系(如0.3=3/10);3)或读写小数;4)配数轴或长度单位辅助(如0.5米);5)生活中的小数应用(如价格);6)适合三年级下学期。', 1766723063, 1766723063);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (98, '周长概念及计算', '应用题', '数学', 3, '理解周长的意义,计算长方形、正方形、多边形的周长。掌握周长计算。', 'image', '生成一道周长计算题。要求:1)给出图形的各边长度;2)要求计算周长;3)图形可以是长方形、正方形或不规则多边形;4)配图标注边长;5)可设置实际情境(如围栏长度);6)适合三年级学生;7)强调周长是\"一周的长度\"。', 1766723080, 1766723080);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (99, '时间计算-经过时间', '应用题', '数学', 3, '计算经过的时间(如\"从8:30到10:15经过了多长时间?\"),或推算开始/结束时间。理解时间计算。', NULL, '生成一道时间计算题。要求:1)给出起止时间,计算经过时间;2)或给出起始时间和经过时间,求结束时间;3)跨越整点或半点;4)配时间轴或钟面辅助;5)贴近学生生活(如上课、活动时间);6)适合三年级学生;7)给予分步计算提示。', 1766723097, 1766723097);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (100, '估算-乘除法估算', '选择题', '数学', 3, '对乘除法结果进行估算(如\"298×5大约等于多少?\"),培养估算意识。', NULL, '生成一道估算题。要求:1)给出一个乘法或除法算式;2)要求估算结果(取整十、整百);3)提供几个估算结果选项;4)强调\"大约\"、\"约等于\";5)实际应用情境(如估算购物总价);6)适合三年级学生;7)给予估算策略提示。', 1766723117, 1766723117);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (101, '解决问题-多步计算', '应用题', '数学', 3, '解决需要多步计算的复杂问题,培养分析和综合能力。', NULL, '生成一道多步应用题。要求:1)设计需要2-3步计算的问题;2)情境生活化(购物、行程、工程等);3)配图或表格呈现信息;4)要求列综合算式或分步算式;5)数据适中,运算涉及加减乘除;6)分步提示:审题→找关系→列式→计算→检验;7)给予详细解题思路和多种解法。', 1766723133, 1766723133);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (102, '倍数问题-求一个数是另一个数的几倍', '应用题', '数学', 3, '理解\"倍\"的概念,解决求倍数或已知倍数求原数的问题(如\"6是2的几倍?\")。掌握倍数关系。', 'image', ' 生成一道倍数问题题。要求:1)设计\"求几倍\"或\"已知几倍求原数\"的问题;2)配图直观表示倍数关系(如用小方块表示);3)要求列式计算;4)强调\"几倍\"就是\"几个几\";5)情境贴近学生生活;6)适合三年级学生;7)给予倍数关系分析。', 1766723154, 1766723154);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (103, '24时计时法', '选择题', '数学', 3, '认识24时计时法,进行12时和24时计时法的转换(如\"下午3时就是15时\")。理解计时方式。', NULL, '生成一道24时计时法题。要求:1)给出12时或24时计时法的时间;2)要求转换或判断对错;3)如\"晚上8时用24时计时法表示是几时?\";4)配时间轴或钟面辅助;5)生活情境(如车次时刻表);6)适合三年级学生;7)给予转换规律提示。', 1766723175, 1766723175);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (104, '数学广角-集合初步', '应用题', '数学', 3, '通过实际问题认识集合(如\"班上既参加足球队又参加篮球队的有几人?\"),初步理解交集概念。', 'image', '生成一道集合问题题。要求:1)设计实际情境(如参加活动、喜欢水果);2)配韦恩图辅助;3)要求计算交集、并集数量;4)数据简单明了;5)适合三年级学生理解;6)给予韦恩图解释和计算方法。', 1766723195, 1766723195);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (105, '搭配问题-简单组合', '应用题', '数学', 3, '解决简单的搭配问题(如\"2件上衣和3条裤子可以搭配几种穿法?\"),初步理解乘法原理。', 'image', '生成一道搭配问题题。要求:1)设计搭配情境(穿衣、配餐、路线选择);2)配图展示搭配选项;3)要求计算搭配方法数;4)可列举或用乘法计算;5)数据适中,不超过3类选项;6)适合三年级学生;7)给予图示和计算方法。', 1766723215, 1766723215);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (106, '位置与方向-东南西北', '选择题', '数学', 3, '识别东、南、西、北四个方向,根据地图或描述判断方位。建立方向感。', 'image', '生成一道方向识别题。要求:1)提供平面示意图;2)标注某些位置;3)判断某地在另一地的哪个方向;4)或根据方向描述画图;5)配指南针图标辅助;6)情境如校园地图、城市地图;7)适合三年级学生;8)给予方向判断方法提示。', 1766723231, 1766723231);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (107, '字母识别-大写字母', '选择题', '英语', 1, '识别和选择大写字母(A-Z)。建立字母认知。', NULL, '生成一道大写字母识别题。要求:1)展示一个大写字母;2)提问\"这是什么字母?\"或给出字母音让学生选字母;3)提供4个大写字母选项;4)字体清晰,字号较大;5)可配字母歌或动画;6)适合一年级上学期。', 1766723278, 1766723278);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (108, '字母识别-小写字母', '选择题', '英语', 1, '识别和选择小写字母(a-z)。巩固字母认知。', NULL, '生成一道小写字母识别题。要求:1)展示一个小写字母;2)提问\"这是什么字母?\"或选择对应的大写字母;3)提供4个小写字母选项;4)字体规范,易于识别;5)可配字母描红动画;6)适合一年级学生。', 1766723298, 1766723298);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (109, '大小写字母匹配', '匹配题', '英语', 1, '将大写字母与对应的小写字母连线配对。理解大小写对应关系。', NULL, '生成一道大小写匹配题。要求:1)提供5-6个大写字母和对应的小写字母;2)两列随机排列;3)采用连线交互;4)字母清晰,颜色区分;5)完成后给予鼓励;6)适合一年级学生。', 1766723317, 1766723317);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (110, '字母书写-描红练习', '拼写题', '英语', 1, '按照笔顺书写字母(大写或小写)。训练书写规范。', NULL, '生成一道字母书写题。要求:1)提供字母描红格(四线三格);2)展示正确笔顺动画;3)学生手写输入或使用虚拟笔书写;4)评估书写规范性(笔顺、位置、大小);5)可重复练习;6)适合一年级学生;7)给予鼓励和改进提示。', 1766723332, 1766723332);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (111, '看图识单词-名词', '选择题', '英语', 1, '看图片选择对应的英文单词(如apple, cat, dog)。积累基础词汇。', 'image', '生成一道看图识单词题。要求:1)展示一个常见物品的图片;2)提供3-4个单词选项;3)单词为一年级核心词汇(动物、水果、日用品等);4)图片清晰,色彩鲜艳;5)可配单词发音;6)适合一年级学生。', 1766723349, 1766723349);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (112, '听音选图-词汇', '选择题', '英语', 1, '听单词发音,选择对应的图片。训练听力和词汇识别。', 'audio', '生成一道听音选图题。要求:1)播放一个单词的标准发音;2)提供3-4幅图片选项;3)单词为一年级词汇;4)音质清晰,语速慢;5)可重复播放2-3次;6)图片清晰易辨;7)适合一年级学生。', 1766723366, 1766723366);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (113, '单词跟读-基础词汇', '口语题', '英语', 1, '听单词发音并跟读,系统评估发音准确性。训练标准发音。', 'audio', '生成一道单词跟读题。要求:1)播放一个单词的标准发音;2)显示单词和配图;3)学生跟读;4)AI评估发音准确性(音准、音长);5)给予即时反馈和鼓励;6)单词为一年级核心词汇;7)可多次练习。', 1766723385, 1766723385);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (114, '颜色识别-英文表达', '选择题', '英语', 1, '识别颜色的英文表达(red, blue, yellow等),或根据颜色选单词。学习颜色词汇。', 'image', '生成一道颜色识别题。要求:1)展示一种颜色或彩色物品;2)提问\"What color is it?\";3)提供4个颜色单词选项;4)或反向,给出颜色单词让学生选颜色;5)颜色鲜明,易于识别;6)适合一年级学生;7)可配颜色歌。', 1766723403, 1766723403);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (115, '数字识别-1到10', '选择题', '英语', 1, '识别英文数字1-10(one, two, three...),或数数并选择对应数字。学习数字词汇。', 'image', '生成一道数字识别题。要求:1)展示一定数量的物品或数字;2)提问\"How many?\"或\"What number is it?\";3)提供4个数字单词选项;4)数字范围1-10;5)可配图或数字卡片;6)适合一年级学生;7)可配数字歌。', 1766723424, 1766723432);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (116, '简单问候语-听说', '口语题', '英语', 1, '听或说简单的问候语(Hello, Hi, Good morning等),进行基础交流训练。', 'audio', '生成一道问候语听说题。要求:1)播放问候语音频;2)学生跟读或回应;3)如听到\"Hello\",回应\"Hello\"或\"Hi\";4)评估发音和回应准确性;5)可配情境动画(见面、分别场景);6)适合一年级学生;7)给予鼓励和情境提示。', 1766723454, 1766723454);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (117, '身体部位-指认', '选择题', '英语', 1, '识别身体部位的英文表达(head, hand, foot等),或根据单词选图片。学习身体词汇。', 'image', '生成一道身体部位识别题。要求:1)展示人物图片,标注或提问某个身体部位;2)提供4个身体部位单词选项;3)或给出单词让学生点击图片对应部位;4)图片清晰,卡通或真实均可;5)可配\"Head, Shoulders, Knees and Toes\"歌曲;6)适合一年级学生。', 1766723476, 1766723476);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (118, '字母排序-按字母表顺序', '匹配题', '英语', 1, '将打乱的字母按字母表顺序排列(如B, D, A, C排成A, B, C, D)。巩固字母表顺序。', NULL, '生成一道字母排序题。要求:1)提供3-5个打乱顺序的字母;2)要求按字母表顺序排列;3)采用拖拽排序交互;4)字母可以是连续或间隔的;5)完成后播放字母歌;6)适合一年级下学期;7)给予字母表提示。', 1766723495, 1766723495);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (119, '简单名词分类', '匹配题', '英语', 1, '将单词或图片按类别分类(动物、水果、玩具等)。培养分类思维和词汇归纳。', 'image', '生成一道单词分类题。要求:1)提供8-10个单词或图片;2)涉及2-3个类别(如animals, fruits, toys);3)采用拖拽分类交互;4)每个类别用图标标识;5)单词配图辅助;6)适合一年级学生;7)完成后给予分类结果展示。', 1766723513, 1766723513);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (120, '看图识句-简单陈述句', '选择题', '英语', 1, '看图片选择正确的英文句子(如图片是猫,选\"It\'s a cat.\")。初步理解句子。', 'image', '生成一道看图识句题。要求:1)展示一幅简单情景图;2)提供3-4个简单句子选项;3)句子结构为\"It\'s a...\"或\"This is a...\";4)图片和句子高度相关;5)句子配发音;6)适合一年级学生;7)强调整句理解。', 1766723533, 1766723533);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (121, 'TPR活动-听指令做动作', '判断题', '英语', 1, '听简单的英文指令(Stand up, Sit down, Clap your hands等),判断动作是否正确或选择对应动作图片。TPR教学法应用。', 'audio', '生成一道TPR指令题。要求:1)播放简单的动作指令;2)提供几幅动作图片或动画;3)学生选择正确的动作;4)或观看动作判断指令是否正确;5)指令清晰,动作简单(站、坐、跳、拍手等);6)可配动画演示;7)适合一年级学生;8)增强互动性和趣味性。', 1766723558, 1766723558);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (122, '自然拼读-CVC单词', '拼写题', '英语', 2, '根据发音规则拼读或拼写CVC结构单词(如cat, dog, pen)。学习自然拼读。', 'audio', '生成一道自然拼读题。要求:1)播放一个CVC单词发音;2)要求学生拼写该单词;3)或给出单词让学生根据拼读规则读出;4)单词为常见CVC结构;5)可提供字母选项或键盘输入;6)强调拼读规则(辅音-元音-辅音);7)适合二年级学生。', 1766723590, 1766723590);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (123, '单词拼写-四会单词', '拼写题', '英语', 2, '根据图片、中文或发音拼写单词(二年级四会词汇)。巩固单词记忆。', 'image', '生成一道单词拼写题。要求:1)提供图片、中文释义或发音;2)要求学生拼写对应英文单词;3)单词为二年级核心四会词汇;4)支持键盘输入或字母拖拽组合;5)可提供首字母提示或字母数提示;6)评估拼写正确性;7)给予鼓励和正确拼写展示。', 1766723612, 1766723612);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (124, '词汇匹配-英汉互译', '匹配题', '英语', 2, '将英文单词与中文释义连线匹配。理解词义。', NULL, '生成一道词汇匹配题。要求:1)提供5-6个英文单词和对应的中文释义;2)两列随机排列;3)采用连线交互;4)单词为二年级学习词汇;5)可配图片辅助;6)完成后展示正确配对并朗读单词;7)适合二年级学生。', 1766723628, 1766723628);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (125, '听音判断-对错题', '判断题', '英语', 2, '听句子或对话,判断图片或陈述是否正确。训练听力理解。', 'audio', '生成一道听音判断题。要求:1)播放一个简单句子或对话;2)展示一幅图片或一个陈述;3)学生判断是否相符(True/False或√/×);4)句子结构简单,语速适中;5)可播放2次;6)图片或陈述与听力内容相关度高;7)适合二年级学生。', 1766723653, 1766723653);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (126, '短句跟读-基础句型', '口语题', '英语', 2, '听短句并跟读(如\"I like apples.\"),评估发音和语调。训练口语表达。', 'audio', '生成一道短句跟读题。要求:1)播放一个简单句子(5-8个单词);2)显示句子文本和配图;3)学生跟读;4)AI评估发音、语调、流利度;5)句型为二年级学习的基础句型;6)可逐词跟读或整句跟读;7)给予详细反馈和鼓励。', 1766723673, 1766723673);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (127, '看图选句-情境匹配', '选择题', '英语', 2, '看情境图片,选择最合适的英文句子。理解句子在情境中的运用。', 'image', '生成一道看图选句题。要求:1)展示一幅情境图片;2)提供3-4个句子选项;3)句子表达与图片情境相关的不同内容;4)要求选择最匹配图片的句子;5)图片情境明确(如问候、介绍、表达喜好等);6)适合二年级学生;7)句子配发音。', 1766723691, 1766723691);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (128, '选择填空-单词或短语', '选择题', '英语', 2, '在句子中选择合适的单词或短语填空(如\"I ___ apples. A. like B. likes\")。学习语法和词汇运用。', NULL, '生成一道选择填空题。要求:1)给出一个句子,用括号或下划线标注填空位置;2)提供3-4个选项;3)考查词汇、语法或句型;4)句子贴近二年级学生生活;5)可配图片辅助理解;6)给予语法规则解释;7)适合二年级学生。', 1766723711, 1766723711);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (129, '情景对话-角色扮演', '口语题', '英语', 2, '根据情景进行简单对话(如问候、介绍、购物),扮演其中一个角色。培养交际能力。', 'audio', '生成一道情景对话题。要求:1)设置一个交际情景(见面问候、自我介绍、购物等);2)提供对话框架或关键句型;3)学生扮演其中一个角色进行对话;4)AI扮演另一个角色或提供录音;5)评估语音、内容、交际适切性;6)对话2-4轮;7)给予鼓励和改进建议。', 1766723730, 1766723730);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (130, '阅读理解-短文选择', '选择题', '英语', 2, '阅读50-80词的短文,回答2-3个理解性问题。培养阅读能力。', 'image', '生成一道阅读理解题。要求:1)编写50-80词的简单短文;2)内容贴近二年级学生生活;3)配相关插图;4)设计2-3个选择题,考查基本信息理解;5)问题如\"What\'s his name?\"、\"Where is she?\";6)每题4个选项;7)文本可配发音;8)适合二年级学生阅读水平。', 1766723748, 1766723748);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (131, '名词单复数-基础规则', '选择题', '英语', 2, '识别或选择名词的单数和复数形式(如\"apple-apples\"),理解基础变化规则。学习语法基础。', 'image', '生成一道名词单复数题。要求:1)给出一个名词单数或复数形式;2)要求选择对应的复数或单数形式;3)或判断单复数使用是否正确;4)名词为规则变化(加s或es);5)配图辅助(一个苹果vs多个苹果);6)适合二年级学生;7)强调\"one\"用单数,\"two/many\"用复数。', 1766723768, 1766723768);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (132, '介词学习-方位介词', '选择题', '英语', 2, '理解和运用方位介词(in, on, under, behind等),根据图片选择或填空。学习介词用法。', 'image', '生成一道介词题。要求:1)展示物品位置关系图;2)提问\"Where is the cat?\"或填空\"The cat is ___ the box.\";3)选项为in, on, under, behind等;4)图片位置关系明确;5)适合二年级学生;6)给予介词含义和用法解释。', 1766723785, 1766723785);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (133, '一般现在时-be动词', '选择题', '英语', 2, '选择正确的be动词(am, is, are)填空(如\"I ___ a student.\")。掌握be动词用法。', NULL, '生成一道be动词选择题。要求:1)给出一个句子,be动词位置空缺;2)根据主语选择am, is或are;3)提供3个be动词选项;4)句子简单,主语明确(I, you, he, she, it, they);5)适合二年级学生;6)给予be动词用法规则(I-am, you-are, he/she/it-is, we/they-are)。', 1766723803, 1766723803);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (134, '看图写单词-组成短句', '简答题', '英语', 2, '看图片,写出关键单词并组成一个简单句子(如图片:男孩踢球,写\"The boy plays football.\")。训练写作基础。', 'image', '生成一道看图写句题。要求:1)提供一幅简单情景图;2)要求写出描述图片的一个句子(5-8个单词);3)可提供单词提示或句型框架;4)评估句子语法正确性和与图片相关性;5)句子结构为主谓或主谓宾;6)适合二年级学生;7)给予鼓励和正确示例。', 1766723823, 1766723823);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (135, '疑问句-特殊疑问词', '选择题', '英语', 2, '理解和运用特殊疑问词(What, Where, Who, How等),选择正确的疑问词或回答问题。学习疑问句。', NULL, ' 生成一道疑问句题。要求:1)给出一个疑问句或答句;2)选择正确的疑问词或匹配问答;3)如\"___ is your name? My name is Tom.\";4)选项为What, Where, Who, How等;5)问答内容贴近二年级学生;6)适合二年级学生;7)给予疑问词用法解释。', 1766723842, 1766723842);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (136, '听短文回答问题', '选择题', '英语', 2, '听50-80词的短文,回答2-3个理解性问题。培养听力理解能力。', 'audio', '生成一道听短文回答问题题。要求:1)录制或生成50-80词的英文短文音频;2)内容贴近二年级学生生活;3)语速适中,发音清晰;4)可播放2-3次;5)设计2-3个选择题,考查基本信息;6)如\"What\'s the weather like?\"、\"What does he like?\";7)每题4个选项;8)提供文本辅助选项。', 1766723863, 1766723863);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (137, '自然拼读-长元音与双元音', '拼写题', '英语', 3, '根据拼读规则读出或拼写含长元音、双元音的单词(如cake, boat, feet)。深化自然拼读学习。', 'audio', '生成一道自然拼读题。要求:1)提供含长元音或双元音的单词(ai, ay, ee, ea, oa等);2)播放发音或显示单词;3)要求根据拼读规则读出或拼写;4)强调发音规则(如a_e发/ei/);5)可提供规则提示卡;6)适合三年级学生;7)给予拼读规则讲解。', 1766723912, 1766723912);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (138, '词汇分类-高级归纳', '匹配题', '英语', 3, '将单词按更细致的类别分类(如将食物分为fruits, vegetables, drinks等)。提升分类归纳能力。', NULL, '生成一道词汇分类题。要求:1)提供10-12个单词;2)涉及3-4个细分类别;3)如food类可分fruits, vegetables, meat等;4)采用拖拽分类;5)单词为三年级学习词汇;6)完成后展示分类结果并解释;7)适合三年级学生。', 1766723931, 1766723931);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (139, '同义词与反义词', '选择题', '英语', 3, '选择单词的同义词或反义词(如big的反义词是small)。扩展词汇理解。', NULL, '生成一道同反义词题。要求:1)给出一个单词;2)要求选择其同义词或反义词;3)提供4个选项;4)单词为三年级核心词汇;5)可配图或句子辅助理解;6)适合三年级学生;7)给予词义解释和例句。', 1766723947, 1766723947);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (140, '阅读理解-长文章', '选择题', '英语', 3, '阅读100-150词的文章,回答3-4个理解性问题,包括细节理解和推理判断。提升阅读能力。', NULL, '生成一道阅读理解题。要求:1)编写100-150词的文章;2)内容有一定情节或信息量;3)设计3-4个问题,包括细节理解、推理判断、主旨理解;4)每题4个选项;5)文章配图辅助;6)可提供生词注释;7)适合三年级阅读水平;8)问题由浅入深。', 1766723965, 1766723965);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (141, '完形填空-短文填词', '选择题', '英语', 3, '在短文中选择合适的单词填空(5-8个空),考查词汇和语境理解。综合语言运用。', NULL, '生成一道完形填空题。要求:1)编写80-100词的短文,设置5-8个空;2)每个空提供3-4个选项;3)考查词汇、语法、语境理解;4)短文内容连贯,有情节;5)可配图辅助理解;6)适合三年级学生;7)给予答案解析和全文展示。', 1766723983, 1766723983);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (142, '句型转换-肯定否定疑问', '简答题', '英语', 3, '将肯定句改为否定句或疑问句,或进行句型转换(如\"I like apples.\"改为\"I don\'t like apples.\")。掌握句型变化。', NULL, '生成一道句型转换题。要求:1)给出一个肯定句;2)要求改为否定句、一般疑问句或特殊疑问句;3)或提供转换后的句子要求判断正误;4)句子结构为一般现在时;5)提供文字输入或选项选择;6)适合三年级学生;7)给予句型转换规则讲解。', 1766724000, 1766724000);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (143, '时态学习-现在进行时', '选择题', '英语', 3, '理解现在进行时的结构和用法(am/is/are + doing),选择或填空。学习进行时态。', 'image', '生成一道现在进行时题。要求:1)给出一个句子或情境图;2)要求选择正确的进行时形式;3)如\"He ___ (play) football now.\"选项:plays, is playing, played;4)配图展示正在进行的动作;5)强调\"now\"、\"look\"等标志词;6)适合三年级学生;7)给予现在进行时用法讲解。', 1766724017, 1766724017);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (144, '情景写作-看图写话', '简答题', '英语', 3, '看图片写3-5句话描述情景。培养英文写作能力。', 'image', '生成一道看图写话题。要求:1)提供一幅或多幅情景图片;2)要求写3-5句话描述图片内容;3)可提供关键词或句型提示;4)评估句子数量、语法正确性、内容相关性、逻辑连贯性;5)适合三年级学生;6)给予鼓励和优秀范文;7)支持草稿保存。', 1766724037, 1766724037);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (145, '听对话判断-复杂情境', '判断题', '英语', 3, '听较长对话(4-6轮),判断陈述正误或选择正确信息。提升听力理解。', 'audio', '生成一道听对话判断题。要求:1)录制4-6轮的对话(30-50词);2)对话有一定情节(问路、购物、介绍等);3)设计2-3个判断题或选择题;4)语速正常,发音清晰;5)可播放2次;6)提供判断依据或关键信息提示;7)适合三年级学生。', 1766724056, 1766724056);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (146, '词汇辨析-相似词', '选择题', '英语', 3, '在具体语境中选择最合适的词语(如see/look/watch的区别)。精确理解词义。', NULL, '生成一道词汇辨析题。要求:1)给出一个句子,其中某个词位置空缺;2)提供2-3个意思相近的词选项;3)如\"Let\'s ___ TV.\"选项:see, look, watch;4)要求选择最恰当的词;5)给予各词用法区别讲解;6)适合三年级学生;7)句子语境明确。', 1766724075, 1766724075);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (147, '冠词用法-a/an/the', '选择题', '英语', 3, '在句子中选择正确的冠词(a, an或the),或判断冠词使用是否正确。学习冠词规则。', NULL, '生成一道冠词题。要求:1)给出一个句子,冠词位置空缺或待判断;2)要求选择a, an或the;3)如\"I have ___ apple.\"或\"There is ___ sun in the sky.\";4)考查a/an区分(元音因素)和the的特指用法;5)适合三年级学生;6)给予冠词用法规则讲解。', 1766724093, 1766724093);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (148, '情态动词-can', '选择题', '英语', 3, '理解can的用法,表示能力或请求(如\"I can swim.\"、\"Can you help me?\")。学习情态动词。', NULL, '生成一道情态动词can题。要求:1)给出含can的句子或要求填空;2)考查can表示能力或请求的用法;3)如\"She ___ dance.\"或\"___ I have some water?\";4)提供3-4个选项;5)适合三年级学生;6)给予can的用法讲解(can+动词原形,无人称和数的变化)。', 1766724109, 1766724109);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (149, '听短文填空-关键词', '拼写题', '英语', 3, '听短文,填写缺失的关键词(3-5个)。训练听力和拼写。', 'audio', '生成一道听短文填空题。要求:1)录制60-80词的短文音频;2)文本中设置3-5个关键词空缺;3)播放音频2-3次;4)要求听写填空的词汇;5)词汇为三年级学习的重点词;6)可提供首字母或词性提示;7)适合三年级学生;8)给予听力策略指导。', 1766724126, 1766724126);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (150, '描述性写作-我的...', '简答题', '英语', 3, '根据题目写一篇描述性短文(如\"My Family\"、\"My School\"),50-80词。培养英文写作能力。', NULL, '生成一道描述性写作题。要求:1)给出写作题目(如\"My Friend\"、\"My Pet\"、\"My Hobby\");2)提供写作提示(外貌、性格、喜好等);3)要求50-80词;4)提供文本编辑器;5)AI从内容、结构、语法、词汇等维度评分;6)给予详细反馈和改进建议;7)提供优秀范文参考;8)适合三年级学生。', 1766724144, 1766724144);
INSERT INTO `ah_question_type` (`id`, `title`, `scene`, `subject`, `grade`, `description`, `resource_type`, `prompt`, `create_time`, `update_time`) VALUES (151, '综合对话-多轮交际', '口语题', '英语', 3, '进行5-8轮的综合对话(如自我介绍、谈论爱好、邀请朋友等),评估交际能力。综合口语运用。', 'audio', '生成一道综合对话题。要求:1)设置一个交际情景(结识新朋友、谈论周末计划等);2)进行5-8轮对话;3)AI扮演对话者,根据学生回答灵活应对;4)评估语音、内容、交际策略、流利度;5)对话涉及多个话题和句型;6)适合三年级学生;7)给予详细评价和交际技巧指导。\n\n', 1766724168, 1766724168);
COMMIT;

-- ----------------------------
-- Table structure for ah_student
-- ----------------------------
DROP TABLE IF EXISTS `ah_student`;
CREATE TABLE `ah_student` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `phone` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `grade` int NOT NULL DEFAULT '1',
  `status` int NOT NULL,
  `create_time` int NOT NULL,
  `update_time` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_ah_student_id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Records of ah_student
-- ----------------------------
BEGIN;
INSERT INTO `ah_student` (`id`, `name`, `phone`, `password`, `token`, `grade`, `status`, `create_time`, `update_time`) VALUES ('51a25244-02ed-4ade-8f08-a5948d654fe0', '犹天娇', '17098341802', '$2b$12$/7W7lhdT9.R.6U3WgFPuzOxEdDvlxqU7Qpj10KjfIDA3.JwGhF/S.', NULL, 1, 1, 1766478814, 1766480066);
INSERT INTO `ah_student` (`id`, `name`, `phone`, `password`, `token`, `grade`, `status`, `create_time`, `update_time`) VALUES ('e8cc70d2-167e-478f-875a-79def21f05cc', '森森', '15068114669', '$2b$12$dHzlXv0qAaS2Ht3X/qzLJOV30lj.1/5icx14gIk3F4FdlOjGa5Hga', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImU4Y2M3MGQyLTE2N2UtNDc4Zi04NzVhLTc5ZGVmMjFmMDVjYyIsInVwZGF0ZV90aW1lIjoxNzY2NjI4OTMwLCJleHAiOjE3NjcyMzM3MzB9.JuS4n3ORlIdsjyUWgNs4jlUM8WuA5A5hh-XT99j8WWw', 1, 1, 1761899349, 1766628930);
COMMIT;

-- ----------------------------
-- Table structure for ah_student_practice
-- ----------------------------
DROP TABLE IF EXISTS `ah_student_practice`;
CREATE TABLE `ah_student_practice` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` varchar(255) NOT NULL,
  `practice_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_ah_student_practice_student_id` (`student_id`),
  KEY `ix_ah_student_practice_practice_id` (`practice_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Records of ah_student_practice
-- ----------------------------
BEGIN;
INSERT INTO `ah_student_practice` (`id`, `student_id`, `practice_id`) VALUES (1, 'e8cc70d2-167e-478f-875a-79def21f05cc', 7);
INSERT INTO `ah_student_practice` (`id`, `student_id`, `practice_id`) VALUES (2, 'e8cc70d2-167e-478f-875a-79def21f05cc', 8);
INSERT INTO `ah_student_practice` (`id`, `student_id`, `practice_id`) VALUES (7, '51a25244-02ed-4ade-8f08-a5948d654fe0', 9);
INSERT INTO `ah_student_practice` (`id`, `student_id`, `practice_id`) VALUES (8, '51a25244-02ed-4ade-8f08-a5948d654fe0', 8);
INSERT INTO `ah_student_practice` (`id`, `student_id`, `practice_id`) VALUES (9, '51a25244-02ed-4ade-8f08-a5948d654fe0', 7);
INSERT INTO `ah_student_practice` (`id`, `student_id`, `practice_id`) VALUES (10, 'e8cc70d2-167e-478f-875a-79def21f05cc', 9);
COMMIT;

-- ----------------------------
-- Table structure for ah_student_textbook
-- ----------------------------
DROP TABLE IF EXISTS `ah_student_textbook`;
CREATE TABLE `ah_student_textbook` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` varchar(255) NOT NULL,
  `textbook_id` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=59 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Records of ah_student_textbook
-- ----------------------------
BEGIN;
INSERT INTO `ah_student_textbook` (`id`, `student_id`, `textbook_id`) VALUES (40, 'e8cc70d2-167e-478f-875a-79def21f05cc', 20);
INSERT INTO `ah_student_textbook` (`id`, `student_id`, `textbook_id`) VALUES (41, 'e8cc70d2-167e-478f-875a-79def21f05cc', 12);
INSERT INTO `ah_student_textbook` (`id`, `student_id`, `textbook_id`) VALUES (43, 'e8cc70d2-167e-478f-875a-79def21f05cc', 11);
INSERT INTO `ah_student_textbook` (`id`, `student_id`, `textbook_id`) VALUES (44, 'e8cc70d2-167e-478f-875a-79def21f05cc', 16);
INSERT INTO `ah_student_textbook` (`id`, `student_id`, `textbook_id`) VALUES (47, '51a25244-02ed-4ade-8f08-a5948d654fe0', 16);
INSERT INTO `ah_student_textbook` (`id`, `student_id`, `textbook_id`) VALUES (48, '51a25244-02ed-4ade-8f08-a5948d654fe0', 20);
INSERT INTO `ah_student_textbook` (`id`, `student_id`, `textbook_id`) VALUES (49, '51a25244-02ed-4ade-8f08-a5948d654fe0', 11);
INSERT INTO `ah_student_textbook` (`id`, `student_id`, `textbook_id`) VALUES (50, '51a25244-02ed-4ade-8f08-a5948d654fe0', 12);
INSERT INTO `ah_student_textbook` (`id`, `student_id`, `textbook_id`) VALUES (55, '51a25244-02ed-4ade-8f08-a5948d654fe0', 30);
INSERT INTO `ah_student_textbook` (`id`, `student_id`, `textbook_id`) VALUES (56, '51a25244-02ed-4ade-8f08-a5948d654fe0', 31);
INSERT INTO `ah_student_textbook` (`id`, `student_id`, `textbook_id`) VALUES (57, 'e8cc70d2-167e-478f-875a-79def21f05cc', 30);
INSERT INTO `ah_student_textbook` (`id`, `student_id`, `textbook_id`) VALUES (58, 'e8cc70d2-167e-478f-875a-79def21f05cc', 31);
COMMIT;

-- ----------------------------
-- Table structure for ah_teacher_book
-- ----------------------------
DROP TABLE IF EXISTS `ah_teacher_book`;
CREATE TABLE `ah_teacher_book` (
  `id` int NOT NULL AUTO_INCREMENT,
  `subject` varchar(255) NOT NULL,
  `version` varchar(255) NOT NULL,
  `grade` int NOT NULL,
  `semester` varchar(255) NOT NULL,
  `file` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `index_file_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Records of ah_teacher_book
-- ----------------------------
BEGIN;
INSERT INTO `ah_teacher_book` (`id`, `subject`, `version`, `grade`, `semester`, `file`, `index_file_id`) VALUES (1, '英语', '人教版', 1, '上学期', '【教】人教版-英语-一年级-上册.pdf', 'file_2a1f4f3b993f4f2d91e217e0d9d8a77c_10672051');
INSERT INTO `ah_teacher_book` (`id`, `subject`, `version`, `grade`, `semester`, `file`, `index_file_id`) VALUES (3, '英语', '人教版', 1, '下学期', NULL, NULL);
COMMIT;

-- ----------------------------
-- Table structure for ah_textbook
-- ----------------------------
DROP TABLE IF EXISTS `ah_textbook`;
CREATE TABLE `ah_textbook` (
  `id` int NOT NULL AUTO_INCREMENT,
  `subject` varchar(255) NOT NULL,
  `version` varchar(255) NOT NULL,
  `grade` int NOT NULL,
  `semester` varchar(255) NOT NULL,
  `file` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `index_file_id` varchar(255) DEFAULT NULL,
  `is_parsed` int DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Records of ah_textbook
-- ----------------------------
BEGIN;
INSERT INTO `ah_textbook` (`id`, `subject`, `version`, `grade`, `semester`, `file`, `index_file_id`, `is_parsed`) VALUES (11, '数学', '人教版', 1, '上学期', '义务教育教科书·数学一年级上册.pdf', 'file_b3a1b77a4da441d7b30af6aec7097470_10672051', 1);
INSERT INTO `ah_textbook` (`id`, `subject`, `version`, `grade`, `semester`, `file`, `index_file_id`, `is_parsed`) VALUES (12, '英语', '人教版', 1, '上学期', '义务教育教科书·英语一年级上册.pdf', 'file_ef3e50a9461b4d62a9a2c1ae2f2b4ffc_10672051', 1);
INSERT INTO `ah_textbook` (`id`, `subject`, `version`, `grade`, `semester`, `file`, `index_file_id`, `is_parsed`) VALUES (16, '数学', '人教版', 1, '下学期', '义务教育教科书·数学一年级下册.pdf', 'file_0212b8a4ea734e6ea78dea90acc86c0c_10672051', 1);
INSERT INTO `ah_textbook` (`id`, `subject`, `version`, `grade`, `semester`, `file`, `index_file_id`, `is_parsed`) VALUES (20, '英语', '人教版', 1, '下学期', '义务教育教科书·英语一年级下册.pdf', 'file_db4b4c85584244aca38a82e6defb1605_10672051', 1);
INSERT INTO `ah_textbook` (`id`, `subject`, `version`, `grade`, `semester`, `file`, `index_file_id`, `is_parsed`) VALUES (21, '英语', '人教版', 3, '上学期', '人教版-英语-三年级-上册.pdf', 'file_55ec8c04925a4b9492bb1fd18c255249_10672051', 1);
INSERT INTO `ah_textbook` (`id`, `subject`, `version`, `grade`, `semester`, `file`, `index_file_id`, `is_parsed`) VALUES (22, '数学', '人教版', 3, '上学期', '人教版-数学-三年级-上册.pdf', 'file_fbeb8bbb85f54c6f8b641b07e9eabec7_10672051', 1);
INSERT INTO `ah_textbook` (`id`, `subject`, `version`, `grade`, `semester`, `file`, `index_file_id`, `is_parsed`) VALUES (23, '英语', '人教版', 2, '上学期', '人教版-英语-二年级-上册.pdf', 'file_30718b6a29d249d2b8a588983691f64e_10672051', 1);
INSERT INTO `ah_textbook` (`id`, `subject`, `version`, `grade`, `semester`, `file`, `index_file_id`, `is_parsed`) VALUES (24, '英语', '人教版', 2, '下学期', '人教版-英语-二年级-下册.pdf', 'file_e65aa087455b4c86af459c8d1443e5b6_10672051', 1);
INSERT INTO `ah_textbook` (`id`, `subject`, `version`, `grade`, `semester`, `file`, `index_file_id`, `is_parsed`) VALUES (25, '英语', '人教版', 3, '下学期', '人教版-英语-三年级-下册.pdf', 'file_cf27925df2ae40748b96396a7d9eb9bd_10672051', 1);
INSERT INTO `ah_textbook` (`id`, `subject`, `version`, `grade`, `semester`, `file`, `index_file_id`, `is_parsed`) VALUES (26, '数学', '人教版', 3, '下学期', '人教版-数学-三年级-下册.pdf', 'file_918fedf963d94d719c29f9a03fb4ed80_10672051', 1);
INSERT INTO `ah_textbook` (`id`, `subject`, `version`, `grade`, `semester`, `file`, `index_file_id`, `is_parsed`) VALUES (27, '数学', '人教版', 2, '下学期', '人教版-数学-二年级-下册.pdf', 'file_a8d97f2365c2403aa2a468c8a24a0ec7_10672051', 1);
INSERT INTO `ah_textbook` (`id`, `subject`, `version`, `grade`, `semester`, `file`, `index_file_id`, `is_parsed`) VALUES (28, '数学', '人教版', 2, '上学期', '人教版-数学-二年级-上册.pdf', 'file_527a69594ee0481abf98608ad070a008_10672051', 1);
INSERT INTO `ah_textbook` (`id`, `subject`, `version`, `grade`, `semester`, `file`, `index_file_id`, `is_parsed`) VALUES (30, '语文', '人教版', 1, '上学期', 'c3f8504ebd6d4261baf3cf7fb90eaf10.pdf', 'file_064d043da02d4d37b750e9ed2439b90f_10672051', 1);
INSERT INTO `ah_textbook` (`id`, `subject`, `version`, `grade`, `semester`, `file`, `index_file_id`, `is_parsed`) VALUES (31, '语文', '人教版', 1, '下学期', '0e5a68dc7ef6472a9a66e54f2587ed8c.pdf', 'file_b6b3101cf7d249ed8526ca66cf64f5e2_10672051', 1);
INSERT INTO `ah_textbook` (`id`, `subject`, `version`, `grade`, `semester`, `file`, `index_file_id`, `is_parsed`) VALUES (32, '语文', '人教版', 2, '上学期', '0bca24aa13e04d7ba017976946de9a8c.pdf', 'file_1efb92dac86c4d3d81c1fb59209c88cd_10672051', 1);
INSERT INTO `ah_textbook` (`id`, `subject`, `version`, `grade`, `semester`, `file`, `index_file_id`, `is_parsed`) VALUES (33, '语文', '人教版', 2, '下学期', '6a1e20b3d6d74630b71c9a3eebc2879f.pdf', 'file_36670ad3dcca450d9641ac793f41846e_10672051', 1);
INSERT INTO `ah_textbook` (`id`, `subject`, `version`, `grade`, `semester`, `file`, `index_file_id`, `is_parsed`) VALUES (34, '语文', '人教版', 3, '上学期', '60451bb7812d4aabaff0e5959d0a48d7.pdf', 'file_5bf474eb8119472bac44dbbf9eb6aa6b_10672051', 1);
INSERT INTO `ah_textbook` (`id`, `subject`, `version`, `grade`, `semester`, `file`, `index_file_id`, `is_parsed`) VALUES (35, '语文', '人教版', 3, '下学期', '12670f4162534395ba5b2ce1575b235f.pdf', 'file_95f5df628d034b7eba08635601ec4598_10672051', 1);
COMMIT;

-- ----------------------------
-- Table structure for ah_unit
-- ----------------------------
DROP TABLE IF EXISTS `ah_unit`;
CREATE TABLE `ah_unit` (
  `id` int NOT NULL AUTO_INCREMENT,
  `textbook_id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=205 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Records of ah_unit
-- ----------------------------
BEGIN;
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (6, 12, 'School', '关于学校的基本词汇和表达');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (7, 12, 'Face', '关于面部部位的词汇和表达');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (8, 12, 'Animals', '关于动物的基本词汇');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (9, 12, 'Numbers', '数字的学习');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (10, 12, 'Colours', '颜色的学习');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (11, 12, 'Fruit', '水果的学习');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (17, 11, '准备课', '介绍数学学习的起点，包括数一数、比多少等基础内容。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (18, 11, '位置', '学习描述物体位置关系的基本词汇和方法。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (19, 11, '5以内数的认识和加减法', '学习5以内数的基本概念、比较以及简单的加减运算。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (20, 11, '认识图形（一）', '初步认识常见的几何图形，培养空间观念。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (21, 11, '6~10的认识和加减法', '学习6到10的数字认识及其加减运算。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (22, 11, '11~20各数的认识', '学习11到20的数字认识，理解十位和个位的概念。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (23, 11, '认识钟表', '初步认识钟表，理解时间的基本概念。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (24, 11, '20以内的进位加法', '学习20以内数的进位加法，掌握基本计算技巧。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (26, 16, '认识图形（二）', '认识常见的平面图形，并初步体会平面图形和立体图形的关系。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (27, 16, '20以内的退位减法', '学习20以内的退位减法，掌握基本的计算方法。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (28, 16, '分类与整理', '学习对物品进行分类与整理，培养逻辑思维能力。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (29, 16, '100以内数的认识', '认识100以内的数，学习读写和基本的数位知识。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (30, 16, '认识人民币', '学习人民币的基本单位和简单的换算与计算。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (31, 16, '100以内的加法和减法（一）', '学习100以内的加法和减法的基本口算方法。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (32, 16, '找规律', '学习简单的规律，培养观察和推理能力。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (36, 20, 'Classroom', '本单元围绕教室中的物品及其位置展开，学习如何用英语描述物品的位置，如\'on\', \'in\', \'under\'等介词的使用，并通过听、说、 chant等活动巩固语言知识。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (37, 20, 'Room', '本单元以房间内的家具和物品为主题，进一步练习位置关系的表达，并引入更多家居词汇，通过对话和游戏增强语言运用能力。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (38, 20, 'Toys', '本单元主题为玩具，学生学习各种玩具的英文名称，并练习请求与回应的日常交际用语。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (40, 20, 'Food', '本单元聚焦食物主题，介绍常见的食物名称，并学习表达饥饿感及个人饮食偏好。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (41, 20, 'Drink', '本单元围绕饮品展开教学，学习常见饮料名称，并能在情境中进行简单对话。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (42, 20, 'Clothes', '本单元学习衣物类词汇，了解不同服装名称，并能在真实或模拟情境中指认和谈论衣物。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (85, 21, 'Unit 1 Making friends', '本单元围绕“交朋友”主题，引导学生学习如何用英语打招呼、自我介绍、表达友好，并认识身体部位词汇。通过对话、歌曲、chant等活动，培养学生初步的交际意识和合作精神。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (86, 21, 'Unit 2 Different families', '本单元聚焦“不同的家庭”，学习家庭成员的称呼，介绍自己的家人，并理解家庭结构的多样性（如大家庭、小家庭、堂/表亲等）。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (87, 21, 'Unit 3 Our animal friends', '本单元以“我们的动物朋友”为主题，区分宠物与野生动物，学习常见动物名称，并能描述动物特征（如 big, small, tall, fast）。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (88, 21, 'Unit 4 Plants around us', '本单元探讨“我们周围的植物”，学习常见水果名称，理解植物与人类的相互关系（植物提供食物、空气；人类需要照顾植物）。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (89, 21, 'Unit 5 The colourful world', '本单元围绕“多彩的世界”，学习颜色词汇，理解颜色在生活中的作用（如交通信号灯含义），并能混合颜色（如 red + yellow = orange）。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (90, 21, 'Unit 6 Useful numbers', '本单元主题为“有用的数字”，学习数字1-10，用于询问年龄、数量，并能在购物、时间等真实情境中运用。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (101, 25, 'Unit 1 Meeting new people', '本单元围绕“结识新朋友”展开，引导学生学习如何用英语打招呼、自我介绍、询问他人姓名和国籍，并了解不同国家的文化。内容包括问候语、国家名称（如China, UK, Canada, USA）、人物身份（teacher, student）以及礼貌用语（Let me help, After you!）。通过对话、chant、歌曲和调查活动，培养学生初步的跨文化交际意识和语言运用能力。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (102, 25, 'Unit 2 Expressing yourself', '本单元聚焦“表达自我”，引导学生描述宠物或物品的外貌特征（如long body, short legs, fat, thin），并学习多种表达情感与爱意的方式（如说“Love you!”、制作卡片、唱歌跳舞）。通过描述、调查和项目活动，鼓励学生用英语表达个人感受和对家人的关爱。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (103, 25, 'Unit 3 Learning better', '本单元主题为“更好地学习”，引导学生认识学习工具（pen, pencil, ruler, book等）和五感（see, hear, smell, taste, touch）在学习中的作用。学习如何礼貌地借用文具（Can I use your...?），并通过制作“感官书”等活动，理解多元学习方式。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (104, 25, 'Unit 4 Healthy food', '本单元围绕“健康饮食”展开，学习常见食物和饮品名称（bread, milk, egg, noodles, rice, meat, vegetables, fruit, juice），讨论健康食物的选择，并练习点餐和表达喜好（I\'d like... / Would you like...?）。通过设计健康餐盘等活动，培养健康饮食意识。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (105, 25, 'Unit 5 Old toys', '本单元主题为“旧玩具”，引导学生谈论家中旧物（toys, books, school things），学习物品位置表达（in, on, under），并探讨如何通过捐赠、再利用等方式赋予旧物新生命。通过整理旧物、制作海报等活动，培养环保和分享意识。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (106, 25, 'Unit 6 Numbers in life', '本单元聚焦“生活中的数字”，学习11-20的数字表达，用于计数物品数量（How many...?）和询问价格（How much...?）。通过跳蚤市场买卖活动，将数字运用于真实生活场景，培养数学应用能力和理财意识。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (107, 24, 'Unit 1 Playtime', '本单元围绕“游戏时间”展开，通过对话、歌谣和活动，学习表达能力的句型“Can you...?”及其回答“Yes, I can.”/“No, I can’t.”，并掌握与游戏和活动相关的动词短语，如play football、ride a bike、swim、fly a kite、make a model plane、make a snowman等。同时通过书写练习巩固字母Bb的书写。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (108, 24, 'Unit 2 Weather', '本单元聚焦天气话题，学习描述天气的形容词（sunny, rainy, cloudy, snowy, windy）及句型“What’s the weather like today?”和“It’s...”。通过绘画、猜测游戏等活动强化理解和运用，并结合雨伞（umbrella）等词汇拓展表达。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (109, 24, 'Unit 3 Seasons', '本单元介绍四季（spring, summer, autumn, winter）及其对应的天气特征（warm, hot, cool, cold）和典型活动（如fly a kite in spring, swim in summer）。通过调查和角色扮演，学习表达最喜欢的季节：“What’s your favourite season?”及回答。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (110, 24, 'Unit 4 Time', '本单元教授时间表达，包括整点和非整点时间（如7:40, 11:30, 2:50），学习数字11-15及20-50，并运用句型“What time is it?”和“It’s...”。通过制作钟表、游戏“Wolf, Wolf, what time is it?”等活动增强实践能力。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (111, 24, 'Unit 5 My Day', '本单元围绕日常生活作息，学习一日活动短语（get up, eat breakfast, go to school等）及时间表达，掌握句型“When do you... every day?”和“At...”。通过调查和角色扮演，描述个人日程安排。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (112, 24, 'Unit 6 My Week', '本单元学习星期名称（Sunday至Saturday），掌握句型“What day is it today?”和“It’s...”。通过歌曲、日程表填写和故事，了解一周中不同日子的活动安排，并在Mike的交友故事中体现社交情感。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (113, 23, 'Unit 1 My Family', '本单元围绕家庭成员展开，学生将学习如何用英语介绍自己的家人，包括父母、兄弟姐妹和祖父母，并掌握相关家庭成员的词汇及基本问答句型。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (114, 23, 'Unit 2 Boys and Girls', '本单元聚焦性别与身份识别，学习区分男孩与女孩，掌握描述人物性别的基本词汇，并能询问和回答他人的姓名。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (115, 23, 'Unit 3 My Friends', '本单元学习如何描述朋友的外貌特征，使用形容词表达高矮胖瘦、漂亮英俊等，并能介绍新朋友。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (116, 23, 'Unit 4 In the Community', '本单元学习社区场所词汇，掌握询问和表达去向的句型，如‘Where are you going?’及其回答。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (117, 23, 'Unit 5 In the Park', '本单元围绕公园中的自然景物展开，学习there is/there are句型描述公园里的事物，如树、湖、船、花等。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (118, 23, 'Unit 6 Happy Holidays', '本单元围绕节日（圣诞节和新年）展开，学习节日祝福语、赠送礼物的表达方式及相关词汇。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (119, 27, '数据收集和整理', '本单元通过调查班级同学对颜色、春游地点、课外小组、季节、天气、车辆类型、图书种类、水果等的喜好，引导学生学习如何进行简单的数据收集、记录（如用“正”字法）、整理，并用统计表呈现结果，从中获取信息并作出简单判断。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (120, 27, '表内除法（一）', '本单元引入除法概念，从“平均分”的实际情境出发，让学生理解除法的含义，认识除号，学会读写除法算式，并能用2~6的乘法口诀求商。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (121, 27, '图形的运动（一）', '本单元通过观察生活中的现象，让学生初步认识轴对称、平移和旋转三种基本的图形运动方式，并通过剪纸、做陀螺等活动加深理解。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (122, 27, '表内除法（二）', '本单元继续学习表内除法，重点是用7、8、9的乘法口诀求商，并运用除法解决简单的实际问题，如购物、分配等。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (123, 27, '混合运算', '本单元学习不含括号和含小括号的混合运算的运算顺序，掌握同级运算从左到右，两级运算先乘除后加减，有括号先算括号里的规则，并能列综合算式解决问题。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (124, 27, '有余数的除法', '本单元在表内除法的基础上，引入有余数的除法，理解余数的含义，掌握余数必须比除数小的道理，并能用竖式计算有余数的除法，解决“进一法”和“去尾法”等实际问题。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (125, 27, '万以内数的认识', '本单元认识计数单位“千”和“万”，掌握万以内数的数位顺序、读写方法、组成、大小比较以及近似数的概念，并学习整百、整千数的加减法。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (126, 27, '克和千克', '本单元认识质量单位“克”和“千克”，建立1克和1千克的质量观念，知道1千克=1000克，并能进行简单的估测和换算。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (127, 27, '数学广角—推理', '本单元通过解决简单的逻辑推理问题，如猜书、猜动物、方格填数（类似数独）等，培养学生初步的逻辑推理能力和有序、全面思考问题的意识。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (128, 28, '一 分类与整理', '本单元引导学生学习按不同标准对物品进行分类与整理，理解分类标准不同会导致结果不同但总数不变，并通过图表等方式表示分类结果。还涉及逐层分类的思想以及分类在生活中的应用。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (129, 28, '二 1～6的表内乘法', '本单元引入乘法概念，学习1～6的乘法口诀，掌握乘法算式的读写及含义，理解乘法是相同加数相加的简便运算，并能解决简单的实际问题。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (130, 28, '三 1～6的表内除法', '本单元引入除法概念，学习平均分的意义，掌握除法算式的读写及各部分名称，能用2～6的乘法口诀求商，并解决简单的除法实际问题。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (131, 28, '校园小导游', '本单元结合校园场景，学习辨认东、南、西、北四个基本方向，了解地图绘制规则（上北下南左西右东），并能设计简单的导游路线。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (132, 28, '四 厘米和米', '本单元学习长度单位厘米和米，认识统一长度单位的必要性，掌握1米=100厘米的关系，会用尺子测量物体长度，并认识线段。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (133, 28, '身体上的尺子', '本单元介绍“身体尺”（如拃、步、庹等）作为非标准测量工具，了解其在无尺情况下的实用价值，并通过测量活动加深对长度单位的理解。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (134, 28, '五 7～9的表内乘、除法', '本单元学习7～9的乘法口诀，掌握用这些口诀进行乘除法计算，能解决两步计算的实际问题，并整理完整的乘法口诀表。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (135, 28, '六 复习与关联', '本单元系统回顾本学期所学内容，包括数与运算（加减乘除）、数量关系、图形位置与测量、数据分类等，强调知识间的联系与综合应用。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (136, 22, '一 观察物体', '本单元通过从不同方向观察立体图形，让学生理解观察角度不同所看到的形状也不同，并通过展开图等活动进一步认识长方体等立体图形的结构。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (137, 22, '二 混合运算', '学习包含加减乘除及括号的混合运算顺序，掌握解决多步实际问题的方法，包括列综合算式和使用线段图分析数量关系。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (138, 22, '三 毫米、分米和千米', '认识毫米、分米、千米等长度单位，掌握单位间的换算关系，并能进行简单的估测和实际测量。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (139, 22, '曹冲称象的故事', '通过曹冲称象的故事引入质量单位克、千克、吨的认识，了解不同质量单位的应用场景及换算关系。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (140, 22, '四 多位数乘一位数', '学习多位数乘一位数的口算和笔算方法，理解算理，掌握进位乘法，并能运用估算解决实际问题。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (141, 22, '数字编码', '通过身份证号、邮政编码等实例，了解数字编码的意义和编制规则，尝试设计简单的编码方案。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (142, 22, '五 线和角', '认识线段、射线、直线的区别与联系，学习角的概念及分类（直角、锐角、钝角），掌握角的比较和绘制方法。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (143, 22, '六 分数的初步认识', '初步认识分数，理解几分之一和几分之几的含义，掌握简单分数的大小比较和加减计算，并能解决相关实际问题。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (144, 22, '七 复习与关联', '系统梳理本学期所学知识，包括数与运算、图形的认识与测量、常见的量等，强化知识间的联系与应用。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (148, 26, '位置与方向（一）', '本单元主要教授学生如何识别和描述物体的方位，包括基本的方向（东、南、西、北）及其相对关系，以及地图上方向的表示方法。通过校园建筑、城市地标等实例，帮助学生理解并应用方向知识解决实际问题。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (149, 26, '除数是一位数的除法', '本单元系统学习口算和笔算除法，重点是除数为一位数时的计算方法、估算技巧及验算方法，同时培养学生解决实际问题的能力。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (150, 26, '复式统计表', '本单元引导学生收集、整理数据，并将两个单式统计表合并为复式统计表，从而更清晰地比较和分析数据。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (151, 26, '两位数乘两位数', '本单元学习口算和笔算两位数乘法，掌握乘法竖式的书写格式与计算步骤，并能运用乘法解决连乘、连除等实际问题。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (152, 26, '面积', '本单元介绍面积概念、常用面积单位（平方厘米、平方分米、平方米），以及长方形和正方形面积的计算公式，并学习面积单位间的换算。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (153, 26, '年、月、日', '本单元学习时间单位年、月、日的关系，认识大月、小月、平年、闰年，掌握24时计时法，并能计算经过时间。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (154, 26, '小数的初步认识', '本单元初步认识小数，学习小数的读写、意义、大小比较，以及简单的小数加减法运算。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (155, 26, '数学广角—搭配（二）', '本单元通过排列组合问题，培养学生有序思考、不重不漏解决问题的能力，涉及数字组合、服装搭配、比赛场次等情境。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (156, 30, '我上学了', '本单元通过“我是中国人”“我爱我们的祖国”“我是小学生”“我爱学语文”等内容，帮助一年级新生建立身份认同，激发学习兴趣，培养爱国情感和学习语文的兴趣。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (157, 30, '第一单元·识字', '本单元以识字为主，通过《天地人》《金木水火土》《口耳目手足》《日月山川》等课文，引导学生认识基本汉字，了解人与自然的关系，掌握田字格书写规则。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (158, 30, '第二单元·汉语拼音', '本单元开始系统学习汉语拼音，包括单韵母a、o、e、i、u、ü，声母b、p、m、f、d、t、n、l，以及拼读练习和简单儿歌。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (159, 30, '第三单元·汉语拼音', '继续学习声母g、k、h、j、q、x、z、c、s、zh、ch、sh、r、y、w，以及整体认读音节，配合儿歌和绕口令巩固拼读能力。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (160, 30, '第四单元·汉语拼音', '学习复韵母ai、ei、ui、ao、ou、iu、ie、üe、er及鼻韵母an、en、in、un、ün、ang、eng、ing、ong，完成拼音系统学习。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (161, 30, '第五单元·阅读', '进入纯阅读阶段，通过《秋天》《江南》《雪地里的小画家》《四季》等课文，培养朗读、背诵和初步理解能力。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (162, 30, '第六单元·识字', '再次集中识字，通过《对韵歌》《日月明》《小书包》《升国旗》等课文，学习会意字、形声字，培养爱国情感和学习用品认知。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (163, 30, '第七单元·阅读', '通过《小小的船》《影子》《两件宝》等课文，引导学生观察生活，思考人与自然、身体与思维的关系。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (164, 30, '第八单元·阅读', '通过《比尾巴》《乌鸦喝水》《雨点儿》等课文，学习问答式表达、解决问题的方法及自然现象的理解。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (165, 31, '第一单元·识字', '本单元以识字为主，包含四篇课文：《春夏秋冬》《姓氏歌》《小青蛙》《猜字谜》，以及语文园地一和快乐读书吧。内容围绕四季、姓氏、动物和汉字结构展开，旨在通过朗读、背诵和游戏等方式激发学生识字兴趣，初步了解汉字构形规律。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (166, 31, '第二单元·阅读', '本单元以阅读为主，包含三篇课文：《热爱中国共产党》《吃水不忘挖井人》《我多想去看看》，以及语文园地二。主题聚焦爱党爱国、感恩教育和祖国壮丽河山，培养学生情感态度与价值观。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (167, 31, '第三单元·阅读', '本单元包含三篇童话故事：《小公鸡和小鸭子》《树和喜鹊》《怎么都快乐》，以及语文园地三。主题围绕友情、互助与快乐，引导学生体会伙伴相处的乐趣和集体生活的温暖。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (168, 31, '第四单元·阅读', '本单元包含四篇课文：《静夜思》《夜色》《端午粽》，以及语文园地四。主题涉及思乡、克服胆怯、传统节日文化，融合古诗、现代诗与记叙文，提升学生审美与文化认同。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (169, 31, '第五单元·识字', '本单元为识字单元，包含四篇韵文：《动物儿歌》《古对今》《操场上》《人之初》，以及语文园地五。通过儿歌、对子、活动场景和经典启蒙，系统学习汉字与传统文化。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (170, 31, '第六单元·阅读', '本单元包含四篇课文：《古诗二首》（《池上》《小池》）《浪花》《荷叶圆圆》《要下雨了》，以及语文园地六。主题聚焦夏日自然景象与科学常识，语言生动富有童趣。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (171, 31, '第七单元·阅读', '本单元包含四篇课文：《文具的家》《一分钟》《动物王国开大会》《小猴子下山》，以及语文园地七。主题围绕良好习惯、时间观念、信息传达与做事专注，具有较强的生活指导意义。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (172, 31, '第八单元·阅读', '本单元包含三篇童话：《棉花姑娘》《咕咚》《小壁虎借尾巴》，以及语文园地八。主题涉及求助、谣言辨别与动物特征，寓教于乐，培养科学思维与问题解决能力。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (173, 32, '第一单元·阅读', '本单元包含三篇课文：《小蝌蚪找妈妈》《我是什么》《植物妈妈有办法》，以及语文园地一和快乐读书吧。通过童话、科普文等形式，引导学生了解自然现象和动植物知识，培养观察力与想象力。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (174, 32, '第二单元·识字', '本单元以识字为主，包括《场景歌》《树之歌》《拍手歌》《田家四季歌》四篇韵文，结合自然、生活场景帮助学生积累词汇，认识汉字结构。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (175, 32, '第三单元·阅读', '本单元包含《彩虹》《去外婆家》《数星星的孩子》三篇课文及语文园地三，通过儿童视角展现亲情、自然探索与科学精神。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (176, 32, '第四单元·阅读', '本单元包括两首古诗（《登鹳雀楼》《望庐山瀑布》）、《黄山奇石》《日月潭》《葡萄沟》等写景课文，引导学生感受祖国山河之美。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (177, 32, '第五单元·阅读', '本单元包含寓言故事《坐井观天》《寒号鸟》《我要的是葫芦》，通过动物故事揭示道理，培养思辨能力。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (178, 32, '第六单元·阅读', '本单元讲述革命历史故事《八角楼上》《朱德的扁担》《难忘的泼水节》《刘胡兰》，弘扬革命精神与民族团结。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (179, 32, '第七单元·阅读', '本单元包括古诗《江雪》《敕勒歌》、童话《雾在哪里》《雪孩子》，融合古典诗歌与现代童话，探讨自然与情感。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (180, 32, '第八单元·阅读', '本单元包含《称赞》《纸船和风筝》《快乐的小河》等故事，强调人际交往中的鼓励、和解与互助。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (181, 33, '第一单元', '本单元以春天为主题，通过古诗、散文等形式描绘春天的美景和孩子们寻找春天的活动，引导学生感受自然之美，培养观察力和想象力。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (182, 33, '第二单元', '本单元围绕关爱他人、劳动价值和亲情主题，通过诗歌、故事等形式引导学生体会助人为乐、尊重劳动成果及家庭温暖的情感。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (183, 33, '识字单元（一）', '集中学习与中华文化相关的识字内容，包括祖国山河、传统节日、汉字起源和中华美食，增强文化认同感。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (184, 33, '第三单元', '本单元以童话和想象为主，通过梦境、动物对话、沙滩游戏等故事激发儿童想象力，培养同理心与合作精神。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (185, 33, '第四单元', '本单元聚焦寓言与生活哲理，通过成语故事、观察角度差异、独立思考等主题，引导学生明辨事理、学会换位思考。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (186, 33, '第五单元', '本单元以自然现象和科学常识为核心，通过古诗、雷雨描写、野外辨向、太空生活等内容，激发探索自然与宇宙的兴趣。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (187, 33, '第六单元', '本单元以童话寓言为主，通过动物故事探讨自我认知、经营策略、环境改造等主题，蕴含生活智慧。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (188, 33, '第七单元', '本单元融合神话传说与祖先记忆，通过远古故事激发对中华文明起源的想象与敬仰。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (189, 34, '第一单元', '寻访多彩校园，留下欢乐印迹。阅读时关注有新鲜感的词语和句子，体会习作的乐趣。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (190, 34, '第二单元', '感受金秋时节的自然之美，学习运用多种方法理解难懂的词语，并练习写日记记录见闻与感受。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (191, 34, '第三单元', '阅读策略单元，学习在阅读中进行预测，了解预测的基本方法，并尝试续编故事。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (192, 34, '第四单元', '游历奇妙的童话王国，感受童话丰富的想象，体会真善美，并尝试自己编童话、写童话。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (193, 34, '第五单元', '习作单元，学习留心观察周围事物，把观察所得细致、具体地写下来。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (194, 34, '第六单元', '饱览祖国壮美山河，学习借助关键语句理解段落意思，并围绕一个意思写清楚一段话。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (195, 34, '第七单元', '探索自然，发现生命之美，感受课文生动语言，积累语句，并记录自己的想法。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (196, 34, '第八单元', '感悟美好品质，获取精神力量，学习带着问题默读，并练习写一件简单的事。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (197, 35, '第一单元', '本单元以大自然中的生灵为主题，通过古诗、散文和说明文等多种文体，引导学生体会优美生动的语句，培养观察与表达能力。课文包括《绝句》《惠崇春江晚景》《三衢道中》《燕子》《荷花》《昆虫备忘录》等，强调想象画面、朗读背诵、积累词语，并开展口语交际与习作活动。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (198, 35, '第二单元', '本单元以寓言故事为主，引导学生理解故事蕴含的道理，体会人物性格差异，学习通过语言和神态描写刻画形象，并开展关于班干部轮流制的讨论。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (199, 35, '第三单元', '本单元聚焦中国传统节日，通过古诗、说明文和综合性学习活动，引导学生了解节日习俗，感受传统文化魅力，提升信息整合与表达能力。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (200, 35, '第四单元', '本单元围绕观察与实验展开，引导学生关注事物变化规律，借助关键语句概括段落大意，学习科学探究方法，撰写实验报告。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (201, 35, '第五单元', '本单元进入想象世界，通过奇幻故事激发想象力，鼓励学生大胆创造，尝试编写充满奇思妙想的童话，体会想象的乐趣。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (202, 35, '第六单元', '本单元聚焦童年生活，通过诗歌、记叙文和人物描写，展现童年的真善美，学习通过动作、语言、心理描写刻画人物特点。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (203, 35, '第七单元', '本单元引导学生发现世界之奇妙，从天空与大地的日常现象中感受生命之美，学习从多个方面介绍事物，初步掌握信息整合能力。');
INSERT INTO `ah_unit` (`id`, `textbook_id`, `name`, `content`) VALUES (204, 35, '第八单元', '本单元以趣味故事为主，引导学生复述故事，理解情节发展，发挥想象力创作新故事，提升口头表达与创造性写作能力。');
COMMIT;

SET FOREIGN_KEY_CHECKS = 1;
