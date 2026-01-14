# 题型设计

This optimization proposal upgrades your QuestionType data structure to align with the specific teaching methodologies (Scaffolding, Multimodality, and Evaluation Matrices) found in the provided teacher's guides.

### Optimized Data Structure (SQLAlchemy Model)

I have added fields for **Scaffolding**, **Evaluation Strategy**, and **Context**, which are critical for the "Strategy Unit" and "Oral Communication" modules emphasized in the textbooks.

```python

from sqlalchemy import String, Integer, Text, JSON, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from .base import BaseModel  # Assuming a base model exists

class QuestionType(BaseModel):
    """
    题型配置表 (Optimized for Ministry of Education Curriculum)
    """
    __tablename__ = "ah_question_type"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)

    # --- 1. Basic Identity ---
    code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, comment="题型编码 (e.g., 'reading_prediction')")
    name: Mapped[str] = mapped_column(String(100), nullable=False, comment="题型名称")
    description: Mapped[str] = mapped_column(Text, nullable=True, comment="教学目标描述")

    # --- 2. Curriculum Alignment (New) ---
    # Aligns with the "Dual-Thread" structure (Humanities Theme + Language Element)
    subject: Mapped[str] = mapped_column(String(50), nullable=False, default="Chinese", comment="科目")
    grade_band: Mapped[str] = mapped_column(String(20), comment="适用学段 (Low/Mid/High) - 对应皮亚杰认知发展阶段")
    competency_dimension: Mapped[list] = mapped_column(JSON, comment="能力维度 (e.g., ['Literacy', 'Critical Thinking', 'Aesthetic Appreciation'])")

    # --- 3. Interaction & Media (Enhanced) ---
    # Supports "Non-continuous text" and "Multi-sensory" learning
    interaction_mode: Mapped[str] = mapped_column(String(50), nullable=False, comment="交互模式 (click, drag, recording, drawing, highlight)")
    media_context: Mapped[dict] = mapped_column(JSON, nullable=True, comment="媒体情境配置 (Supports Text+Audio, Image+Map, Video)")

    # --- 4. Scaffolding & Strategy (New - Critical) ---
    # Supports "Reading Strategies" like Prediction and Questioning
    scaffolding_config: Mapped[dict] = mapped_column(JSON, nullable=True, comment="脚手架配置 (Hints, guiding questions, flowcharts)")

    # --- 5. Answer & Evaluation (Refined) ---
    # Supports "Self-Evaluation" and "Peer Review" rubrics
    evaluation_mode: Mapped[str] = mapped_column(String(50), default="auto_match", comment="评分模式 (auto_match, rubric_self, rubric_peer, ai_analysis)")
    answer_schema: Mapped[dict] = mapped_column(JSON, nullable=True, comment="答案结构/判分规则")
    rubric_criteria: Mapped[list] = mapped_column(JSON, nullable=True, comment="评价量表 (For subjective tasks like speaking/writing)")

    # --- 6. Feedback Mechanism ---
    feedback_config: Mapped[dict] = mapped_column(JSON, nullable=True, comment="反馈策略 (Immediate vs. Delayed, Explanation Content)")
```

### Detailed Justification & Application

Here is how the new fields directly support the teaching capabilities identified in the sources:

**1\.** **media_context** **(Resource Configuration)
Why improve it?** The sources emphasize that literacy is not just about text.

- **Listening:** Grade 1 requires differentiating similar sounds (n/l, z/zh) through audio.
- **Visual Literacy:** Grade 6 requires analyzing "Non-continuous texts" like bus stop signs and diagrams.
- **Structure:**

```json
{
  "media_context": {
    "type": "composite",
    "components": [
      { "type": "image", "src": "bus_stop_map.jpg", "alt": "City Bus Route" },
      { "type": "audio", "src": "passenger_question.mp3", "trigger": "on_load" }
    ]
  }
}
```

⠀**2.** **scaffolding_config** **(Instructional Scaffolding)
Why add it?** Middle and high grades focus on **"learning how to learn"**. The app shouldn't just ask for the answer; it needs to guide the process.

- **Prediction Strategy (Grade 3):** The source suggests pausing a story to let students guess the ending based on the title or illustrations.
- **Speed Reading (Grade 5):** Requires "reading without pointing" and "timer" scaffolds.
- **Structure:**

```json
{
  "scaffolding_config": {
    "step_by_step": true,
    "hints": [
      { "time_delay": 10, "content": "Look at the illustration on page 1..." },
      { "trigger": "wrong_attempt_2", "content": "Did you notice the character's expression?" }
    ]
  }
}
```

⠀**3.** **evaluation_mode** **&** **rubric_criteria**
**Why improve it?** Oral communication and writing cannot be graded by simple "True/False".

- **Subjective Assessment:** Grade 6 oral communication ("Opinion Disagreement") requires evaluating "Tone," "Logic," and "Persuasion" .
- **Self-Reflection:** Grade 5 writing tasks involve "Evaluation Sheets" where students rate themselves (stars).
- **Structure:**

