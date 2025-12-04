import 'package:flutter/material.dart';

/// 滑动动画方向
enum SlideDirection {
  fromLeft,
  fromRight,
  fromTop,
  fromBottom,
}

/// 滑动动画组件
class SlideAnimation extends StatefulWidget {
  final Widget child;
  final Duration duration;
  final Curve curve;
  final SlideDirection direction;

  const SlideAnimation({
    super.key,
    required this.child,
    this.duration = const Duration(milliseconds: 300),
    this.curve = Curves.easeOut,
    this.direction = SlideDirection.fromBottom,
  });

  @override
  State<SlideAnimation> createState() => _SlideAnimationState();
}

class _SlideAnimationState extends State<SlideAnimation>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<Offset> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: widget.duration,
    );

    Offset begin;
    switch (widget.direction) {
      case SlideDirection.fromLeft:
        begin = const Offset(-1, 0);
        break;
      case SlideDirection.fromRight:
        begin = const Offset(1, 0);
        break;
      case SlideDirection.fromTop:
        begin = const Offset(0, -1);
        break;
      case SlideDirection.fromBottom:
        begin = const Offset(0, 1);
        break;
    }

    _animation = Tween<Offset>(
      begin: begin,
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: widget.curve,
    ));

    _controller.forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SlideTransition(
      position: _animation,
      child: widget.child,
    );
  }
}

