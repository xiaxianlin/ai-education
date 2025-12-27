import 'package:flutter/material.dart';
import 'package:student_app/core/models/question_v2.dart';
import 'package:student_app/core/theme/app_colors.dart';

class ConnectLineWidget extends StatefulWidget {
  final QuestionV2 question;
  final dynamic value; // Format: List<Map<String, String>> [{from: id, to: id}]
  final bool disabled;
  final ValueChanged<List<Map<String, String>>> onChanged;

  const ConnectLineWidget({
    super.key,
    required this.question,
    this.value,
    this.disabled = false,
    required this.onChanged,
  });

  @override
  State<ConnectLineWidget> createState() => _ConnectLineWidgetState();
}

class _ConnectLineWidgetState extends State<ConnectLineWidget> {
  String? _selectedLeftId;
  late List<Map<String, String>> _internalConnections;
  final Map<String, GlobalKey> _leftKeys = {};
  final Map<String, GlobalKey> _rightKeys = {};

  @override
  void initState() {
    super.initState();
    _internalConnections = widget.value != null 
        ? List<Map<String, String>>.from((widget.value as List).map((e) => Map<String, String>.from(e))) 
        : [];
  }

  @override
  void didUpdateWidget(ConnectLineWidget oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.value != oldWidget.value) {
      _internalConnections = widget.value != null 
          ? List<Map<String, String>>.from((widget.value as List).map((e) => Map<String, String>.from(e))) 
          : [];
    }
  }

  List<dynamic> get _leftColumn {
    final config = widget.question.stem.interactionConfig;
    return config?['left_column'] ?? [];
  }

  List<dynamic> get _rightColumn {
    final config = widget.question.stem.interactionConfig;
    return config?['right_column'] ?? [];
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        // The lines painter
        Positioned.fill(
          child: CustomPaint(
            painter: ConnectionPainter(
              connections: _internalConnections,
              leftKeys: _leftKeys,
              rightKeys: _rightKeys,
            ),
          ),
        ),
        
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            // Left Column
            Expanded(
              child: Column(
                children: _leftColumn.map((item) {
                  final id = item['id'].toString();
                  _leftKeys.putIfAbsent(id, () => GlobalKey());
                  final isSelected = _selectedLeftId == id;
                  final isConnected = _internalConnections.any((c) => c['from'] == id);

                  return Padding(
                    key: _leftKeys[id],
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    child: GestureDetector(
                      onTap: widget.disabled ? null : () => _handleLeftTap(id),
                      child: Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: isSelected ? AppColors.primary.withValues(alpha: 0.1) : Colors.white,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: isSelected ? AppColors.primary : (isConnected ? AppColors.primary.withValues(alpha: 0.5) : AppColors.border),
                            width: isSelected ? 2 : 1,
                          ),
                        ),
                        child: Text(item['content'].toString(), textAlign: TextAlign.center),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),
            
            const SizedBox(width: 60), // Space for lines
            
            // Right Column
            Expanded(
              child: Column(
                children: _rightColumn.map((item) {
                  final id = item['id'].toString();
                  _rightKeys.putIfAbsent(id, () => GlobalKey());
                  final isConnected = _internalConnections.any((c) => c['to'] == id);

                  return Padding(
                    key: _rightKeys[id],
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    child: GestureDetector(
                      onTap: widget.disabled ? null : () => _handleRightTap(id),
                      child: Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: isConnected ? AppColors.primary.withValues(alpha: 0.05) : Colors.white,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: isConnected ? AppColors.primary.withValues(alpha: 0.5) : AppColors.border,
                          ),
                        ),
                        child: Text(item['content'].toString(), textAlign: TextAlign.center),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),
          ],
        ),
      ],
    );
  }

  void _handleLeftTap(String id) {
    setState(() {
      if (_selectedLeftId == id) {
        _selectedLeftId = null;
      } else {
        _selectedLeftId = id;
      }
    });
  }

  void _handleRightTap(String id) {
    if (_selectedLeftId != null) {
      setState(() {
        // Remove existing connections from this left or to this right (one-to-one)
        _internalConnections.removeWhere((c) => c['from'] == _selectedLeftId || c['to'] == id);
        
        _internalConnections.add({'from': _selectedLeftId!, 'to': id});
        _selectedLeftId = null;
        widget.onChanged(_internalConnections);
      });
    } else {
        // Find and remove connection if tapped on a connected right item
        setState(() {
            _internalConnections.removeWhere((c) => c['to'] == id);
            widget.onChanged(_internalConnections);
        });
    }
  }
}

class ConnectionPainter extends CustomPainter {
  final List<Map<String, String>> connections;
  final Map<String, GlobalKey> leftKeys;
  final Map<String, GlobalKey> rightKeys;

  ConnectionPainter({
    required this.connections,
    required this.leftKeys,
    required this.rightKeys,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = AppColors.primary
      ..strokeWidth = 2.0
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    for (final conn in connections) {
      final fromKey = leftKeys[conn['from']];
      final toKey = rightKeys[conn['to']];

      if (fromKey != null && toKey != null) {
        final RenderBox? fromBox = fromKey.currentContext?.findRenderObject() as RenderBox?;
        final RenderBox? toBox = toKey.currentContext?.findRenderObject() as RenderBox?;
        final RenderBox? rootBox = fromKey.currentContext?.findAncestorRenderObjectOfType<RenderBox>();

        if (fromBox != null && toBox != null && rootBox != null) {
          final fromPos = fromBox.localToGlobal(Offset(fromBox.size.width, fromBox.size.height / 2), ancestor: rootBox);
          final toPos = toBox.localToGlobal(Offset(0, toBox.size.height / 2), ancestor: rootBox);

          final path = Path()
            ..moveTo(fromPos.dx, fromPos.dy)
            ..cubicTo(
              fromPos.dx + 30, fromPos.dy,
              toPos.dx - 30, toPos.dy,
              toPos.dx, toPos.dy,
            );
          
          canvas.drawPath(path, paint);
          
          // Draw endpoints
          canvas.drawCircle(fromPos, 4, paint..style = PaintingStyle.fill);
          canvas.drawCircle(toPos, 4, paint..style = PaintingStyle.fill);
          paint.style = PaintingStyle.stroke; // reset for next line
        }
      }
    }
  }

  @override
  bool shouldRepaint(covariant ConnectionPainter oldDelegate) {
    return oldDelegate.connections != connections;
  }
}