```json
{
  "evaluation_mode": "rubric_peer",
  "rubric_criteria": [
    { "dimension": "Logic", "max_score": 5, "desc": "Are the reasons clear?" },
    { "dimension": "Politeness", "max_score": 5, "desc": "Did you use respectful language?" }
  ]
}
```

⠀**4.** **interaction_mode** **(Specific Examples)**

- **drawing** **(Grade 1-2):** For "Stroke Order" and "radical" practice (e.g., enclosing structure).
- **highlighting** **(Grade 5-6):** For "Speed Reading" (finding keywords) and analyzing "Static vs. Dynamic" descriptions in text.
- **sorting** **(Grade 4):** For organizing a story by "Cause, Course, Result".

⠀Summary of Changes based on Sources
| **Field Name** | **Optimization Reason** | **Source Citation** |
|---|---|---|
| **media_context** | To support "Non-continuous text reading" (maps, charts) and listening tasks. | |
| **scaffolding_config** | To implement "Reading Strategies" (prediction, questioning) rather than just testing comprehension. | |
| **rubric_criteria** | To support "Oral Communication" and "Writing" assessment which requires multi-dimensional evaluation. | |
| **interaction_mode** | To move beyond text input; specifically drawing for strokes and highlighting for speed reading. | |
This structure will allow your APP to function not just as a quiz tool, but as a **digital tutor** that teaches methods (strategies) alongside content, exactly as the Ministry of Education's teacher guides recommend.

## Chinese Qeustion Types

Here is the comprehensive list of question type configurations in JSONL format, based strictly on the Ministry of Education's Teacher's Guides (Grades 1-6) and the optimized data structure we designed.
These entries cover the full spectrum from basic literacy to complex critical thinking and aesthetic appreciation.

