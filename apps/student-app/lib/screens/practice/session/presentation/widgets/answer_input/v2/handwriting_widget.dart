import 'package:flutter/material.dart';
import 'package:student_app/core/models/question_v2.dart';
import 'package:student_app/core/theme/app_colors.dart';

class HandwritingWidget extends StatefulWidget {
  final QuestionV2 question;
  final dynamic value; // Format: String (e.g., base64 or path, for now we manage internal points)
  final bool disabled;
  final ValueChanged<String> onChanged;

  const HandwritingWidget({
    super.key,
    required this.question,
    this.value,
    this.disabled = false,
    required this.onChanged,
  });

  @override
  State<HandwritingWidget> createState() => _HandwritingWidgetState();
}

class _HandwritingWidgetState extends State<HandwritingWidget> {
  final List<List<Offset>> _strokes = [];
  double _brushWidth = 3.0;
  Color _brushColor = AppColors.textPrimary;

  @override
  void initState() {
    super.initState();
    // In a real app, we might restore from a base64 or path
    // For this demonstration, we'll maintain the strokes list
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Controls
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                _buildColorButton(AppColors.textPrimary),
                _buildColorButton(AppColors.primary),
                _buildColorButton(AppColors.error),
                const SizedBox(width: 8),
                DropdownButton<double>(
                  value: _brushWidth,
                  items: [2.0, 3.0, 5.0, 8.0].map((w) => DropdownMenuItem(value: w, child: Text('${w.toInt()}px'))).toList(),
                  onChanged: widget.disabled ? null : (v) => setState(() => _brushWidth = v!),
                ),
              ],
            ),
            Row(
              children: [
                IconButton(
                  icon: const Icon(Icons.undo),
                  onPressed: widget.disabled || _strokes.isEmpty ? null : _undo,
                ),
                IconButton(
                  icon: const Icon(Icons.delete_outline),
                  onPressed: widget.disabled || _strokes.isEmpty ? null : _clear,
                ),
              ],
            ),
          ],
        ),
        const SizedBox(height: 8),
        
        // Canvas
        Container(
          height: 300,
          width: double.infinity,
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.border),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.05),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(16),
            child: GestureDetector(
              onPanStart: widget.disabled ? null : _onPanStart,
              onPanUpdate: widget.disabled ? null : _onPanUpdate,
              onPanEnd: widget.disabled ? null : _onPanEnd,
              child: CustomPaint(
                painter: HandwritingPainter(
                  strokes: _strokes,
                  brushColor: _brushColor,
                  brushWidth: _brushWidth,
                ),
                size: Size.infinite,
              ),
            ),
          ),
        ),
        const SizedBox(height: 12),
        const Text(
          '请在上方区域手写您的答案',
          style: TextStyle(color: AppColors.textSecondary, fontSize: 12),
        ),
      ],
    );
  }

  Widget _buildColorButton(Color color) {
    final isSelected = _brushColor == color;
    return GestureDetector(
      onTap: widget.disabled ? null : () => setState(() => _brushColor = color),
      child: Container(
        margin: const EdgeInsets.only(right: 8),
        padding: const EdgeInsets.all(2),
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          border: Border.all(color: isSelected ? AppColors.primary : Colors.transparent, width: 2),
        ),
        child: Container(
          width: 20,
          height: 20,
          decoration: BoxDecoration(color: color, shape: BoxShape.circle),
        ),
      ),
    );
  }

  void _onPanStart(DragStartDetails details) {
    setState(() {
      _strokes.add([details.localPosition]);
    });
  }

  void _onPanUpdate(DragUpdateDetails details) {
    setState(() {
      _strokes.last.add(details.localPosition);
    });
  }

  void _onPanEnd(DragEndDetails details) {
    // In a real app, generate a base64 image or similar and call widget.onChanged
    // For now, we just update the internal state
    widget.onChanged('handwriting_data_synced');
  }

  void _undo() {
    setState(() {
      _strokes.removeLast();
    });
    widget.onChanged('handwriting_data_synced');
  }

  void _clear() {
    setState(() {
      _strokes.clear();
    });
    widget.onChanged('');
  }
}

class HandwritingPainter extends CustomPainter {
  final List<List<Offset>> strokes;
  final Color brushColor;
  final double brushWidth;

  HandwritingPainter({
    required this.strokes,
    required this.brushColor,
    required this.brushWidth,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = brushColor
      ..strokeWidth = brushWidth
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round
      ..style = PaintingStyle.stroke;

    for (final stroke in strokes) {
      if (stroke.isEmpty) continue;
      final path = Path()..moveTo(stroke.first.dx, stroke.first.dy);
      for (int i = 1; i < stroke.length; i++) {
        path.lineTo(stroke[i].dx, stroke[i].dy);
      }
      canvas.drawPath(path, paint);
    }
  }

  @override
  bool shouldRepaint(covariant HandwritingPainter oldDelegate) {
    return true; // Simple implementation
  }
}
