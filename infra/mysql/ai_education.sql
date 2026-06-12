/*
 Navicat Premium Dump SQL

 Source Server         : aliyun
 Source Server Type    : MySQL
 Source Server Version : 80045 (8.0.45-0ubuntu0.22.04.1)
 Source Host           : 47.96.105.206:3306
 Source Schema         : ai_education

 Target Server Type    : MySQL
 Target Server Version : 80045 (8.0.45-0ubuntu0.22.04.1)
 File Encoding         : 65001

 Date: 30/05/2026 10:14:27
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for ah_ability
-- ----------------------------
DROP TABLE IF EXISTS `ah_ability`;
CREATE TABLE `ah_ability` (
  `id` int NOT NULL AUTO_INCREMENT,
  `subject` varchar(50) NOT NULL,
  `grade` int NOT NULL,
  `code` varchar(100) NOT NULL,
  `name` varchar(200) NOT NULL,
  `description` text,
  `difficulty` int NOT NULL,
  `is_active` int NOT NULL,
  `create_time` int NOT NULL,
  `update_time` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_ability` (`subject`,`grade`,`code`),
  KEY `ix_subject_grade` (`subject`,`grade`),
  KEY `ix_ah_ability_grade` (`grade`),
  KEY `ix_ah_ability_subject` (`subject`)
) ENGINE=InnoDB AUTO_INCREMENT=100 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Records of ah_ability
-- ----------------------------
BEGIN;
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (2, '语文', 1, 'reading_discrimination', '拼音拼读与辨析', '掌握声母、韵母、整体认读音节，能准确拼读音节词，区分形近声母（如 b/d, p/q）。', 1, 1, 1768376601, 1768376862);
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (3, '语文', 1, 'strokes_stroke_order', '汉字笔画与笔顺', '认识田字格，掌握基本笔画（如横、竖、撇、捺）及“先横后竖”等基本笔顺规则。', 1, 1, 1768376601, 1768376873);
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (4, '语文', 1, 'picture_text_matching', '图文识字', '能借助图画猜读生字，联系生活实际理解字义（如象形字日、月、水、火）。', 2, 1, 1768376601, 1768377398);
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (5, '语文', 1, 'extraction_information', '信息提取', '在阅读课文中，能找出文中明显的信息（如找出故事中的角色、地点）。', 2, 1, 1768376601, 1768376897);
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (6, '语文', 2, 'radical_dictionary_lookup', '部首查字法', '学习使用部首查字法查字典，了解部首表义的规律（如提手旁与手有关）。', 2, 1, 1768376602, 1768376849);
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (7, '语文', 2, 'guess_word_meaning', '语境猜词义', '能结合上下文和生活经验，猜测生词的大致意思，理解近义词、反义词。', 3, 1, 1768376602, 1768376833);
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (8, '语文', 2, 'picture_writing_basic', '看图写话基础', '能根据多幅图画看懂故事大意，并能用几句连贯的话写下来，正确使用标点。', 3, 1, 1768376602, 1768376602);
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (9, '语文', 3, 'prediction_inference', '预测与推想', '在阅读过程中，能根据题目、插图或故事线索预测故事的发展和结局。', 3, 1, 1768376602, 1768376602);
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (10, '语文', 3, 'key_sentence_summarization', '关键句概括', '能借助关键语句（如总起句）概括一段话的大意，了解“围绕一个意思写”的方法。', 3, 1, 1768376602, 1768376602);
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (11, '语文', 3, 'observation_sensory_description', '观察与感官描写', '学习调动多种感官（视、听、味等）进行观察，并能细致描写事物的变化。', 3, 1, 1768376602, 1768376602);
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (12, '语文', 4, 'questioning_strategy', '提问策略', '学习从不同角度（内容、写法、启示）提出问题，并尝试解决问题。', 4, 1, 1768376602, 1768376602);
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (13, '语文', 4, 'letter_practical_writing', '书信与应用文', '掌握书信的正确格式（称呼、问候语、正文、署名、日期），学习写信。', 3, 1, 1768376602, 1768376602);
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (14, '语文', 4, 'long_text_reading', '长文阅读', '能把握长文章的主要内容，按事情发展的顺序（起因、经过、结果）复述。', 4, 1, 1768376602, 1768376602);
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (15, '语文', 5, 'improve_reading_speed', '提高阅读速度', '学习“连词成句”地读，不回读，带着问题默读，提高阅读效率。', 5, 1, 1768376602, 1768376602);
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (16, '语文', 5, 'dynamic_static_description', '动态与静态描写', '体会文章中静态描写和动态描写的表达效果，学习动静结合的写法。', 4, 1, 1768376602, 1768376602);
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (17, '语文', 5, 'expository_text_reading', '说明性文本阅读', '了解基本的说明方法（列数字、举例子、作比较等），并能提取信息。', 4, 1, 1768376602, 1768376602);
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (18, '语文', 6, 'experience_emotion_expression', '体会情感与表达', '能够体会文章中作者表达的强烈情感，区分“主要内容”与“中心思想”。', 5, 1, 1768376602, 1768376602);
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (19, '语文', 6, 'debate_opinion_expression', '辩论与观点表达', '能针对特定话题（如“科技发展利大还是弊大”）表达观点，用事例支撑论点。', 5, 1, 1768376602, 1768376602);
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (20, '语文', 6, 'non_continuous_text_reading', '非连续性文本阅读', '能阅读图表、说明书、地图等非连续性文本，并从中解决实际问题。', 5, 1, 1768376602, 1768376602);
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (21, '英语', 1, 'vocabulary_mapping', '听音识义', '将听到的单词（如 animals, school things）与视觉形象建立直接联系，不依赖文字翻译。', 1, 1, 1768376602, 1768378308);
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (22, '英语', 1, 'response_pairing', '基础交际反应', '听懂简单的问候或指令，并选择正确的应答语（如 Hello -> Hi）。', 2, 1, 1768376602, 1768378317);
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (23, '英语', 2, 'letter_recognition', '字母与字形辨析', '识别生活场景中的字母，区分大小写，建立字母与其在单词中位置的联系。', 2, 1, 1768376602, 1768378332);
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (24, '英语', 2, 'directions', '方位与指令', '听懂关于位置的介词（in, on, under）和简单路线指引。', 2, 1, 1768376602, 1768378337);
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (25, '英语', 3, 'cvc_phonics', '自然拼读', '掌握元音字母（a, e, i, o, u）在闭音节中的发音规律，能“听音拼词”。', 3, 1, 1768376602, 1768378366);
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (26, '英语', 3, 'sentence_building', '句子结构构建', '理解简单的句子语序（如 Subject + Verb + Object），能连词成句。', 3, 1, 1768376602, 1768378371);
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (27, '英语', 4, 'functional_reading', '功能性阅读', '从海报、邀请函、日程表中提取关键信息（时间、地点、人物）。', 3, 1, 1768376602, 1768378278);
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (28, '英语', 4, 'spelling_patterns', '拼写规则应用', '掌握辅音组合（ch, sh, th）及元音组合（ar, er, ir）的发音和拼写。', 4, 1, 1768376602, 1768378283);
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (29, '英语', 5, 'tense_usage', '时态辨析', '在语境中区分一般现在时（Every day）和进行时（Now）或过去时。', 4, 1, 1768376603, 1768378464);
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (30, '英语', 5, 'letter', '书信与写作逻辑', '掌握英文书信格式，理解段落逻辑（问候、正文、落款）。', 4, 1, 1768376603, 1768378469);
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (31, '英语', 6, 'listening_comp', '长文听力理解', '听一段较长的对话或独白（如介绍城市、旅游经历），捕捉细节。', 5, 1, 1768376603, 1768378491);
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (32, '英语', 6, 'cross_disciplinary_chart_reading', '跨学科/图表阅读', '阅读地图、统计图表，并根据信息解决问题（如问路、比较数据）。', 5, 1, 1768376603, 1768378497);
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (33, '数学', 1, 'number_sense_cardinality', '数感与基数', '通过一一对应点数，理解1-20以内数的含义，建立“多少”的直观感觉。', 1, 1, 1768376603, 1768376603);
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (34, '数学', 1, 'shape_intuitive_understanding', '图形直观认识', '辨认长方体、正方体、圆柱、球等立体图形，以及长方形、三角形等平面图形。', 1, 1, 1768376603, 1768376603);
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (35, '数学', 1, 'carrying_addition_make_ten', '进位加法（凑十法）', '理解“凑十法”的算理（如9+4，把4分成1和3，9+1=10），进行20以内进位加法。', 2, 1, 1768376603, 1768376603);
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (36, '数学', 1, 'organization', '分类与整理思维', '能按不同标准（如颜色、形状）对事物进行分类，建立条理清晰的逻辑习惯。', 2, 1, 1768376603, 1768376603);
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (37, '数学', 2, 'multiplication_formula_construction', '乘法口诀构建', '理解乘法是“求几个相同加数的和”，熟记1-9乘法口诀并应用。', 2, 1, 1768376603, 1768376603);
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (38, '数学', 2, 'angle_preliminary_understanding', '角的初步认识', '辨认直角、锐角、钝角，知道角的大小与两边张开程度有关。', 2, 1, 1768376603, 1768376603);
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (39, '数学', 2, 'data_collection_organization', '数据收集整理', '能够用画“正”字等方法收集数据，并认识简单的统计表。', 2, 1, 1768376603, 1768376603);
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (40, '数学', 2, 'ability_5314', '简单的逻辑推理', '不直接告知结论，而是通过“A不是B”、“C在A后面”等线索推断出结果。', 3, 1, 1768376603, 1768376603);
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (41, '数学', 3, 'fraction_preliminary_understanding', '分数的初步认识', '理解几分之一和几分之几，能通过图形面积直观比较分数大小。', 3, 1, 1768376603, 1768376603);
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (42, '数学', 3, 'rectangle_square_perimeter', '长方形与正方形周长', '理解周长是封闭图形一周的长度，掌握长方形、正方形周长计算方法。', 3, 1, 1768376603, 1768376603);
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (43, '数学', 3, 'position_direction', '位置与方向', '辨认东、南、西、北、东北、西北等8个方向，能描述行走路线。', 3, 1, 1768376603, 1768376603);
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (44, '数学', 3, 'thought', '集合思想 (韦恩图)', '理解“重叠问题”，能用韦恩图解决如“既参加语文组又参加数学组”的人数计算。', 3, 1, 1768376603, 1768376603);
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (45, '数学', 3, 'number_sense', '估算与数感', '不要求精确计算，而是快速判断结果的大致范围，培养对数字大小的直觉。', 3, 1, 1768376603, 1768376603);
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (46, '数学', 4, 'large_number_understanding', '大数的认识', '掌握亿以内数的读写，理解数位顺序表，能进行大数改写和近似数（四舍五入）。', 3, 1, 1768376603, 1768376603);
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (47, '数学', 4, 'perpendicular_parallel', '垂线与平行线', '理解同一平面内两条直线的平行与垂直关系。', 3, 1, 1768376603, 1768376603);
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (48, '数学', 4, 'decimal_meaning_property', '小数的意义与性质', '理解小数的计数单位，掌握小数点移动引起数值变化的规律。', 4, 1, 1768376603, 1768376603);
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (49, '数学', 4, 'strategy', '优化策略 (统筹)', '学习合理安排时间（如烙饼问题、沏茶问题），寻找解决问题的最优方案。', 4, 1, 1768376603, 1768376603);
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (50, '数学', 4, 'strategy_1', '博弈策略 (对策论)', '在竞争性游戏中，通过分析对方策略制定必胜方案（如田忌赛马、取石子游戏）。', 4, 1, 1768376603, 1768376603);
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (51, '数学', 5, 'simple_equation', '简易方程', '用字母表示数，理解方程的意义，掌握等式的性质并解方程。', 4, 1, 1768376603, 1768376603);
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (52, '数学', 5, 'polygon_area', '多边形面积', '掌握平行四边形、三角形、梯形的面积公式，理解割补法推导过程。', 4, 1, 1768376603, 1768376603);
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (53, '数学', 5, 'factor_multiple', '因数与倍数', '理解质数、合数、奇数、偶数，掌握2、3、5的倍数特征。', 4, 1, 1768376603, 1768376603);
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (54, '数学', 5, 'ability_8804', '空间想象 (折叠与展开)', '不依赖实物，在脑海中将平面展开图折叠成立体图形，判断相对面。', 5, 1, 1768376603, 1768376603);
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (55, '数学', 5, 'ability_3671', '编码与数字化', '了解数字编码的规律（如身份证号、邮编），能设计简单的编码系统。', 4, 1, 1768376603, 1768376603);
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (56, '数学', 5, 'ability_9161', '找次品 (逻辑优化)', '在一堆物品中利用天平找出轻/重的一个，要求称量次数最少，理解三分法。', 5, 1, 1768376603, 1768376603);
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (57, '数学', 6, 'circle_understanding_calculation', '圆的认识与计算', '理解圆周率 π，掌握圆的周长和面积公式，认识圆扇形。', 5, 1, 1768376603, 1768376603);
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (58, '数学', 6, 'ratio_direct_inverse_proportion', '比例与正反比例', '理解比和比例的意义，判断正比例和反比例关系。', 5, 1, 1768376603, 1768376603);
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (59, '数学', 6, 'solid_shape_volume', '立体图形体积', '掌握圆柱和圆锥的体积计算，理解圆柱与圆锥体积的 3 倍关系。', 5, 1, 1768376603, 1768376603);
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (60, '数学', 6, 'ability_1037', '数形结合 (规律探索)', '利用图形（如正方形点阵）来解释复杂的算术规律（如奇数和等于平方数）。', 5, 1, 1768376604, 1768376604);
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (61, '数学', 6, 'application', '分段计费 (模型应用)', '解决出租车计费、水电费阶梯电价等复杂的现实分段函数问题。', 5, 1, 1768376604, 1768376604);
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (62, '数学', 6, 'ability_8104', '抽屉原理', '理解“总有一个抽屉至少有...个”的逻辑，解决存在性问题。', 5, 1, 1768376604, 1768376604);
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (63, '语文', 1, 'ext_public_sign_1', '标识识别', '一年级教材鼓励学生在街道招牌、路牌上识字。', 3, 1, 1768377106, 1768377686);
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (64, '语文', 6, 'ext_life_public_sign_6', '公共标识识别', '六年级要求读懂公交站牌，规划乘车路线。', 5, 1, 1768377107, 1768377855);
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (65, '语文', 2, 'ext_life_manual_diagram_2', '说明书与图示', '二年级涉及查看图示、制作手工作品或理解药品说明书等内容。', 3, 1, 1768377107, 1768377566);
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (66, '语文', 6, 'ext_life_manual_diagram_6', '说明书与图示', '六年级涉及查看图示、制作手工作品或理解药品说明书等内容。', 5, 1, 1768377107, 1768377860);
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (67, '语文', 5, 'ext_life_data_chart_5', '数据与图表分析', '五年级要求结合图表分析问题，如根据统计表提出改进建议。', 5, 1, 1768377107, 1768377821);
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (68, '语文', 6, 'ext_life_data_chart_6', '数据与图表分析', '六年级要求结合图表分析问题，如根据统计表提出改进建议。', 5, 1, 1768377107, 1768377867);
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (69, '语文', 6, 'ext_reading_plan_6', '阅读计划制定', '六年级明确要求制定阅读计划（如《童年》的阅读进度表），学习规划时间。', 5, 1, 1768377107, 1768377872);
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (70, '语文', 6, 'ext_reading_purpose_6', '有目的的阅读', '六年级第三单元专门训练\"有目的的阅读\"，即根据不同的任务（如为了以此为材写演讲稿 vs 仅仅为了娱乐）选择略读或精读。', 5, 1, 1768377107, 1768377880);
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (71, '语文', 3, 'ext_reading_genre_strategy_3', '体裁专属策略', '针对不同体裁有不同读法：神话要发挥想象，科普文要提取知识，小说要关注人物关系。', 3, 1, 1768377107, 1768377773);
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (72, '语文', 4, 'ext_reading_genre_strategy_4', '体裁专属策略', '针对不同体裁有不同读法：神话要发挥想象，科普文要提取知识，小说要关注人物关系。', 4, 1, 1768377107, 1768377801);
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (73, '语文', 5, 'ext_reading_genre_strategy_5', '体裁专属策略', '针对不同体裁有不同读法：神话要发挥想象，科普文要提取知识，小说要关注人物关系。', 5, 1, 1768377107, 1768377813);
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (74, '语文', 6, 'ext_reading_genre_strategy_6', '体裁专属策略', '针对不同体裁有不同读法：神话要发挥想象，科普文要提取知识，小说要关注人物关系。', 5, 1, 1768377107, 1768377887);
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (75, '语文', 2, 'ext_oral_refuse_negotiate_2', '拒绝与商量', '二年级要求在商量时用商量的语气，被拒绝不仅要理解，还不能勉强别人。', 4, 1, 1768377107, 1768377561);
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (76, '语文', 6, 'ext_oral_refuse_negotiate_6', '拒绝与商量', '六年级学习\"意见不同怎么办\"。', 5, 1, 1768377107, 1768377917);
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (77, '语文', 1, 'ext_listen_retell_1', '倾听与复述', '一年级要求\"看着对方眼睛\"、\"注意听\"。', 4, 1, 1768377107, 1768377690);
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (78, '语文', 4, 'ext_oral_listen_retell_4', '倾听与复述', '四年级要求\"转述\"信息，且要准确、不遗漏。', 4, 1, 1768377107, 1768377796);
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (79, '语文', 4, 'ext_oral_impromptu_speech_4', '即兴发言与演讲', '四年级学习通过条理清晰的理由来反驳或劝说。', 4, 1, 1768377107, 1768377790);
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (80, '语文', 6, 'ext_oral_impromptu_speech_6', '即兴发言与演讲', '六年级要求根据场合、对象进行即兴发言。', 5, 1, 1768377107, 1768377924);
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (81, '语文', 1, 'ext_culture_calligraphy_1', '书法欣赏', '一年级强调笔顺规则。 展示不同书法家的字帖（颜体、柳体），让学生进行连线匹配或选择形容其风格的词语（如\"瘦硬\"、\"丰润\"）。', 4, 1, 1768377107, 1768377696);
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (82, '语文', 6, 'ext_culture_calligraphy_6', '书法欣赏与笔法', '六年级要求欣赏名家书法（如柳公权），了解\"骨力\"、\"架构\"。', 5, 1, 1768377107, 1768377929);
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (83, '语文', 6, 'ext_culture_synesthesia_6', '艺术通感（联觉）', '六年级《月光曲》和《京剧趣谈》强调音乐、画面与文字的联通，体会艺术之美。', 5, 1, 1768377107, 1768377940);
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (84, '英语', 3, 'ext_culture_comparison_3', '中西文化对比', '了解中外节日、饮食、风俗的异同（如春节 vs 圣诞节，饺子 vs 汉堡），培养跨文化理解。', 3, 1, 1768377586, 1768378378);
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (85, '英语', 4, 'ext_culture_comparison_4', '中西文化对比', '了解中外节日、饮食、风俗的异同（如春节 vs 圣诞节，饺子 vs 汉堡），培养跨文化理解。', 3, 1, 1768377586, 1768378289);
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (86, '英语', 5, 'ext_culture_china_story_5', '讲好中国故事', '能用简单的英语介绍中国的名胜古迹（如长城、故宫）和传统文化，这是高年级的重点。', 4, 1, 1768377586, 1768378475);
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (87, '英语', 6, 'ext_culture_china_story_6', '讲好中国故事', '能用简单的英语介绍中国的名胜古迹（如长城、故宫）和传统文化，这是高年级的重点。', 4, 1, 1768377586, 1768378504);
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (88, '英语', 3, 'ext_thinking_prediction_3', '预测与推断', '这里的阅读不仅仅是翻译，而是通过封面、插图或标题来\"预测\"故事内容，培养逻辑推理能力。', 3, 1, 1768377587, 1768378384);
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (89, '英语', 4, 'ext_thinking_prediction_4', '预测与推断', '这里的阅读不仅仅是翻译，而是通过封面、插图或标题来\"预测\"故事内容，培养逻辑推理能力。', 3, 1, 1768377587, 1768378294);
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (90, '英语', 5, 'ext_thinking_critical_5', '批判性思维', '针对课文观点表达自己的看法（如\"你同意作者吗？\"），不仅是理解，更要评价。', 5, 1, 1768377587, 1768378480);
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (91, '英语', 6, 'ext_thinking_critical_6', '批判性思维', '针对课文观点表达自己的看法（如\"你同意作者吗？\"），不仅是理解，更要评价。', 5, 1, 1768377587, 1768378508);
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (92, '英语', 2, 'ext_strategy_self_assessment_2', '自我评价', '教材每个单元末都有 Self-assessment，要求学生评估自己的掌握程度，培养自主学习习惯。', 3, 1, 1768377587, 1768378346);
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (93, '英语', 3, 'ext_strategy_self_assessment_3', '自我评价', '教材每个单元末都有 Self-assessment，要求学生评估自己的掌握程度，培养自主学习习惯。', 3, 1, 1768377587, 1768378395);
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (94, '英语', 5, 'ext_strategy_resource_5', '资源利用', '能够利用词典、网络或其他资源查找信息，而不仅仅是被动接受。', 4, 1, 1768377587, 1768378485);
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (95, '英语', 6, 'ext_strategy_resource_6', '资源利用', '能够利用词典、网络或其他资源查找信息，而不仅仅是被动接受。', 4, 1, 1768377587, 1768378513);
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (96, '英语', 1, 'ext_beauty_rhythm_1', '韵律与语感', '通过歌谣（Chants）和歌曲体会英语的重音、连读和语调，感受语言的音乐美。', 3, 1, 1768377587, 1768378324);
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (97, '英语', 2, 'ext_beauty_rhythm_2', '韵律与语感', '通过歌谣（Chants）和歌曲体会英语的重音、连读和语调，感受语言的音乐美。', 4, 1, 1768377587, 1768378354);
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (98, '英语', 3, 'ext_application_project_3', '项目式制作', '结合手工制作（如做贺卡、画海报）来应用英语，强调\"做中学\"。', 4, 1, 1768377587, 1768378430);
INSERT INTO `ah_ability` (`id`, `subject`, `grade`, `code`, `name`, `description`, `difficulty`, `is_active`, `create_time`, `update_time`) VALUES (99, '英语', 4, 'ext_application_project_4', '项目式制作 (Let\'s Make)', '结合手工制作（如做贺卡、画海报）来应用英语，强调\"做中学\"。', 3, 1, 1768377587, 1768378299);
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
INSERT INTO `ah_manager` (`id`, `username`, `password`, `token`, `type`, `status`, `create_time`, `update_time`) VALUES ('2e43712b-fe47-4870-9b45-5f7fe86ebc16', 'xiaxianlin', '$2b$12$yegUH8nSrh..RjweKYBlr.O8NRNHrwas0G2DDFt9QoYJ3ucM.oFH.', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjJlNDM3MTJiLWZlNDctNDg3MC05YjQ1LTVmN2ZlODZlYmMxNiIsInVwZGF0ZV90aW1lIjoxNzY4NTY2NDg1LCJleHAiOjE3NjkxNzEyODV9.g_LXgI_cxkgsI_ThZa9iC7kCdcTIbPyIjgzxQrFRNO8', 0, 1, 1763881750, 1768566485);
COMMIT;

-- ----------------------------
-- Table structure for ah_practice
-- ----------------------------
DROP TABLE IF EXISTS `ah_practice`;
CREATE TABLE `ah_practice` (
  `id` varchar(36) NOT NULL COMMENT '会话ID (UUID v4)',
  `student_id` varchar(255) NOT NULL COMMENT '学生ID',
  `practice_type` varchar(50) NOT NULL COMMENT '练习类型: ability_practice/unit_practice',
  `subject` varchar(50) DEFAULT NULL COMMENT '科目',
  `grade` int DEFAULT NULL COMMENT '年级',
  `ability_code` varchar(255) DEFAULT NULL COMMENT '原子能力代码列表（JSON数组）',
  `unit_id` int DEFAULT NULL COMMENT '单元ID',
  `question_count` int NOT NULL COMMENT '题目数量',
  `answer_count` int NOT NULL COMMENT '回答数量',
  `correct_count` int NOT NULL COMMENT '正确数量',
  `status` int NOT NULL COMMENT '未开始: 0, 进行中: 1, 已完成: 2, 已废弃: 3',
  `generate_status` int NOT NULL COMMENT '生成中: 0, 已完成: 1, 生成失败: -1',
  `generate_time` int DEFAULT NULL COMMENT '生成耗时(秒)',
  `start_time` int NOT NULL COMMENT '开始时间',
  `end_time` int DEFAULT NULL COMMENT '结束时间',
  `create_time` int NOT NULL COMMENT '创建时间',
  `update_time` int NOT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `ix_ah_practice_unit_id` (`unit_id`),
  KEY `ix_ah_practice_grade` (`grade`),
  KEY `ix_ah_practice_status` (`status`),
  KEY `ix_ah_practice_practice_type` (`practice_type`),
  KEY `ix_ah_practice_generate_status` (`generate_status`),
  KEY `ix_ah_practice_student_id` (`student_id`),
  KEY `ix_ah_practice_subject` (`subject`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Records of ah_practice
-- ----------------------------
BEGIN;
INSERT INTO `ah_practice` (`id`, `student_id`, `practice_type`, `subject`, `grade`, `ability_code`, `unit_id`, `question_count`, `answer_count`, `correct_count`, `status`, `generate_status`, `generate_time`, `start_time`, `end_time`, `create_time`, `update_time`) VALUES ('102e3dc9-d2bc-49ae-af09-e5d2c9adb960', 'e8cc70d2-167e-478f-875a-79def21f05cc', 'ability_practice', '英语', 1, 'en_g1_listening_0', NULL, 10, 0, 0, 0, 1, 12, 1768006528, NULL, 1768006528, 1768006541);
INSERT INTO `ah_practice` (`id`, `student_id`, `practice_type`, `subject`, `grade`, `ability_code`, `unit_id`, `question_count`, `answer_count`, `correct_count`, `status`, `generate_status`, `generate_time`, `start_time`, `end_time`, `create_time`, `update_time`) VALUES ('51b0c238-b212-452b-b1fb-1ef708e65181', 'e8cc70d2-167e-478f-875a-79def21f05cc', 'ability_practice', '语文', 1, 'cn_g1_char_distinguish', NULL, 10, 10, 7, 2, 1, 10, 1768107796, 1768108857, 1768107770, 1768108857);
INSERT INTO `ah_practice` (`id`, `student_id`, `practice_type`, `subject`, `grade`, `ability_code`, `unit_id`, `question_count`, `answer_count`, `correct_count`, `status`, `generate_status`, `generate_time`, `start_time`, `end_time`, `create_time`, `update_time`) VALUES ('71810353-65f8-40ba-996f-96b912b4ea95', 'e8cc70d2-167e-478f-875a-79def21f05cc', 'ability_practice', '语文', 3, 'cn_g3_word_context', NULL, 10, 9, 7, 1, 1, 75, 1768026388, NULL, 1768025901, 1768104962);
INSERT INTO `ah_practice` (`id`, `student_id`, `practice_type`, `subject`, `grade`, `ability_code`, `unit_id`, `question_count`, `answer_count`, `correct_count`, `status`, `generate_status`, `generate_time`, `start_time`, `end_time`, `create_time`, `update_time`) VALUES ('81ed5f35-6f3b-4d30-b032-3b7bc6876534', 'e8cc70d2-167e-478f-875a-79def21f05cc', 'ability_practice', '英语', 1, 'en_g1_letter', NULL, 10, 2, 1, 1, 1, 11, 1768005872, NULL, 1767971636, 1768022744);
INSERT INTO `ah_practice` (`id`, `student_id`, `practice_type`, `subject`, `grade`, `ability_code`, `unit_id`, `question_count`, `answer_count`, `correct_count`, `status`, `generate_status`, `generate_time`, `start_time`, `end_time`, `create_time`, `update_time`) VALUES ('873d989a-5f36-443d-84d7-2e72b8e8bdb0', 'e8cc70d2-167e-478f-875a-79def21f05cc', 'ability_practice', '语文', 3, 'cn_g3_sentence_transform', NULL, 10, 0, 0, 1, 1, 17, 1768107134, NULL, 1768107107, 1768107134);
INSERT INTO `ah_practice` (`id`, `student_id`, `practice_type`, `subject`, `grade`, `ability_code`, `unit_id`, `question_count`, `answer_count`, `correct_count`, `status`, `generate_status`, `generate_time`, `start_time`, `end_time`, `create_time`, `update_time`) VALUES ('c8743b98-4688-4b4c-9c9f-9ef62f4f89d7', 'e8cc70d2-167e-478f-875a-79def21f05cc', 'ability_practice', '语文', 1, 'cn_g1_sentence_understand', NULL, 10, 0, 0, 1, 1, 42, 1768025743, NULL, 1768025648, 1768025743);
INSERT INTO `ah_practice` (`id`, `student_id`, `practice_type`, `subject`, `grade`, `ability_code`, `unit_id`, `question_count`, `answer_count`, `correct_count`, `status`, `generate_status`, `generate_time`, `start_time`, `end_time`, `create_time`, `update_time`) VALUES ('cc565694-b885-4013-913d-c91ef0f6dbce', 'e8cc70d2-167e-478f-875a-79def21f05cc', 'ability_practice', '语文', 1, 'cn_g1_char_write', NULL, 10, 2, 2, 1, 1, 33, 1768107717, NULL, 1768107675, 1768107753);
INSERT INTO `ah_practice` (`id`, `student_id`, `practice_type`, `subject`, `grade`, `ability_code`, `unit_id`, `question_count`, `answer_count`, `correct_count`, `status`, `generate_status`, `generate_time`, `start_time`, `end_time`, `create_time`, `update_time`) VALUES ('d4acfa8b-e1b9-4a5b-9940-d3a8083f3d22', 'e8cc70d2-167e-478f-875a-79def21f05cc', 'ability_practice', '语文', 1, 'cn_g1_pinyin_read', NULL, 10, 3, 3, 1, 1, 38, 1768025590, NULL, 1768025482, 1768107658);
INSERT INTO `ah_practice` (`id`, `student_id`, `practice_type`, `subject`, `grade`, `ability_code`, `unit_id`, `question_count`, `answer_count`, `correct_count`, `status`, `generate_status`, `generate_time`, `start_time`, `end_time`, `create_time`, `update_time`) VALUES ('fc4d7051-7ba0-478a-a7ee-f3ddee20df9c', 'e8cc70d2-167e-478f-875a-79def21f05cc', 'ability_practice', '语文', 3, 'cn_g3_paragraph_summary', NULL, 10, 1, 0, 1, 1, 42, 1768105635, NULL, 1768105586, 1768105662);
COMMIT;

-- ----------------------------
-- Table structure for ah_practice_answer
-- ----------------------------
DROP TABLE IF EXISTS `ah_practice_answer`;
CREATE TABLE `ah_practice_answer` (
  `id` int NOT NULL AUTO_INCREMENT,
  `session_id` varchar(36) NOT NULL COMMENT '会话ID (UUID v4)',
  `question_id` varchar(255) NOT NULL COMMENT '题目ID',
  `student_id` varchar(255) NOT NULL COMMENT '学生ID',
  `question_order` int NOT NULL COMMENT '题目顺序',
  `answer` text COMMENT '学生答案（JSON格式）',
  `audio_url` varchar(500) DEFAULT NULL COMMENT '音频答案URL',
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
  KEY `ix_ah_practice_answer_student_id` (`student_id`),
  KEY `ix_ah_practice_answer_question_id` (`question_id`),
  KEY `ix_ah_practice_answer_session_id` (`session_id`)
) ENGINE=InnoDB AUTO_INCREMENT=139 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Records of ah_practice_answer
-- ----------------------------
BEGIN;
INSERT INTO `ah_practice_answer` (`id`, `session_id`, `question_id`, `student_id`, `question_order`, `answer`, `audio_url`, `status`, `time_spent`, `submit_time`, `correct_answer`, `analysis`, `is_corrected`, `corrected_time`, `create_time`, `update_time`) VALUES (1, '81ed5f35-6f3b-4d30-b032-3b7bc6876534', 'b753690813de70eb283e34d1c8800ec1', 'e8cc70d2-167e-478f-875a-79def21f05cc', 1, 'A', NULL, 2, 3, 1768022735, '{\"type\": \"ENG_PL_SC_01\", \"value\": \"B\", \"values\": null, \"options\": [{\"id\": \"B\", \"text\": \"A\"}], \"sub_answers\": null}', '{\"correct_answer\": {\"type\": \"ENG_PL_SC_01\", \"value\": \"B\", \"values\": null, \"options\": [{\"id\": \"B\", \"text\": \"A\"}], \"sub_answers\": null}, \"explanation\": \"大写字母A的形状是直立的，上面有一个横线，下面没有尾巴。\", \"analysis\": \"你的答案是A，但正确答案应该是B。你可能把小写字母a误认为大写字母A，这说明对大小写字母的区分还不够清晰。大写字母A是大写的形状（如：A），而小写字母a是小写的形状（如：a）。在英语中，大小写字母的形状不同，意义也不同。建议你在做这类题目时，仔细观察字母的形状和书写形式，可以多练习识别大小写字母，比如通过看课本或使用字母卡片来加强记忆。下次注意审题，看清题目要求的是‘大写’还是‘小写’，就能避免类似错误了。加油！\"}', 0, NULL, 1767971648, 1768022735);
INSERT INTO `ah_practice_answer` (`id`, `session_id`, `question_id`, `student_id`, `question_order`, `answer`, `audio_url`, `status`, `time_spent`, `submit_time`, `correct_answer`, `analysis`, `is_corrected`, `corrected_time`, `create_time`, `update_time`) VALUES (2, '81ed5f35-6f3b-4d30-b032-3b7bc6876534', '8dbf79d6d78daa59a096eac801909bf1', 'e8cc70d2-167e-478f-875a-79def21f05cc', 2, 'B', NULL, 1, 4, 1768022744, '{\"type\": \"ENG_PL_SC_01\", \"value\": \"B\", \"values\": null, \"options\": [{\"id\": \"B\", \"text\": \"E\"}], \"sub_answers\": null}', NULL, 0, NULL, 1767971648, 1768022744);
INSERT INTO `ah_practice_answer` (`id`, `session_id`, `question_id`, `student_id`, `question_order`, `answer`, `audio_url`, `status`, `time_spent`, `submit_time`, `correct_answer`, `analysis`, `is_corrected`, `corrected_time`, `create_time`, `update_time`) VALUES (3, '81ed5f35-6f3b-4d30-b032-3b7bc6876534', 'f48141aac390e50550953b8cda054900', 'e8cc70d2-167e-478f-875a-79def21f05cc', 3, NULL, NULL, 0, 0, NULL, NULL, NULL, 0, NULL, 1767971648, 1767971648);
INSERT INTO `ah_practice_answer` (`id`, `session_id`, `question_id`, `student_id`, `question_order`, `answer`, `audio_url`, `status`, `time_spent`, `submit_time`, `correct_answer`, `analysis`, `is_corrected`, `corrected_time`, `create_time`, `update_time`) VALUES (4, '81ed5f35-6f3b-4d30-b032-3b7bc6876534', '9c64683d55d3e2a13a2bf6809e8cd21d', 'e8cc70d2-167e-478f-875a-79def21f05cc', 4, NULL, NULL, 0, 0, NULL, NULL, NULL, 0, NULL, 1767971648, 1767971648);
INSERT INTO `ah_practice_answer` (`id`, `session_id`, `question_id`, `student_id`, `question_order`, `answer`, `audio_url`, `status`, `time_spent`, `submit_time`, `correct_answer`, `analysis`, `is_corrected`, `corrected_time`, `create_time`, `update_time`) VALUES (5, '81ed5f35-6f3b-4d30-b032-3b7bc6876534', '3694cfff1197f8bc409435574253a4b7', 'e8cc70d2-167e-478f-875a-79def21f05cc', 5, NULL, NULL, 0, 0, NULL, NULL, NULL, 0, NULL, 1767971648, 1767971648);
INSERT INTO `ah_practice_answer` (`id`, `session_id`, `question_id`, `student_id`, `question_order`, `answer`, `audio_url`, `status`, `time_spent`, `submit_time`, `correct_answer`, `analysis`, `is_corrected`, `corrected_time`, `create_time`, `update_time`) VALUES (6, '81ed5f35-6f3b-4d30-b032-3b7bc6876534', '6f8efecba0853da221427d2771c85162', 'e8cc70d2-167e-478f-875a-79def21f05cc', 6, NULL, NULL, 0, 0, NULL, NULL, NULL, 0, NULL, 1767971648, 1767971648);
INSERT INTO `ah_practice_answer` (`id`, `session_id`, `question_id`, `student_id`, `question_order`, `answer`, `audio_url`, `status`, `time_spent`, `submit_time`, `correct_answer`, `analysis`, `is_corrected`, `corrected_time`, `create_time`, `update_time`) VALUES (7, '81ed5f35-6f3b-4d30-b032-3b7bc6876534', 'e5065c3449ad7a1007ba5063f6d24e53', 'e8cc70d2-167e-478f-875a-79def21f05cc', 7, NULL, NULL, 0, 0, NULL, NULL, NULL, 0, NULL, 1767971648, 1767971648);
INSERT INTO `ah_practice_answer` (`id`, `session_id`, `question_id`, `student_id`, `question_order`, `answer`, `audio_url`, `status`, `time_spent`, `submit_time`, `correct_answer`, `analysis`, `is_corrected`, `corrected_time`, `create_time`, `update_time`) VALUES (8, '81ed5f35-6f3b-4d30-b032-3b7bc6876534', 'ce73ddd5b3e2f2e1f39f84db2264fd42', 'e8cc70d2-167e-478f-875a-79def21f05cc', 8, NULL, NULL, 0, 0, NULL, NULL, NULL, 0, NULL, 1767971648, 1767971648);
INSERT INTO `ah_practice_answer` (`id`, `session_id`, `question_id`, `student_id`, `question_order`, `answer`, `audio_url`, `status`, `time_spent`, `submit_time`, `correct_answer`, `analysis`, `is_corrected`, `corrected_time`, `create_time`, `update_time`) VALUES (9, '81ed5f35-6f3b-4d30-b032-3b7bc6876534', '30c9397ec36e4b20dc1666943caab33c', 'e8cc70d2-167e-478f-875a-79def21f05cc', 9, NULL, NULL, 0, 0, NULL, NULL, NULL, 0, NULL, 1767971648, 1767971648);
INSERT INTO `ah_practice_answer` (`id`, `session_id`, `question_id`, `student_id`, `question_order`, `answer`, `audio_url`, `status`, `time_spent`, `submit_time`, `correct_answer`, `analysis`, `is_corrected`, `corrected_time`, `create_time`, `update_time`) VALUES (10, '81ed5f35-6f3b-4d30-b032-3b7bc6876534', '0bec2234186fb56432064d49f534f638', 'e8cc70d2-167e-478f-875a-79def21f05cc', 10, NULL, NULL, 0, 0, NULL, NULL, NULL, 0, NULL, 1767971648, 1767971648);
INSERT INTO `ah_practice_answer` (`id`, `session_id`, `question_id`, `student_id`, `question_order`, `answer`, `audio_url`, `status`, `time_spent`, `submit_time`, `correct_answer`, `analysis`, `is_corrected`, `corrected_time`, `create_time`, `update_time`) VALUES (28, '102e3dc9-d2bc-49ae-af09-e5d2c9adb960', '3227170badc57f76e5de342da030f630', 'e8cc70d2-167e-478f-875a-79def21f05cc', 1, NULL, NULL, 0, 0, NULL, NULL, NULL, 0, NULL, 1768006541, 1768006541);
INSERT INTO `ah_practice_answer` (`id`, `session_id`, `question_id`, `student_id`, `question_order`, `answer`, `audio_url`, `status`, `time_spent`, `submit_time`, `correct_answer`, `analysis`, `is_corrected`, `corrected_time`, `create_time`, `update_time`) VALUES (29, '102e3dc9-d2bc-49ae-af09-e5d2c9adb960', '9b06f1ecb985df49774d27e2ba28161c', 'e8cc70d2-167e-478f-875a-79def21f05cc', 2, NULL, NULL, 0, 0, NULL, NULL, NULL, 0, NULL, 1768006541, 1768006541);
INSERT INTO `ah_practice_answer` (`id`, `session_id`, `question_id`, `student_id`, `question_order`, `answer`, `audio_url`, `status`, `time_spent`, `submit_time`, `correct_answer`, `analysis`, `is_corrected`, `corrected_time`, `create_time`, `update_time`) VALUES (30, '102e3dc9-d2bc-49ae-af09-e5d2c9adb960', 'c1e3b2d08e6ed480c4e18e141fb2c587', 'e8cc70d2-167e-478f-875a-79def21f05cc', 3, NULL, NULL, 0, 0, NULL, NULL, NULL, 0, NULL, 1768006541, 1768006541);
INSERT INTO `ah_practice_answer` (`id`, `session_id`, `question_id`, `student_id`, `question_order`, `answer`, `audio_url`, `status`, `time_spent`, `submit_time`, `correct_answer`, `analysis`, `is_corrected`, `corrected_time`, `create_time`, `update_time`) VALUES (31, '102e3dc9-d2bc-49ae-af09-e5d2c9adb960', '0b93bdce3d1a5f0f60a232f7f32e4350', 'e8cc70d2-167e-478f-875a-79def21f05cc', 4, NULL, NULL, 0, 0, NULL, NULL, NULL, 0, NULL, 1768006541, 1768006541);
INSERT INTO `ah_practice_answer` (`id`, `session_id`, `question_id`, `student_id`, `question_order`, `answer`, `audio_url`, `status`, `time_spent`, `submit_time`, `correct_answer`, `analysis`, `is_corrected`, `corrected_time`, `create_time`, `update_time`) VALUES (32, '102e3dc9-d2bc-49ae-af09-e5d2c9adb960', '276169081b79b3ae56ec7561ef0fd89e', 'e8cc70d2-167e-478f-875a-79def21f05cc', 5, NULL, NULL, 0, 0, NULL, NULL, NULL, 0, NULL, 1768006541, 1768006541);
INSERT INTO `ah_practice_answer` (`id`, `session_id`, `question_id`, `student_id`, `question_order`, `answer`, `audio_url`, `status`, `time_spent`, `submit_time`, `correct_answer`, `analysis`, `is_corrected`, `corrected_time`, `create_time`, `update_time`) VALUES (33, '102e3dc9-d2bc-49ae-af09-e5d2c9adb960', '0d4d2fd167370e6a10169bcbbee8f569', 'e8cc70d2-167e-478f-875a-79def21f05cc', 6, NULL, NULL, 0, 0, NULL, NULL, NULL, 0, NULL, 1768006541, 1768006541);
INSERT INTO `ah_practice_answer` (`id`, `session_id`, `question_id`, `student_id`, `question_order`, `answer`, `audio_url`, `status`, `time_spent`, `submit_time`, `correct_answer`, `analysis`, `is_corrected`, `corrected_time`, `create_time`, `update_time`) VALUES (34, '102e3dc9-d2bc-49ae-af09-e5d2c9adb960', '9425d9ade51db9ef5fba79b1f6bdfe10', 'e8cc70d2-167e-478f-875a-79def21f05cc', 7, NULL, NULL, 0, 0, NULL, NULL, NULL, 0, NULL, 1768006541, 1768006541);
INSERT INTO `ah_practice_answer` (`id`, `session_id`, `question_id`, `student_id`, `question_order`, `answer`, `audio_url`, `status`, `time_spent`, `submit_time`, `correct_answer`, `analysis`, `is_corrected`, `corrected_time`, `create_time`, `update_time`) VALUES (35, '102e3dc9-d2bc-49ae-af09-e5d2c9adb960', '736772e2c567e561e80f4d9721a68f31', 'e8cc70d2-167e-478f-875a-79def21f05cc', 8, NULL, NULL, 0, 0, NULL, NULL, NULL, 0, NULL, 1768006541, 1768006541);
INSERT INTO `ah_practice_answer` (`id`, `session_id`, `question_id`, `student_id`, `question_order`, `answer`, `audio_url`, `status`, `time_spent`, `submit_time`, `correct_answer`, `analysis`, `is_corrected`, `corrected_time`, `create_time`, `update_time`) VALUES (36, '102e3dc9-d2bc-49ae-af09-e5d2c9adb960', 'de37c9c2c7113f3179d99faf164bfdb8', 'e8cc70d2-167e-478f-875a-79def21f05cc', 9, NULL, NULL, 0, 0, NULL, NULL, NULL, 0, NULL, 1768006541, 1768006541);
INSERT INTO `ah_practice_answer` (`id`, `session_id`, `question_id`, `student_id`, `question_order`, `answer`, `audio_url`, `status`, `time_spent`, `submit_time`, `correct_answer`, `analysis`, `is_corrected`, `corrected_time`, `create_time`, `update_time`) VALUES (37, '102e3dc9-d2bc-49ae-af09-e5d2c9adb960', 'fcb08e9fada06abdb5f2e211d461733e', 'e8cc70d2-167e-478f-875a-79def21f05cc', 10, NULL, NULL, 0, 0, NULL, NULL, NULL, 0, NULL, 1768006541, 1768006541);
INSERT INTO `ah_practice_answer` (`id`, `session_id`, `question_id`, `student_id`, `question_order`, `answer`, `audio_url`, `status`, `time_spent`, `submit_time`, `correct_answer`, `analysis`, `is_corrected`, `corrected_time`, `create_time`, `update_time`) VALUES (59, 'd4acfa8b-e1b9-4a5b-9940-d3a8083f3d22', 'dcaa1c513f090748ba126772fbf4cbce', 'e8cc70d2-167e-478f-875a-79def21f05cc', 1, 'B', NULL, 1, 21, 1768025611, '{\"type\": \"CHN_PL_SC_01\", \"value\": \"B\", \"values\": null, \"options\": [{\"id\": \"B\", \"text\": \"píng guǒ\"}], \"sub_answers\": null}', NULL, 0, NULL, 1768025521, 1768025611);
INSERT INTO `ah_practice_answer` (`id`, `session_id`, `question_id`, `student_id`, `question_order`, `answer`, `audio_url`, `status`, `time_spent`, `submit_time`, `correct_answer`, `analysis`, `is_corrected`, `corrected_time`, `create_time`, `update_time`) VALUES (60, 'd4acfa8b-e1b9-4a5b-9940-d3a8083f3d22', '5fd64e18031ab54ef6fdec2c73441700', 'e8cc70d2-167e-478f-875a-79def21f05cc', 2, 'B', NULL, 1, 8, 1768107651, '{\"type\": \"CHN_PL_SC_01\", \"value\": \"B\", \"values\": null, \"options\": [{\"id\": \"B\", \"text\": \"xiǎo māo\"}], \"sub_answers\": null}', NULL, 0, NULL, 1768025521, 1768107651);
INSERT INTO `ah_practice_answer` (`id`, `session_id`, `question_id`, `student_id`, `question_order`, `answer`, `audio_url`, `status`, `time_spent`, `submit_time`, `correct_answer`, `analysis`, `is_corrected`, `corrected_time`, `create_time`, `update_time`) VALUES (61, 'd4acfa8b-e1b9-4a5b-9940-d3a8083f3d22', 'd527b8875a75b8c9f928a7c3ed2109ec', 'e8cc70d2-167e-478f-875a-79def21f05cc', 3, 'A', NULL, 1, 7, 1768107658, '{\"type\": \"CHN_PL_SC_01\", \"value\": \"A\", \"values\": null, \"options\": [{\"id\": \"A\", \"text\": \"huǒ chē\"}], \"sub_answers\": null}', NULL, 0, NULL, 1768025521, 1768107658);
INSERT INTO `ah_practice_answer` (`id`, `session_id`, `question_id`, `student_id`, `question_order`, `answer`, `audio_url`, `status`, `time_spent`, `submit_time`, `correct_answer`, `analysis`, `is_corrected`, `corrected_time`, `create_time`, `update_time`) VALUES (62, 'd4acfa8b-e1b9-4a5b-9940-d3a8083f3d22', 'c89be6d9b9347e37bff856d6ac01cca1', 'e8cc70d2-167e-478f-875a-79def21f05cc', 4, NULL, NULL, 0, 0, NULL, NULL, NULL, 0, NULL, 1768025521, 1768025521);
INSERT INTO `ah_practice_answer` (`id`, `session_id`, `question_id`, `student_id`, `question_order`, `answer`, `audio_url`, `status`, `time_spent`, `submit_time`, `correct_answer`, `analysis`, `is_corrected`, `corrected_time`, `create_time`, `update_time`) VALUES (63, 'd4acfa8b-e1b9-4a5b-9940-d3a8083f3d22', 'de3387bdaa1143537b2f82dabcbc6f52', 'e8cc70d2-167e-478f-875a-79def21f05cc', 5, NULL, NULL, 0, 0, NULL, NULL, NULL, 0, NULL, 1768025521, 1768025521);
INSERT INTO `ah_practice_answer` (`id`, `session_id`, `question_id`, `student_id`, `question_order`, `answer`, `audio_url`, `status`, `time_spent`, `submit_time`, `correct_answer`, `analysis`, `is_corrected`, `corrected_time`, `create_time`, `update_time`) VALUES (64, 'd4acfa8b-e1b9-4a5b-9940-d3a8083f3d22', '666f72a41f94a424f5481b7d78e732ce', 'e8cc70d2-167e-478f-875a-79def21f05cc', 6, NULL, NULL, 0, 0, NULL, NULL, NULL, 0, NULL, 1768025521, 1768025521);
INSERT INTO `ah_practice_answer` (`id`, `session_id`, `question_id`, `student_id`, `question_order`, `answer`, `audio_url`, `status`, `time_spent`, `submit_time`, `correct_answer`, `analysis`, `is_corrected`, `corrected_time`, `create_time`, `update_time`) VALUES (65, 'd4acfa8b-e1b9-4a5b-9940-d3a8083f3d22', '8b5fbd57d3b789857715d25538148ad3', 'e8cc70d2-167e-478f-875a-79def21f05cc', 7, NULL, NULL, 0, 0, NULL, NULL, NULL, 0, NULL, 1768025521, 1768025521);
INSERT INTO `ah_practice_answer` (`id`, `session_id`, `question_id`, `student_id`, `question_order`, `answer`, `audio_url`, `status`, `time_spent`, `submit_time`, `correct_answer`, `analysis`, `is_corrected`, `corrected_time`, `create_time`, `update_time`) VALUES (66, 'd4acfa8b-e1b9-4a5b-9940-d3a8083f3d22', 'dd20a3de094202aece7d7e847595d786', 'e8cc70d2-167e-478f-875a-79def21f05cc', 8, NULL, NULL, 0, 0, NULL, NULL, NULL, 0, NULL, 1768025521, 1768025521);
INSERT INTO `ah_practice_answer` (`id`, `session_id`, `question_id`, `student_id`, `question_order`, `answer`, `audio_url`, `status`, `time_spent`, `submit_time`, `correct_answer`, `analysis`, `is_corrected`, `corrected_time`, `create_time`, `update_time`) VALUES (67, 'd4acfa8b-e1b9-4a5b-9940-d3a8083f3d22', '8ceaba88549cc18926264637f28f97dc', 'e8cc70d2-167e-478f-875a-79def21f05cc', 9, NULL, NULL, 0, 0, NULL, NULL, NULL, 0, NULL, 1768025521, 1768025521);
INSERT INTO `ah_practice_answer` (`id`, `session_id`, `question_id`, `student_id`, `question_order`, `answer`, `audio_url`, `status`, `time_spent`, `submit_time`, `correct_answer`, `analysis`, `is_corrected`, `corrected_time`, `create_time`, `update_time`) VALUES (68, 'd4acfa8b-e1b9-4a5b-9940-d3a8083f3d22', '922df02ef41b57c9215b1d883812c9cb', 'e8cc70d2-167e-478f-875a-79def21f05cc', 10, NULL, NULL, 0, 0, NULL, NULL, NULL, 0, NULL, 1768025521, 1768025521);
INSERT INTO `ah_practice_answer` (`id`, `session_id`, `question_id`, `student_id`, `question_order`, `answer`, `audio_url`, `status`, `time_spent`, `submit_time`, `correct_answer`, `analysis`, `is_corrected`, `corrected_time`, `create_time`, `update_time`) VALUES (69, 'c8743b98-4688-4b4c-9c9f-9ef62f4f89d7', '8a2324c6d6c4c8bb6b3856dd2de7fd8e', 'e8cc70d2-167e-478f-875a-79def21f05cc', 1, NULL, NULL, 0, 0, NULL, NULL, NULL, 0, NULL, 1768025691, 1768025691);
INSERT INTO `ah_practice_answer` (`id`, `session_id`, `question_id`, `student_id`, `question_order`, `answer`, `audio_url`, `status`, `time_spent`, `submit_time`, `correct_answer`, `analysis`, `is_corrected`, `corrected_time`, `create_time`, `update_time`) VALUES (70, 'c8743b98-4688-4b4c-9c9f-9ef62f4f89d7', '22c5a6617e57cb4d380817752c1aa7e9', 'e8cc70d2-167e-478f-875a-79def21f05cc', 2, NULL, NULL, 0, 0, NULL, NULL, NULL, 0, NULL, 1768025691, 1768025691);
INSERT INTO `ah_practice_answer` (`id`, `session_id`, `question_id`, `student_id`, `question_order`, `answer`, `audio_url`, `status`, `time_spent`, `submit_time`, `correct_answer`, `analysis`, `is_corrected`, `corrected_time`, `create_time`, `update_time`) VALUES (71, 'c8743b98-4688-4b4c-9c9f-9ef62f4f89d7', 'e8ff12f639a10f67df461c644aad0811', 'e8cc70d2-167e-478f-875a-79def21f05cc', 3, NULL, NULL, 0, 0, NULL, NULL, NULL, 0, NULL, 1768025691, 1768025691);
INSERT INTO `ah_practice_answer` (`id`, `session_id`, `question_id`, `student_id`, `question_order`, `answer`, `audio_url`, `status`, `time_spent`, `submit_time`, `correct_answer`, `analysis`, `is_corrected`, `corrected_time`, `create_time`, `update_time`) VALUES (72, 'c8743b98-4688-4b4c-9c9f-9ef62f4f89d7', '4a27e4288d081e050dc7571fef7240e9', 'e8cc70d2-167e-478f-875a-79def21f05cc', 4, NULL, NULL, 0, 0, NULL, NULL, NULL, 0, NULL, 1768025691, 1768025691);
INSERT INTO `ah_practice_answer` (`id`, `session_id`, `question_id`, `student_id`, `question_order`, `answer`, `audio_url`, `status`, `time_spent`, `submit_time`, `correct_answer`, `analysis`, `is_corrected`, `corrected_time`, `create_time`, `update_time`) VALUES (73, 'c8743b98-4688-4b4c-9c9f-9ef62f4f89d7', '6d552be219be356c8b8e4c07e9366a5c', 'e8cc70d2-167e-478f-875a-79def21f05cc', 5, NULL, NULL, 0, 0, NULL, NULL, NULL, 0, NULL, 1768025691, 1768025691);
INSERT INTO `ah_practice_answer` (`id`, `session_id`, `question_id`, `student_id`, `question_order`, `answer`, `audio_url`, `status`, `time_spent`, `submit_time`, `correct_answer`, `analysis`, `is_corrected`, `corrected_time`, `create_time`, `update_time`) VALUES (74, 'c8743b98-4688-4b4c-9c9f-9ef62f4f89d7', 'ddc9ab6ce46440adc812e9ab52b12762', 'e8cc70d2-167e-478f-875a-79def21f05cc', 6, NULL, NULL, 0, 0, NULL, NULL, NULL, 0, NULL, 1768025691, 1768025691);
INSERT INTO `ah_practice_answer` (`id`, `session_id`, `question_id`, `student_id`, `question_order`, `answer`, `audio_url`, `status`, `time_spent`, `submit_time`, `correct_answer`, `analysis`, `is_corrected`, `corrected_time`, `create_time`, `update_time`) VALUES (75, 'c8743b98-4688-4b4c-9c9f-9ef62f4f89d7', '5e809f93ff3b9c1fbebe6c53dad02d33', 'e8cc70d2-167e-478f-875a-79def21f05cc', 7, NULL, NULL, 0, 0, NULL, NULL, NULL, 0, NULL, 1768025691, 1768025691);
INSERT INTO `ah_practice_answer` (`id`, `session_id`, `question_id`, `student_id`, `question_order`, `answer`, `audio_url`, `status`, `time_spent`, `submit_time`, `correct_answer`, `analysis`, `is_corrected`, `corrected_time`, `create_time`, `update_time`) VALUES (76, 'c8743b98-4688-4b4c-9c9f-9ef62f4f89d7', '7c515814119299c84aafe5f2db54124c', 'e8cc70d2-167e-478f-875a-79def21f05cc', 8, NULL, NULL, 0, 0, NULL, NULL, NULL, 0, NULL, 1768025691, 1768025691);
INSERT INTO `ah_practice_answer` (`id`, `session_id`, `question_id`, `student_id`, `question_order`, `answer`, `audio_url`, `status`, `time_spent`, `submit_time`, `correct_answer`, `analysis`, `is_corrected`, `corrected_time`, `create_time`, `update_time`) VALUES (77, 'c8743b98-4688-4b4c-9c9f-9ef62f4f89d7', 'df188d9f5fabaa47f8fe41f45991b17b', 'e8cc70d2-167e-478f-875a-79def21f05cc', 9, NULL, NULL, 0, 0, NULL, NULL, NULL, 0, NULL, 1768025691, 1768025691);
INSERT INTO `ah_practice_answer` (`id`, `session_id`, `question_id`, `student_id`, `question_order`, `answer`, `audio_url`, `status`, `time_spent`, `submit_time`, `correct_answer`, `analysis`, `is_corrected`, `corrected_time`, `create_time`, `update_time`) VALUES (78, 'c8743b98-4688-4b4c-9c9f-9ef62f4f89d7', 'e24ca88231abd74124f211fd05b1c04f', 'e8cc70d2-167e-478f-875a-79def21f05cc', 10, NULL, NULL, 0, 0, NULL, NULL, NULL, 0, NULL, 1768025692, 1768025692);
INSERT INTO `ah_practice_answer` (`id`, `session_id`, `question_id`, `student_id`, `question_order`, `answer`, `audio_url`, `status`, `time_spent`, `submit_time`, `correct_answer`, `analysis`, `is_corrected`, `corrected_time`, `create_time`, `update_time`) VALUES (79, '71810353-65f8-40ba-996f-96b912b4ea95', '7f22197b6a33f999e7ed6b4d01a5851d', 'e8cc70d2-167e-478f-875a-79def21f05cc', 1, '[{\"sub_id\": \"q1\", \"value\": \"C\"}, {\"sub_id\": \"q2\", \"value\": \"C\"}]', NULL, 2, 4, 1768050790, '{\"type\": \"composite\", \"value\": null, \"values\": null, \"options\": null, \"sub_answers\": [{\"sub_id\": \"q1\", \"is_correct\": false, \"type\": \"single_choice\", \"value\": \"A\", \"values\": null, \"options\": [{\"id\": \"A\", \"text\": \"小兔和小鸟\"}], \"sub_answers\": null}, {\"sub_id\": \"q2\", \"is_correct\": false, \"type\": \"single_choice\", \"value\": \"B\", \"values\": null, \"options\": [{\"id\": \"B\", \"text\": \"在找胡萝卜\"}], \"sub_answers\": null}]}', '{\"correct_answer\": {\"type\": \"composite\", \"value\": null, \"values\": null, \"options\": null, \"sub_answers\": [{\"sub_id\": \"q1\", \"is_correct\": false, \"type\": \"single_choice\", \"value\": \"A\", \"values\": null, \"options\": [{\"id\": \"A\", \"text\": \"小兔和小鸟\"}], \"sub_answers\": null}, {\"sub_id\": \"q2\", \"is_correct\": false, \"type\": \"single_choice\", \"value\": \"B\", \"values\": null, \"options\": [{\"id\": \"B\", \"text\": \"在找胡萝卜\"}], \"sub_answers\": null}]}, \"explanation\": \"第一题答案是小兔和小鸟；第二题答案是小兔在找胡萝卜。两个问题都基于短文内容直接回答。\", \"analysis\": \"你的答案有误。题目描述小兔看到小鸟唱歌和蝴蝶飞舞，因此它开心地笑了。这表明小兔的情绪与看到的景象有关，选项C可能表示与情境不符的内容（如小兔不开心或没有看到这些动物）。请重新审题，注意理解小兔心情变化的原因。建议仔细阅读句子中的关键词，如‘看见’‘开心地笑了’，帮助判断正确选项。下次答题时，可以先圈出关键信息，再对比选项，避免因粗心出错。加油！\"}', 0, NULL, 1768025977, 1768050790);
INSERT INTO `ah_practice_answer` (`id`, `session_id`, `question_id`, `student_id`, `question_order`, `answer`, `audio_url`, `status`, `time_spent`, `submit_time`, `correct_answer`, `analysis`, `is_corrected`, `corrected_time`, `create_time`, `update_time`) VALUES (80, '71810353-65f8-40ba-996f-96b912b4ea95', '89d5e8ea4a382d14b310241840fc2160', 'e8cc70d2-167e-478f-875a-79def21f05cc', 2, '[{\"sub_id\": \"q1\", \"value\": \"B\"}, {\"sub_id\": \"q2\", \"value\": \"B\"}]', NULL, 1, 3, 1768049314, '{\"type\": \"composite\", \"value\": null, \"values\": null, \"options\": null, \"sub_answers\": [{\"sub_id\": \"q1\", \"is_correct\": true, \"type\": \"single_choice\", \"value\": \"B\", \"values\": null, \"options\": [{\"id\": \"B\", \"text\": \"在河边\"}], \"sub_answers\": null}, {\"sub_id\": \"q2\", \"is_correct\": true, \"type\": \"single_choice\", \"value\": \"B\", \"values\": null, \"options\": [{\"id\": \"B\", \"text\": \"肥皂\"}], \"sub_answers\": null}]}', NULL, 0, NULL, 1768025977, 1768049314);
INSERT INTO `ah_practice_answer` (`id`, `session_id`, `question_id`, `student_id`, `question_order`, `answer`, `audio_url`, `status`, `time_spent`, `submit_time`, `correct_answer`, `analysis`, `is_corrected`, `corrected_time`, `create_time`, `update_time`) VALUES (81, '71810353-65f8-40ba-996f-96b912b4ea95', '7bdfce2c4641421997610b4009cd2a57', 'e8cc70d2-167e-478f-875a-79def21f05cc', 3, '[{\"sub_id\": \"q1\", \"value\": \"A\"}, {\"sub_id\": \"q2\", \"value\": \"C\"}]', NULL, 2, 13, 1768049333, '{\"type\": \"composite\", \"value\": null, \"values\": null, \"options\": null, \"sub_answers\": [{\"sub_id\": \"q1\", \"is_correct\": true, \"type\": \"single_choice\", \"value\": \"A\", \"values\": null, \"options\": [{\"id\": \"A\", \"text\": \"在树上\"}], \"sub_answers\": null}, {\"sub_id\": \"q2\", \"is_correct\": false, \"type\": \"single_choice\", \"value\": \"B\", \"values\": null, \"options\": [{\"id\": \"B\", \"text\": \"送给妈妈\"}], \"sub_answers\": null}]}', '{\"correct_answer\": {\"type\": \"composite\", \"value\": null, \"values\": null, \"options\": null, \"sub_answers\": [{\"sub_id\": \"q1\", \"is_correct\": true, \"type\": \"single_choice\", \"value\": \"A\", \"values\": null, \"options\": [{\"id\": \"A\", \"text\": \"在树上\"}], \"sub_answers\": null}, {\"sub_id\": \"q2\", \"is_correct\": false, \"type\": \"single_choice\", \"value\": \"B\", \"values\": null, \"options\": [{\"id\": \"B\", \"text\": \"送给妈妈\"}], \"sub_answers\": null}]}, \"explanation\": \"第一题答案是‘在树上’，第二题答案是‘送给妈妈’，两题均基于短文内容直接提取。\", \"analysis\": \"学生的答案有误。题目要求选择小猴的行为体现的品质，参考答案为A、B，而学生选择了A、C，其中C选项不符合题意。小猴给妈妈送香蕉体现了懂事和孝顺，应选对应选项。学生可能因审题不清或对选项含义理解偏差导致错误。建议仔细阅读题目，明确关键词如‘懂事’所对应的正确行为。今后可尝试用圈画关键词的方法帮助理解题意，避免因粗心出错。\"}', 0, NULL, 1768025977, 1768049333);
INSERT INTO `ah_practice_answer` (`id`, `session_id`, `question_id`, `student_id`, `question_order`, `answer`, `audio_url`, `status`, `time_spent`, `submit_time`, `correct_answer`, `analysis`, `is_corrected`, `corrected_time`, `create_time`, `update_time`) VALUES (82, '71810353-65f8-40ba-996f-96b912b4ea95', 'b951bb6c97c7dd9cd8d345f9a7a56b75', 'e8cc70d2-167e-478f-875a-79def21f05cc', 4, '[{\"sub_id\": \"q1\", \"value\": \"B\"}, {\"sub_id\": \"q2\", \"value\": \"B\"}, {\"sub_id\": \"q3\", \"value\": \"B\"}]', NULL, 1, 28, 1768049386, '{\"type\": \"composite\", \"value\": null, \"values\": null, \"options\": null, \"sub_answers\": [{\"sub_id\": \"q1\", \"is_correct\": true, \"type\": \"single_choice\", \"value\": \"B\", \"values\": null, \"options\": [{\"id\": \"B\", \"text\": \"七点\"}], \"sub_answers\": null}, {\"sub_id\": \"q2\", \"is_correct\": true, \"type\": \"single_choice\", \"value\": \"B\", \"values\": null, \"options\": [{\"id\": \"B\", \"text\": \"厨房\"}], \"sub_answers\": null}, {\"sub_id\": \"q3\", \"is_correct\": true, \"type\": \"single_choice\", \"value\": \"B\", \"values\": null, \"options\": [{\"id\": \"B\", \"text\": \"马路对面\"}], \"sub_answers\": null}]}', NULL, 0, NULL, 1768025977, 1768049386);
INSERT INTO `ah_practice_answer` (`id`, `session_id`, `question_id`, `student_id`, `question_order`, `answer`, `audio_url`, `status`, `time_spent`, `submit_time`, `correct_answer`, `analysis`, `is_corrected`, `corrected_time`, `create_time`, `update_time`) VALUES (83, '71810353-65f8-40ba-996f-96b912b4ea95', 'ff6c00d8b88a97bc086d50fceefb61a6', 'e8cc70d2-167e-478f-875a-79def21f05cc', 5, '[{\"sub_id\": \"q1\", \"value\": \"C\"}, {\"sub_id\": \"q2\", \"value\": \"B\"}, {\"sub_id\": \"q3\", \"value\": \"B\"}]', NULL, 1, 28, 1768049413, '{\"type\": \"composite\", \"value\": null, \"values\": null, \"options\": null, \"sub_answers\": [{\"sub_id\": \"q1\", \"is_correct\": true, \"type\": \"single_choice\", \"value\": \"C\", \"values\": null, \"options\": [{\"id\": \"C\", \"text\": \"星期三\"}], \"sub_answers\": null}, {\"sub_id\": \"q2\", \"is_correct\": true, \"type\": \"single_choice\", \"value\": \"B\", \"values\": null, \"options\": [{\"id\": \"B\", \"text\": \"小兔子\"}], \"sub_answers\": null}, {\"sub_id\": \"q3\", \"is_correct\": true, \"type\": \"single_choice\", \"value\": \"B\", \"values\": null, \"options\": [{\"id\": \"B\", \"text\": \"画画\"}], \"sub_answers\": null}]}', NULL, 0, NULL, 1768025977, 1768049413);
INSERT INTO `ah_practice_answer` (`id`, `session_id`, `question_id`, `student_id`, `question_order`, `answer`, `audio_url`, `status`, `time_spent`, `submit_time`, `correct_answer`, `analysis`, `is_corrected`, `corrected_time`, `create_time`, `update_time`) VALUES (84, '71810353-65f8-40ba-996f-96b912b4ea95', '6c30fb3191da6735a57e746875d3945e', 'e8cc70d2-167e-478f-875a-79def21f05cc', 6, '[{\"sub_id\": \"q1\", \"value\": \"B\"}, {\"sub_id\": \"q2\", \"value\": \"B\"}, {\"sub_id\": \"q3\", \"value\": \"B\"}]', NULL, 1, 14, 1768049427, '{\"type\": \"composite\", \"value\": null, \"values\": null, \"options\": null, \"sub_answers\": [{\"sub_id\": \"q1\", \"is_correct\": true, \"type\": \"single_choice\", \"value\": \"B\", \"values\": null, \"options\": [{\"id\": \"B\", \"text\": \"小红\"}], \"sub_answers\": null}, {\"sub_id\": \"q2\", \"is_correct\": true, \"type\": \"single_choice\", \"value\": \"B\", \"values\": null, \"options\": [{\"id\": \"B\", \"text\": \"西红柿、胡萝卜和鸡蛋\"}], \"sub_answers\": null}, {\"sub_id\": \"q3\", \"is_correct\": true, \"type\": \"single_choice\", \"value\": \"B\", \"values\": null, \"options\": [{\"id\": \"B\", \"text\": \"番茄炒蛋\"}], \"sub_answers\": null}]}', NULL, 0, NULL, 1768025977, 1768049427);
INSERT INTO `ah_practice_answer` (`id`, `session_id`, `question_id`, `student_id`, `question_order`, `answer`, `audio_url`, `status`, `time_spent`, `submit_time`, `correct_answer`, `analysis`, `is_corrected`, `corrected_time`, `create_time`, `update_time`) VALUES (85, '71810353-65f8-40ba-996f-96b912b4ea95', '44d27a20011929169378df4695c05b76', 'e8cc70d2-167e-478f-875a-79def21f05cc', 7, '[{\"sub_id\": \"q1\", \"value\": \"B\"}, {\"sub_id\": \"q2\", \"value\": \"B\"}, {\"sub_id\": \"q3\", \"value\": \"B\"}]', NULL, 1, 14, 1768049441, '{\"type\": \"composite\", \"value\": null, \"values\": null, \"options\": null, \"sub_answers\": [{\"sub_id\": \"q1\", \"is_correct\": true, \"type\": \"single_choice\", \"value\": \"B\", \"values\": null, \"options\": [{\"id\": \"B\", \"text\": \"爸爸\"}], \"sub_answers\": null}, {\"sub_id\": \"q2\", \"is_correct\": true, \"type\": \"single_choice\", \"value\": \"B\", \"values\": null, \"options\": [{\"id\": \"B\", \"text\": \"风筝\"}], \"sub_answers\": null}, {\"sub_id\": \"q3\", \"is_correct\": true, \"type\": \"single_choice\", \"value\": \"B\", \"values\": null, \"options\": [{\"id\": \"B\", \"text\": \"飞得最高\"}], \"sub_answers\": null}]}', NULL, 0, NULL, 1768025977, 1768049441);
INSERT INTO `ah_practice_answer` (`id`, `session_id`, `question_id`, `student_id`, `question_order`, `answer`, `audio_url`, `status`, `time_spent`, `submit_time`, `correct_answer`, `analysis`, `is_corrected`, `corrected_time`, `create_time`, `update_time`) VALUES (86, '71810353-65f8-40ba-996f-96b912b4ea95', '5388e1c56784c8f6f63fba68e1c89b76', 'e8cc70d2-167e-478f-875a-79def21f05cc', 8, '[{\"sub_id\": \"q1\", \"value\": \"B\"}, {\"sub_id\": \"q2\", \"value\": \"B\"}, {\"sub_id\": \"q3\", \"value\": \"B\"}]', NULL, 1, 32, 1768049472, '{\"type\": \"composite\", \"value\": null, \"values\": null, \"options\": null, \"sub_answers\": [{\"sub_id\": \"q1\", \"is_correct\": true, \"type\": \"single_choice\", \"value\": \"B\", \"values\": null, \"options\": [{\"id\": \"B\", \"text\": \"教室\"}], \"sub_answers\": null}, {\"sub_id\": \"q2\", \"is_correct\": true, \"type\": \"single_choice\", \"value\": \"B\", \"values\": null, \"options\": [{\"id\": \"B\", \"text\": \"小熊找朋友\"}], \"sub_answers\": null}, {\"sub_id\": \"q3\", \"is_correct\": true, \"type\": \"single_choice\", \"value\": \"B\", \"values\": null, \"options\": [{\"id\": \"B\", \"text\": \"老师\"}], \"sub_answers\": null}]}', NULL, 0, NULL, 1768025977, 1768049472);
INSERT INTO `ah_practice_answer` (`id`, `session_id`, `question_id`, `student_id`, `question_order`, `answer`, `audio_url`, `status`, `time_spent`, `submit_time`, `correct_answer`, `analysis`, `is_corrected`, `corrected_time`, `create_time`, `update_time`) VALUES (87, '71810353-65f8-40ba-996f-96b912b4ea95', 'ace6690ea8aa89dac794c91b2082c658', 'e8cc70d2-167e-478f-875a-79def21f05cc', 9, '一个小男孩在草坪放风筝，有一只小狗也在一起玩耍', NULL, 1, 2, 1768104962, '{\"type\": \"CHN_PL_TI_02_1\", \"value\": null, \"values\": [], \"options\": null, \"sub_answers\": null}', '{\"correct_answer\": {\"type\": \"CHN_PL_TI_02_1\", \"value\": null, \"values\": [], \"options\": null, \"sub_answers\": null}, \"explanation\": null, \"analysis\": \"太棒了！你回答得非常清楚，说得完全对呢！一个小男孩在草坪放风筝，还有小狗一起玩，画面真温馨。继续保持，你真是个细心的小观察家！\"}', 0, NULL, 1768025977, 1768104962);
INSERT INTO `ah_practice_answer` (`id`, `session_id`, `question_id`, `student_id`, `question_order`, `answer`, `audio_url`, `status`, `time_spent`, `submit_time`, `correct_answer`, `analysis`, `is_corrected`, `corrected_time`, `create_time`, `update_time`) VALUES (88, '71810353-65f8-40ba-996f-96b912b4ea95', '61fe3086e89aeb4e1990d49b65e00664', 'e8cc70d2-167e-478f-875a-79def21f05cc', 10, NULL, NULL, 0, 0, NULL, NULL, NULL, 0, NULL, 1768025977, 1768025977);
INSERT INTO `ah_practice_answer` (`id`, `session_id`, `question_id`, `student_id`, `question_order`, `answer`, `audio_url`, `status`, `time_spent`, `submit_time`, `correct_answer`, `analysis`, `is_corrected`, `corrected_time`, `create_time`, `update_time`) VALUES (89, 'fc4d7051-7ba0-478a-a7ee-f3ddee20df9c', '9a5b0eab55be3684dff8b39c50b1408e', 'e8cc70d2-167e-478f-875a-79def21f05cc', 1, '[{\"sub_id\": \"q1\", \"value\": \"B\"}, {\"sub_id\": \"q2\", \"value\": \"B\"}, {\"sub_id\": \"q3\", \"value\": \"B\"}]', NULL, 2, 25, 1768105662, '{\"type\": \"composite\", \"value\": null, \"values\": null, \"options\": null, \"sub_answers\": [{\"sub_id\": \"q1\", \"is_correct\": true, \"type\": \"single_choice\", \"value\": \"B\", \"values\": null, \"options\": [{\"id\": \"B\", \"text\": \"八点\"}], \"sub_answers\": null}, {\"sub_id\": \"q2\", \"is_correct\": true, \"type\": \"single_choice\", \"value\": \"B\", \"values\": null, \"options\": [{\"id\": \"B\", \"text\": \"蓝色\"}], \"sub_answers\": null}, {\"sub_id\": \"q3\", \"is_correct\": false, \"type\": \"single_choice\", \"value\": \"C\", \"values\": null, \"options\": [{\"id\": \"C\", \"text\": \"学校门口\"}], \"sub_answers\": null}]}', '{\"correct_answer\": {\"type\": \"composite\", \"value\": null, \"values\": null, \"options\": null, \"sub_answers\": [{\"sub_id\": \"q1\", \"is_correct\": true, \"type\": \"single_choice\", \"value\": \"B\", \"values\": null, \"options\": [{\"id\": \"B\", \"text\": \"八点\"}], \"sub_answers\": null}, {\"sub_id\": \"q2\", \"is_correct\": true, \"type\": \"single_choice\", \"value\": \"B\", \"values\": null, \"options\": [{\"id\": \"B\", \"text\": \"蓝色\"}], \"sub_answers\": null}, {\"sub_id\": \"q3\", \"is_correct\": false, \"type\": \"single_choice\", \"value\": \"C\", \"values\": null, \"options\": [{\"id\": \"C\", \"text\": \"学校门口\"}], \"sub_answers\": null}]}, \"explanation\": \"本题考查学生对时间、人物穿着和事件地点的基本信息提取能力。\", \"analysis\": \"你的答案存在错误。根据题目描述，小明穿的是蓝色校服、背红色书包，与小红一起进教室上语文课。但你选择了三个\'B\'，而参考答案应为对应题目的正确选项（如：第一题可能考察人物关系，第二题考察物品颜色，第三题考察事件顺序）。你可能因审题不清或混淆了信息导致误选。建议仔细阅读每道题的提问内容，明确关键词（如‘蓝色’‘红色’‘一起’），并结合原文逐句分析。下次可尝试用笔圈出关键信息，避免遗漏细节。加油，继续努力！\"}', 0, NULL, 1768105630, 1768105662);
INSERT INTO `ah_practice_answer` (`id`, `session_id`, `question_id`, `student_id`, `question_order`, `answer`, `audio_url`, `status`, `time_spent`, `submit_time`, `correct_answer`, `analysis`, `is_corrected`, `corrected_time`, `create_time`, `update_time`) VALUES (90, 'fc4d7051-7ba0-478a-a7ee-f3ddee20df9c', '340131dfcf9a12dee0ac4f509355c9ba', 'e8cc70d2-167e-478f-875a-79def21f05cc', 2, NULL, NULL, 0, 0, NULL, NULL, NULL, 0, NULL, 1768105630, 1768105630);
INSERT INTO `ah_practice_answer` (`id`, `session_id`, `question_id`, `student_id`, `question_order`, `answer`, `audio_url`, `status`, `time_spent`, `submit_time`, `correct_answer`, `analysis`, `is_corrected`, `corrected_time`, `create_time`, `update_time`) VALUES (91, 'fc4d7051-7ba0-478a-a7ee-f3ddee20df9c', '169a25e5e769b89b2516fef09fa6db70', 'e8cc70d2-167e-478f-875a-79def21f05cc', 3, NULL, NULL, 0, 0, NULL, NULL, NULL, 0, NULL, 1768105630, 1768105630);
INSERT INTO `ah_practice_answer` (`id`, `session_id`, `question_id`, `student_id`, `question_order`, `answer`, `audio_url`, `status`, `time_spent`, `submit_time`, `correct_answer`, `analysis`, `is_corrected`, `corrected_time`, `create_time`, `update_time`) VALUES (92, 'fc4d7051-7ba0-478a-a7ee-f3ddee20df9c', 'b500da44238069a7301e9a7198b9a9a4', 'e8cc70d2-167e-478f-875a-79def21f05cc', 4, NULL, NULL, 0, 0, NULL, NULL, NULL, 0, NULL, 1768105630, 1768105630);
INSERT INTO `ah_practice_answer` (`id`, `session_id`, `question_id`, `student_id`, `question_order`, `answer`, `audio_url`, `status`, `time_spent`, `submit_time`, `correct_answer`, `analysis`, `is_corrected`, `corrected_time`, `create_time`, `update_time`) VALUES (93, 'fc4d7051-7ba0-478a-a7ee-f3ddee20df9c', '1a0729217a544cb9af1b7d140646b164', 'e8cc70d2-167e-478f-875a-79def21f05cc', 5, NULL, NULL, 0, 0, NULL, NULL, NULL, 0, NULL, 1768105630, 1768105630);
INSERT INTO `ah_practice_answer` (`id`, `session_id`, `question_id`, `student_id`, `question_order`, `answer`, `audio_url`, `status`, `time_spent`, `submit_time`, `correct_answer`, `analysis`, `is_corrected`, `corrected_time`, `create_time`, `update_time`) VALUES (94, 'fc4d7051-7ba0-478a-a7ee-f3ddee20df9c', '54dae08a2baa7aecf70358a22d6af9a2', 'e8cc70d2-167e-478f-875a-79def21f05cc', 6, NULL, NULL, 0, 0, NULL, NULL, NULL, 0, NULL, 1768105630, 1768105630);
INSERT INTO `ah_practice_answer` (`id`, `session_id`, `question_id`, `student_id`, `question_order`, `answer`, `audio_url`, `status`, `time_spent`, `submit_time`, `correct_answer`, `analysis`, `is_corrected`, `corrected_time`, `create_time`, `update_time`) VALUES (95, 'fc4d7051-7ba0-478a-a7ee-f3ddee20df9c', '9b53bbe2731b6493efe85002b5dc7a3f', 'e8cc70d2-167e-478f-875a-79def21f05cc', 7, NULL, NULL, 0, 0, NULL, NULL, NULL, 0, NULL, 1768105630, 1768105630);
INSERT INTO `ah_practice_answer` (`id`, `session_id`, `question_id`, `student_id`, `question_order`, `answer`, `audio_url`, `status`, `time_spent`, `submit_time`, `correct_answer`, `analysis`, `is_corrected`, `corrected_time`, `create_time`, `update_time`) VALUES (96, 'fc4d7051-7ba0-478a-a7ee-f3ddee20df9c', '1f424d7a6544b7e93680b5aa67193e4f', 'e8cc70d2-167e-478f-875a-79def21f05cc', 8, NULL, NULL, 0, 0, NULL, NULL, NULL, 0, NULL, 1768105630, 1768105630);
INSERT INTO `ah_practice_answer` (`id`, `session_id`, `question_id`, `student_id`, `question_order`, `answer`, `audio_url`, `status`, `time_spent`, `submit_time`, `correct_answer`, `analysis`, `is_corrected`, `corrected_time`, `create_time`, `update_time`) VALUES (97, 'fc4d7051-7ba0-478a-a7ee-f3ddee20df9c', '93d00c709ae20f55a6700a09e581543d', 'e8cc70d2-167e-478f-875a-79def21f05cc', 9, NULL, NULL, 0, 0, NULL, NULL, NULL, 0, NULL, 1768105630, 1768105630);
INSERT INTO `ah_practice_answer` (`id`, `session_id`, `question_id`, `student_id`, `question_order`, `answer`, `audio_url`, `status`, `time_spent`, `submit_time`, `correct_answer`, `analysis`, `is_corrected`, `corrected_time`, `create_time`, `update_time`) VALUES (98, 'fc4d7051-7ba0-478a-a7ee-f3ddee20df9c', 'ad4341c88839778cff6d25884cf05ba2', 'e8cc70d2-167e-478f-875a-79def21f05cc', 10, NULL, NULL, 0, 0, NULL, NULL, NULL, 0, NULL, 1768105630, 1768105630);
INSERT INTO `ah_practice_answer` (`id`, `session_id`, `question_id`, `student_id`, `question_order`, `answer`, `audio_url`, `status`, `time_spent`, `submit_time`, `correct_answer`, `analysis`, `is_corrected`, `corrected_time`, `create_time`, `update_time`) VALUES (109, '873d989a-5f36-443d-84d7-2e72b8e8bdb0', '0f34ad9f20b2618d8410b918df93a04d', 'e8cc70d2-167e-478f-875a-79def21f05cc', 1, NULL, NULL, 0, 0, NULL, NULL, NULL, 0, NULL, 1768107124, 1768107124);
INSERT INTO `ah_practice_answer` (`id`, `session_id`, `question_id`, `student_id`, `question_order`, `answer`, `audio_url`, `status`, `time_spent`, `submit_time`, `correct_answer`, `analysis`, `is_corrected`, `corrected_time`, `create_time`, `update_time`) VALUES (110, '873d989a-5f36-443d-84d7-2e72b8e8bdb0', '806d12a572ad7c6e5c983e842b128be6', 'e8cc70d2-167e-478f-875a-79def21f05cc', 2, NULL, NULL, 0, 0, NULL, NULL, NULL, 0, NULL, 1768107124, 1768107124);
INSERT INTO `ah_practice_answer` (`id`, `session_id`, `question_id`, `student_id`, `question_order`, `answer`, `audio_url`, `status`, `time_spent`, `submit_time`, `correct_answer`, `analysis`, `is_corrected`, `corrected_time`, `create_time`, `update_time`) VALUES (111, '873d989a-5f36-443d-84d7-2e72b8e8bdb0', '31e2500fc04cad9866d5a22ffbde5242', 'e8cc70d2-167e-478f-875a-79def21f05cc', 3, NULL, NULL, 0, 0, NULL, NULL, NULL, 0, NULL, 1768107124, 1768107124);
INSERT INTO `ah_practice_answer` (`id`, `session_id`, `question_id`, `student_id`, `question_order`, `answer`, `audio_url`, `status`, `time_spent`, `submit_time`, `correct_answer`, `analysis`, `is_corrected`, `corrected_time`, `create_time`, `update_time`) VALUES (112, '873d989a-5f36-443d-84d7-2e72b8e8bdb0', '8855e8c1029eef92ef10a68811c3ee5a', 'e8cc70d2-167e-478f-875a-79def21f05cc', 4, NULL, NULL, 0, 0, NULL, NULL, NULL, 0, NULL, 1768107124, 1768107124);
INSERT INTO `ah_practice_answer` (`id`, `session_id`, `question_id`, `student_id`, `question_order`, `answer`, `audio_url`, `status`, `time_spent`, `submit_time`, `correct_answer`, `analysis`, `is_corrected`, `corrected_time`, `create_time`, `update_time`) VALUES (113, '873d989a-5f36-443d-84d7-2e72b8e8bdb0', '679cadfb71ab9f6bd83c1858bf41df70', 'e8cc70d2-167e-478f-875a-79def21f05cc', 5, NULL, NULL, 0, 0, NULL, NULL, NULL, 0, NULL, 1768107124, 1768107124);
INSERT INTO `ah_practice_answer` (`id`, `session_id`, `question_id`, `student_id`, `question_order`, `answer`, `audio_url`, `status`, `time_spent`, `submit_time`, `correct_answer`, `analysis`, `is_corrected`, `corrected_time`, `create_time`, `update_time`) VALUES (114, '873d989a-5f36-443d-84d7-2e72b8e8bdb0', '1027045411e2dba6380006d97b0ed34f', 'e8cc70d2-167e-478f-875a-79def21f05cc', 6, NULL, NULL, 0, 0, NULL, NULL, NULL, 0, NULL, 1768107124, 1768107124);
INSERT INTO `ah_practice_answer` (`id`, `session_id`, `question_id`, `student_id`, `question_order`, `answer`, `audio_url`, `status`, `time_spent`, `submit_time`, `correct_answer`, `analysis`, `is_corrected`, `corrected_time`, `create_time`, `update_time`) VALUES (115, '873d989a-5f36-443d-84d7-2e72b8e8bdb0', 'aacfa030ec540369bbfa0f3a9e06070f', 'e8cc70d2-167e-478f-875a-79def21f05cc', 7, NULL, NULL, 0, 0, NULL, NULL, NULL, 0, NULL, 1768107124, 1768107124);
INSERT INTO `ah_practice_answer` (`id`, `session_id`, `question_id`, `student_id`, `question_order`, `answer`, `audio_url`, `status`, `time_spent`, `submit_time`, `correct_answer`, `analysis`, `is_corrected`, `corrected_time`, `create_time`, `update_time`) VALUES (116, '873d989a-5f36-443d-84d7-2e72b8e8bdb0', '3dc45785b74330a92fa101ebb1393706', 'e8cc70d2-167e-478f-875a-79def21f05cc', 8, NULL, NULL, 0, 0, NULL, NULL, NULL, 0, NULL, 1768107124, 1768107124);
INSERT INTO `ah_practice_answer` (`id`, `session_id`, `question_id`, `student_id`, `question_order`, `answer`, `audio_url`, `status`, `time_spent`, `submit_time`, `correct_answer`, `analysis`, `is_corrected`, `corrected_time`, `create_time`, `update_time`) VALUES (117, '873d989a-5f36-443d-84d7-2e72b8e8bdb0', '3c90107bdf7c764d6a78916255a5224c', 'e8cc70d2-167e-478f-875a-79def21f05cc', 9, NULL, NULL, 0, 0, NULL, NULL, NULL, 0, NULL, 1768107124, 1768107124);
INSERT INTO `ah_practice_answer` (`id`, `session_id`, `question_id`, `student_id`, `question_order`, `answer`, `audio_url`, `status`, `time_spent`, `submit_time`, `correct_answer`, `analysis`, `is_corrected`, `corrected_time`, `create_time`, `update_time`) VALUES (118, '873d989a-5f36-443d-84d7-2e72b8e8bdb0', '015c55feb37712a4c7e95e3981c0aec9', 'e8cc70d2-167e-478f-875a-79def21f05cc', 10, NULL, NULL, 0, 0, NULL, NULL, NULL, 0, NULL, 1768107124, 1768107124);
INSERT INTO `ah_practice_answer` (`id`, `session_id`, `question_id`, `student_id`, `question_order`, `answer`, `audio_url`, `status`, `time_spent`, `submit_time`, `correct_answer`, `analysis`, `is_corrected`, `corrected_time`, `create_time`, `update_time`) VALUES (119, 'cc565694-b885-4013-913d-c91ef0f6dbce', 'e810c9c5b5beae03c85f9cba6276b40e', 'e8cc70d2-167e-478f-875a-79def21f05cc', 1, 'B', NULL, 1, 18, 1768107747, '{\"type\": \"CHN_PL_SC_01\", \"value\": \"B\", \"values\": null, \"options\": [{\"id\": \"B\", \"text\": \"píng guǒ\"}], \"sub_answers\": null}', NULL, 0, NULL, 1768107708, 1768107747);
INSERT INTO `ah_practice_answer` (`id`, `session_id`, `question_id`, `student_id`, `question_order`, `answer`, `audio_url`, `status`, `time_spent`, `submit_time`, `correct_answer`, `analysis`, `is_corrected`, `corrected_time`, `create_time`, `update_time`) VALUES (120, 'cc565694-b885-4013-913d-c91ef0f6dbce', '7055bb4045db5095dc8fc1ad83a7920a', 'e8cc70d2-167e-478f-875a-79def21f05cc', 2, 'B', NULL, 1, 6, 1768107753, '{\"type\": \"CHN_PL_SC_01\", \"value\": \"B\", \"values\": null, \"options\": [{\"id\": \"B\", \"text\": \"gǒu\"}], \"sub_answers\": null}', NULL, 0, NULL, 1768107708, 1768107753);
INSERT INTO `ah_practice_answer` (`id`, `session_id`, `question_id`, `student_id`, `question_order`, `answer`, `audio_url`, `status`, `time_spent`, `submit_time`, `correct_answer`, `analysis`, `is_corrected`, `corrected_time`, `create_time`, `update_time`) VALUES (121, 'cc565694-b885-4013-913d-c91ef0f6dbce', '3ba093114f61412693b7d51cb28aa487', 'e8cc70d2-167e-478f-875a-79def21f05cc', 3, NULL, NULL, 0, 0, NULL, NULL, NULL, 0, NULL, 1768107708, 1768107708);
INSERT INTO `ah_practice_answer` (`id`, `session_id`, `question_id`, `student_id`, `question_order`, `answer`, `audio_url`, `status`, `time_spent`, `submit_time`, `correct_answer`, `analysis`, `is_corrected`, `corrected_time`, `create_time`, `update_time`) VALUES (122, 'cc565694-b885-4013-913d-c91ef0f6dbce', '69afe510abe969c0f45a4c451caff926', 'e8cc70d2-167e-478f-875a-79def21f05cc', 4, NULL, NULL, 0, 0, NULL, NULL, NULL, 0, NULL, 1768107708, 1768107708);
INSERT INTO `ah_practice_answer` (`id`, `session_id`, `question_id`, `student_id`, `question_order`, `answer`, `audio_url`, `status`, `time_spent`, `submit_time`, `correct_answer`, `analysis`, `is_corrected`, `corrected_time`, `create_time`, `update_time`) VALUES (123, 'cc565694-b885-4013-913d-c91ef0f6dbce', 'aa8007efc49595330a36aefa4bc11a35', 'e8cc70d2-167e-478f-875a-79def21f05cc', 5, NULL, NULL, 0, 0, NULL, NULL, NULL, 0, NULL, 1768107708, 1768107708);
INSERT INTO `ah_practice_answer` (`id`, `session_id`, `question_id`, `student_id`, `question_order`, `answer`, `audio_url`, `status`, `time_spent`, `submit_time`, `correct_answer`, `analysis`, `is_corrected`, `corrected_time`, `create_time`, `update_time`) VALUES (124, 'cc565694-b885-4013-913d-c91ef0f6dbce', '7e69b4b5e3ddab4d21c82c6364709006', 'e8cc70d2-167e-478f-875a-79def21f05cc', 6, NULL, NULL, 0, 0, NULL, NULL, NULL, 0, NULL, 1768107708, 1768107708);
INSERT INTO `ah_practice_answer` (`id`, `session_id`, `question_id`, `student_id`, `question_order`, `answer`, `audio_url`, `status`, `time_spent`, `submit_time`, `correct_answer`, `analysis`, `is_corrected`, `corrected_time`, `create_time`, `update_time`) VALUES (125, 'cc565694-b885-4013-913d-c91ef0f6dbce', '2f1e1635e58d59c480a86e454fa1acab', 'e8cc70d2-167e-478f-875a-79def21f05cc', 7, NULL, NULL, 0, 0, NULL, NULL, NULL, 0, NULL, 1768107708, 1768107708);
INSERT INTO `ah_practice_answer` (`id`, `session_id`, `question_id`, `student_id`, `question_order`, `answer`, `audio_url`, `status`, `time_spent`, `submit_time`, `correct_answer`, `analysis`, `is_corrected`, `corrected_time`, `create_time`, `update_time`) VALUES (126, 'cc565694-b885-4013-913d-c91ef0f6dbce', 'd089797fb12a0c6fc9ec3866630b0db4', 'e8cc70d2-167e-478f-875a-79def21f05cc', 8, NULL, NULL, 0, 0, NULL, NULL, NULL, 0, NULL, 1768107708, 1768107708);
INSERT INTO `ah_practice_answer` (`id`, `session_id`, `question_id`, `student_id`, `question_order`, `answer`, `audio_url`, `status`, `time_spent`, `submit_time`, `correct_answer`, `analysis`, `is_corrected`, `corrected_time`, `create_time`, `update_time`) VALUES (127, 'cc565694-b885-4013-913d-c91ef0f6dbce', 'f0456c7c816b110bb02c0543f5dc8e08', 'e8cc70d2-167e-478f-875a-79def21f05cc', 9, NULL, NULL, 0, 0, NULL, NULL, NULL, 0, NULL, 1768107708, 1768107708);
INSERT INTO `ah_practice_answer` (`id`, `session_id`, `question_id`, `student_id`, `question_order`, `answer`, `audio_url`, `status`, `time_spent`, `submit_time`, `correct_answer`, `analysis`, `is_corrected`, `corrected_time`, `create_time`, `update_time`) VALUES (128, 'cc565694-b885-4013-913d-c91ef0f6dbce', '40a0612b08b2f53ddd33fbec6a15323f', 'e8cc70d2-167e-478f-875a-79def21f05cc', 10, NULL, NULL, 0, 0, NULL, NULL, NULL, 0, NULL, 1768107708, 1768107708);
INSERT INTO `ah_practice_answer` (`id`, `session_id`, `question_id`, `student_id`, `question_order`, `answer`, `audio_url`, `status`, `time_spent`, `submit_time`, `correct_answer`, `analysis`, `is_corrected`, `corrected_time`, `create_time`, `update_time`) VALUES (129, '51b0c238-b212-452b-b1fb-1ef708e65181', '653857d461bdcea5973250534a2306f0', 'e8cc70d2-167e-478f-875a-79def21f05cc', 1, '错误', NULL, 2, 5, 1768108094, '{\"type\": \"CHN_PL_TF_01\", \"value\": \"B\", \"values\": null, \"options\": [{\"id\": \"B\", \"text\": \"不是\"}], \"sub_answers\": null}', '{\"correct_answer\": {\"type\": \"CHN_PL_TF_01\", \"value\": \"B\", \"values\": null, \"options\": [{\"id\": \"B\", \"text\": \"不是\"}], \"sub_answers\": null}, \"explanation\": null, \"analysis\": \"你的答案是‘错误’，但题目要求判断两个字是否一样，正确答案应为‘B. 不是’。你可能误解了题目的意思，将‘答案’理解为对选项的判断，而实际应选择正确的选项。‘日’和‘目’虽然外形相似，但结构不同：‘日’是太阳的意思，‘目’是眼睛的意思，两者意义和字形均不相同。建议今后审题时注意题目要求，明确是选择选项还是直接回答。多观察汉字结构差异，有助于提升辨析能力。\"}', 0, NULL, 1768107781, 1768108094);
INSERT INTO `ah_practice_answer` (`id`, `session_id`, `question_id`, `student_id`, `question_order`, `answer`, `audio_url`, `status`, `time_spent`, `submit_time`, `correct_answer`, `analysis`, `is_corrected`, `corrected_time`, `create_time`, `update_time`) VALUES (130, '51b0c238-b212-452b-b1fb-1ef708e65181', '030dd3a971d558739a185c3026ba115a', 'e8cc70d2-167e-478f-875a-79def21f05cc', 2, '不是', NULL, 2, 3, 1768108582, '{\"type\": \"CHN_PL_TF_01\", \"value\": \"B\", \"values\": null, \"options\": [{\"id\": \"B\", \"text\": \"不是\"}], \"sub_answers\": null}', '{\"correct_answer\": {\"type\": \"CHN_PL_TF_01\", \"value\": \"B\", \"values\": null, \"options\": [{\"id\": \"B\", \"text\": \"不是\"}], \"sub_answers\": null}, \"explanation\": null, \"analysis\": \"你的答案是正确的！\'大\'和\'太\'不是同一个字，虽然它们读音相近（dà 和 tài），且在某些语境下可以通假使用，但它们的字形、本义和用法不同。\'大\'表示体积、程度等较大，如\'大树\'；而\'太\'多用于程度过甚，如\'太大了\'。理解汉字时要区分字形和语义，避免混淆。继续加油，保持这种细致的观察力！\"}', 0, NULL, 1768107781, 1768108583);
INSERT INTO `ah_practice_answer` (`id`, `session_id`, `question_id`, `student_id`, `question_order`, `answer`, `audio_url`, `status`, `time_spent`, `submit_time`, `correct_answer`, `analysis`, `is_corrected`, `corrected_time`, `create_time`, `update_time`) VALUES (131, '51b0c238-b212-452b-b1fb-1ef708e65181', 'bf11f03edb4af6c3a04b28089a8081d3', 'e8cc70d2-167e-478f-875a-79def21f05cc', 3, '不是', NULL, 2, 2, 1768108803, '{\"type\": \"CHN_PL_TF_01\", \"value\": \"B\", \"values\": null, \"options\": [{\"id\": \"B\", \"text\": \"不是\"}], \"sub_answers\": null}', '{\"correct_answer\": {\"type\": \"CHN_PL_TF_01\", \"value\": \"B\", \"values\": null, \"options\": [{\"id\": \"B\", \"text\": \"不是\"}], \"sub_answers\": null}, \"explanation\": null, \"analysis\": \"你的答案正确！\'工\'和\'士\'这两个字虽然在形状上有些相似，但它们的笔画结构和含义完全不同。\'工\'有三横一竖，象征着工匠的工具；而\'士\'则由一横一竖加一点组成，代表古代的读书人或武士。因此，它们不是同一个字。继续保持细心观察的好习惯，这对学习汉字非常有帮助！\"}', 0, NULL, 1768107781, 1768108803);
INSERT INTO `ah_practice_answer` (`id`, `session_id`, `question_id`, `student_id`, `question_order`, `answer`, `audio_url`, `status`, `time_spent`, `submit_time`, `correct_answer`, `analysis`, `is_corrected`, `corrected_time`, `create_time`, `update_time`) VALUES (132, '51b0c238-b212-452b-b1fb-1ef708e65181', '1a05bee178b883bcb7de8adf12bd70a5', 'e8cc70d2-167e-478f-875a-79def21f05cc', 4, 'B', NULL, 1, 5, 1768108842, '{\"type\": \"CHN_PL_TF_01\", \"value\": \"B\", \"values\": null, \"options\": [{\"id\": \"B\", \"text\": \"不一样\"}], \"sub_answers\": null}', NULL, 0, NULL, 1768107781, 1768108842);
INSERT INTO `ah_practice_answer` (`id`, `session_id`, `question_id`, `student_id`, `question_order`, `answer`, `audio_url`, `status`, `time_spent`, `submit_time`, `correct_answer`, `analysis`, `is_corrected`, `corrected_time`, `create_time`, `update_time`) VALUES (133, '51b0c238-b212-452b-b1fb-1ef708e65181', '3bd6e5b6bb9e7554fce0a396879f8fa5', 'e8cc70d2-167e-478f-875a-79def21f05cc', 5, 'B', NULL, 1, 4, 1768108847, '{\"type\": \"CHN_PL_TF_01\", \"value\": \"B\", \"values\": null, \"options\": [{\"id\": \"B\", \"text\": \"不是\"}], \"sub_answers\": null}', NULL, 0, NULL, 1768107781, 1768108847);
INSERT INTO `ah_practice_answer` (`id`, `session_id`, `question_id`, `student_id`, `question_order`, `answer`, `audio_url`, `status`, `time_spent`, `submit_time`, `correct_answer`, `analysis`, `is_corrected`, `corrected_time`, `create_time`, `update_time`) VALUES (134, '51b0c238-b212-452b-b1fb-1ef708e65181', 'feb7394ada6729c4f016243bbd869634', 'e8cc70d2-167e-478f-875a-79def21f05cc', 6, 'B', NULL, 1, 2, 1768108848, '{\"type\": \"CHN_PL_TF_01\", \"value\": \"B\", \"values\": null, \"options\": [{\"id\": \"B\", \"text\": \"不是\"}], \"sub_answers\": null}', NULL, 0, NULL, 1768107781, 1768108848);
INSERT INTO `ah_practice_answer` (`id`, `session_id`, `question_id`, `student_id`, `question_order`, `answer`, `audio_url`, `status`, `time_spent`, `submit_time`, `correct_answer`, `analysis`, `is_corrected`, `corrected_time`, `create_time`, `update_time`) VALUES (135, '51b0c238-b212-452b-b1fb-1ef708e65181', '38778fe69f09669df56ebd50352af682', 'e8cc70d2-167e-478f-875a-79def21f05cc', 7, 'B', NULL, 1, 2, 1768108850, '{\"type\": \"CHN_PL_TF_01\", \"value\": \"B\", \"values\": null, \"options\": [{\"id\": \"B\", \"text\": \"不一样\"}], \"sub_answers\": null}', NULL, 0, NULL, 1768107781, 1768108850);
INSERT INTO `ah_practice_answer` (`id`, `session_id`, `question_id`, `student_id`, `question_order`, `answer`, `audio_url`, `status`, `time_spent`, `submit_time`, `correct_answer`, `analysis`, `is_corrected`, `corrected_time`, `create_time`, `update_time`) VALUES (136, '51b0c238-b212-452b-b1fb-1ef708e65181', '58229a3fceae5c47b68bb96742edcace', 'e8cc70d2-167e-478f-875a-79def21f05cc', 8, 'B', NULL, 1, 2, 1768108852, '{\"type\": \"CHN_PL_TF_01\", \"value\": \"B\", \"values\": null, \"options\": [{\"id\": \"B\", \"text\": \"不相同\"}], \"sub_answers\": null}', NULL, 0, NULL, 1768107781, 1768108852);
INSERT INTO `ah_practice_answer` (`id`, `session_id`, `question_id`, `student_id`, `question_order`, `answer`, `audio_url`, `status`, `time_spent`, `submit_time`, `correct_answer`, `analysis`, `is_corrected`, `corrected_time`, `create_time`, `update_time`) VALUES (137, '51b0c238-b212-452b-b1fb-1ef708e65181', '5d8f7346478b0d3fa2dd83e3e9a31049', 'e8cc70d2-167e-478f-875a-79def21f05cc', 9, 'B', NULL, 1, 2, 1768108854, '{\"type\": \"CHN_PL_TF_01\", \"value\": \"B\", \"values\": null, \"options\": [{\"id\": \"B\", \"text\": \"不一样\"}], \"sub_answers\": null}', NULL, 0, NULL, 1768107781, 1768108854);
INSERT INTO `ah_practice_answer` (`id`, `session_id`, `question_id`, `student_id`, `question_order`, `answer`, `audio_url`, `status`, `time_spent`, `submit_time`, `correct_answer`, `analysis`, `is_corrected`, `corrected_time`, `create_time`, `update_time`) VALUES (138, '51b0c238-b212-452b-b1fb-1ef708e65181', 'c59dddba939bbb5dc977931106032e5e', 'e8cc70d2-167e-478f-875a-79def21f05cc', 10, 'B', NULL, 1, 2, 1768108856, '{\"type\": \"CHN_PL_TF_01\", \"value\": \"B\", \"values\": null, \"options\": [{\"id\": \"B\", \"text\": \"不一样\"}], \"sub_answers\": null}', NULL, 0, NULL, 1768107781, 1768108856);
COMMIT;

-- ----------------------------
-- Table structure for ah_practice_report
-- ----------------------------
DROP TABLE IF EXISTS `ah_practice_report`;
CREATE TABLE `ah_practice_report` (
  `id` int NOT NULL AUTO_INCREMENT,
  `session_id` varchar(36) NOT NULL COMMENT '会话ID (UUID v4)',
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
  UNIQUE KEY `ix_ah_practice_report_session_id` (`session_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Records of ah_practice_report
-- ----------------------------
BEGIN;
INSERT INTO `ah_practice_report` (`id`, `session_id`, `student_id`, `total_questions`, `correct_questions`, `total_time`, `overall_score`, `current_ability`, `confidence`, `ability_level`, `percentile`, `knowledge_scores`, `question_distribution`, `ability_breakdown`, `learning_speed`, `consistency`, `strengths`, `weaknesses`, `recommendations`, `create_time`) VALUES (1, '51b0c238-b212-452b-b1fb-1ef708e65181', 'e8cc70d2-167e-478f-875a-79def21f05cc', 10, 7, 29, 70, 1, 0.7, '良好', 66, '{\"形近字辨析\": {\"total\": 10, \"correct\": 7, \"accuracy\": 70.0}}', '{\"CHN_PL_TF_01\": {\"total\": 10, \"correct\": 7, \"accuracy\": 70.0}}', '{\"easy\": {\"total\": 10, \"correct\": 7, \"accuracy\": 70.0}}', 2.9, 70, '[]', '[]', '[\"基础掌握较好，需要进一步巩固薄弱知识点。\", \"建议继续针对薄弱能力进行专项练习。\"]', 1768108857);
COMMIT;

-- ----------------------------
-- Table structure for ah_question
-- ----------------------------
DROP TABLE IF EXISTS `ah_question`;
CREATE TABLE `ah_question` (
  `id` varchar(36) NOT NULL COMMENT 'UUID',
  `question_type_code` varchar(50) NOT NULL COMMENT '题型编码',
  `subject` varchar(50) NOT NULL COMMENT '科目',
  `grade` int NOT NULL COMMENT '年级 1-12',
  `content` json NOT NULL COMMENT '题目内容：包含题干、选项等',
  `answer` json NOT NULL COMMENT '答案配置',
  `difficulty` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '难度',
  `create_time` int NOT NULL COMMENT '创建时间',
  `update_time` int NOT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`)
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
  `code` varchar(50) NOT NULL COMMENT '题型编码',
  `name` varchar(100) NOT NULL COMMENT '题型名称',
  `category` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '题型分类: ability_practice / unit_practice',
  `description` text COMMENT '题型描述',
  `subject` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '科目',
  `ability_code` varchar(100) DEFAULT NULL COMMENT '关联能力代码',
  `configs` json DEFAULT NULL COMMENT '配置信息：包含媒体、脚手架、评估配置',
  `create_time` int NOT NULL COMMENT '创建时间',
  `update_time` int NOT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Records of ah_question_type
-- ----------------------------
BEGIN;
INSERT INTO `ah_question_type` (`id`, `code`, `name`, `category`, `description`, `subject`, `ability_code`, `configs`, `create_time`, `update_time`) VALUES (1, 'input', '输入题', 'unit_practice', '要求学生通过文字或语音自主作答，不提供选项，适合检测学生是否真正掌握知识点，如词语书写、计算结果、简要表达等。', NULL, NULL, '{}', 1768405305, 1768530161);
INSERT INTO `ah_question_type` (`id`, `code`, `name`, `category`, `description`, `subject`, `ability_code`, `configs`, `create_time`, `update_time`) VALUES (2, 'choice', '选择题', 'unit_practice', '为学生提供若干选项，从中选择正确答案，适合理解检测、细节辨析和降低作答表达成本。', NULL, NULL, '{}', 1768405305, 1768530185);
INSERT INTO `ah_question_type` (`id`, `code`, `name`, `category`, `description`, `subject`, `ability_code`, `configs`, `create_time`, `update_time`) VALUES (3, 'judge', '判断题', 'unit_practice', '要求学生对给定陈述判断正误，适合用于概念辨析、易错点检测和基础理解层面的快速评估。', NULL, NULL, '{}', 1768405305, 1768530176);
INSERT INTO `ah_question_type` (`id`, `code`, `name`, `category`, `description`, `subject`, `ability_code`, `configs`, `create_time`, `update_time`) VALUES (4, 'matching', '匹配题', 'unit_practice', '要求学生在两组或多组内容之间建立对应关系，适用于概念与解释、词语与图片等结构化知识。', NULL, NULL, '{}', 1768405305, 1768530193);
INSERT INTO `ah_question_type` (`id`, `code`, `name`, `category`, `description`, `subject`, `ability_code`, `configs`, `create_time`, `update_time`) VALUES (5, 'sorting', '排序题', 'unit_practice', '要求学生将多个元素按正确顺序排列，适用于过程理解、步骤掌握和时间或逻辑顺序的学习目标。', NULL, NULL, '{}', 1768405305, 1768530202);
INSERT INTO `ah_question_type` (`id`, `code`, `name`, `category`, `description`, `subject`, `ability_code`, `configs`, `create_time`, `update_time`) VALUES (6, 'pinyin_sound_discrim', '听音辨位', 'ability_practice', '播放录音，点击对应的声母或韵母气球。', '语文', 'reading_discrimination', '{}', 1768405305, 1768469088);
INSERT INTO `ah_question_type` (`id`, `code`, `name`, `category`, `description`, `subject`, `ability_code`, `configs`, `create_time`, `update_time`) VALUES (7, 'stroke_order_trace', '描红达人', 'ability_practice', '屏幕手写描红，系统判定笔画顺序和位置是否正确。', '语文', 'strokes_stroke_order', '{}', 1768405305, 1768469168);
INSERT INTO `ah_question_type` (`id`, `code`, `name`, `category`, `description`, `subject`, `ability_code`, `configs`, `create_time`, `update_time`) VALUES (8, 'pictograph_match', '看图猜字', 'ability_practice', '展示象形字演变动画或图片，选择对应的现代汉字。', '语文', 'picture_text_matching', '{}', 1768405305, 1768469231);
INSERT INTO `ah_question_type` (`id`, `code`, `name`, `category`, `description`, `subject`, `ability_code`, `configs`, `create_time`, `update_time`) VALUES (9, 'radical_basket_sort', '部首归类', 'ability_practice', NULL, '语文', 'radical_dictionary_lookup', '{}', 1768405305, 1768468389);
INSERT INTO `ah_question_type` (`id`, `code`, `name`, `category`, `description`, `subject`, `ability_code`, `configs`, `create_time`, `update_time`) VALUES (10, 'social_tone_select', '话术实验室', 'ability_practice', NULL, '语文', 'ext_oral_refuse_negotiate_2', '{}', 1768405305, 1768468411);
INSERT INTO `ah_question_type` (`id`, `code`, `name`, `category`, `description`, `subject`, `ability_code`, `configs`, `create_time`, `update_time`) VALUES (11, 'narrative_prediction', '故事大猜想', 'ability_practice', NULL, '语文', 'prediction_inference', '{}', 1768405305, 1768468429);
INSERT INTO `ah_question_type` (`id`, `code`, `name`, `category`, `description`, `subject`, `ability_code`, `configs`, `create_time`, `update_time`) VALUES (48, 'pinyin_match', '拼音连连看', 'ability_practice', '将图片与正确的拼音音节相连。', '语文', 'reading_discrimination', '{}', 1768468860, 1768468860);
INSERT INTO `ah_question_type` (`id`, `code`, `name`, `category`, `description`, `subject`, `ability_code`, `configs`, `create_time`, `update_time`) VALUES (49, 'bihua_split', '笔画拆解', 'ability_practice', '给出一个汉字，让学生拖拽笔画按正确顺序组装。', '语文', 'strokes_stroke_order', '{}', 1768469260, 1768469260);
INSERT INTO `ah_question_type` (`id`, `code`, `name`, `category`, `description`, `subject`, `ability_code`, `configs`, `create_time`, `update_time`) VALUES (50, 'picture_recognize_word', '看图识字', 'ability_practice', '展示街道、招牌等场景图，点击图中隐藏的生字。', '语文', 'picture_text_matching', '{}', 1768469410, 1768469410);
INSERT INTO `ah_question_type` (`id`, `code`, `name`, `category`, `description`, `subject`, `ability_code`, `configs`, `create_time`, `update_time`) VALUES (51, 'find_word_game', '寻宝游戏', 'ability_practice', '阅读短文，根据问题（如“谁在拔萝卜？”）点击文中的关键词或角色图片。', '语文', 'extraction_information', '{}', 1768469562, 1768469562);
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
  `grade` int DEFAULT '1',
  `semester` varchar(255) DEFAULT NULL COMMENT '当前学期',
  `subject` varchar(255) DEFAULT NULL COMMENT '当前学科',
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
INSERT INTO `ah_student` (`id`, `name`, `phone`, `password`, `token`, `grade`, `semester`, `subject`, `status`, `create_time`, `update_time`) VALUES ('e8cc70d2-167e-478f-875a-79def21f05cc', '森森', '15068114669', '$2b$12$dHzlXv0qAaS2Ht3X/qzLJOV30lj.1/5icx14gIk3F4FdlOjGa5Hga', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImU4Y2M3MGQyLTE2N2UtNDc4Zi04NzVhLTc5ZGVmMjFmMDVjYyIsInVwZGF0ZV90aW1lIjoxNzY4MzcxMjQ0LCJleHAiOjE3Njg5NzYwNDR9.MPNmJuVpJkRn1VgG8MNbwh1IzSreRtcRhax2fihQeQA', 1, '上学期', '语文', 1, 1761899349, 1768371247);
COMMIT;

-- ----------------------------
-- Table structure for ah_student_ability_mastery
-- ----------------------------
DROP TABLE IF EXISTS `ah_student_ability_mastery`;
CREATE TABLE `ah_student_ability_mastery` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` varchar(255) NOT NULL COMMENT '学生ID',
  `ability_code` varchar(100) NOT NULL COMMENT '原子能力代码',
  `mastery_score` float NOT NULL COMMENT '掌握度 0-100',
  `mastery_level` varchar(20) NOT NULL COMMENT '掌握等级',
  `correct_count` int NOT NULL COMMENT '正确次数',
  `wrong_count` int NOT NULL COMMENT '错误次数',
  `last_practice_time` int DEFAULT NULL COMMENT '最近练习时间',
  `create_time` int NOT NULL COMMENT '创建时间',
  `update_time` int NOT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_student_ability` (`student_id`,`ability_code`),
  KEY `ix_ah_student_ability_mastery_student_id` (`student_id`),
  KEY `ix_ah_student_ability_mastery_ability_code` (`ability_code`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Records of ah_student_ability_mastery
-- ----------------------------
BEGIN;
INSERT INTO `ah_student_ability_mastery` (`id`, `student_id`, `ability_code`, `mastery_score`, `mastery_level`, `correct_count`, `wrong_count`, `last_practice_time`, `create_time`, `update_time`) VALUES (1, 'e8cc70d2-167e-478f-875a-79def21f05cc', 'cn_g2_info_find', 55.56, 'beginner', 3, 2, 1768106743, 1768102299, 1768106743);
INSERT INTO `ah_student_ability_mastery` (`id`, `student_id`, `ability_code`, `mastery_score`, `mastery_level`, `correct_count`, `wrong_count`, `last_practice_time`, `create_time`, `update_time`) VALUES (3, 'e8cc70d2-167e-478f-875a-79def21f05cc', 'cn_g2_direct_answer', 55.56, 'beginner', 3, 2, 1768106743, 1768102299, 1768106743);
INSERT INTO `ah_student_ability_mastery` (`id`, `student_id`, `ability_code`, `mastery_score`, `mastery_level`, `correct_count`, `wrong_count`, `last_practice_time`, `create_time`, `update_time`) VALUES (5, 'e8cc70d2-167e-478f-875a-79def21f05cc', 'cn_g1_picture_choice', 72.22, 'proficient', 11, 3, 1768108856, 1768107651, 1768108856);
INSERT INTO `ah_student_ability_mastery` (`id`, `student_id`, `ability_code`, `mastery_score`, `mastery_level`, `correct_count`, `wrong_count`, `last_practice_time`, `create_time`, `update_time`) VALUES (6, 'e8cc70d2-167e-478f-875a-79def21f05cc', 'cn_g1_sentence_understand', 72.22, 'proficient', 11, 3, 1768108856, 1768107651, 1768108856);
COMMIT;

-- ----------------------------
-- Table structure for ah_student_practice
-- ----------------------------
DROP TABLE IF EXISTS `ah_student_practice`;
CREATE TABLE `ah_student_practice` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` varchar(255) NOT NULL,
  `practice_id` int NOT NULL,
  `sort_order` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `ix_ah_student_practice_student_id` (`student_id`),
  KEY `ix_ah_student_practice_practice_id` (`practice_id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Records of ah_student_practice
-- ----------------------------
BEGIN;
INSERT INTO `ah_student_practice` (`id`, `student_id`, `practice_id`, `sort_order`) VALUES (11, 'e8cc70d2-167e-478f-875a-79def21f05cc', 1, 0);
INSERT INTO `ah_student_practice` (`id`, `student_id`, `practice_id`, `sort_order`) VALUES (12, 'e8cc70d2-167e-478f-875a-79def21f05cc', 2, 1);
INSERT INTO `ah_student_practice` (`id`, `student_id`, `practice_id`, `sort_order`) VALUES (13, 'e8cc70d2-167e-478f-875a-79def21f05cc', 3, 2);
INSERT INTO `ah_student_practice` (`id`, `student_id`, `practice_id`, `sort_order`) VALUES (14, 'e8cc70d2-167e-478f-875a-79def21f05cc', 4, 3);
INSERT INTO `ah_student_practice` (`id`, `student_id`, `practice_id`, `sort_order`) VALUES (15, 'e8cc70d2-167e-478f-875a-79def21f05cc', 5, 4);
INSERT INTO `ah_student_practice` (`id`, `student_id`, `practice_id`, `sort_order`) VALUES (16, 'e8cc70d2-167e-478f-875a-79def21f05cc', 6, 5);
INSERT INTO `ah_student_practice` (`id`, `student_id`, `practice_id`, `sort_order`) VALUES (17, 'e8cc70d2-167e-478f-875a-79def21f05cc', 7, 6);
INSERT INTO `ah_student_practice` (`id`, `student_id`, `practice_id`, `sort_order`) VALUES (18, 'e8cc70d2-167e-478f-875a-79def21f05cc', 8, 7);
COMMIT;

-- ----------------------------
-- Table structure for ah_student_textbook_config
-- ----------------------------
DROP TABLE IF EXISTS `ah_student_textbook_config`;
CREATE TABLE `ah_student_textbook_config` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` varchar(255) NOT NULL,
  `textbook_id` int NOT NULL,
  `create_time` int NOT NULL,
  `update_time` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_ah_student_textbook_config_textbook_id` (`textbook_id`),
  KEY `ix_ah_student_textbook_config_student_id` (`student_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Records of ah_student_textbook_config
-- ----------------------------
BEGIN;
INSERT INTO `ah_student_textbook_config` (`id`, `student_id`, `textbook_id`, `create_time`, `update_time`) VALUES (2, 'e8cc70d2-167e-478f-875a-79def21f05cc', 30, 1768230583, 1768230583);
INSERT INTO `ah_student_textbook_config` (`id`, `student_id`, `textbook_id`, `create_time`, `update_time`) VALUES (3, 'e8cc70d2-167e-478f-875a-79def21f05cc', 31, 1768230588, 1768230588);
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
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Records of ah_teacher_book
-- ----------------------------
BEGIN;
INSERT INTO `ah_teacher_book` (`id`, `subject`, `version`, `grade`, `semester`, `file`, `index_file_id`) VALUES (1, '英语', '人教版', 1, '上学期', '【教】人教版-英语-一年级-上册.pdf', 'file_2a1f4f3b993f4f2d91e217e0d9d8a77c_10672051');
INSERT INTO `ah_teacher_book` (`id`, `subject`, `version`, `grade`, `semester`, `file`, `index_file_id`) VALUES (3, '英语', '人教版', 1, '下学期', NULL, NULL);
INSERT INTO `ah_teacher_book` (`id`, `subject`, `version`, `grade`, `semester`, `file`, `index_file_id`) VALUES (4, '语文', '统编版|2024', 1, '上学期', NULL, NULL);
INSERT INTO `ah_teacher_book` (`id`, `subject`, `version`, `grade`, `semester`, `file`, `index_file_id`) VALUES (5, '语文', '统编版|2024', 1, '下学期', NULL, NULL);
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
INSERT INTO `ah_textbook` (`id`, `subject`, `version`, `grade`, `semester`, `file`, `index_file_id`, `is_parsed`) VALUES (30, '语文', '统编版|2024', 1, '上学期', 'c3f8504ebd6d4261baf3cf7fb90eaf10.pdf', 'file_064d043da02d4d37b750e9ed2439b90f_10672051', 1);
INSERT INTO `ah_textbook` (`id`, `subject`, `version`, `grade`, `semester`, `file`, `index_file_id`, `is_parsed`) VALUES (31, '语文', '统编版|2024', 1, '下学期', '0e5a68dc7ef6472a9a66e54f2587ed8c.pdf', 'file_b6b3101cf7d249ed8526ca66cf64f5e2_10672051', 1);
INSERT INTO `ah_textbook` (`id`, `subject`, `version`, `grade`, `semester`, `file`, `index_file_id`, `is_parsed`) VALUES (32, '语文', '人教版', 2, '上学期', '0bca24aa13e04d7ba017976946de9a8c.pdf', 'file_1efb92dac86c4d3d81c1fb59209c88cd_10672051', 1);
INSERT INTO `ah_textbook` (`id`, `subject`, `version`, `grade`, `semester`, `file`, `index_file_id`, `is_parsed`) VALUES (33, '语文', '人教版', 2, '下学期', '6a1e20b3d6d74630b71c9a3eebc2879f.pdf', 'file_36670ad3dcca450d9641ac793f41846e_10672051', 1);
INSERT INTO `ah_textbook` (`id`, `subject`, `version`, `grade`, `semester`, `file`, `index_file_id`, `is_parsed`) VALUES (34, '语文', '人教版', 3, '上学期', '60451bb7812d4aabaff0e5959d0a48d7.pdf', 'file_5bf474eb8119472bac44dbbf9eb6aa6b_10672051', 1);
INSERT INTO `ah_textbook` (`id`, `subject`, `version`, `grade`, `semester`, `file`, `index_file_id`, `is_parsed`) VALUES (35, '语文', '人教版', 3, '下学期', '12670f4162534395ba5b2ce1575b235f.pdf', 'file_95f5df628d034b7eba08635601ec4598_10672051', 1);
COMMIT;

-- ----------------------------
-- Table structure for ah_textbook_version
-- ----------------------------
DROP TABLE IF EXISTS `ah_textbook_version`;
CREATE TABLE `ah_textbook_version` (
  `id` int NOT NULL AUTO_INCREMENT,
  `subject` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `revision_year` int NOT NULL,
  `is_enabled` int NOT NULL,
  `create_time` int NOT NULL COMMENT '创建时间',
  `update_time` int NOT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Records of ah_textbook_version
-- ----------------------------
BEGIN;
INSERT INTO `ah_textbook_version` (`id`, `subject`, `name`, `revision_year`, `is_enabled`, `create_time`, `update_time`) VALUES (1, '语文', '统编版', 2024, 1, 1768200769, 1768200818);
INSERT INTO `ah_textbook_version` (`id`, `subject`, `name`, `revision_year`, `is_enabled`, `create_time`, `update_time`) VALUES (2, '语文', '统编版', 2017, 1, 1768200827, 1768200827);
INSERT INTO `ah_textbook_version` (`id`, `subject`, `name`, `revision_year`, `is_enabled`, `create_time`, `update_time`) VALUES (3, '数学', '人教版', 2024, 1, 1768200911, 1768200911);
INSERT INTO `ah_textbook_version` (`id`, `subject`, `name`, `revision_year`, `is_enabled`, `create_time`, `update_time`) VALUES (4, '数学', '人教版', 2022, 1, 1768200919, 1768200919);
INSERT INTO `ah_textbook_version` (`id`, `subject`, `name`, `revision_year`, `is_enabled`, `create_time`, `update_time`) VALUES (5, '英语', '人教版（一年级起点）', 2013, 1, 1768200962, 1768200991);
INSERT INTO `ah_textbook_version` (`id`, `subject`, `name`, `revision_year`, `is_enabled`, `create_time`, `update_time`) VALUES (6, '英语', '人教版（PEP）', 2024, 1, 1768201022, 1768201022);
INSERT INTO `ah_textbook_version` (`id`, `subject`, `name`, `revision_year`, `is_enabled`, `create_time`, `update_time`) VALUES (7, '英语', '人教版（PEP）', 2013, 1, 1768201033, 1768201033);
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