```json
{"code": "pinyin_sound_discrim", "name": "听音辨位 (Pinyin Discrimination)", "description": "针对一年级语音基础。根据教材建议，重点区分易混声母（如 z/zh, c/ch, n/l）及前后鼻音。通过听录音选择对应拼音气球或图片。", "subject": "Chinese", "grade_band": "Low", "competency_dimension": ["Phonetics", "Listening"], "interaction_mode": "click", "media_context": {"type": "audio_grid", "audio_src": "dynamic", "images": "minimal_pairs"}, "scaffolding_config": {"hints": [{"trigger": "wrong_attempt_1", "content": "Show mouth shape diagram (lips rounded vs. flat)."}, {"trigger": "wrong_attempt_2", "content": "Play exaggerated slow-motion audio."}]}, "evaluation_mode": "auto_match", "answer_schema": {"match_type": "exact"}, "rubric_criteria": null, "feedback_config": {"type": "immediate", "content": "Correct! 'zh' requires curling your tongue."}}
{"code": "stroke_order_trace", "name": "描红达人 (Stroke Order Tracing)", "description": "一年级写字规范训练。强调“先横后竖”、“先中间后两边”等笔顺规则，以及田字格占位。教材强调写字姿势和基本笔画的掌握。", "subject": "Chinese", "grade_band": "Low", "competency_dimension": ["Literacy", "Writing"], "interaction_mode": "drawing", "media_context": {"type": "canvas", "background": "tian_zi_ge_grid"}, "scaffolding_config": {"step_by_step": true, "guide_lines": "fade_on_mastery", "hints": [{"trigger": "stroke_error", "content": "Animation showing the correct stroke direction."}]}, "evaluation_mode": "ai_analysis", "answer_schema": {"criteria": ["stroke_sequence", "linearity", "grid_position"]}, "rubric_criteria": null, "feedback_config": {"type": "visual_overlay", "content": "Show comparison between user trace and standard font."}}
{"code": "pictograph_match", "name": "看图猜字 (Pictograph Literacy)", "description": "低年级识字策略。利用象形字（日、月、水、火）的演变过程，帮助学生建立字形与字义的联系，激发识字兴趣。", "subject": "Chinese", "grade_band": "Low", "competency_dimension": ["Literacy", "Visual Thinking"], "interaction_mode": "drag_and_drop", "media_context": {"type": "evolution_animation", "stages": ["image", "ancient_char", "modern_char"]}, "scaffolding_config": {"hints": [{"trigger": "idle_5s", "content": "Look at the shape of the mountain in the picture."}]}, "evaluation_mode": "auto_match", "answer_schema": {"match_type": "pair"}, "rubric_criteria": null, "feedback_config": {"type": "immediate", "content": "Animation completes the transformation from picture to character."}}
{"code": "radical_basket_sort", "name": "部首归类 (Radical Sorting)", "description": "二年级词法训练。通过归类识字（如提手旁、三点水），帮助学生发现形声字的构字规律，理解部首表义的功能。", "subject": "Chinese", "grade_band": "Low", "competency_dimension": ["Morphology", "Vocabulary"], "interaction_mode": "drag_and_drop", "media_context": {"type": "containers", "labels": ["Words related to water", "Words related to hands"]}, "scaffolding_config": {"constraints": ["highlight_radical_on_hover"], "hints": [{"trigger": "wrong_category", "content": "Does this character describe an action using hands?"}]}, "evaluation_mode": "auto_match", "answer_schema": {"match_type": "grouping"}, "rubric_criteria": null, "feedback_config": {"type": "delayed_summary", "content": "Summary card showing the meaning of the radical."}}
{"code": "social_tone_select", "name": "话术实验室 (Tone & Politeness)", "description": "二年级口语交际。学习“商量”的语气，被拒绝时如何应对，以及“注意语气”、“不说脏话”等礼貌原则。辨析不同语气的表达效果。", "subject": "Chinese", "grade_band": "Low", "competency_dimension": ["Oral Communication", "Social Emotional Learning"], "interaction_mode": "choice_audio", "media_context": {"type": "scenario_card", "audio_options": ["Aggressive tone", "Polite tone", "Passive tone"]}, "scaffolding_config": {"prompts": ["Which voice sounds more friendly?", "Which one makes you want to help?"]}, "evaluation_mode": "auto_match", "answer_schema": {"correct_option": "polite"}, "rubric_criteria": null, "feedback_config": {"type": "reflective", "content": "Explain why the polite tone works better."}}
{"code": "narrative_prediction", "name": "故事大猜想 (Prediction Strategy)", "description": "三年级阅读策略。在阅读过程中暂停，依据题目、插图或前文线索预测故事发展。强调预测要有依据，并验证预测与结局的异同。", "subject": "Chinese", "grade_band": "Mid", "competency_dimension": ["Reading Strategy", "Critical Thinking"], "interaction_mode": "pause_and_input", "media_context": {"type": "paginated_text", "interrupt_points": ["middle_of_story"]}, "scaffolding_config": {"templates": ["I think... because...", "The picture shows..."], "hints": [{"trigger": "no_input", "content": "Look at the title again."}]}, "evaluation_mode": "rubric_self", "answer_schema": {"logic_check": true}, "rubric_criteria": [{"dimension": "Basis", "score": 3, "desc": "Did you use clues from the text?"}, {"dimension": "Reasoning", "score": 2, "desc": "Is your prediction logical?"}], "feedback_config": {"type": "comparison", "content": "Reveal author's ending and compare with user's prediction."}}
{"code": "sensory_detail_highlight", "name": "五感侦探 (Sensory Observation)", "description": "三年级习作训练。学习调动多种感官（视、听、味、嗅、触）观察事物，并识别文中描写特定感官的句子。", "subject": "Chinese", "grade_band": "Mid", "competency_dimension": ["Writing", "Observation"], "interaction_mode": "highlight_text", "media_context": {"type": "text_passage", "tools": ["eye_highlighter", "ear_highlighter", "nose_highlighter"]}, "scaffolding_config": {"hints": [{"trigger": "missed_sentence", "content": "Can you find a sound described here?"}]}, "evaluation_mode": "auto_match", "answer_schema": {"target_phrases": {"visual": [], "auditory": []}}, "rubric_criteria": null, "feedback_config": {"type": "visual_map", "content": "Show a 'sensory map' of the passage."}}
{"code": "plot_sequence_drag", "name": "情节梯子 (Plot Sequencing)", "description": "四年级阅读能力。把握文章主要内容，按事情发展顺序（起因、经过、结果）梳理长文章的脉络。适用于复述练习。", "subject": "Chinese", "grade_band": "Mid", "competency_dimension": ["Reading Comprehension", "Logic"], "interaction_mode": "sort_list", "media_context": {"type": "timeline_vertical", "items": ["Cause", "Development", "Climax", "Result"]}, "scaffolding_config": {"constraints": ["check_order_on_drop"], "hints": [{"trigger": "wrong_order", "content": "What happened immediately after the character left?"}]}, "evaluation_mode": "auto_match", "answer_schema": {"sequence": "ordered_list"}, "rubric_criteria": null, "feedback_config": {"type": "narrative_summary", "content": "Replay the story summary in correct order."}}
{"code": "speed_reading_drill", "name": "计时挑战 (Speed Reading)", "description": "五年级阅读策略。提高阅读速度，要求“连词成句地读”、“不回读”，并带着问题默读。系统记录阅读时间并检测理解率。", "subject": "Chinese", "grade_band": "High", "competency_dimension": ["Reading Strategy", "Metacognition"], "interaction_mode": "scroll_read_timer", "media_context": {"type": "long_text_stream", "features": ["blur_previous_lines", "wpm_counter"]}, "scaffolding_config": {"constraints": ["disable_backtracking"], "post_task": "Comprehension Quiz"}, "evaluation_mode": "auto_match", "answer_schema": {"min_comprehension": 0.8, "target_wpm": 300}, "rubric_criteria": null, "feedback_config": {"type": "data_dashboard", "content": "Speed: X chars/min. Comprehension: Y%. Advice: Try to expand your visual span."}}
{"code": "dynamic_static_contrast", "name": "动静找茬 (Dynamic vs Static)", "description": "五年级文学鉴赏。体会静态描写与动态描写的区别及其表达效果（如《鸟的天堂》）。要求在文中区分并高亮不同类型的描写。", "subject": "Chinese", "grade_band": "High", "competency_dimension": ["Literary Analysis", "Aesthetics"], "interaction_mode": "highlight_categorize", "media_context": {"type": "text_passage", "categories": ["Static (Still)", "Dynamic (Moving)"]}, "scaffolding_config": {"hints": [{"trigger": "hover_text", "content": "Is the object moving or changing?"}]}, "evaluation_mode": "auto_match", "answer_schema": {"match_ratio": 0.9}, "rubric_criteria": null, "feedback_config": {"type": "annotated_text", "content": "Show how the combination creates a vivid scene."}}
{"code": "transit_map_logic", "name": "生活闯关 (Non-continuous Text)", "description": "六年级实用阅读。阅读非连续性文本（如公交路牌、药品说明书、地图），提取关键信息解决生活实际问题（如规划路线）。", "subject": "Chinese", "grade_band": "High", "competency_dimension": ["Functional Literacy", "Problem Solving"], "interaction_mode": "hotspot_click", "media_context": {"type": "complex_image", "src": "bus_schedule_map", "zoom": true}, "scaffolding_config": {"guiding_questions": ["Where are you starting?", "What is the destination?"], "hints": [{"trigger": "wrong_bus", "content": "Check the arrow direction. Is this bus going North?"}]}, "evaluation_mode": "auto_match", "answer_schema": {"path": "correct_sequence"}, "rubric_criteria": null, "feedback_config": {"type": "simulation_result", "content": "You arrived at the museum / You are lost."}}
{"code": "opinion_evidence_map", "name": "观点站队 (Argumentation Logic)", "description": "六年级口语与习作。区分“观点”与“事例”，学习用具体事例支持观点。针对辩题（如“科技利弊”）进行论据分类或逻辑构建。", "subject": "Chinese", "grade_band": "High", "competency_dimension": ["Critical Thinking", "Logic"], "interaction_mode": "drag_to_zone", "media_context": {"type": "split_zone", "zones": ["Support Pro", "Support Con"]}, "scaffolding_config": {"hints": [{"trigger": "misplacement", "content": "Does this fact help the Pro side or the Con side?"}]}, "evaluation_mode": "auto_match", "answer_schema": {"grouping": "correct"}, "rubric_criteria": null, "feedback_config": {"type": "logic_chain", "content": "Display the full logical argument structure."}}
{"code": "psychological_depth_chart", "name": "情感温度计 (Emotional Analysis)", "description": "六年级深度阅读。体会文中人物复杂的内心世界（如《穷人》中桑娜的忐忑）。通过拖动滑块或图表标记人物在不同情节处的情感强度。", "subject": "Chinese", "grade_band": "High", "competency_dimension": ["Empathy", "Literary Analysis"], "interaction_mode": "curve_drawing", "media_context": {"type": "text_with_timeline", "axis": ["Calm", "Anxious"]}, "scaffolding_config": {"prompts": ["How did she feel here?", "Find the keyword 'pounding heart'."]}, "evaluation_mode": "ai_analysis", "answer_schema": {"curve_similarity": 0.8}, "rubric_criteria": null, "feedback_config": {"type": "overlay_expert_curve", "content": "Compare user curve with expert analysis."}}
{"code": "art_synesthesia_match", "name": "艺文通感 (Art Synesthesia)", "description": "六年级审美提升。结合《伯牙鼓琴》、《月光曲》等课文，进行音乐、画面与文字的通感联结训练（如听音乐选匹配的画面或诗句）。", "subject": "Chinese", "grade_band": "High", "competency_dimension": ["Aesthetic Appreciation", "Synesthesia"], "interaction_mode": "media_match", "media_context": {"type": "audio_image_text_mix", "audio": "classical_music", "images": "paintings"}, "scaffolding_config": {"hints": [{"trigger": "wrong_match", "content": "The music is fast and stormy. Which picture looks stormy?"}]}, "evaluation_mode": "auto_match", "answer_schema": {"match_type": "vibe_check"}, "rubric_criteria": null, "feedback_config": {"type": "interpretive_text", "content": "Explain the artistic connection (e.g., 'High mountains and flowing water')."}}

```

## English Question Types

Here is the jsonl formatted data for Primary School English question types, structured according to the optimized data model.
These designs integrate the "Teaching Suggestions" from the provided Teacher's Guides (Grades 1–6), focusing on converting physical classroom activities (TPR, role-play) into digital interactions (Duolingo-style matching, drag-and-drop, audio tasks).

```json
{"code": "eng_tpr_digital_match", "name": "听音触屏 (Digital TPR)", "description": "Designed to adapt the 'Listen and Do' (TPR) activities found in Grade 1/2 textbooks. Instead of physical movement, students tap the correct character action or body part on screen in response to audio commands (e.g., 'Touch your nose', 'Open your book').", "subject": "English", "grade_band": "Low", "competency_dimension": ["Listening", "Vocabulary"], "interaction_mode": "hotspot_click", "media_context": {"type": "character_animation", "audio_src": "command_imperative", "image_style": "cartoon_avatar"}, "scaffolding_config": {"hints": [{"trigger": "wrong_click", "content": "The nose is on the face, not the ear."}]}, "evaluation_mode": "auto_match", "answer_schema": {"match_type": "region_id"}, "rubric_criteria": null, "feedback_config": {"type": "animation_reaction", "content": "Character nods or shakes head based on correctness."}}
{"code": "eng_phonics_block_build", "name": "拼词积木 (Phonics Building)", "description": "Based on Grade 3+ 'Let's Spell' sections. Students drag phoneme blocks (e.g., 'sh', 'ir', 't') rather than single letters to build words, reinforcing letter combination sounds (digraphs/blends) highlighted in the curriculum.", "subject": "English", "grade_band": "Mid", "competency_dimension": ["Phonics", "Spelling"], "interaction_mode": "drag_and_drop", "media_context": {"type": "audio_visual_blocks", "audio": "word_pronunciation"}, "scaffolding_config": {"hints": [{"trigger": "idle_5s", "content": "Highlight the 'ir' block for the /ɜː/ sound."}]}, "evaluation_mode": "auto_match", "answer_schema": {"sequence": "ordered_blocks"}, "rubric_criteria": null, "feedback_config": {"type": "audio_blending", "content": "Play individual sounds then blended word: /sh/-/ir/-/t/ -> Shirt."}}
{"code": "eng_vocab_image_select", "name": "单词对对碰 (Visual Vocabulary)", "description": "Core vocabulary practice for Grades 1-2. Replaces translation with direct image-sound mapping. Students hear a word (e.g., 'schoolbag') and select the matching image from 3-4 options, establishing meaning without Chinese mediation.", "subject": "English", "grade_band": "Low", "competency_dimension": ["Vocabulary", "Listening"], "interaction_mode": "choice_image", "media_context": {"type": "audio_image_grid", "audio": "noun_isolated"}, "scaffolding_config": {"hints": [{"trigger": "wrong_attempt_1", "content": "Dim incorrect options."}]}, "evaluation_mode": "auto_match", "answer_schema": {"correct_option": "image_id"}, "rubric_criteria": null, "feedback_config": {"type": "immediate", "content": "Show word spelling overlay on the image."}}
{"code": "eng_sentence_unscramble", "name": "句子排序 (Sentence Scramble)", "description": "Adapts Grade 3-4 syntactic awareness tasks. Students drag jumbled words to form correct sentences (e.g., 'I / like / apples'). visualizes the Subject-Verb-Object structure emphasized in early writing.", "subject": "English", "grade_band": "Mid", "competency_dimension": ["Grammar", "Writing"], "interaction_mode": "sort_list_horizontal", "media_context": {"type": "text_blocks", "audio": "optional_sentence_read"}, "scaffolding_config": {"constraints": ["capitalize_first_word"], "hints": [{"trigger": "grammar_error", "content": "Remember, the action (verb) comes after 'I'."}]}, "evaluation_mode": "auto_match", "answer_schema": {"sequence": "exact_match"}, "rubric_criteria": null, "feedback_config": {"type": "visual_correction", "content": "Highlight the swapped words."}}
{"code": "eng_social_response_match", "name": "对话接龙 (Conversational Response)", "description": "Focuses on Grade 2-4 functional communication (e.g., 'How are you?' -> 'I am fine'). Students hear a prompt and drag the correct speech bubble response, filtering out pragmatically incorrect options.", "subject": "English", "grade_band": "Mid", "competency_dimension": ["Speaking", "Pragmatics"], "interaction_mode": "drag_to_target", "media_context": {"type": "dialogue_scene", "characters": ["A", "B"]}, "scaffolding_config": {"hints": [{"trigger": "wrong_tone", "content": "That sounds too rude. Try a polite answer."}]}, "evaluation_mode": "auto_match", "answer_schema": {"match_pair": "id"}, "rubric_criteria": null, "feedback_config": {"type": "role_play_playback", "content": "Play the full dialogue interaction."}}
{"code": "eng_functional_reading_scan", "name": "海报侦探 (Functional Scanning)", "description": "Grade 5-6 reading strategy. Students view non-continuous texts (posters, tickets, invitations) and must click/highlight specific details (Time, Place, Price) within a time limit to train 'Scanning' skills.", "subject": "English", "grade_band": "High", "competency_dimension": ["Reading Strategy", "Information Extraction"], "interaction_mode": "highlight_text", "media_context": {"type": "rich_image_text", "src": "poster_or_ticket"}, "scaffolding_config": {"guiding_questions": ["Where is the date?", "Find the price."], "timer": "visible"}, "evaluation_mode": "auto_match", "answer_schema": {"target_areas": ["coordinates"]}, "rubric_criteria": null, "feedback_config": {"type": "visual_highlight", "content": "Zoom in on the correct information section."}}
{"code": "eng_tense_timeline_sort", "name": "时光穿梭机 (Tense Sorting)", "description": "Grade 5-6 grammar focus. Students categorize sentences or verb forms into 'Past', 'Present', or 'Future' buckets, or drag sentence cards onto a timeline to visualize temporal relationships (e.g., 'went' vs 'go').", "subject": "English", "grade_band": "High", "competency_dimension": ["Grammar", "Logic"], "interaction_mode": "drag_to_zone", "media_context": {"type": "timeline_graphic", "zones": ["Yesterday", "Today", "Tomorrow"]}, "scaffolding_config": {"hints": [{"trigger": "hover_card", "content": "Look for keywords like 'yesterday' or 'now'."}]}, "evaluation_mode": "auto_match", "answer_schema": {"grouping": "correct_zone"}, "rubric_criteria": null, "feedback_config": {"type": "rule_explanation", "content": "'Went' is the past form of 'Go'."}}
{"code": "eng_mindmap_completion", "name": "脑图补全 (Mind Map)", "description": "Grade 5-6 writing preparation. Students read a text (e.g., describing a season or person) and drag keywords into a structured Mind Map (Main Idea -> Details) to organize thoughts before writing.", "subject": "English", "grade_band": "High", "competency_dimension": ["Reading Comprehension", "Writing Structure"], "interaction_mode": "drag_and_drop", "media_context": {"type": "diagram_tree", "nodes": "empty_slots"}, "scaffolding_config": {"hints": [{"trigger": "wrong_node", "content": "Is this a main topic or a detail?"}]}, "evaluation_mode": "auto_match", "answer_schema": {"node_placement": "exact"}, "rubric_criteria": null, "feedback_config": {"type": "completed_diagram", "content": "Show the full logical structure."}}
{"code": "eng_story_sequence_arrange", "name": "故事导演 (Story Sequencing)", "description": "Grade 4-6 narrative understanding. Students listen to a story or read a short text, then rearrange 4-5 scrambled images or sentence strips to match the chronological order.", "subject": "English", "grade_band": "Mid", "competency_dimension": ["Reading", "Sequencing"], "interaction_mode": "sort_list_horizontal", "media_context": {"type": "comic_strip", "scrambled": true}, "scaffolding_config": {"hints": [{"trigger": "wrong_first", "content": "What happened at the beginning?"}]}, "evaluation_mode": "auto_match", "answer_schema": {"order": "1-2-3-4"}, "rubric_criteria": null, "feedback_config": {"type": "animation_playback", "content": "Play the story animation in correct order."}}
{"code": "eng_cultural_contrast_select", "name": "文化连连看 (Cultural Awareness)", "description": "Grade 6 cultural objective. Students match cultural items or holidays to their respective countries (e.g., 'Dumplings' -> 'China', 'Turkey' -> 'USA'), supporting the curriculum's cross-cultural understanding goals.", "subject": "English", "grade_band": "High", "competency_dimension": ["Culture", "General Knowledge"], "interaction_mode": "connect_lines", "media_context": {"type": "image_columns", "left": "Items", "right": "Flags/Maps"}, "scaffolding_config": {"hints": [{"trigger": "wrong_match", "content": "This food is eaten at Thanksgiving."}]}, "evaluation_mode": "auto_match", "answer_schema": {"pairs": "defined"}, "rubric_criteria": null, "feedback_config": {"type": "fact_card", "content": "Display a 'Did You Know?' fact card about the culture."}}
{"code": "eng_audio_spelling_input", "name": "听音拼写 (Dictation)", "description": "Grade 4+ orthography. Students hear a word and must type it out. Unlike simple recognition, this tests recall and spelling rules. Includes 'keyboard' scaffolding (limiting available letters) for lower levels.", "subject": "English", "grade_band": "Mid", "competency_dimension": ["Spelling", "Listening"], "interaction_mode": "text_input", "media_context": {"type": "audio_only", "keyboard": "limited_or_full"}, "scaffolding_config": {"hints": [{"trigger": "typo", "content": "Remember the silent 'e' at the end."}]}, "evaluation_mode": "auto_match", "answer_schema": {"text_match": "case_insensitive"}, "rubric_criteria": null, "feedback_config": {"type": "visual_correction", "content": "Highlight correct vs incorrect letters."}}
```

## Math Question Types

Based on the optimized data structure and the Ministry of Education's Math Teacher's Guides (Grades 1-6), here is the **JSONL** configuration for the mathematics module.
These designs focus on **"gamification of abstract concepts"** (Duolingo style) and **"visual operation"** (manipulatives), transforming traditional paper exercises into interactive mobile experiences.

```json
{"code": "math_num_bubble_count", "name": "点泡泡 (Count & Cardinality)", "description": "Designed for Grade 1 'Preparation' and '1-5 Recognition'. Replaces abstract counting with dynamic interaction. Students tap floating bubbles to count specific quantities, reinforcing one-to-one correspondence.", "subject": "Math", "grade_band": "Low", "competency_dimension": ["Number Sense", "Counting"], "interaction_mode": "tap_count", "media_context": {"type": "dynamic_canvas", "objects": "floating_bubbles", "audio_feedback": "count_voice"}, "scaffolding_config": {"hints": [{"trigger": "missed_object", "content": "Visual ripple on uncounted objects."}]}, "evaluation_mode": "auto_match", "answer_schema": {"target_count": "exact_match"}, "rubric_criteria": null, "feedback_config": {"type": "immediate_audio", "content": "Play '1, 2, 3...' audio as user taps."}}
{"code": "math_make_ten_drag", "name": "凑十魔法 (Make Ten Strategy)", "description": "Core Grade 1 calculation strategy (Source). Visualizes 9+4 by letting students drag 1 item from the '4' group to the '9' group to fill a 'Ten-Frame', transforming the problem into 10+3.", "subject": "Math", "grade_band": "Low", "competency_dimension": ["Calculation", "Logic"], "interaction_mode": "drag_to_fill", "media_context": {"type": "ten_frame_grid", "items": "apples_or_stars"}, "scaffolding_config": {"hints": [{"trigger": "idle_5s", "content": "Drag one apple to fill the box of 10."}]}, "evaluation_mode": "auto_match", "answer_schema": {"state_check": "box_full"}, "rubric_criteria": null, "feedback_config": {"type": "animation_transform", "content": "Equation morphs from 9+4 to 10+3."}}
{"code": "math_shape_sorter_belt", "name": "图形传送门 (Shape Sorting)", "description": "Grade 1 Geometry (Source). A conveyor belt game where students drag everyday objects (cans, balls, boxes) into 'Cylinder', 'Sphere', or 'Cube' bins to build spatial intuition.", "subject": "Math", "grade_band": "Low", "competency_dimension": ["Geometry", "Spatial Sense"], "interaction_mode": "drag_sort_stream", "media_context": {"type": "animation_stream", "items": "3d_objects_real_world"}, "scaffolding_config": {"hints": [{"trigger": "wrong_bin", "content": "Does this roll like a ball or slide like a box?"}]}, "evaluation_mode": "auto_match", "answer_schema": {"classification": "correct_bin"}, "rubric_criteria": null, "feedback_config": {"type": "visual_highlight", "content": "Highlight the flat or curved surface of the object."}}
{"code": "math_angle_alligator", "name": "张口大比拼 (Angle Recognition)", "description": "Grade 2 'Preliminary Recognition of Angles' (Source). Students slide an alligator's mouth open/closed to match a specific angle (Acute, Right, Obtuse), connecting angle size to the 'spread of sides' rather than side length.", "subject": "Math", "grade_band": "Low", "competency_dimension": ["Geometry", "Measurement"], "interaction_mode": "slider_adjust", "media_context": {"type": "character_morph", "character": "alligator_jaw"}, "scaffolding_config": {"features": ["vertex_anchor"], "hints": [{"trigger": "near_miss", "content": "Open it a bit wider to make a Right Angle."}]}, "evaluation_mode": "auto_match", "answer_schema": {"angle_tolerance": 5}, "rubric_criteria": null, "feedback_config": {"type": "visual_overlay", "content": "Overlay a standard set square to check."}}
{"code": "math_multiplication_array", "name": "连加变身 (Multiplication Array)", "description": "Grade 2 Multiplication (Source). Students select rows/columns in a dot matrix to visualize '5x3' as '3 rows of 5'. Bridges the gap between repeated addition and multiplication.", "subject": "Math", "grade_band": "Low", "competency_dimension": ["Operation Sense", "Algebraic Thinking"], "interaction_mode": "grid_select", "media_context": {"type": "dot_matrix", "rows": 10, "cols": 10}, "scaffolding_config": {"hints": [{"trigger": "wrong_selection", "content": "Show grouping animation (circle groups of 5)."}]}, "evaluation_mode": "auto_match", "answer_schema": {"selected_area": "rows_x_cols"}, "rubric_criteria": null, "feedback_config": {"type": "text_equation", "content": "Display '5 + 5 + 5 = 15' and '5 x 3 = 15'."}}
{"code": "math_fraction_pizza_slice", "name": "披萨切切乐 (Fraction Visualization)", "description": "Grade 3 'Preliminary Recognition of Fractions' (Source). Students slice a circle or fold a rectangle into equal parts (1/2, 1/4, 1/8) to understand that larger denominators mean smaller parts.", "subject": "Math", "grade_band": "Mid", "competency_dimension": ["Number Sense", "Fractions"], "interaction_mode": "gesture_cut", "media_context": {"type": "interactive_shape", "shape": "circle_pizza"}, "scaffolding_config": {"constraints": ["equal_parts_check"], "hints": [{"trigger": "unequal_cut", "content": "Parts must be the same size to be fractions."}]}, "evaluation_mode": "auto_match", "answer_schema": {"parts_count": "target", "equality": true}, "rubric_criteria": null, "feedback_config": {"type": "visual_comparison", "content": "Compare 1/2 slice with 1/4 slice side-by-side."}}
{"code": "math_compass_navigation", "name": "小小导航员 (Directions & Map)", "description": "Grade 3 'Position and Direction' (Source). A maze or city map game where students guide a character using compass directions (North, NE, SW) based on audio instructions.", "subject": "Math", "grade_band": "Mid", "competency_dimension": ["Spatial Sense", "Problem Solving"], "interaction_mode": "dpad_move", "media_context": {"type": "map_grid", "compass_rose": "visible"}, "scaffolding_config": {"hints": [{"trigger": "wrong_turn", "content": "North is always up on this map."}]}, "evaluation_mode": "auto_match", "answer_schema": {"path_correctness": true}, "rubric_criteria": null, "feedback_config": {"type": "path_trace", "content": "Show the correct path vs. taken path."}}
{"code": "math_area_transform_cut", "name": "图形变身 (Area Derivation)", "description": "Grade 5 'Area of Polygons' (Source). Uses the 'Cut and Paste' method (geometric dissection). Students drag a virtual scissors to cut a parallelogram and move the piece to form a rectangle, deriving the formula Area = Base x Height.", "subject": "Math", "grade_band": "High", "competency_dimension": ["Geometry", "Logical Reasoning"], "interaction_mode": "cut_drag_snap", "media_context": {"type": "geometry_canvas", "tools": ["scissors", "glue"]}, "scaffolding_config": {"hints": [{"trigger": "stuck", "content": "Cut along the height line."}]}, "evaluation_mode": "auto_match", "answer_schema": {"final_shape": "rectangle"}, "rubric_criteria": null, "feedback_config": {"type": "formula_reveal", "content": "Animation shows Base -> Length, Height -> Width."}}
{"code": "math_equation_balance", "name": "天平平衡 (Equations)", "description": "Grade 5 'Simple Equations' (Source). Students solve for 'x' by dragging weights off a balance scale. Removing weight from one side requires removing the same from the other, visualizing the properties of equality.", "subject": "Math", "grade_band": "High", "competency_dimension": ["Algebra", "Logic"], "interaction_mode": "balance_scale_manipulate", "media_context": {"type": "physics_sim", "left_pan": "x_box", "right_pan": "weights"}, "scaffolding_config": {"constraints": ["maintain_balance"], "hints": [{"trigger": "imbalance", "content": "Whatever you do to the left, you must do to the right."}]}, "evaluation_mode": "auto_match", "answer_schema": {"x_value": "solved"}, "rubric_criteria": null, "feedback_config": {"type": "visual_balance", "content": "Scale tips if operation is unbalanced."}}
{"code": "math_circle_roll_pi", "name": "滚轮胎 (Circumference & Pi)", "description": "Grade 6 'Circle' (Source). Simulation where students roll a wheel of diameter 'd' along a ruler. It unrolls exactly 3.14 times, visually defining Pi. Students predict the distance before rolling.", "subject": "Math", "grade_band": "High", "competency_dimension": ["Geometry", "Measurement"], "interaction_mode": "drag_slide", "media_context": {"type": "physics_sim", "object": "wheel_ruler"}, "scaffolding_config": {"hints": [{"trigger": "prediction_far_off", "content": "It's a bit more than 3 times the diameter."}]}, "evaluation_mode": "auto_match", "answer_schema": {"prediction_accuracy": "range"}, "rubric_criteria": null, "feedback_config": {"type": "data_overlay", "content": "Show C = πd formula overlay on the unrolled line."}}
{"code": "math_volume_pour", "name": "倒水实验 (Volume Ratio)", "description": "Grade 6 'Cylinder and Cone' (Source). Virtual lab where students pour water from a cone into a cylinder of equal base and height. They must do it 3 times to fill the cylinder, proving V_cone = 1/3 V_cylinder.", "subject": "Math", "grade_band": "High", "competency_dimension": ["Geometry", "Inquiry"], "interaction_mode": "tilt_pour", "media_context": {"type": "3d_containers", "liquid": "water"}, "scaffolding_config": {"step_by_step": true, "hints": [{"trigger": "after_first_pour", "content": "The cylinder is not full yet. Keep going."}]}, "evaluation_mode": "auto_match", "answer_schema": {"pour_count": 3}, "rubric_criteria": null, "feedback_config": {"type": "concept_summary", "content": "The cone's volume is exactly 1/3 of the cylinder."}}
{"code": "math_logic_detective", "name": "侦探解谜 (Logic & Optimization)", "description": "Based on 'Math Corner' (e.g., Finding the defect, Source). Students use a balance scale to find a lighter/heavier ball among normal ones with minimum weighings. Visualizes optimization strategies.", "subject": "Math", "grade_band": "High", "competency_dimension": ["Logic", "Critical Thinking"], "interaction_mode": "strategy_game", "media_context": {"type": "balance_scale_discrete", "items": "balls"}, "scaffolding_config": {"hints": [{"trigger": "inefficient_move", "content": "Try splitting them into 3 groups."}]}, "evaluation_mode": "auto_match", "answer_schema": {"steps": "minimized"}, "rubric_criteria": null, "feedback_config": {"type": "tree_diagram", "content": "Show the decision tree for the optimal strategy."}}
```

